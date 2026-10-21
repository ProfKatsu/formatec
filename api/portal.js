import {grade,publicQuestions} from '../lib/questions.mjs';
import {createHash} from 'node:crypto';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const send=(status,data)=>res.status(status).json(data);
 const {SUPABASE_URL:url,SUPABASE_ANON_KEY:anon,SUPABASE_SERVICE_ROLE_KEY:secret,ADMIN_USER_ID:admin}=process.env;
 const action=req.query.action;
 async function db(path,options={}){
  const r=await fetch(`${url}/rest/v1/${path}`,{...options,headers:{apikey:secret,Authorization:`Bearer ${secret}`,'Content-Type':'application/json',...options.headers}});
  if(!r.ok) throw new Error('database');
  return r.status===204?null:r.json();
 }
 try{
  // Public learning flow: neither the questions nor grading require email login.
  if(action==='questions'&&req.method==='GET'){
   const questions=publicQuestions(req.query.course);
   return questions?send(200,{questions}):send(400,{error:'Formação inválida.'});
  }
  if(['play','guest-history','guest-sed'].includes(action)){
   const key=req.headers['x-participant-token'];
   if(typeof key!=='string'||!/^[a-f0-9]{64}$/.test(key))return send(401,{error:'Reabra a avaliação para iniciar sua participação.'});
   const hash=createHash('sha256').update('formation-guest-v1:'+key).digest('hex');
   const participant=`${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
   const b=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
   if(action==='play'&&req.method==='POST'){
    if(typeof b.name!=='string'||b.name.trim().length<3||b.name.length>150||typeof b.school!=='string'||b.school.trim().length<3||b.school.length>200||!uuid.test(b.requestId||'')||b.reviewed!==true||(b.course==='robotica'&&b.eligible!==true))return send(400,{error:'Confira nome, escola e declarações obrigatórias.'});
    let result;try{result=grade(b.course,b.answers);}catch(e){return send(400,{error:e.message});}
    const pending=()=>send(200,{...result,recorded:false,message:'Você concluiu o quiz, mas a participação ainda não foi confirmada no relatório do PEC. Tente registrar novamente ou entre em contato com o responsável.'});
    if(!url||!secret)return pending();
    try{
     const saved=await db('rpc/record_attempt',{method:'POST',body:JSON.stringify({p_user:participant,p_email:'',p_name:b.name.trim(),p_school:b.school.trim(),p_course:b.course,p_answers:b.answers,p_score:result.score,p_request:b.requestId})});
     const row=Array.isArray(saved)?saved[0]:saved;
     if(!row)throw new Error('missing record');
     return send(200,{recorded:true,attempt:row,...grade(row.course,row.answers)});
    }catch{return pending();}
   }
   if(!url||!secret)return send(503,{error:'O histórico depende da configuração do registro pelo PEC. Você já pode acessar e responder ao quiz.'});
   if(action==='guest-history'&&req.method==='GET')return send(200,{rows:await db(`attempts?user_id=eq.${participant}&order=completed_at.desc&limit=1000`)});
   if(action==='guest-sed'&&req.method==='POST'){
    if(!uuid.test(b.id||''))return send(400,{error:'Registro inválido.'});
    const rows=await db(`attempts?id=eq.${b.id}&user_id=eq.${participant}&sed_declared_at=is.null`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({sed_declared_at:new Date().toISOString()})});
    return send(200,{rows});
   }
   return send(405,{error:'Operação não permitida.'});
  }
  if(!url||!anon||!secret||!admin)return send(503,{error:'O acesso administrativo depende da configuração pelo PEC. O quiz está disponível sem login.'});
  if(action==='config'&&req.method==='GET') return send(200,{url,anon});
  const authorization=req.headers.authorization||'';
  if(!authorization.startsWith('Bearer ')) return send(401,{error:'Entre com seu e-mail para continuar.'});
  const r=await fetch(`${url}/auth/v1/user`,{headers:{apikey:anon,Authorization:authorization}});
  if(!r.ok) return send(401,{error:'Sua sessão expirou. Entre novamente.'});
  const user=await r.json();
  if(!user.email_confirmed_at) return send(403,{error:'Confirme seu e-mail para continuar.'});
  const isAdmin=user.id===admin&&user.email?.toLowerCase()==='katsusuke@prof.educacao.sp.gov.br';
  if(action==='me'&&req.method==='GET') return send(200,{email:user.email,admin:isAdmin});
  if(action==='questions'&&req.method==='GET'){
   const questions=publicQuestions(req.query.course);return questions?send(200,{questions}):send(400,{error:'Formação inválida.'});
  }
  if(action==='submit'&&req.method==='POST'){
   const b=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
   if(typeof b.name!=='string'||b.name.trim().length<3||b.name.length>150||typeof b.school!=='string'||b.school.trim().length<3||b.school.length>200||!uuid.test(b.requestId||'')||b.reviewed!==true||(b.course==='robotica'&&b.eligible!==true))return send(400,{error:'Confira nome, escola e declarações obrigatórias.'});
   let result;try{result=grade(b.course,b.answers);}catch(e){return send(400,{error:e.message});}
   const saved=await db('rpc/record_attempt',{method:'POST',body:JSON.stringify({p_user:user.id,p_email:user.email,p_name:b.name.trim(),p_school:b.school.trim(),p_course:b.course,p_answers:b.answers,p_score:result.score,p_request:b.requestId})});
   const row=Array.isArray(saved)?saved[0]:saved;
   // The saved answers determine feedback on an idempotent retry.
   return send(200,{attempt:row,...grade(row.course,row.answers)});
  }
  if(action==='history'&&req.method==='GET')return send(200,{rows:await db(`attempts?user_id=eq.${user.id}&order=completed_at.desc&limit=1000`)});
  if(action==='sed'&&req.method==='POST'){
   const b=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
   if(!uuid.test(b.id||''))return send(400,{error:'Registro inválido.'});
   const rows=await db(`attempts?id=eq.${b.id}&user_id=eq.${user.id}&sed_declared_at=is.null`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({sed_declared_at:new Date().toISOString()})});
   return send(200,{rows});
  }
  if(action==='report'&&req.method==='GET'){
   if(!isAdmin)return send(403,{error:'Acesso exclusivo do administrador.'});
   const page=Number(req.query.page||0);
   if(!Number.isInteger(page)||page<0||page>100000)return send(400,{error:'Página inválida.'});
   return send(200,{rows:await db(`attempts?select=*&order=completed_at.desc,id.desc&limit=500&offset=${page*500}`)});
  }
  return send(405,{error:'Operação não permitida.'});
 }catch{ return send(500,{error:'Não foi possível concluir a operação. Seus dados não foram confirmados. Tente novamente.'}); }
}
