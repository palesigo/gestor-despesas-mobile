import {openDB,type DBSchema} from "idb";
import type {AppSettings,MobileExpense} from "../types";
import {defaultConfig} from "../data/defaultConfig";
interface Db extends DBSchema{expenses:{key:string;value:MobileExpense;indexes:{"by-date":string}};settings:{key:string;value:AppSettings}}
const dbp=openDB<Db>("gestor-despesas-mobile",1,{upgrade(db){const s=db.createObjectStore("expenses",{keyPath:"id"});s.createIndex("by-date","data");db.createObjectStore("settings")}}),KEY="settings";
export async function getSettings(){const db=await dbp,s=await db.get("settings",KEY);if(s)return s;const x:AppSettings={deviceId:crypto.randomUUID(),perfilAtivo:defaultConfig.pessoas[0],config:defaultConfig};await db.put("settings",x,KEY);return x}
export async function saveSettings(x:AppSettings){await (await dbp).put("settings",x,KEY)}
export async function getVisibleExpenses(){return (await (await dbp).getAll("expenses")).filter(x=>!x.deletedAt).sort((a,b)=>b.data.localeCompare(a.data)||b.updatedAt.localeCompare(a.updatedAt))}
export async function getPendingExpenses(){return (await (await dbp).getAll("expenses")).filter(x=>!x.exportedAt||x.updatedAt>x.exportedAt)}
export async function upsertExpense(x:MobileExpense){await (await dbp).put("expenses",x)}
export async function softDeleteExpense(id:string){const db=await dbp,x=await db.get("expenses",id);if(x){const now=new Date().toISOString();await db.put("expenses",{...x,deletedAt:now,updatedAt:now})}}
export async function markExported(ids:string[],at:string){const db=await dbp,tx=db.transaction("expenses","readwrite");for(const id of ids){const x=await tx.store.get(id);if(x)await tx.store.put({...x,exportedAt:at})}await tx.done}