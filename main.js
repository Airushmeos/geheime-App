const { app, BrowserWindow, Menu, shell, Notification, Tray, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const https = require("https");

let ftpWindow, appWindow, streamWindow, kiWindow, emailWindow, massagerWindow, loginWindow, massageWindow, ftp2Window;
let tray = null;

const userDataPath = app.getPath("userData");
const htmlSavePath = path.join(userDataPath, "login.html");
const htmlDownloadUrl = "https://myfirstwebsite.lima-city.at/passwort/login.html";

// 🧩 Funktion zum Herunterladen und Speichern von HTML
function loadOrDownloadHTML(callback) {
    if (fs.existsSync(htmlSavePath)) {
        console.log("📂 Lokale HTML-Datei gefunden.");
        callback();
    } else {
        console.log("🌐 HTML wird heruntergeladen...");
        https.get(htmlDownloadUrl, res => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                fs.writeFileSync(htmlSavePath, data);
                console.log("✅ HTML gespeichert unter:", htmlSavePath);
                callback();
            });
        }).on("error", err => {
            console.error("❌ Fehler beim Download:", err.message);
            callback(); // Trotzdem App starten
        });
    }
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

// 🧠 Fenster Funktionen
function createWindowapp() {
    appWindow = createWindow("https://myfirstwebsite.lima-city.at/app", appWindow, "App");
}

function createWindowftp() {
    ftpWindow = createWindow("https://myfirstwebsite.lima-city.at/ftp", ftpWindow, "FTP");
}

function createWindowStream() {
    streamWindow = createWindow("https://myfirstwebsite.lima-city.at/stream", streamWindow, "Stream");
}

function createWindowKI() {
    kiWindow = createWindow("https://myfirstwebsite.lima-city.at/KI/%C3%B6ffentlich.html", kiWindow, "KI");
}

function createWindowemail() {
    emailWindow = createWindow("https://myfirstwebsite.lima-city.at/email/", emailWindow, "E-Mail");
}

function createWindowmassager() {
    massagerWindow = createWindow("https://myfirstwebsite.lima-city.at/chat/", massagerWindow, "Chat");
}

function createWindowlogin() {
    loginWindow = createWindow("https://myfirstwebsite.lima-city.at/passwort/login.html", loginWindow, "Login");
}

function createWindowmassages() {
    massageWindow = createWindow("https://myfirstwebsite.lima-city.at/passwort/massages.html", massageWindow, "Massages");
}

function createWindowftp2() {
    massageWindow = createWindow("https://myfirstwebsite.lima-city.at/ftp2", ftp2Window, "FTP2");
}

// 🧠 Mitteilung senden
function sendNotification(body) {
    const iconPath = path.join(__dirname, 'icon.png'); // Stelle sicher, dass das Icon im gleichen Verzeichnis wie dein main.js liegt

    new Notification({
        title: "Meine App2",
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
            { label: "App", click: createWindowapp },
            { label: "FTP", click: createWindowftp },
            { label: "Stream", click: createWindowStream },
            { label: "KI", click: createWindowKI },
            { label: "E-Mail", click: createWindowemail },
            { label: "Chat", click: createWindowmassager },
            { label: "Login", click: createWindowlogin },
            { label: "Massages", click: createWindowmassages },
            { label: "FTP2", click: createWindowftp2 }
        ],
    },
];

// 🚀 App starten
app.whenReady().then(() => {
    loadOrDownloadHTML(() => {
        createWindowftp();
    });

    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

    // 🎯 Tray aktivieren
    tray = new Tray(path.join(__dirname, "icon.png")); // PNG oder ICO verwenden
    tray.setToolTip("Meine App2");
    tray.setContextMenu(
        Menu.buildFromTemplate([
            { label: "Öffne App", click: createWindowftp },
            { label: "Beenden", click: () => app.quit() },
        ])
    );

    // 📣 Alle 5 Minuten Notification senden
    setInterval(() => {
        sendNotification("App läuft im Hintergrund!");
    }, 1 * 60 * 1000); // 1 Minute
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