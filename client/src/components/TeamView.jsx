import React, { useState } from 'react';
import { Users, UserPlus, Send, Edit, Mail, Shield, Check } from 'lucide-react';

export default function TeamView({ teamMembers, onAddMember, onUpdateMember }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!name || !role) return;
    onAddMember({ name, role, email, telegramChatId });
    setName('');
    setRole('');
    setEmail('');
    setTelegramChatId('');
    setShowAddForm(false);
  };

  const handleEditSave = (id) => {
    onUpdateMember(id, { telegramChatId });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Team Management</h1>
            <p className="text-xs text-slate-500">
              Manage team members & map their individual Telegram Chat IDs for alerts
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Add Member Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm space-y-4 animate-in fade-in duration-150"
        >
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">New Team Member</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Role / Position</label>
              <input
                type="text"
                required
                placeholder="e.g. Frontend Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                placeholder="john@kruit.biz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Telegram Chat ID</label>
              <input
                type="text"
                placeholder="e.g. 987654321"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
            >
              Save Member
            </button>
          </div>
        </form>
      )}

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teamMembers.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 hover:border-indigo-200 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                    {m.avatar || m.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{m.name}</h3>
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                      {m.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingId(editingId === m.id ? null : m.id);
                    setTelegramChatId(m.telegramChatId || '');
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                  title="Edit Telegram ID"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Send className="w-3.5 h-3.5 text-sky-500" />
                  <span className="font-mono">
                    Telegram ID:{' '}
                    <strong className="text-slate-700">
                      {m.telegramChatId ? m.telegramChatId : 'Using Global Default'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Inline Edit Telegram Chat ID */}
              {editingId === m.id && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase">
                    Update Telegram Chat ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={telegramChatId}
                      onChange={(e) => setTelegramChatId(e.target.value)}
                      placeholder="e.g. 12345678"
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                    <button
                      onClick={() => handleEditSave(m.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Active Tasks Assigned</span>
              <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {m.activeTasks || 0} tasks
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
