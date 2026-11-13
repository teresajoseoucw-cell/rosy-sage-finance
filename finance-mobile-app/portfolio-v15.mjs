// Rosy Sage V15 — actual portfolio ledger (distinct from V14 forecast scenarios).
// Currency is INR; prices are deliberately manual and explicitly timestamped.
export const PORTFOLIO_COLLECTIONS=['portfolioHoldings','portfolioTrades','portfolioSips','portfolioSnapshots'];
export const PORTFOLIO_OWNERS=['Cherry','Chinju'];
export const ownerOf=h=>PORTFOLIO_OWNERS.includes(h?.owner)?h.owner:'Unassigned';
export const money=n=>Math.round((Number(n)||0)*100);
export const rupees=p=>p/100;
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
const copy=x=>JSON.parse(JSON.stringify(x));
export const dateOK=d=>/^\d{4}-(0[1-9]|1[0-2])-([0-2]\d|3[01])$/.test(d||'')&&(!Number.isNaN(Date.parse(d+'T00:00:00Z'))&&new Date(d+'T00:00:00Z').toISOString().slice(0,10)===d);
function validNumber(x){return Number.isFinite(Number(x))&&String(x).trim()!=='';}
export function validateHolding(h,holdings=[]){
 if(!h.id||!String(h.name||'').trim())throw Error('Investment name is required.');
 if(!PORTFOLIO_OWNERS.includes(h.owner))throw Error('Choose Cherry or Chinju as the investment owner.');
 if(!['Stock','Mutual Fund'].includes(h.assetType))throw Error('Select Stock or Mutual Fund.');
 if(!validNumber(h.price)||Number(h.price)<0)throw Error('Enter a valid latest price / NAV (zero is allowed if unknown).');
 if(h.priceDate&&!dateOK(h.priceDate))throw Error('Invalid price date.');
 if(holdings.some(v=>v.id!==h.id&&h.isin&&v.isin&&v.isin.toUpperCase()===h.isin.toUpperCase()&&String(v.platform||'').toLowerCase()===String(h.platform||'').toLowerCase()&&ownerOf(v)===ownerOf(h)))throw Error('This ISIN and platform already exist. Edit the existing holding.');
 return h;
}
export function validateTrade(t,holdings,trades=[]){
 if(!t.id||!holdings.some(h=>h.id===t.holdingId))throw Error('Choose an existing holding.');
 if(!dateOK(t.date))throw Error('Choose a valid trade date.');
 if(!['BUY','SELL','DIVIDEND'].includes(t.kind))throw Error('Select Buy, Sell or Dividend.');
 if(!validNumber(t.amount)||Number(t.amount)<=0)throw Error('Enter an amount greater than zero.');
 if(!validNumber(t.fees)||Number(t.fees)<0)throw Error('Fees cannot be negative.');
 if(t.kind!=='DIVIDEND'&&(!validNumber(t.units)||Number(t.units)<=0))throw Error('Units must be greater than zero.');
 if(t.kind==='DIVIDEND'&&Number(t.units)!==0)throw Error('Dividends do not change units.');
 if(t.kind!=='BUY'&&money(t.fees)>=money(t.amount))throw Error('Fees must be less than sale proceeds.');
 if(t.ref&&trades.some(x=>x.id!==t.id&&x.ref===t.ref))throw Error('This transaction reference already exists.');
 const all=[...trades.filter(x=>x.id!==t.id),t].filter(x=>x.holdingId===t.holdingId).sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)));
 let units=0;
 for(const x of all){if(x.kind==='BUY')units+=Number(x.units);else if(x.kind==='SELL')units-=Number(x.units);if(units< -1e-7)throw Error('Sale exceeds units held on '+x.date+'. Add earlier purchases before recording the sale.');}
 return t;
}
export function holdingLedger(holding,trades){
 const ordered=trades.filter(t=>t.holdingId===holding.id).sort((a,b)=>a.date.localeCompare(b.date)||String(a.id).localeCompare(String(b.id)));
 const lots=[];let realized=0,dividends=0,totalBought=0,totalSold=0,fees=0;
 for(const t of ordered){const gross=money(t.amount),cost=money(t.fees);
  if(t.kind==='BUY'){lots.push({units:Number(t.units),cost:gross+cost});totalBought+=gross+cost;fees+=cost;}
  else if(t.kind==='SELL'){let remaining=Number(t.units),basis=0;for(const lot of lots){if(remaining<=1e-9)break;const take=Math.min(remaining,lot.units);if(take<=0)continue;const deducted=Math.round(lot.cost*(take/lot.units));basis+=deducted;lot.units-=take;lot.cost-=deducted;remaining-=take;}if(remaining>1e-6)throw Error('Invalid sale quantity for '+holding.name);realized+=(gross-cost-basis);totalSold+=gross-cost;fees+=cost;}
  else if(t.kind==='DIVIDEND')dividends+=gross-cost;
 }
 const units=lots.reduce((v,l)=>v+l.units,0),basis=lots.reduce((v,l)=>v+l.cost,0),price=Number(holding.price)||0,value=Math.round(units*price*100);
 return {holding,units:round(units*1e6)/1e6,cost:basis,value,price,unrealized:value-basis,realized,dividends,totalBought,totalSold,fees,trades:ordered,priceDate:holding.priceDate||null,stale:!holding.priceDate||((Date.now()-new Date(holding.priceDate+'T00:00:00Z').getTime())>8*864e5)};
}
export function xirr(flows){
 const rows=flows.filter(x=>Number.isFinite(x.amount)&&dateOK(x.date));if(rows.length<2||!rows.some(x=>x.amount<0)||!rows.some(x=>x.amount>0))return null;
 const start=Math.min(...rows.map(x=>Date.parse(x.date+'T00:00:00Z')));
 const fn=r=>rows.reduce((s,x)=>s+x.amount/Math.pow(1+r,(Date.parse(x.date+'T00:00:00Z')-start)/86400000/365.25),0);
 let low=-0.9999,high=1;let fLow=fn(low);let fHigh=fn(high);let n=0;while(fLow*fHigh>0&&n++<35&&high<1e9){high*=2;fHigh=fn(high)}if(fLow*fHigh>0)return null;
 for(let i=0;i<175;i++){let mid=(low+high)/2,f=fn(mid);if(Math.abs(f)<.00001)return mid;if(fLow*f>0){low=mid;fLow=f;}else{high=mid;}}return (low+high)/2;
}
export function portfolioSummary(db,asOf=new Date().toISOString().slice(0,10),owner='all'){
 const selected=(db.portfolioHoldings||[]).filter(h=>owner==='all'||ownerOf(h)===owner);const selectedIds=new Set(selected.map(h=>h.id));
 const holdings=selected.map(h=>holdingLedger(h,(db.portfolioTrades||[]).filter(x=>x.date<=asOf)));
 const trades=(db.portfolioTrades||[]).filter(t=>t.date<=asOf&&selectedIds.has(t.holdingId));
 let invested=0,value=0,unrealized=0,realized=0,dividends=0,fees=0;const allocation={Stock:0,'Mutual Fund':0};
 for(const h of holdings){invested+=h.cost;value+=h.value;unrealized+=h.unrealized;realized+=h.realized;dividends+=h.dividends;fees+=h.fees;allocation[h.holding.assetType]+=h.value;}
 const flows=[];for(const t of trades){let net=money(t.amount),charge=money(t.fees);flows.push({date:t.date,amount:t.kind==='BUY'?-(net+charge):t.kind==='SELL'?net-charge:net-charge});}
 // Current valuation is the terminal inflow; XIRR includes realized sale/dividend cash flows.
 if(value>0)flows.push({date:asOf,amount:value});
 const validXirr=trades.some(x=>x.kind==='BUY')&&flows.length>1?xirr(flows):null;
 return {holdings,trades,invested,value,unrealized,realized,dividends,fees,allocation,xirr:validXirr,unpriced:holdings.filter(h=>h.units>0&&!h.price).length,stale:holdings.filter(h=>h.units>0&&h.stale).length,allocationTotal:value};
}
// Current position breakdown: unrealized return on remaining FIFO cost basis, not a cash-flow/XIRR return.
// Values are in paise (same units as holdingLedger). Only positive-unit holdings contribute.
export function portfolioAssetPositions(summary){
 const result={Stock:{value:0,cost:0,holdings:0,unpriced:0},'Mutual Fund':{value:0,cost:0,holdings:0,unpriced:0}};
 for(const h of summary.holdings||[]){
  if(!(h.units>1e-8)||!result[h.holding.assetType])continue;
  const p=result[h.holding.assetType];p.holdings++;p.value+=h.value;p.cost+=h.cost;
  if(!(Number(h.price)>0))p.unpriced++;
 }
 for(const p of Object.values(result)){
  p.gain=p.value-p.cost;
  p.returnPct=p.cost>0&&p.unpriced===0?p.gain/p.cost*100:null;
 }
 return result;
}
export function linkedCashEntry(trade,holding){
 if(!trade.bankAccountId)return null;
 const amount=trade.kind==='BUY'?round(Number(trade.amount)+Number(trade.fees||0)):trade.kind==='SELL'?round(Number(trade.amount)-Number(trade.fees||0)):round(Number(trade.amount)-Number(trade.fees||0));
 return {id:'portfolio-bank-'+trade.id,date:trade.date,type:trade.kind==='DIVIDEND'?'Income':'Transfer',category:trade.kind==='DIVIDEND'?'Income':'Transfer',subcategory:trade.kind==='DIVIDEND'?'Investment dividends':'Investment cash movement',amount,from:trade.kind==='BUY'?trade.bankAccountId:'',to:trade.kind==='BUY'?'':trade.bankAccountId,distribution:'',note:`${trade.kind} · ${holding.name} · auto-linked from Investments`,portfolioTradeId:trade.id};
}
export function reconcileCash(db){
 const tr=new Map((db.portfolioTrades||[]).map(x=>[x.id,x]));const holdings=new Map((db.portfolioHoldings||[]).map(x=>[x.id,x]));
 const nonLinked=(db.transactions||[]).filter(x=>!x.portfolioTradeId);
 const linked=(db.portfolioTrades||[]).map(t=>linkedCashEntry(t,holdings.get(t.holdingId)||{name:'Unknown'})).filter(Boolean);
 return {...db,transactions:[...nonLinked,...linked]};
}
export function duplicateTrade(t,trades){
 if(t.ref)return trades.some(x=>x.ref&&x.ref===t.ref);
 return trades.some(x=>x.holdingId===t.holdingId&&x.date===t.date&&x.kind===t.kind&&Math.abs(Number(x.units)-Number(t.units))<1e-7&&money(x.amount)===money(t.amount));
}
// RFC4180-style comma-separated records with quoted commas, escaped quotes and embedded newlines.
export function csvRecords(str){let rows=[],row=[],field='',quoted=false;for(let i=0;i<str.length;i++){let c=str[i];if(c==='"'){if(quoted&&str[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&str[i+1]==='\n')i++;row.push(field);if(row.some(s=>s.trim()))rows.push(row);row=[];field='';}else field+=c;}if(quoted)throw Error('Invalid CSV: unclosed quotation mark.');row.push(field);if(row.some(s=>s.trim()))rows.push(row);return rows;}
// One-time opening holdings import. Atomic and owner-scoped; it never debits a bank.
// Source CSV must represent current holdings AS OF a single valuation date.
export function parseOpeningPortfolioCsv(csv, existingHoldings=[], existingSnapshots=[], selectedOwner=''){
 if(!PORTFOLIO_OWNERS.includes(selectedOwner))throw Error('Choose Cherry or Chinju before importing opening holdings.');
 const rows=csvRecords(String(csv||'').replace(/^\uFEFF/,''));
 if(rows.length<2)throw Error('Opening CSV contains no holdings.');
 const hd=rows[0].map(h=>String(h).trim().toLowerCase());
 const required=['owner','asset_type','investment_name','isin','opening_as_of','opening_units','opening_cost_inr','latest_price_or_nav','price_as_of','reported_market_value'];
 for(const col of required)if(!hd.includes(col))throw Error('Missing initial holdings column: '+col);
 const field=(r,name)=>String(r[hd.indexOf(name)]??'').trim();
 const errors=[],holdings=[],trades=[];let date='',reported=0,stockValue=0,fundValue=0;
 if(existingHoldings.some(h=>ownerOf(h)===selectedOwner))errors.push(selectedOwner+' already has holdings. Opening import is one-time only; do not duplicate or overwrite existing holdings.');
 const seen=new Set();
 for(let i=1;i<rows.length;i++)try{
  const r=rows[i],line=i+1,owner=field(r,'owner'),type=field(r,'asset_type'),isin=field(r,'isin').toUpperCase(),name=field(r,'investment_name');
  const asOf=field(r,'opening_as_of'),priceDate=field(r,'price_as_of'),qty=Number(field(r,'opening_units')),cost=Number(field(r,'opening_cost_inr')),price=Number(field(r,'latest_price_or_nav')),value=Number(field(r,'reported_market_value'));
  if(owner!==selectedOwner)throw Error('Owner is '+owner+'; selected owner is '+selectedOwner+'.');
  if(!['Stock','Mutual Fund'].includes(type))throw Error('Asset type must be Stock or Mutual Fund.');
  if(!name||!isin)throw Error('Name and ISIN are required.');
  if(seen.has(isin))throw Error('Duplicate ISIN in the opening CSV: '+isin);
  if(!dateOK(asOf)||!dateOK(priceDate)||asOf!==priceDate)throw Error('Use the same valid opening and valuation date for every position.');
  if(!date)date=asOf; else if(date!==asOf)throw Error('All opening entries must share one date.');
  if(!Number.isFinite(qty)||qty<=0||!Number.isFinite(cost)||cost<0||!Number.isFinite(price)||price<0||!Number.isFinite(value)||value<0)throw Error('Invalid quantity, cost, price or market value.');
  const calculated=qty*price;
  if(Math.abs(calculated-value)>Math.max(1,value*0.0001))throw Error('Market value differs substantially from units × price. Check this line.');
  const safe=isin.replace(/[^A-Z0-9]/g,'').slice(0,36);
  const id='opening-'+owner.toLowerCase()+'-'+safe;
  const h={id,owner,assetType:type,name,symbol:field(r,'symbol')||isin,isin,platform:field(r,'platform')||'Zerodha',price,priceDate,source:'zerodha-opening-csv'};
  const tr={id:'opening-trade-'+owner.toLowerCase()+'-'+safe,holdingId:id,kind:'BUY',date:asOf,units:qty,amount:Math.round(cost*100)/100,fees:0,ref:'opening:'+owner+':'+isin+':'+asOf,bankAccountId:'',source:'opening-position-not-bank-debit'};
  // For a zero-cost holding the ledger requires a positive amount; flag rather than fabricating cost.
  if(!(tr.amount>0))throw Error('Opening cost must be positive. Check Zerodha cost for this security.');
  validateHolding(h,[...existingHoldings,...holdings]);validateTrade(tr,[...existingHoldings,...holdings,h],[...trades]);
  holdings.push(h);trades.push(tr);seen.add(isin);
  reported+=value;if(type==='Stock')stockValue+=value;else fundValue+=value;
 }catch(e){errors.push('Row '+(i+1)+': '+e.message);}
 if(date&&existingSnapshots.some(s=>s.owner===selectedOwner&&s.date===date))errors.push('A '+selectedOwner+' valuation already exists on '+date+'.');
 return {owner:selectedOwner,date,holdings,trades,reported:Math.round(reported*100)/100,stockValue:Math.round(stockValue*100)/100,fundValue:Math.round(fundValue*100)/100,errors,source:'one-time-zerodha-holdings'};
}
export function parsePortfolioCsv(csv,holdings,existing=[]){
 const rows=csvRecords(csv.replace(/^\uFEFF/,''));if(!rows.length)throw Error('CSV is empty.');const header=rows[0].map(s=>s.trim().toLowerCase());
 const required=['date','holding_id','kind','units','amount'];for(const h of required)if(!header.includes(h))throw Error('Missing required CSV column: '+h);
 const value=(row,key)=>row[header.indexOf(key)]?.trim()||'';
 const parsed=[],errors=[];let skipped=0;
 for(const [i,row] of rows.slice(1).entries())try{
  const t={id:'import-'+(i+2)+'-'+Math.random().toString(36).slice(2),date:value(row,'date'),holdingId:value(row,'holding_id'),kind:value(row,'kind').toUpperCase(),units:Number(value(row,'units')||0),amount:Number(value(row,'amount')),fees:Number(value(row,'fees')||0),ref:value(row,'ref'),bankAccountId:''};
  if(duplicateTrade(t,[...existing,...parsed])){skipped++;continue;}validateTrade(t,holdings,[...existing,...parsed]);parsed.push(t);
 }catch(e){errors.push(`Row ${i+2}: ${e.message}`)}
 return {parsed,errors,skipped};
}
export function dateHistory(db,owner='all'){
 const snapshots=(db.portfolioSnapshots||[]).filter(s=>s.date&&Number.isFinite(Number(s.value)));
 if(owner!=='all')return snapshots.filter(s=>(s.owner||'Unassigned')===owner).slice().sort((a,b)=>a.date.localeCompare(b.date));
 const byDate=new Map();for(const s of snapshots){let entry=byDate.get(s.date)||{date:s.date,owners:new Set(),total:0};const who=s.owner||'Unassigned';if(!entry.owners.has(who)){entry.total+=Number(s.value);entry.owners.add(who)}byDate.set(s.date,entry)}
 // Never present a partial monthly household snapshot as a full household value.
 const required=new Set((db.portfolioHoldings||[]).map(ownerOf));
 return [...byDate.values()].filter(x=>[...required].every(o=>x.owners.has(o))).map(x=>({date:x.date,value:x.total})).sort((a,b)=>a.date.localeCompare(b.date));
}
// Standard monthly broker/AMC holdings CSV. Source quantities are compared to the transaction ledger,
// not silently applied as BUY/SELL records. Each import is a valuation snapshot only.
export function parseMonthlyPortfolioCsv(csv,holdings,trades,owner){
 if(!PORTFOLIO_OWNERS.includes(owner))throw Error('Select Cherry or Chinju before importing.');
 const rows=csvRecords(csv.replace(/^\uFEFF/,''));if(!rows.length)throw Error('CSV is empty.');
 const headers=rows[0].map(x=>x.trim().toLowerCase());const required=['as_of','holding_id','units','price','market_value'];
 for(const col of required)if(!headers.includes(col))throw Error('Missing monthly holdings column: '+col+'. Use the holdings CSV template.');
 const get=(row,key)=>row[headers.indexOf(key)]?.trim()||'';
 const entries=[],errors=[],warnings=[],seen=new Set();let date=null;
 for(const [i,row] of rows.slice(1).entries())try{
  const d=get(row,'as_of'),id=get(row,'holding_id'),h=holdings.find(x=>x.id===id);
  if(!dateOK(d))throw Error('Invalid as_of date.');if(date&&date!==d)throw Error('One file must contain one valuation date.');date=d;
  if(!h)throw Error('Unknown holding_id '+id+'. Create and assign the holding first.');
  if(ownerOf(h)!==owner)throw Error(h.name+' belongs to '+ownerOf(h)+', not '+owner+'.');
  if(seen.has(id))throw Error('Duplicate holding_id '+id+'.');seen.add(id);
  const units=Number(get(row,'units')),price=Number(get(row,'price')),value=Number(get(row,'market_value'));
  if(![units,price,value].every(Number.isFinite)||units<0||price<0||value<0||!get(row,'units')||!get(row,'price')||!get(row,'market_value'))throw Error('Units, price and market_value must be nonnegative numbers.');
  const calculated=units*price;if(Math.abs(calculated-value)>Math.max(1,calculated*.005))warnings.push(`Row ${i+2}: market value differs from units × price (₹${value.toFixed(2)} vs ₹${calculated.toFixed(2)}).`);
  const ledger=holdingLedger(h,trades.filter(t=>t.date<=d));if(Math.abs(ledger.units-units)>1e-5)warnings.push(`Row ${i+2}: ${h.name} units differ: CSV ${units}, ledger ${ledger.units}. Purchases/redemptions may need recording.`);
  entries.push({holdingId:id,units,price,value,asOf:d});
 }catch(e){errors.push(`Row ${i+2}: ${e.message}`)}
 const missing=holdings.filter(h=>ownerOf(h)===owner&&!seen.has(h.id)&&holdingLedger(h,trades.filter(t=>t.date<=(date||'9999-12-31'))).units>0);
 for(const h of missing)warnings.push(`${h.name} is missing from this monthly file. Confirm it has not been omitted or transferred.`);
 return {kind:'monthly',owner,date,entries,errors,warnings,missing:missing.map(h=>h.id),total:entries.reduce((s,x)=>s+x.value,0)};
}

// Supported Zerodha Console Tradebook CSV variants. Import is owner-scoped and review-first.
// Securities absent from the opening holdings master are flagged, never invented.
function normalizeTradeDate(raw){
 const value=String(raw||'').trim();
 if(/^\d{4}-\d{2}-\d{2}$/.test(value))return dateOK(value)?value:'';
 const m=value.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})(?:\s.*)?$/);
 if(m){const d=`${m[3]}-${m[2]}-${m[1]}`;return dateOK(d)?d:'';}
 const y=value.match(/^(\d{4})[\/-](\d{2})[\/-](\d{2})(?:[ T].*)?$/);
 if(y){const d=`${y[1]}-${y[2]}-${y[3]}`;return dateOK(d)?d:'';}
 return '';
}
export function parseZerodhaTradebook(csv,holdings,existing,owner){
 if(!PORTFOLIO_OWNERS.includes(owner))throw Error('Select Cherry or Chinju before importing the Zerodha tradebook.');
 const rows=csvRecords(String(csv||'').replace(/^\uFEFF/,''));if(!rows.length)throw Error('The tradebook CSV is empty.');
 const normalize=h=>String(h||'').toLowerCase().trim().replace(/[^a-z0-9]/g,'');
 const h=rows[0].map(normalize);
 const pick=(...names)=>names.map(n=>h.indexOf(normalize(n))).find(n=>n>=0)??-1;
 const col={symbol:pick('symbol','tradingsymbol','scrip','scheme'),isin:pick('isin'),date:pick('trade_date','trade date','date'),kind:pick('trade_type','trade type','transaction type','type'),quantity:pick('quantity','qty','units'),price:pick('price','trade price','nav'),tradeId:pick('trade_id','trade id'),orderId:pick('order_id','order id'),segment:pick('segment')};
 const required=['date','kind','quantity','price'];
 for(const k of required)if(col[k]<0)throw Error('Zerodha tradebook missing '+k+'. Export CSV from Console → Reports → Tradebook, not P&L.');
 if(col.symbol<0&&col.isin<0)throw Error('Tradebook needs Symbol or ISIN for security matching.');
 const cell=(r,k)=>col[k]<0?'':String(r[col[k]]??'').trim();
 const number=x=>Number(String(x).replace(/[₹,\s]/g,''));
 const parsed=[],errors=[],warnings=[];let skipped=0;
 for(const [i,row] of rows.slice(1).entries()){
  const n=i+2;
  try{
   const segment=cell(row,'segment').toUpperCase();
   if(segment&&(/^(NFO|FUT|OPT|F\&O|CDS|MCX|CURRENCY|COMMODITY)$/.test(segment)||segment.includes('FUT')||segment.includes('OPT'))){errors.push(`Row ${n}: unsupported derivatives segment ${segment}. Only delivery equity and mutual funds are supported.`);continue;}
   const date=normalizeTradeDate(cell(row,'date'));if(!date)throw Error('Invalid trade date.');
   const rawKind=cell(row,'kind').toUpperCase();
   const kind=/^(BUY|B|PURCHASE|ALLOTMENT|SUBSCRIPTION)$/.test(rawKind)?'BUY':/^(SELL|S|REDEMPTION|REDEEM)$/.test(rawKind)?'SELL':null;
   if(!kind)throw Error('Unrecognized buy/sell action: '+rawKind);
   const units=number(cell(row,'quantity')),price=number(cell(row,'price'));
   if(!Number.isFinite(units)||units<=0||!Number.isFinite(price)||price<=0)throw Error('Invalid quantity or price.');
   const sym=cell(row,'symbol').toUpperCase(),isin=cell(row,'isin').toUpperCase();
   const pool=holdings.filter(x=>ownerOf(x)===owner);
   const candidates=pool.filter(x=>(isin&&String(x.isin||'').toUpperCase()===isin)||(sym&&String(x.symbol||'').toUpperCase()===sym));
   if(candidates.length!==1)throw Error(candidates.length?'Ambiguous holding match':'No opening holding match for '+(sym||isin)+'. Add/map the holding first.');
   const holding=candidates[0];
   const tradeId=cell(row,'tradeId'),orderId=cell(row,'orderId');
   const ref=tradeId?`zerodha:${owner}:${tradeId}`:orderId?`zerodha:${owner}:${orderId}:${date}:${kind}:${units}:${price}`:'';
   const t={id:`zerodha-${owner.toLowerCase()}-${date}-${n}-${Math.random().toString(36).slice(2)}`,date,holdingId:holding.id,kind,units,amount:Math.round(units*price*100)/100,fees:0,ref,bankAccountId:''};
   if(duplicateTrade(t,[...existing,...parsed])){skipped++;continue;}
   validateTrade(t,holdings,[...existing,...parsed]);parsed.push(t);
   if(!tradeId)warnings.push(`Row ${n}: no trade ID; deduplication uses trade details${orderId?' and order ID':''}.`);
  }catch(e){errors.push(`Row ${n}: ${e.message}`);}
 }
 return {parsed,errors,warnings,skipped,owner,source:'zerodha-console-tradebook'};
}
