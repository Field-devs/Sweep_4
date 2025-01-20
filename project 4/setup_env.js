// Environment setup for React Native
const fs = require('fs');
const path = require('path');

// Ensure the script runs in the correct directory
process.chdir(__dirname);

try {
  // Create necessary directories
  const dirs = [
    path.join(__dirname, 'android', 'app', 'src', 'main', 'assets'),
    path.join(__dirname, 'android', 'app', 'src', 'main', 'res'),
    path.join(__dirname, 'ios')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Set environment variables
  process.env.LANG = 'C.UTF-8';
  process.env.LANGUAGE = 'C.UTF-8';
  process.env.LC_ALL = 'C.UTF-8';

  // Node.js memory settings
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';

  // React Native specific
  process.env.REACT_EDITOR = 'code';

  // Set max workers for Metro bundler
  process.env.REACT_NATIVE_MAX_WORKERS = '2';

  console.log('Environment setup completed successfully');
} catch (error) {
  console.error('Error during environment setup:', error);
  process.exit(1);
}