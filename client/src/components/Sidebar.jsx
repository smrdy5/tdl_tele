import React from 'react';
import { Home, Users, Activity, Send, LogOut, Zap, Database, Trash2 } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  openTelegramModal,
  openGSheetModal,
  gsheetConfigured,
  onLogout
}) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-[#1b255a] text-white flex flex-col justify-between min-h-screen shrink-0 shadow-lg select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-indigo-900/40">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-base tracking-wide text-white">Capstone Portal</span>
        </div>

        {/* Navigation Menu */}
        <div className="px-4 py-6">
          <div className="text-xs font-bold text-indigo-300/60 uppercase tracking-wider px-3 mb-4">
            Main
          </div>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/20'
                      : 'text-indigo-200/75 hover:bg-indigo-900/40 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="text-xs font-bold text-indigo-300/60 uppercase tracking-wider px-3 mt-8 mb-4">
            Database & Alerts
          </div>
          
          <div className="space-y-2">
            {/* Google Sheets Database */}
            <button
              onClick={openGSheetModal}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs text-emerald-200/90 hover:bg-emerald-950/40 hover:text-white transition-all bg-emerald-950/20 border border-emerald-700/30"
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Google Sheets DB</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${gsheetConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
            </button>

            {/* Telegram Alerts */}
            <button
              onClick={openTelegramModal}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs text-indigo-200/90 hover:bg-indigo-900/40 hover:text-white transition-all bg-indigo-950/40 border border-indigo-700/30"
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-sky-400" />
                <span>Telegram Alerts</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            </button>

            {/* Clear All Data Button */}
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to clear all tasks, team members, and activity logs? This action cannot be undone.')) {
                  try {
                    await fetch('/api/system/clear-data', { method: 'POST' });
                    localStorage.clear();
                    window.location.reload();
                  } catch (e) {
                    alert('Failed to clear data');
                  }
                }
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium text-xs text-rose-300/80 hover:bg-rose-950/50 hover:text-rose-200 transition-all border border-rose-900/30"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Clear All User Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-indigo-900/40">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-300/75 hover:bg-indigo-900/40 hover:text-rose-300 hover:bg-rose-950/30 transition-all"
        >
          <LogOut className="w-4 h-4 text-indigo-300" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
