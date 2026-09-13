import fs from 'fs';

// Helper for sending messages via Telegram Bot API using native fetch
export async function sendTelegramNotification(botToken, chatId, messageText) {
  if (!botToken || !chatId) {
    return {
      success: false,
      error: 'Bot Token or Chat ID is missing. Please configure Telegram settings.'
    };
  }

  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();
  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.description || 'Failed to send Telegram message'
      };
    }

    return {
      success: true,
      data: data.result
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Network error connecting to Telegram Bot API'
    };
  }
}

// Build task assigned notification text
export function buildTaskAssignedMessage(task, project, assignee, creator) {
  const priorityEmoji = {
    'Low': '🟢',
    'Medium': '🟡',
    'High': '🟠',
    'Urgent': '🔴'
  }[task.priority] || '📌';

  return `<b>🚨 NEW TASK ASSIGNED</b>\n` +
    `----------------------------------------\n` +
    `<b>Task:</b> ${escapeHtml(task.title)}\n` +
    `<b>Project:</b> 📁 ${escapeHtml(project ? project.name : 'General')}\n` +
    `<b>Assigned To:</b> 👤 ${escapeHtml(assignee ? assignee.name : 'Unassigned')}\n` +
    `<b>Priority:</b> ${priorityEmoji} ${task.priority}\n` +
    `<b>Due Date:</b> 📅 ${task.dueDate || 'No due date'}\n` +
    `<b>Created By:</b> 👨‍💻 ${escapeHtml(creator || 'Manager')}\n` +
    `<b>Status:</b> 🔵 ${task.status.toUpperCase()}\n` +
    (task.description ? `\n<b>Description:</b>\n<i>${escapeHtml(task.description)}</i>\n` : '') +
    `----------------------------------------\n` +
    `<i>Capstone Project Portal - M.Y.H Business & Tax Consultant</i>`;
}

// Build status updated message
export function buildTaskStatusMessage(task, project, oldStatus, newStatus, updatedBy) {
  const statusEmoji = {
    'todo': '🔵',
    'in_progress': '🟡',
    'completed': '✅',
    'on_hold': '⏸️'
  }[newStatus] || '📌';

  return `<b>🔄 TASK STATUS UPDATED</b>\n` +
    `----------------------------------------\n` +
    `<b>Task:</b> ${escapeHtml(task.title)}\n` +
    `<b>Project:</b> 📁 ${escapeHtml(project ? project.name : 'General')}\n` +
    `<b>Status:</b> ${oldStatus.toUpperCase()} ➔ ${statusEmoji} <b>${newStatus.toUpperCase()}</b>\n` +
    `<b>Assignee:</b> 👤 ${escapeHtml(task.assigneeName || 'Team')}\n` +
    `<b>Updated By:</b> ${escapeHtml(updatedBy || 'Team Member')}\n` +
    `----------------------------------------\n` +
    `<i>Capstone Project Portal - M.Y.H Business & Tax Consultant</i>`;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
