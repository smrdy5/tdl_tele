import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProjectStats from './components/ProjectStats';
import TaskTable from './components/TaskTable';
import TaskModal from './components/TaskModal';
import TeamView from './components/TeamView';
import TelegramSettingsModal from './components/TelegramSettingsModal';
import GoogleSheetSettingsModal from './components/GoogleSheetSettingsModal';
import ActivityLogView from './components/ActivityLogView';
import LogTimeModal from './components/LogTimeModal';
import LoginPage from './components/LoginPage';
import { Send } from 'lucide-react';

export default function App() {
  // Safe Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('kruit_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [telegramConfig, setTelegramConfig] = useState(null);
  const [gsheetConfig, setGsheetConfig] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [isGSheetModalOpen, setIsGSheetModalOpen] = useState(false);
  const [logTimeTask, setLogTimeTask] = useState(null);

  // Notifications Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Auth Handlers
  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('kruit_user', JSON.stringify(user));
    } catch (e) {}
    showToast(`Welcome back, ${user.name}!`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('kruit_user');
    } catch (e) {}
  };

  // Team Actions (Declared before early returns)
  const handleAddMember = async (memberData) => {
    try {
      const res = await axios.post('/api/team', memberData);
      setTeamMembers((prev) => [...prev, res.data]);
      showToast(`Added ${memberData.name} to team!`, 'success');
      return res.data;
    } catch (err) {
      showToast('Failed to add team member', 'error');
    }
  };

  const handleUpdateMember = async (id, memberData) => {
    try {
      const res = await axios.put(`/api/team/${id}`, memberData);
      setTeamMembers((prev) => prev.map((m) => (m.id === id ? res.data : m)));
      showToast('Team member updated', 'success');
    } catch (err) {
      showToast('Failed to update member', 'error');
    }
  };

  // Task Actions
  const handleCreateTask = async (taskData) => {
    try {
      const payload = {
        ...taskData,
        createdBy: currentUser?.name || 'Manager'
      };
      const res = await axios.post('/api/tasks', payload);
      setTasks((prev) => [res.data, ...prev]);
      fetchData();

      if (res.data.telegramDelivery?.includes('Sent')) {
        showToast(`Task created & Telegram alert sent! 📲`, 'success');
      } else {
        showToast(`Task created! (${res.data.telegramDelivery || 'Telegram skipped'})`, 'info');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create task', 'error');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      const res = await axios.patch(`/api/tasks/${taskId}?updatedBy=${encodeURIComponent(currentUser?.name || 'User')}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      fetchData();

      if (res.data.telegramDelivery?.includes('Sent')) {
        showToast(`Status updated & Telegram alert pushed! 🔔`, 'success');
      } else {
        showToast(`Status updated to ${newStatus}`, 'info');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSaveLogTime = async (taskId, newLoggedTime) => {
    try {
      await axios.patch(`/api/tasks/${taskId}?updatedBy=${encodeURIComponent(currentUser?.name || 'User')}`, { loggedTime: newLoggedTime });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, loggedTime: newLoggedTime } : t))
      );
      fetchData();
      showToast(`Logged ${newLoggedTime} hours successfully!`, 'success');
    } catch (err) {
      showToast('Failed to log time', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      fetchData();
      showToast('Task deleted', 'info');
    } catch (err) {
      showToast('Failed to delete task', 'error');
    }
  };

  // Config Actions
  const handleSaveTelegramConfig = async (config) => {
    try {
      const res = await axios.post('/api/telegram/config', config);
      setTelegramConfig(res.data);
      showToast('Telegram Bot settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save Telegram config', 'error');
    }
  };

  const handleSaveGSheetConfig = async (config) => {
    try {
      const res = await axios.post('/api/gsheet/config', config);
      setGsheetConfig({ webAppUrl: config.webAppUrl, isConfigured: res.data.isConfigured });
      fetchData();
      showToast('Google Sheet Database URL saved!', 'success');
    } catch (err) {
      showToast('Failed to save Google Sheet config', 'error');
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, teamRes, taskRes, teleRes, gsheetRes, actRes] = await Promise.all([
        axios.get('/api/projects').catch(() => ({ data: [] })),
        axios.get('/api/team').catch(() => ({ data: [] })),
        axios.get('/api/tasks').catch(() => ({ data: [] })),
        axios.get('/api/telegram/config').catch(() => ({ data: {} })),
        axios.get('/api/gsheet/config').catch(() => ({ data: {} })),
        axios.get('/api/activity').catch(() => ({ data: [] }))
      ]);

      const projData = Array.isArray(projRes.data) ? projRes.data : [];
      setProjects(projData);
      if (projData.length > 0 && !activeProject) {
        setActiveProject(projData[0]);
      }

      setTeamMembers(Array.isArray(teamRes.data) ? teamRes.data : []);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);
      setTelegramConfig(teleRes.data || {});
      setGsheetConfig(gsheetRes.data || {});
      setActivityLogs(Array.isArray(actRes.data) ? actRes.data : []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Render Login Page if not authenticated
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} teamMembers={teamMembers || []} onAddMember={handleAddMember} />;
  }

  const projectTasks = (tasks || []).filter(
    (t) => !activeProject || t.projectId === activeProject.id
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dark Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openTelegramModal={() => setIsTelegramModalOpen(true)}
        openGSheetModal={() => setIsGSheetModalOpen(true)}
        gsheetConfigured={Boolean(gsheetConfig?.isConfigured)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <Header
          projects={projects || []}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
          openTelegramModal={() => setIsTelegramModalOpen(true)}
          telegramConfigured={Boolean(telegramConfig?.botToken && telegramConfig?.defaultChatId)}
          openGSheetModal={() => setIsGSheetModalOpen(true)}
          gsheetConfigured={Boolean(gsheetConfig?.isConfigured)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Dynamic Page Views */}
        <main className="p-8 max-w-7xl w-full mx-auto flex-1">
          {/* Toast Alert Banner */}
          {toast && (
            <div
              className={`mb-6 p-4 rounded-2xl shadow-lg border flex items-center justify-between animate-in slide-in-from-top duration-300 ${
                toast.type === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : toast.type === 'error'
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-blue-600 text-white border-blue-500'
              }`}
            >
              <div className="flex items-center gap-3 font-semibold text-sm">
                <Send className="w-5 h-5" />
                <span>{typeof toast.message === 'object' ? (toast.message?.message || JSON.stringify(toast.message)) : String(toast.message)}</span>
              </div>
              <button onClick={() => setToast(null)} className="text-white/80 hover:text-white font-bold">
                ✕
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              <ProjectStats activeProject={activeProject} totalMembers={(teamMembers || []).length} />
              <TaskTable
                tasks={projectTasks}
                onOpenCreateModal={() => setIsTaskModalOpen(true)}
                onUpdateStatus={handleUpdateStatus}
                onLogTime={(t) => setLogTimeTask(t)}
                onDeleteTask={handleDeleteTask}
                loading={loading}
              />
            </>
          )}

          {activeTab === 'team' && (
            <TeamView
              teamMembers={teamMembers || []}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityLogView activityLogs={activityLogs || []} onRefresh={fetchData} />
          )}
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        teamMembers={teamMembers || []}
        activeProjectId={activeProject?.id || 'proj-1'}
      />

      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        config={telegramConfig}
        onSaveConfig={handleSaveTelegramConfig}
      />

      <GoogleSheetSettingsModal
        isOpen={isGSheetModalOpen}
        onClose={() => setIsGSheetModalOpen(false)}
        gsheetConfig={gsheetConfig}
        onSaveConfig={handleSaveGSheetConfig}
      />

      <LogTimeModal
        isOpen={Boolean(logTimeTask)}
        onClose={() => setLogTimeTask(null)}
        task={logTimeTask}
        onSaveLogTime={handleSaveLogTime}
      />
    </div>
  );
}
