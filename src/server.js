import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import express from 'express'
import cron from 'node-cron'
import { initDB, storage } from './server/storage.js'

const app = express()
app.use(express.json())

await initDB()

// create initial backup
await storage.createBackup()

// schedule weekly backups every Sunday at 2 AM
cron.schedule('0 2 * * 0', async () => {
  console.log('[scheduler] running weekly backup...')
  await storage.createBackup()
})

app.listen(3001, () => {
  console.log('Server running on port 3001')
})

app.post('/api/menu', async (req, res) => {
    await storage.setMenu(req.body)
    res.json({ success: true })
})

app.post('/api/ingredients', async (req, res) => {
    await storage.setIngredients(req.body)
    res.json({ success: true })
})

app.post('/api/recipes', async (req, res) => {
    await storage.setRecipes(req.body)
    res.json({ success: true })
})

app.post('/api/shopping', async (req, res) => {
    await storage.setShoppingList(req.body)
    res.json({ success: true })
})

app.post('/api/suggestions', async (req, res) => {
    await storage.setSuggestions(req.body)
    res.json({ success: true })
})

app.get('/api/menu', async (req, res) => {
    const menu = await storage.getMenu()
    res.json(menu)
})

app.get('/api/ingredients', async (req, res) => {
    const ingredients = await storage.getIngredients()
    res.json(ingredients)
})

app.get('/api/recipes', async (req, res) => {
    const recipes = await storage.getRecipes()
    res.json(recipes)
})

app.get('/api/shopping', async (req, res) => {
    const list = await storage.getShoppingList()
    res.json(list)
})

app.get('/api/suggestions', async (req, res) => {
    const list = await storage.getSuggestions()
    res.json(list)
})

// Backup endpoints
app.post('/api/backup', async (req, res) => {
  const result = await storage.createBackup()
  res.json(result)
})

app.get('/api/backups', async (req, res) => {
  const backups = await storage.listBackups()
  res.json(backups)
})

app.post('/api/backup/restore/:filename', async (req, res) => {
  const result = await storage.restoreBackup(req.params.filename)
  res.json(result)
})


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// serve build output only if it exists (prevent errors during dev)
const staticDir = path.join(__dirname, 'dist');
try {
  await fs.access(staticDir);
  app.use(express.static(staticDir));

  app.get('*', (req, res) => {
    res.sendFile(path.join(staticDir, 'index.html'))
  });
} catch {
  // dist folder missing; skip static middleware (development mode)
}
