const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('AndroidBridge', {
    getApiUrl: () => 'https://yourdomain.com/api.php', 
    getPrimaryDns: () => '202.133.91.159',
    getSecondaryDns: () => '82.22.175.205',
    openBot: () => shell.openExternal('https://t.me/Nerodnsbot'),
    triggerHaptic: () => {}, 
    getNetworkType: () => 'Windows PC',
    getLivePing: (ip) => ipcRenderer.invoke('ping', ip),
    // اینجا تغییر کرد: حالا مستقیم جواب را به HTML برمی‌گرداند
    startVpn: (d1, d2) => ipcRenderer.invoke('start-vpn', d1, d2),
    stopVpn: () => ipcRenderer.invoke('stop-vpn')
});
