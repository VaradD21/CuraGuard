import { Shield, Eye, Bell, BarChart3, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-white">

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.08),_transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-[#2563eb] px-4 py-2 rounded-full text-sm font-semibold">
                <Shield className="w-4 h-4" />
                AI-Powered Child Protection
              </div>

              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Protect Your Child's
                <span className="text-[#2563eb] block">Digital Safety</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Safeguard your child from cyberbullying, online grooming, and harmful content with AI-powered threat detection and real-time alerts.
              </p>

              <div className="space-y-3">
                {[
                  '73% of children encounter cyberbullying before age 18',
                  'Early detection prevents long-term psychological harm',
                  'Parental awareness is the first line of digital defense',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#2563eb] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => onNavigate('registration')}
                  className="flex items-center gap-2 bg-[#2563eb] text-white px-7 py-3.5 rounded-xl hover:bg-[#1d4ed8] transition-all font-semibold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 text-gray-700 border border-gray-200 px-7 py-3.5 rounded-xl hover:border-[#2563eb] hover:text-[#2563eb] transition-all font-semibold hover:bg-blue-50"
                >
                  Sign In
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-3xl blur-2xl opacity-30" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1758598738092-a7cd486baadd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxwYXJlbnQlMjBwcm90ZWN0aW5nJTIwY2hpbGQlMjBvbmxpbmUlMjBzYWZldHklMjBjb21wdXRlcnxlbnwxfHx8fDE3NzUzMTgwNjF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Parent and child online safety"
                  className="w-full h-80 lg:h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#2563eb] py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-6 text-center text-white">
          {[['10K+', 'Families Protected'], ['99.2%', 'Threat Detection Rate'], ['24/7', 'Real-time Monitoring']].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-extrabold">{val}</div>
              <div className="text-blue-200 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How SafeNet AI Protects Your Family</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Comprehensive protection powered by cutting-edge AI technology</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Eye, title: 'Real-time Monitoring', desc: 'Continuous analysis of social media, messages, and content using advanced NLP to detect harmful patterns instantly.', color: 'bg-blue-50 text-[#2563eb]' },
              { icon: Bell, title: 'Instant Alerts', desc: 'Receive immediate notifications when threats are identified, enabling quick intervention to protect your child.', color: 'bg-amber-50 text-amber-600' },
              { icon: BarChart3, title: 'Detailed Analytics', desc: 'Access comprehensive reports with insights on activity, risk levels, and behavioral trends in your child\'s digital world.', color: 'bg-green-50 text-green-600' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technology */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#3b82f6] rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h2 className="text-3xl font-bold mb-4">Our Technology</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl leading-relaxed">
              SafeNet AI uses state-of-the-art NLP and machine learning trained on millions of data points to recognize cyberbullying, grooming, and harmful content — while maintaining full privacy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Machine Learning Risk Assessment', 'Sentiment & Behavioral Analysis', 'Privacy-Focused Monitoring', 'Multi-Platform Integration'].map(item => (
                <div key={item} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-blue-200 flex-shrink-0" />
                  <span className="text-white font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-50 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to protect your child?</h2>
        <p className="text-gray-500 mb-8">Join thousands of parents who trust SafeNet AI</p>
        <button
          onClick={() => onNavigate('registration')}
          className="inline-flex items-center gap-2 bg-[#2563eb] text-white px-8 py-4 rounded-xl hover:bg-[#1d4ed8] transition-all font-semibold text-lg shadow-lg shadow-blue-200 hover:-translate-y-0.5"
        >
          Create Free Account <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}
