import React, { useState, useEffect } from 'react';
import {
  Users, Smartphone, Monitor, Download, User, CheckCircle,
  AlertTriangle, Shield, Clock, Activity, Plus, X, Loader2,
  BarChart3, Bell, Eye, LogOut, RefreshCw, Copy, Check
} from 'lucide-react';
import { apiCall } from '../api';

interface ChildInfo {
  id?: string;
  name: string;
  age?: string | number;
  email?: string;
  mobile_number?: string;
  student_id?: string;
  grade?: string;
  access_code?: string;
  is_activated?: boolean;
}

interface EventInfo {
  id: string;
  window_title: string;
  process_name: string;
  risk_label: string;
  threat_category: string;
  duration_seconds: number;
  captured_at: string;
}

interface AlertInfo {
  id: string;
  reason: string;
  created_at: string;
}

interface PortalPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function PortalPage({ onNavigate, onLogout }: PortalPageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'children' | 'alerts' | 'downloads'>('overview');
  const [showForm, setShowForm] = useState(false);
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [alerts, setAlerts] = useState<AlertInfo[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const token = localStorage.getItem('parentToken') || '';

  const fetchChildren = async () => {
    try {
      setLoadingChildren(true);
      const data = await apiCall('/children', 'GET', undefined, token);
      if (data?.children) setChildren(data.children);
    } catch (err) {
      console.error('Failed to fetch children:', err);
    } finally {
      setLoadingChildren(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);
      const data = await apiCall('/dashboard', 'GET', undefined, token);
      if (data?.events) setEvents(data.events);
      if (data?.alerts) setAlerts(data.alerts);
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchChildren();
      fetchEvents();
    }
  }, []);

  const handleChildSaved = async (child: ChildInfo) => {
    try {
      const resp = await apiCall('/children', 'POST', child, token);
      setChildren(prev => [...prev, resp]);
      setShowForm(false);
      if (resp.access_code) {
        setGeneratedCode(resp.access_code);
      }
    } catch (err: any) {
      alert(`Failed to save child: ${err.message || 'Unknown error'}`);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const riskColor = (label: string) => {
    if (label === 'hazardous') return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (label === 'warning') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-green-400 bg-green-500/10 border-green-500/20';
  };

  const safeCount = events.filter(e => e.risk_label === 'safe').length;
  const warningCount = events.filter(e => e.risk_label === 'warning').length;
  const hazardCount = events.filter(e => e.risk_label === 'hazardous').length;
  const activatedChildren = children.filter(c => c.is_activated).length;

  interface TabDef {
    id: 'overview' | 'children' | 'alerts' | 'downloads';
    label: string;
    icon: React.ElementType;
    badge?: number;
    danger?: boolean;
  }
  const tabs: TabDef[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'children', label: 'Children', icon: Users, badge: children.length },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: alerts.length > 0 ? alerts.length : undefined, danger: alerts.length > 0 },
    { id: 'downloads', label: 'Downloads', icon: Download },
  ];

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[#0a0f1e]">
      {/* Sidebar + Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-6">

        {/* Sidebar */}
        <div className="md:w-56 flex-shrink-0 space-y-2">
          {tabs.map(({ id, label, icon: Icon, badge, danger }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-[#0d1526] border border-transparent hover:border-[#1e2d4a]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                {label}
              </div>
              {badge !== undefined && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${danger ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-4 border-t border-[#1e2d4a]">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/20 border border-transparent transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
                  <p className="text-gray-500 text-sm mt-1">Real-time summary of your children's online activity</p>
                </div>
                <button
                  onClick={() => { fetchChildren(); fetchEvents(); }}
                  className="flex items-center gap-2 text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-[#0d1526] border border-[#1e2d4a] transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Children', value: children.length, icon: Users, color: 'from-[#3b82f6] to-[#6366f1]', sub: `${activatedChildren} activated` },
                  { label: 'Total Events', value: events.length, icon: Activity, color: 'from-[#10b981] to-[#3b82f6]', sub: 'Last 24h' },
                  { label: 'Warnings', value: warningCount, icon: AlertTriangle, color: 'from-[#f59e0b] to-[#ef4444]', sub: `${hazardCount} critical` },
                  { label: 'Safe Events', value: safeCount, icon: Shield, color: 'from-[#10b981] to-[#059669]', sub: `${events.length > 0 ? Math.round((safeCount / events.length) * 100) : 100}% safe` },
                ].map(({ label, value, icon: Icon, color, sub }) => (
                  <div key={label} className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl p-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">{value}</div>
                    <div className="text-gray-500 text-xs mt-1">{label}</div>
                    <div className="text-gray-600 text-[10px] mt-0.5">{sub}</div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1e2d4a] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#3b82f6]" />
                    <h2 className="text-white font-semibold">Recent Activity</h2>
                  </div>
                  <span className="text-gray-600 text-xs">{events.length} events</span>
                </div>
                {loadingEvents ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-[#3b82f6] animate-spin" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No activity recorded yet. Events will appear here when the child app is installed.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#1e2d4a]">
                    {events.slice(0, 10).map((ev) => (
                      <div key={ev.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#111827] transition-colors">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.risk_label === 'hazardous' ? 'bg-red-400' : ev.risk_label === 'warning' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{ev.window_title}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{ev.process_name} · {Math.round((ev.duration_seconds || 0) / 60)}m</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${riskColor(ev.risk_label)} flex-shrink-0`}>
                          {ev.risk_label?.toUpperCase() || 'SAFE'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Alerts panel */}
              {alerts.length > 0 && (
                <div className="bg-[#0d1526] border border-red-500/20 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-red-500/20 flex items-center gap-2 bg-red-500/5">
                    <Bell className="w-4 h-4 text-red-400" />
                    <h2 className="text-red-300 font-semibold">Active Alerts ({alerts.length})</h2>
                  </div>
                  <div className="divide-y divide-[#1e2d4a]">
                    {alerts.slice(0, 5).map((a) => (
                      <div key={a.id} className="px-6 py-4 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-200 text-sm">{a.reason}</p>
                          <p className="text-gray-600 text-xs mt-1">{new Date(a.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHILDREN TAB */}
          {activeTab === 'children' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Children</h1>
                  <p className="text-gray-500 text-sm mt-1">Manage your children and their access codes</p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                >
                  <Plus className="w-4 h-4" /> Add Child
                </button>
              </div>

              {loadingChildren ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-[#3b82f6] animate-spin" />
                </div>
              ) : children.length === 0 ? (
                <div className="bg-[#0d1526] border border-[#1e2d4a] border-dashed rounded-2xl py-16 text-center">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                  <p className="text-gray-400 font-medium">No children added yet</p>
                  <p className="text-gray-600 text-sm mt-1">Add your first child to start monitoring</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add First Child
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {children.map((child, i) => (
                    <div key={i} className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl p-6 hover:border-[#3b82f6]/30 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#6366f1] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                            {child.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">{child.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {child.grade && <span className="text-gray-500 text-xs bg-[#111827] px-2 py-0.5 rounded-lg border border-[#1e2d4a]">Grade {child.grade}</span>}
                              {child.age && <span className="text-gray-500 text-xs bg-[#111827] px-2 py-0.5 rounded-lg border border-[#1e2d4a]">Age {child.age}</span>}
                              {child.student_id && <span className="text-gray-500 text-xs bg-[#111827] px-2 py-0.5 rounded-lg border border-[#1e2d4a]">ID: {child.student_id}</span>}
                            </div>
                          </div>
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border flex-shrink-0 ${child.is_activated ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>
                          {child.is_activated ? <><CheckCircle className="w-3 h-3" /> Active</> : <><Clock className="w-3 h-3" /> Pending</>}
                        </span>
                      </div>

                      {child.access_code && (
                        <div className="mt-4 bg-[#111827] border border-[#1e2d4a] rounded-xl p-4">
                          <p className="text-gray-500 text-xs mb-2">Activation Code (enter in Child App)</p>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-white font-mono text-xl font-bold tracking-widest">{child.access_code}</span>
                            <button
                              onClick={() => copyCode(child.access_code!)}
                              className="flex items-center gap-1.5 text-[#3b82f6] hover:text-white text-xs px-3 py-1.5 rounded-lg border border-[#3b82f6]/30 hover:bg-[#3b82f6]/10 transition-all flex-shrink-0"
                            >
                              {copiedCode ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-white">Security Alerts</h1>
                <p className="text-gray-500 text-sm mt-1">Review flagged activity requiring your attention</p>
              </div>

              {alerts.length === 0 ? (
                <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl py-16 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-green-500/30" />
                  <p className="text-gray-400 font-medium">No alerts — all clear!</p>
                  <p className="text-gray-600 text-sm mt-1">When threats are detected, alerts will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((a) => (
                    <div key={a.id} className="bg-[#0d1526] border border-red-500/20 rounded-xl p-5 hover:border-red-500/40 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-200 font-medium">{a.reason}</p>
                          <p className="text-gray-600 text-xs mt-1">{new Date(a.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DOWNLOADS TAB */}
          {activeTab === 'downloads' && (
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-white">App Downloads</h1>
                <p className="text-gray-500 text-sm mt-1">Download and install the CuraGuard apps</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent App */}
                <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e2d4a] px-6 py-5 border-b border-[#1e2d4a]">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#3b82f6]/20 border border-[#3b82f6]/30 p-2.5 rounded-xl">
                        <Users className="w-5 h-5 text-[#3b82f6]" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Parent App</h3>
                        <p className="text-gray-400 text-xs mt-0.5">Monitor & manage safety settings</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <a
                      href="E:/CuraGuard/Mobile/Parent/app/build/outputs/apk/debug/app-debug.apk"
                      download="CuraGuard-Parent.apk"
                      className="flex items-center gap-3 px-4 py-3 border border-[#1e2d4a] rounded-xl hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 transition-all group"
                    >
                      <div className="bg-[#3b82f6]/10 group-hover:bg-[#3b82f6]/20 p-2 rounded-lg transition-colors">
                        <Smartphone className="w-4 h-4 text-[#3b82f6]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">Android APK</div>
                        <div className="text-gray-500 text-xs">Parent monitoring app</div>
                      </div>
                      <Download className="w-4 h-4 text-gray-500 group-hover:text-[#3b82f6] transition-colors" />
                    </a>
                    <button
                      onClick={() => alert('Windows version coming soon!')}
                      className="w-full flex items-center gap-3 px-4 py-3 border border-[#1e2d4a] rounded-xl hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 transition-all group"
                    >
                      <div className="bg-[#3b82f6]/10 group-hover:bg-[#3b82f6]/20 p-2 rounded-lg transition-colors">
                        <Monitor className="w-4 h-4 text-[#3b82f6]" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-medium text-sm">Windows App</div>
                        <div className="text-gray-500 text-xs">Coming soon</div>
                      </div>
                      <Download className="w-4 h-4 text-gray-500 group-hover:text-[#3b82f6] transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Child App */}
                <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#4c1d95] to-[#1e2d4a] px-6 py-5 border-b border-[#1e2d4a]">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#8b5cf6]/20 border border-[#8b5cf6]/30 p-2.5 rounded-xl">
                        <Smartphone className="w-5 h-5 text-[#a78bfa]" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Child App</h3>
                        <p className="text-gray-400 text-xs mt-0.5">Install on your child's device</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <a
                      href="E:/CuraGuard/Mobile/Child/app/build/intermediates/apk/debug/app-debug.apk"
                      download="CuraGuard-Child.apk"
                      className="flex items-center gap-3 px-4 py-3 border border-[#1e2d4a] rounded-xl hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5 transition-all group"
                    >
                      <div className="bg-[#8b5cf6]/10 group-hover:bg-[#8b5cf6]/20 p-2 rounded-lg transition-colors">
                        <Smartphone className="w-4 h-4 text-[#a78bfa]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">Android APK</div>
                        <div className="text-gray-500 text-xs">Safety agent for child's phone</div>
                      </div>
                      <Download className="w-4 h-4 text-gray-500 group-hover:text-[#a78bfa] transition-colors" />
                    </a>
                    <button
                      onClick={() => alert('Windows version coming soon!')}
                      className="w-full flex items-center gap-3 px-4 py-3 border border-[#1e2d4a] rounded-xl hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/5 transition-all group"
                    >
                      <div className="bg-[#8b5cf6]/10 group-hover:bg-[#8b5cf6]/20 p-2 rounded-lg transition-colors">
                        <Monitor className="w-4 h-4 text-[#a78bfa]" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white font-medium text-sm">Windows App</div>
                        <div className="text-gray-500 text-xs">Coming soon</div>
                      </div>
                      <Download className="w-4 h-4 text-gray-500 group-hover:text-[#a78bfa] transition-colors" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Setup instructions */}
              <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#3b82f6]" />
                  Setup Instructions
                </h3>
                <ol className="space-y-3">
                  {[
                    'Install the Parent App on your own Android phone and log in with your CuraGuard credentials.',
                    'Add your child by clicking Children → Add Child. You will receive a unique activation code.',
                    'Install the Child App on your child\'s Android phone.',
                    'Open the Child App and enter the activation code. Monitoring starts immediately.',
                    'Return to this dashboard to view live activity, alerts, and statistics.',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-gray-400">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Child Modal */}
      {showForm && (
        <AddChildFormModal
          onClose={() => setShowForm(false)}
          onSave={handleChildSaved}
        />
      )}

      {/* Success Modal */}
      {generatedCode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-br from-green-600 to-[#059669] py-10 px-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Child Added!</h2>
              <p className="text-green-100 mt-2 text-sm">Your child has been registered in CuraGuard.</p>
            </div>
            <div className="p-8">
              <p className="text-gray-400 text-sm mb-5 text-center">
                Install the <strong className="text-white">Child App</strong> on your child's phone and enter this activation code:
              </p>
              <div className="bg-[#111827] border border-[#1e2d4a] rounded-xl py-5 px-4 mb-2 flex items-center justify-center gap-4">
                <span className="text-3xl font-mono font-extrabold tracking-widest text-white">
                  {generatedCode}
                </span>
                <button
                  onClick={() => copyCode(generatedCode)}
                  className="text-[#3b82f6] hover:text-white p-2 rounded-lg hover:bg-[#3b82f6]/10 transition-all flex-shrink-0"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-gray-600 text-xs text-center mb-6">Save this code — you will need it to activate monitoring</p>
              <button
                onClick={() => setGeneratedCode(null)}
                className="w-full bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Got it, I've saved the code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add Child Form Modal
function AddChildFormModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (child: ChildInfo) => void;
}) {
  const [formData, setFormData] = useState<ChildInfo>({
    name: '', age: '', email: '', mobile_number: '', student_id: '', grade: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: formData.name,
      age: formData.age ? parseInt(formData.age as string, 10) : undefined,
      email: formData.email || undefined,
      mobile_number: formData.mobile_number || undefined,
      student_id: formData.student_id || undefined,
      grade: formData.grade || undefined,
    };
    await onSave(payload as ChildInfo);
    setLoading(false);
  };

  const inputClass = "w-full px-3 py-2.5 bg-[#111827] border border-[#1e2d4a] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#0d1526] border border-[#1e2d4a] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#1e2d4a]">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#3b82f6] to-[#6366f1] p-2 rounded-lg">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add Child</h2>
              <p className="text-gray-500 text-xs">Enter your child's information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-[#111827] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name <span className="text-red-400">*</span></label>
                <input type="text" name="name" value={formData.name as string} onChange={handleChange} required className={inputClass} placeholder="Child's name" />
              </div>
              <div>
                <label className={labelClass}>Age <span className="text-red-400">*</span></label>
                <input type="number" name="age" value={formData.age as string} onChange={handleChange} required min="1" max="18" className={inputClass} placeholder="Age" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Mobile Number</label>
                <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className={inputClass} placeholder="10-digit number" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="child@email.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Student ID</label>
                <input type="text" name="student_id" value={formData.student_id} onChange={handleChange} className={inputClass} placeholder="Student ID" />
              </div>
              <div>
                <label className={labelClass}>Grade <span className="text-red-400">*</span></label>
                <select name="grade" value={formData.grade} onChange={handleChange} required className={`${inputClass} bg-[#111827]`}>
                  <option value="">Select grade</option>
                  {['Kindergarten', ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-[#1e2d4a] mt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#1e2d4a] text-gray-400 rounded-xl text-sm font-medium hover:bg-[#111827] hover:text-white transition-all">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Saving...' : 'Save & Get Code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
