import test from 'node:test';
import assert from 'node:assert/strict';
import {accountStatement,accountStatementCSV} from '../ledger.mjs';
import {accountBalances} from '../engine.mjs';
const state={accounts:[{id:'bank',name:'Bank',type:'Saving',opening:10000,adjustment:-500},{id:'card',name:'Card',type:'Card',opening:2000,adjustment:100}],transactions:[
{id:'i',date:'2026-01-04',type:'Income',amount:3000,to:'bank',note:'Salary'},
{id:'e',date:'2026-01-06',type:'Expenses',amount:450,from:'card',note:'Food'},
{id:'t',date:'2026-01-07',type:'Transfer',amount:1000,from:'bank',to:'card',note:'Card repayment'},
{id:'n',date:'2026-01-08',type:'Expenses',amount:250,from:'bank',note:'Food'},
{id:'x',date:'2026-02-08',type:'Transfer',amount:200,from:'bank',to:'card'}],recurring:[],skipped:[]};
test('bank account summary ties to transaction ledger and balance engine',()=>{
 const s=accountStatement(state,'bank',2026);
 assert.equal(s.opening,1000000);assert.equal(s.adjustment,-50000);assert.equal(s.deposits,300000);assert.equal(s.withdrawals,145000);
 assert.equal(s.closing,1105000);assert.equal(s.closing,accountBalances(state,2026).find(x=>x.id==='bank').balance);
 assert.equal(s.rows.length,4);
});
test('credit card charges increase dues, repayments reduce dues, no duplicate expense',()=>{
 const s=accountStatement(state,'card',2026);
 assert.equal(s.opening,200000);assert.equal(s.adjustment,10000);assert.equal(s.withdrawals,45000);assert.equal(s.deposits,120000);
 assert.equal(s.closing,135000);assert.equal(s.closing,accountBalances(state,2026).find(x=>x.id==='card').balance);
});
test('date filtered statement carries prior movement into period opening',()=>{
 const s=accountStatement(state,'bank',2026,{from:'2026-02-01',to:'2026-02-28'});
 assert.equal(s.beginning,1125000);assert.equal(s.withdrawals,20000);assert.equal(s.closing,1105000);assert.equal(s.rows.length,1);
});
test('CSV contains summary, adjustments and every detail and escapes formula-like text',()=>{
 const s=accountStatement(state,'bank',2026);
 const csv=accountStatementCSV(s,state.accounts);
 assert.match(csv,/starting balance/i);assert.match(csv,/Undated adjustments/);assert.match(csv,/Date,Description,Type/);assert.match(csv,/Card repayment/);
});
test('no activity still reconciles opening and adjustment, bad date rejected',()=>{
 const s=accountStatement({...state,transactions:[]},'bank',2026);
 assert.equal(s.closing,950000);assert.equal(s.rows.length,0);
 assert.throws(()=>accountStatement(state,'bank',2026,{from:'2026-05-01',to:'2026-04-01'}));
});
