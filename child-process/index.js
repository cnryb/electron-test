const { app, BrowserWindow, ipcMain, Menu, MenuItem  } = require('electron/main')
const path = require('node:path')

const menu = new Menu()
menu.append(new MenuItem({
  label: '工作台',
  submenu: [
    {
      label: '重启',
      click: () => {
        app.relaunch()
        app.quit()
      }
    },
    {
      label: '退出',
      accelerator: 'CmdOrCtrl+Q',
      click: () => app.quit()
    }
  ]
}))

menu.append(new MenuItem({
  label: '视图',
  submenu: [
    {
      label: '重载',
      accelerator: 'CmdOrCtrl+R',
      click: (item, focusedWindow) => {
        if (focusedWindow) {
          focusedWindow.reload()
        }
      }
    }
  ]
}))
menu.append(new MenuItem({
  label: '开发',
  submenu: [{
    label: '开发者工具',
    accelerator: 'F12',
    click: () => {
      BrowserWindow.getAllWindows().forEach(win => {
        if (win.isFocused() === false) return
        if (win.webContents.isDevToolsFocused() === true) {
          win.webContents.closeDevTools()
          return
        }
        win.webContents.openDevTools()
      })
    }
  }]
}))

Menu.setApplicationMenu(menu)


function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// test

ipcMain.on('start-child-process', (event, arg) => {
  console.log('start-child-process')
  sendMessage('child-process-started', 'running')
})

ipcMain.on('stop-child-process', (event, arg) => {
  console.log('stop-child-process')
  sendMessage('child-process-stopped', 'stopped')
})


function sendMessage (eventName, data) {
  for (const window of BrowserWindow.getAllWindows()) { // eslint-disable-line
    if (window.webContents) {
      window.webContents.send(eventName, data)
    }
  }
}
