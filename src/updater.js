const { autoUpdater, dialog } = require('electron');
const APP_VERSION = require('../package.json').version;

const AUTO_UPDATE_URL =
  'https://api.update.rocks/update/github.com/Kade-Powell/COI3_BGP/stable/' +
  process.platform +
  '/' +
  APP_VERSION;

function init() {
  if (process.platform === 'linux') {
    console.log('Auto updates not available on linux');
  } else {
    initDarwinWin32();
  }
}

function initDarwinWin32() {
  autoUpdater.on('error', (err) => console.log(`Update error: ${err.message}`));
  autoUpdater.on('checking-for-update', () =>
    console.log('Checking for update')
  );
  autoUpdater.on('update-available', () => console.log('Update available'));
  autoUpdater.on('update-not-available', () =>
    console.log('No update available')
  );
  // Ask the user if update is available
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    console.log('Update downloaded');
    dialog.showMessageBox(
      {
        type: 'question',
        buttons: ['Update', 'Cancel'],
        defaultId: 0,
        message: `Version ${releaseName} is available, do you want to install it now?`,
        title: 'Update available',
      },
      (response) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        }
      }
    );
  });
  autoUpdater.setFeedURL(AUTO_UPDATE_URL);
  autoUpdater.checkForUpdates();
}

module.exports = {
  init,
};
