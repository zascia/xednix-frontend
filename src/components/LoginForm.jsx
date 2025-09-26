import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ onLoginSuccess }) => { // onLoginSuccess - новая функция
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(''); // Очистить предыдущие сообщения

        try {
            const response = await axios.post('http://127.0.0.1:5000/login', {
                username_or_email: usernameOrEmail,
                password: password,
            });

            // Успешный вход: вызываем функцию, переданную от родителя
            if (response.data.access_token) {
                onLoginSuccess(response.data.access_token);
            }
            setMessage(response.data.message || 'Login successful!');

        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Login failed: Network error';
            setMessage(errorMsg);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '300px', margin: 'auto', border: '1px solid #ccc' }}>
            <h2>Авторизация</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Имя пользователя или Email"
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Пароль"
                />
                <button type="submit">Войти</button>
            </form>
            {message && <p style={{ color: message.includes('successful') ? 'green' : 'red' }}>{message}</p>}
        </div>
    );
};

export default LoginForm;