import React from 'react';
import { CheckCircle2, Calendar, Users, ArrowLeft } from 'lucide-react';

const formatDate = (dateStr, defaultStr) => {
  if (!dateStr) return defaultStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {}
  return String(dateStr).split('T')[0] || defaultStr;
};

export default function ProjectStats({ activeProject, totalMembers }) {
  if (!activeProject) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-6">
      {/* Project Title Row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
            {activeProject.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{activeProject.name}</h1>
            <p className="text-xs text-slate-500 font-medium">{activeProject.description || 'Project details & task tracking'}</p>
          </div>
        </div>

        <button
          onClick={() => alert('Back to Projects List')}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back</span>
        </button>
      </div>

      {/* 4 Stats Cards matching screenshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: STATUS */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Status</div>
            <div className="text-base font-bold text-slate-800">{activeProject.status || 'Active'}</div>
          </div>
        </div>

        {/* Card 2: START DATE */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Start Date</div>
            <div className="text-base font-bold text-slate-800">{formatDate(activeProject.startDate, '2026-09-12')}</div>
          </div>
        </div>

        {/* Card 3: END DATE */}
        <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">End Date</div>
            <div className="text-base font-bold text-slate-800">{formatDate(activeProject.endDate, '2026-12-30')}</div>
          </div>
        </div>

        {/* Card 4: ASSIGNED TEAM */}
        <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Assigned Team</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-slate-800 truncate">{activeProject.name}</span>
              <span className="bg-sky-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Users className="w-3 h-3" />
                {totalMembers || activeProject.assignedTeamCount || 6}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
