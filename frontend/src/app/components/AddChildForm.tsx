import { useState } from 'react';

interface AddChildFormProps {
  onClose: () => void;
}

export function AddChildForm({ onClose }: AddChildFormProps) {
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    childId: '',
    studyingYear: '',
    childMobileNumber: '',
    childEmail: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Child added:', formData);
    alert('Child information saved successfully.');
    onClose();
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
                <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="childName" name="childName"
                  value={formData.childName} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  placeholder="Child's full name"
                />
              </div>
              <div>
                <label htmlFor="childAge" className="block text-sm font-medium text-gray-700 mb-1">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" id="childAge" name="childAge"
                  value={formData.childAge} onChange={handleChange} required min="1" max="18"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  placeholder="Age (1–18)"
                />
              </div>
            </div>

            {/* Row 2: Mobile + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="childMobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel" id="childMobileNumber" name="childMobileNumber"
                  value={formData.childMobileNumber} onChange={handleChange} required
                  pattern="\d{10}" maxLength={10}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  placeholder="10-digit number"
                />
              </div>
              <div>
                <label htmlFor="childEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email" id="childEmail" name="childEmail"
                  value={formData.childEmail} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  placeholder="child@email.com"
                />
              </div>
            </div>

            {/* Row 3: Child ID + Grade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="childId" className="block text-sm font-medium text-gray-700 mb-1">
                  Child ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" id="childId" name="childId"
                  value={formData.childId} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                  placeholder="Student ID"
                />
              </div>
              <div>
                <label htmlFor="studyingYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Grade <span className="text-red-500">*</span>
                </label>
                <select
                  id="studyingYear" name="studyingYear"
                  value={formData.studyingYear} onChange={handleChange} required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent bg-white"
                >
                  <option value="">Select grade</option>
                  {['Kindergarten', ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
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
