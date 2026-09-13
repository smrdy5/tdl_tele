import React, { useState, useEffect } from 'react';
import { X, Send, Plus, User, Users } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSubmit, teamMembers, activeProjectId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeMode, setAssigneeMode] = useState('select'); // 'select' | 'custom'
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [customAssigneeName, setCustomAssigneeName] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('2026-09-25');
  const [createdBy, setCreatedBy] = useState('Admin');

  useEffect(() => {
    if (teamMembers && teamMembers.length > 0) {
      setAssigneeMode('select');
      setSelectedMemberId(teamMembers[0].id);
    } else {
      setAssigneeMode('custom');
    }
  }, [teamMembers, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let assigneeName = '';
    let assigneeId = '';

    if (assigneeMode === 'select' && teamMembers && teamMembers.length > 0) {
      const found = teamMembers.find((m) => m.id === selectedMemberId);
      assigneeName = found ? found.name : 'Unassigned';
      assigneeId = found ? found.id : '';
    } else {
      assigneeName = customAssigneeName.trim() || 'Unassigned';
      assigneeId = '';
    }

    onSubmit({
      projectId: activeProjectId,
      title,
      description,
      assigneeId,
      assigneeName,
      priority,
      dueDate,
      createdBy: createdBy || 'Admin',
      status: 'todo'
    });

    setTitle('');
    setDescription('');
    setCustomAssigneeName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Create New Task</h3>
              <p className="text-xs text-slate-500">Assign task to team member with Telegram alert</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram Notice Banner */}
        <div className="mb-5 p-3 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center gap-3 text-sky-800 text-xs">
          <Send className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            <b>Telegram Push Alert Active</b>: A formatted alert will be pushed to Telegram upon task creation.
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design invoice template layout"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ASSIGNEE FIELD */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assignee
                </label>
                {teamMembers && teamMembers.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAssigneeMode(assigneeMode === 'select' ? 'custom' : 'select')}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    {assigneeMode === 'select' ? '+ Custom Name' : 'Select Team'}
                  </button>
                )}
              </div>

              {assigneeMode === 'select' && teamMembers && teamMembers.length > 0 ? (
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Type assignee name..."
                    value={customAssigneeName}
                    onChange={(e) => setCustomAssigneeName(e.target.value)}
                    className="w-full h-10 pl-9 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              )}
            </div>

            {/* PRIORITY FIELD */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Created By
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Description
            </label>
            <textarea
              rows={3}
              placeholder="Add key instructions or links for the assignee..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Create & Push Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
