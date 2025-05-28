const { app, BrowserWindow, Menu, shell, Notification, Tray, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const https = require("https");

let ftpWindow, mainWindow;
let tray = null;


const statusPath = path.join(app.getPath('userData'), 'app_status.json');

// Funktion zum Status-Prüfen
function isAppLocked() {
    try {
        const data = fs.readFileSync(statusPath);
        const json = JSON.parse(data);
        return json.locked === true;
    } catch (err) {
        return false; // Falls Datei nicht existiert oder fehlerhaft ist
    }
}

// Funktion zum Status-Speichern
function saveAppClosedFlag() {
    fs.writeFileSync(statusPath, JSON.stringify({ locked: true }));
}

// 📌 Funktion zum Erstellen eines Fensters
function createWindow(url, refVar, title) {
    if (refVar && !refVar.isDestroyed()) {
        refVar.focus();
        return;
    }

    const newWin = new BrowserWindow({
        width: 800,
        height: 600,
        title: title,
        webPreferences: { nodeIntegration: true },
    });

    newWin.loadURL(url);

    newWin.on("closed", () => {
        refVar = null;
    });

    return newWin;
}

function createWindowftp2() {
    massageWindow = createWindow("https://myfirstwebsite.lima-city.at/ftp2", ftp2Window, "FTP2");
}

function Windows() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadURL('https://example.com');
    // Wenn App in den Hintergrund geht:
    mainWindow.on('blur', () => {
        console.log('🔒 App wird blockiert und geschlossen.');
        saveAppClosedFlag(); // Flag setzen
        app.quit();          // App sofort beenden
    });
}

function zurücksetzen() {
    fs.writeFileSync(statusPath, JSON.stringify({ locked: false }));
    sendNotification('Es wurde Zurückgesetzt.');
}

// 🧠 Mitteilung senden
function sendNotification(body) {
    const iconPath = path.join(__dirname, 'icon.png'); // Stelle sicher, dass das Icon im gleichen Verzeichnis wie dein main.js liegt

    new Notification({
        title: "Meine App3",
        body: body,
        icon: iconPath,  // Das Icon für die Benachrichtigung
    }).show();
}

// 🍔 Menü
const menuTemplate = [
    {
        label: "Datei",
        submenu: [{ role: "quit", label: "Beenden" }],
    },
    {
        label: "Hilfe",
        submenu: [
            {
                label: "Website besuchen",
                click: () => shell.openExternal("https://myfirstwebsite.lima-city.at"),
            },
        ],
    },
    {
        label: "Seiten",
        submenu: [
            //{ label: "FTP2", click: createWindowftp2 },
            { label: "Seite", click: Windows },
            { label: "Zurücksetzen", click: zurücksetzen },
        ],
    },
];

// 🚀 App starten
app.whenReady().then(() => {
    if (isAppLocked()) {
        console.log('🚫 App wurde vorher geschlossen – darf nicht mehr geöffnet werden!');
        app.quit();
        return;
    }
    loadOrDownloadHTML(() => {
        // createWindowftp();
        Windows();
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

    // 🎯 Tray aktivieren
    tray = new Tray(path.join(__dirname, "icon.png")); // PNG oder ICO verwenden
    tray.setToolTip("Meine App3");
    tray.setContextMenu(
        Menu.buildFromTemplate([
            { label: "Öffne App", click: createWindowftp },
            { label: "Beenden", click: () => app.quit() },
        ])
    );

    // // 📣 Alle 5 Minuten Notification senden
    // setInterval(() => {
    //     sendNotification("App läuft im Hintergrund!");
    // }, 1 * 60 * 1000); // 1 Minute
});

// 🧼 App beenden verhindern, wenn Fenster geschlossen wird
app.on("window-all-closed", (e) => {
    // Kein Quit bei Windows oder Linux
    e.preventDefault();
});

// 🔁 MacOS
app.on("activate", () => {
    if (!ftpWindow) createWindowftp();
});

// ipcMain Listener für Benachrichtigungen
ipcMain.on('send-notification', (event, body) => {
    sendNotification(body);
});