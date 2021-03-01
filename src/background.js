'use strict'

import { app, protocol, BrowserWindow, Menu, ipcMain, dialog } from 'electron'
import fs from 'fs'
const child_process = require('child_process');
import {
  createProtocol,
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
const isDevelopment = process.env.NODE_ENV !== 'production'

//配置axios
// axios.defaults.baseURL = 'http://127.0.0.1:8083';
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

//窗口名称
let win;
let mainWindow;
let uploaderWin;
let setWindow;

//全局信息
let loginInfo;

// 子进程
// var fork = child_process.fork;
// var openFork;
// 开启子进程
// openFork = fork('src/js/test.js');
// process.env.NODE_ENV='production'

const winURL=process.env.NODE_ENV==='development'
    ? `http://localhost:8080`
    : `file://${__dirname}/index.html`
// Scheme must be registered before the app is ready
// protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])


function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 700, height: 600, minHeight: 400, minWidth: 700, frame: false, webPreferences: {
    webSecurity:false,
    nodeIntegration: true
  } })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    //if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  // win.loadURL(winURL);

  win.on('closed', () => {
    win = null
  })

  //接收页面最小化指令
  ipcMain.on('loginMin',e=>win.minimize());

  //接收页面最大化指令
  ipcMain.on('loginMax',e=>{
    if(win.isMaximized()){
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  //接收页面关闭指令
  ipcMain.on('loginClose',e=>win.close());

  //监听窗口大小
  ipcMain.on('changeWindow',(event,arg)=>{
    win&&win.setSize(arg.width,arg.height)
  })

  ipcMain.on('createMainWindow',(event,args)=>{
    createMainWindow();
    loginInfo = args;
    win.close();
  })
  
  ipcMain.on('createMainWindow2',(event,args)=>{
    createMainWindow2();
    loginInfo = args;
    win.close();
  })

  // win.webContents.on('new-window',(event,url,frameName,disposition,options,additionalFeatures)=>{
  //   if(frameName=='modal'){
  //     event.preventDefault()
  //     Object.assign(options,{
  //       modal:true,
  //       width:600,
  //       height:600
  //     })
  //     event.newGuest=new BrowserWindow(options)
  //   }
  // })
}

//文件下载进程
ipcMain.on('download', (evt, args) => {
	var downloadpath = args;
    evt.sender.send('tips',downloadpath);    
    mainWindow.webContents.downloadURL(downloadpath);
});


//创建子窗口
function createMainWindow(){
  // Menu.setApplicationMenu(null);
if(mainWindow){
		return
	}
  mainWindow=new BrowserWindow({
    width:1100,
    height:700,
    minHeight:700,
    minWidth:1100,
    frame: false,
    webPreferences:{
      webSecurity:false,
      nodeIntegration: true
    }
  })
  // mainWindow.loadURL(winURL+"#/mainTitle")
  console.log(winURL+"#/mainTitle")
  if(process.env.WEBPACK_DEV_SERVER_URL){
    console.log(`${process.env.WEBPACK_DEV_SERVER_URL}#/mainTitle`);
    mainWindow.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#/mainTitle`);
  } else {
    createProtocol('app');
    mainWindow.loadURL('app://./index.html#/mainTitle');
  }
  mainWindow.on('closed',()=>{
    mainWindow=null;
  })
  //接收页面最小化指令
  ipcMain.on('min',e=>mainWindow.minimize());

  //接收页面最大化指令
  ipcMain.on('max',e=>{
    if(mainWindow.isMaximized()){
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  //接收页面关闭指令
  ipcMain.on('close',e=>mainWindow.close());

  //获取登录信息
  ipcMain.on('getLoginInfo',(event)=>{
    event.sender.send('AgetLoginInfo',loginInfo);
  });

  ipcMain.once('open-directory-dialog',function(event,p){
    dialog.showOpenDialog({
      properties:[p,"multiSelections"]
    },function(files){
      if(files){
        event.sender.send('selectedItem',files)
      }
    })
  });
}

//切换用户
ipcMain.on('changeUser',(event)=>{
  createWindow();
  mainWindow.close();
})



//创建子窗口
function createMainWindow2(){
if(mainWindow){
		return
	}
  mainWindow=new BrowserWindow({
    width:1100,
    height:600,
    minHeight:700,
    minWidth:1100,
    frame: false,
    webPreferences:{
      webSecurity:false,
      nodeIntegration: true,
      allowRunningInsecureContent: true
    }
  })
  // win.close();
  // mainWindow.loadURL(winURL+"#/index")
  if(process.env.WEBPACK_DEV_SERVER_URL){
    mainWindow.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#/index`);
  } else {
    createProtocol('app');
    mainWindow.loadURL('app://./index.html#/index');
  }
  mainWindow.on('close',()=>{
    mainWindow=null;
  })
  //接收页面最小化指令
  ipcMain.on('min',e=>mainWindow.minimize());

  //接收页面最大化指令
  ipcMain.on('max',e=>{
    if(mainWindow.isMaximized()){
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  //接收页面关闭指令
  ipcMain.on('close',e=>mainWindow.close());

  //获取登录信息
  ipcMain.on('getLoginInfo',(event)=>{
    event.sender.send('AgetLoginInfo',loginInfo);
  });

  ipcMain.once('open-directory-dialog',function(event,p){
    dialog.showOpenDialog({
      properties:[p,"multiSelections"]
    },function(files){
      if(files){
        event.sender.send('selectedItem',files)
      }
    })
  });

}

ipcMain.on('createNewWin',(event)=>{
  createUploaderWin();
})

function createUploaderWin(){
  uploaderWin=new BrowserWindow({
    width:500,
    height:500,
    webPreferences:{
      webSecurity:false,
      nodeIntegration: true
    },
    parent:mainWindow,
    modal:true
  })
  
  // uploaderWin.loadURL(winURL+"/#/upload")
if(process.env.WEBPACK_DEV_SERVER_URL){
  uploaderWin.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}#/upload`);
} else {
  createProtocol('app');
  uploaderWin.loadURL('app://./index.html#/upload');
}
}

var downloadPath='';
ipcMain.on('downloadPath',(event,args)=>{
  downloadPath=args;
})
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
  //手动关闭子进程
  // openFork.kill('SIGHUB');
  // var path=localStorage.getItem('downloadPath');
  //if(downloadPath!=''){
  // var list = fs.readdirSync(downloadPath);
   // for(var i = 0; i<list.length;i++){
    //    let url = downloadPath + '/' + list[i];
     //   console.log(url);
    //    fs.unlinkSync(url);
    //}
   // fs.rmdirSync(downloadPath);
  //}
  

})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

