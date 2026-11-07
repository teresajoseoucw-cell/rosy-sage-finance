// Subcategory is the source of truth for category and default 50/30/20 group.
export const SEED=[
['Paycheck Cherry','Income',''],['Paycheck Chinju','Income',''],['Sodexo','Income',''],
['Electricity','Bills','Need'],['Internet','Bills','Need'],['Car wash','Bills','Want'],['Rent','Bills','Need'],['Salon','Bills','Want'],
['Car','Expenses','Need'],['Chinju Office','Expenses','Want'],['Dog','Expenses','Need'],['Family','Expenses','Need'],['Food','Expenses','Want'],['Groceries','Expenses','Need'],['Personal','Expenses','Want'],['Shopping','Expenses','Want'],['Transport','Expenses','Need'],['Hospital','Expenses','Need'],['Therapy','Expenses','Need'],['Friends','Expenses','Want'],['Others','Expenses',''],['Unknown','Expenses',''],['Medical','Expenses','Need'],['Ignore','Expenses',''],
['Stocks','Savings','Savings'],['Salary','Savings','Savings'],['PPF','Savings','Savings'],['Mutual Funds','Savings','Savings'],['Govt Bonds','Savings','Savings'],
['Netflix','Subscriptions','Want'],['Apple One','Subscriptions','Want']
].map(([name,category,distribution])=>({id:'seed-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),name,category,distribution}));
export function catalog(s){return Array.isArray(s.taxonomy)?s.taxonomy:SEED.map(x=>({...x}));}
export function subcategoryById(s,id){return catalog(s).find(x=>x.id===id)||null;}
export function classify(row,s){const match=subcategoryById(s,row.subcategoryId)||catalog(s).find(x=>x.name===row.subcategory && x.category===row.type)||null;return {...row,category:match?.category||row.category||row.type,subcategory:match?.name||row.subcategory||row.category||'',distribution:row.distribution||match?.distribution||''};}
export function allocation(s,year,month){const prefix=year+'-'+String(month).padStart(2,'0');const rows=[...(s.transactions||[]).filter(x=>x.date?.startsWith(prefix)),...(s.recurring||[]).flatMap(()=>[])];return rows;}
