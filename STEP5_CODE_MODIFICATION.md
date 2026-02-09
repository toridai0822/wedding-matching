# ステップ5: コードを修正してSupabaseに接続する（20分）

JavaScriptのコードを修正して、Supabaseのデータベースに接続します。

## 5-1. 必要なファイルを置き換える

GitHubにアップロードしたファイルを以下の新しいファイルに置き換えます。

### 置き換えるファイル一覧

| 古いファイル | 新しいファイル |
|-------------|---------------|
| index.html | index-supabase.html |
| js/participant.js | js/participant-supabase.js |
| - | js/config.js（新規作成） |

---

## 5-2. config.jsを編集する

**とても重要！**

`js/config.js` ファイルを開いて、ステップ4-5でコピーした情報を貼り付けます。

### 編集前（デフォルト）
```javascript
const SUPABASE_URL = 'https://あなたのプロジェクトID.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 編集後（例）
```javascript
const SUPABASE_URL = 'https://xyzabcdefg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5OTk5OTk5OX0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

**あなた自身の値に置き換えてください！**

---

## 5-3. GitHubにアップロードする

### 方法A: GitHub Web上で編集

1. GitHubのあなたのリポジトリ（wedding-matching）に行く
2. 各ファイルをクリック
3. 鉛筆アイコン（編集）をクリック
4. 内容を貼り付け
5. 「Commit changes」をクリック

### 方法B: 新規ファイルを追加

1. 「Add file」→「Create new file」
2. ファイル名を入力（例: `js/config.js`）
3. 内容を貼り付け
4. 「Commit new file」をクリック

---

## 5-4. index.htmlの名前を変更

1. 古い `index.html` を削除
2. `index-supabase.html` を `index.html` にリネーム

### リネーム方法
- ファイルをクリック
- 鉛筆アイコンをクリック
- ファイル名を `index.html` に変更
- 「Commit changes」

---

## 5-5. participant.jsを置き換え

1. 古い `js/participant.js` を削除
2. `js/participant-supabase.js` を `js/participant.js` にリネーム

---

## 5-6. Netlifyが自動でデプロイ

GitHubにファイルをアップロードすると、Netlifyが自動的に検知して、サイトを更新します！

### 確認方法
1. Netlifyのダッシュボードに行く
2. 「Deploys」タブを見る
3. 「Building」→「Published」に変わればOK！

**1〜2分待ってください**

---

## 5-7. 動作確認

1. あなたのNetlifyのURL（例: https://taro-wedding-matching.netlify.app）を開く
2. 参加者登録フォームで試しに登録してみる
   - 名前: テスト太郎
   - 受付番号: 1
   - 第一希望: 21
   - 第二希望: 22
3. 「登録する」をクリック

### 成功したら
✅ 「登録が完了しました！」と表示される

### Supabaseで確認
1. Supabaseのダッシュボードに行く
2. 「Table Editor」→「participants」を開く
3. データが1行追加されているはず！

---

✅ ステップ5終了！基本的な登録機能が動きました！

次は管理画面とマッチング機能をSupabase対応にします。