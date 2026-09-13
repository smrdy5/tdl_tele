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

// ----------------------------------------------------------------------------
// Interactive 24/7 Telegram Polling Engine & Always-Reply Bot Handler
// ----------------------------------------------------------------------------
let pollingActive = false;
let lastUpdateId = 0;

export function startTelegramPolling(getBotToken, getTasks, getProjects, getTeam) {
  if (pollingActive) return;
  pollingActive = true;

  const poll = async () => {
    try {
      const token = getBotToken();
      if (token) {
        const cleanToken = String(token).trim().replace(/^["']|["']$/g, '');
        const url = `https://api.telegram.org/bot${cleanToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=5`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            lastUpdateId = update.update_id;
            const message = update.message;
            if (message && message.chat && message.text) {
              await handleIncomingTelegramMessage(cleanToken, message, getTasks, getProjects, getTeam);
            }
          }
        }
      }
    } catch (e) {
      // Silent catch network polling errors
    } finally {
      setTimeout(poll, 3000);
    }
  };

  poll();
}

async function handleIncomingTelegramMessage(botToken, message, getTasks, getProjects, getTeam) {
  const chatId = message.chat.id;
  const text = (message.text || '').trim();
  const userName = message.from?.first_name || message.chat.first_name || 'User';

  let replyText = '';

  if (text.startsWith('/start') || text.startsWith('/help')) {
    replyText = `<b>👋 Hello ${escapeHtml(userName)}!</b>\n\n` +
      `Welcome to <b>Capstone Project Portal Bot</b>\n` +
      `<i>AI Invoice Generation for M.Y.H Business & Tax Consultant</i>\n\n` +
      `🆔 <b>Your Telegram Chat ID:</b> <code>${chatId}</code>\n\n` +
      `✅ You are now subscribed to task alerts!\n\n` +
      `<b>Available Commands:</b>\n` +
      `• /tasks - View active tasks\n` +
      `• /stats - View project overview\n` +
      `• /help - Show this guide`;
  } else if (text.startsWith('/tasks')) {
    const tasks = await getTasks();
    if (!tasks || tasks.length === 0) {
      replyText = `<b>📋 Active Tasks:</b>\nNo active tasks at the moment! 🎉`;
    } else {
      replyText = `<b>📋 Active Tasks (${tasks.length}):</b>\n----------------------------------------\n`;
      tasks.slice(0, 5).forEach((t, i) => {
        const emoji = t.status === 'completed' ? '✅' : '🔵';
        replyText += `${i + 1}. ${emoji} <b>${escapeHtml(t.title)}</b>\n   👤 <i>Assigned: ${escapeHtml(t.assigneeName || 'Unassigned')}</i>\n\n`;
      });
      if (tasks.length > 5) replyText += `<i>...and ${tasks.length - 5} more tasks in portal.</i>`;
    }
  } else if (text.startsWith('/stats')) {
    const tasks = await getTasks();
    const team = await getTeam();
    const completed = (tasks || []).filter(t => t.status === 'completed').length;
    replyText = `<b>📊 Project Overview:</b>\n----------------------------------------\n` +
      `📁 <b>Project:</b> AI Invoice Generation for M.Y.H\n` +
      `👥 <b>Team Members:</b> ${(team || []).length}\n` +
      `📝 <b>Total Tasks:</b> ${(tasks || []).length}\n` +
      `✅ <b>Completed:</b> ${completed}\n` +
      `----------------------------------------`;
  } else {
    // ALWAYS reply to any text or message!
    replyText = `<b>🤖 Hello ${escapeHtml(userName)}!</b>\n\n` +
      `I received your message: "<i>${escapeHtml(text)}</i>"\n\n` +
      `🆔 <b>Your Chat ID:</b> <code>${chatId}</code>\n\n` +
      `<b>Quick Commands:</b>\n` +
      `• /start - Refresh bot & show Chat ID\n` +
      `• /tasks - Show project tasks\n` +
      `• /stats - Show project statistics`;
  }

  await sendTelegramNotification(botToken, String(chatId), replyText);
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
