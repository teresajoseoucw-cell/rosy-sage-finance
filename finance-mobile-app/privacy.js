/* Visual privacy mode. This is shoulder-surfing protection, not encryption. */
(function(){
 'use strict';
 const KEY='rosy-sage-privacy-hidden-v1';
 const MONEY=/([+\-−]?\s*(?:₹|Rs\.?|INR|\$|USD|€|EUR|£|GBP|AED)\s*[+\-−]?\s*\d[\d,]*(?:\.\d+)?|[+\-−]?\s*\d[\d,]*(?:\.\d+)?\s*(?:₹|%))/gi;
 const MASK='••••';
 let hidden=false;
 let busy=false;
 let scheduled=false;
 function load(){try{return localStorage.getItem(KEY)==='true';}catch{return false;}}
 function save(v){try{localStorage.setItem(KEY,String(v));}catch{}}
 function excluded(node){
  const parent=node.parentElement;
  return !parent||!!parent.closest('script,style,svg,option,select,textarea,button#privacyButton,#privacyStatus,[data-privacy-exempt],.rs-privacy-mask');
 }
 function maskText(node){
  if(excluded(node)||!node.nodeValue||!MONEY.test(node.nodeValue))return;
  MONEY.lastIndex=0;
  const text=node.nodeValue,frag=document.createDocumentFragment();
  let last=0,match;
  while((match=MONEY.exec(text))){
   if(match.index>last)frag.appendChild(document.createTextNode(text.slice(last,match.index)));
   const span=document.createElement('span');span.className='rs-privacy-mask';
   span.textContent=match[0];span.setAttribute('aria-label','Hidden financial value');
   frag.appendChild(span);last=match.index+match[0].length;
  }
  if(last<text.length)frag.appendChild(document.createTextNode(text.slice(last)));
  node.replaceWith(frag);
 }
 function maskTree(root){
  if(!root||!root.isConnected)return;
  if(root.nodeType===Node.TEXT_NODE){maskText(root);return;}
  if(root.nodeType!==Node.ELEMENT_NODE)return;
  if(root.matches('script,style,svg,option,select,textarea,#privacyButton,[data-privacy-exempt],.rs-privacy-mask'))return;
  if(root.closest('.rs-privacy-mask'))return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const texts=[];while(walker.nextNode())texts.push(walker.currentNode);
  texts.forEach(maskText);
 }
 function unmask(){document.querySelectorAll('.rs-privacy-mask').forEach(el=>el.replaceWith(document.createTextNode(el.textContent)));}
 function paint(){
  document.documentElement.classList.toggle('privacy-hidden',hidden);
  const b=document.getElementById('privacyButton');
  if(b){const ico=hidden?'◉':'◌';if(b.textContent!==ico)b.textContent=ico;b.setAttribute('aria-pressed',String(hidden));b.setAttribute('aria-label',hidden?'Show financial values':'Hide financial values');b.title=hidden?'Show financial values':'Hide financial values';}
  const sel=document.getElementById('privacySelect');if(sel)sel.value=hidden?'hidden':'visible';
  const status=document.getElementById('privacyStatus');if(status){const msg=hidden?'Amounts hidden on this device':'Amounts visible on this device';if(status.textContent!==msg)status.textContent=msg;}
 }
 function process(root){if(!hidden||busy)return;busy=true;try{maskTree(root||document.getElementById('app'));}finally{busy=false;}}
 function setHidden(value){hidden=!!value;save(hidden);paint();if(hidden)process(document.getElementById('app'));else unmask();}
 document.addEventListener('click',e=>{if(e.target.closest('#privacyButton'))setHidden(!hidden);});
 document.addEventListener('change',e=>{if(e.target.id==='privacySelect')setHidden(e.target.value==='hidden');});
 const observer=new MutationObserver(records=>{
  if(!hidden||busy||scheduled)return;
  if(!records.some(r=>r.addedNodes.length||r.type==='characterData'))return;
  scheduled=true;
  requestAnimationFrame(()=>{scheduled=false;process(document.getElementById('app'));paint();});
 });
 function init(){hidden=load();paint();process(document.getElementById('app'));observer.observe(document.getElementById('app'),{subtree:true,childList:true,characterData:true});}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.RosyPrivacy={isHidden:()=>hidden,setHidden};
})();
