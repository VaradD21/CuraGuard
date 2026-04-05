import { useState } from 'react';
import { Shield, User, Lock, Phone, MapPin, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

interface RegistrationPageProps {
  onNavigate: (page: string) => void;
  onRegister: (email: string, password: string, fullName: string) => Promise<boolean>;
}

export function RegistrationPage({ onNavigate, onRegister }: RegistrationPageProps) {
  const [formData, setFormData] = useState({
    fullName: '', mobileNumber: '', homeAddress: '',
    email: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await onRegister(formData.email, formData.password, formData.fullName);
      onNavigate('portal');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClass = "w-full px-4 py-3 bg-[#111827] border border-[#1e2d4a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all text-sm";
  const labelClass = "block text-sm font-semibold text-gray-300 mb-1.5";

  const benefits = ['Free forever for basic protection', 'Instant setup — under 2 minutes', 'Real-time alerts on your phone'];

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0a0f1e] py-12 px-6">
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#6366f1]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Left panel */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-24">
            <div>
              <div className="inline-flex bg-gradient-to-br from-[#3b82f6] to-[#6366f1] p-3 rounded-xl mb-4 shadow-lg shadow-blue-500/30">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-white">Create Your Account</h1>
              <p className="text-gray-400 mt-2">Join CuraGuard and keep your children safe online.</p>
            </div>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#3b82f6] flex-shrink-0" />
                  {b}
                </div>
              ))}
            </div>
            <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-xl p-4">
              <p className="text-gray-500 text-xs text-center">
                Already have an account?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[#3b82f6] font-semibold hover:text-[#60a5fa] transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Form panel */}
          <div className="lg:col-span-3 bg-[#0d1526] border border-[#1e2d4a] rounded-2xl shadow-2xl overflow-hidden">
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border-b border-red-500/20 text-red-400 px-6 py-4 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Parent Info */}
              <div>
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2d4a]">
                  <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/30 p-1.5 rounded-lg">
                    <User className="w-4 h-4 text-[#3b82f6]" />
                  </div>
                  <h3 className="font-semibold text-white">Parent / Guardian Details</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className={labelClass}>Full Name <span className="text-red-400">*</span></label>
                    <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className={inputClass} placeholder="Rajesh Kumar" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="mobileNumber" className={labelClass}>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> Mobile Number <span className="text-red-400">*</span></span>
                      </label>
                      <input type="tel" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required pattern="\d{10}" maxLength={10} className={inputClass} placeholder="10-digit mobile" />
                    </div>
                    <div>
                      <label htmlFor="email" className={labelClass}>Email Address <span className="text-red-400">*</span></label>
                      <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="parent@email.com" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="homeAddress" className={labelClass}>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Home Address</span>
                    </label>
                    <textarea id="homeAddress" name="homeAddress" value={formData.homeAddress} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} placeholder="Your home address (optional)" />
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div>
                <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#1e2d4a]">
                  <div className="bg-[#6366f1]/10 border border-[#6366f1]/30 p-1.5 rounded-lg">
                    <Lock className="w-4 h-4 text-[#a78bfa]" />
                  </div>
                  <h3 className="font-semibold text-white">Set Password</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className={labelClass}>Password <span className="text-red-400">*</span></label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} className={inputClass} placeholder="Min 6 characters" />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className={labelClass}>Confirm Password <span className="text-red-400">*</span></label>
                    <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={inputClass} placeholder="Re-enter password" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                {loading ? 'Creating Account...' : 'Create Account & Start Protecting'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
