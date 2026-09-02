# KC Auto · 员工晋升系统

## 上传 GitHub

```bash
cd kc-auto-app
git init
git add .
git commit -m "init"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

（没有仓库先在 github.com 点 New repository 建一个空仓库，复制它的地址替换上面的 URL）

## 部署到 Railway

1. https://railway.app → New Project → Deploy from GitHub repo → 选这个仓库
2. Settings 里确认：
   - Build Command: `npm run build`
   - Start Command: `npm start`
3. 数据持久化（重要）：Railway 默认文件系统重新部署会重置。在服务的 Settings → Volumes 里加一个 Volume，挂载路径填 `/data`，然后在 Variables 里加环境变量：
   - `DB_PATH` = `/data/db.json`
4. 部署完成后 Railway 会给一个 `xxx.up.railway.app` 域名，直接打开就能用。想用自己的域名可以在 Settings → Domains 里绑定。

## 默认账号（登录后请到「账号管理」改密码）

| 角色 | ID | 密码 |
|---|---|---|
| Boss | boss | boss2026 |
| Manager | wy | wy2026 |
| Kim | kim | kim2026 |
| Qing | qing | qing2026 |
| Yoyo | yoyo | yoyo2026 |
| Store | store | store2026 |
| Aisyah（员工） | aisyah | aisyah2026 |

## 本地测试（可选）

```bash
npm install
npm run build
npm start
# 打开 http://localhost:3000
```
