// src/App.jsx

import React, { useState, useEffect } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
    // Состояние для переключения между регистрацией и авторизацией
    const [isRegisterMode, setIsRegisterMode] = useState(false);

    // Состояние для хранения токена доступа
    // В реальном приложении лучше использовать localStorage
    const [accessToken, setAccessToken] = useState(null);

    // Функция, вызываемая после успешного логина
    const handleLoginSuccess = (token) => {
        // Сохраняем токен в состоянии (и, возможно, в localStorage)
        setAccessToken(token);
        // Временно сохраним в localStorage для простоты
        localStorage.setItem('access_token', token);
    };

    // Проверка токена при загрузке (имитация сохранения сессии)
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            setAccessToken(token);
        }
    }, []);

    const handleLogout = () => {
        setAccessToken(null);
        localStorage.removeItem('access_token');
    };

    // Если пользователь авторизован, показываем Дашборд
    if (accessToken) {
        return <Dashboard accessToken={accessToken} onLogout={handleLogout} />;
    }

    // Если пользователь НЕ авторизован, показываем форму
    return (
        <div className="App-container" style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Добро пожаловать в Xednix</h1>

            {/* Кнопки переключения */}
            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setIsRegisterMode(true)} disabled={isRegisterMode}>
                    Регистрация
                </button>
                <button onClick={() => setIsRegisterMode(false)} disabled={!isRegisterMode}>
                    Войти
                </button>
            </div>

            {/* Отображение формы */}
            {isRegisterMode ? (
                <RegisterForm />
            ) : (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
            )}
        </div>
    );
}

export default App;