// src/components/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProfileSetupWizard from './ProfileSetupWizard';

const Dashboard = ({ accessToken, onLogout }) => {
    const [dashboardData, setDashboardData] = useState('Загрузка данных...');
    const [resources, setResources] = useState([]);
    const [selectedResources, setSelectedResources] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [profileMode, setProfileMode] = useState('CHOICE');
    const [userProfile, setUserProfile] = useState(null);


    // Используем useCallback для мемоизации функции, если она нужна в зависимостях
    const fetchDashboardData = useCallback(async () => {
        const controller = new AbortController();
        const signal = controller.signal;

        // --- Асинхронная функция загрузки данных ---
        const fetchData = async () => {
            // 1. Загрузка сообщения Дашборда
            try {
                const dashResponse = await axios.get('http://127.0.0.1:5000/dashboard', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    signal: signal
                });
                setDashboardData(dashResponse.data.message);
            } catch (error) {
                if (!axios.isCancel(error) && error.response && error.response.status === 401) {
                    console.error("Token invalid or expired. Logging out.");
                    onLogout();
                }
                // Установим дефолтное сообщение, если запрос не удался
                setDashboardData('Ошибка загрузки данных дашборда.');
            }

            // 2. Загрузка списка Ресурсов (ВТОРОЙ ЗАПРОС)
            try {
                const resResponse = await axios.get('http://127.0.0.1:5000/api/resources', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    signal: signal
                });
                setResources(resResponse.data);
            } catch (error) {
                if (!axios.isCancel(error) && error.response && error.response.status === 401) {
                    console.error("Resource fetch failed. Token invalid. Logging out.");
                    onLogout();
                }
                console.error("Error loading resources:", error);
                // Установим заглушку в случае ошибки
                setResources([{ id: 0, name: 'Ошибка загрузки ресурсов', is_active: false }]);
            }

            // 3. Загрузка Профиля пользователя (ТРЕТИЙ ЗАПРОС)
            try {
                const profileResponse = await axios.get('http://127.0.0.0:5000/api/profile', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    signal: signal
                });

                // Если профиль найден, сохраняем его и сразу переключаем в режим поиска
                setUserProfile(profileResponse.data);
                setProfileMode('SEARCH');

            } catch (error) {
                // Если профиль не найден (404), оставляем режим CHOICE
                if (error.response && error.response.status === 404) {
                    setProfileMode('CHOICE');
                } else if (error.response && error.response.status === 401) {
                    onLogout();
                } else {
                    console.error("Error loading profile:", error);
                    // Если была другая ошибка, также оставляем CHOICE
                    setProfileMode('CHOICE');
                }
            }
        };

        fetchData();

        // Функция очистки для отмены запросов
        return () => {
            controller.abort();
        };
    }, [accessToken, onLogout]); // Зависимости

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleResourceToggle = (resourceId) => {
        setSelectedResources(prev =>
            prev.includes(resourceId)
                ? prev.filter(id => id !== resourceId)
                : [...prev, resourceId]
        );
    };

    // функция отвечает за сбор данных из формы, отправку их на ваш защищенный бэкенд-маршрут /api/search и управление состоянием загрузки
    const handleSearch = async (e) => {
        // 1. Предотвращение стандартного поведения формы
        e.preventDefault();

        // 2. Проверка ввода
        if (!searchTerm.trim() || selectedResources.length === 0) {
            alert("Введите запрос и выберите хотя бы один ресурс.");
            return;
        }

        // 3. Управление загрузкой: начало
        setIsLoading(true);
        setSearchResults([]);

        try {
            // 4. Выполнение POST-запроса на защищенный маршрут
            const response = await axios.post('http://127.0.0.1:5000/api/search', {
                // Тело запроса: данные, которые нужны бэкенду
                searchTerm: searchTerm,
                resourceIds: selectedResources
            }, {
                // Заголовок для авторизации
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            // 5. Успех
            setSearchResults(response.data);
            console.log("Search complete. Results received:", response.data.length);

        } catch (error) {
            // 6. Ошибка
            console.error('Search API Error:', error);
            // Выводим пользователю сообщение об ошибке
            setSearchResults([{ error: 'Не удалось выполнить поиск. Проверьте соединение или лог сервера.' }]);

            // Дополнительная проверка на истекший токен
            if (error.response && error.response.status === 401) {
                onLogout();
            }

        } finally {
            // 7. Управление загрузкой: завершение
            setIsLoading(false);
        }
    };

    // Определяем, находится ли пользователь на этапе настройки профиля
    const isSetupMode = profileMode !== 'SEARCH';

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

            {/* ----------------------------------------------------------------- */}
            {/* ГЛАВНОЕ УСЛОВИЕ: НАСТРОЙКА ПРОФИЛЯ ИЛИ РЕЖИМ ПОИСКА */}
            {/* ----------------------------------------------------------------- */}
            {isSetupMode ? (
                // 1. Если идет настройка профиля, показываем Визард
                <ProfileSetupWizard
                    profileMode={profileMode}
                    setProfileMode={setProfileMode}
                    accessToken={accessToken}
                />
            ) : (
                // 2. Если профиль настроен (profileMode === 'SEARCH'), показываем форму поиска
                <div style={{ margin: '40px 0', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                    <h2>Поиск Вакансий</h2>

                    {/* Форма поиска */}
                    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

                        {/* Поле ввода */}
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Введите запрос (например, Python, PM, QA)"
                            style={{ padding: '10px', width: '300px' }}
                        />

                        {/* Список ресурсов (Чекбоксы) */}
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                            {resources.map(resource => (
                                <label key={resource.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedResources.includes(resource.id)}
                                        onChange={() => handleResourceToggle(resource.id)}
                                    />
                                    {resource.name}
                                </label>
                            ))}
                        </div>

                        {/* Кнопка поиска */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{ padding: '10px 30px', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none' }}
                        >
                            {isLoading ? 'Поиск...' : 'Найти'}
                        </button>
                    </form>

                    {/* Блок для отображения результатов */}
                    <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '800px', margin: '30px auto' }}>
                        <h3>Результаты ({searchResults.length})</h3>

                        {/* Сообщение, если результатов нет */}
                        {searchResults.length === 0 && !isLoading && <p>Введите запрос и нажмите "Найти".</p>}

                        {/* Отображение каждой вакансии */}
                        {searchResults.map((job, index) => (
                            <div key={job.id || index} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>

                                {/* Обработка ошибки */}
                                {job.error ? (
                                    <p style={{ color: 'red' }}>Ошибка: {job.error}</p>
                                ) : (
                                    <>
                                        {/* Ссылка на вакансию */}
                                        <h4><a href={job.link} target="_blank" rel="noopener noreferrer">{job.title}</a></h4>
                                        <p><strong>Компания:</strong> {job.company}</p>
                                        <p><strong>Локация:</strong> {job.location} | <strong>ЗП:</strong> {job.salary}</p>
                                        <p style={{ fontSize: '0.9em', color: '#666' }}>Источник: {job.source}</p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                </div>
            )}
        </div>
    );
};

export default Dashboard;