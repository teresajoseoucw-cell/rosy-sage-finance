import {portfolioSummary,dateHistory} from './portfolio-v15.mjs';
// Pure, deterministic finance functions. Money is stored in integer paise.
export const TYPES=['Income','Bills','Expenses','Savings','Subscriptions','Debts'];
export const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const toPaise=v=>Math.round((Number(v)||0)*100);
export const fromPaise=v=>(Number(v)||0)/100;
export const iso=(y,m,d)=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
export const ymd=s=>{let a=String(s||'').slice(0,10).split('-').map(Number);return a.length===3&&a.every(Number.isFinite)?a:null};
export const monthKey=s=>String(s||'').slice(0,7);
export const dateDiff=(a,b)=>Math.round((Date.UTC(...ymd(b).map((x,i)=>i===1?x-1:x))-Date.UTC(...ymd(a).map((x,i)=>i===1?x-1:x)))/86400000);
export function addMonths(date,n){const [y,m,d]=ymd(date);const index=(y*12+m-1)+n,ny=Math.floor(index/12),nm=index%12;return iso(ny,nm,Math.min(d,new Date(Date.UTC(ny,nm+1,0)).getUTCDate()));}
export function nextOccurrence(rule,current){const f=rule.frequency; if(f==='Once')return null;const d=ymd(current);if(!d)return null;
 if(f==='Weekly'||f==='Fortnightly'||f==='Every 4 weeks'){let delta=f==='Weekly'?7:f==='Fortnightly'?14:28;let dt=new Date(Date.UTC(d[0],d[1]-1,d[2]+delta));return dt.toISOString().slice(0,10)}
 let delta=f==='Monthly'?1:f==='Every 2 months'?2:f==='Quarterly'?3:f==='Every 6 months'?6:f==='Yearly'?12:1;
 // Anchor from the original start date to avoid calendar-day drift.
 let step=1, candidate=addMonths(rule.start,delta);while(candidate<=current&&step<500){step++;candidate=addMonths(rule.start,step*delta)}return candidate;
}
export function occurrences(rule,start,end){if(!rule.start||!Number.isFinite(rule.amount)||rule.amount<=0)return [];let cur=rule.start;let out=[];let loops=0;let stop=rule.end&&rule.end<end?rule.end:end;
 while(cur<=stop&&loops++<1500){if(cur>=start)out.push({...rule,id:`rec-${rule.id}-${cur}`,ruleId:rule.id,date:cur,scheduled:true,paid:!!(rule.paidDates||[]).includes(cur)});let next=nextOccurrence(rule,cur);if(!next||next<=cur)break;cur=next}return out;}
export function effectiveTransactions(state,year){let start=`${year}-01-01`,end=`${year}-12-31`;
 const manual=(state.transactions||[]).filter(t=>t.date>=start&&t.date<=end).map(t=>({...t,scheduled:false,paid:true}));
 const excluded=new Set((state.skipped||[]));let scheduled=(state.recurring||[]).flatMap(r=>occurrences(r,start,end)).filter(r=>!excluded.has(r.id));
 return [...manual,...scheduled].sort((a,b)=>b.date.localeCompare(a.date));}
export function totals(rows,{actual=false}={}){let ans={Income:0,Bills:0,Expenses:0,Savings:0,Subscriptions:0,Debts:0};for(const r of rows){if(actual&&r.scheduled&&!r.paid)continue;if(ans[r.type]!==undefined)ans[r.type]+=toPaise(r.amount)}
 const expense=ans.Bills+ans.Expenses+ans.Subscriptions+ans.Debts;
 return {...ans,spending:expense,outflow:expense+ans.Savings,left:ans.Income-expense-ans.Savings};}
export function monthly(state,year,actual=true){const rows=effectiveTransactions(state,year);return MONTHS.map((name,i)=>({name,month:i+1,...totals(rows.filter(r=>Number(r.date.slice(5,7))===i+1),{actual})}));}
export function accountBalances(state,year){const rows=effectiveTransactions(state,year).filter(t=>!t.scheduled||t.paid);return (state.accounts||[]).map(a=>{
 let deposit=0,withdrawal=0;for(const r of rows){let amount=toPaise(r.amount);if(r.from===a.id)withdrawal+=amount;if(r.to===a.id)deposit+=amount;}
 return {...a,deposit,withdrawal,balance:a.type==='Card'?toPaise(a.opening)+toPaise(a.adjustment)+withdrawal-deposit:toPaise(a.opening)+toPaise(a.adjustment)+deposit-withdrawal};});}
export function budgetComparison(state,year,month){let rows=effectiveTransactions(state,year).filter(x=>Number(x.date.slice(5,7))===month),actual=totals(rows,{actual:true});let monthBudgets=(state.budgets||[]).filter(b=>b.month===`${year}-${String(month).padStart(2,'0')}`);
 let planned=Object.fromEntries(TYPES.map(t=>[t,0]));for(let b of monthBudgets)planned[b.type]+=toPaise(b.amount);
 return TYPES.map(type=>({type,planned:planned[type],actual:actual[type],difference:type==='Income'?actual[type]-planned[type]:planned[type]-actual[type]}));}
export function categoryBreakdown(state,year,month){let r=effectiveTransactions(state,year).filter(x=>Number(x.date.slice(5,7))===month&&(!x.scheduled||x.paid)&&x.type!=='Income');let o={};for(let t of r)o[t.category||t.type]=(o[t.category||t.type]||0)+toPaise(t.amount);return Object.entries(o).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));}
export function noSpendDays(state,year,month){let last=new Date(Date.UTC(year,month,0)).getUTCDate();let days=new Set(effectiveTransactions(state,year).filter(t=>Number(t.date.slice(5,7))===month&&(!t.scheduled||t.paid)&&['Expenses','Bills','Subscriptions','Debts'].includes(t.type)).map(t=>t.date));return {total:last,spent:days.size,free:last-days.size,target:Number(state.noSpendTargets?.[`${year}-${String(month).padStart(2,'0')}`]||0)};}
export function sinkingStats(state){return (state.funds||[]).map(f=>{const saved=toPaise(f.opening)+ (state.contributions||[]).filter(c=>c.fundId===f.id).reduce((s,c)=>s+toPaise(c.amount),0);const goal=toPaise(f.goal);return {...f,saved,goalPaise:goal,left:Math.max(0,goal-saved),progress:goal>0?Math.min(1,saved/goal):0,monthsLeft:Number(f.monthly)>0?Math.ceil(Math.max(0,goal-saved)/toPaise(f.monthly)):null}})}
export function debtProjection(debts,extra=0,strategy='avalanche',maxMonths=600){let entries=debts.map(d=>({...d,balance:toPaise(d.balance),minPaise:toPaise(d.minimum),apr:Number(d.apr)||0})).filter(d=>d.balance>0),interest=0,history=[];let m=0;
 while(entries.some(d=>d.balance>0)&&m<maxMonths){m++;let available=toPaise(extra),monthInterest=0;for(let d of entries){if(d.balance<=0)continue;let charge=Math.round(d.balance*d.apr/1200);d.balance+=charge;monthInterest+=charge;let pay=Math.min(d.balance,Math.max(0,d.minPaise));d.balance-=pay;}
 // Any unused minimum payment can roll into the targeted debt.
 let active=entries.filter(d=>d.balance>0);active.sort(strategy==='snowball'?(a,b)=>a.balance-b.balance:(a,b)=>b.apr-a.apr||a.balance-b.balance);
 for(let d of active){let pay=Math.min(d.balance,available);d.balance-=pay;available-=pay;if(available<=0)break;}
 interest+=monthInterest;history.push({month:m,balance:entries.reduce((a,d)=>a+d.balance,0),interest:monthInterest});
 // No reductions possible (e.g. zero payments); show non-payoff rather than claiming a payoff.
 if(m>2&&history[m-1].balance>=history[m-2].balance&&history[m-2].balance>=history[m-3].balance)break;
 }
 return {months:entries.every(d=>d.balance===0)?m:null,interest,history,remaining:entries.reduce((a,d)=>a+d.balance,0)};}
export function investmentsProjection(items,years=10){
 const months=Math.max(0,Math.floor(Number(years)||0))*12;
 const positions=(items||[]).map(inv=>({value:toPaise(inv.initial),initial:toPaise(inv.initial),monthly:toPaise(inv.monthly),rate:(Number(inv.roi)||0)/1200}));
 const series=[];let invested=positions.reduce((s,p)=>s+p.initial,0);
 for(let m=0;m<=months;m++){
  if(m){for(const p of positions){p.value=Math.round(p.value*(1+p.rate))+p.monthly;invested+=p.monthly;}}
  const value=positions.reduce((s,p)=>s+p.value,0);
  series.push({month:m,value,contributions:invested,growth:value-invested});
 }
 return series;
}
export function netWorth(state,year){const accounts=accountBalances(state,year).reduce((s,a)=>s+(a.type==='Card'?-a.balance:a.balance),0);const todayYear=new Date().getFullYear();const history=dateHistory(state).filter(x=>x.date<=`${year}-12-31`);const portfolioValue=year<todayYear?(history.length?toPaise(history.at(-1).value):0):portfolioSummary(state).value;let otherAssets=(state.assets||[]).reduce((s,a)=>s+toPaise(a.amount),0)+portfolioValue;let liabilities=(state.debts||[]).reduce((s,d)=>s+toPaise(d.balance),0);const cardDue=accountBalances(state,year).filter(a=>a.type==='Card').reduce((s,a)=>s+a.balance,0);return {accounts,assets:accounts+cardDue+otherAssets,liabilities:liabilities+cardDue,net:accounts+otherAssets-liabilities};}
