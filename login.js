import{chromium}from"playwright";
let b=await chromium.launch({headless:false}),p=await b.newPage();
await p.goto("https://mijnknltb.toernooi.nl/");
console.log("Log in, kom terug, druk Enter.");
process.stdin.once("data",async()=>{await p.context().storageState({path:"state.json"});await b.close();console.log(Buffer.from(await import("fs").then(x=>x.readFileSync("state.json"))).toString("base64"));process.exit()});
