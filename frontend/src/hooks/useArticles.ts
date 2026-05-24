import { useState, useEffect } from 'react';
import api from '../axios';
import { Article, ArticleCategory } from '../utils/types';

export const useArticles = (endpoint: string) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get<Article[]>(endpoint)
      .then(res => setArticles(res.data))
      .catch(err => {
        console.error("Błąd pobierania artykułów:", err);
        setError('Nie udało się pobrać artykułów z serwera.');
      })
      .finally(() => setLoading(false));
  }, [endpoint]);

  const stats = {
    total: articles.length,
    math: articles.filter(a => a.category === ArticleCategory.Mathematics).length,
    cs: articles.filter(a => a.category === ArticleCategory.ComputerScience).length,
    didactics: articles.filter(a => a.category === ArticleCategory.Didactics).length,
    popSci: articles.filter(a => a.category === ArticleCategory.PopularScience).length,
  };

  return { articles, loading, error, stats };
};