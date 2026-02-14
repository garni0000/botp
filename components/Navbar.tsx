
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Plus, Menu, X, User, BarChart3, LogOut, LogIn, ShieldAlert } from 'lucide-react';
import { getCurrentSession, logout } from '../services/storageService';
import { AuthSession } from '../types';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      setSession(getCurrentSession());
    };
    
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const handleLogout = () => {
    logout();
    setSession(null);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const isAdmin = session?.user.role === 'admin';

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <Link to="/" className="flex items-center space-x-2 group" onClick={closeMobileMenu}>
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              PayLock
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className={`text-sm font-medium transition-colors ${isActive('/features') ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Features</Link>
            <Link to="/pricing" className={`text-sm font-medium transition-colors ${isActive('/pricing') ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Pricing</Link>
            {session && <Link to="/dashboard" className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-white' : 'text-slate-400 hover:text-white'}`}>Dashboard</Link>}
            {isAdmin && (
              <Link to="/admin" className={`text-sm font-bold flex items-center transition-colors ${isActive('/admin') ? 'text-indigo-400' : 'text-indigo-500/80 hover:text-indigo-400'}`}>
                <ShieldAlert className="w-4 h-4 mr-1.5" />
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!session ? (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Log In</Link>
                <Link
                  to="/signup"
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/create"
                  className="flex items-center px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Lock
                </Link>
                <div className="relative group">
                  <button className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border border-slate-700 flex items-center justify-center hover:ring-2 hover:ring-indigo-500/50 transition-all">
                     <User className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{session.user.email}</p>
                    </div>
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800">My Dashboard</Link>
                    {isAdmin && <Link to="/admin" className="block px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 font-bold">Admin Panel</Link>}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 flex items-center">
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-400 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <div className="py-2 border-b border-slate-800/50 mb-2">
               <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu</p>
               <Link to="/features" onClick={closeMobileMenu} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Features</Link>
               <Link to="/pricing" onClick={closeMobileMenu} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Pricing</Link>
            </div>

            <div className="space-y-3 pt-2">
              {session ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={closeMobileMenu}
                      className="flex items-center px-3 py-3 text-base font-bold text-indigo-400 hover:bg-slate-800 rounded-md"
                    >
                      <ShieldAlert className="w-5 h-5 mr-3" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/create"
                    onClick={closeMobileMenu}
                    className="flex items-center px-3 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 rounded-md"
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    Create New Lock
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center px-3 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 rounded-md"
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-3 py-3 text-base font-medium text-red-400 hover:bg-slate-800 rounded-md"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobileMenu} className="flex items-center px-3 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 rounded-md">
                    <LogIn className="w-5 h-5 mr-3" />
                    Log In
                  </Link>
                  <Link to="/signup" onClick={closeMobileMenu} className="flex items-center px-3 py-3 text-base font-medium bg-indigo-600 text-white rounded-md">
                    <User className="w-5 h-5 mr-3" />
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {session && (
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center px-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center">
                     <User className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{session.user.name}</div>
                  <div className="text-sm font-medium leading-none text-slate-500 mt-1">{session.user.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
