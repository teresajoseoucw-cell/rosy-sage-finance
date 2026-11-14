import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=name=>fs.readFileSync(new URL(`../${name}`,import.meta.url),'utf8');
test('appearance switch has independent device preference and system follow',()=>{
 const code=read('theme.js');
 assert.match(code,/rosy-sage-appearance-v1/);
 assert.match(code,/prefers-color-scheme: dark/);
 assert.match(code,/localStorage\.setItem\(KEY,pref\)/);
 assert.match(code,/document\.documentElement\.dataset\.theme/);
 assert.doesNotMatch(code,/rosy-sage-finance-v1/);
});
test('appearance options exposed in settings and app header',()=>{
 assert.match(read('app.mjs'),/id=\\"appearanceSelect\\"|id="appearanceSelect"/);
 assert.match(read('index.html'),/id="appearanceButton"/);
 assert.match(read('index.html'),/theme\.js/);
 assert.match(read('style.css'),/:root\[data-theme="dark"\]/);
 assert.match(read('sw.js'),/theme\.js/);
});
