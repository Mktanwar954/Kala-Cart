const {adminClient,userFromRequest}=require('./_lib/supabaseAdmin');
module.exports=async function handler(req,res){
 const user=await userFromRequest(req); if(!user)return res.status(401).json({error:'Login required'});
 if(req.method==='POST'){
  const body=req.body||{};
  const required=['title','price','category','type'];
  if(required.some(k=>!body[k]))return res.status(400).json({error:'Missing listing fields'});
  const db=adminClient();
  const {data,error}=await db.from('artworks').insert({artist_id:user.id,title:body.title,description:body.description||'',price:Number(body.price),category:body.category,type:body.type,medium:body.medium||'',size:body.size||'',image_url:body.image_url||'',status:'pending'}).select().single();
  if(error)return res.status(500).json({error:error.message});
  return res.status(201).json({artwork:data});
 }
 if(req.method==='GET'){
  const db=adminClient(); const {data,error}=await db.from('artworks').select('*,profiles:artist_id(full_name,avatar_url)').eq('artist_id',user.id).order('created_at',{ascending:false});
  if(error)return res.status(500).json({error:error.message}); return res.status(200).json({artworks:data||[]});
 }
 res.status(405).json({error:'Method not allowed'});
};
