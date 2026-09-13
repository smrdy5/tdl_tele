import fs from 'fs';

// Helper for sending messages via Telegram Bot API using native fetch
export async function sendTelegramNotification(botToken, chatId, messageText) {
  if (!botToken || !chatId) {
    return {
      success: false,
      error: 'Bot Token or Chat ID is missing. Please configure Telegram settings.'
    };
  }

  const cleanToken = String(botToken || '').trim().replace(/^["']|["']$/g, '');
  const cleanChatId = String(chatId || '').trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '');
  
  if (!cleanToken || !cleanChatId) {
    return {
      success: false,
      error: 'Invalid Bot Token or Chat ID format.'
    };
  }

  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

  try {
    // Attempt 1: Send formatted HTML message
    let response = await fetch(url, {
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

    let data = await response.json();

    // Attempt 2: Fallback to plain text if HTML parsing failed
    if (!data.ok && data.description && (data.description.includes('parse') || data.description.includes('entity'))) {
      const plainText = messageText.replace(/<[^>]*>/g, '');
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: cleanChatId,
          text: plainText,
          disable_web_page_preview: true
        }),
      });
      data = await response.json();
    }

    if (!data.ok) {
      let friendlyError = data.description || 'Failed to send Telegram message';
      if (friendlyError.includes('chat not found')) {
        friendlyError = 'Chat ID not found. Make sure your bot is added to the channel/group as an Admin.';
      } else if (friendlyError.includes('bot can\'t initiate conversation') || friendlyError.includes('initiate conversation')) {
        friendlyError = 'User has not started the bot yet. Search for your bot in Telegram and click /start first!';
      } else if (friendlyError.includes('Unauthorized')) {
        friendlyError = 'Invalid Bot Token. Check the token from @BotFather.';
      } else if (friendlyError.includes('bot was blocked')) {
        friendlyError = 'Bot was blocked by the user or channel.';
      } else if (friendlyError.includes('not a member') || friendlyError.includes('administrator')) {
        friendlyError = 'Bot is not a member or Admin of the Telegram channel.';
      }

      return {
        success: false,
        error: friendlyError
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
