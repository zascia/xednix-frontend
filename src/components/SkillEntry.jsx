// src/components/SkillEntry.jsx

import React, { useState } from 'react';
import axios from 'axios';

// Компонент теперь принимает onProfileUpdate для обновления главного состояния
const SkillEntry = ({ setProfileMode, accessToken, onProfileUpdate }) => {
    const [rawSkills, setRawSkills] = useState('');
    const [rawExcludedSkills, setRawExcludedSkills] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    const parseSkills = (text) => text
        .split(/,|\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const skillsArray = parseSkills(rawSkills);
        const excludedSkillsArray = parseSkills(rawExcludedSkills);

        if (skillsArray.length === 0) {
            setMessage('Пожалуйста, введите хотя бы один включаемый навык.');
            setIsLoading(false);
            return;
        }

        try {
            // 1. Отправка данных на Бэкенд
            await axios.post('http://127.0.0.1:5000/api/profile/skills/full', {
                skills: skillsArray,
                excluded_skills: excludedSkillsArray // Отправка списка исключений
            }, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // 2. Получение обновленного профиля (для синхронизации состояния)
            const profileResponse = await axios.get('http://127.0.0.1:5000/api/profile', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            // 3. Обновление главного состояния и переход в режим поиска
            onProfileUpdate(profileResponse.data); // Обновляет userProfile в Dashboard.jsx
            setProfileMode('SEARCH');

        } catch (error) {
            console.error('Error saving skills:', error.response ? error.response.data : error.message);
            setMessage('Ошибка сохранения. Проверьте консоль.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: 'auto' }}>
            <h2>2. Ввод Навыков (100% Дата Сет)</h2>

            {/* 1. Блок включаемых навыков (основной) */}
            <p style={{ marginTop: '20px', fontWeight: 'bold' }}>Полный список ваших навыков:</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <textarea
                    value={rawSkills}
                    onChange={(e) => setRawSkills(e.target.value)}
                    placeholder="Пример: Python, SQL, React, AWS, Docker"
                    rows="6"
                    style={{ padding: '10px' }}
                    disabled={isLoading}
                />

                {/* 2. Блок ИСКЛЮЧАЕМЫХ навыков (новый) */}
                <p style={{ marginTop: '10px', fontWeight: 'bold' }}>Навыки для ИСКЛЮЧЕНИЯ из поиска (игнорировать):</p>
                <textarea
                    value={rawExcludedSkills}
                    onChange={(e) => setRawExcludedSkills(e.target.value)}
                    placeholder="Пример: C++, Cobol, Pascal (Если вы их знаете, но не хотите, чтобы они влияли на матчинг)."
                    rows="3"
                    style={{ padding: '10px', border: '1px solid #dc3545' }}
                    disabled={isLoading}
                />
                {/* ------------------------------------------- */}

                <button type="submit" disabled={isLoading} style={{ padding: '10px', backgroundColor: isLoading ? '#ccc' : '#28a745', color: 'white', border: 'none' }}>
                    {isLoading ? 'Сохранение...' : 'Сохранить и перейти к поиску'}
                </button>
            </form>
            {message && <p style={{ color: message.includes('Ошибка') ? 'red' : 'green' }}>{message}</p>}

            <button onClick={() => setProfileMode('CHOICE')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#666' }}>
                &larr; Назад к выбору
            </button>
        </div>
    );
};

export default SkillEntry;