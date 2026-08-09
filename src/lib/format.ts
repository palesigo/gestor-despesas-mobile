export const todayIso=()=>new Date().toISOString().slice(0,10);
export const money=(v:number)=>new Intl.NumberFormat("pt-PT",{style:"currency",currency:"EUR"}).format(v);
export const datePt=(v:string)=>{const [y,m,d]=v.split("-");return `${d}/${m}/${y}`};
export const monthKey=(v:string)=>v.slice(0,7);
export const currentMonthKey=()=>new Date().toISOString().slice(0,7);
export const monthLabel=(v:string)=>new Intl.DateTimeFormat("pt-PT",{month:"long",year:"numeric"}).format(new Date(+v.slice(0,4),+v.slice(5,7)-1,1));