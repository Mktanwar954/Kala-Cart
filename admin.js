const {adminClient,userFromRequest,isAdmin}=require('./_lib/supabaseAdmin');
module.exports=async function handler(req,res){
 const user=await userFromRequest(req); if(!(await isAdmin(user)))return res.status(403).json({error:'Admin access required'});
 const db=adminClient();
 if(req.method==='GET'){
  const [a,o,p]=await Promise.all([
   db.from('artworks').select('*,profiles:artist_id(full_name,email)').order('created_at',{ascending:false}),
   db.from('orders').select('*').order('created_at',{ascending:false}),
   db.from('profiles').select('*').order('created_at',{ascending:false})
  ]); return res.status(200).json({artworks:a.data||[],orders:o.data||[],profiles:p.data||[]});
 }
 if(req.method==='PATCH'){
  const {id,status}=req.body||{}; if(!id||!['approved','rejected','pending'].includes(status))return res.status(400).json({error:'Invalid request'});
  const {data,error}=await db.from('artworks').update({status}).eq('id',id).select().single(); if(error)return res.status(500).json({error:error.message}); return res.status(200).json({artwork:data});
 }
 res.status(405).json({error:'Method not allowed'});
};
