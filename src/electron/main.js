import { app, BrowserWindow } from 'electron';
import path from 'path';

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 1600,
        height: 980,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    
    // Remove the default menu
    mainWindow.setMenu(null);
});