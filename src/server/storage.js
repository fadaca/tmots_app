import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// data directory will sit alongside this file (src/server/data)
// use current working directory as root so data/ is always at project root
const dataDir = path.join(process.cwd(), 'data');
const backupDir = path.join(process.cwd(), 'backups');

// utility helpers
async function ensureDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(backupDir, { recursive: true });
  } catch (e) {
    console.error('failed to ensure directories', e);
  }
}

// keep track of pending writes so reads wait until filesystem is stable
let lastWrite = Promise.resolve();

async function writeJSON(fileName, data) {
  const fullPath = path.join(dataDir, fileName);
  const tmpPath = fullPath + '.tmp';
  const doWrite = async () => {
    try {
      await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf8');
      await fs.rename(tmpPath, fullPath);
    } catch (e) {
      console.error(`error writing ${fileName}`, e);
    }
  };
  // chain writes sequentially
  lastWrite = lastWrite.then(doWrite, doWrite);
  return lastWrite;
}

async function readJSON(fileName, defaultValue) {
  // ensure any previous write has finished
  await lastWrite;
  const fullPath = path.join(dataDir, fileName);
  try {
    const raw = await fs.readFile(fullPath, 'utf8');
    try {
      return JSON.parse(raw);
    } catch (parseErr) {
      console.error(`malformed ${fileName}, returning default`, parseErr);
      return defaultValue;
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      return defaultValue;
    }
    console.error(`error reading ${fileName}`, e);
    return defaultValue;
  }
}

// Note: writeJSON defined above now, so remove previous one below

async function initDB() {
  await ensureDir();
  // create files if they don't exist
  const defaults = {
    'menu.json': [],
    'ingredients.json': [],
    'recipes.json': [],
    'shopping.json': [],
    'suggestions.json': []
  };
  for (const [file, def] of Object.entries(defaults)) {
    const p = path.join(dataDir, file);
    try {
      await fs.access(p);
    } catch {
      await writeJSON(file, def);
    }
  }
}


const storage = {
  // menu stored as array
  getMenu: async () => {
    const m = await readJSON('menu.json', []);
    return Array.isArray(m) ? m : [];
  },
  setMenu: (menu) => writeJSON('menu.json', menu),

  getIngredients: () => readJSON('ingredients.json', []),
  setIngredients: (ings) => writeJSON('ingredients.json', ings),

  getRecipes: () => readJSON('recipes.json', []),
  setRecipes: (recipes) => writeJSON('recipes.json', recipes),

  getShoppingList: () => readJSON('shopping.json', []),
  setShoppingList: (list) => writeJSON('shopping.json', list),

  getSuggestions: () => readJSON('suggestions.json', []),
  setSuggestions: (list) => writeJSON('suggestions.json', list),

  // backup all data to a timestamped file
  createBackup: async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const backupFile = `backup-${timestamp}.json`;
      const backupPath = path.join(backupDir, backupFile);
      
      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          menu: await readJSON('menu.json', []),
          ingredients: await readJSON('ingredients.json', []),
          recipes: await readJSON('recipes.json', []),
          shopping: await readJSON('shopping.json', []),
          suggestions: await readJSON('suggestions.json', [])
        }
      };
      
      await fs.writeFile(backupPath, JSON.stringify(backup, null, 2), 'utf8');
      console.log(`[backup] created ${backupFile}`);
      return { success: true, file: backupFile };
    } catch (e) {
      console.error('[backup] error creating backup', e);
      return { success: false, error: e.message };
    }
  },

  // get list of all backups
  listBackups: async () => {
    try {
      const files = await fs.readdir(backupDir);
      const backups = files
        .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
        .sort()
        .reverse();
      return backups;
    } catch (e) {
      console.error('[backup] error listing backups', e);
      return [];
    }
  },

  // restore from a specific backup
  restoreBackup: async (backupFile) => {
    try {
      const backupPath = path.join(backupDir, backupFile);
      const raw = await fs.readFile(backupPath, 'utf8');
      const backup = JSON.parse(raw);
      
      // write all data files
      await writeJSON('menu.json', backup.data.menu || []);
      await writeJSON('ingredients.json', backup.data.ingredients || []);
      await writeJSON('recipes.json', backup.data.recipes || []);
      await writeJSON('shopping.json', backup.data.shopping || []);
      await writeJSON('suggestions.json', backup.data.suggestions || []);
      
      console.log(`[backup] restored from ${backupFile}`);
      return { success: true, file: backupFile, timestamp: backup.timestamp };
    } catch (e) {
      console.error('[backup] error restoring backup', e);
      return { success: false, error: e.message };
    }
  }
};

export { initDB, storage };