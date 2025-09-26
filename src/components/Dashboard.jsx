// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ accessToken, onLogout }) => {
    const [dashboardData, setDashboardData] = useState('Загрузка данных...');

    useEffect(() => {
        // 1. Отправляем запрос на защищенный маршрут /dashboard
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/dashboard', {
                    headers: {
                        // 2. Отправляем токен в заголовке Authorization: Bearer
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setDashboardData(response.data.message);
            } catch (error) {
                // Если токен недействителен или истек
                setDashboardData('Ошибка доступа. Ваш токен недействителен.');
                console.error(error);
                // Можно сразу вызвать onLogout, если ошибка 401
                if (error.response && error.response.status === 401) {
                    onLogout();
                }
            }
        };

        fetchDashboardData();
    }, [accessToken, onLogout]);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Панель управления Xednix</h1>
            <p style={{ fontSize: '1.2em', color: 'darkgreen' }}>{dashboardData}</p>

            {/* Кнопка выхода */}
            <button
                onClick={onLogout}
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
            >
                Выход
            </button>

            {/* Здесь будет основная логика (поиск вакансий) */}
            <p style={{ marginTop: '30px' }}>Здесь будет интерфейс для поиска и управления вакансиями.</p>
        </div>
    );
};

export default Dashboard;