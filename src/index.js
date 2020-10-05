const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const nunjucks = require('nunjucks');

//configure nunjucks
nunjucks.configure(path.resolve(__dirname, './templates'), {
  autoescape: true,
});

//auto updating feature
require('update-electron-app')();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  //eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1175,
    height: 800,
    minWidth: 1175,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// the rest of your app's specific main process
//callTemplate
function callTemplate(args) {
  let config = nunjucks.render('simpleBgp.njk', {
    SERVICE_TYPE: args.SERVICE_TYPE,
    IP_MTU: args.IP_MTU,
    CIRCUIT_ID: args.CIRCUIT_ID,
    SERVICE_ID: args.SERVICE_ID,
    CUSTOMER_NAME: args.CUSTOMER_NAME,
    CUSTOMER_ID: args.CUSTOMER_ID,
    SAP_LAG: args.SAP_LAG,
    VLAN_INNER: args.VLAN_INNER,
    COIN_SAP_EGRESS_QOS: args.COIN_SAP_EGRESS_QOS,
    CIRCUIT_MAC: args.CIRCUIT_MAC,
    COI_INT_IP: args.COI_INT_IP,
    COI_PREFIX_LEN: args.COI_PREFIX_LEN,
    COI_INT_IPV6: args.COI_INT_IPV6,
    COI_PREFIX_LENV6: args.COI_PREFIX_LENV6,
    BGP_PEER_AS: args.BGP_PEER_AS,
    BGP_FLAVOR: args.BGP_FLAVOR,
    BGP_KEY: args.BGP_KEY,
    IP_FILTER_ID: args.IP_FILTER_ID,
    CUST_BFD: args.CUST_BFD,
    BGP_EXPORT_FILTER: args.BGP_EXPORT_FILTER,
    BGP_PEER_IP: args.BGP_PEER_IP,
    BGP_PEER_IPV6: args.BGP_PEER_IPV6,
    CUSTV4_PREFIX_LIST: args.CUSTV4_PREFIX_LIST,
    CUSTV6_PREFIX_LIST: args.CUSTV6_PREFIX_LIST,
    BGP_FAMILY: args.BGP_FAMILY,
  });

  return config;
}

//wait for build config to be called rhen do it
ipcMain.handle('build-config', async (event, args) => {
  for (const [key, value] of Object.entries(args)) {
    console.log(key, value);
  }

  const result = await callTemplate(args);
  trimmedResult = result.replace(/^\s*[\r\n]/gm, '');
  return trimmedResult;
});

ipcMain.handle('send-dialog', (event, str) => {
  const options = {
    type: 'question',
    defaultId: 2,
    title: 'From Astro Monkey',
    message: str,
  };
  const response = dialog.showMessageBox(null, options);
  console.log(response);
});
