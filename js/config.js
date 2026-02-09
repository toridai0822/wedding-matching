// ⚠️ ここにあなたのSupabaseの情報を入力してください ⚠️

// ステップ4-5でコピーした「Project URL」をここに貼り付け
const SUPABASE_URL = 'https://あなたのプロジェクトID.supabase.co';

// ステップ4-5でコピーした「anon public key」をここに貼り付け
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Supabaseクライアントの初期化
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);