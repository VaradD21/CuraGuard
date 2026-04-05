import { Shield, Eye, Bell, BarChart3, ArrowRight, CheckCircle, Smartphone, Lock, Zap, Star } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-[#6366f1]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-28 lg:pt-28 lg:pb-36 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#60a5fa] px-4 py-2 rounded-full text-sm font-semibold">
                <Zap className="w-4 h-4" />
                Government-Grade AI Protection
              </div>

              <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
                Protect Your Child's
                <span className="block bg-gradient-to-r from-[#3b82f6] to-[#a78bfa] bg-clip-text text-transparent mt-1">
                  Digital Safety
                </span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                Safeguard your child from cyberbullying, online grooming, and harmful content with AI-powered threat detection and real-time parental alerts.
              </p>

              <div className="space-y-3">
                {[
                  '73% of children encounter cyberbullying before age 18',
                  'Real-time blocking of NSFW and predatory content',
                  'Parental awareness is the first line of digital defense',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#3b82f6] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => onNavigate('registration')}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 text-gray-300 border border-[#1e2d4a] px-8 py-4 rounded-xl font-semibold hover:border-[#3b82f6]/50 hover:text-white hover:bg-[#3b82f6]/5 transition-all"
                >
                  Sign In
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2">
                  {['R', 'A', 'S', 'M'].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] border-2 border-[#0a0f1e] flex items-center justify-center text-[10px] font-bold text-white">
                      {l}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-400">
                  <div className="flex items-center gap-1 text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                  <span>Trusted by 10,000+ families</span>
                </div>
              </div>
            </div>

            {/* Right side card mockup */}
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-r from-[#3b82f6]/20 to-[#6366f1]/20 rounded-3xl blur-3xl" />
              <div className="relative bg-[#0d1526] border border-[#1e2d4a] rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Live Monitoring</p>
                    <p className="text-white font-semibold">Nitish's Galaxy S23</p>
                  </div>
                  <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    3 Alerts
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { app: '[BLOCKED] Tor Browser - anonymizer.io', risk: 'hazardous', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                    { app: 'how to bypass parental controls - Google', risk: 'warning', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                    { app: 'WhatsApp - Unknown (+91 98XXXXXX)', risk: 'warning', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
                    { app: 'Khan Academy - Maths', risk: 'safe', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#111827] rounded-xl border border-[#1e2d4a]">
                      <span className="text-gray-300 text-xs truncate flex-1 mr-3">{item.app}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color} flex-shrink-0`}>
                        {item.risk.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[['98.2%', 'Accuracy'], ['24/7', 'Live'], ['0ms', 'Delay']].map(([v, l]) => (
                    <div key={l} className="bg-[#111827] rounded-lg p-3 text-center border border-[#1e2d4a]">
                      <div className="text-[#3b82f6] font-bold text-sm">{v}</div>
                      <div className="text-gray-500 text-[10px]">{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-[#1e2d4a] py-10 bg-[#0d1526]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[['10K+', 'Families Protected'], ['99.2%', 'Threat Detection Rate'], ['24/7', 'Real-time Monitoring']].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-extrabold bg-gradient-to-r from-[#3b82f6] to-[#a78bfa] bg-clip-text text-transparent">{val}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-[#0a0f1e]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">How CuraGuard Protects Your Family</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Comprehensive protection powered by government-grade AI technology</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Eye, title: 'Real-time Monitoring', desc: 'Continuous AI analysis of apps, browsers, and messages to detect harmful patterns the moment they appear.', color: 'from-[#3b82f6] to-[#6366f1]' },
              { icon: Bell, title: 'Instant Alerts', desc: 'Instant push notifications to parents when threats are detected. Respond before damage is done.', color: 'from-[#f59e0b] to-[#ef4444]' },
              { icon: BarChart3, title: 'Detailed Analytics', desc: 'Weekly reports, screen time breakdowns, most-used apps, and risk trend analysis all in one dashboard.', color: 'from-[#10b981] to-[#3b82f6]' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl p-8 hover:border-[#3b82f6]/40 hover:-translate-y-1 transition-all group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-20 bg-[#0d1526] border-y border-[#1e2d4a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Get Started in 3 Steps</h2>
            <p className="text-gray-500">Setup takes less than 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create Account', desc: 'Register as a parent with your email. No credit card required.', icon: Lock },
              { step: '02', title: 'Add Your Children', desc: 'Add each child and get a unique activation code per device.', icon: CheckCircle },
              { step: '03', title: 'Install & Protect', desc: "Install the child app on their phone. Protection starts instantly.", icon: Smartphone },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="relative text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#3b82f6] to-[#6366f1] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="absolute top-0 right-1/4 text-[80px] font-black text-[#1e2d4a] leading-none select-none">{step}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 bg-[#0a0f1e] text-center">
        <div className="max-w-2xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 text-[#60a5fa] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" /> Start protecting today
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to protect your child?</h2>
          <p className="text-gray-400 mb-10">Join thousands of parents who trust CuraGuard to keep their children safe online.</p>
          <button
            onClick={() => onNavigate('registration')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white px-10 py-4 rounded-xl font-semibold text-lg shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all"
          >
            Create Free Account <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#1e2d4a] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#3b82f6] to-[#6366f1] p-1.5 rounded-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">Cura<span className="text-[#3b82f6]">Guard</span></span>
          </div>
          <p className="text-gray-600 text-sm">© 2026 CuraGuard. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
