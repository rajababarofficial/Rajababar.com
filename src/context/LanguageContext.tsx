import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'sd';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    setLanguage: (lang: Language) => void;
    isSindhi: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('site-language');
        return (saved as Language) || 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('site-language', lang);
        document.documentElement.lang = lang;
        if (lang === 'sd') {
            document.documentElement.dir = 'rtl';
            document.documentElement.classList.add('lang-sindhi');
        } else {
            document.documentElement.dir = 'ltr';
            document.documentElement.classList.remove('lang-sindhi');
        }
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'sd' : 'en');
    };

    useEffect(() => {
        setLanguage(language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, isSindhi: language === 'sd' }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
