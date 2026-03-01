import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import './MenuManager.css';

function MenuManager() {
  const [menu, setMenu] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');

  // load data on mount
  useEffect(() => {
    storage.getMenu().then(setMenu).catch(console.error);
    storage.getRecipes().then(setRecipes).catch(console.error);
  }, []);


  // if other components emit an event, pull fresh menu from server
  useEffect(() => {
    const handler = () => {
      storage.getMenu().then(setMenu).catch(console.error);
    };
    window.addEventListener('menuUpdated', handler);
    return () => window.removeEventListener('menuUpdated', handler);
  }, []);


  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const removeMeal = (mealId, name) => {
    if (window.confirm(`Retirer "${name}" du menu ?`)) {
      const updatedMenu = Array.isArray(menu) ? menu.filter(meal => meal.id !== mealId) : [];
      setMenu(updatedMenu);
      storage.setMenu(updatedMenu).catch(console.error);
      window.dispatchEvent(new Event('menuUpdated'));
      setNotificationText(`"${name}" retiré du menu`);
      setShowNotification(true);
    }
  };

  const clearWeek = () => {
    if (window.confirm('Effacer tout le menu ?')) {
      setMenu([]);
      storage.setMenu([]).catch(console.error);
      window.dispatchEvent(new Event('menuUpdated'));
      setNotificationText('Menu de la semaine effacé');
      setShowNotification(true);
    }
  };

  const menuArray = Array.isArray(menu) ? menu : [];

  return (
    <div className="menu-manager">
      {showNotification && (
        <div className="notification-toast">
          ✅ {notificationText}
        </div>
      )}
      
      {selectedRecipeId === null ? (
        <>
          <div className="menu-header">
        <h3>Menu de la semaine</h3>
        {menuArray.length > 0 && (
          <span className="meal-count">{menuArray.length} recettes</span>
        )}
      </div>

      {menuArray.length === 0 ? (
        <div className="empty-state">
          <p>Aucune recette ajoutée pour le moment. Allez dans l'onglet « Recettes » et cliquez sur "📅 Ajouter au menu" pour commencer !</p>
        </div>
      ) : (
        <div className="meals-list-container">
          <ul className="meals-list">
            {menuArray.map(meal => (
              <li key={meal.id} className="meal-item">
                <div className="meal-header">
                  <span className="meal-name meal-name-clickable"
                        onClick={() => setSelectedRecipeId(meal.recipeId)}
                      >
                        {meal.name}
                      </span>
                  {meal.type === 'Recette' && meal.ingredients && (
                    <div className="meal-ingredients-preview">
                      {meal.ingredients.slice(0, 2).map((ing, idx) => (
                        <span key={idx} className="ingredient-tag">
                          {ing.name}
                        </span>
                      ))}
                      {meal.ingredients.length > 2 && (
                        <span className="ingredient-tag">+{meal.ingredients.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => removeMeal(meal.id, meal.name)}
                  className="btn-delete"
                  title="Supprimer la recette"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button onClick={clearWeek} className="btn-secondary">
            🗑️ Effacer le menu
          </button>
        </div>
      )}
        </>
      ) : (
        (() => {
          const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
          if (!selectedRecipe) return null;

          return (
            <div className="recipe-detail-view">
              <div className="recipe-detail-header">
                <button onClick={() => setSelectedRecipeId(null)} className="btn-back">
                  ← Retour au menu
                </button>
              </div>

              <div className="recipe-detail-card">
                <div className="recipe-detail-title">
                  <h3>{selectedRecipe.name}</h3>
                  {selectedRecipe.websiteLink && (
                    <a href={selectedRecipe.websiteLink} target="_blank" rel="noopener noreferrer" className="recipe-link">
                      🔗
                    </a>
                  )}
                </div>

                <div className="recipe-detail-section">
                  <h4>Ingrédients</h4>
                  <ul className="ingredients-list">
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <li key={idx}>
                        {ing.quantity} {ing.unit} {ing.name}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="recipe-detail-section">
                  <h4>Étapes</h4>
                  <ol className="steps-list">
                    {selectedRecipe.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}

export default MenuManager;
