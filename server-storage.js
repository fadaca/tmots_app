const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const backupDir = path.join(__dirname, 'backups');

async function ensureDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(backupDir, { recursive: true });
  } catch (e) {
    console.error('error ensuring directories', e);
  }
}

async function readJSON(fileName, defaultValue) {
  const fullPath = path.join(dataDir, fileName);
  try {
    const raw = await fs.readFile(fullPath, 'utf8');
    const parsed = JSON.parse(raw);
    console.debug('[storage] read', fileName, parsed);
    return parsed;
  } catch (e) {
    if (e.code === 'ENOENT') {
      return defaultValue;
    }
    console.error(`error reading ${fileName}`, e);
    return defaultValue;
  }
}

async function writeJSON(fileName, data) {
  const fullPath = path.join(dataDir, fileName);
  try {
    console.debug('[storage] write', fileName, data);
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`error writing ${fileName}`, e);
  }
}

async function initDB() {
  await ensureDir();
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
  getMenu: async () => {
    const m = await readJSON('menu.json', []);
    return Array.isArray(m) ? m : [];
  },
  setMenu: (m) => writeJSON('menu.json', m),
  getIngredients: async () => {
    const i = await readJSON('ingredients.json', []);
    return Array.isArray(i) ? i : [];
  },
  setIngredients: (i) => writeJSON('ingredients.json', i),
  getRecipes: async () => {
    const r = await readJSON('recipes.json', []);
    return Array.isArray(r) ? r : [];
  },
  setRecipes: (r) => writeJSON('recipes.json', r),
  getShoppingList: async () => {
    const s = await readJSON('shopping.json', []);
    return Array.isArray(s) ? s : [];
  },
  setShoppingList: (l) => writeJSON('shopping.json', l),
  getSuggestions: async () => {
    const s = await readJSON('suggestions.json', []);
    return Array.isArray(s) ? s : [];
  },
  setSuggestions: (l) => writeJSON('suggestions.json', l),
  
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

module.exports = { initDB, storage };