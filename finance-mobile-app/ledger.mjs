import {toPaise,effectiveTransactions} from './engine.mjs';

// The period begins from the configured opening balance. There is no assumed date
// for opening adjustments, so they are shown as an initial reconciliation entry.
export function accountStatement(state,accountId,year,{from=`${year}-01-01`,to=`${year}-12-31`}={}){
 const account=(state.accounts||[]).find(a=>a.id===accountId);
 if(!account)throw Error('Account not found');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to)||from>to||from<`${year}-01-01`||to>`${year}-12-31`)throw Error('Choose a valid date range within the selected year');
 const isCard=account.type==='Card';
 const opening=toPaise(account.opening), adjustment=toPaise(account.adjustment);
 let current=opening+adjustment, deposits=0,withdrawals=0,credit=0,debit=0;
 const raw=effectiveTransactions(state,year).filter(t=>(!t.scheduled||t.paid)&&(t.from===accountId||t.to===accountId)).sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)));
 const all=[];
 for(const t of raw){const amount=toPaise(t.amount);const incoming=t.to===accountId;
 // For bank/wallet incoming is a deposit, for credit card incoming is a repayment.
 const movement=(incoming?1:-1)*(isCard?-1:1)*amount;
 current+=movement;
 const row={id:t.id,date:t.date,description:t.note||t.subcategory||t.category||t.type||'Transaction',type:t.type,from:t.from,to:t.to,amount,deposits:incoming?amount:0,withdrawals:!incoming?amount:0,change:movement,balance:current,scheduled:!!t.scheduled};
 all.push(row);
 }
 const prior=all.filter(r=>r.date<from).reduce((s,r)=>s+r.change,0);
 const beginning=opening+adjustment+prior;
 const entries=all.filter(r=>r.date>=from&&r.date<=to);
 let running=beginning;
 const rows=entries.map(r=>({...r,balance:(running+=r.change)}));
 for(const r of rows){deposits+=r.deposits;withdrawals+=r.withdrawals;credit+=Math.max(r.change,0);debit+=Math.max(-r.change,0)}
 return {account,isCard,year,from,to,opening,adjustment,prior,beginning,deposits,withdrawals,credit,debit,closing:running,rows};
}

function safeCSV(v){let s=String(v??'');if(/^[=+@\t\r]/.test(s))s="'"+s;return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s}
function money(n){return (n/100).toFixed(2)}
export function accountStatementCSV(statement,accounts=[]){
 const {account,isCard,from,to,opening,adjustment,prior,beginning,deposits,withdrawals,closing,rows}=statement;
 const byId=id=>accounts.find(a=>a.id===id)?.name||'';
 const lines=[['Account statement',account.name],['Account type',isCard?'Credit Card':account.type],['Period',`${from} to ${to}`],['Balance interpretation',isCard?'Positive balance is outstanding liability':'Positive balance is available asset'],['Original starting balance',money(opening)],['Undated adjustments (+/-)',money(adjustment)],['Movements before period',money(prior)],['Period opening balance',money(beginning)],['Total deposits / card repayments',money(deposits)],['Total withdrawals / card charges',money(withdrawals)],['Period closing balance',money(closing)],[],['Date','Description','Type','Paid from','Received into',isCard?'Card repayment':'Deposit',isCard?'Card charge':'Withdrawal','Balance']];
 for(const r of rows)lines.push([r.date,r.description,r.type,byId(r.from),byId(r.to),money(r.deposits),money(r.withdrawals),money(r.balance)]);
 return '\uFEFF'+lines.map(row=>row.map(safeCSV).join(',')).join('\r\n')+'\r\n';
}
