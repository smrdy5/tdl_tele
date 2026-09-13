import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { gsheetDb } from './gsheet_db.js';
import { hashPassword, verifyPassword } from './auth.js';
import { sendTelegramNotification, buildTaskAssignedMessage, buildTaskStatusMessage } from './telegram.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../client/dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Root & Health Check Routes
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Capstone Project Portal API',
    timestamp: new Date()
  });
});

// ----------------------------------------------------
// System & Data Reset APIs
// ----------------------------------------------------
app.post('/api/system/clear-data', async (req, res) => {
  const result = db.clearAllData();
  gsheetDb.saveConfig({ webAppUrl: '' });
  res.json({ success: true, message: 'All static and dynamic user data has been cleared.' });
});

// ----------------------------------------------------
// Secure Authentication APIs
// ----------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, role, password, telegramChatId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingMembers = await gsheetDb.getTeamMembers();
    const duplicate = existingMembers.find(m => m.email && m.email.toLowerCase() === cleanEmail);

    if (duplicate) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const { salt, hash } = hashPassword(password);
    const newMemberData = {
      name: name.trim(),
      email: cleanEmail,
      role: role || 'Tax Consultant',
      telegramChatId: telegramChatId ? telegramChatId.trim() : '',
      salt,
      passwordHash: hash
    };

    const newMember = await gsheetDb.addTeamMember(newMemberData);
    await gsheetDb.addActivityLog('System', 'User Registered', `New user registered: ${newMember.name} (${cleanEmail})`, 'N/A');

    const sanitizedUser = {
      id: newMember.id,
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      telegramChatId: newMember.telegramChatId,
      avatar: newMember.avatar || newMember.name.substring(0, 2).toUpperCase()
    };

    res.status(201).json({ success: true, user: sanitizedUser });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const members = await gsheetDb.getTeamMembers();
    const member = members.find(m => m.email && m.email.toLowerCase() === cleanEmail);

    if (!member) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (member.salt && member.passwordHash) {
      const isValid = verifyPassword(password, member.salt, member.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    await gsheetDb.addActivityLog('System', 'User Login', `User logged in: ${member.name}`, 'N/A');

    const sanitizedUser = {
      id: member.id,
      name: member.name,
      email: member.email,
      role: member.role,
      telegramChatId: member.telegramChatId,
      avatar: member.avatar || member.name.substring(0, 2).toUpperCase()
    };

    res.json({ success: true, user: sanitizedUser });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Authentication failed' });
  }
});

// ----------------------------------------------------
// Google Sheet Database Config & Test APIs
// ----------------------------------------------------
app.get('/api/gsheet/config', (req, res) => {
  const config = gsheetDb.getConfig();
  res.json({
    webAppUrl: config.webAppUrl || '',
    isConfigured: gsheetDb.isConfigured()
  });
});

app.post('/api/gsheet/config', (req, res) => {
  const { webAppUrl } = req.body;
  gsheetDb.saveConfig({ webAppUrl: (webAppUrl || '').trim() });
  gsheetDb.addActivityLog('Admin', 'Google Sheets DB Configured', `Set Web App URL: ${webAppUrl ? 'Configured 🟢' : 'Cleared'}`, 'N/A');
  res.json({ success: true, isConfigured: gsheetDb.isConfigured() });
});

app.post('/api/gsheet/test', async (req, res) => {
  const { webAppUrl } = req.body;
  const result = await gsheetDb.testConnection(webAppUrl);
  if (result.success) {
    res.json({ success: true, message: `Successfully connected to Google Sheet: "${result.sheetName}"` });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

// ----------------------------------------------------
// Projects APIs
// ----------------------------------------------------
app.get('/api/projects', async (req, res) => {
  const projects = await gsheetDb.getProjects();
  res.json(projects);
});

// ----------------------------------------------------
// Team Members APIs
// ----------------------------------------------------
app.get('/api/team', async (req, res) => {
  const members = await gsheetDb.getTeamMembers();
  const sanitized = members.map(m => ({
    id: m.id,
    name: m.name,
    role: m.role,
    email: m.email,
    telegramChatId: m.telegramChatId,
    avatar: m.avatar,
    activeTasks: m.activeTasks
  }));
  res.json(sanitized);
});

app.post('/api/team', async (req, res) => {
  const { name, role, email, telegramChatId, password } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: 'Name and Role are required' });
  }
  
  let salt = '';
  let passwordHash = '';
  if (password) {
    const hashed = hashPassword(password);
    salt = hashed.salt;
    passwordHash = hashed.hash;
  }

  const newMember = await gsheetDb.addTeamMember({ name, role, email, telegramChatId, salt, passwordHash });
  await gsheetDb.addActivityLog('System', 'Team Member Added', `Added ${name} (${role})`, 'N/A');
  
  res.status(201).json({
    id: newMember.id,
    name: newMember.name,
    role: newMember.role,
    email: newMember.email,
    telegramChatId: newMember.telegramChatId,
    avatar: newMember.avatar
  });
});

app.put('/api/team/:id', async (req, res) => {
  const updated = await gsheetDb.updateTeamMember(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Team member not found' });
  }
  await gsheetDb.addActivityLog('System', 'Team Member Updated', `Updated ${updated.name}`, 'N/A');
  res.json(updated);
});

// ----------------------------------------------------
// Tasks APIs
// ----------------------------------------------------
app.get('/api/tasks', async (req, res) => {
  const { projectId } = req.query;
  const tasks = await gsheetDb.getTasks(projectId);
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  try {
    const taskData = req.body;
    if (!taskData.title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const newTask = await gsheetDb.addTask(taskData);
    
    // Telegram Push Notification Trigger
    const teleConfig = await gsheetDb.getTelegramConfig();
    const projects = await gsheetDb.getProjects();
    const teamMembers = await gsheetDb.getTeamMembers();

    const project = projects.find(p => p.id === newTask.projectId);
    const assignee = teamMembers.find(m => m.id === newTask.assigneeId);
    
    const targetChatId = (assignee && assignee.telegramChatId) ? assignee.telegramChatId : teleConfig.defaultChatId;

    let telegramLogStatus = 'Skipped (No Config)';

    if (teleConfig.botToken && targetChatId && teleConfig.notifyOnTaskCreate !== false) {
      const message = buildTaskAssignedMessage(newTask, project, assignee, newTask.createdBy);
      const result = await sendTelegramNotification(teleConfig.botToken, targetChatId, message);
      telegramLogStatus = result.success ? 'Sent ✅' : `Failed: ${result.error}`;
    }

    await gsheetDb.addActivityLog(
      newTask.createdBy || 'Admin',
      'Task Created',
      `Assigned '${newTask.title}' to ${newTask.assigneeName}`,
      telegramLogStatus
    );

    res.status(201).json({ ...newTask, telegramDelivery: telegramLogStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    const updateFields = req.body;
    const { updatedBy } = req.query;

    const result = await gsheetDb.updateTask(taskId, updateFields);
    if (!result) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const { oldTask, updatedTask } = result;
    const teleConfig = await gsheetDb.getTelegramConfig();
    const projects = await gsheetDb.getProjects();
    const teamMembers = await gsheetDb.getTeamMembers();

    const project = projects.find(p => p.id === updatedTask.projectId);
    const assignee = teamMembers.find(m => m.id === updatedTask.assigneeId);
    const targetChatId = (assignee && assignee.telegramChatId) ? assignee.telegramChatId : teleConfig.defaultChatId;

    let telegramLogStatus = 'N/A';

    if (updateFields.status && updateFields.status !== oldTask.status) {
      if (teleConfig.botToken && targetChatId && teleConfig.notifyOnStatusChange !== false) {
        const message = buildTaskStatusMessage(updatedTask, project, oldTask.status, updatedTask.status, updatedBy || 'Team Member');
        const sendResult = await sendTelegramNotification(teleConfig.botToken, targetChatId, message);
        telegramLogStatus = sendResult.success ? 'Sent ✅' : `Failed: ${sendResult.error}`;
      } else {
        telegramLogStatus = 'Skipped (No Config)';
      }

      await gsheetDb.addActivityLog(
        updatedBy || 'Team Member',
        'Status Changed',
        `Task '${updatedTask.title}' moved to ${updatedTask.status}`,
        telegramLogStatus
      );
    } else if (updateFields.loggedTime) {
      await gsheetDb.addActivityLog(
        updatedBy || 'Team Member',
        'Time Logged',
        `Logged ${updateFields.loggedTime} hrs on '${updatedTask.title}'`,
        'N/A'
      );
    }

    res.json({ ...updatedTask, telegramDelivery: telegramLogStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const removed = await gsheetDb.deleteTask(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: 'Task not found' });
  }
  await gsheetDb.addActivityLog('Admin', 'Task Deleted', `Deleted task '${removed.title}'`, 'N/A');
  res.json({ success: true, removed });
});

// ----------------------------------------------------
// Telegram Config & Test APIs
// ----------------------------------------------------
app.get('/api/telegram/config', async (req, res) => {
  const config = await gsheetDb.getTelegramConfig();
  res.json(config);
});

app.post('/api/telegram/config', async (req, res) => {
  const cleanBody = {
    ...req.body,
    botToken: String(req.body.botToken || '').trim().replace(/^["']|["']$/g, ''),
    defaultChatId: String(req.body.defaultChatId || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '')
  };
  const updated = await gsheetDb.saveTelegramConfig(cleanBody);
  await gsheetDb.addActivityLog('Admin', 'Telegram Config Updated', 'Bot settings updated', 'N/A');
  res.json(updated);
});

app.post('/api/telegram/test', async (req, res) => {
  const cleanToken = String(req.body.botToken || '').trim().replace(/^["']|["']$/g, '');
  const cleanChatId = String(req.body.chatId || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
  
  if (!cleanToken || !cleanChatId) {
    return res.status(400).json({ error: 'Bot Token and Chat ID are required for testing' });
  }

  const testMessage = `<b>🎉 CAPSTONE PROJECT PORTAL TELEGRAM TEST</b>\n` +
    `----------------------------------------\n` +
    `✅ Telegram Push Notification setup is working perfectly!\n` +
    `<b>Timestamp:</b> ${new Date().toLocaleString()}\n` +
    `----------------------------------------\n` +
    `<i>You will now receive automatic alerts when team tasks are created or updated.</i>`;

  const result = await sendTelegramNotification(cleanToken, cleanChatId, testMessage);
  
  if (result.success) {
    await gsheetDb.addActivityLog('Admin', 'Telegram Test Sent', `Test notification sent to chat ${cleanChatId}`, 'Sent ✅');
    res.json({ success: true, message: 'Test message sent successfully to Telegram!' });
  } else {
    await gsheetDb.addActivityLog('Admin', 'Telegram Test Failed', `Failed sending test to ${cleanChatId}: ${result.error}`, 'Failed ❌');
    res.status(400).json({ success: false, error: result.error });
  }
});

// ----------------------------------------------------
// Activity Logs API
// ----------------------------------------------------
app.get('/api/activity', async (req, res) => {
  const logs = await gsheetDb.getActivityLogs();
  res.json(logs);
});

// ----------------------------------------------------
// Static Client Serving & Root Catch-all Route
// ----------------------------------------------------
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Capstone Project Portal API</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; max-width: 480px; }
            h1 { color: #38bdf8; margin-top: 0; }
            code { background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 0.25rem; color: #4ade80; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🚀 Capstone Project Portal API</h1>
            <p>The Express backend is live and healthy 🟢</p>
            <p>API endpoints are available at <code>/api/projects</code>, <code>/api/tasks</code>, <code>/api/team</code>, etc.</p>
          </div>
        </body>
      </html>
    `);
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Task Manager API backend running on http://localhost:${PORT}`);
});
