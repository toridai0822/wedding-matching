// ⚠️ ここにあなたのSupabaseの情報を入力してください ⚠️

// ステップ4-5でコピーした「Project URL」をここに貼り付け
const SUPABASE_URL = 'https://xyfzompuzpkbbdznhuqvf.supabase.co';

// ステップ4-5でコピーした「anon public key」をここに貼り付け
const SUPABASE_ANON_KEY = 'sb_ccb1t4ab1a_s2bk_stzcntkct6_1zh13y_YeaaLKSc5BH3ZsQwgyZn0GXXTmDdmZoXiOO7tBHN8vOMGxpwOuLJh9zhNKgB4JHI9NpL5WqZCd0vkQ';

// Supabaseクライアントの初期化
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
