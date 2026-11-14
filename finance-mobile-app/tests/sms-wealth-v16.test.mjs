import test from 'node:test';import assert from 'node:assert/strict';
import {parse,fingerprint,likelyDuplicate} from '../sms-v16.mjs';
import {diffState,replay,applyOp} from '../sync-core.mjs';
import {parseOpeningPortfolioCsv} from '../portfolio-v15.mjs';
test('SMS same sender/body is same ID',()=>{let s='INR 850.00 debited from account XX4521 to SWIGGY. UTR 123456789012';assert.equal(parse(s,'HDFCBK').id,parse(s,'HDFCBK').id);assert.equal(parse(s,'HDFCBK').kind,'Expense');});
test('Rejects OTP and reversals',()=>{assert.throws(()=>parse('OTP 123456 for INR 2000','Bank'));assert.throws(()=>parse('INR 900.00 transaction failed','Bank'));});
test('SMS credit vs self-transfer',()=>{assert.equal(parse('INR 8000 credited to account XX1234','BANK').kind,'Income');assert.equal(parse('INR 8000 credit card bill payment received','BANK').kind,'Transfer');});
test('Duplicate identifier and bank reference',()=>{let a=parse('INR 500 debited UTR 12345678','Bank'),b=parse('INR 500 debited UTR 12345678','Bank');assert.ok(likelyDuplicate(a,b));});
test('Wealth and SMS collections sync as individual record ops, not transactions',()=>{const a={wealthItems:[],wealthSnapshots:[],smsInbox:[],transactions:[]},b={...a,wealthItems:[{id:'a',value:400}],smsInbox:[{id:'s',status:'pending'}]};const ops=diffState(a,b,()=>String(Math.random()));assert.equal(ops.length,2);const c=replay(a,ops);assert.equal(c.transactions.length,0);assert.equal(c.wealthItems[0].value,400)});
test('one-time opening import rejects a repeat import',()=>{
 const header='owner,asset_type,investment_name,symbol,isin,platform,opening_as_of,opening_units,opening_cost_inr,latest_price_or_nav,price_as_of,reported_market_value';
 const csv=header+'\nChinju,Stock,Sample Security,SAMPLE,INE123456789,Zerodha,2026-11-14,10,100,12,2026-11-14,120\n';
 const first=parseOpeningPortfolioCsv(csv,[],[],'Chinju');assert.equal(first.errors.length,0);assert.equal(first.holdings.length,1);const second=parseOpeningPortfolioCsv(csv,first.holdings,[],'Chinju');assert.ok(second.errors.length>0);
});
test('late SMS retransmission cannot reopen approved inbox item',()=>{let db={smsInbox:[{id:'i1',status:'approved'}]};applyOp(db,{key:'item/smsInbox/i1',deleted:false,value:{id:'i1',status:'pending'}});assert.equal(db.smsInbox[0].status,'approved');});
