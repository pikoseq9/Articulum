import { useState, useMemo, useEffect } from 'react';

export const usePagination = <T>(items: T[], itemsPerPage: number = 4) => {
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [items]);

    const totalPages = useMemo(() => {
        if (items.length === 0) return 0;
        return Math.ceil(items.length / itemsPerPage);
    }, [items.length, itemsPerPage]);

    const currentItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
    }, [items, currentPage, itemsPerPage]);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return {
        currentPage,
        totalPages,
        currentItems,
        goToPage,
        setCurrentPage
    };
};