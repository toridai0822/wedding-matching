// Supabase 設定

window.SUPABASE_URL = "https://ylzomspzmjkabxhxupuf.supabase.co";
window.SUPABASE_ANON_KEY = "sb_publishable_sz2A_mEZOn4LvE_I3ul53g_YzaqL5m2";

// グローバルに1回だけ作る
window.supabaseClient = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);
