import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data.json');

const initialData = {
  projects: [
    {
      id: "proj-1",
      name: "AI Invoice Generation for M.Y.H Business and Tax Consultant",
      code: "AI-MYH",
      status: "Active",
      startDate: "2026-09-13",
      endDate: "2026-12-31",
      assignedTeamCount: 0,
      description: "AI-powered automated invoice processing, OCR data extraction, and tax consulting portal system."
    }
  ],
  teamMembers: [],
  tasks: [],
  telegramConfig: {
    botToken: "",
    defaultChatId: "",
    notifyOnTaskCreate: true,
    notifyOnStatusChange: true,
    notifyOnTimeLog: true
  },
  activityLogs: []
};

class JSONDatabase {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_FILE)) {
      this.save(initialData);
    }
  }

  read() {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading DB, returning initial data', err);
      return initialData;
    }
  }

  save(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  clearAllData() {
    this.save(initialData);
    return initialData;
  }

  getProjects() {
    return this.read().projects || [];
  }

  getTeamMembers() {
    return this.read().teamMembers || [];
  }

  addTeamMember(member) {
    const data = this.read();
    const newMember = {
      id: `member-${Date.now()}`,
      activeTasks: 0,
      avatar: (member.name || 'Member').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      ...member
    };
    data.teamMembers.push(newMember);
    this.save(data);
    return newMember;
  }

  updateTeamMember(id, memberData) {
    const data = this.read();
    const idx = data.teamMembers.findIndex(m => m.id === id);
    if (idx !== -1) {
      data.teamMembers[idx] = { ...data.teamMembers[idx], ...memberData };
      this.save(data);
      return data.teamMembers[idx];
    }
    return null;
  }

  getTasks(projectId) {
    const tasks = this.read().tasks || [];
    if (projectId) {
      return tasks.filter(t => t.projectId === projectId);
    }
    return tasks;
  }

  addTask(taskData) {
    const data = this.read();
    const assignee = data.teamMembers.find(m => m.id === taskData.assigneeId);
    
    const newTask = {
      id: `task-${Date.now()}`,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'Medium',
      assigneeName: assignee ? assignee.name : (taskData.assigneeName || 'Unassigned'),
      loggedTime: taskData.loggedTime || '0.0',
      createdBy: taskData.createdBy || 'Admin',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ...taskData
    };
    
    data.tasks.unshift(newTask);
    this.save(data);
    return newTask;
  }

  updateTask(id, updateFields) {
    const data = this.read();
    const idx = data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const oldTask = { ...data.tasks[idx] };
      
      if (updateFields.assigneeId) {
        const assignee = data.teamMembers.find(m => m.id === updateFields.assigneeId);
        if (assignee) {
          updateFields.assigneeName = assignee.name;
        }
      }
      
      data.tasks[idx] = { ...data.tasks[idx], ...updateFields };
      this.save(data);
      return { oldTask, updatedTask: data.tasks[idx] };
    }
    return null;
  }

  deleteTask(id) {
    const data = this.read();
    const idx = data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const removed = data.tasks.splice(idx, 1)[0];
      this.save(data);
      return removed;
    }
    return null;
  }

  getTelegramConfig() {
    return this.read().telegramConfig || initialData.telegramConfig;
  }

  saveTelegramConfig(config) {
    const data = this.read();
    data.telegramConfig = { ...data.telegramConfig, ...config };
    this.save(data);
    return data.telegramConfig;
  }

  addActivityLog(user, action, details, telegramStatus) {
    const data = this.read();
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user,
      action,
      details,
      telegramStatus
    };
    data.activityLogs.unshift(newLog);
    if (data.activityLogs.length > 100) {
      data.activityLogs = data.activityLogs.slice(0, 100);
    }
    this.save(data);
    return newLog;
  }

  getActivityLogs() {
    return this.read().activityLogs || [];
  }
}

export const db = new JSONDatabase();
