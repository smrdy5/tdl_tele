/**
 * ============================================================================
 * CAPSTONE PROJECT PORTAL - GOOGLE APPS SCRIPT BACKEND ENGINE
 * ============================================================================
 * 
 * INSTRUCTIONS TO LINK TO YOUR GOOGLE DRIVE:
 * 1. Open Google Sheets (https://sheets.google.com) and create a New Blank Spreadsheet.
 * 2. Click "Extensions" -> "Apps Script" in the top menu bar.
 * 3. Delete any code in the editor, paste this entire script, and click Save (disk icon).
 * 4. Click the blue "Deploy" button -> "New deployment".
 * 5. Select type: "Web app".
 * 6. Set Description: "Task Manager Database API".
 * 7. Set "Execute as": "Me".
 * 8. Set "Who has access": "Anyone" (Critical for API access).
 * 9. Click "Deploy", authorize permissions, and COPY the generated Web App URL!
 * 10. Paste the Web App URL into the Web App settings dialog!
 */

function doGet(e) {
  setupDatabaseSheets();
  const action = e.parameter.action || 'all';
  
  if (action === 'projects') {
    return jsonResponse(getProjects());
  } else if (action === 'team') {
    return jsonResponse(getTeamMembers());
  } else if (action === 'tasks') {
    return jsonResponse(getTasks());
  } else if (action === 'telegram') {
    return jsonResponse(getTelegramConfig());
  } else if (action === 'activity') {
    return jsonResponse(getActivityLogs());
  } else if (action === 'ping') {
    return jsonResponse({ status: 'connected', sheetName: SpreadsheetApp.getActiveSpreadsheet().getName(), timestamp: new Date() });
  }

  return jsonResponse({
    projects: getProjects(),
    teamMembers: getTeamMembers(),
    tasks: getTasks(),
    telegramConfig: getTelegramConfig(),
    activityLogs: getActivityLogs()
  });
}

function doPost(e) {
  setupDatabaseSheets();
  let payload = {};
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ error: 'Invalid JSON payload' });
  }

  const action = payload.action;

  if (action === 'addTask') {
    const newTask = addTaskRow(payload.task);
    return jsonResponse({ success: true, task: newTask });
  } else if (action === 'updateTask') {
    const updated = updateTaskRow(payload.taskId, payload.updates);
    return jsonResponse({ success: true, task: updated });
  } else if (action === 'deleteTask') {
    deleteTaskRow(payload.taskId);
    return jsonResponse({ success: true });
  } else if (action === 'addTeam') {
    const newMember = addTeamMemberRow(payload.member);
    return jsonResponse({ success: true, member: newMember });
  } else if (action === 'updateTeam') {
    const updated = updateTeamMemberRow(payload.memberId, payload.updates);
    return jsonResponse({ success: true, member: updated });
  } else if (action === 'saveTelegram') {
    saveTelegramConfigRow(payload.config);
    return jsonResponse({ success: true });
  } else if (action === 'addLog') {
    addActivityLogRow(payload.user, payload.logAction, payload.details, payload.telegramStatus);
    return jsonResponse({ success: true });
  }

  return jsonResponse({ error: 'Unknown action' });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------------------
// Sheet Initialization (Clean Headers)
// ----------------------------------------------------------------------------
function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  ensureSheet(ss, 'Projects', [
    ['id', 'name', 'code', 'status', 'startDate', 'endDate', 'assignedTeamCount', 'description'],
    ['proj-1', 'AI Invoice Generation for M.Y.H Business and Tax Consultant', 'AI-MYH', 'Active', '2026-09-13', '2026-12-31', '0', 'AI-powered automated invoice processing and tax consulting portal.']
  ]);
  
  ensureSheet(ss, 'TeamMembers', [
    ['id', 'name', 'role', 'email', 'telegramChatId', 'avatar', 'activeTasks']
  ]);
  
  ensureSheet(ss, 'Tasks', [
    ['id', 'projectId', 'title', 'status', 'priority', 'assigneeId', 'assigneeName', 'dueDate', 'loggedTime', 'createdBy', 'createdAt', 'description']
  ]);
  
  ensureSheet(ss, 'TelegramConfig', [
    ['botToken', 'defaultChatId', 'notifyOnTaskCreate', 'notifyOnStatusChange'],
    ['', '', 'true', 'true']
  ]);
  
  ensureSheet(ss, 'ActivityLogs', [
    ['id', 'timestamp', 'user', 'action', 'details', 'telegramStatus']
  ]);
}

function ensureSheet(ss, name, defaultRows) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    defaultRows.forEach(row => sheet.appendRow(row));
  }
}

// ----------------------------------------------------------------------------
// Data Extractors
// ----------------------------------------------------------------------------
function getProjects() {
  return sheetToObjects('Projects');
}

function getTeamMembers() {
  return sheetToObjects('TeamMembers');
}

function getTasks() {
  return sheetToObjects('Tasks');
}

function getTelegramConfig() {
  const rows = sheetToObjects('TelegramConfig');
  return rows.length > 0 ? rows[0] : {};
}

function getActivityLogs() {
  return sheetToObjects('ActivityLogs');
}

function sheetToObjects(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const results = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    headers.forEach((h, colIdx) => {
      obj[h] = row[colIdx];
    });
    results.push(obj);
  }
  return results;
}

// ----------------------------------------------------------------------------
// Writers
// ----------------------------------------------------------------------------
function addTaskRow(t) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
  const headers = sheet.getDataRange().getValues()[0];
  const row = headers.map(h => t[h] !== undefined ? t[h] : '');
  sheet.appendRow(row);
  return t;
}

function updateTaskRow(id, updates) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      headers.forEach((h, colIdx) => {
        if (updates[h] !== undefined) {
          sheet.getRange(i + 1, colIdx + 1).setValue(updates[h]);
        }
      });
      break;
    }
  }
}

function deleteTaskRow(id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Tasks');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
}

function addTeamMemberRow(m) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TeamMembers');
  const headers = sheet.getDataRange().getValues()[0];
  const row = headers.map(h => m[h] !== undefined ? m[h] : '');
  sheet.appendRow(row);
  return m;
}

function updateTeamMemberRow(id, updates) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TeamMembers');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('id');
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(id)) {
      headers.forEach((h, colIdx) => {
        if (updates[h] !== undefined) {
          sheet.getRange(i + 1, colIdx + 1).setValue(updates[h]);
        }
      });
      break;
    }
  }
}

function saveTelegramConfigRow(config) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TelegramConfig');
  const headers = sheet.getDataRange().getValues()[0];
  const row = headers.map(h => config[h] !== undefined ? config[h] : '');
  if (sheet.getLastRow() > 1) {
    headers.forEach((h, colIdx) => {
      if (config[h] !== undefined) {
        sheet.getRange(2, colIdx + 1).setValue(config[h]);
      }
    });
  } else {
    sheet.appendRow(row);
  }
}

function addActivityLogRow(user, action, details, telegramStatus) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ActivityLogs');
  const id = 'log-' + Date.now();
  const timestamp = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
  sheet.appendRow([id, timestamp, user, action, details, telegramStatus]);
}
