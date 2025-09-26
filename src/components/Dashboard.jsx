// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ accessToken, onLogout }) => {
    const [dashboardData, setDashboardData] = useState('Загрузка данных...');

    useEffect(() => {
        // Используем AbortController для отмены запроса, если компонент размонтируется
        const controller = new AbortController();
        const signal = controller.signal;

        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/dashboard', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    signal: signal, // Передаем сигнал для отмены запроса
                });
                setDashboardData(response.data.message);
            } catch (error) {
                // Игнорируем ошибку, если запрос был отменен
                if (axios.isCancel(error) || error.name === 'AbortError') {
                    console.log('Request aborted');
                    return;
                }

                setDashboardData('Ошибка доступа. Ваш токен недействителен.');
                console.error(error);
                if (error.response && error.response.status === 401) {
                    onLogout();
                }
            }
        };

        fetchDashboardData();

        // Функция очистки: вызывается перед повторным вызовом useEffect
        // или перед размонтированием компонента (когда Strict Mode его "тестирует").
        return () => {
            controller.abort();
        };

    }, [accessToken, onLogout]); // Зависимости ( accessToken, onLogout ) должны быть

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