import React, { createContext, useContext, useState } from 'react';

type Language = 'English (US)' | 'Hindi (हिन्दी)' | 'Tamil (தமிழ்)' | 'Telugu (తెలుగు)';

interface LanguageContextType {
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<string, string>> = {
  'Hindi (हिन्दी)': { 
    'Dashboard': 'डैशबोर्ड', 
    'Complaints': 'शिकायतें', 
    'AI Analytics': 'एआई एनालिटिक्स', 
    'Users': 'उपयोगकर्ता', 
    'System Alerts': 'सिस्टम अलर्ट', 
    'Select Region': 'क्षेत्र चुनें',
    'Welcome': 'स्वागत है',
    'Total Filed': 'कुल दर्ज',
    'Pending Review': 'समीक्षा लंबित',
    'In Progress': 'प्रगति पर',
    'Resolved': 'समाधान हो गया',
    'Track Complaint': 'शिकायत ट्रैक करें',
    'My History': 'मेरा इतिहास',
    'Alerts': 'अलर्ट',
    'Recent Activity': 'हाल की गतिविधि',
    'View All': 'सभी देखें',
    'File Complaint': 'शिकायत दर्ज करें',
    'Your unified civic grievance command center.': 'आपका एकीकृत नागरिक शिकायत कमांड सेंटर।'
  },
  'Tamil (தமிழ்)': { 
    'Dashboard': 'முகப்பு', 
    'Complaints': 'புகார்கள்', 
    'AI Analytics': 'செயற்கை நுண்ணறிவு', 
    'Users': 'பயனர்கள்', 
    'System Alerts': 'கணினி எச்சரிக்கைகள்', 
    'Select Region': 'பகுதியை தேர்வு செய்யவும்',
    'Welcome': 'வரவேற்கிறோம்',
    'Total Filed': 'மொத்த புகார்கள்',
    'Pending Review': 'நிலுவையில் உள்ளது',
    'In Progress': 'செயல்பாட்டில் உள்ளது',
    'Resolved': 'தீர்க்கப்பட்டது',
    'Track Complaint': 'புகாரை கண்காணிக்க',
    'My History': 'எனது வரலாறு',
    'Alerts': 'எச்சரிக்கைகள்',
    'Recent Activity': 'சமீபத்திய செயல்பாடு',
    'View All': 'அனைத்தையும் காண்',
    'File Complaint': 'புகார் அளிக்க',
    'Your unified civic grievance command center.': 'உங்கள் ஒருங்கிணைந்த குடிமக்கள் குறை தீர்க்கும் கட்டளை மையம்.'
  },
  'Telugu (తెలుగు)': { 
    'Dashboard': 'డాష్‌బోర్డ్', 
    'Complaints': 'ఫిర్యాదులు', 
    'AI Analytics': 'AI విశ్లేషణ', 
    'Users': 'వినియోగదారులు', 
    'System Alerts': 'సిస్టమ్ హెచ్చరికలు', 
    'Select Region': 'ప్రాంతాన్ని ఎంచుకోండి',
    'Welcome': 'స్వాగతం',
    'Total Filed': 'మొత్తం దాఖలు చేయబడినవి',
    'Pending Review': 'పెండింగ్‌లో ఉంది',
    'In Progress': 'పురోగతిలో ఉంది',
    'Resolved': 'పరిష్కరించబడింది',
    'Track Complaint': 'ఫిర్యాదు ట్రాక్ చేయండి',
    'My History': 'నా చరిత్ర',
    'Alerts': 'హెచ్చరికలు',
    'Recent Activity': 'ఇటీవలి కార్యాచరణ',
    'View All': 'అన్నింటినీ చూడండి',
    'File Complaint': 'ఫిర్యాదు చేయండి',
    'Your unified civic grievance command center.': 'మీ ఏకీకృత పౌర ఫిర్యాదుల కమాండ్ సెంటర్.'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<Language>('English (US)');

  const t = (key: string) => {
    return translations[currentLang]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setCurrentLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
