import React from 'react';
import { ChevronDown, Send, Database, LogOut } from 'lucide-react';

export default function Header({
  projects,
  activeProject,
  setActiveProject,
  openTelegramModal,
  telegramConfigured,
  openGSheetModal,
  gsheetConfigured,
  currentUser,
  onLogout
}) {
  const avatarText = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'PH';

  return (
    <header className="bg-[#2c4ec7] text-white px-8 py-3.5 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-4">
        {/* Left side info */}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Google Sheet Database Quick Button */}
        <button
          onClick={openGSheetModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            gsheetConfigured
              ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/30'
              : 'bg-amber-500/20 text-amber-100 border-amber-400/40 hover:bg-amber-500/30 animate-pulse'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>{gsheetConfigured ? 'Google Sheets DB' : 'Connect Sheet'}</span>
        </button>

        {/* Telegram Config Quick Button */}
        <button
          onClick={openTelegramModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            telegramConfigured
              ? 'bg-sky-500/20 text-sky-100 border-sky-400/40 hover:bg-sky-500/30'
              : 'bg-amber-500/20 text-amber-100 border-amber-400/40 hover:bg-amber-500/30 animate-pulse'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{telegramConfigured ? 'Telegram Bot' : 'Setup Bot'}</span>
        </button>

        {/* Project Selector Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-2 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer transition-all">
            <span className="w-2 h-2 rounded-full bg-blue-300"></span>
            <span>{activeProject ? activeProject.name : 'Select Project'}</span>
            <ChevronDown className="w-4 h-4 text-blue-200" />
          </div>

          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1 hidden group-hover:block z-50 text-slate-800">
            <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Select Project
            </div>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProject(p)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 flex items-center justify-between ${
                  activeProject?.id === p.id ? 'font-semibold text-blue-600 bg-blue-50/50' : ''
                }`}
              >
                <span>{p.name}</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{p.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Profile Badge */}
        <div className="relative group flex items-center gap-2.5 pl-2">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-blue-500 text-white font-bold text-xs flex items-center justify-center border-2 border-white/40 shadow-sm relative">
              {avatarText}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#2c4ec7]"></span>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold leading-none text-white">{currentUser?.name || 'User'}</div>
              <div className="text-[10px] text-blue-200/80 leading-none mt-0.5">{currentUser?.role || 'Member'}</div>
            </div>
          </div>

          {/* Logout Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1 hidden group-hover:block z-50 text-slate-800 text-xs">
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="font-bold text-slate-800">{currentUser?.name || 'User'}</div>
              <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
            </div>
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
