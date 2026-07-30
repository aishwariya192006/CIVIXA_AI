import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Bell, Palette, Globe, Shield, LogOut, ArrowRight } from 'lucide-react';

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState('Language');
  const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));
  const [selectedLang, setSelectedLang] = React.useState(localStorage.getItem('app_lang') || 'en');
  const [prefs, setPrefs] = React.useState<any>(null);
  const [savingPrefs, setSavingPrefs] = React.useState(false);

  React.useEffect(() => {
    import('../services/api').then(({ default: api }) => {
      api.get('/notifications/preferences')
        .then(res => setPrefs(res.data.data))
        .catch(console.error);
    });
  }, []);

  const handlePrefChange = (key: string, value: boolean) => {
    setPrefs((prev: any) => ({ ...prev, [key]: value }));
  };

  const savePreferences = async () => {
    setSavingPrefs(true);
    try {
      const { default: api } = await import('../services/api');
      await api.put('/notifications/preferences', prefs);
      alert('Preferences saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save preferences');
    }
    setSavingPrefs(false);
  };

  const toggleTheme = (dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLanguageSave = () => {
    localStorage.setItem('app_lang', selectedLang);
    if (selectedLang === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
    } else {
      document.cookie = `googtrans=/en/${selectedLang}; path=/; domain=localhost;`;
      document.cookie = `googtrans=/en/${selectedLang}; path=/;`;
    }
    window.location.reload();
  };

  const tabs = [
    { name: 'Profile', icon: User },
    { name: 'Account & Password', icon: Lock },
    { name: 'Notifications', icon: Bell },
    { name: 'Theme', icon: Palette },
    { name: 'Language', icon: Globe },
    { name: 'Privacy & Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation / Sections (Left Column) */}
        <div className="col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button 
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center justify-between p-3 rounded-xl font-medium transition-colors ${
                activeTab === tab.name 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <span className="flex items-center gap-3"><tab.icon className="w-5 h-5" /> {tab.name}</span>
              {activeTab === tab.name && <ArrowRight className="w-4 h-4" />}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>

        {/* Form Area (Right Column) */}
        <div className="col-span-2 space-y-6">
          
          {activeTab === 'Profile' && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" className="input-field" defaultValue={user?.fullName} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" className="input-field" defaultValue={user?.email} disabled />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <input type="text" className="input-field bg-gray-50" defaultValue={user?.role} disabled />
                </div>
                <button className="btn-primary px-6 py-2 mt-2 text-sm">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'Account & Password' && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input type="password" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input type="password" className="input-field" />
                </div>
                <button className="btn-primary px-6 py-2 mt-2 text-sm bg-gray-900 hover:bg-gray-800">Update Password</button>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Notification Preferences</h3>
              {prefs ? (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900 mt-4 mb-2">Delivery Channels</h4>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" checked={prefs.emailEnabled} onChange={(e) => handlePrefChange('emailEnabled', e.target.checked)} />
                    <span className="text-gray-700">Email Notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" checked={prefs.smsEnabled} onChange={(e) => handlePrefChange('smsEnabled', e.target.checked)} />
                    <span className="text-gray-700">SMS Notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" checked={prefs.pushEnabled} onChange={(e) => handlePrefChange('pushEnabled', e.target.checked)} />
                    <span className="text-gray-700">Browser Push Notifications</span>
                  </label>

                  <h4 className="font-medium text-sm text-gray-900 mt-6 mb-2">Notification Types</h4>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" checked={prefs.complaintUpdates} onChange={(e) => handlePrefChange('complaintUpdates', e.target.checked)} />
                    <span className="text-gray-700">Complaint Status Updates</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" checked={prefs.chatMessages} onChange={(e) => handlePrefChange('chatMessages', e.target.checked)} />
                    <span className="text-gray-700">Chat Messages</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" checked={prefs.systemAlerts} onChange={(e) => handlePrefChange('systemAlerts', e.target.checked)} />
                    <span className="text-gray-700">System Alerts</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" checked={prefs.marketingMessages} onChange={(e) => handlePrefChange('marketingMessages', e.target.checked)} />
                    <span className="text-gray-700">Marketing & Newsletter</span>
                  </label>
                  
                  <button onClick={savePreferences} disabled={savingPrefs} className="btn-primary px-6 py-2 mt-6 text-sm disabled:opacity-50">
                    {savingPrefs ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">Loading preferences...</div>
              )}
            </div>
          )}

          {activeTab === 'Theme' && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Appearance</h3>
              <div className="flex gap-4">
                <div 
                  onClick={() => toggleTheme(false)}
                  className={`border-2 rounded-xl p-4 w-32 text-center cursor-pointer transition-all ${!isDark ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="w-full h-16 bg-white rounded shadow-sm border border-gray-200 mb-2"></div>
                  <span className={`text-sm font-medium ${!isDark ? 'text-primary-700' : 'text-gray-600'}`}>Light Mode</span>
                </div>
                <div 
                  onClick={() => toggleTheme(true)}
                  className={`border-2 rounded-xl p-4 w-32 text-center cursor-pointer transition-all ${isDark ? 'border-primary-500 bg-gray-800' : 'border-gray-200 bg-gray-900 opacity-70'}`}
                >
                  <div className="w-full h-16 bg-gray-900 rounded shadow-sm border border-gray-700 mb-2"></div>
                  <span className={`text-sm font-medium ${isDark ? 'text-primary-400' : 'text-white'}`}>Dark Mode</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Theme settings are applied instantly across the entire application.</p>
            </div>
          )}

          {activeTab === 'Language' && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Language & Region</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Language</label>
                  <select 
                    className="input-field" 
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                  >
                    <option value="en">English (United States)</option>
                    <option value="ta">Tamil (தமிழ்)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                  </select>
                </div>
                <button 
                  onClick={handleLanguageSave}
                  className="btn-primary px-6 py-2 mt-2 text-sm"
                >
                  Save Language
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Privacy & Security' && (
            <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Privacy & Security</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Control how your data is used across the CIVIXA platform.</p>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" defaultChecked />
                  <span className="text-gray-700">Allow AI agents to analyze my complaint data</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-primary-600 rounded" defaultChecked />
                  <span className="text-gray-700">Make my public complaints anonymous</span>
                </label>
                <button className="btn-primary px-6 py-2 mt-4 text-sm bg-red-600 hover:bg-red-700 border-none">Request Data Deletion</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
