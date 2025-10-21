
// Donate.js
import React, { useEffect, useState } from 'react';
import { Client, Query, Databases, ID } from 'appwrite';
import './App.css';
import table from './image.png'

const client = new Client();
client
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // замените на ваш эндпоинт
    .setProject('68f524e1002a9eff8675'); // замените на ваш проект id

const databases = new Databases(client);

const DATABASE_ID = '68f524e9002df68988aa'; // замените
const COLLECTION_ID = 'posts'; // замените

const PAGE_SIZE = 10;

const Main = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [expandedIds, setExpandedIds] = useState(new Set());

    const fetchDocuments = async (newOffset = 0) => {
        setLoading(true);
        try {
            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                Query.limit(PAGE_SIZE),
                Query.orderDesc('$createdAt'),
                Query.offset(offset)
            ]);

            if (newOffset === 0) {
                setDocuments(response.documents);
            } else {
                setDocuments(prev => [...prev, ...response.documents]);
            }
            setOffset(newOffset + response.documents.length);
            setHasMore(response.documents.length === 10);
        } catch (error) {
            console.error('Ошибка получения документов', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments(0);
    }, []);

    function getUserIP() {
        return fetch("https://api.ipify.org?format=json")
            .then((res) => res.json())
            .then((data) => data.ip)
            .catch(() => null);
    }

    const [stats, setStats] = useState([]);
    const [userIp, setUserIp] = useState(null);

    useEffect(() => {
        async function fetchAndCheckIP() {
            const ip = await getUserIP();
            setUserIp(ip);
            if (!ip) {
                setLoading(false);
                return;
            }

            // Получить список документов
            const response = await databases.listDocuments('68f524e9002df68988aa', 'stats');
            const docs = response.documents;

            setStats(docs);

            // Проверить, есть ли IP пользователя в документах
            const ipExists = docs.some((doc) => doc.ip === ip);

            // Если нет, добавить новый документ
            if (!ipExists) {
                await databases.createDocument(
                    '68f524e9002df68988aa',
                    'stats',
                    ID.unique(),
                    { ip }
                );
                // Добавить также в локальный стейт
                setStats((prev) => [...prev, { ip, $createdAt: new Date().toISOString() }]);
            }

            setLoading(false);
        }

        fetchAndCheckIP();
    }, []);

    const now = new Date();

    const countAll = stats.length;

    const countToday = stats.filter((doc) => {
        const createdAt = new Date(doc.$createdAt);
        return (
            createdAt.getDate() === now.getDate() &&
            createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear()
        );
    }).length;

    const days30ago = new Date();
    days30ago.setDate(now.getDate() - 30);

    const countLastMonth = stats.filter(doc => {
        const createdAt = new Date(doc.$createdAt);
        return createdAt >= days30ago && createdAt <= now;
    }).length;

    const toggleExpand = id => {
        setExpandedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };


    function formatDate(createdAtDate) {
        const now = new Date();
        const diffMs = now - createdAtDate;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) {
            return 'только что';
        } else if (diffMin < 60) {
            return `${diffMin} ${declOfNum(diffMin, ['минуту', 'минуты', 'минут'])} назад`;
        } else if (diffHour < 24) {
            return `${diffHour} ${declOfNum(diffHour, ['час', 'часа', 'часов'])} назад`;
        } else if (diffDay < 7) {
            return `${diffDay} ${declOfNum(diffDay, ['день', 'дня', 'дней'])} назад`;
        } else {
            // Формат: число месяц на русском и время
            const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            const day = createdAtDate.getDate();
            const month = months[createdAtDate.getMonth()];
            const hours = createdAtDate.getHours().toString().padStart(2, '0');
            const minutes = createdAtDate.getMinutes().toString().padStart(2, '0');
            return `${day} ${month} в ${hours}:${minutes}`;
        }
    }

    // Функция склонения слов для русского языка
    function declOfNum(number, titles) {
        const cases = [2, 0, 1, 1, 1, 2];
        return titles[(number % 100 > 4 && number % 100 < 20)
            ? 2
            : cases[(number % 10 < 5) ? number % 10 : 5]];
    }

    return (
        <>
            <header className="header">
                <h1>Незаметник</h1>
            </header>

            <main className="container">
                <div className='greeting'>
                    <img src={table} className='table' />
                    <p>
                        Привет, дорогой друг! Этот сайт создан специально для тебя, чтобы ты мог проводить на нём время и получать фейерверк эмоций. Это самый уникальный канал и ты это знаешь, раз читаешь это. Здесь всё по-настоящему, без постановок. Здесь я делюсь своими сокровенными мыслями, планами, воспоминаниями и опытом, разбирать интересные темы. Возможно, сделаю здесь счетчик посещаемости, чтобы все видели, сколько нас, я думаю всем это интересно. В планах добавить платный контент и обратную связь, возможно обсуждения.</p>
                    <p> Не забывайте поддерживать мою деятельность, если вы заходите на сайт, значит, вам интересно, если интересно, то поддержите. На сайте будут рекламные блоки, просто переходите по ним, нажмите на него и посмотрите что там за реклама, я за это получаю деньги. А еще лучше <a href='/donate'>задонать (закинь) копейку на шавуху</a>. И вообще на сайте все безопасно: куда бы ты не нажал, ничего страшного не произойдет.</p>
                </div>

                {documents.map(doc => {
                    const isExpanded = expandedIds.has(doc.$id);
                    const captionTooLong = doc.caption.length > 300;
                    const displayCaption =
                        captionTooLong && !isExpanded
                            ? doc.caption.slice(0, 300) + '...'
                            : doc.caption;

                    const createdAtDate = new Date(doc.$createdAt);

                    return (
                        <article key={doc.$id} className="document-card">
                            <p className="title">{doc.title}</p>
                            <p className="caption">{displayCaption}</p>
                            {captionTooLong && (
                                <button
                                    className="expand-btn"
                                    onClick={() => toggleExpand(doc.$id)}
                                >
                                    {isExpanded ? 'Свернуть ' : 'Развернуть'}
                                </button>
                            )}
                            <time className="created-at" dateTime={doc.$createdAt}>
                                {formatDate(createdAtDate)}
                            </time>
                        </article>
                    );
                })}

                {loading && (
                    <div className="loader">
                        Загрузка...
                    </div>
                )}

                {!loading && hasMore && (
                    <button className="load-more-btn" onClick={() => fetchDocuments(offset)}>
                        Показать еще
                    </button>
                )}

                <div style={{ maxWidth: "300px", paddingLeft: 24, marginTop: 32 }}>
                    <h3>Статистика сайта</h3>
                    <p>За всё время: <b>{countAll}</b></p>
                    <p>За последний месяц: <b>{countLastMonth}</b></p>
                    <p>За сегодня: <b>{countToday}</b></p>
                </div>
            </main>
        </>
    );
};

export default Main;
