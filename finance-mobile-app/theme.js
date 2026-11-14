/* Appearance preference is intentionally stored separately from finance/cloud records. */
(function(){
  'use strict';
  const KEY='rosy-sage-appearance-v1';
  const media=window.matchMedia?.('(prefers-color-scheme: dark)');
  const valid=new Set(['light','dark','system']);
  function preference(){try{const p=localStorage.getItem(KEY);return valid.has(p)?p:'light';}catch{return 'light';}}
  function resolved(pref){return pref==='system'?(media?.matches?'dark':'light'):pref;}
  function apply(){
    const pref=preference(),effective=resolved(pref);
    document.documentElement.dataset.theme=effective;
    document.documentElement.style.colorScheme=effective;
    const btn=document.getElementById('appearanceButton');
    if(btn){btn.textContent=effective==='dark'?'☀':'☾';btn.title=effective==='dark'?'Switch to light mode':'Switch to dark mode';btn.setAttribute('aria-label',btn.title);btn.setAttribute('aria-pressed',String(effective==='dark'));}
    const sel=document.getElementById('appearanceSelect');if(sel&&sel.value!==pref)sel.value=pref;
    const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',effective==='dark'?'#141d1a':'#f7f8f5');
  }
  function change(pref){if(!valid.has(pref))return;try{localStorage.setItem(KEY,pref);}catch{}apply();}
  document.addEventListener('click',function(event){if(event.target.closest('#appearanceButton'))change(resolved(preference())==='dark'?'light':'dark');});
  document.addEventListener('change',function(event){if(event.target.id==='appearanceSelect')change(event.target.value);});
  media?.addEventListener?.('change',apply);
  new MutationObserver(function(records){for(const r of records){if([...r.addedNodes].some(n=>n.nodeType===1&&(n.id==='appearanceSelect'||n.querySelector?.('#appearanceSelect')))){apply();break;}}}).observe(document.documentElement,{subtree:true,childList:true});
  apply();
})();
