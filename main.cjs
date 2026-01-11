const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Antigravity Tools",
    // 关键优化 1: 先不显示窗口，等内容加载完再显示
    show: false, 
    // 关键优化 2: 设置背景色与 React 应用的背景一致（避免白色闪烁）
    backgroundColor: '#f3f4f6', // 对应你 App 里的浅色背景
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false 
    },
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // 关键优化 3: 只有当页面准备好显示时，才弹出窗口
  // 这会让用户感觉“一点开就是有内容的”，虽然实际启动时间没变，但体验好很多
  win.once('ready-to-show', () => {
    win.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});