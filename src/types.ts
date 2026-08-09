export type TipoMovimento="despesa"|"receita";
export interface ClassificationOption{subgrupo:string;categoria:string}
export interface GroupConfig{nome:string;opcoes:ClassificationOption[]}
export interface MobileConfig{schemaVersion:1;type:"budget-mobile-config";version:string;generatedAt:string;anoAtivo:number;pessoas:string[];grupos:GroupConfig[]}
export interface AppSettings{deviceId:string;perfilAtivo:string;config:MobileConfig}
export interface MobileExpense{id:string;deviceId:string;data:string;tipo:TipoMovimento;grupo:string;subgrupo:string;categoria:string;pagoPor:string;valor:number;nota:string;createdAt:string;updatedAt:string;exportedAt?:string;deletedAt?:string}
export interface MobileExpenseExport{schemaVersion:1;type:"budget-mobile-expense-export";exportedAt:string;device:{id:string;owner:string};records:MobileExpense[]}