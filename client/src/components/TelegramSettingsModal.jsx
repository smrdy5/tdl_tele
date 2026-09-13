import React, { useState, useEffect } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2, Key, MessageSquare } from 'lucide-react';
import axios from 'axios';

export default function TelegramSettingsModal({ isOpen, onClose, config, onSaveConfig }) {
  const [botToken, setBotToken] = useState('');
  const [defaultChatId, setDefaultChatId] = useState('');
  const [notifyOnTaskCreate, setNotifyOnTaskCreate] = useState(true);
  const [notifyOnStatusChange, setNotifyOnStatusChange] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (config) {
      setBotToken(config.botToken || '');
      setDefaultChatId(config.defaultChatId || '');
      setNotifyOnTaskCreate(config.notifyOnTaskCreate !== false);
      setNotifyOnStatusChange(config.notifyOnStatusChange !== false);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!botToken || !defaultChatId) {
      setTestResult({ success: false, error: 'Please enter Bot Token and Chat ID first.' });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await axios.post('/api/telegram/test', { botToken, chatId: defaultChatId });
      setTestResult({ success: true, message: res.data.message });
    } catch (err) {
      const errVal = err.response?.data?.error || err.response?.data || err.message;
      const errMsg = typeof errVal === 'object' ? (errVal.message || errVal.error || JSON.stringify(errVal)) : (errVal || 'Failed to send Telegram test message.');
      setTestResult({
        success: false,
        error: errMsg
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig({
      botToken,
      defaultChatId,
      notifyOnTaskCreate,
      notifyOnStatusChange
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Telegram Push Integration</h3>
              <p className="text-xs text-slate-500">Configure Telegram Bot Token & Chat ID</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Test Result Alert Banner */}
        {testResult && (
          <div
            className={`mb-5 p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">{testResult.success ? 'Success!' : 'Connection Error'}</div>
              <div>{testResult.success ? testResult.message : (typeof testResult.error === 'object' ? (testResult.error.message || JSON.stringify(testResult.error)) : String(testResult.error))}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Bot Token Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              Telegram Bot API Token
            </label>
            <input
              type="password"
              placeholder="e.g. 7182938495:AAFx... (from @BotFather)"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Create a bot on Telegram via <b>@BotFather</b> and paste the HTTP API Token here.
            </p>
          </div>

          {/* Default Chat ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Default Telegram Chat / Group ID
            </label>
            <input
              type="text"
              placeholder="e.g. 123456789 or -100123456789"
              value={defaultChatId}
              onChange={(e) => setDefaultChatId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Obtain your user or group Chat ID using <b>@userinfobot</b> on Telegram.
            </p>
          </div>

          {/* Notification Triggers */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Automated Push Triggers
            </div>
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnTaskCreate}
                  onChange={(e) => setNotifyOnTaskCreate(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Send push alert on new Task Assignment
              </label>
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnStatusChange}
                  onChange={(e) => setNotifyOnStatusChange(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                Send push alert on Task Status Update (e.g. Completed)
              </label>
            </div>
          </div>

          {/* Test & Action Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl border border-sky-200 transition-all disabled:opacity-50"
            >
              {testLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Send Test Notification</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
