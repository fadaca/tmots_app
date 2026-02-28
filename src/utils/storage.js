// Local storage utilities for persisting data

const STORAGE_KEYS = {
  MENU: 'tmots_weekly_menu',
  INGREDIENTS: 'tmots_ingredients',
  SHOPPING_LIST: 'tmots_shopping_list'
};

export const storage = {
  // Menu operations
  getMenu: () => {
    const data = localStorage.getItem(STORAGE_KEYS.MENU);
    return data ? JSON.parse(data) : {};
  },

  setMenu: (menu) => {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menu));
  },

  // Ingredients operations
  getIngredients: () => {
    const data = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    return data ? JSON.parse(data) : [];
  },

  setIngredients: (ingredients) => {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  },

  // Shopping list operations
  getShoppingList: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SHOPPING_LIST);
    return data ? JSON.parse(data) : [];
  },

  setShoppingList: (list) => {
    localStorage.setItem(STORAGE_KEYS.SHOPPING_LIST, JSON.stringify(list));
  },

  // Clear all data
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};
