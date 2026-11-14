// Deterministic, append-only synchronization operations. Browser and Node compatible.
const LISTS=['transactions','recurring','accounts','budgets','funds','contributions','debts','assets','investments','portfolioHoldings','portfolioTrades','portfolioSips','portfolioSnapshots','wealthItems','wealthSnapshots','smsInbox','categoryBudgets','paychecks','netWorthSnapshots','taxonomy'];
const WHOLE=['skipped','categories','spenders'];
const MAPS=['allocationTargets','noSpendTargets'];
const SETTINGS=['currency','year','debtStrategy','extraDebt','migration'];
const clone=x=>x===undefined?null:JSON.parse(JSON.stringify(x));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const byId=a=>new Map((Array.isArray(a)?a:[]).filter(x=>x&&typeof x==='object'&&typeof x.id==='string').map(x=>[x.id,x]));
export function diffState(oldState,newState,makeId=()=>crypto.randomUUID()){
 const out=[];const push=(key,value,deleted=false)=>out.push({id:makeId(),key,value:deleted?null:clone(value),deleted,at:new Date().toISOString()});
 for(const name of LISTS){const old=byId(oldState[name]),fresh=byId(newState[name]);
  for(const [id,value] of fresh)if(!same(old.get(id),value))push(`item/${name}/${encodeURIComponent(id)}`,value);
  for(const [id] of old)if(!fresh.has(id))push(`item/${name}/${encodeURIComponent(id)}`,null,true);
 }
 for(const name of WHOLE)if(!same(oldState[name]||[],newState[name]||[]))push(`whole/${name}`,newState[name]||[]);
 for(const name of MAPS){const a=oldState[name]||{},b=newState[name]||{};
  for(const key of new Set([...Object.keys(a),...Object.keys(b)]))if(!same(a[key],b[key]))push(`map/${name}/${encodeURIComponent(key)}`,b[key],!Object.hasOwn(b,key));
 }
 for(const name of SETTINGS)if(!same(oldState[name],newState[name]))push(`setting/${name}`,newState[name]);
 return out;
}
export function applyOp(state,op){
 if(op.key==='__bootstrap')return clone(op.value);
 const parts=op.key.split('/');const kind=parts[0],name=parts[1];
 if(kind==='item'&&LISTS.includes(name)&&parts.length===3){const id=decodeURIComponent(parts[2]);const a=Array.isArray(state[name])?state[name].slice():[];const at=a.findIndex(x=>x?.id===id);if(op.deleted){if(at>=0)a.splice(at,1)}else if(at>=0){const incoming=clone(op.value);a[at]=(name==='smsInbox'&&['approved','dismissed'].includes(a[at]?.status)&&incoming?.status==='pending')?a[at]:incoming;}else a.push(clone(op.value));state[name]=a;}
 else if(kind==='whole'&&WHOLE.includes(name)&&parts.length===2){state[name]=clone(op.value);}
 else if(kind==='map'&&MAPS.includes(name)&&parts.length===3){const key=decodeURIComponent(parts[2]);if(key==='__proto__'||key==='constructor'||key==='prototype')throw Error('Invalid sync key');const m={...(state[name]||{})};if(op.deleted)delete m[key];else m[key]=clone(op.value);state[name]=m;}
 else if(kind==='setting'&&SETTINGS.includes(name)&&parts.length===2){state[name]=clone(op.value);}
 else throw Error('Unknown sync operation: '+op.key);
 return state;
}
export function replay(initial,operations){let state=clone(initial);const seen=new Set();for(const op of operations){if(seen.has(op.id))continue;seen.add(op.id);state=applyOp(state,op);}return state;}
export const SYNC_COLLECTIONS={LISTS,WHOLE,MAPS,SETTINGS};
