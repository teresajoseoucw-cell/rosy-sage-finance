// Three-level Activity hierarchy. The same filtered rows drive every level and the detail total.
import {toPaise} from './engine.mjs';
export function activityCategory(row){return String(row.category||row.type||'Other');}
export function activitySubcategory(row){return String(row.subcategory|| (row.type==='Transfer'?'Account transfer':'Other / uncategorized'));}
export function activityGroups(rows){
 const categories=new Map();
 for(const row of rows){const name=activityCategory(row),sub=activitySubcategory(row);if(!categories.has(name))categories.set(name,{name,total:0,count:0,subcategories:new Map()});const group=categories.get(name);group.total+=toPaise(row.amount);group.count++;if(!group.subcategories.has(sub))group.subcategories.set(sub,{name:sub,total:0,count:0});const bucket=group.subcategories.get(sub);bucket.total+=toPaise(row.amount);bucket.count++;}
 return [...categories.values()].map(c=>({...c,subcategories:[...c.subcategories.values()].sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name))})).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name));
}
export function activityDetail(rows,category,subcategory){return rows.filter(row=>activityCategory(row)===category&&activitySubcategory(row)===subcategory);}
