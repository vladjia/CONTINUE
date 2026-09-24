# CONTINUE PWA SHELL

這包是 GitHub Pages 外殼，不是 GAS 本體。

## 架構

GitHub Pages / PWA
→ iframe
→ Google Apps Script Web App
→ Google Sheets / CONTINUE ROOM

## GitHub Pages 安裝

1. 新建 GitHub repository，例如 `continue-room`
2. 把這個資料夾內的所有檔案放到 repository 根目錄
3. GitHub → Settings → Pages
4. Build and deployment:
   - Source: Deploy from a branch
   - Branch: `main`
   - Folder: `/ (root)`
5. Save
6. 等 GitHub Pages 網址出現
7. 打開頁面
8. 第一次會要求貼 GAS Web App 的 `/exec` 網址
9. 貼一次後會儲存在該裝置 localStorage，不會寫進 GitHub

## 手機安裝 PWA

### Android / Chrome
開啟 GitHub Pages 網址 → 瀏覽器選單 →「安裝應用程式」或「加到主畫面」。

### iPhone / Safari
開啟 GitHub Pages 網址 → 分享 →「加入主畫面」。

## GAS 必要條件

GAS `doGet()` 需要保留：

```javascript
.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
```

否則 iframe 會被擋住。

## 重要：登入 / 隱私

GitHub Pages 是公開靜態網站；這包**沒有把你的 GAS URL 寫進 repo**，
而是第一次由你在裝置上輸入並保存在 localStorage。

但是，GAS 自己的存取權限仍然決定誰能看到聊天室。
若 GAS 需要 Google 登入，部分手機瀏覽器 / PWA 的 iframe 可能遇到第三方登入 Cookie 限制。

不要為了讓 iframe 比較省事，就直接把私人聊天室設成完全公開。
若登入真的卡住，下一步應該做的是 CONTINUE 自己的驗證層，而不是裸開公開權限。

## 目前離線能力

PWA 外殼、Logo、icon 可以離線開啟。
GAS 聊天室是跨網域即時內容，因此離線時不會有聊天室資料。
