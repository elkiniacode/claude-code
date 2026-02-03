/**
 * useRating Hook
 * Custom hook para manejar el estado y operaciones del sistema de ratings
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ratingsApi, ApiError } from '@/services/ratingsApi';
import { useAuth } from '@/contexts/AuthContext';
import type { RatingStats, RatingState } from '@/types/rating';

interface UseRatingParams {
  courseId: number;
  initialStats?: RatingStats;
}

interface UseRatingReturn {
  // Estado
  userRating: number | null;
  stats: RatingStats;
  status: RatingState;
  error: string | null;
  hoverRating: number | null;

  // Acciones
  submitRating: (rating: number) => Promise<void>;
  deleteRating: () => Promise<void>;
  setHoverRating: (rating: number | null) => void;
  clearError: () => void;
}

/**
 * Hook useRating
 * Maneja el estado completo del sistema de ratings para un curso
 */
export function useRating({
  courseId,
  initialStats = { average_rating: 0, total_ratings: 0 },
}: UseRatingParams): UseRatingReturn {
  const { user } = useAuth();
  const userId = user?.id;

  // Estado del rating del usuario
  const [userRating, setUserRating] = useState<number | null>(null);

  // Estadísticas del curso
  const [stats, setStats] = useState<RatingStats>(initialStats);

  // Estado de la operación actual
  const [status, setStatus] = useState<RatingState>('idle');

  // Error message
  const [error, setError] = useState<string | null>(null);

  // Rating en hover (para preview)
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  /**
   * Fetch inicial: obtener el rating del usuario si existe
   */
  useEffect(() => {
    const fetchUserRating = async () => {
      if (!userId) return; // User must be logged in

      try {
        const rating = await ratingsApi.getUserRating(courseId, userId);
        if (rating) {
          setUserRating(rating.rating);
        }
      } catch (err) {
        // Si no existe el rating (404), es normal, no es error
        if (err instanceof ApiError && err.status !== 404) {
          console.error('Error fetching user rating:', err);
        }
      }
    };

    fetchUserRating();
  }, [courseId, userId]);

  /**
   * Submit rating: crea o actualiza según si existe
   */
  const submitRating = useCallback(
    async (rating: number) => {
      if (!userId) {
        setError('You must be logged in to rate');
        setStatus('error');
        return;
      }

      // Validar rango
      if (rating < 1 || rating > 5) {
        setError('La calificación debe estar entre 1 y 5');
        setStatus('error');
        return;
      }

      // Guardar estado anterior para rollback
      const previousRating = userRating;
      const previousStats = stats;

      // Update optimista
      setUserRating(rating);
      setStatus('loading');
      setError(null);

      try {
        // Determinar si es creación o actualización
        if (previousRating === null) {
          // Crear nuevo rating
          await ratingsApi.createRating(courseId, {
            user_id: userId,
            rating,
          });
        } else {
          // Actualizar rating existente
          await ratingsApi.updateRating(courseId, userId, {
            user_id: userId,
            rating,
          });
        }

        // Refetch stats para obtener el nuevo promedio
        const newStats = await ratingsApi.getRatingStats(courseId);
        setStats(newStats);

        // Marcar como exitoso
        setStatus('success');

        // Auto-clear success status después de 2 segundos
        setTimeout(() => {
          setStatus('idle');
        }, 2000);
      } catch (err) {
        // Rollback en caso de error
        setUserRating(previousRating);
        setStats(previousStats);

        // Manejar el error
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error al enviar la calificación');
        }

        setStatus('error');
      }
    },
    [courseId, userId, userRating, stats]
  );

  /**
   * Delete rating: elimina la calificación del usuario
   */
  const deleteRating = useCallback(async () => {
    if (!userId) {
      setError('You must be logged in to delete a rating');
      setStatus('error');
      return;
    }

    if (userRating === null) {
      return; // No hay nada que eliminar
    }

    // Guardar estado anterior
    const previousRating = userRating;
    const previousStats = stats;

    // Update optimista
    setUserRating(null);
    setStatus('loading');
    setError(null);

    try {
      await ratingsApi.deleteRating(courseId, userId);

      // Refetch stats
      const newStats = await ratingsApi.getRatingStats(courseId);
      setStats(newStats);

      setStatus('success');

      // Auto-clear success
      setTimeout(() => {
        setStatus('idle');
      }, 2000);
    } catch (err) {
      // Rollback
      setUserRating(previousRating);
      setStats(previousStats);

      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error al eliminar la calificación');
      }

      setStatus('error');
    }
  }, [courseId, userId, userRating, stats]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
    if (status === 'error') {
      setStatus('idle');
    }
  }, [status]);

  return {
    // Estado
    userRating,
    stats,
    status,
    error,
    hoverRating,

    // Acciones
    submitRating,
    deleteRating,
    setHoverRating,
    clearError,
  };
}
