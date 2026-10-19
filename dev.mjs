import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import handler from './api/portal.js';
const root=path.resolve('public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.pdf':'application/pdf'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/portal'){
   req.query=Object.fromEntries(url.searchParams);let body='';for await(const chunk of req){body+=chunk;if(body.length>20000){res.writeHead(413).end();return;}}
   if(body){try{req.body=JSON.parse(body);}catch{res.writeHead(400).end();return;}}
   res.status=n=>{res.statusCode=n;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};await handler(req,res);return;
  }
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  const content=await readFile(file);res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(content);
 }catch{res.writeHead(404).end('Não encontrado');}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
