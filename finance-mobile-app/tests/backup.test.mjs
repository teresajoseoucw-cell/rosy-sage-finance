import test from 'node:test';import assert from 'node:assert/strict';
import {datasetToCsv,backupFiles,makeZip,csvEscape} from '../backup.mjs';
import {writeFileSync,unlinkSync} from 'node:fs';import {execFileSync} from 'node:child_process';
test('CSV escaping retains quotes newlines and formulas are safe',()=>{
 assert.equal(csvEscape('hello,"world"'),'"hello,""world"""');
 assert.equal(csvEscape('=HYPERLINK("bad")'),'"\'=HYPERLINK(""bad"")"');
 assert.equal(csvEscape(-12),'-12');
 assert.match(datasetToCsv('transactions',[{note:'rent, June',amount:5},{note:'line\ntwo',amount:10}]),/"rent, June"/);
});
test('every raw collection plus JSON included and zipped as readable valid archive',()=>{
 const s={transactions:[{id:'t1',date:'2026-11-07',amount:123.45,note:'Coffee'}],noSpendTargets:{'2026-11':12},currency:'INR',year:2026};
 const files=backupFiles(s,'2026-11-07T00:00:00Z');
 assert.ok(files['transactions.csv'].includes('Coffee'));assert.ok(files['noSpendTargets.csv'].includes('2026-11'));assert.deepEqual(JSON.parse(files['full-backup.json']).transactions,s.transactions);
 const tmp=new URL('./.test-export.zip',import.meta.url).pathname; const zip=makeZip(files);assert.ok(zip.size>100);
 return zip.arrayBuffer().then(buf=>{writeFileSync(tmp,Buffer.from(buf));try{const check=execFileSync('unzip',['-t',tmp],{encoding:'utf8'});assert.match(check,/No errors detected/);}finally{unlinkSync(tmp)}});
});
