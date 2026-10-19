import test from 'node:test';
import assert from 'node:assert/strict';
import {grade,publicQuestions,quizzes} from '../lib/questions.mjs';
import handler from '../api/portal.js';
test('cinco questões por formação e gabarito fora da resposta pública',()=>{
 for(const course of Object.keys(quizzes)){assert.equal(publicQuestions(course).length,5);assert.ok(publicQuestions(course).every(q=>!('answer'in q)&&!('explanation'in q)));assert.equal(grade(course,quizzes[course].map(q=>q.answer)).score,5);assert.equal(grade(course,quizzes[course].map(q=>(q.answer+1)%4)).score,0);}
});
test('rejeita respostas incompletas, valores fora do intervalo e curso inválido',()=>{
 for(const a of [[],[0,1],[0,1,2,3,4],[0,1,2,3,'1'],[0,1,2,3,null]])assert.throws(()=>grade('tecnologia',a));assert.throws(()=>grade('outro',[0,0,0,0,0]));
});
async function call(action,{method='GET',body,token='valid',query={}}={}){let status,data;const res={setHeader(){},status(s){status=s;return this;},json(d){data=d;return this;}};await handler({method,body,query:{action,...query},headers:{authorization:token?`Bearer ${token}`:''}},res);return {status,data};}
test('autorização, validação, correção no servidor e repetição idempotente',async()=>{
 Object.assign(process.env,{SUPABASE_URL:'https://test.supabase.co',SUPABASE_ANON_KEY:'anon-test',SUPABASE_SERVICE_ROLE_KEY:'secret-test',ADMIN_USER_ID:'admin'});
 const original=global.fetch;let stored=null,dbCalls=0;let currentUser={id:'teacher',email:'teacher@example.com',email_confirmed_at:'2026-10-19'};
 global.fetch=async(url,opts)=>{
  if(url.endsWith('/auth/v1/user'))return {ok:true,json:async()=>currentUser};
  dbCalls++;if(url.endsWith('/rpc/record_attempt')){const p=JSON.parse(opts.body);stored=stored||{id:'record',course:p.p_course,answers:p.p_answers,score:p.p_score,attempt_number:1};return {ok:true,json:async()=>[stored]};}
  return {ok:true,json:async()=>[]};
 };
 try{
  assert.equal((await call('report',{token:null})).status,401);
  assert.equal((await call('report')).status,403);assert.equal(dbCalls,0);
  const bad={course:'robotica',name:'Professor Teste',school:'Escola Teste',reviewed:true,requestId:'5b530872-7034-4c5f-9fb1-560515da3e4c',answers:[2,0,3,1,2]};
  assert.equal((await call('submit',{method:'POST',body:bad})).status,400);
  const body={...bad,eligible:true,score:0};const first=await call('submit',{method:'POST',body});assert.equal(first.data.score,5);assert.equal(first.data.attempt.attempt_number,1);
  const again=await call('submit',{method:'POST',body:{...body,answers:[0,0,0,0,0]}});assert.equal(again.data.score,5);
  currentUser={...currentUser,id:'admin',email:'katsusuke@prof.educacao.sp.gov.br'};assert.equal((await call('report')).status,200);
  assert.equal((await call('report',{query:{page:-1}})).status,400);
 }finally{global.fetch=original;}
});
