# CONTINUE PWA SHELL v1.3 — Android Launch Fix

這版針對 GitHub Pages 專案網址：

`https://vladjia.github.io/CONTINUE/`

把 PWA 身分與啟動路徑全部鎖死在 `/CONTINUE/`。

## 關鍵修正
- manifest `id`: `/CONTINUE/`
- manifest `start_url`: `/CONTINUE/`
- manifest `scope`: `/CONTINUE/`
- icon 改成 `/CONTINUE/icons/...`
- Service Worker 固定 `/CONTINUE/sw.js`
- Service Worker scope 固定 `/CONTINUE/`
- 移除 start_url query 參數
- PWA 外殼的 `⋯` 設定鈕下移，不再蓋住 GAS Header 四人頭像
- 自動更新與 Network First 保留

## 這次 Android 測試要做一次乾淨重置
因為前一版 manifest 的 app identity 已經不同，Android Chrome 可能仍保留舊的 Web App 記錄。

1. 先把本 ZIP 全部覆蓋 GitHub repo 根目錄並 push。
2. 等 GitHub Pages 部署完成。
3. Android：如果系統「設定 → 應用程式」裡看得到 CONTINUE，先解除安裝那個舊的失敗版本。
4. Chrome → 此網站的網站設定 → 清除 `vladjia.github.io` 的網站資料。
5. 重新開 `https://vladjia.github.io/CONTINUE/`
6. 再執行「安裝應用程式」。

這次清理是因為我們修正了 PWA `id`；後續正常 UI / 程式更新不需要再移除安裝。

## GAS
GAS 仍需保留：
`.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);`
