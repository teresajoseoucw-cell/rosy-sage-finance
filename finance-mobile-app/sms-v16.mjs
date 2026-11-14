// Small, conservative parser: creates REVIEW suggestions only, never ledger entries.
// A fingerprint is deterministic across Shortcuts, the backend and both devices.
export function fingerprint(sender,body){
 const normalized=(String(sender||'').trim().toUpperCase()+'|'+String(body||'').trim().replace(/\s+/g,' ').toLowerCase());
 let h=0x811c9dc5;for(let i=0;i<normalized.length;i++){h^=normalized.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
 return 'sms-'+h.toString(16).padStart(8,'0')+'-'+normalized.length;
}
export function parse(body,sender='UNKNOWN',receivedAt=new Date().toISOString()){
 const text=String(body||'').trim(),from=String(sender||'').trim().slice(0,40);
 if(!text||text.length>1200||!from)throw Error('SMS sender and message are required.');
 if(/\b(otp|one.time.password|verification code|login code|authentication code|do not share|valid for \d+ min)\b/i.test(text))throw Error('Verification or OTP messages are not accepted.');
 if(/\b(failed|declined|unsuccessful|reversal|reversed|cancelled|not processed)\b/i.test(text))throw Error('Failed/reversed alerts must be reviewed outside automated capture.');
 const m=text.match(/(?:\b(?:INR|Rs\.?|₹)\s*[:.]?\s*)([0-9][0-9,]*(?:\.\d{1,2})?)/i);
 if(!m)throw Error('No supported INR transaction amount found.');
 const amount=Number(m[1].replaceAll(',',''));
 if(!Number.isFinite(amount)||amount<=0||amount>100000000)throw Error('Invalid SMS amount.');
 const received=new Date(receivedAt);if(Number.isNaN(received.getTime()))throw Error('Invalid received date.');
 const date=received.toISOString().slice(0,10);
 const ref=(text.match(/(?:UTR|RRN|UPI\s*ref(?:erence)?|txn\s*(?:id|ref)|transaction\s*(?:id|ref))\s*(?:no\.?|number)?\s*[:#-]?\s*([A-Z0-9]{6,30})/i)?.[1]||'').toUpperCase();
 const accountLast4=(text.match(/(?:a\/c|account|acct|card|xx|x{2,})\s*(?:no\.?|ending|\*|x|X|:|-|\s)*([0-9]{4})\b/i)?.[1]||'');
 const transfer=/\b(self.transfer|own account|credit card bill|card payment|bill payment received)\b/i.test(text);
 const credited=/\b(credited|credit received|deposited|received|refund)\b/i.test(text);
 const debited=/\b(debited|spent|paid|withdrawn|purchase|sent to|transferred)\b/i.test(text);
 const kind=transfer?'Transfer':credited&&!debited?'Income':debited&&!credited?'Expense':'Unknown';
 const merchant=(text.match(/(?:to|at|from)\s+([A-Za-z0-9 .&_-]{3,42})/i)?.[1]||from).trim().slice(0,55);
 return {id:fingerprint(from,text),sender:from,kind,amount,date,ref,accountLast4,merchant,status:'pending',receivedAt:received.toISOString(),source:'bank-sms-suggestion'};
}
export function likelyDuplicate(a,b){return a.id===b.id || !!(a.ref&&b.ref&&a.ref===b.ref) || (a.amount===b.amount&&a.accountLast4&&b.accountLast4&&a.accountLast4===b.accountLast4&&a.date===b.date&&a.kind===b.kind&&a.sender===b.sender);}
