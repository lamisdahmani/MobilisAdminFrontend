import { LogOut } from 'lucide-react';
import './LogoutModal.css';

export default function LogoutModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="logout-overlay" onClick={onCancel}>
      <div className="logout-modal" onClick={e => e.stopPropagation()}>
        {/* Icon */}
        <div className="logout-icon-wrapper">
          <LogOut size={28} color="var(--color-primary)" />
        </div>

        {/* Text */}
        <h2 className="logout-title">Se déconnecter ?</h2>
        <p className="logout-message">
          Êtes-vous sûr(e) de vouloir quitter votre session administrateur ?
        </p>

        {/* Buttons */}
        <div className="logout-actions">
          <button className="logout-btn-cancel" onClick={onCancel}>
            Annuler
          </button>
          <button className="logout-btn-confirm" onClick={onConfirm}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}