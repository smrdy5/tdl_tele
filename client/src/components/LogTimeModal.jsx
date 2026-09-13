import React, { useState, useEffect } from 'react';
import { X, Clock, Plus } from 'lucide-react';

export default function LogTimeModal({ isOpen, onClose, task, onSaveLogTime }) {
  const [hours, setHours] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (task) {
      setHours('');
      setNote('');
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newHours = (parseFloat(task.loggedTime || 0) + parseFloat(hours || 0)).toFixed(1);
    onSaveLogTime(task.id, newHours);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Log Hours Worked</h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[220px]">{task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Add Hours (hrs)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              required
              placeholder="e.g. 2.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Current logged total: <b>{task.loggedTime || '0.0'} hrs</b>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Work Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of work done..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20"
            >
              Save Log Time
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
