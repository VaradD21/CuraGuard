import { Shield } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  onAddChild?: () => void;
}

export function Navbar({ onNavigate, currentPage, isAuthenticated, onLogout }: NavbarProps) {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('landing')}
        >
          <div className="bg-[#2563eb] p-1.5 rounded-lg group-hover:bg-[#1d4ed8] transition-colors">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">SafeNet <span className="text-[#2563eb]">AI</span></span>
        </div>

        <div className="flex items-center gap-3">
          {currentPage === 'landing' && (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="text-gray-600 hover:text-[#2563eb] transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('registration')}
                className="bg-[#2563eb] text-white px-5 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium shadow-sm shadow-blue-200"
              >
                Get Started
              </button>
            </>
          )}
          {currentPage === 'registration' && (
            <>
              <button onClick={() => onNavigate('landing')} className="text-gray-600 hover:text-[#2563eb] transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50">Home</button>
              <button onClick={() => onNavigate('login')} className="bg-[#2563eb] text-white px-5 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium">Login</button>
            </>
          )}
          {currentPage === 'login' && (
            <>
              <button onClick={() => onNavigate('landing')} className="text-gray-600 hover:text-[#2563eb] transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50">Home</button>
              <button onClick={() => onNavigate('registration')} className="bg-[#2563eb] text-white px-5 py-2 rounded-lg hover:bg-[#1d4ed8] transition-colors font-medium">Sign Up</button>
            </>
          )}
          {currentPage === 'portal' && (
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-red-500 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-red-50"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
