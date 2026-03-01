// client-side storage wrappers that call the server API
// every method returns a promise; components can await or use .then()

async function apiGet(path) {
  console.debug('[storage] GET', path);
  const res = await fetch(path);
  if (!res.ok) {
    console.error(`[storage] GET ${path} failed (${res.status})`);
    throw new Error(`GET ${path} failed (${res.status})`);
  }
  const json = await res.json();
  console.debug('[storage] GET response', path, json);
  return json;
}

async function apiPost(path, body) {
  console.debug('[storage] POST', path, body);
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    console.error(`[storage] POST ${path} failed (${res.status})`);
    throw new Error(`POST ${path} failed (${res.status})`);
  }
  const json = await res.json();
  console.debug('[storage] POST response', path, json);
  return json;
}

export const storage = {
  getMenu: async () => {
    const m = await apiGet('/api/menu');
    return Array.isArray(m) ? m : [];
  },
  setMenu: (menu) => apiPost('/api/menu', menu),

  getIngredients: () => apiGet('/api/ingredients'),
  setIngredients: (ings) => apiPost('/api/ingredients', ings),

  getRecipes: () => apiGet('/api/recipes'),
  setRecipes: (recipes) => apiPost('/api/recipes', recipes),

  getShoppingList: () => apiGet('/api/shopping'),
  setShoppingList: (list) => apiPost('/api/shopping', list),

  getSuggestions: () => apiGet('/api/suggestions'),
  setSuggestions: (list) => apiPost('/api/suggestions', list),

  // backup endpoints
  createBackup: () => apiPost('/api/backup', {}),
  listBackups: () => apiGet('/api/backups'),
  restoreBackup: (filename) => apiPost(`/api/backup/restore/${encodeURIComponent(filename)}`, {}),

  clearAll: async () => {
    await Promise.all([
      storage.setMenu([]),
      storage.setIngredients([]),
      storage.setRecipes([]),
      storage.setShoppingList([]),
      storage.setSuggestions([])
    ]);
  }
};