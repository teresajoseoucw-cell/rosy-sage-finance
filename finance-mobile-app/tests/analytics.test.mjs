import test from 'node:test';import assert from 'node:assert/strict';
import {categoryBudgets,spendingByPerson,annualCashflow,monthlyWorth,paycheckSummary,fiftyThirtyTwenty} from '../analytics.mjs';
const s={transactions:[{id:'1',type:'Income',date:'2026-01-01',amount:1000,spender:'A'},{id:'2',type:'Expenses',category:'Food',spender:'A',distribution:'Need',date:'2026-01-05',amount:150},{id:'3',type:'Expenses',category:'Food',spender:'B',distribution:'Want',date:'2026-02-05',amount:30}],recurring:[],skipped:[],categoryBudgets:[{month:'2026-01',category:'Food',amount:200}],netWorthSnapshots:[{month:'2026-01',assets:2000,liabilities:400}],paychecks:[{date:'2026-01-01',amount:1000,allocations:[{category:'Rent',amount:600}]}]};
test('separate month and person reporting',()=>{assert.equal(spendingByPerson(s,2026,1)[0].value,15000);assert.equal(spendingByPerson(s,2026).length,2)});
test('category budget is monthly and reports variance',()=>{const a=categoryBudgets(s,2026,1)[0];assert.equal(a.variance,5000);assert.equal(categoryBudgets(s,2026,2)[0].planned,0)});
test('cash flow excludes transfers and aggregates actuals',()=>{assert.equal(annualCashflow(s,2026)[0].net,85000)});
test('snapshot remains distinct from estimated running balances',()=>{assert.equal(monthlyWorth(s,2026)[0].net,160000);assert.equal(monthlyWorth(s,2026)[1].recorded,false)});
test('paycheck allocation reconciles',()=>{assert.equal(paycheckSummary(s,2026,1)[0].remaining,40000)});
test('50/30/20 separates unassigned',()=>{assert.equal(fiftyThirtyTwenty(s,2026,1).groups.Need,15000)});
