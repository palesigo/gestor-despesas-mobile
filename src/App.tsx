import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { AppSettings, MobileExpense } from "./types";
import {
  getPendingExpenses,
  getSettings,
  getVisibleExpenses,
  markExported,
  saveSettings,
  softDeleteExpense,
  upsertExpense
} from "./lib/db";
import {
  currentMonthKey,
  datePt,
  monthKey,
  monthLabel,
  money,
  todayIso
} from "./lib/format";
import { shareOrDownloadExport } from "./lib/export";
import { validateMobileConfig } from "./lib/validation";
import { defaultConfig } from "./data/defaultConfig";

type Form = {
  valor: string;
  data: string;
  grupo: string;
  subgrupo: string;
  categoria: string;
  pagoPor: string;
  nota: string;
};

const initialSettings: AppSettings = {
  deviceId: crypto.randomUUID(),
  perfilAtivo: defaultConfig.pessoas[0],
  config: defaultConfig
};

function blankForm(settings: AppSettings): Form {
  const firstGroup = settings.config.grupos[0];
  const firstOption = firstGroup?.opcoes[0];

  return {
    valor: "",
    data: todayIso(),
    grupo: firstGroup?.nome ?? "",
    subgrupo: firstOption?.subgrupo ?? "",
    categoria: firstOption?.categoria ?? "",
    pagoPor: settings.perfilAtivo,
    nota: ""
  };
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [rows, setRows] = useState<MobileExpense[]>([]);
  const [pending, setPending] = useState(0);
  const [month, setMonth] = useState(currentMonthKey());
  const [form, setForm] = useState<Form>(() => blankForm(initialSettings));
  const [editing, setEditing] = useState<MobileExpense | null>(null);
  const [message, setMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const configInput = useRef<HTMLInputElement>(null);

  async function refresh() {
    const [visibleExpenses, pendingExpenses] = await Promise.all([
      getVisibleExpenses(),
      getPendingExpenses()
    ]);

    setRows(visibleExpenses);
    setPending(pendingExpenses.length);
  }

  useEffect(() => {
    void (async () => {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
      setForm(blankForm(savedSettings));
      await refresh();
    })();
  }, []);

  const selectedGroup = useMemo(
    () => settings.config.grupos.find((group) => group.nome === form.grupo),
    [form.grupo, settings.config.grupos]
  );

  const monthRows = useMemo(
    () => rows.filter((expense) => monthKey(expense.data) === month),
    [month, rows]
  );

  const total = useMemo(
    () => monthRows.reduce((sum, expense) => sum + expense.valor, 0),
    [monthRows]
  );

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();

    for (const expense of monthRows) {
      totals.set(
        expense.categoria,
        (totals.get(expense.categoria) ?? 0) + expense.valor
      );
    }

    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }, [monthRows]);

  const months = useMemo(
    () =>
      [...new Set([currentMonthKey(), ...rows.map((expense) => monthKey(expense.data))])]
        .sort()
        .reverse(),
    [rows]
  );

  function updateForm(patch: Partial<Form>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function selectGroup(grupo: string) {
    const group = settings.config.grupos.find((item) => item.nome === grupo);
    const firstOption = group?.opcoes[0];

    updateForm({
      grupo,
      subgrupo: firstOption?.subgrupo ?? "",
      categoria: firstOption?.categoria ?? ""
    });
  }

  function selectSubgroup(subgrupo: string) {
    const option = selectedGroup?.opcoes.find(
      (item) => item.subgrupo === subgrupo
    );

    updateForm({
      subgrupo,
      categoria: option?.categoria ?? form.categoria
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const valor = Number(form.valor.replace(",", "."));

    if (!Number.isFinite(valor) || valor <= 0) {
      setMessage("Indica um valor superior a zero.");
      return;
    }

    const now = new Date().toISOString();

    await upsertExpense({
      id: editing?.id ?? crypto.randomUUID(),
      deviceId: settings.deviceId,
      tipo: "despesa",
      data: form.data,
      grupo: form.grupo,
      subgrupo: form.subgrupo,
      categoria: form.categoria,
      pagoPor: form.pagoPor,
      valor,
      nota: form.nota.trim(),
      createdAt: editing?.createdAt ?? now,
      updatedAt: now,
      exportedAt: undefined,
      deletedAt: undefined
    });

    setEditing(null);
    setForm(blankForm(settings));
    setMessage("Despesa guardada.");
    await refresh();
  }

  function editExpense(expense: MobileExpense) {
    setEditing(expense);
    setForm({
      valor: String(expense.valor),
      data: expense.data,
      grupo: expense.grupo,
      subgrupo: expense.subgrupo,
      categoria: expense.categoria,
      pagoPor: expense.pagoPor,
      nota: expense.nota
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeExpense(expense: MobileExpense) {
    if (!window.confirm(`Eliminar ${expense.subgrupo}?`)) return;

    await softDeleteExpense(expense.id);
    setMessage("Movimento eliminado.");

    if (editing?.id === expense.id) {
      setEditing(null);
      setForm(blankForm(settings));
    }

    await refresh();
  }

  async function exportData() {
    try {
      const pendingRecords = await getPendingExpenses();

      if (pendingRecords.length === 0) {
        setMessage("Não existem movimentos pendentes de exportação.");
        return;
      }

      const result = await shareOrDownloadExport(
        settings.perfilAtivo,
        settings.deviceId,
        pendingRecords
      );

      await markExported(
        pendingRecords.map((record) => record.id),
        result.exportedAt
      );

      setMessage(
        `${pendingRecords.length} registo(s) exportado(s): ${result.filename}`
      );

      await refresh();
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  async function changeProfile(perfilAtivo: string) {
    const nextSettings: AppSettings = { ...settings, perfilAtivo };
    await saveSettings(nextSettings);
    setSettings(nextSettings);
    setForm((current) => ({ ...current, pagoPor: perfilAtivo }));
  }

  async function importConfig(file: File) {
    try {
      const config = validateMobileConfig(JSON.parse(await file.text()));
      const profileExists = config.pessoas.includes(settings.perfilAtivo);

      const nextSettings: AppSettings = {
        ...settings,
        config,
        perfilAtivo: profileExists ? settings.perfilAtivo : config.pessoas[0]
      };

      await saveSettings(nextSettings);
      setSettings(nextSettings);
      setForm(blankForm(nextSettings));
      setMessage("Configuração importada.");
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  return (
    <main className="shell">
      <header>
        <div>
          <small>REGISTO FAMILIAR</small>
          <h1>Despesas</h1>
        </div>
        <b>👤 {settings.perfilAtivo}</b>
      </header>

      <div className="content">
        <section className="card">
          <div className="title">
            <div>
              <small>{editing ? "EDITAR" : "NOVO MOVIMENTO"}</small>
              <h2>{editing ? "Editar despesa" : "Registar despesa"}</h2>
            </div>

            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(blankForm(settings));
                }}
              >
                Cancelar
              </button>
            )}
          </div>

          <form onSubmit={submit}>
            <label className="value">
              Valor
              <div>
                <input
                  autoFocus
                  inputMode="decimal"
                  value={form.valor}
                  placeholder="0,00"
                  onChange={(event) => updateForm({ valor: event.target.value })}
                />
                <strong>€</strong>
              </div>
            </label>

            <div className="grid">
              <label>
                Grupo
                <select
                  value={form.grupo}
                  onChange={(event) => selectGroup(event.target.value)}
                >
                  {settings.config.grupos.map((group) => (
                    <option key={group.nome} value={group.nome}>
                      {group.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Subgrupo
                <select
                  value={form.subgrupo}
                  onChange={(event) => selectSubgroup(event.target.value)}
                >
                  {selectedGroup?.opcoes.map((option) => (
                    <option key={option.subgrupo} value={option.subgrupo}>
                      {option.subgrupo}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Categoria
                <input value={form.categoria} readOnly />
              </label>

              <label>
                Pago por
                <select
                  value={form.pagoPor}
                  onChange={(event) => updateForm({ pagoPor: event.target.value })}
                >
                  {settings.config.pessoas.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Data
                <input
                  type="date"
                  value={form.data}
                  onChange={(event) => updateForm({ data: event.target.value })}
                />
              </label>

              <label className="full">
                Nota (opcional)
                <input
                  value={form.nota}
                  placeholder="Ex.: Continente, Amazon..."
                  onChange={(event) => updateForm({ nota: event.target.value })}
                />
              </label>
            </div>

            <button className="primary submit" type="submit">
              {editing ? "Guardar alterações" : "Guardar despesa"}
            </button>
          </form>
        </section>

        <section>
          <div className="title">
            <div>
              <small>VISÃO MENSAL</small>
              <h2>Resumo</h2>
            </div>

            <select value={month} onChange={(event) => setMonth(event.target.value)}>
              {months.map((monthValue) => (
                <option key={monthValue} value={monthValue}>
                  {monthLabel(monthValue)}
                </option>
              ))}
            </select>
          </div>

          <div className="stats">
            <article>
              <span>Total gasto</span>
              <strong>{money(total)}</strong>
            </article>
            <article>
              <span>Despesas</span>
              <strong>{monthRows.length}</strong>
            </article>
            <article>
              <span>Categorias</span>
              <strong>{byCategory.length}</strong>
            </article>
          </div>

          <div className="card">
            <h3>Por categoria</h3>
            {byCategory.length === 0 ? (
              <p>Sem despesas neste mês.</p>
            ) : (
              byCategory.map(([category, amount]) => (
                <div className="cat" key={category}>
                  <div>
                    <span>{category}</span>
                    <b>{money(amount)}</b>
                  </div>
                  <i>
                    <em style={{ width: `${Math.max(2, (amount / total) * 100)}%` }} />
                  </i>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card">
          <div className="title">
            <div>
              <small>HISTÓRICO</small>
              <h2>Despesas do mês</h2>
            </div>
            <b>{monthRows.length}</b>
          </div>

          {monthRows.length === 0 ? (
            <p>Sem despesas neste mês.</p>
          ) : (
            monthRows.map((expense) => (
              <article className="item" key={expense.id}>
                <div>
                  <strong>{expense.subgrupo}</strong>
                  <p>{expense.grupo} · {expense.categoria}</p>
                  <small>
                    {datePt(expense.data)} · Pago por {expense.pagoPor}
                    {expense.nota ? ` · ${expense.nota}` : ""}
                  </small>
                </div>

                <div>
                  <strong>{money(expense.valor)}</strong>
                  <button type="button" onClick={() => editExpense(expense)}>
                    ✎
                  </button>
                  <button
                    className="delete"
                    type="button"
                    onClick={() => void removeExpense(expense)}
                  >
                    ×
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="card export">
          <div>
            <small>APLICAÇÃO CENTRAL</small>
            <h2>Exportar despesas</h2>
            <p>
              Inclui movimentos novos, editados ou eliminados desde a última exportação.
            </p>
          </div>

          <div>
            <b>{pending} pendente(s)</b>
            <button
              className="primary"
              type="button"
              disabled={pending === 0}
              onClick={() => void exportData()}
            >
              Partilhar / descarregar
            </button>
          </div>

          {message && <p className="message">{message}</p>}
        </section>

        <section className="settings">
          <button type="button" onClick={() => setShowSettings((value) => !value)}>
            ⚙ Definições
          </button>

          {showSettings && (
            <div className="card">
              <label>
                Perfil deste telemóvel
                <select
                  value={settings.perfilAtivo}
                  onChange={(event) => void changeProfile(event.target.value)}
                >
                  {settings.config.pessoas.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </label>

              <input
                ref={configInput}
                type="file"
                accept=".json"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void importConfig(file);
                  event.target.value = "";
                }}
              />

              <button type="button" onClick={() => configInput.current?.click()}>
                Importar configuração
              </button>

              <p>
                Versão {settings.config.version} · Ano ativo {settings.config.anoAtivo}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}       
