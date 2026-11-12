import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {classify,SEED} from '../taxonomy.mjs';
import {fiftyThirtyTwenty} from '../analytics.mjs';
import {dateExpenseGroups,liquidBalanceSummary} from '../views-v14.mjs';
import {accountBalances} from '../engine.mjs';
const app=readFileSync(new URL('../app.mjs',import.meta.url),'utf8');
const sub=SEED.find(x=>x.name==='Food');
const core=()=>({year:2026,taxonomy:SEED,recurring:[],skipped:[],transactions:[],accounts:[]});
test('explicitly empty allocation never inherits default Want when subcategory is Food',()=>{
 const s=core(),row={id:'a',date:'2026-11-02',type:'Expenses',subcategoryId:sub.id,amount:300,distribution:''};s.transactions=[row];
 assert.equal(classify(row,s).distribution,'');const r=fiftyThirtyTwenty(s,2026,11);assert.equal(r.groups.Unassigned,30000);assert.equal(r.groups.Want,0);
});
test('legacy row without distribution retains taxonomy default',()=>{
 assert.equal(classify({type:'Expenses',subcategoryId:sub.id},core()).distribution,'Want');
});
test('zero classification is optional for new and existing entries',()=>{
 assert.ok(!app.includes("return alert('Select Need, Want or Savings to keep financial health complete.')"));
 assert.ok(app.includes('No classification'));
});
test('net liquid balance subtracts card liability exactly once',()=>{
 const state=core();state.accounts=[{id:'bank',type:'Saving',opening:20000,adjustment:0},{id:'wallet',type:'Cash',opening:1000,adjustment:0},{id:'card',type:'Card',opening:5000,adjustment:0}];
 state.transactions=[{id:'c1',date:'2026-11-05',type:'Expenses',category:'Expenses',subcategory:'Food',amount:1200,from:'card'}, {id:'p1',date:'2026-11-06',type:'Transfer',amount:3000,from:'bank',to:'card'}];
 const rows=accountBalances(state,2026);const r=liquidBalanceSummary(rows);
 assert.equal(r.cashAndBank,1800000);assert.equal(r.cardOutstanding,320000);assert.equal(r.currentBalance,1480000);
});
test('date wise groups show individual expenses, not savings income or transfers',()=>{
 const entries=[{id:'e1',date:'2026-11-05',type:'Expenses',amount:120},{id:'e2',date:'2026-11-05',type:'Bills',amount:500},{id:'e3',date:'2026-11-04',type:'Subscriptions',amount:250},{id:'i',date:'2026-11-04',type:'Income',amount:1000},{id:'t',date:'2026-11-04',type:'Transfer',amount:900},{id:'s',date:'2026-11-04',type:'Savings',amount:100},{id:'future',date:'2026-11-07',type:'Expenses',amount:300,scheduled:true,paid:false}];
 const groups=dateExpenseGroups(entries);assert.equal(groups.length,2);assert.equal(groups[0].date,'2026-11-05');assert.equal(groups[0].count,2);assert.equal(groups[0].total,62000);assert.equal(groups[1].total,25000);
});

import {effectiveTransactions} from '../engine.mjs';
test('transaction editor permits untracked Paid from for transfer and expenses',()=>{
 assert.ok(app.includes("if(data.type==='Transfer'&&!data.from&&!data.to)"));
 assert.ok(!app.includes("return alert('Select the bank account or credit card used.')"));
 assert.ok(app.includes('Paid from is optional'));
});
test('single-ended transfer credits destination and does not create phantom source deduction',()=>{
 const state=core();state.accounts=[{id:'bank',type:'Saving',opening:1000,adjustment:0}];
 state.transactions=[{id:'tr',date:'2026-11-01',type:'Transfer',amount:400,to:'bank',from:''}];
 assert.equal(accountBalances(state,2026)[0].balance,140000);
 assert.equal(fiftyThirtyTwenty(state,2026,11).groups.Unassigned,0);
});
test('expense with no Paid from remains reported but leaves account untouched',()=>{
 const state=core();state.accounts=[{id:'bank',type:'Saving',opening:1000,adjustment:0}];
 state.transactions=[{id:'no-source',date:'2026-11-05',type:'Expenses',category:'Expenses',subcategory:'Food',distribution:'',amount:250,from:''}];
 assert.equal(accountBalances(state,2026)[0].balance,100000);
 assert.equal(fiftyThirtyTwenty(state,2026,11).groups.Unassigned,25000);
});
