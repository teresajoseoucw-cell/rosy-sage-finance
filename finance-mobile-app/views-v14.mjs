import {toPaise} from './engine.mjs';

const SPEND_TYPES=new Set(['Expenses','Bills','Subscriptions','Debts']);
/** Date-wise outgoings; savings allocations, transfers and income aren't expenses. */
export function dateExpenseGroups(rows){
 const dates=new Map();
 for(const row of rows){
  if(!SPEND_TYPES.has(row.type)||row.scheduled&&!row.paid||!/^\d{4}-\d{2}-\d{2}$/.test(row.date||''))continue;
  if(!dates.has(row.date))dates.set(row.date,{date:row.date,total:0,count:0,entries:[]});
  const bucket=dates.get(row.date);
  bucket.entries.push(row);
  bucket.total+=toPaise(row.amount);
  bucket.count++;
 }
 return [...dates.values()].sort((a,b)=>b.date.localeCompare(a.date));
}
/** Only checking, savings, cash and wallet balances are assets; card balances are dues. */
export function liquidBalanceSummary(accountRows){
 let cashAndBank=0,cardOutstanding=0;
 for(const a of accountRows){
  const balance=Number(a.balance)||0;
  if(a.type==='Card')cardOutstanding+=balance;
  else cashAndBank+=balance;
 }
 return {cashAndBank,cardOutstanding,currentBalance:cashAndBank-cardOutstanding};
}
