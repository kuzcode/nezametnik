
// DocumentsPage.js
import React, { useEffect, useState } from 'react';
import { Client, Query, Databases } from 'appwrite';
import './App.css';

const client = new Client();
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1') // замените на ваш эндпоинт
  .setProject('68f524e1002a9eff8675'); // замените на ваш проект id

const databases = new Databases(client);

const DATABASE_ID = '68f524e9002df68988aa'; // замените
const COLLECTION_ID = 'posts'; // замените

const PAGE_SIZE = 10;

const DocumentsPage = () => {
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
                  {isExpanded ? 'Свернуть' : 'Развернуть'}
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
      </main>
    </>
  );
};

export default DocumentsPage;
