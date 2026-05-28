import express from"express";
import{chromium}from"playwright";
import fs from"fs";
import{gunzipSync}from"zlib";
let app=express(),port=process.env.PORT||3000,state=process.env.STATE_PATH||"state.json",url="https://mijnknltb.toernooi.nl/";
if(process.env.KNLTB_STATE&&!fs.existsSync(state))fs.writeFileSync(state,gunzipSync(Buffer.from(process.env.KNLTB_STATE,"base64")));
async function page(){let b=await chromium.launch({headless:true,args:["--no-sandbox"]}),ctx=fs.existsSync(state)?await b.newContext({storageState:state}):await b.newContext(),p=await ctx.newPage();return{b,p}}
let lines=t=>t.split(/\n+/).map(x=>x.trim()).filter(Boolean),pick=(a,s)=>a.findIndex(x=>x==s),after=(a,s,n=1)=>a[pick(a,s)+n]||"";
function parse(text){let a=lines(text),name=after(a,"Mijn profiel",5)||a.find(x=>/^[A-Z][a-z]+ .*oord/i.test(x))||"",bond=(text.match(/\((\d{6,})\)/)||[])[1]||"",ratings=[...text.matchAll(/\b9\s+([0-9],[0-9]{4})\b/g)].map(x=>x[1]),wi=pick(a,"Volgende wedstrijd"),pi=pick(a,"Mijn profiel"),w=a.slice(wi,pi>wi?pi:wi+40),teams=w.filter(x=>/\(#\d+\)/.test(x)).map(x=>x.replace(/\s+\(#\d+\)/,"")),forms=[...w.join(" ").matchAll(/\b([WVG](?:\s+[WVG]){4})\b/g)].map(x=>x[1].replace(/\s/g,"")),date=(w.find(x=>/\d{4}\d{1,2}:\d{2}/.test(x))||"").replace(/(\d{4})(\d{1,2}:\d{2})/,"$1 $2"),comp=w[1]||"",klasse=w[2]||"",wl=(text.match(/Carrière\s+(\d+\s*\/\s*\d+\s*\(\d+\))/)||[])[1]||"",year=(text.match(/Dit jaar\s+(\d+\s*\/\s*\d+\s*\(\d+\))/)||[])[1]||"",hist=(text.match(/Historie\s+([WV\s]{5,})/)||[])[1]?.replace(/\s/g,"").slice(0,5)||"";return{name,bond,ratings:{single:ratings[0]||"",double:ratings[1]||""},record:{career:wl,year,hist},next:{comp,klasse,date,home:teams[0]||"",away:teams[1]||"",forms},stand:[],tournaments:[]}}
app.use(express.static("public"));
app.get("/api/data",async(req,res)=>{try{let{b,p}=await page();await p.goto(url,{waitUntil:"domcontentloaded",timeout:60000});let text=(await p.textContent("body")||"").trim();await b.close();res.json({ok:true,data:parse(text),raw:text.slice(0,5000)})}catch(e){res.status(500).json({ok:false,error:e.message})}});
app.get("/api/debug/links",async(req,res)=>{try{let{b,p}=await page();await p.goto(url,{waitUntil:"domcontentloaded",timeout:60000});let links=await p.$eval("a",a=>a.map(x=>({text:x.innerText.trim(),href:x.href})).filter(x=>/compet|inschrij|toernooi|stand|wedstrijd|team|poule|uitslag/i.test(x.text+" "+x.href)));await b.close();res.json({ok:true,links})}catch(e){res.status(500).json({ok:false,error:e.message})}});
app.listen(port,()=>console.log("http://localhost:"+port));
