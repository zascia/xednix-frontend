import React from 'react';
import BlindSearch from './BlindSearch';
import SkillEntry from './SkillEntry';

// Импортируйте заглушки (их нужно будет перенести сюда)
const UploadProfile = ({ setProfileMode, accessToken }) => <h1>1. Загрузка Резюме (AI)</h1>;

// ------------------------------------

// Главный компонент-переключатель
const ProfileSetupWizard = ({ profileMode, setProfileMode, accessToken, onProfileUpdate }) => {
    switch (profileMode) {
        case 'CHOICE':
            return (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h2>Выберите режим настройки профиля:</h2>
                    <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <button onClick={() => setProfileMode('UPLOAD')}> 1. Загрузка Резюме (AI-анализ)</button>
                        <button onClick={() => setProfileMode('SKILL_ENTRY')}> 2. Ввод Навыков (Детальный профиль)</button>
                        <button onClick={() => setProfileMode('BLIND_SEARCH')}> 3. Слепой Поиск</button>
                    </div>
                    <p style={{ marginTop: '20px', color: '#666' }}>После настройки профиля вы перейдете в режим SEARCH.</p>
                </div>
            );
        case 'UPLOAD':
            return <UploadProfile setProfileMode={setProfileMode} accessToken={accessToken} />;
        case 'SKILL_ENTRY':
            return <SkillEntry
                setProfileMode={setProfileMode}
                accessToken={accessToken}
                onProfileUpdate={onProfileUpdate} // <-- ПЕРЕДАЕМ ФУНКЦИЮ
            />;
        case 'BLIND_SEARCH':
            return <BlindSearch
                setProfileMode={setProfileMode}
                accessToken={accessToken}
                onProfileUpdate={onProfileUpdate}
            />;
        default:
            return <p>Ошибка: Неизвестный режим профилирования.</p>;
    }
};

export default ProfileSetupWizard;