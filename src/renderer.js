//GET VARS ON SUBMIT AND SEND TO IPC
document.querySelector('#submit').addEventListener('click', function () {
  let username = document.getElementById('username').value;

  const { ipcRenderer } = require('electron');

  // send username to main.js
  ipcRenderer.send('asynchronous-message', username);

  // receive message from main.js
  ipcRenderer.on('asynchronous-reply', (event, arg) => {
    console.log(arg);
  });
});
