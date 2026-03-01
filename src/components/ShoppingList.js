import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import './ShoppingList.css';

function ShoppingList() {
  const [items, setItems] = useState([]);
  const [itemInput, setItemInput] = useState('');
  const [menu, setMenu] = useState([]);
  const [ingredientsNeeded, setIngredientsNeeded] = useState([]);
  const [recipeFilter, setRecipeFilter] = useState('');

  useEffect(() => {
    storage.getShoppingList().then(setItems).catch(console.error);
    storage.getMenu().then(setMenu).catch(console.error);
  }, []);

  // persist items explicitly in handlers below

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
      .map(([name, ing]) => {
        // Group quantities by unit
        const quantitiesByUnit = {};
        ing.recipes.forEach(r => {
          if (r.quantity && !isNaN(r.quantity)) {
            const unit = r.unit || '';
            if (!quantitiesByUnit[unit]) {
              quantitiesByUnit[unit] = 0;
            }
            quantitiesByUnit[unit] += parseFloat(r.quantity);
          }
        });
        
        // Create array of [quantity, unit] pairs
        const quantityPairs = Object.entries(quantitiesByUnit).map(([unit, qty]) => ({
          quantity: qty,
          unit: unit
        }));
        
        return {
          name,
          ...ing,
          quantityPairs: quantityPairs.length > 0 ? quantityPairs : null
        };
      });
    setIngredientsNeeded(list);
  }, [menu]);

  const addItem = () => {
    if (!itemInput.trim()) return;

    const newItem = {
      id: Date.now(),
      name: itemInput.trim()
    };

    const updated = [...items, newItem];
    setItems(updated);
    storage.setShoppingList(updated).catch(console.error);
    setItemInput('');
  };

  const removeItem = (id) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    storage.setShoppingList(updated).catch(console.error);
  };

  const removeIngredient = (ingredientName) => {
    const updated = ingredientsNeeded.filter(ing => ing.name !== ingredientName);
    setIngredientsNeeded(updated);
  };

  const transferAllIngredients = () => {
    const filteredIngredients = recipeFilter 
      ? ingredientsNeeded.filter(ing => 
          ing.recipes.some(r => r.recipeName.toLowerCase().includes(recipeFilter.toLowerCase()))
        )
      : ingredientsNeeded;

    const newItems = filteredIngredients.map(ingredient => ({
      id: Date.now() + Math.random(),
      name: `${ingredient.displayName}${ingredient.quantityPairs ? ' (' + ingredient.quantityPairs.map(p => `${p.quantity} ${p.unit}`.trim()).join(', ') + ')' : ''}`
    }));

    const updated = [...items, ...newItems];
    setItems(updated);
    storage.setShoppingList(updated).catch(console.error);
  };

  const getUniqueRecipes = () => {
    const recipes = new Set();
    ingredientsNeeded.forEach(ingredient => {
      ingredient.recipes.forEach(r => {
        recipes.add(r.recipeName);
      });
    });
    return Array.from(recipes).sort();
  };

  const clearAll = () => {
    if (window.confirm('Effacer toute la liste de courses ?')) {
      setItems([]);
      storage.setShoppingList([]).catch(console.error);
    }
  };

  const copyToClipboard = () => {
    const listText = items.map(item => `• ${item.name}`).join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(listText).then(() => {
        alert('Liste copiée au presse-papiers!');
      }).catch(() => {
        // fallback if clipboard write fails (e.g. remote session)
        window.prompt('Copiez manuellement cette liste:', listText);
      });
    } else {
      // older browsers or restricted environments
      window.prompt('Copiez manuellement cette liste:', listText);
    }
  };

  const downloadAsText = () => {
    const listText = items.map(item => `• ${item.name}`).join('\n');
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(listText));
    element.setAttribute('download', `liste-de-courses-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="shopping-list-container">

      {ingredientsNeeded.length > 0 && (
        <div className="ingredients-needed">
          <h3>Ingrédients nécessaires</h3>
          
          <div className="ingredients-controls">
            <div className="filter-section">
              <label htmlFor="recipe-filter">Filtrer par recette:</label>
              <select
                id="recipe-filter"
                value={recipeFilter}
                onChange={(e) => setRecipeFilter(e.target.value)}
                className="recipe-filter"
              >
                <option value="">Toutes les recettes</option>
                {getUniqueRecipes().map(recipe => (
                  <option key={recipe} value={recipe}>{recipe}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={transferAllIngredients} 
              className="btn-primary"
              disabled={ingredientsNeeded.length === 0}
            >
              Transférer tous les ingrédients
            </button>
          </div>

          {(recipeFilter ? ingredientsNeeded.filter(ing => 
            ing.recipes.some(r => r.recipeName.toLowerCase().includes(recipeFilter.toLowerCase()))
          ) : ingredientsNeeded).map(ingredient => (
            <div key={ingredient.name} className="ingredient-group">
              <div className="ingredient-header-row">
                <div className="ingredient-info">
                  <h4>{ingredient.displayName}</h4>
                  {ingredient.quantityPairs && (
                    <span className="total-amount">
                      {ingredient.quantityPairs.map((pair, idx) => (
                        <span key={idx}>
                          {pair.quantity} {pair.unit}
                          {idx < ingredient.quantityPairs.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="ingredient-actions">
                  <span className="badge-count">{ingredient.recipes.length} recette{ingredient.recipes.length !== 1 ? 's' : ''}</span>
                  <button 
                    onClick={() => removeIngredient(ingredient.name)}
                    className="btn-delete-small"
                    title="Retirer l'ingrédient"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="recipe-details">
                {ingredient.recipes.map((recipe, idx) => (
                  <span key={idx} className="recipe-tag">
                    {recipe.recipeName}
                  </span>
                ))}
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
              <li key={item.id} className="shopping-item">
                <span className="item-bullet">•</span>
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
          <button onClick={copyToClipboard} className="btn-secondary">Copier</button>
          <button onClick={downloadAsText} className="btn-secondary">Télécharger (.txt)</button>
          <button onClick={clearAll} className="btn-secondary">Tout effacer</button>
        </div>
      )}
    </div>
  );
}

export default ShoppingList;
