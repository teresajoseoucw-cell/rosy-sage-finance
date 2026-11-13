import test from 'node:test';
import assert from 'node:assert/strict';
import {portfolioSummary,portfolioAssetPositions} from '../portfolio-v15.mjs';
const d={portfolioHoldings:[
 {id:'a',owner:'Cherry',assetType:'Stock',name:'Sample Stock',price:120,priceDate:'2026-11-13'},
 {id:'b',owner:'Cherry',assetType:'Mutual Fund',name:'Sample Mutual Fund',price:75,priceDate:'2026-11-13'},
 {id:'c',owner:'Chinju',assetType:'Stock',name:'Second Owner',price:30,priceDate:'2026-11-13'}
],portfolioTrades:[
 {id:'t1',holdingId:'a',kind:'BUY',units:10,amount:1000,fees:0,date:'2026-11-01'},
 {id:'t2',holdingId:'b',kind:'BUY',units:10,amount:1000,fees:0,date:'2026-11-01'},
 {id:'t3',holdingId:'c',kind:'BUY',units:10,amount:500,fees:0,date:'2026-11-01'}]};
test('asset position breakdown includes owner-specific value, cost and signed return',()=>{
 const x=portfolioAssetPositions(portfolioSummary(d,'2026-11-13','Cherry'));
 assert.equal(x.Stock.value,120000);assert.equal(x.Stock.cost,100000);assert.equal(x.Stock.returnPct,20);
 assert.equal(x['Mutual Fund'].value,75000);assert.equal(x['Mutual Fund'].cost,100000);assert.equal(x['Mutual Fund'].returnPct,-25);
 const all=portfolioAssetPositions(portfolioSummary(d,'2026-11-13'));
 assert.equal(all.Stock.value,150000);assert.equal(all.Stock.cost,150000);assert.equal(all.Stock.returnPct,0);
});
test('no price or no cost does not assert reliable return',()=>{
 const a={...d,portfolioHoldings:d.portfolioHoldings.map(h=>h.id==='a'?{...h,price:0}:h)};
 assert.equal(portfolioAssetPositions(portfolioSummary(a,'2026-11-13','Cherry')).Stock.returnPct,null);
 const empty=portfolioAssetPositions({holdings:[]});assert.equal(empty.Stock.returnPct,null);
});
