const express = require('express');
const path = require('path');
const cron = require('node-cron');
const { initDB, storage } = require('./server-storage');
const app = express();

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// API endpoints for persisted data
app.post('/api/menu', async (req, res) => {
  await storage.setMenu(req.body);
  res.json({ success: true });
});

app.post('/api/ingredients', async (req, res) => {
  await storage.setIngredients(req.body);
  res.json({ success: true });
});

app.post('/api/recipes', async (req, res) => {
  await storage.setRecipes(req.body);
  res.json({ success: true });
});

app.post('/api/shopping', async (req, res) => {
  await storage.setShoppingList(req.body);
  res.json({ success: true });
});

app.post('/api/suggestions', async (req, res) => {
  await storage.setSuggestions(req.body);
  res.json({ success: true });
});

app.get('/api/menu', async (req, res) => {
  const menu = await storage.getMenu();
  res.json(menu);
});

app.get('/api/ingredients', async (req, res) => {
  const ingredients = await storage.getIngredients();
  res.json(ingredients);
});

app.get('/api/recipes', async (req, res) => {
  const recipes = await storage.getRecipes();
  res.json(recipes);
});

app.get('/api/shopping', async (req, res) => {
  const list = await storage.getShoppingList();
  res.json(list);
});

app.get('/api/suggestions', async (req, res) => {
  const list = await storage.getSuggestions();
  res.json(list);
});

// Backup endpoints
app.post('/api/backup', async (req, res) => {
  const result = await storage.createBackup();
  res.json(result);
});

app.get('/api/backups', async (req, res) => {
  const backups = await storage.listBackups();
  res.json(backups);
});

app.post('/api/backup/restore/:filename', async (req, res) => {
  const result = await storage.restoreBackup(req.params.filename);
  res.json(result);
});

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// make sure data directory and files exist before listening
initDB().then(async () => {
  // create initial backup
  await storage.createBackup();
  
  // schedule weekly backups every Sunday at 2 AM
  cron.schedule('0 2 * * 0', async () => {
    console.log('[scheduler] running weekly backup...');
    await storage.createBackup();
  });
  
  app.listen(PORT, HOST, () => {
    console.log(`
🚀 TMotS App is running!
📱 Local:   http://localhost:${PORT}
🌐 Network: http://<your-raspberry-pi-ip>:${PORT}

To find your Raspberry Pi IP, run: hostname -I

📦 Backups are created weekly (Sundays at 2 AM) and on startup.
💾 API endpoints:
  POST /api/backup               - Create a backup now
  GET /api/backups              - List all backups
  POST /api/backup/restore/:filename - Restore a specific backup
  `);
  });
}).catch(err => {
  console.error('failed to initialize storage', err);
});
