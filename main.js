const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');

function createWindow () {
  const win = new BrowserWindow({
    width: 420,
    height: 750,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// اضافه شدن ExecutionPolicy Bypass برای جلوگیری از مسدود شدن اسکریپت توسط ویندوز
ipcMain.handle('start-vpn', async (event, d1, d2) => {
    return new Promise((resolve) => {
        const psCommand = `Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | ForEach-Object { Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ServerAddresses ('${d1}','${d2}') }`;
        
        exec(`powershell -ExecutionPolicy Bypass -Command "${psCommand}"`, (error, stdout, stderr) => {
            if (error) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
});

ipcMain.handle('stop-vpn', async () => {
    return new Promise((resolve) => {
        const psCommand = `Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | ForEach-Object { Set-DnsClientServerAddress -InterfaceIndex $_.ifIndex -ResetServerAddresses }`;
        
        exec(`powershell -ExecutionPolicy Bypass -Command "${psCommand}"`, (error, stdout, stderr) => {
            if (error) {
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
});

ipcMain.handle('ping', (event, ip) => {
    return new Promise(resolve => {
        exec(`ping -n 1 -w 1000 ${ip}`, (err, stdout) => {
            const match = stdout.match(/time[=|<](\d+)ms/i);
            resolve(match ? `${match[1]}ms` : '...');
        });
    });
});
