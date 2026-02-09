# ステップ3: Netlifyでサイトを公開する（10分）

Netlifyは「あなたのサイトをインターネットに公開する場所」です。無料で永久に使えます。

## 3-1. Netlifyのサイトに行く

🌐 https://www.netlify.com にアクセス

## 3-2. アカウントを作る

1. 「Sign up」（登録）をクリック
2. 「Sign up with GitHub」を選択
   - さっき作ったGitHubアカウントでログイン
   - 「Authorize Netlify」をクリック（許可する）

**完了！** Netlifyにログインできました。

---

## 3-3. サイトをデプロイ（公開）する

1. 「Add new site」をクリック
2. 「Import an existing project」を選択
3. 「Deploy with GitHub」をクリック

### GitHubとの連携

4. 「Authorize Netlify」をクリック
5. あなたのリポジトリ一覧が表示される
6. **「wedding-matching」** を選択

### デプロイの設定

| 項目 | 設定 |
|------|------|
| Branch to deploy | `main` |
| Base directory | （空欄のまま） |
| Build command | （空欄のまま） |
| Publish directory | （空欄のまま） |

7. 「Deploy site」ボタンをクリック

---

## 3-4. 公開完了！

**1〜2分待つと...**

✅ 「Site is live」と表示されます！

あなたのサイトのURL（例）:
```
https://amazing-cupcake-123456.netlify.app
```

このURLをクリックすると、あなたのサイトが見られます！

---

## 3-5. URLを変更する（オプション）

わかりやすい名前に変えられます。

1. 「Site settings」をクリック
2. 「Change site name」をクリック
3. 好きな名前を入力（例: `taro-wedding-matching`）
4. 保存

新しいURL:
```
https://taro-wedding-matching.netlify.app
```

---

✅ ステップ3終了！サイトはインターネットに公開されました！

**でも、まだデータベースがないので、データは保存されません。**
次のステップでデータベースを作ります。