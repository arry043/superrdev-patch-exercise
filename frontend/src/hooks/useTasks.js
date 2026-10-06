import { useState, useEffect, useRef } from 'react';
import { fetchTasks } from '../api';

export function useTasks(query, status, page, pageSize) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // Clear any pending debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    let cancelled = false;

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setError(null);

      fetchTasks({ query, status, page, pageSize })
        .then((data) => {
          if (!cancelled) {
            setTasks(data.items);
            setTotal(data.total);
            setLoading(false);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err.message);
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      cancelled = true;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, status, page, pageSize]);

  return { tasks, total, loading, error };
}
