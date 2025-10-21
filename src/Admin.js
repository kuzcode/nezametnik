
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

const Admin = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pass, setPass] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const targetString = 'nezametnik123';

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClick = () => {
    if (inputValue === targetString) {
      setPass(true);
    }
  };

  // загрузка документов с учетом offset
  const fetchDocuments = async (newOffset = 0) => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.limit(PAGE_SIZE),
        Query.orderDesc('$createdAt'),
        Query.offset(newOffset)
      ]);

      if (newOffset === 0) {
        setDocuments(response.documents);
      } else {
        setDocuments(prev => [...prev, ...response.documents]);
      }
      setOffset(newOffset + response.documents.length);
      setHasMore(response.documents.length === PAGE_SIZE);
    } catch (error) {
      console.error('Ошибка получения документов', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(0);
  }, []);

  // при выборе поста — загружаем его данные в форму
  const onSelectDoc = (doc) => {
    setSelectedDoc(doc);
    setTitle(doc.title || '');
    setCaption(doc.caption || '');
    setIsCreatingNew(false);
  };

  // очистка формы для создания нового поста
  const onCreateNew = () => {
    setSelectedDoc(null);
    setTitle('');
    setCaption('');
    setIsCreatingNew(true);
  };

  // удаление документа
  const onDelete = async () => {
    if (!selectedDoc) return;
    const confirmed = window.confirm('Точно удалить?');
    if (!confirmed) return;

    try {
      await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, selectedDoc.$id);
      setDocuments(prev => prev.filter(doc => doc.$id !== selectedDoc.$id));
      setSelectedDoc(null);
      setTitle('');
      setCaption('');
      alert('Документ удалён');
    } catch (error) {
      console.error('Ошибка при удалении', error);
      alert('Ошибка при удалении документа');
    }
  };

  // обновление документа
  const onSave = async () => {
    if (isCreatingNew) {
      // создание нового документа
      if (!title.trim()) {
        alert('Название не может быть пустым');
        return;
      }
      try {
        const createdDoc = await databases.createDocument(
          DATABASE_ID,
          COLLECTION_ID,
          'unique()', // уникальный id от Appwrite
          {
            title,
            caption,
          }
        );
        setDocuments(prev => [createdDoc, ...prev]);
        setSelectedDoc(createdDoc);
        setIsCreatingNew(false);
        alert('Документ создан');
      } catch (error) {
        console.error('Ошибка при создании', error);
        alert('Ошибка при создании документа');
      }
    } else {
      // обновление существующего
      if (!selectedDoc) return;

      try {
        const updatedDoc = await databases.updateDocument(
          DATABASE_ID,
          COLLECTION_ID,
          selectedDoc.$id,
          {
            title,
            caption,
          }
        );

        setDocuments(prev =>
          prev.map(doc => (doc.$id === selectedDoc.$id ? updatedDoc : doc))
        );
        setSelectedDoc(updatedDoc);
        alert('Документ обновлён');
      } catch (error) {
        console.error('Ошибка при обновлении', error);
        alert('Ошибка при сохранении документа');
      }
    }
  };


  if (pass === true) {
    return (
      <main className="container" style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
        {!selectedDoc && !isCreatingNew && (
          <>
            <h1>Посты</h1>
            <button onClick={onCreateNew} style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}>
              Создать новый пост
            </button>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {documents.map(doc => (
                <li
                  key={doc.$id}
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid #ccc',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectDoc(doc)}
                >
                  {doc.title || '(Без названия)'}
                </li>
              ))}
            </ul>
            {hasMore && (
              <button onClick={() => fetchDocuments(offset)} disabled={loading} style={{ marginTop: '1rem' }}>
                {loading ? 'Загрузка...' : 'Показать ещё'}
              </button>
            )}
          </>
        )}

        {(selectedDoc || isCreatingNew) && (
          <>
            <h2>{isCreatingNew ? 'Создание нового поста' : 'Редактирование поста'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label>
                Название:
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </label>
              <label>
                Содержание:
                <textarea
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  rows={7}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </label>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              {!isCreatingNew && (
                <button onClick={onDelete} style={{ backgroundColor: '#e74c3c', color: '#fff', padding: '0.5rem 1rem' }}>
                  Удалить
                </button>
              )}
              <button onClick={onSave} style={{ backgroundColor: '#2ecc71', color: '#fff', padding: '0.5rem 1rem' }}>
                {isCreatingNew ? 'Создать' : 'Сохранить'}
              </button>
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  setIsCreatingNew(false);
                  setTitle('');
                  setCaption('');
                }}
                style={{ padding: '0.5rem 1rem' }}
              >
                Назад
              </button>
            </div>
          </>
        )}
      </main>
    );
  }
  else {
    return (
      <main className='container'>
        <h1 className='title'>Админ-панель</h1>
        <h2>Введите пароль</h2>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Введите пароль"
        />
        <button onClick={handleClick}>Проверить</button>
      </main>
    )
  }
};

export default Admin;
