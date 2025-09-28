// src/components/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ProfileSetupWizard from './ProfileSetupWizard';
import SearchDashboard from './SearchDashboard';

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
                const profileResponse = await axios.get('http://127.0.0.1:5000/api/profile', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    signal: signal
                });

                const profileData = profileResponse.data;

                // 🔑 КЛЮЧЕВАЯ ЛОГИКА: Проверяем, есть ли настроенная роль
                if (profileData.target_role) {
                    // Если роль найдена (после Слепого поиска), устанавливаем режим SEARCH
                    setUserProfile(profileData);
                    setProfileMode('SEARCH');
                    // Устанавливаем роль в поле ввода поиска
                    if (profileData.target_role) {
                        setSearchTerm(profileData.target_role);
                    }

                } else {
                    // Профиль существует, но настройка не завершена
                    setProfileMode('CHOICE');
                }

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

        // Определяем финальный поисковый запрос
        let finalSearchTerm = searchTerm.trim();

        // 1. Используем сохраненную роль, если поле ввода пустое
        if (!finalSearchTerm && userProfile && userProfile.target_role) {
            finalSearchTerm = userProfile.target_role;
        }

        if (!finalSearchTerm || selectedResources.length === 0) {
            alert("Введите запрос или настройте профиль.");
            return;
        }

        // 2. Управление загрузкой: начало
        setIsLoading(true);
        setSearchResults([]);

        try {
            // 4. Выполнение POST-запроса на защищенный маршрут
            const response = await axios.post('http://127.0.0.1:5000/api/search', {
                searchTerm: finalSearchTerm,
                resourceIds: selectedResources,
                // 2. ОТПРАВЛЯЕМ ЛОКАЦИЮ И УРОВЕНЬ НА БЭКЕНД для точного поиска
                location: userProfile?.location || null,
                level: userProfile?.target_level || null

            },{
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

    // --- ФУНКЦИЯ СБРОСА ПРОФИЛЯ (Решает проблему возврата из SEARCH) ---
    const handleProfileReset = () => {
        // 1. Сброс состояния на фронтенде
        setProfileMode('CHOICE');
        setUserProfile(null);
        setSearchTerm('');
        setSearchResults([]);

        // 2. В будущем: здесь можно добавить запрос к API для удаления данных из DB.
        console.log("Profile reset locally. User is back to choice selection.");
    };

    // передается в дочерние компоненты для обновления ими профиля на главном Дашборде
    const handleProfileUpdate = (profileData) => {
        // 1. Обновляем состояние userProfile
        setUserProfile(profileData);
        // 2. Инициализируем поле поиска
        if (profileData.target_role) {
            setSearchTerm(profileData.target_role);
        }
    };

    // Определяем, находится ли пользователь на этапе настройки профиля
    const isSetupMode = profileMode !== 'SEARCH';

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Панель управления Xednix</h1>
            <p style={{ fontSize: '1.2em', color: 'darkgreen' }}>{dashboardData}</p>

            <button
                onClick={onLogout}
                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
            >
                Выход
            </button>

            {/* ГЛАВНОЕ УСЛОВИЕ: НАСТРОЙКА ПРОФИЛЯ ИЛИ РЕЖИМ ПОИСКА */}
            {isSetupMode ? (
                // 1. Если идет настройка профиля, показываем Визард
                <ProfileSetupWizard
                    profileMode={profileMode}
                    setProfileMode={setProfileMode}
                    accessToken={accessToken}
                    onProfileUpdate={handleProfileUpdate}
                />
            ) : (
                // 2. Если профиль настроен (profileMode === 'SEARCH'), показываем НОВЫЙ КОМПОНЕНТ
                <SearchDashboard
                    resources={resources}
                    selectedResources={selectedResources}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    searchResults={searchResults}
                    isLoading={isLoading}
                    userProfile={userProfile}
                    handleSearch={handleSearch}
                    handleResourceToggle={handleResourceToggle}
                    handleProfileReset={handleProfileReset} // Передаем функцию сброса
                />
            )}
        </div>
    );
};

export default Dashboard;