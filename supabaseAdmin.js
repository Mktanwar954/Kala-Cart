const { createClient } = require('@supabase/supabase-js');
function adminClient(){
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{autoRefreshToken:false,persistSession:false}});
}
async function userFromRequest(req){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if(!token) return null;
  const supabase = adminClient();
  const {data:{user},error} = await supabase.auth.getUser(token);
  if(error || !user) return null;
  return user;
}
async function isAdmin(user){
  if(!user) return false;
  const emails=(process.env.KALA_ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(emails.includes((user.email||'').toLowerCase())) return true;
  const {data}=await adminClient().from('profiles').select('role').eq('id',user.id).maybeSingle();
  return data?.role==='admin';
}
module.exports={adminClient,userFromRequest,isAdmin};
