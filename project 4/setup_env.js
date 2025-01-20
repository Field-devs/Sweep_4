// Environment setup for React Native
const fs = require('fs');
const path = require('path');

// Ensure android directory exists
const androidDir = path.join(__dirname, 'android');
if (!fs.existsSync(androidDir)) {
  fs.mkdirSync(androidDir, { recursive: true });
}

// Ensure ios directory exists
const iosDir = path.join(__dirname, 'ios');
if (!fs.existsSync(iosDir)) {
  fs.mkdirSync(iosDir, { recursive: true });
}

// Set environment variables
process.env.LANG = 'C.UTF-8';
process.env.LANGUAGE = 'C.UTF-8';
process.env.LC_ALL = 'C.UTF-8';

// Node.js memory settings
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// React Native specific
process.env.REACT_EDITOR = 'code';