const { app, BrowserWindow, nativeTheme } = require('electron')
const path = require('node:path')
app.whenReady().then(async () => {
  nativeTheme.themeSource = 'light'
  const window = new BrowserWindow({ width: 960, height: 720, backgroundColor: '#ffffff' })
  await window.loadFile(path.join(__dirname, 'page.html'))
  window.show()
})
app.on('window-all-closed', () => app.quit())
