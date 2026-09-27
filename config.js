module.exports = async function handler(req,res){
  res.status(200).json({
    // Browser-safe public values. Razorpay secret and Supabase service-role key stay server-only.
    supabaseUrl: process.env.SUPABASE_URL || 'https://npktppkzgoopgqbnqcfi.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || 'sb_publishable_uz17XgzQUeoSO8ay7j-kDw_aN60IRsf',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_TgDU7BA7m8S93l'
  });
};
