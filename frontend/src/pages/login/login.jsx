import './Login.css';

import { useState } from 'react';

import { jwtDecode } from 'jwt-decode';
import {
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import {
  Link,
  useNavigate,
} from 'react-router-dom';

import { GoogleLogin } from '@react-oauth/google';

import {
  fazerLogin,
  loginComGoogle,
} from '../../handleUsuarios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const navegar = useNavigate();

  const lidarComSubmit = async (e) => {
    e.preventDefault();
    try {
      const resposta = await fazerLogin({ email, senha });
      localStorage.setItem('usuarioId', resposta.usuario.id);
      navegar('/busca'); 
    } catch {
      setErro('E-mail ou senha incorretos.');
    }
  };

  const lidarComLoginGoogle = async (credencialResponse) => {
    try {
      const dadosDecodificados = jwtDecode(credencialResponse.credential);
      
      const resposta = await loginComGoogle({ 
        email: dadosDecodificados.email
      });

      localStorage.setItem('usuarioId', resposta.usuario.id);
      navegar('/busca');
    } catch {
      setErro('Erro ao autenticar com o servidor do Google.');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-body text-body">
      <div className="card bg-body border-secondary p-4 shadow-lg login-card">
        <h2 className="text-center h4 mb-4">Login</h2>
        
        {erro && <div className="alert alert-danger py-2">{erro}</div>}
        
        <form onSubmit={lidarComSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small mb-1">Email</label>
            <input 
              type="email" 
              className="form-control bg-body text-body border-secondary" 
              placeholder="coruja@leitora.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label text-secondary small mb-1">Senha</label>
            <div className="input-group">
              <input 
                type={mostrarSenha ? "text" : "password"} 
                className="form-control bg-body border-secondary border-end-0" 
                placeholder="***************"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="btn btn-outline-secondary bg-body text-body border-secondary border-start-0"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary w-100 mb-3">Login</button>
        </form>
        
        <div className="text-center border-top border-secondary pt-3">
          <Link to="/cadastro" className="text-decoration-none text-primary d-block mb-3">
            Não possui conta? Cadastre-se
          </Link>
          
          <div className="d-flex justify-content-center w-100">
            <GoogleLogin
              onSuccess={lidarComLoginGoogle}
              onError={() => setErro('Falha ao conectar com o Google.')}
              useOneTap={false}
              shape="pill"
            />
          </div>
        </div>
      </div>
    </div>
  );
}