import React, { useState } from 'react';
import {
  ListChecks,
  Plus,
  MoreVertical,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  Trash2,
  Edit,
  Send,
  Loader2
} from 'lucide-react';

export default function TaskTable({
  tasks,
  onOpenCreateModal,
  onUpdateStatus,
  onLogTime,
  onDeleteTask,
  loading
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.createdBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'todo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100/80 text-blue-600 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            todo
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            in_progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            completed
          </span>
        );
      case 'on_hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            on_hold
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
      case 'Urgent':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/80">
            {priority}
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/80">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/80">
            Low
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{priority}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Table Top Toolbar */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
            <ListChecks className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Tasks</h2>
            <p className="text-xs text-slate-500">Manage and track project tasks</p>
          </div>
        </div>

        {/* Search, Filter & Add Button */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search task, assignee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 w-48 lg:w-60"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Create Task Primary Button matching screenshot */}
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-6">Task</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Assign</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4">Log Time (hrs)</th>
              <th className="py-3.5 px-4">Created By</th>
              <th className="py-3.5 px-4">Created</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  Loading project tasks...
                </td>
              </tr>
            ) : paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-400">
                  No tasks found. Click "+ Create Task" to get started!
                </td>
              </tr>
            ) : (
              paginatedTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Task Name */}
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    {t.title}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <div className="relative group inline-block">
                      {getStatusBadge(t.status)}
                      {/* Quick Status Change Popup */}
                      <div className="absolute left-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 hidden group-hover:block z-30">
                        {['todo', 'in_progress', 'completed'].map((st) => (
                          <button
                            key={st}
                            onClick={() => onUpdateStatus(t.id, st)}
                            className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 font-medium capitalize"
                          >
                            Mark {st.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-4 px-4">{getPriorityBadge(t.priority)}</td>

                  {/* Assignee */}
                  <td className="py-4 px-4 font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                        {t.assigneeName ? t.assigneeName.charAt(0) : '?'}
                      </div>
                      <span>{t.assigneeName || 'Unassigned'}</span>
                    </div>
                  </td>

                  {/* Due Date */}
                  <td className="py-4 px-4 text-xs text-slate-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.dueDate || '0000-00-00'}</span>
                    </div>
                  </td>

                  {/* Log Time */}
                  <td className="py-4 px-4 text-xs text-slate-500">
                    <button
                      onClick={() => onLogTime(t)}
                      className="hover:text-blue-600 font-medium hover:underline flex items-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {parseFloat(t.loggedTime) > 0 ? `${t.loggedTime} hrs` : 'No-Log'}
                    </button>
                  </td>

                  {/* Created By */}
                  <td className="py-4 px-4 text-xs font-medium text-slate-600">
                    {t.createdBy || 'Admin'}
                  </td>

                  {/* Created Timestamp */}
                  <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                    {t.createdAt || '2026-09-11 23:47:21'}
                  </td>

                  {/* Actions 3-dots */}
                  <td className="py-4 px-6 text-right relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === t.id ? null : t.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === t.id && (
                      <div className="absolute right-6 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-40 text-left text-xs">
                        <button
                          onClick={() => {
                            onLogTime(t);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                        >
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          Log Time
                        </button>
                        <button
                          onClick={() => {
                            onUpdateStatus(t.id, t.status === 'completed' ? 'todo' : 'completed');
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Toggle Complete
                        </button>
                        <button
                          onClick={() => {
                            onDeleteTask(t.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          Delete Task
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching screenshot */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {paginatedTasks.length} of {filteredTasks.length} tasks
        </div>
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 font-medium disabled:opacity-40 hover:bg-slate-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded-lg font-semibold border ${
                currentPage === page
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-slate-200 font-medium disabled:opacity-40 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
