# CONTINUE PWA SHELL v1.2 — Android / Chrome Fix

這版針對「GitHub Pages 瀏覽器能開，但 Android Chrome PWA 無法安裝／無法開啟應用程式」調整。

## 主要修正

- Manifest 加入穩定 `id: "./"`
- `start_url` 改為明確的 `./index.html?pwa=1`
- 保留 `scope: "./"`，適合 GitHub Pages 專案子路徑
- 192 / 512 icon 明確標示 `purpose: "any"`
- 512 maskable icon 獨立保留
- Service Worker 不再使用 `cache.addAll()`
- 任一暫時 404 / 尚未同步的素材，不會讓整個 SW 安裝失敗
- 保留 skipWaiting / clients.claim / 自動更新
- 頁面初次設定畫面會顯示 PWA 基本狀態檢查

## 更新 GitHub

直接把 ZIP 內所有檔案覆蓋 repository 根目錄：
- index.html
- manifest.webmanifest
- sw.js
- icons/

commit / push 後，等 GitHub Pages 部署完成。

## Android Chrome 測試

1. 先在 Chrome 開 GitHub Pages 網址。
2. 若你之前開過舊版：
   - Chrome 網站設定 → 該網站 → 清除資料（只需測試期間做這一次）
   - 或改用無痕視窗先確認新版載入。
3. 重新開頁面。
4. 第一次設定頁底下應看到：
   `PWA：Service Worker / Manifest / Icons 已就緒`
5. 再用 Chrome 選單選「安裝應用程式」或「加到主畫面」。

之後正常版本更新不用刪除 PWA 重裝。

## 若仍然不能安裝

把 GitHub Pages 的公開網址貼給心瑀。
下一步直接檢查線上的：
- manifest HTTP response
- icon URL
- sw.js URL
- GitHub Pages path / base path
而不是繼續猜。
