import {diffState,applyOp,replay} from './sync-core.mjs';
const KEY='rosy-sage-cloud-sync-v1',DEVICE='rosy-sage-cloud-device-v1',QUEUE='rosy-sage-sync-queue-v1';
const clone=x=>JSON.parse(JSON.stringify(x));
const ID=()=>crypto.randomUUID();
export class SyncClient{
 constructor({getState,applyCloud,emptyState,onStatus}){
  this.getState=getState;this.applyCloud=applyCloud;this.emptyState=emptyState;this.onStatus=onStatus;
  this.device=localStorage.getItem(DEVICE)||ID();localStorage.setItem(DEVICE,this.device);
  this.secret=globalThis.__ROSY_PREVIEW__?'':(sessionStorage.getItem(KEY)||localStorage.getItem(KEY)||'');
  this.queue=JSON.parse(localStorage.getItem(QUEUE)||'[]');this.lastLocal=clone(getState());this.cursor=0;this.remote=null;this.started=false;this.busy=false;this.status='Not connected';
  this.timeout=null;
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&this.started)this.pullAndPush()});
  window.addEventListener('online',()=>{if(this.started)this.pullAndPush()});
  this.timer=setInterval(()=>{if(this.started&&navigator.onLine)this.pullAndPush()},60000);
  if(this.secret){this.started=true;queueMicrotask(()=>this.pullAndPush());}
 }
 report(t){this.status=t;this.onStatus(t)}
 setSecret(key,remember=true){if(globalThis.__ROSY_PREVIEW__)throw Error('Cloud synchronization is disabled in standalone previews.');if(key.length<32)throw Error('Enter the 32+ character sync key configured in Netlify.');this.secret=key.trim();if(remember){localStorage.setItem(KEY,this.secret);sessionStorage.removeItem(KEY)}else{sessionStorage.setItem(KEY,this.secret);localStorage.removeItem(KEY)}this.report('Sync key stored. Connect to cloud to load records.');}
 disconnect(){this.started=false;this.secret='';this.remote=null;this.cursor=0;localStorage.removeItem(KEY);sessionStorage.removeItem(KEY);this.report('Disconnected — local records retained');}
 async call(method,body=null,since=0){if(!this.secret)throw Error('Enter your sync key first');const response=await fetch('/api/sync'+(method==='GET'?`?since=${since}`:''),{method,headers:{'x-rosy-sync-key':this.secret,...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store'});let result=await response.json().catch(()=>({}));if(!response.ok)throw Error(result.error||`Sync API error ${response.status}`);return result;}
 persistQueue(){localStorage.setItem(QUEUE,JSON.stringify(this.queue));}
 changed(){const current=clone(this.getState());if(!this.started){this.lastLocal=current;return;}const ops=diffState(this.lastLocal,current,ID).map(op=>({...op,device:this.device}));this.lastLocal=current;if(!ops.length)return;this.queue.push(...ops);this.persistQueue();this.report(`${this.queue.length} change(s) waiting to sync`);clearTimeout(this.timeout);this.timeout=setTimeout(()=>this.pullAndPush(),1500);}
 async connectFromCloud(){if(this.busy)throw Error('Sync is already running');this.report('Checking cloud…');const result=await this.call('GET');
  if(!result.events.length){this.report('Cloud is empty. Use “Initialize cloud from this device” on the primary phone.');return {empty:true};}
  if(!confirm('Load Google Sheets data on this phone? Current local records will be replaced. Export a JSON backup first if needed.'))return {cancelled:true};
  this.remote=replay(this.emptyState(),result.events);this.cursor=result.cursor;this.queue=[];this.persistQueue();this.applyCloud(clone(this.remote));this.lastLocal=clone(this.getState());this.started=true;this.report(`Connected • ${this.cursor} cloud changes loaded`);return {ok:true};
 }
 async initializeCloud(){if(this.busy)throw Error('Sync is already running');const current=await this.call('GET');if(current.events.length)throw Error('Cloud already has data. Use “Load from cloud” instead to avoid duplicating records.');
  if(!confirm('Upload THIS phone’s complete local database as the cloud starting point? Do this only once.'))return;
  // Google Sheets cells have a ~50,000-character limit: never put a growing
  // database into one cell. Store a small baseline and record-level changes.
  const base=this.emptyState();const op={id:ID(),key:'__bootstrap',at:new Date().toISOString(),device:this.device,value:base,deleted:false};await this.call('POST',{events:[op]});
  const initialChanges=diffState(base,this.getState(),ID).map(change=>({...change,device:this.device}));
  this.remote=clone(base);this.lastLocal=clone(this.getState());this.cursor=0;this.queue=initialChanges;this.persistQueue();this.started=true;this.report(`${this.queue.length} records queued for first cloud upload`);await this.pullAndPush();
 }

 async pullAndPush(){if(!this.started||this.busy||!this.secret)return;this.busy=true;
 try{
  // First connection replays the complete journal; subsequent polls fetch only new rows.
  // Retried writes are reconciled against the new event IDs before resending.
  const previousCursor=this.remote?this.cursor:0;
  const pulled=await this.call('GET',null,previousCursor);
  this.remote=replay(this.remote||this.emptyState(),pulled.events);this.cursor=pulled.cursor;
  if(!this.cursor){this.report('Cloud empty — initialization required');this.started=false;return;}
  // Preserve offline local pending operations in memory; remote ops on other
  // records are merged, not overwritten by a complete device snapshot.
  let merged=replay(this.remote,this.queue);this.applyCloud(merged);this.lastLocal=clone(merged);
  if(this.queue.length){const ids=new Set(pulled.events.map(e=>e.id));this.queue=this.queue.filter(e=>!ids.has(e.id));this.persistQueue();}
  while(this.queue.length){const batch=this.queue.slice(0,100);await this.call('POST',{events:batch});this.queue.splice(0,batch.length);this.persistQueue();}
  if(this.cursor!==pulled.cursor||pulled.scanned){/* resume via next periodic poll */}
  this.report(`Synced • ${new Date().toLocaleTimeString()} • ${this.cursor} cloud changes`);
 }catch(error){this.report(`Offline / sync error: ${error.message} • ${this.queue.length} queued`)}finally{this.busy=false;}
 }
}
