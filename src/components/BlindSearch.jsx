// src/components/BlindSearch.jsx

import React, { useState } from 'react';
import axios from 'axios';

const BlindSearch = ({ setProfileMode, accessToken, onProfileUpdate }) => {
    // Состояния для минимального профиля
    const [role, setRole] = useState('');
    const [level, setLevel] = useState('начальный');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ВАЛИДАЦИЯ (минимальная)
        if (!role || !location) {
            alert("Пожалуйста, укажите роль и локацию.");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Отправка данных на новый API-маршрут
            await axios.post('http://127.0.0.1:5000/api/profile/blind',
                {
                    role: role,
                    level: level,
                    location: location
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // 2. УСПЕХ: ВЫПОЛНЯЕМ ЗАПРОС К API /api/profile ЧТОБЫ ПОЛУЧИТЬ ПОСЛЕДНИЕ ДАННЫЕ ПРОФИЛЯ
            const profileResponse = await axios.get('http://127.0.0.1:5000/api/profile', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            // 3. ОБНОВЛЯЕМ ПРОФИЛЬ В РОДИТЕЛЬСКОМ КОМПОНЕНТЕ
            onProfileUpdate(profileResponse.data);

            // 4. Переключаем режим
            setProfileMode('SEARCH');

        } catch (error) {
            console.error('Error saving blind profile:', error.response ? error.response.data : error.message);
            alert("Не удалось сохранить профиль. Проверьте лог сервера.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: 'auto' }}>
            <h2>3. Слепой поиск</h2>
            <p>Укажите минимальные параметры для быстрого начала:</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Роль (например, Project Manager)"
                    style={{ padding: '10px' }}
                />

                <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ padding: '10px' }}>
                    <option value="начальный">Уровень: Начальный</option>
                    <option value="средний">Уровень: Средний</option>
                    <option value="продвинутый">Уровень: Продвинутый</option>
                </select>

                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Локация (Страна, Город, Удалённо)"
                    style={{ padding: '10px' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>

                    {/* 1. Кнопка возврата к выбору режимов */}
                    <button
                        onClick={() => setProfileMode('CHOICE')} // Кнопка устанавливает режим 'CHOICE'
                        disabled={isLoading}
                        type="button" // Важно, чтобы форма не отправлялась по клику на эту кнопку
                        style={{ padding: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', flex: 1, marginRight: '10px' }}
                    >
                        ← Выбрать другой режим
                    </button>

                    {/* 2. Кнопка отправки формы */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ padding: '10px', backgroundColor: isLoading ? '#ccc' : '#3498db', color: 'white', border: 'none', flex: 1 }}
                    >
                        {isLoading ? 'Сохранение...' : 'Начать поиск'}
                    </button>
                </div>
            </form>

            <button onClick={() => setProfileMode('CHOICE')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#666' }}>
                &larr; Назад к выбору
            </button>
        </div>
    );
};

export default BlindSearch;