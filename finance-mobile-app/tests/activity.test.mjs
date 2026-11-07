import test from 'node:test';import assert from 'node:assert/strict';
import {activityGroups,activityDetail} from '../activity.mjs';
import {allocationLimits,fiftyThirtyTwenty} from '../analytics.mjs';
const rows=[
{id:'1',date:'2026-11-01',type:'Expenses',category:'Expenses',subcategory:'Food',amount:200,distribution:'Want'},
{id:'2',date:'2026-11-02',type:'Expenses',category:'Expenses',subcategory:'Food',amount:350,distribution:'Want'},
{id:'3',date:'2026-11-03',type:'Expenses',category:'Expenses',subcategory:'Groceries',amount:1000,distribution:'Need'},
{id:'4',date:'2026-11-04',type:'Bills',category:'Bills',subcategory:'Rent',amount:9000,distribution:'Need'}];
test('categories > subcategories > individual Food spends reconcile',()=>{
 const top=activityGroups(rows);const expenses=top.find(x=>x.name==='Expenses');assert.equal(expenses.count,3);assert.equal(expenses.total,155000);
 const food=expenses.subcategories.find(x=>x.name==='Food');assert.equal(food.count,2);assert.equal(food.total,55000);
 assert.deepEqual(activityDetail(rows,'Expenses','Food').map(x=>x.id),['1','2']);
 assert.equal(top.reduce((s,x)=>s+x.total,0),1055000);
});
test('a category and subcategory with same name in other categories remains separate',()=>{
 const a=activityGroups([...rows,{id:'5',date:'2026-11-05',type:'Bills',category:'Bills',subcategory:'Food',amount:15}]);
 assert.equal(activityDetail([...rows,{type:'Bills',category:'Bills',subcategory:'Food'}],'Expenses','Food').length,2);
 assert.equal(a.find(x=>x.name==='Bills').subcategories.find(x=>x.name==='Food').count,1);
});
test('decimal monthly targets are preserved and reflected in percentage and targets',()=>{
 const state={transactions:[{id:'income',date:'2026-11-02',type:'Income',amount:100000}],recurring:[],allocationTargets:{'2026-11':{Need:44.25,Want:33.25,Savings:22.5}}};
 assert.deepEqual(allocationLimits(state,2026,11),{Need:44.25,Want:33.25,Savings:22.5});
 const r=fiftyThirtyTwenty(state,2026,11);assert.equal(r.targets.Need,4425000);assert.equal(r.targets.Want,3325000);assert.equal(r.targets.Savings,2250000);
});
