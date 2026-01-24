import { useState, useEffect, useMemo } from 'react';
import api from '../axios';
import { UserBook, BookStatus, Book } from '../utils/types';
import { useAuth } from '../authContext';

/**
 * Calculates the current reading streak based on book activity dates.
 * A streak is defined as consecutive days where books were added or modified.
 * Checks if the streak is active (today or yesterday).
 * * @param books - Array of user's books.
 * @returns The number of consecutive days in the streak.
 */
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

    // Reset streak if the last activity was before yesterday
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        if (uniqueDates[i] - uniqueDates[i + 1] === oneDay) streak++;
        else break;
    }
    return streak;
};

/**
 * Custom hook to manage the user's book library.
 * Handles fetching, updating, adding books, and calculating reading statistics.
 * * @returns An object containing the book list, loading state, statistics, filtered lists, and action methods.
 */
export const useBooks = () => {
    const { user } = useAuth();
    const [books, setBooks] = useState<UserBook[]>([]);
    const [loading, setLoading] = useState(true);

    const currentYear = new Date().getFullYear();
    const userGoal = user?.myGoal || 10;

    /**
     * Fetches all books associated with the current user from the API.
     */
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

    /**
     * Updates the status of a specific book (e.g., "To Read" -> "Reading").
     * * @remarks
     * If the book is moved to "Read" status, the `addedAt` date is updated to the current time
     * to ensure it counts towards the current year's statistics.
     * * @param book - The book object to update.
     * @param newStatus - The new BookStatus to assign.
     */
    const moveBook = async (book: UserBook, newStatus: BookStatus) => {
        try {
            let newDate = book.addedAt;
            if (newStatus === BookStatus.Read && book.status !== BookStatus.Read) {
                newDate = new Date().toISOString();
            }

            // Logika stron:
            // Read -> Max stron
            // ToRead -> 0 stron (Reset)
            // Reading -> Bez zmian (lub zachowaj obecny)
            let newPage = book.currentPage;
            if (newStatus === BookStatus.Read) newPage = book.pages || 0;
            if (newStatus === BookStatus.ToRead) newPage = 0; // <--- DODAJ TO, jeśli chcesz resetować

            const updatedBook = { 
                ...book, 
                status: newStatus,
                currentPage: newPage, // Użyj nowej zmiennej
                addedAt: newDate
            };

            await api.put(`/api/Books/${book.id}`, updatedBook);
            await fetchBooks();
        } catch (err) {
            console.error("Błąd zmiany statusu:", err);
            alert("Nie udało się zmienić statusu.");
        }
    };

    /**
     * Adds a new book to the user's library.
     * * @param bookFromSearch - The simplified book object returned from external search (OpenLibrary).
     * @param status - The initial status for the new book.
     */
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

    /**
     * Memoized list of books that have been completed (`BookStatus.Read`)
     * specifically within the current calendar year.
     * Used as the source of truth for stats and the read list display.
     */
    const readBooksThisYear = useMemo(() => {
        return books.filter(b => 
            b.status === BookStatus.Read && 
            new Date(b.addedAt).getFullYear() === currentYear
        );
    }, [books, currentYear]);

    /**
     * Calculated statistics for the user's dashboard.
     * Includes read count (this year), pages read (this year), streak, and goal progress.
     */
    const stats = useMemo(() => {
        const readingBooks = books.filter(b => b.status === BookStatus.Reading);
        const pagesRead = readBooksThisYear.reduce((acc, curr) => acc + (curr.pages || 0), 0);
        
        return {
            readCount: readBooksThisYear.length,
            readingCount: readingBooks.length,
            pagesRead,
            streak: calculateStreak(books),
            progressPercent: Math.min(100, Math.round((readBooksThisYear.length / userGoal) * 100)),
            goal: userGoal
        };
    }, [books, readBooksThisYear, userGoal]);

    /**
     * Memoized list of read books for display, sorted by date (newest first).
     * Filtered to only show books from the current year.
     */
    const readList = useMemo(() => 
        [...readBooksThisYear].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()), 
    [readBooksThisYear]);

    /**
     * Memoized list of books currently being read, sorted by date (newest first).
     */
    const readingList = useMemo(() => 
        books.filter(b => b.status === BookStatus.Reading)
             .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()), 
    [books]);

    /**
     * Filters the "To Read" list based on a search string.
     * * @param filter - The search string to match against title or author.
     * @returns Array of filtered UserBooks.
     */
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