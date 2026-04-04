import { useState } from 'react';
import { Users, Smartphone, Monitor, Download, User, CheckCircle } from 'lucide-react';

import { useEffect } from 'react';
import { apiCall } from '../api';

interface ChildInfo {
  id?: string;
  name: string;
  age?: string;
  email?: string;
  mobile_number?: string;
  student_id?: string;
  grade?: string;
  access_code?: string;
  is_activated?: boolean;
}

interface PortalPageProps {
  onNavigate: (page: string) => void;
}

export function PortalPage({ onNavigate }: PortalPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  useEffect(() => {
    const parentToken = localStorage.getItem('parentToken');
    if (parentToken) {
      apiCall('/children', 'GET', undefined, parentToken)
        .then(data => {
          if (data && data.children) {
            setChildren(data.children);
          }
        })
        .catch(err => console.error('Error fetching children:', err));
    }
  }, []);

  const handleChildSaved = async (child: ChildInfo) => {
    const parentToken = localStorage.getItem('parentToken');
    if (!parentToken) return;

    try {
      const resp = await apiCall('/children', 'POST', child, parentToken);
      setChildren(prev => [...prev, resp]);
      setShowForm(false);
      if (resp.access_code) {
        setGeneratedCode(resp.access_code);
      }
    } catch (err) {
      console.error('Failed to save child', err);
      alert('Failed to save child');
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Welcome header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your children and download the apps</p>
        </div>

        {/* Children card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              <h2 className="text-lg font-semibold text-white">Children</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-center mb-5">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-8 py-2.5 rounded-xl transition-all font-medium text-sm shadow-md shadow-blue-100"
              >
                + Add Child
              </button>
            </div>
            {children.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <User className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No children added yet. Click "Add Child" to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {children.map((child, i: number) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3 border border-gray-100 rounded-xl bg-gray-50 text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                    <div className="bg-[#2563eb]/10 p-2 rounded-full flex-shrink-0">
                      <User className="w-4 h-4 text-[#2563eb]" />
                    </div>
                    <span className="font-semibold text-gray-900 min-w-[120px]">{child.name}</span>
                    <span>Access Code: <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200">{child.access_code || 'N/A'}</span></span>
                    <span className={child.is_activated ? "text-green-600 font-medium" : "text-amber-500 font-medium"}>
                      {child.is_activated ? 'Activated' : 'Pending Activation'}
                    </span>
                    <span className="text-gray-400">ID: {child.id}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Download cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parent Portal */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg"><Users className="w-4 h-4 text-white" /></div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Parent Portal</h3>
                  <p className="text-blue-100 text-xs">Monitor & manage safety settings</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button onClick={() => alert('Downloading Parent App for Windows...')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-[#2563eb] hover:bg-blue-50 transition-all group">
                <div className="bg-blue-50 group-hover:bg-blue-100 p-2 rounded-lg transition-colors">
                  <Monitor className="w-4 h-4 text-[#2563eb]" />
                </div>
                <span className="font-medium text-gray-700 text-sm">Download for Windows</span>
                <Download className="w-3.5 h-3.5 text-gray-400 ml-auto" />
              </button>
              <button onClick={() => alert('Downloading Parent App for Android...')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group">
                <div className="bg-green-50 group-hover:bg-green-100 p-2 rounded-lg transition-colors">
                  <Smartphone className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-700 text-sm">Download for Android</span>
                <Download className="w-3.5 h-3.5 text-gray-400 ml-auto" />
              </button>
            </div>
          </div>

          {/* Child Portal */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg"><Smartphone className="w-4 h-4 text-white" /></div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Child Portal</h3>
                  <p className="text-purple-100 text-xs">Stay connected & view safety status</p>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button onClick={() => alert('Downloading Child App for Windows...')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group">
                <div className="bg-purple-50 group-hover:bg-purple-100 p-2 rounded-lg transition-colors">
                  <Monitor className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-700 text-sm">Download for Windows</span>
                <Download className="w-3.5 h-3.5 text-gray-400 ml-auto" />
              </button>
              <button onClick={() => alert('Downloading Child App for Android...')}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-100 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group">
                <div className="bg-green-50 group-hover:bg-green-100 p-2 rounded-lg transition-colors">
                  <Smartphone className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-700 text-sm">Download for Android</span>
                <Download className="w-3.5 h-3.5 text-gray-400 ml-auto" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {showForm && (
        <AddChildFormWithCallback
          onClose={() => setShowForm(false)}
          onSave={handleChildSaved}
        />
      )}

      {/* Success Modal */}
      {generatedCode && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-center">
            <div className="bg-green-500 py-8 px-6 flex flex-col items-center">
              <CheckCircle className="w-16 h-16 text-white mb-4" />
              <h2 className="text-2xl font-bold text-white">Setup Successful!</h2>
              <p className="text-green-100 mt-2 text-sm">Your child has been added to CuraGuard.</p>
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-6">
                Please install the CuraGuard app on your child's phone and enter the following activation code:
              </p>
              <div className="bg-gray-100 border border-gray-200 rounded-xl py-4 flex items-center justify-center mb-8">
                <span className="text-3xl font-mono font-extrabold tracking-wider text-gray-800">
                  {generatedCode}
                </span>
              </div>
              <button
                onClick={() => setGeneratedCode(null)}
                className="w-full bg-[#2563eb] text-white py-3.5 rounded-xl font-bold hover:bg-[#1d4ed8] transition-colors"
              >
                I have written this down
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Extended AddChildForm that returns data on save
function AddChildFormWithCallback({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (child: ChildInfo) => void;
}) {
  const [formData, setFormData] = useState<ChildInfo>({
    name: '', age: '', email: '', mobile_number: '', student_id: '', grade: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#2563eb] px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Child</h2>
            <p className="text-blue-100 text-sm mt-1">Enter your child's information below</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Name + Age */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="name"
                  value={formData.name} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  placeholder="Child's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" name="age"
                  value={formData.age} onChange={handleChange} required min="1" max="18"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  placeholder="Age (1–18)"
                />
              </div>
            </div>

            {/* Row 2: Mobile + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel" name="mobile_number"
                  value={formData.mobile_number} onChange={handleChange} required
                  pattern="\d{10}" maxLength={10}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  placeholder="child@email.com"
                />
              </div>
            </div>

            {/* Row 3: Child ID + Grade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" name="student_id"
                  value={formData.student_id} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
                  placeholder="Student ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade <span className="text-red-500">*</span>
                </label>
                <select
                  name="grade"
                  value={formData.grade} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] bg-white"
                >
                  <option value="">Select grade</option>
                  {['Kindergarten', ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
              <button
                type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#2563eb] text-white rounded-lg text-sm font-medium hover:bg-[#1d4ed8] transition-colors"
              >
                Save Child
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
