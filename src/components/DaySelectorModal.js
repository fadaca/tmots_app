import React from 'react';
import './DaySelectorModal.css';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function DaySelectorModal({ recipeName, onSelect, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Select Day for {recipeName}</h3>
        <p>A quel jour veux-tu ajouter "{recipeName}" ?</p>
        
        <div className="days-grid">
          {DAYS.map(day => (
            <button
              key={day}
              onClick={() => onSelect(day)}
              className="day-button"
            >
              {day}
            </button>
          ))}
        </div>

        <button onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </div>
  );
}

export default DaySelectorModal;
