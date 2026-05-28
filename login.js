import{chromium}from"playwright";
import{gzipSync}from"zlib";
let b=await chromium.launch({headless:false}),p=await b.newPage();
await p.goto("https://mijnknltb.toernooi.nl/");
console.log("Log in, kom terug, druk Enter.");
process.stdin.once("data",async()=>{let s=await p.context().storageState();s.origins=[];await import("fs").then(x=>x.writeFileSync("state.json",JSON.stringify(s)));await b.close();console.log(gzipSync(JSON.stringify(s)).toString("base64"));process.exit()});
