import {timingSafeEqual} from 'node:crypto';
import {parse} from '../../finance-mobile-app/sms-v16.mjs';
import {requestGoogle} from './sync.mjs';
const respond=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
function secureEqual(a,b){const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y);}
export default async function handler(request){
 if(request.method!=='POST')return respond({error:'POST required'},405);
 const secret=process.env.ROSY_SMS_INGEST_KEY||'';
 if(secret.length<32||!secureEqual(request.headers.get('x-rosy-sms-key'),secret))return respond({error:'Unauthorized'},401);
 if(!process.env.GOOGLE_SPREADSHEET_ID)return respond({error:'SMS integration not configured'},503);
 try{
  const body=await request.text();if(body.length>2200)return respond({error:'Message too large'},413);
  const data=JSON.parse(body);
  if(typeof data!=='object'||Array.isArray(data)||typeof data.sender!=='string'||typeof data.text!=='string')return respond({error:'Invalid payload'},400);
  const item=parse(data.text,data.sender,data.receivedAt||new Date().toISOString());
  const eventKey='item/smsInbox/'+encodeURIComponent(item.id);
  // The journal is append-only. Check for an existing ID before writing so
  // retries never reset a previously approved suggestion to Pending.
  const got=await requestGoogle(encodeURIComponent('Events!A2:E'));
  if((got.values||[]).some(row=>row[3]===eventKey))return respond({ok:true,duplicate:true});
  const op={id:'intake-'+item.id,at:new Date().toISOString(),device:'apple-shortcuts',key:eventKey,value:item,deleted:false};
  const row=[op.id,op.at,op.device,op.key,JSON.stringify({value:item,deleted:false})];
  await requestGoogle(encodeURIComponent('Events!A:E')+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS','POST',{majorDimension:'ROWS',values:[row]});
  return respond({ok:true,queuedForReview:true},202);
 }catch(err){
  if(/OTP|Verification|No supported INR|Invalid SMS|Failed\/reversed|sender|message|required|Invalid received|Invalid payload/.test(err.message))return respond({error:err.message},422);
  console.error('SMS intake error',err.message);return respond({error:'SMS intake unavailable'},503);
 }
}
export const config={path:'/api/sms-intake'};
