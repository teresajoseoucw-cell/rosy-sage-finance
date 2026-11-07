import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_ACCOUNTS,seedAccounts} from '../accounts.mjs';
import {allocationLimits,fiftyThirtyTwenty} from '../analytics.mjs';
test('12 default payment sources include exact bank and masked-card names',()=>{
 assert.deepEqual(DEFAULT_ACCOUNTS.map(a=>a.name),['Bank Cherry','Bank Chinju - HDFC','Wallets','Parents','Cashback Transfer','Sodexo','Bank Chinju - SIB','X5053','X0005','X4007','X3185','Cash']);
 assert.equal(DEFAULT_ACCOUNTS.filter(a=>a.type==='Card').length,4);
 assert.ok(DEFAULT_ACCOUNTS.every(a=>a.opening===0));
});
test('existing accounts and balances stay intact without duplicating names',()=>{
 const rows=seedAccounts([{id:'old',name:'Bank Cherry',type:'Saving',opening:6500}]);
 assert.equal(rows.length,12);assert.equal(rows.find(x=>x.name==='Bank Cherry').opening,6500);
 assert.equal(rows.find(x=>x.name==='Bank Cherry').id,'old');
});
test('monthly overrides apply to only their own month',()=>{
 const s={transactions:[{id:'income',date:'2026-11-01',type:'Income',amount:1000},{id:'need',date:'2026-11-02',type:'Bills',distribution:'Need',amount:350}],recurring:[],allocationTargets:{'2026-11':{Need:40,Want:35,Savings:25}}};
 assert.deepEqual(allocationLimits(s,2026,11),{Need:40,Want:35,Savings:25});
 assert.deepEqual(allocationLimits(s,2026,10),{Need:50,Want:30,Savings:20});
 const result=fiftyThirtyTwenty(s,2026,11);assert.equal(result.targets.Need,40000);assert.equal(result.targets.Want,35000);assert.equal(result.targets.Savings,25000);
});
test('invalid percentages fall back to the default instead of corrupting financial health',()=>{
 let state={allocationTargets:{'2026-11':{Need:60,Want:30,Savings:30}}};
 assert.equal(allocationLimits(state,2026,11).Need,50);
});
