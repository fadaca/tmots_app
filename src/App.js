import React, { useState, useEffect } from 'react';
import './App.css';
import MenuManager from './components/MenuManager';
import RecipeManager from './components/RecipeManager';
import IngredientTracker from './components/IngredientTracker';
import ShoppingList from './components/ShoppingList';
import { storage } from './utils/storage';

function App() {
  const [activeTab, setActiveTab] = useState('recettes');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const [backups, setBackups] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');

  // load suggestions from server
  useEffect(() => {
    storage.getSuggestions().then(setSuggestions).catch(console.error);
  }, []);

  const loadBackupsFromFolder = async () => {
    try {
      setBackupLoading(true);
      const backupList = await storage.listBackups();
      setBackups(backupList);
    } catch (e) {
      console.error('error loading backups', e);
      setBackupMessage('Erreur lors du chargement des sauvegardes');
    } finally {
      setBackupLoading(false);
    }
  };

  const createManualBackup = async () => {
    try {
      setBackupLoading(true);
      const result = await storage.createBackup();
      if (result.success) {
        setBackupMessage(`Sauvegarde créée: ${result.file}`);
        await loadBackupsFromFolder();
      } else {
        setBackupMessage('Erreur lors de la création de la sauvegarde');
      }
    } catch (e) {
      console.error('error creating backup', e);
      setBackupMessage('Erreur lors de la création de la sauvegarde');
    } finally {
      setBackupLoading(false);
    }
  };

  const restoreFromBackup = async (filename) => {
    if (!window.confirm(`Êtes-vous sûr? Cela va remplacer tous les données actuelles par la sauvegarde du ${filename}`)) {
      return;
    }
    try {
      setBackupLoading(true);
      const result = await storage.restoreBackup(filename);
      if (result.success) {
        setBackupMessage(`Restauration effectuée depuis ${filename}`);
        // Reload the page to reflect changes
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setBackupMessage('Erreur lors de la restauration');
      }
    } catch (e) {
      console.error('error restoring backup', e);
      setBackupMessage('Erreur lors de la restauration');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleShowBackups = () => {
    setShowBackups(true);
    setBackupMessage('');
    loadBackupsFromFolder();
  };

  const addSuggestion = (text) => {
    if (!text || !text.trim()) return;
    const updated = [...suggestions, text.trim()];
    setSuggestions(updated);
    storage.setSuggestions(updated).catch(console.error);
  };

  const deleteSuggestion = (index) => {
    const updated = suggestions.filter((_, i) => i !== index);
    setSuggestions(updated);
    storage.setSuggestions(updated).catch(console.error);
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
        <button
          className="tab-button"
          onClick={handleShowBackups}
        >
          💾 Sauvegardes
        </button>
      </footer>

      {showBackups && (
        <div className="suggestions-modal">
          <div className="suggestions-content" style={{ maxWidth: '500px' }}>
            <h3>💾 Gestion des sauvegardes</h3>
            
            <div className="backup-actions" style={{ marginBottom: '20px' }}>
              <button
                className="btn-primary"
                onClick={createManualBackup}
                disabled={backupLoading}
                style={{ width: '100%', padding: '12px' }}
              >
                {backupLoading ? '⏳ Création en cours...' : '➕ Créer une sauvegarde maintenant'}
              </button>
            </div>

            {backupMessage && (
              <div className="backup-message" style={{
                padding: '12px',
                marginBottom: '15px',
                backgroundColor: '#e8f5e9',
                borderLeft: '4px solid #4caf50',
                borderRadius: '4px',
                color: '#2e7d32',
                fontSize: '0.9rem'
              }}>
                ✅ {backupMessage}
              </div>
            )}

            <div style={{
              borderTop: '1px solid #ddd',
              paddingTop: '15px',
              marginTop: '15px'
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.1rem' }}>Sauvegardes disponibles ({backups.length})</h4>
              
              {backupLoading && backups.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666' }}>⏳ Chargement des sauvegardes...</p>
              ) : backups.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>Aucune sauvegarde trouvée</p>
              ) : (
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  backgroundColor: '#fafafa'
                }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {backups.map((backup, idx) => {
                      // Parse timestamp from filename: backup-2026-03-01-14-30-50.json
                      const match = backup.match(/backup-(\\d{4})-(\\d{2})-(\\d{2})-(\\d{2})-(\\d{2})-(\\d{2})\\.json/);
                      let displayDate = backup;
                      if (match) {
                        const [, year, month, day, hour, min, sec] = match;
                        displayDate = `${day}/${month}/${year} à ${hour}:${min}:${sec}`;
                      }
                      
                      const isNewest = idx === 0;
                      return (
                        <li
                          key={idx}
                          style={{
                            padding: '12px 15px',
                            borderBottom: idx < backups.length - 1 ? '1px solid #e0e0e0' : 'none',
                            backgroundColor: isNewest ? '#e3f2fd' : idx % 2 === 0 ? '#fafafa' : '#fff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isNewest ? '#bbdefb' : (idx % 2 === 0 ? '#f5f5f5' : '#efefef');
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isNewest ? '#e3f2fd' : (idx % 2 === 0 ? '#fafafa' : '#fff');
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '0.95rem',
                              fontWeight: isNewest ? '600' : '400',
                              color: '#333',
                              wordBreak: 'break-all'
                            }}>
                              {displayDate}
                            </div>
                            {isNewest && (
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#1976d2',
                                marginTop: '4px',
                                fontWeight: '500'
                              }}>
                                🏆 La plus récente
                              </div>
                            )}
                          </div>
                          <button
                            className="btn-secondary-small"
                            onClick={() => restoreFromBackup(backup)}
                            disabled={backupLoading}
                            style={{
                              whiteSpace: 'nowrap',
                              padding: '6px 12px',
                              marginLeft: 'auto',
                              flexShrink: 0
                            }}
                          >
                            🔄 Restaurer
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                className="btn-secondary"
                onClick={() => setShowBackups(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

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
