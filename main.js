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

// اصلاح اسکریپت برای پیدا کردن و اعمال DNS روی تمام کارت‌های شبکه فعال سیستم
ipcMain.handle('start-vpn', async (event, d1, d2) => {
    return new Promise((resolve) => {
        const script = `
        $adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
        $success = $false
        foreach ($adapter in $adapters) {
            try {
                Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses ("${d1}","${d2}") -ErrorAction Stop
                $success = $true
            } catch {}
        }
        if ($success) { Write-Output "SUCCESS" } else { Write-Output "FAIL" }
        `;
        exec(`powershell -Command "${script}"`, (error, stdout) => {
            resolve(!error && stdout.includes("SUCCESS"));
        });
    });
});

ipcMain.handle('stop-vpn', async () => {
    return new Promise((resolve) => {
        const script = `
        $adapters = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' }
        $success = $false
        foreach ($adapter in $adapters) {
            try {
                Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ResetServerAddresses -ErrorAction Stop
                $success = $true
            } catch {}
        }
        if ($success) { Write-Output "SUCCESS" } else { Write-Output "FAIL" }
        `;
        exec(`powershell -Command "${script}"`, (error, stdout) => {
            resolve(!error && stdout.includes("SUCCESS"));
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
