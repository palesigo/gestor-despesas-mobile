import type { MobileConfig } from "../types";
const o=(subgrupo:string,categoria:string)=>({subgrupo,categoria});
export const defaultConfig:MobileConfig={schemaVersion:1,type:"budget-mobile-config",version:"1.0.0",generatedAt:new Date().toISOString(),anoAtivo:new Date().getFullYear(),pessoas:["Paulo","Lena",""],grupos:[
{nome:"Casa",opcoes:[o("Supermercado","Supermercado"),o("Água","Casa"),o("Gás","Casa"),o("Eletricidade","Casa"),o("Comunicações","Casa"),o("Limpeza","Casa"),o("Engomadoria","Casa"),o("Condomínio","Condomínio"),o("IMI","Impostos"),o("Seguro Casa","Seguros"),o("Obras","Casa"),o("Outros","Casa")]},
{nome:"Carros",opcoes:[o("Combustível","Carros"),o("Portagens","Carros"),o("Estacionamento","Carros"),o("Revisão","Carros"),o("Lavagem","Carros"),o("Pneus","Carros"),o("Bateria","Carros"),o("Inspeção","Carros"),o("IUC","Impostos"),o("Seguro","Seguros"),o("Outros","Carros")]},
{nome:"Refeições",opcoes:[o("Restaurante","Refeições"),o("Café / Lanche","Refeições"),o("Delivery","Refeições"),o("Uber","Refeições"),o("Orelhas","Orelhas"),o("Outros","Refeições")]},
{nome:"Saúde",opcoes:[o("Farmácia","Saúde"),o("Consulta","Saúde"),o("Análises","Saúde"),o("Especialidade médica","Saúde"),o("Óculos","Saúde")]},
{nome:"Carolina",opcoes:[o("Educação","Carolina"),o("Natação","Carolina"),o("Basket","Carolina"),o("Roupa","Carolina"),o("Saúde","Carolina"),o("Poupança","Poupança Carolina"),o("Prenda","Prendas"),o("Outros","Carolina")]},
{nome:"Matilde",opcoes:[o("Educação","Matilde"),o("Natação","Matilde"),o("Roupa","Matilde"),o("Poupança","Poupança Matilde"),o("Prenda","Prendas"),o("Outros","Matilde")]},
{nome:"Viagens",opcoes:[o("Transportes","Viagens"),o("Hotel","Viagens"),o("Atividades","Viagens"),o("Refeições","Viagens"),o("Compras","Viagens"),o("Outros","Viagens")]},
{nome:"Outros",opcoes:[o("Subscrições","Subscrições"),o("Comissões bancárias","Comissões"),o("Entretenimento","Entretenimento"),o("Prendas","Prendas"),o("Natal","Natal"),o("Compras pontuais","Outros"),o("Outros","Outros")]}
]};