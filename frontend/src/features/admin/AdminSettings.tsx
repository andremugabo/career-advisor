import { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import { notify } from '../../lib/toast';
import {
  Settings, Save, Shield, Bell, Palette, Globe, Database,
  ToggleLeft, ToggleRight, Check
} from 'lucide-react';

interface SettingItem {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'text' | 'select';
  value: any;
  options?: string[];
  category: string;
}

const DEFAULT_SETTINGS: SettingItem[] = [
  // Security
  { key: 'mfa_required', label: 'Require MFA for All Users', description: 'Enforce multi-factor authentication for every account.', type: 'toggle', value: true, category: 'Security' },
  { key: 'session_timeout', label: 'Session Timeout (minutes)', description: 'Auto-logout after inactivity period.', type: 'select', value: '30', options: ['15', '30', '60', '120'], category: 'Security' },
  { key: 'password_policy', label: 'Password Policy', description: 'Minimum password strength requirement.', type: 'select', value: 'Strong', options: ['Basic', 'Medium', 'Strong'], category: 'Security' },
  { key: 'ip_logging', label: 'IP Address Logging', description: 'Log IP addresses for audit trail purposes.', type: 'toggle', value: true, category: 'Security' },

  // Notifications
  { key: 'email_notifications', label: 'Email Notifications', description: 'Send email alerts for important system events.', type: 'toggle', value: true, category: 'Notifications' },
  { key: 'welcome_email', label: 'Welcome Email on Registration', description: 'Send a welcome email to new users upon sign-up.', type: 'toggle', value: true, category: 'Notifications' },
  { key: 'advisor_alerts', label: 'Advisor Intervention Alerts', description: 'Notify advisors when students need attention.', type: 'toggle', value: false, category: 'Notifications' },

  // Platform
  { key: 'site_name', label: 'Platform Name', description: 'Display name shown in headers and emails.', type: 'text', value: 'AUCA Career Advisor', category: 'Platform' },
  { key: 'max_recommendations', label: 'Max AI Recommendations', description: 'Maximum career recommendations per student.', type: 'select', value: '5', options: ['3', '5', '10', '15'], category: 'Platform' },
  { key: 'maintenance_mode', label: 'Maintenance Mode', description: 'Show maintenance page to all non-admin users.', type: 'toggle', value: false, category: 'Platform' },
  { key: 'auto_match', label: 'Auto-Match Internships', description: 'Automatically match students to internships using AI.', type: 'toggle', value: true, category: 'Platform' },

  // Data
  { key: 'audit_retention', label: 'Audit Log Retention', description: 'How long to keep audit log entries.', type: 'select', value: '1 year', options: ['3 months', '6 months', '1 year', 'Forever'], category: 'Data' },
  { key: 'data_export', label: 'Allow Data Export', description: 'Let advisors export student reports as CSV/PDF.', type: 'toggle', value: true, category: 'Data' },
];

const CATEGORY_ICONS: Record<string, typeof Settings> = {
  Security: Shield,
  Notifications: Bell,
  Platform: Globe,
  Data: Database,
};

const CATEGORY_COLORS: Record<string, string> = {
  Security: 'text-rose-500 bg-rose-50',
  Notifications: 'text-amber-500 bg-amber-50',
  Platform: 'text-[#19A7CE] bg-[#19A7CE]/10',
  Data: 'text-violet-500 bg-violet-50',
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load from localStorage or use defaults
    const stored = localStorage.getItem('admin_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge stored values into defaults
        const merged = DEFAULT_SETTINGS.map(s => ({
          ...s,
          value: parsed[s.key] !== undefined ? parsed[s.key] : s.value,
        }));
        setSettings(merged);
      } catch {
        setSettings([...DEFAULT_SETTINGS]);
      }
    } else {
      setSettings([...DEFAULT_SETTINGS]);
    }
  }, []);

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Persist to localStorage (in production this would be an API call)
      const settingsMap: Record<string, any> = {};
      settings.forEach(s => { settingsMap[s.key] = s.value; });
      localStorage.setItem('admin_settings', JSON.stringify(settingsMap));
      
      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHasChanges(false);
      notify.success('Settings saved successfully.');
    } catch {
      notify.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const categories = Array.from(new Set(settings.map(s => s.category)));

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#146C94]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-outfit text-[#146C94]">System Settings</h1>
            <p className="text-sm text-slate-400">Configure platform behavior, security, and notifications.</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          isLoading={isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 transition-all ${
            hasChanges
              ? 'bg-[#146C94] hover:bg-[#19A7CE] text-white'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save size={16} /> Save Changes
        </Button>
      </div>

      {/* Unsaved banner */}
      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-3 text-sm font-medium flex items-center gap-2 animate-fade-in">
          <Palette size={16} />
          You have unsaved changes. Click "Save Changes" to apply.
        </div>
      )}

      {/* Settings by Category */}
      {categories.map(category => {
        const Icon = CATEGORY_ICONS[category] || Settings;
        const colorClass = CATEGORY_COLORS[category] || 'text-slate-500 bg-slate-50';
        const categorySettings = settings.filter(s => s.category === category);

        return (
          <Card key={category} className="p-0 overflow-hidden">
            {/* Category Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center`}>
                <Icon size={16} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#146C94] font-outfit">{category}</h3>
                <p className="text-[11px] text-slate-400">{categorySettings.length} settings</p>
              </div>
            </div>

            {/* Settings List */}
            <div className="divide-y divide-slate-100">
              {categorySettings.map(setting => (
                <div key={setting.key} className="px-6 py-4 flex items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{setting.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{setting.description}</p>
                  </div>

                  {/* Control */}
                  <div className="shrink-0">
                    {setting.type === 'toggle' && (
                      <button
                        onClick={() => updateSetting(setting.key, !setting.value)}
                        className="focus:outline-none"
                        aria-label={`Toggle ${setting.label}`}
                      >
                        {setting.value ? (
                          <div className="flex items-center gap-1.5">
                            <ToggleRight size={32} className="text-emerald-500" />
                            <span className="text-xs font-semibold text-emerald-600">On</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <ToggleLeft size={32} className="text-slate-300" />
                            <span className="text-xs font-semibold text-slate-400">Off</span>
                          </div>
                        )}
                      </button>
                    )}

                    {setting.type === 'select' && (
                      <select
                        value={setting.value}
                        onChange={e => updateSetting(setting.key, e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:border-[#19A7CE] focus:ring-1 focus:ring-[#19A7CE]/20"
                      >
                        {setting.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {setting.type === 'text' && (
                      <input
                        type="text"
                        value={setting.value}
                        onChange={e => updateSetting(setting.key, e.target.value)}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 w-48 focus:outline-none focus:border-[#19A7CE] focus:ring-1 focus:ring-[#19A7CE]/20"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {/* Save confirmation footer */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            className="bg-[#146C94] hover:bg-[#19A7CE] text-white flex items-center gap-2 px-6 py-2.5"
          >
            <Check size={16} /> Apply Settings
          </Button>
        </div>
      )}
    </div>
  );
}
