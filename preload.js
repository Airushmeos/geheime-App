const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');

contextBridge.exposeInMainWorld('myAPI', {
  // Liefert Pfade aller Bilddateien im 'Photos'-Ordner
  getImageFiles: () => {
    const dirPath = path.join(__dirname, 'Photos');
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.heic'];
    const files = fs.readdirSync(dirPath).filter(file =>
      validExtensions.includes(path.extname(file).toLowerCase())
    );
    // Relative Pfade zurückgeben
    return files.map(file => path.join('Photos', file));
  }
});