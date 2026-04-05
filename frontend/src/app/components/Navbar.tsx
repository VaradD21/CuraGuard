import { Shield, Zap } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  isAuthenticated?: boolean;
  parentEmail?: string;
  onLogout?: () => void;
}

export function Navbar({ onNavigate, currentPage, isAuthenticated, parentEmail, onLogout }: NavbarProps) {
  return (
    <nav className="w-full bg-[#0d1526]/95 backdrop-blur-md border-b border-[#1e2d4a] px-6 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onNavigate(isAuthenticated ? 'portal' : 'landing')}
        >
          <div className="bg-gradient-to-br from-[#3b82f6] to-[#6366f1] p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            Cura<span className="text-[#3b82f6]">Guard</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#3b82f6] text-[10px] font-bold px-2 py-0.5 rounded-full">
            <Zap className="w-2.5 h-2.5" /> AI
          </span>
        </div>

        {/* Nav Actions */}
        <div className="flex items-center gap-3">
          {!isAuthenticated && (
            <>
              {currentPage !== 'login' && (
                <button
                  onClick={() => onNavigate('login')}
                  className="text-gray-400 hover:text-white transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/5"
                >
                  Login
                </button>
              )}
              {currentPage !== 'registration' && (
                <button
                  onClick={() => onNavigate('registration')}
                  className="bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white px-5 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                >
                  Get Started
                </button>
              )}
              {currentPage === 'registration' && (
                <button
                  onClick={() => onNavigate('login')}
                  className="bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white px-5 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                >
                  Login
                </button>
              )}
            </>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              {parentEmail && (
                <span className="hidden md:flex items-center gap-2 text-gray-400 text-sm">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center text-white text-xs font-bold">
                    {parentEmail[0].toUpperCase()}
                  </div>
                  {parentEmail}
                </span>
              )}
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-red-400 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
