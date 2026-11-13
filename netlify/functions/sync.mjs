import {createSign,timingSafeEqual} from 'node:crypto';
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
const equal=(a,b)=>{const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y)};
const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
const COLLECTIONS=new Set(['transactions','recurring','accounts','budgets','funds','contributions','debts','assets','investments','portfolioHoldings','portfolioTrades','portfolioSips','portfolioSnapshots','categoryBudgets','paychecks','netWorthSnapshots','taxonomy']);
const WHOLE=new Set(['skipped','categories','spenders']);const MAPS=new Set(['allocationTargets','noSpendTargets']);const SETTINGS=new Set(['currency','year','debtStrategy','extraDebt','migration']);
function validKey(key){if(key==='__bootstrap')return true;if(typeof key!=='string'||key.length>250)return false;const p=key.split('/');if(p[0]==='item'&&p.length===3)return COLLECTIONS.has(p[1])&&p[2].length>0;if(p[0]==='whole'&&p.length===2)return WHOLE.has(p[1]);if(p[0]==='map'&&p.length===3)return MAPS.has(p[1])&&p[2].length>0;if(p[0]==='setting'&&p.length===2)return SETTINGS.has(p[1]);return false;}
let cachedToken='',expires=0;
async function googleToken(){if(cachedToken&&Date.now()+60000<expires)return cachedToken;
 const raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;if(!raw)throw Error('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 is missing');let service=JSON.parse(Buffer.from(raw,'base64').toString('utf8'));
 if(!service.client_email||!service.private_key)throw Error('Invalid service account JSON');
 const now=Math.floor(Date.now()/1000);const header=encode({alg:'RS256',typ:'JWT'}),payload=encode({iss:service.client_email,scope:'https://www.googleapis.com/auth/spreadsheets',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3500});
 const body=header+'.'+payload;const sign=createSign('RSA-SHA256');sign.update(body);sign.end();const assertion=body+'.'+sign.sign(service.private_key,'base64url');
 const res=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion})});const json=await res.json();if(!res.ok)throw Error('Google authorization failed: '+(json.error_description||json.error||res.status));cachedToken=json.access_token;expires=Date.now()+(json.expires_in||3500)*1000;return cachedToken;
}
async function requestGoogle(path,method='GET',data=null){const token=await googleToken(),base=`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(process.env.GOOGLE_SPREADSHEET_ID||'')}/values/`;const res=await fetch(base+path,{method,headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},body:data?JSON.stringify(data):undefined});const json=await res.json();if(!res.ok)throw Error('Google Sheets request failed: '+(json.error?.message||res.status));return json;}
const sheet='Events';
function rowToOp(row){if(!row||row.length<5)return null;try{const p=JSON.parse(row[4]);const op={id:String(row[0]),at:String(row[1]),device:String(row[2]),key:String(row[3]),value:p.value,deleted:!!p.deleted};return validKey(op.key)?op:null;}catch{return null}}
export default async function handler(request){
 try{
  const secret=process.env.ROSY_SYNC_SECRET||'';if(secret.length<32||!equal(request.headers.get('x-rosy-sync-key'),secret))return reply({error:'Invalid sync key or server configuration'},401);
  if(!process.env.GOOGLE_SPREADSHEET_ID)return reply({error:'Missing GOOGLE_SPREADSHEET_ID'},503);
  if(request.method==='GET'){
   const url=new URL(request.url),since=Math.max(0,Math.min(10000000,Number(url.searchParams.get('since')||0)||0));
   const range=encodeURIComponent(`${sheet}!A${since+2}:E`);const got=await requestGoogle(range);const rows=got.values||[];const events=rows.map(rowToOp).filter(Boolean);
   return reply({events,cursor:since+rows.length,scanned:rows.length});
  }
  if(request.method==='POST'){
   const body=await request.text();if(body.length>4_000_000)return reply({error:'Batch too large'},413);
   const parsed=JSON.parse(body),events=parsed.events;
   if(!Array.isArray(events)||events.length<1||events.length>300)return reply({error:'Invalid event batch'},400);
   for(const op of events){if(typeof op.id!=='string'||op.id.length>120||!validKey(op.key)||typeof op.device!=='string'||op.device.length>120||typeof op.at!=='string'||JSON.stringify(op.value??null).length>2_000_000)return reply({error:'Invalid operation'},400);}
   const rows=events.map(op=>[op.id,op.at,op.device,op.key,JSON.stringify({value:op.value,deleted:!!op.deleted})]);
   const range=encodeURIComponent(`${sheet}!A:E`);await requestGoogle(`${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,'POST',{majorDimension:'ROWS',values:rows});
   return reply({ok:true,appended:events.length});
  }
  return reply({error:'Method not supported'},405);
 }catch(err){console.error('Rosy sync error:',err.message);return reply({error:'Sync service failed. Check Netlify logs and Google Sheet permissions.'},502)}
}
export const config={path:'/api/sync'};
