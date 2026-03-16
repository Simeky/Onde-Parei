import './BemVindo.css';

import { Link } from 'react-router-dom';

import logoOutline from '../../assets/Logo_Onde_Parei_outline.webp';

export default function BemVindo() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-body text-body">
      <div className="text-center mb-4">
        <img src={logoOutline} alt="Coruja Onde Parei" width="180" className="mb-3" />
        <h1 className="h3 font-weight-bold">Onde Parei</h1>
      </div>

      <div className="card bg-body text-body border-secondary p-4 shadow-lg bem-vindo-card">
        <h2 className="text-center h5 mb-4">Bem Vindo!</h2>
        <Link to="/login" className="btn btn-primary w-100 fw-bold rounded-pill">
          Entrar
        </Link>
      </div>
    </div>
  );
}