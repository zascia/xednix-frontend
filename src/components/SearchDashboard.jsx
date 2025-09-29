import React from 'react';

const SearchDashboard = ({
                             resources,
                             selectedResources,
                             searchTerm,
                             setSearchTerm,
                             searchResults,
                             isLoading,
                             userProfile,
                             handleSearch,
                             handleResourceToggle,
                             handleProfileReset // Функция сброса
                         }) => {

    // Определяем, есть ли данные профиля для визуализации
    const showProfileInfo = userProfile && userProfile.target_role;

    return (
        <div style={{ margin: '40px 0', borderTop: '1px solid #ccc', paddingTop: '20px' }}>

            {/* Кнопка сброса профиля (Опция сброса и возврата к трем опциям) */}
            <button
                onClick={handleProfileReset}
                style={{ marginBottom: '20px', padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.9em' }}
            >
                Сбросить настройки профиля
            </button>

            <h2>Поиск Вакансий</h2>

            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>

                {/* Поле ввода (searchTerm) */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Введите запрос (например, Python, PM, QA)"
                    style={{ padding: '10px', width: '300px' }}
                />

                {/* Визуализация сохраненного Профиля */}
                {showProfileInfo && (
                    <div style={{
                        marginTop: '-10px',
                        padding: '10px 20px',
                        backgroundColor: '#e6f7ff',
                        borderRadius: '5px',
                        border: '1px solid #91d5ff',
                        display: 'flex',
                        gap: '20px',
                        fontSize: '0.9em'
                    }}>
                        <p style={{ margin: 0 }}>
                            **Роль:** {userProfile.target_role}
                        </p>
                        <p style={{ margin: 0 }}>
                            **Уровень:** {userProfile.target_level}
                        </p>
                        <p style={{ margin: 0 }}>
                            **Локация:** {userProfile.location || 'Не указана'}
                        </p>
                    </div>
                )}

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

                {searchResults.length === 0 && !isLoading && <p>Введите запрос и нажмите "Найти".</p>}

                {searchResults.map((job, index) => (
                    <div key={job.id || index} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
                        {job.error ? (
                            <p style={{ color: 'red' }}>Ошибка: {job.error}</p>
                        ) : (
                            <>
                                <h4><a href={job.link} target="_blank" rel="noopener noreferrer">{job.title}</a></h4>
                                <p style={{ margin: '5px 0', fontWeight: 'bold', color: job.relevance_score > 70 ? 'green' : (job.relevance_score > 30 ? 'orange' : 'red') }}>
                                    🔥 Релевантность: {job.relevance_score || '0'}%
                                </p>
                                <p><strong>Компания:</strong> {job.company}</p>
                                <p><strong>Локация:</strong> {job.location} | <strong>ЗП:</strong> {job.salary}</p>
                                <p style={{ fontSize: '0.9em', color: '#666' }}>Источник: {job.source}</p>
                            </>
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
};

export default SearchDashboard;