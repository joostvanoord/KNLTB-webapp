import express from"express";
import{chromium}from"playwright";
import fs from"fs";
import{gunzipSync}from"zlib";
let app=express(),port=process.env.PORT||3000,state=process.env.STATE_PATH||"state.json",url="https://mijnknltb.toernooi.nl/";
if(process.env.KNLTB_STATE&&!fs.existsSync(state))fs.writeFileSync(state,gunzipSync(Buffer.from(process.env.KNLTB_STATE,"base64")));
async function page(headless=true){
 let b=await chromium.launch({headless,args:["--no-sandbox"]}),ctx=fs.existsSync(state)?await b.newContext({storageState:state}):await b.newContext(),p=await ctx.newPage();
 return{b,ctx,p};
}
app.use(express.static("public"));
app.get("/api/data",async(req,res)=>{
 try{
  let{b,p}=await page();
  await p.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
  let title=await p.title(),text=(await p.textContent("body")||"").trim();
  await b.close();
  res.json({ok:true,title,text:text.slice(0,5000)});
 }catch(e){res.status(500).json({ok:false,error:e.message})}
});
app.listen(port,()=>console.log("http://localhost:"+port));
