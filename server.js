const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`
🚀 TMotS App is running!
📱 Local:   http://localhost:${PORT}
🌐 Network: http://<your-raspberry-pi-ip>:${PORT}

To find your Raspberry Pi IP, run: hostname -I
  `);
});
