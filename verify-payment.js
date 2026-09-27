const crypto=require('crypto');
const {adminClient,userFromRequest}=require('./_lib/supabaseAdmin');
module.exports=async function handler(req,res){
 if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
 const user=await userFromRequest(req); if(!user)return res.status(401).json({error:'Login required'});
 const {razorpay_order_id,razorpay_payment_id,razorpay_signature,dbOrderId}=req.body||{};
 if(!razorpay_order_id||!razorpay_payment_id||!razorpay_signature)return res.status(400).json({error:'Missing payment data'});
 const expected=crypto.createHmac('sha256',(process.env.RAZORPAY_KEY_SECRET||process.env.RAZORPAY_SECRET)).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
 if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(razorpay_signature)))return res.status(400).json({error:'Invalid payment signature'});
 const db=adminClient();
 const {data:order}=await db.from('orders').select('*').eq('id',dbOrderId).eq('buyer_id',user.id).single();
 if(!order)return res.status(404).json({error:'Order not found'});
 const {error}=await db.from('orders').update({status:'paid',razorpay_payment_id,razorpay_signature,paid_at:new Date().toISOString()}).eq('id',order.id);
 if(error)return res.status(500).json({error:error.message});
 res.status(200).json({success:true,orderId:order.id});
};
