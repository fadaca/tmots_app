import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import './ShoppingList.css';

function ShoppingList() {
  const [items, setItems] = useState(() => storage.getShoppingList());
  const [itemInput, setItemInput] = useState('');
  const [menu] = useState(() => storage.getMenu());
  const [ingredientsNeeded, setIngredientsNeeded] = useState([]);

  useEffect(() => {
    storage.setShoppingList(items);
  }, [items]);

  // aggregate ingredients from menu automatically
  useEffect(() => {
    const aggregated = {};
    const menuArray = Array.isArray(menu) ? menu : [];
    menuArray.forEach(meal => {
      if (meal.type === 'Recette' && meal.ingredients) {
        meal.ingredients.forEach(ingredient => {
          const ingredientName = ingredient.name.toLowerCase().trim();
          if (!aggregated[ingredientName]) {
            aggregated[ingredientName] = {
              displayName: ingredient.name,
              recipes: []
            };
          }
          aggregated[ingredientName].recipes.push({
            recipeName: meal.name,
            quantity: ingredient.quantity || '',
            unit: ingredient.unit || ''
          });
        });
      }
    });
    const list = Object.entries(aggregated)
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([name, ing]) => ({
        name,
        ...ing,
        total: (() => {
          const quantities = ing.recipes
            .filter(r => r.quantity && !isNaN(r.quantity))
            .map(r => parseFloat(r.quantity));
          if (quantities.length === 0) return null;
          const total = quantities.reduce((s,q)=>s+q,0);
          const unit = ing.recipes.find(r=>r.unit)?.unit||'';
          return { total, unit };
        })()
      }));
    setIngredientsNeeded(list);
  }, [menu]);

  const addItem = () => {
    if (!itemInput.trim()) return;

    const newItem = {
      id: Date.now(),
      name: itemInput.trim(),
      checked: false
    };

    setItems([...items, newItem]);
    setItemInput('');
  };



  const toggleItem = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const clearChecked = () => {
    setItems(items.filter(item => !item.checked));
  };

  const clearAll = () => {
    if (window.confirm('Effacer toute la liste de courses ?')) {
      setItems([]);
    }
  };

  const checkedCount = items.filter(item => item.checked).length;

  return (
    <div className="shopping-list-container">
      <div className="shopping-stats">
        <p>
          {checkedCount} sur {items.length} articles achetés
          {items.length > 0 && (
            <span className="progress-bar">
              <span 
                className="progress-fill" 
                style={{ width: `${items.length > 0 ? (checkedCount / items.length) * 100 : 0}%` }}
              ></span>
            </span>
          )}
        </p>
      </div>

      {ingredientsNeeded.length > 0 && (
        <div className="ingredients-needed">
          <h3>Ingrédients nécessaires</h3>
          {ingredientsNeeded.map(ingredient => (
            <div key={ingredient.name} className="ingredient-group">
              <div className="ingredient-header-row">
                <div className="ingredient-info">
                  <h4>{ingredient.displayName}</h4>
                  {ingredient.total && (
                    <span className="total-amount">
                      Total: {ingredient.total.total} {ingredient.total.unit}
                    </span>
                  )}
                </div>
                <span className="badge-count">{ingredient.recipes.length} recette{ingredient.recipes.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="shopping-input-section">
        <h3>Ajouter un article</h3>
        <div className="input-group">
          <input
            type="text"
            value={itemInput}
            onChange={(e) => setItemInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
            placeholder="Ajouter un article à la liste"
            className="shopping-input"
          />
          <button onClick={addItem} className="btn-primary">Ajouter</button>
        </div>
      </div>

      <div className="shopping-items">
        {items.length === 0 ? (
          <p className="empty-message">La liste de courses est vide</p>
        ) : (
          <ul className="items-list">
            {items.map(item => (
              <li key={item.id} className={`shopping-item ${item.checked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(item.id)}
                  className="item-checkbox"
                />
                <span className="item-name">{item.name}</span>
                <button 
                  onClick={() => removeItem(item.id)}
                  className="btn-delete-small"
                  title="Retirer l'article"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="shopping-actions">
          {items.some(item => item.checked) && (
            <button onClick={clearChecked} className="btn-secondary">Supprimer cochés</button>
          )}
          <button onClick={clearAll} className="btn-secondary">Tout effacer</button>
        </div>
      )}
    </div>
  );
}

export default ShoppingList;
