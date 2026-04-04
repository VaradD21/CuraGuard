import { useState } from 'react';
import { Shield, LogIn } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await onLogin(formData.username, formData.password);
    if (success) {
      onNavigate('portal');
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top accent */}
          <div className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-8 py-8 text-center">
            <div className="inline-flex bg-white/20 p-3 rounded-xl mb-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-blue-100 text-sm mt-1">Sign in to your SafeNet AI account</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <span className="text-red-400">⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5">Username</label>
                <input
                  type="text" id="username" name="username" required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-gray-50 transition-all"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  type="password" id="password" name="password" required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-gray-50 transition-all"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#2563eb] text-white py-3.5 rounded-xl hover:bg-[#1d4ed8] transition-all font-semibold shadow-md shadow-blue-100 hover:shadow-blue-200 mt-2"
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <button onClick={() => onNavigate('registration')} className="text-[#2563eb] font-semibold hover:underline">
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
