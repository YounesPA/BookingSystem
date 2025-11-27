
// utils/paths.js
const fs = require('fs');
const path = require('path');

function getDataDir() {
  const DATA_DIR = path.join(__dirname, '..', 'data');
  // Ensure the directory exists once
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  return DATA_DIR;
}

module.exports = { getDataDir };
