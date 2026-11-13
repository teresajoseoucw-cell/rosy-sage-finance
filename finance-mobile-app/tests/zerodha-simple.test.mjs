import test from 'node:test';
import assert from 'node:assert/strict';
import {parseZerodhaTradebook,parseMonthlyPortfolioCsv,dateHistory,portfolioSummary} from '../portfolio-v15.mjs';
const H=[{id:'A',name:'Example Equity',symbol:'EXAMPLE',isin:'INE123',owner:'Cherry',assetType:'Stock',price:180},{id:'B',name:'Example MF',symbol:'FUNDX',isin:'INF456',owner:'Chinju',assetType:'Mutual Fund',price:50}];
const opening=[{id:'OPEN',holdingId:'A',date:'2026-01-01',kind:'BUY',units:10,amount:1000,fees:0,ref:'opening',bankAccountId:''}];
test('Zerodha CSV parses symbol ISIN trade ID and does not link bank',()=>{
 const c='symbol,isin,trade_date,exchange,segment,trade_type,quantity,price,trade_id,order_id\nEXAMPLE,INE123,2026-10-04,NSE,EQ,BUY,2,150,T100,O11\n';
 const r=parseZerodhaTradebook(c,H,opening,'Cherry');assert.equal(r.errors.length,0);assert.equal(r.parsed.length,1);assert.equal(r.parsed[0].ref,'zerodha:Cherry:T100');assert.equal(r.parsed[0].amount,300);assert.equal(r.parsed[0].bankAccountId,'');
 const dup=parseZerodhaTradebook(c,H,[...opening,...r.parsed],'Cherry');assert.equal(dup.skipped,1);assert.equal(dup.parsed.length,0);
});
test('Zerodha recognizes DD-MM-YYYY and blocks cross-owner import',()=>{
 const c='Symbol,Trade Date,Trade Type,Quantity,Price,Trade ID\nFUNDX,05-10-2026,BUY,5,40,M101\n';
 const wrong=parseZerodhaTradebook(c,H,[],'Cherry');assert.equal(wrong.errors.length,1);
 const right=parseZerodhaTradebook(c,H,[],'Chinju');assert.equal(right.errors.length,0);assert.equal(right.parsed[0].date,'2026-10-05');
});
test('Zerodha rejects derivatives and ambiguous security records',()=>{
 const c='symbol,trade_date,segment,trade_type,quantity,price,trade_id\nEXAMPLE,2026-10-04,NFO,BUY,2,150,T100\n';
 const r=parseZerodhaTradebook(c,H,[],'Cherry');assert.equal(r.parsed.length,0);assert.match(r.errors[0],/unsupported derivatives/);
});
test('Monthly valuation requires matching quantities and owner and does not create trades',()=>{
 const r=parseMonthlyPortfolioCsv('as_of,holding_id,units,price,market_value\n2026-11-30,A,12,190,2280\n',H,[...opening,{id:'T',holdingId:'A',date:'2026-10-04',kind:'BUY',units:2,amount:300,fees:0,ref:'T'}],'Cherry');
 assert.equal(r.errors.length,0);assert.equal(r.warnings.length,0);assert.equal(r.total,2280);
 const snapshots={portfolioHoldings:H,portfolioSnapshots:[{date:'2026-11-30',owner:'Cherry',value:r.total},{date:'2026-11-30',owner:'Chinju',value:500}]};
 assert.deepEqual(dateHistory(snapshots,'all'),[{date:'2026-11-30',value:2780}]);
});
