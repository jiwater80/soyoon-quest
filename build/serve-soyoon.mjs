import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const ROOT=fileURLToPath(new URL('../', import.meta.url)).replace(/[\\/]$/, '');
const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.png':'image/png','.md':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]); if(p==='/')p='/index.html';
  const fp=path.join(ROOT,p);
  fs.readFile(fp,(e,data)=>{ if(e){res.writeHead(404);res.end('404');return;} res.writeHead(200,{'Content-Type':TYPES[path.extname(fp)]||'application/octet-stream'}); res.end(data); });
}).listen(5182,()=>console.log('soyoon serving on 5182'));
