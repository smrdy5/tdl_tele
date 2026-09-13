import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db as localDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, 'gsheet_config.json');

class GoogleSheetsDatabase {
  constructor() {
    this.webAppUrl = this.loadConfig().webAppUrl || '';
  }

  loadConfig() {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      }
    } catch (e) {}
    return { webAppUrl: '' };
  }

  saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    this.webAppUrl = config.webAppUrl || '';
  }

  getConfig() {
    return this.loadConfig();
  }

  isConfigured() {
    return Boolean(this.webAppUrl && this.webAppUrl.startsWith('http'));
  }

  async testConnection(url) {
    const targetUrl = url || this.webAppUrl;
    if (!targetUrl) {
      return { success: false, error: 'No Google Sheet Web App URL provided.' };
    }

    try {
      const response = await fetch(`${targetUrl}?action=ping`);
      const data = await response.json();
      if (data.status === 'connected') {
        return { success: true, sheetName: data.sheetName || 'Google Sheet DB' };
      }
      return { success: false, error: 'Received unexpected response from Google Sheet Web App.' };
    } catch (err) {
      return { success: false, error: err.message || 'Network error connecting to Google Sheet Web App.' };
    }
  }

  // --------------------------------------------------
  // Read Operations
  // --------------------------------------------------
  async getProjects() {
    if (this.isConfigured()) {
      try {
        const res = await fetch(`${this.webAppUrl}?action=projects`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.error('Google Sheet fetch projects error, using local DB:', err.message);
      }
    }
    return localDb.getProjects();
  }

  async getTeamMembers() {
    if (this.isConfigured()) {
      try {
        const res = await fetch(`${this.webAppUrl}?action=team`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      } catch (err) {
        console.error('Google Sheet fetch team error, using local DB:', err.message);
      }
    }
    return localDb.getTeamMembers();
  }

  async getTasks(projectId) {
    if (this.isConfigured()) {
      try {
        const res = await fetch(`${this.webAppUrl}?action=tasks`);
        const data = await res.json();
        if (Array.isArray(data)) {
          if (projectId) return data.filter(t => t.projectId === projectId);
          return data;
        }
      } catch (err) {
        console.error('Google Sheet fetch tasks error, using local DB:', err.message);
      }
    }
    return localDb.getTasks(projectId);
  }

  async getTelegramConfig() {
    if (this.isConfigured()) {
      try {
        const res = await fetch(`${this.webAppUrl}?action=telegram`);
        const data = await res.json();
        if (data && (data.botToken || data.defaultChatId)) return data;
      } catch (err) {
        console.error('Google Sheet fetch telegram config error, using local DB:', err.message);
      }
    }
    return localDb.getTelegramConfig();
  }

  async getActivityLogs() {
    if (this.isConfigured()) {
      try {
        const res = await fetch(`${this.webAppUrl}?action=activity`);
        const data = await res.json();
        if (Array.isArray(data)) return data;
      } catch (err) {
        console.error('Google Sheet fetch activity error, using local DB:', err.message);
      }
    }
    return localDb.getActivityLogs();
  }

  // --------------------------------------------------
  // Write Operations
  // --------------------------------------------------
  async addTask(taskData) {
    const newTask = localDb.addTask(taskData);
    if (this.isConfigured()) {
      try {
        await fetch(this.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'addTask', task: newTask })
        });
      } catch (err) {
        console.error('Google Sheet sync addTask error:', err.message);
      }
    }
    return newTask;
  }

  async updateTask(id, updateFields) {
    const result = localDb.updateTask(id, updateFields);
    if (result && this.isConfigured()) {
      try {
        await fetch(this.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'updateTask', taskId: id, updates: updateFields })
        });
      } catch (err) {
        console.error('Google Sheet sync updateTask error:', err.message);
      }
    }
    return result;
  }

  async deleteTask(id) {
    const removed = localDb.deleteTask(id);
    if (removed && this.isConfigured()) {
      try {
        await fetch(this.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'deleteTask', taskId: id })
        });
      } catch (err) {
        console.error('Google Sheet sync deleteTask error:', err.message);
      }
    }
    return removed;
  }

  async addTeamMember(member) {
    const newMember = localDb.addTeamMember(member);
    if (this.isConfigured()) {
      try {
        await fetch(this.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'addTeam', member: newMember })
        });
      } catch (err) {
        console.error('Google Sheet sync addTeamMember error:', err.message);
      }
    }
    return newMember;
  }

  async updateTeamMember(id, memberData) {
    const updated = localDb.updateTeamMember(id, memberData);
    if (updated && this.isConfigured()) {
      try {
        await fetch(this.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'updateTeam', memberId: id, updates: memberData })
        });
      } catch (err) {
        console.error('Google Sheet sync updateTeamMember error:', err.message);
      }
    }
    return updated;
  }

  async saveTelegramConfig(config) {
    const updated = localDb.saveTelegramConfig(config);
    if (this.isConfigured()) {
      try {
        await fetch(this.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'saveTelegram', config: updated })
        });
      } catch (err) {
        console.error('Google Sheet sync saveTelegramConfig error:', err.message);
      }
    }
    return updated;
  }

  async addActivityLog(user, action, details, telegramStatus) {
    const log = localDb.addActivityLog(user, action, details, telegramStatus);
    if (this.isConfigured()) {
      try {
        await fetch(this.webAppUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addLog',
            user,
            logAction: action,
            details,
            telegramStatus
          })
        });
      } catch (err) {
        console.error('Google Sheet sync addActivityLog error:', err.message);
      }
    }
    return log;
  }
}

export const gsheetDb = new GoogleSheetsDatabase();
