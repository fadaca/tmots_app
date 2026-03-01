import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import './IngredientTracker.css';

function IngredientTracker() {
  const [ingredientsDB, setIngredientsDB] = useState([]);
  const [ingredientsByName, setIngredientsByName] = useState({});
  const [menu, setMenu] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const normalize = (str) => str.trim().toLowerCase();
  const [newIngredientName, setNewIngredientName] = useState('');

  const addIngredientToDB = (name) => {
    const normalized = normalize(name);
    if (!normalized) return;
    if (ingredientsDB.map(normalize).includes(normalized)) return;
    const updated = [...ingredientsDB, name.trim()];
    setIngredientsDB(updated);
    storage.setIngredients(updated).catch(console.error);
  };

  const editIngredientInDB = (oldName, newName) => {
    const normOld = normalize(oldName);
    const normNew = normalize(newName);
    if (!normNew) return;
    // update DB
    const updatedDB = ingredientsDB.map(i => normalize(i) === normOld ? newName.trim() : i);
    setIngredientsDB(updatedDB);
    storage.setIngredients(updatedDB).catch(console.error);

    // update all recipes that use this ingredient
    setRecipes(prevRecipes => {
      const updated = prevRecipes.map(recipe => {
        const newIngredients = recipe.ingredients.map(ing => {
          if (normalize(ing.name) === normOld) {
            return { ...ing, name: newName.trim() };
          }
          return ing;
        });
        return { ...recipe, ingredients: newIngredients };
      });
      storage.setRecipes(updated).catch(console.error);
      return updated;
    });
  };

  const deleteIngredientFromDB = (name) => {
    const normName = normalize(name);
    if (window.confirm(`Supprimer l'ingrédient "${name}" de la base ?`)) {
      const updated = ingredientsDB.filter(i => normalize(i) !== normName);
      setIngredientsDB(updated);
      storage.setIngredients(updated).catch(console.error);
    }
  };

  // load stored values when component mounts
  useEffect(() => {
    storage.getIngredients().then(setIngredientsDB).catch(console.error);
    storage.getMenu().then(setMenu).catch(console.error);
    storage.getRecipes().then(setRecipes).catch(console.error);
  }, []);


  // Aggregate ingredients from recipes in the weekly menu
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

    setIngredientsByName(aggregated);
  }, [menu, recipes]);


  const getTotalQuantity = (ingredient) => {
    const quantities = ingredient.recipes
      .filter(r => r.quantity && !isNaN(r.quantity))
      .map(r => parseFloat(r.quantity));
    
    if (quantities.length === 0) return null;
    
    const total = quantities.reduce((sum, qty) => sum + qty, 0);
    const unit = ingredient.recipes.find(r => r.unit)?.unit || '';
    
    return { total, unit };
  };

  const ingredientList = Object.entries(ingredientsByName)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .map(([name, ingredient]) => ({
      name,
      ...ingredient,
      total: getTotalQuantity(ingredient)
    }));

  return (
    <div className="ingredient-tracker">
      <div className="ingredient-db">
        <h3>Base d'ingrédients</h3>
        {ingredientsDB.length === 0 ? (
          <p className="empty-message">La base est vide. Les ingrédients saisis dans les recettes y seront ajoutés automatiquement.</p>
        ) : (
          <ul className="ingredient-db-list">
            {ingredientsDB.map((ing, idx) => (
              <li key={idx} className="ingredient-db-item">
                <span className="ingredient-name-display">{ing}</span>
                <button
                  className="btn-secondary-small"
                  onClick={() => {
                    const newVal = window.prompt('Nouvelle orthographe pour l\'ingrédient:', ing);
                    if (newVal && newVal.trim() && newVal.trim() !== ing) {
                      editIngredientInDB(ing, newVal);
                    }
                  }}
                >
                  ✏️
                </button>
                <button
                  className="btn-delete-small"
                  onClick={() => deleteIngredientFromDB(ing)}
                >
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="ingredient-db-add">
          <input
            type="text"
            value={newIngredientName}
            placeholder="Ajouter un ingrédient à la base"
            onChange={(e) => setNewIngredientName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addIngredientToDB(newIngredientName);
                setNewIngredientName('');
              }
            }}
          />
          <button
            className="btn-primary"
            onClick={() => {
              addIngredientToDB(newIngredientName);
              setNewIngredientName('');
            }}
          >
            ➕ Ajouter
          </button>
        </div>
      </div>

      <div className="ingredient-header">
        <h3>Ingrédients nécessaires</h3>
        <p className="ingredient-subtitle">Ingrédients provenant des recettes de votre menu hebdomadaire</p>
      </div>

      <div className="ingredient-list">
        {ingredientList.length === 0 ? (
          <p className="empty-message">Aucune recette n'a encore été ajoutée au menu de la semaine</p>
        ) : (
          ingredientList.map(ingredient => (
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

              <div className="recipe-list">
                {ingredient.recipes.map((recipeUsage, idx) => (
                  <div key={idx} className="recipe-usage">
                    <div className="usage-details">
                      <span className="recipe-name">{recipeUsage.recipeName}</span>
                    </div>
                    <div className="usage-quantity">
                      <span className="quantity-badge">
                        {recipeUsage.quantity} {recipeUsage.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {ingredientList.length > 0 && (
        <div className="ingredient-summary">
          <p>Nombre d'ingrédients uniques requis : <strong>{ingredientList.length}</strong></p>
          <p>Total des utilisations de recettes : <strong>{ingredientList.reduce((sum, ing) => sum + ing.recipes.length, 0)}</strong></p>
        </div>
      )}
    </div>
  );
}

export default IngredientTracker;
