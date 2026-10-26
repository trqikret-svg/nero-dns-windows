const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('AndroidBridge', {
    getApiUrl: () => 'https://yourdomain.com/api.php', 
    getPrimaryDns: () => '202.133.91.159',
    getSecondaryDns: () => '82.22.175.205',
    openBot: () => shell.openExternal('https://t.me/Nerodnsbot'),
    triggerHaptic: () => {}, 
    getNetworkType: () => 'Windows PC',
    getLivePing: (ip) => ipcRenderer.invoke('ping', ip),
    startVpn: async (d1, d2) => {
        const success = await ipcRenderer.invoke('start-vpn', d1, d2);
        if(window.setConnectionState) window.setConnectionState(success);
    },
    stopVpn: async () => {
        const success = await ipcRenderer.invoke('stop-vpn');
        if(window.setConnectionState) window.setConnectionState(!success);
    }
});
