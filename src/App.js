import React, { useState } from 'react';
import './App.css';
import MenuManager from './components/MenuManager';
import RecipeManager from './components/RecipeManager';
import IngredientTracker from './components/IngredientTracker';
import ShoppingList from './components/ShoppingList';

function App() {
  const [activeTab, setActiveTab] = useState('recettes');
  const [suggestions, setSuggestions] = useState(() => {
    const data = localStorage.getItem('tmots_suggestions');
    return data ? JSON.parse(data) : [];
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addSuggestion = (text) => {
    if (!text || !text.trim()) return;
    const updated = [...suggestions, text.trim()];
    setSuggestions(updated);
    localStorage.setItem('tmots_suggestions', JSON.stringify(updated));
  };

  const deleteSuggestion = (index) => {
    const updated = suggestions.filter((_, i) => i !== index);
    setSuggestions(updated);
    localStorage.setItem('tmots_suggestions', JSON.stringify(updated));
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>
          T<span className="calligraphy" style={{ fontSize: '2.5rem' }}>M</span>ot<span className="calligraphy" style={{ fontSize: '2.5rem' }}>S</span>
        </h1>
        <p>The <span className="calligraphy">Menu</span> of the <span className="calligraphy">Semaine</span></p>
      </header>

      <nav className="tabs-nav">
        <button 
          className={`tab-button ${activeTab === 'recettes' ? 'active' : ''}`}
          onClick={() => setActiveTab('recettes')}
        >
          📖 Recettes
        </button>
        <button 
          className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          📅 Menu
        </button>
        <button 
          className={`tab-button ${activeTab === 'shopping' ? 'active' : ''}`}
          onClick={() => setActiveTab('shopping')}
        >
          🛒 Liste des courses
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'recettes' && <RecipeManager />}
        {activeTab === 'menu' && <MenuManager />}
        {activeTab === 'shopping' && <ShoppingList />}
        {activeTab === 'ingrédients' && <IngredientTracker />}
      </main>

      <footer className="bottom-tab">
        <button
          className={`tab-button ${activeTab === 'ingrédients' ? 'active' : ''}`}
          onClick={() => setActiveTab('ingrédients')}
        >
          🥕 Ingrédients
        </button>
        <button
          className="tab-button"
          onClick={() => setShowSuggestions(true)}
        >
          💡 Suggestions
        </button>
      </footer>

      {showSuggestions && (
        <div className="suggestions-modal">
          <div className="suggestions-content">
            <h3>Suggestions d'amélioration</h3>
            <ul>
              {suggestions.map((s, i) => (
                <li key={i}>
                  {s} <button onClick={() => deleteSuggestion(i)} className="btn-delete-small">✕</button>
                </li>
              ))}
            </ul>
            <button
              className="btn-secondary-small"
              onClick={() => {
                const text = window.prompt('Nouvelle suggestion :');
                if (text) addSuggestion(text);
              }}
            >
              ➕ Ajouter
            </button>
            <button className="btn-secondary" onClick={() => setShowSuggestions(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
