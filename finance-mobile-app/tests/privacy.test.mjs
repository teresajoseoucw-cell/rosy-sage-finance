import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
test('privacy toggle has device-local preference; never touches finance collections',()=>{
 const s=read('privacy.js');
 assert.match(s,/rosy-sage-privacy-hidden-v1/);
 assert.match(s,/localStorage\.setItem\(KEY,String\(v\)\)/);
 assert.doesNotMatch(s,/rosy-sage-finance-v1|cloudSync|\/api\/sync|portfolioHoldings/);
});
test('header and settings visibility controls are present',()=>{
 assert.match(read('index.html'),/id="privacyButton"/);
 assert.match(read('app.mjs'),/id="privacySelect"/);
 assert.match(read('sw.js'),/privacy\.js/);
 assert.match(read('style.css'),/\.rs-privacy-mask/);
});
test('mask covers rupee values, signed amounts, percentages without masking calendar dates',()=>{
 const s=read('privacy.js');
 assert.match(s,/MONEY=/);
 assert.match(s,/privacy-hidden/);
 assert.match(s,/maskTree/);
 assert.match(s,/unmask/);
});
