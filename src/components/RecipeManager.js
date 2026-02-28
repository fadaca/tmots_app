import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import './RecipeManager.css';

function RecipeManager() {
  const [recipes, setRecipes] = useState(() => storage.getRecipes());
  const [menu, setMenu] = useState(() => storage.getMenu());
  const [ingredientsDB, setIngredientsDB] = useState(() => storage.getIngredients());
  const [showForm, setShowForm] = useState(false);
  const normalize = (str) => str.trim().toLowerCase();
  const [editingId, setEditingId] = useState(null);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    websiteLink: '',
    steps: ['']
  });

  useEffect(() => {
    storage.setRecipes(recipes);
  }, [recipes]);

  useEffect(() => {
    storage.setIngredients(ingredientsDB);
  }, [ingredientsDB]);

  // initialize ingredient DB from existing recipes at mount
  useEffect(() => {
    const existing = new Set(ingredientsDB.map(i => normalize(i)));
    const toAdd = [];
    recipes.forEach(r => {
      r.ingredients.forEach(ing => {
        const n = ing.name.trim();
        const norm = normalize(n);
        if (n && !existing.has(norm)) {
          existing.add(norm);
          toAdd.push(n);
        }
      });
    });
    if (toAdd.length) {
      setIngredientsDB(prev => [...prev, ...toAdd]);
    }
  }, []);

  useEffect(() => {
    storage.setMenu(menu);
  }, [menu]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => setShowNotification(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleAddIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }));
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const handleAddStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }));
  };

  const handleRemoveStep = (index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const handleStepChange = (index, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = value;
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const saveRecipe = () => {
    if (!formData.name.trim()) {
      alert('Il faut définir un nom pour la recette');
      return;
    }

    if (formData.ingredients.some(ing => !ing.name.trim())) {
      alert('Il faut définir tous les ingrédients créés');
      return;
    }

    if (formData.ingredients.some(ing => !ing.quantity.trim())) {
      alert('Chaque ingrédient doit avoir une quantité');
      return;
    }

    if (formData.steps.some(step => !step.trim())) {
      alert('Toutes les étapes doivent être définies');
      return;
    }

    if (editingId) {
      setRecipes(recipes.map(recipe =>
        recipe.id === editingId
          ? { ...formData, id: editingId }
          : recipe
      ));
      setEditingId(null);
    } else {
      setRecipes([...recipes, { ...formData, id: Date.now() }]);
    }

    // update ingredients database
    const existingNormalized = ingredientsDB.map(i => i.toLowerCase().trim());
    const newNames = formData.ingredients
      .map(ing => ing.name.trim())
      .filter(n => n);
    let updatedDB = [...ingredientsDB];
    newNames.forEach(n => {
      const normalized = n.toLowerCase();
      if (!existingNormalized.includes(normalized)) {
        updatedDB.push(n);
        existingNormalized.push(normalized);
      }
    });
    setIngredientsDB(updatedDB);

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ingredients: [{ name: '', quantity: '', unit: '' }],
      websiteLink: '',
      steps: ['']
    });
    setShowForm(false);
  };

  const editRecipe = (recipe) => {
    setFormData(recipe);
    setEditingId(recipe.id);
    setShowForm(true);
  };

  const deleteRecipe = (id, name) => {
    if (window.confirm(`Supprimer la recette "${name}"?`)) {
      setRecipes(recipes.filter(recipe => recipe.id !== id));
      setNotificationText(`Recette "${name}" supprimée`);
      setShowNotification(true);
    }
  };

  const addRecipeToMenu = (recipe) => {
    const updatedMenu = Array.isArray(menu) ? [...menu] : [];
    
    updatedMenu.push({
      id: Date.now(),
      name: recipe.name,
      type: 'Recette',
      recipeId: recipe.id,
      ingredients: recipe.ingredients,
      steps: recipe.steps
    });

    setMenu(updatedMenu);
    setNotificationText(`"${recipe.name}" ajoutée au menu!`);
    setShowNotification(true);
  };

  return (
    <div className="recipe-manager">
      {showNotification && (
        <div className="notification-toast">
          ✅ {notificationText}
        </div>
      )}
      {!showForm && selectedRecipeId === null ? (
        <>
          <div className="recipes-header">
            <h3>Mes recettes</h3>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              ➕ Créer une recette
            </button>
          </div>

          <div className="recipes-list-simple">
            {recipes.length === 0 ? (
              <p className="empty-message">Aucune recette pour le moment. Créez-en une pour commencer!</p>
            ) : (
              recipes.map(recipe => (
                <div key={recipe.id} className="recipe-list-item">
                  <div className="recipe-list-title" onClick={() => setSelectedRecipeId(recipe.id)}>
                    <h4>{recipe.name}</h4>
                  </div>
                  <button 
                    onClick={() => addRecipeToMenu(recipe)} 
                    className="btn-add-menu"
                    title="Ajouter cette recette au menu"
                  >
                    📅 Ajouter au menu
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      ) : showForm ? (
        <div className="recipe-form">
          <h3>{editingId ? 'Modifier une recette' : 'Créer une nouvelle recette'}</h3>
          <datalist id="ingredient-suggestions">
            {ingredientsDB.map((ing, idx) => (
              <option key={idx} value={ing} />
            ))}
          </datalist>

          <div className="form-section">
            <label>Nom de la recette *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ex. : Spaghetti Carbonara"
            />
          </div>

          <div className="form-section">
            <label>Lien vers le site (optionnel)</label>
            <input
              type="url"
              value={formData.websiteLink}
              onChange={(e) => setFormData(prev => ({ ...prev, websiteLink: e.target.value }))}
              placeholder="https://exemple.com/recette"
            />
          </div>

          <div className="form-section">
            <label>Ingrédients *</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-input-row">
                <input
                  type="text"
                  value={ingredient.name}
                  list="ingredient-suggestions"
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  placeholder="Nom de l'ingrédient"
                  className="ingredient-name"
                />
                <input
                  type="text"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  placeholder="Quantité"
                  className="ingredient-qty"
                />
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  placeholder="Unité"
                  className="ingredient-unit"
                />
                <button
                  onClick={() => handleRemoveIngredient(index)}
                  className="btn-delete-small"
                >
                  ✕
                </button>
              </div>
            ))}
            <button onClick={handleAddIngredient} className="btn-secondary-small">
              + Ajouter un ingrédient
            </button>
          </div>

          <div className="form-section">
            <label>Étapes *</label>
            {formData.steps.map((step, index) => (
              <div key={index} className="step-input-row">
                <span className="step-number">Étape {index + 1} :</span>
                <textarea
                  value={step}
                  onChange={(e) => handleStepChange(index, e.target.value)}
                  placeholder="Décrivez cette étape"
                  className="step-textarea"
                />
                <button
                  onClick={() => handleRemoveStep(index)}
                  className="btn-delete-small"
                >
                  ✕
                </button>
              </div>
            ))}
            <button onClick={handleAddStep} className="btn-secondary-small">
              + Ajouter une étape
            </button>
          </div>

          <div className="form-actions">
            <button onClick={saveRecipe} className="btn-primary">
              {editingId ? '💾 Enregistrer' : '✅ Créer la recette'}
            </button>
            <button onClick={resetForm} className="btn-secondary">
              Annuler
            </button>
          </div>
        </div>
      ) : (
        (() => {
          const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);
          if (!selectedRecipe) return null;

          return (
            <div className="recipe-detail-view">
              <div className="recipe-detail-header">
                <button onClick={() => setSelectedRecipeId(null)} className="btn-back">
                  ← Retour
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

                <div className="recipe-detail-actions">
                  <button 
                    onClick={() => addRecipeToMenu(selectedRecipe)} 
                    className="btn-add-menu"
                  >
                    📅 Ajouter au menu
                  </button>
                  <button onClick={() => editRecipe(selectedRecipe)} className="btn-secondary-small">
                    ✏️ Modifier
                  </button>
                  <button onClick={() => {
                    deleteRecipe(selectedRecipe.id, selectedRecipe.name);
                    setSelectedRecipeId(null);
                  }} className="btn-delete">
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}

export default RecipeManager;
