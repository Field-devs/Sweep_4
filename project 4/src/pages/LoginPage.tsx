import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/auth';
import { ThemeToggle } from '../components/ThemeToggle';
import { RegisterModal } from '../components/RegisterModal';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { useTheme } from '../hooks/useTheme';
import { Eye, EyeOff } from 'lucide-react';
import { formatCPF } from '../utils/validation';

export function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!identifier || !password) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }
    
    try {
      const cleanIdentifier = identifier.trim();
      const isCPF = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(cleanIdentifier);
      
      if (isCPF) {
        const cleanCPF = cleanIdentifier.replace(/\D/g, '');
        if (cleanCPF.length !== 11 || !validateCPF(cleanCPF)) {
          setError('CPF inválido');
          setLoading(false);
          return;
        }
      } else {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanIdentifier)) {
          setError('Email inválido');
          setLoading(false);
          return;
        }
      }
      
      await auth.login(cleanIdentifier, password);
      localStorage.setItem('user', cleanIdentifier);
      navigate('/routes');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Check if input looks like a CPF (only numbers and formatting characters)
    if (/^[0-9.-]*$/.test(value) && !/[@]/.test(value)) {
      setIdentifier(formatCPF(value));
    } else {
      setIdentifier(value);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center" style={{
      backgroundImage: "url('https://static.wixstatic.com/media/0cc329_259a6118ee914ed7a5dee69a9e3ef525~mv2.jpeg')"
    }}>
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="min-h-screen flex items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-lg p-6 sm:p-8 w-full max-w-md relative shadow-xl">
          <img
            src={isDark 
              ? "https://static.wixstatic.com/media/0cc329_0d3cd276e35f472296929bc8f561526c~mv2.png"
              : "https://static.wixstatic.com/media/0cc329_044d02e00b1b410f8019a03692f4d159~mv2.png"
            }
            alt="Logo"
            className="h-auto w-24 sm:w-32 mx-auto mb-4 object-contain"
          />
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <input
              type="text"
              placeholder="Email ou CPF"
              value={identifier}
              autoComplete="username"
              onChange={handleIdentifierChange}
              className="w-full p-3 sm:p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 relative z-20 text-gray-900 dark:text-white"
            />
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 sm:p-4 pr-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 sm:p-4 rounded-lg bg-blue-500 text-white font-bold hover:bg-blue-600 active:bg-blue-700"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <div className="flex flex-col sm:flex-row justify-between mt-4 space-y-2 sm:space-y-0">
            <button
              className="text-blue-500 hover:text-blue-600 dark:text-white dark:hover:text-gray-200 text-sm sm:text-base"
              onClick={() => setIsForgotPasswordOpen(true)}
            >
              Esqueci minha senha
            </button>
            <button
              className="text-blue-500 hover:text-blue-600 dark:text-white dark:hover:text-gray-200 text-sm sm:text-base"
              onClick={() => setIsRegisterOpen(true)}
            >
              Cadastrar
            </button>
          </div>
        </div>
      </div>
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
    </div>
  );
}