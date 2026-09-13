import React from 'react';
import { Activity, Send, CheckCircle2, AlertCircle, Clock, RefreshCw } from 'lucide-react';

export default function ActivityLogView({ activityLogs, onRefresh }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Activity & Telegram Log Feed</h2>
            <p className="text-xs text-slate-500">Track system actions and real-time Telegram push delivery</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {activityLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No activity logs recorded yet.</div>
        ) : (
          activityLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50/60 transition-colors flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                {log.action.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-800">{log.action}</span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-600">{log.details}</p>

                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-slate-400">By: <strong className="text-slate-600">{log.user}</strong></span>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <Send className="w-3 h-3 text-sky-500" />
                    <span className="text-slate-500 font-medium">Telegram Status:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        log.telegramStatus?.includes('Sent')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.telegramStatus?.includes('Failed')
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {log.telegramStatus || 'N/A'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
