const Razorpay = require('razorpay');
const {adminClient,userFromRequest}=require('./_lib/supabaseAdmin');
module.exports=async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const user=await userFromRequest(req);
  if(!user) return res.status(401).json({error:'Login required'});
  const {items,shipping=0}=req.body||{};
  if(!Array.isArray(items)||!items.length) return res.status(400).json({error:'Cart is empty'});
  const ids=items.map(x=>String(x.id));
  const db=adminClient();
  const {data:arts,error}=await db.from('artworks').select('id,title,price,artist_id,type,status').in('id',ids).eq('status','approved');
  if(error) return res.status(500).json({error:error.message});
  const map=new Map((arts||[]).map(a=>[String(a.id),a]));
  let subtotal=0;
  const clean=[];
  for(const item of items){
    const a=map.get(String(item.id));
    if(!a) return res.status(400).json({error:'One or more artworks are unavailable'});
    subtotal+=Number(a.price);
    clean.push({artwork_id:a.id,title:a.title,price:Number(a.price),artist_id:a.artist_id,qty:1});
  }
  const amount=Math.round((subtotal+Number(shipping||0))*100);
  const razorpay=new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:(process.env.RAZORPAY_KEY_SECRET||process.env.RAZORPAY_SECRET)});
  const order=await razorpay.orders.create({amount,currency:'INR',receipt:`KC-${Date.now()}`,notes:{user_id:user.id}});
  const {data:dbOrder,error:dbErr}=await db.from('orders').insert({buyer_id:user.id,razorpay_order_id:order.id,subtotal,shipping:Number(shipping||0),total:amount/100,status:'created',items:clean}).select().single();
  if(dbErr) return res.status(500).json({error:dbErr.message});
  res.status(200).json({orderId:order.id,amount:order.amount,currency:order.currency,keyId:process.env.RAZORPAY_KEY_ID,dbOrderId:dbOrder.id});
};
