import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {allocationLimits} from '../analytics.mjs';
const app=readFileSync(new URL('../app.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('overview includes editable monthly allocation form and visible saved status',()=>{
 assert.match(app,/function allocationQuickEditor\(/);
 assert.match(app,/allocationQuickForm/);
 assert.match(app,/Custom targets saved for/);
 assert.match(app,/function persistAllocation\(/);
 assert.match(app,/document\.addEventListener\('submit'/);
 assert.match(app,/allocationPanel\(true\).*allocationQuickEditor\(\)/);
});
test('modal and inline editor save via one shared persistence function',()=>{
 assert.match(app,/try\{persistAllocation\(month,values\);\$\('#allocationEditor'\)\.close\(\)/);
 assert.match(app,/try\{persistAllocation\(month,values\);\}catch/);
 assert.match(html,/id="allocationMonth"/);
});
test('saved target selections are month-scoped and separate from defaults',()=>{
 const state={allocationTargets:{'2026-11':{Need:45,Want:35,Savings:20},'2026-12':{Need:60,Want:20,Savings:20}}};
 assert.deepEqual(allocationLimits(state,2026,11),{Need:45,Want:35,Savings:20});
 assert.deepEqual(allocationLimits(state,2026,12),{Need:60,Want:20,Savings:20});
 assert.deepEqual(allocationLimits(state,2026,10),{Need:50,Want:30,Savings:20});
});
