import React, { useState, useEffect } from 'react';
import { X, Database, CheckCircle2, AlertCircle, Loader2, Link, Copy, FileCode } from 'lucide-react';
import axios from 'axios';

export default function GoogleSheetSettingsModal({ isOpen, onClose, gsheetConfig, onSaveConfig }) {
  const [webAppUrl, setWebAppUrl] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);

  useEffect(() => {
    if (gsheetConfig) {
      setWebAppUrl(gsheetConfig.webAppUrl || '');
    }
  }, [gsheetConfig, isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!webAppUrl) {
      setTestResult({ success: false, error: 'Please enter your Google Sheet Web App URL first.' });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const res = await axios.post('/api/gsheet/test', { webAppUrl });
      setTestResult({ success: true, message: res.data.message });
    } catch (err) {
      setTestResult({
        success: false,
        error: err.response?.data?.error || 'Failed to connect to Google Sheet Web App.'
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveConfig({ webAppUrl });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Google Sheets Database Link</h3>
              <p className="text-xs text-slate-500">Connect Google Drive & Google Sheets as your live DB</p>
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
              <div className="font-bold">{testResult.success ? 'Connected!' : 'Connection Failed'}</div>
              <div>{testResult.success ? testResult.message : testResult.error}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Quick Setup Instructions */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-600" />
              Quick Setup Steps:
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
              <li>Open a blank Google Sheet in your Google Drive.</li>
              <li>Go to <b>Extensions ➔ Apps Script</b>, paste the script code in <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">google_apps_script.gs</code>.</li>
              <li>Click <b>Deploy ➔ New deployment ➔ Web app</b> (Set Access to <i>Anyone</i>).</li>
              <li>Copy the Web App URL and paste it below!</li>
            </ol>
          </div>

          {/* Web App URL Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-slate-400" />
              Google Apps Script Web App URL
            </label>
            <input
              type="text"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Test & Action Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 transition-all disabled:opacity-50"
            >
              {testLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Test Google Sheet Connection</span>
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
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all"
              >
                Save & Link Sheet
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
