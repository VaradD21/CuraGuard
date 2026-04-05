import { useState } from 'react';
import { Shield, LogIn, AlertCircle, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
}

export function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const success = await onLogin(formData.email, formData.password);
      if (success) {
        onNavigate('portal');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0a0f1e] flex items-center justify-center py-12 px-6">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#3b82f6]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#1e2d4a] to-[#0d1526] border-b border-[#1e2d4a] px-8 py-10 text-center">
            <div className="inline-flex bg-gradient-to-br from-[#3b82f6] to-[#6366f1] p-4 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 text-sm mt-1">Sign in to your CuraGuard account</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email" id="email" required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111827] border border-[#1e2d4a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
                  placeholder="parent@email.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password" id="password" required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#111827] border border-[#1e2d4a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('registration')}
                className="text-[#3b82f6] font-semibold hover:text-[#60a5fa] transition-colors"
              >
                Create one free
              </button>
            </p>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-4 bg-[#0d1526] border border-[#1e2d4a] rounded-xl px-4 py-3 text-center">
          <p className="text-gray-500 text-xs">
            Demo account: <span className="text-[#3b82f6] font-mono">parent@gmail.com</span> / <span className="text-[#3b82f6] font-mono">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
}
