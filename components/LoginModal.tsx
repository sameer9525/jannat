
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username?: string, password?: string) => boolean; // Returns true on success, false on failure
  error: string | null;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset fields when modal opens, but not error (it comes from props)
      setUsername('');
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
    // Don't close here, onLogin success will trigger App state change to close modal
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]" // Higher z-index than other modals
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        className="bg-slate-800 border border-pink-700/60 p-6 rounded-xl shadow-2xl shadow-pink-500/40 max-w-sm w-full text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-6">
          <h2 id="login-modal-title" className="text-2xl font-semibold text-pink-300">
            Admin Login
          </h2>
          <button
            onClick={onClose}
            className="text-pink-400 hover:text-purple-400 transition-colors p-1 rounded-full hover:bg-slate-700/50"
            aria-label="Close login modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username-input" className="block text-sm font-medium text-pink-300 mb-1">
              Username
            </label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full p-3 bg-slate-700/60 border border-pink-600 rounded-md text-gray-100 placeholder-pink-400/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              required
              aria-required="true"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password-input" className="block text-sm font-medium text-pink-300 mb-1">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full p-3 bg-slate-700/60 border border-pink-600 rounded-md text-gray-100 placeholder-pink-400/50 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              required
              aria-required="true"
            />
          </div>

          {error && (
            <div className="my-3 p-3 bg-red-500/20 border border-red-600 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-pink-300 bg-slate-700/70 hover:bg-slate-600/90 border border-pink-700/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-md shadow-md hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
