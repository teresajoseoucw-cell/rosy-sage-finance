// Portable, dependency-free CSV export and ZIP packaging. No network calls.
export const DATASETS=['transactions','recurring','accounts','budgets','funds','contributions','debts','assets','investments','portfolioHoldings','portfolioTrades','portfolioSips','portfolioSnapshots','skipped','noSpendTargets','categories','taxonomy','spenders','categoryBudgets','paychecks','netWorthSnapshots','allocationTargets'];
const encoder=new TextEncoder();
export function csvEscape(value){
  const text=value==null?'':typeof value==='object'?JSON.stringify(value):String(value);
  // Protect spreadsheets from interpreting untrusted labels as executable formulas.
  const safe=/^[\s\uFEFF]*[=+@\-\t\r]/.test(text)&&!/^\s*-?\d+(\.\d+)?\s*$/.test(text)?"'"+text:text;
  return /[",\r\n]/.test(safe)?'"'+safe.replaceAll('"','""')+'"':safe;
}
export function datasetToCsv(name,value){
  if(Array.isArray(value)){
    const rows=value.map(x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{value:x});
    const keys=[...new Set(rows.flatMap(row=>Object.keys(row)))];
    if(!keys.length)return 'value\r\n';
    return [keys.map(csvEscape).join(','),...rows.map(row=>keys.map(k=>csvEscape(row[k])).join(','))].join('\r\n')+'\r\n';
  }
  if(value&&typeof value==='object')return ['key,value',...Object.entries(value).map(([k,v])=>csvEscape(k)+','+csvEscape(v))].join('\r\n')+'\r\n';
  return 'value\r\n'+csvEscape(value)+'\r\n';
}
const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(data){let crc=0xffffffff;for(const b of data)crc=crcTable[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
function fileDate(){// Stable ZIP timestamps; exports carry real timestamp in manifest.
 return {time:0,date:(46<<9)|(1<<5)|1}; // 2026-01-01
}
export function makeZip(files){
  const chunks=[],central=[];let offset=0;const {time,date}=fileDate();
  const u16=(v,at,a)=>a.setUint16(at,v,true),u32=(v,at,a)=>a.setUint32(at,v>>>0,true);
  for(const [name,content] of Object.entries(files)){
    const filename=encoder.encode(name),data=encoder.encode(content),crc=crc32(data);
    const head=new Uint8Array(30+filename.length),h=new DataView(head.buffer);
    u32(0x04034b50,0,h);u16(20,4,h);u16(0x0800,6,h);u16(0,8,h);u16(time,10,h);u16(date,12,h);
    u32(crc,14,h);u32(data.length,18,h);u32(data.length,22,h);u16(filename.length,26,h);u16(0,28,h);head.set(filename,30);
    chunks.push(head,data);
    const dir=new Uint8Array(46+filename.length),d=new DataView(dir.buffer);
    u32(0x02014b50,0,d);u16(20,4,d);u16(20,6,d);u16(0x0800,8,d);u16(0,10,d);
    u16(time,12,d);u16(date,14,d);u32(crc,16,d);u32(data.length,20,d);u32(data.length,24,d);
    u16(filename.length,28,d);u16(0,30,d);u16(0,32,d);u16(0,34,d);u16(0,36,d);u32(0,38,d);u32(offset,42,d);dir.set(filename,46);
    central.push(dir);offset+=head.length+data.length;
  }
  const dirOffset=offset,dirSize=central.reduce((sum,c)=>sum+c.length,0),end=new Uint8Array(22),e=new DataView(end.buffer);
  u32(0x06054b50,0,e);u16(0,4,e);u16(0,6,e);u16(central.length,8,e);u16(central.length,10,e);
  u32(dirSize,12,e);u32(dirOffset,16,e);u16(0,20,e);
  return new Blob([...chunks,...central,end],{type:'application/zip'});
}
export function backupFiles(state,exportedAt=new Date().toISOString()){
  const files={};for(const name of DATASETS)files[`${name}.csv`]=datasetToCsv(name,state[name]);
  files['settings.csv']=datasetToCsv('settings',Object.fromEntries(Object.entries(state).filter(([k])=>!DATASETS.includes(k)&&k!=='exportedAt')));
  files['README.txt']='Rosy Sage Finance backup - '+exportedAt+'\nCSV files are for spreadsheet review and archiving.\nUse full-backup.json for lossless import/restore.\nSome array/object values appear as JSON text inside CSV cells.\nKeep backups secure: exports are NOT encrypted.\n';
  files['full-backup.json']=JSON.stringify({...state,exportedAt},null,2);
  return files;
}
