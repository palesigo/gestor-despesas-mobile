# Registo de Despesas — PWA

PWA local para registar despesas no telemóvel. Funciona offline após a primeira visita e guarda os dados no IndexedDB do browser. Não envia dados para um servidor.

## Antes de começar

1. Instala Node.js 20 ou superior.
2. Altera `Companheira` para o nome correto em `src/data/defaultConfig.ts`.
3. Se o teu repositório GitHub tiver outro nome, altera as ocorrências de `/gestor-despesas-mobile/` em `vite.config.ts` e `index.html`.

## Executar localmente

```bash
npm install
npm run dev
```

Para abrir a partir do telemóvel na mesma rede Wi-Fi:

```bash
npm run dev -- --host
```

Usa o URL `http://192.168.x.x:5173` apresentado no terminal. Para testar instalação e funcionamento offline, usa a versão publicada em HTTPS.

## Publicar no GitHub Pages

1. Cria no GitHub um repositório chamado `gestor-despesas-mobile`.
2. Descompacta este projeto, abre o terminal nessa pasta e executa:

```bash
git init
git add .
git commit -m "PWA inicial"
git branch -M main
git remote add origin https://github.com/TEU_UTILIZADOR/gestor-despesas-mobile.git
git push -u origin main
```

3. No repositório: `Settings` → `Pages` → em **Build and deployment**, escolhe **GitHub Actions**.
4. Aguarda o workflow. A aplicação ficará disponível em:

```text
https://TEU_UTILIZADOR.github.io/gestor-despesas-mobile/
```

O workflow `.github/workflows/deploy.yml` faz build e deploy automaticamente a cada `push` para `main`.

## Instalar no telemóvel

- **iPhone/Safari:** abre o URL, toca em Partilhar e escolhe “Adicionar ao ecrã principal”.
- **Android/Chrome:** abre o URL e seleciona “Instalar aplicação” ou “Adicionar ao ecrã principal”.

Em cada telemóvel, abre **Definições** e seleciona o respetivo perfil.

## Exportar para a app central

O botão **Partilhar / descarregar** cria um JSON com movimentos novos, editados e eliminados desde a última exportação. Partilha-o por AirDrop, Drive, iCloud, email ou guardando em Ficheiros. A aplicação central deverá importar pelo campo `id` para evitar duplicados.

## Segurança e cópias

Os dados são locais ao browser. Limpar dados do browser ou desinstalar a PWA pode apagar movimentos ainda não exportados. Exporta regularmente e guarda os ficheiros até confirmares a importação no portátil.
