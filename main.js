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

ipcMain.handle('start-vpn', async (event, d1, d2) => {
    return new Promise((resolve) => {
        const script = `
        $adapter = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.MacAddress -ne $null -and $_.InterfaceAlias -notmatch 'vEthernet|Loopback|Virtual' } | Select-Object -First 1
        if ($adapter) {
            Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses ("${d1}","${d2}")
            Write-Output "OK"
        } else { Write-Output "Error" }
        `;
        exec(`powershell -Command "${script}"`, (error) => { resolve(!error); });
    });
});

ipcMain.handle('stop-vpn', async () => {
    return new Promise((resolve) => {
        const script = `
        $adapter = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and $_.MacAddress -ne $null -and $_.InterfaceAlias -notmatch 'vEthernet|Loopback|Virtual' } | Select-Object -First 1
        if ($adapter) {
            Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ResetServerAddresses
            Write-Output "OK"
        } else { Write-Output "Error" }
        `;
        exec(`powershell -Command "${script}"`, (error) => { resolve(!error); });
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
