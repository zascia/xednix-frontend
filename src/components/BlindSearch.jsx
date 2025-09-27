// src/components/BlindSearch.jsx

import React, { useState } from 'react';

const BlindSearch = ({ setProfileMode, accessToken }) => {
    // Состояния для минимального профиля
    const [role, setRole] = useState('');
    const [level, setLevel] = useState('начальный');
    const [location, setLocation] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        // ВАЛИДАЦИЯ (минимальная)
        if (!role || !location) {
            alert("Пожалуйста, укажите роль и локацию.");
            return;
        }

        // 1. В реальном приложении: Отправка данных на /api/profile/blind
        console.log(`Профиль "Слепой поиск" сохранен: Роль: ${role}, Уровень: ${level}, Локация: ${location}`);

        // 2. Успех: Переключаем главный Дашборд в режим поиска
        setProfileMode('SEARCH');
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

                <button type="submit" style={{ padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none' }}>
                    Начать поиск
                </button>
            </form>

            <button onClick={() => setProfileMode('CHOICE')} style={{ marginTop: '20px', background: 'none', border: 'none', color: '#666' }}>
                &larr; Назад к выбору
            </button>
        </div>
    );
};

export default BlindSearch;