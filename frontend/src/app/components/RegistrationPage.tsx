import { useState } from 'react';
import { Shield, User, Lock, Phone, MapPin } from 'lucide-react';

interface RegistrationPageProps {
  onNavigate: (page: string) => void;
  onRegister: (username: string, password: string) => Promise<boolean>;
}

export function RegistrationPage({ onNavigate, onRegister }: RegistrationPageProps) {
  const [formData, setFormData] = useState({
    parentName: '', mobileNumber: '', homeAddress: '',
    username: '', password: '', confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (formData.password !== formData.confirmPassword) { setPasswordError('Passwords do not match.'); return; }
    if (formData.password.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
    
    try {
      const success = await onRegister(formData.username, formData.password);
      if (success) {
        alert('Registration successful! You can now login.');
        onNavigate('login');
      } else {
        setPasswordError('Registration failed.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Registration failed.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-gray-50 transition-all text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-8 py-8 text-center">
            <div className="inline-flex bg-white/20 p-3 rounded-xl mb-3">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
            <p className="text-blue-100 text-sm mt-1">Join SafeNet AI and protect your child today</p>
          </div>

          <div className="p-8">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm">
                ⚠ {passwordError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Parent Info */}
              <div>
                <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-100">
                  <div className="bg-blue-50 p-1.5 rounded-lg"><User className="w-4 h-4 text-[#2563eb]" /></div>
                  <h3 className="font-semibold text-gray-800">Parent / Guardian Information</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="parentName" className={labelClass}>Full Name</label>
                    <input type="text" id="parentName" name="parentName" value={formData.parentName} onChange={handleChange} required className={inputClass} placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label htmlFor="mobileNumber" className={labelClass}>
                      <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Mobile Number</span>
                    </label>
                    <input type="tel" id="mobileNumber" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required pattern="\d{10}" maxLength={10} className={inputClass} placeholder="Enter 10-digit mobile number" />
                  </div>
                  <div>
                    <label htmlFor="homeAddress" className={labelClass}>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Home Address</span>
                    </label>
                    <textarea id="homeAddress" name="homeAddress" value={formData.homeAddress} onChange={handleChange} required rows={3} className={`${inputClass} resize-none`} placeholder="Enter your complete home address" />
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div>
                <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-100">
                  <div className="bg-blue-50 p-1.5 rounded-lg"><Lock className="w-4 h-4 text-[#2563eb]" /></div>
                  <h3 className="font-semibold text-gray-800">Login Credentials</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="username" className={labelClass}>Username</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required minLength={4} className={inputClass} placeholder="Create a username (min 4 characters)" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className={labelClass}>Password</label>
                      <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} className={inputClass} placeholder="Min 6 characters" />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
                      <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={inputClass} placeholder="Re-enter password" />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2563eb] text-white py-4 rounded-xl hover:bg-[#1d4ed8] transition-all font-semibold text-base shadow-md shadow-blue-100 hover:shadow-blue-200 hover:-translate-y-0.5"
              >
                Create Account
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{' '}
              <button onClick={() => onNavigate('login')} className="text-[#2563eb] font-semibold hover:underline">Sign in</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
