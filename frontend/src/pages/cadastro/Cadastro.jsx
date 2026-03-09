import { useState } from 'react';

import { jwtDecode } from 'jwt-decode';
import {
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { GoogleLogin } from '@react-oauth/google';

import {
  cadastrarUsuario,
  loginComGoogle,
} from '../../handleUsuarios';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);  
  const [erro, setErro] = useState('');

  const navegar = useNavigate();

  const lidarComSubmit = async (e) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      return setErro('As senhas não coincidem.');
    }

    try {
      await cadastrarUsuario({ nome, email, senha });
      alert('Cadastro realizado com sucesso! Faça login.');
      navegar('/login');
    } catch {
      setErro('Erro ao cadastrar. E-mail pode já estar em uso.');
    }
  };

  const lidarComLoginGoogle = async (credencialResponse) => {
    try {
      const dadosDecodificados = jwtDecode(credencialResponse.credential);
      
      const resposta = await loginComGoogle({ 
        email: dadosDecodificados.email, 
        nome: dadosDecodificados.name 
      });
      
      localStorage.setItem('usuarioId', resposta.usuario.id);
      navegar('/busca');
      
    } catch {
      setErro('Erro ao autenticar com o servidor do Google.');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-dark text-light">
      <div className="card bg-dark text-light border-secondary p-4 shadow-lg" style={{ width: '450px', borderRadius: '12px' }}>
        <h2 className="text-center h4 mb-4">Cadastro</h2>
        
        {erro && <div className="alert alert-danger py-2">{erro}</div>}
        
        <form onSubmit={lidarComSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small mb-1">Email:</label>
            <input 
              type="email" 
              className="form-control bg-dark text-light border-secondary" 
              placeholder="Coruja@leitora.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small mb-1">Nome de usuário:</label>
            <input 
              type="text" 
              className="form-control bg-dark text-light border-secondary" 
              placeholder="Coruja Leitora"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required 
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label text-secondary small mb-1">Senha:</label>
            <div className="input-group">
              <input 
                type={mostrarSenha ? "text" : "password"} 
                className="form-control bg-dark text-light border-secondary border-end-0" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="btn btn-outline-secondary bg-dark text-light border-secondary border-start-0" 
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small mb-1">Confirmar Senha:</label>
            <div className="input-group">
              <input 
                type={mostrarConfirmarSenha ? "text" : "password"} 
                className="form-control bg-dark text-light border-secondary border-end-0" 
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="btn btn-outline-secondary bg-dark text-light border-secondary border-start-0" 
                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
              >
                {mostrarConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <div className="d-flex justify-content-between border-top border-secondary pt-4 mb-4">
            <button type="submit" className="btn btn-primary px-4">Cadastrar</button>
            <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navegar('/')}>Cancelar</button>
          </div>
          
          <div className="d-flex justify-content-center w-100">
            <GoogleLogin
              onSuccess={lidarComLoginGoogle}
              onError={() => setErro('Falha ao conectar com o Google.')}
              useOneTap={false}
              theme="filled_black"
              shape="pill"
            />
          </div>
        </form>
      </div>
    </div>
  );
}