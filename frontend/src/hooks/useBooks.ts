import { useState, useEffect, useMemo } from 'react';
import api from '../axios';
import { UserBook, BookStatus, Book } from '../utils/types';
import { useAuth } from '../authContext';

const calculateStreak = (books: UserBook[]): number => {
    const dates = books
        .map(b => new Date(b.addedAt).toDateString())
        .map(d => new Date(d).getTime())
        .sort((a, b) => b - a);

    const uniqueDates = Array.from(new Set(dates));
    if (uniqueDates.length === 0) return 0;

    const oneDay = 24 * 60 * 60 * 1000;
    const today = new Date(new Date().toDateString()).getTime();
    const yesterday = today - oneDay;

    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        if (uniqueDates[i] - uniqueDates[i + 1] === oneDay) streak++;
        else break;
    }
    return streak;
};

export const useBooks = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState<UserBook[]>([]);
    const [loading, setLoading] = useState(true);

    const userGoal = user?.myGoal || 10;

    const fetchBooks = async () => {
        try {
            const res = await api.get<UserBook[]>('/api/Books');
            setBooks(res.data);
        } catch (err) {
            console.error("Błąd pobierania danych:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchBooks();
    }, [user]);

    const moveBook = async (book: UserBook, newStatus: BookStatus) => {
        try {
            const updatedBook = { 
                ...book, 
                status: newStatus,
                currentPage: newStatus === BookStatus.Read ? (book.pages || 0) : book.currentPage
            };

            await api.put(`/api/Books/${book.id}`, updatedBook);
            await fetchBooks();
        } catch (err) {
            console.error("Błąd zmiany statusu:", err);
            alert("Nie udało się zmienić statusu.");
        }
    };

    const addBook = async (bookFromSearch: Book, status: BookStatus) => {
        try {
            const newBook: Partial<UserBook> = {
                title: bookFromSearch.title,
                author: bookFromSearch.author,
                imageUrl: bookFromSearch.cover,
                isbn: bookFromSearch.isbn || "BRAK-ISBN",
                status: status,
                addedAt: new Date().toISOString(),
                pages: bookFromSearch.pages || 0,
                description: ""
            };
            await api.post('/api/Books', newBook);
            await fetchBooks();
        } catch (err) {
            console.error("Błąd dodawania:", err);
            alert("Błąd API.");
        }
    };

    const stats = useMemo(() => {
        const readBooks = books.filter(b => b.status === BookStatus.Read);
        const readingBooks = books.filter(b => b.status === BookStatus.Reading);
        const pagesRead = readBooks.reduce((acc, curr) => acc + (curr.pages || 0), 0);
        
        return {
            readCount: readBooks.length,
            readingCount: readingBooks.length,
            pagesRead,
            streak: calculateStreak(books),
            progressPercent: Math.min(100, Math.round((readBooks.length / userGoal) * 100)),
            goal: userGoal
        };
    }, [books, userGoal]);

    const readingList = useMemo(() => 
        books.filter(b => b.status === BookStatus.Reading)
             .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()), 
    [books]);

    const readList = useMemo(() => 
        books.filter(b => b.status === BookStatus.Read)
             .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()), 
    [books]);

    const getToReadList = (filter: string) => {
        return books
            .filter(b => b.status === BookStatus.ToRead)
            .filter(b => 
                b.title.toLowerCase().includes(filter.toLowerCase()) || 
                b.author.toLowerCase().includes(filter.toLowerCase())
            );
    };

    return { 
        books, 
        loading, 
        stats, 
        readingList, 
        readList, 
        getToReadList, 
        moveBook, 
        addBook 
    };
};