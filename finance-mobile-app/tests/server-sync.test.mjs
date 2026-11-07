import test from 'node:test';import assert from 'node:assert/strict';import {generateKeyPairSync} from 'node:crypto';import handler from '../../netlify/functions/sync.mjs';
const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=Buffer.from(JSON.stringify({client_email:'rosy@example.iam.gserviceaccount.com',private_key:privateKey.export({type:'pkcs8',format:'pem'})})).toString('base64');
process.env.GOOGLE_SPREADSHEET_ID='sheet123';process.env.ROSY_SYNC_SECRET='z'.repeat(50);
let rows=[];let hits=0;
const originalFetch=globalThis.fetch;
globalThis.fetch=async(url,opts={})=>{hits++;url=String(url);if(url.includes('oauth2.googleapis.com'))return new Response(JSON.stringify({access_token:'test-token',expires_in:3600}),{status:200});
 if(url.includes(':append')){const data=JSON.parse(opts.body);rows.push(...data.values);return Response.json({updates:{updatedRows:data.values.length}})}
 if(url.includes('sheets.googleapis.com')){const m=decodeURIComponent(url).match(/A(\d+):E/);const start=Number(m?.[1]||2);return Response.json({values:rows.slice(start-2)});}
 throw Error('Unexpected request '+url)};
const req=(method,key,body)=>new Request('https://example.netlify.app/api/sync',{method,headers:{'x-rosy-sync-key':key,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
test('backend rejects missing key without calling Google',async()=>{const old=hits;const r=await handler(req('GET','bad'));assert.equal(r.status,401);assert.equal(hits,old)});
test('backend appends and returns independent events',async()=>{const e1={id:'one',key:'item/transactions/abc',device:'phone-1',at:'2026-11-07T10:00:00Z',value:{id:'abc',amount:20}};const e2={id:'two',key:'item/transactions/def',device:'phone-2',at:'2026-11-07T10:01:00Z',value:{id:'def',amount:30}};let r=await handler(req('POST','z'.repeat(50),{events:[e1,e2]}));assert.equal(r.status,200);r=await handler(req('GET','z'.repeat(50)));let data=await r.json();assert.equal(data.events.length,2);assert.equal(data.events[1].value.amount,30);});
test('backend supports incremental reads',async()=>{let r=await handler(req('GET','z'.repeat(50)));assert.equal((await r.json()).cursor,2);r=await handler(new Request('https://example.netlify.app/api/sync?since=1',{headers:{'x-rosy-sync-key':'z'.repeat(50)}}));let data=await r.json();assert.equal(data.events.length,1);assert.equal(data.events[0].id,'two')});
test('backend rejects unexpected operation keys',async()=>{const r=await handler(req('POST','z'.repeat(50),{events:[{id:'invalid',key:'__proto__/evil',device:'one',at:'now',value:3}]}));assert.equal(r.status,400);assert.equal(rows.length,2);});
