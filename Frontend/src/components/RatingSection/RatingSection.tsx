/**
 * RatingSection Component
 * Sección completa de ratings para la página de detalle del curso
 */

'use client';

import { StarRating } from '@/components/StarRating/StarRating';
import { InteractiveStarRating } from '@/components/StarRating/InteractiveStarRating';
import { useRating } from '@/hooks/useRating';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import type { RatingStats } from '@/types/rating';
import styles from './RatingSection.module.scss';

interface RatingSectionProps {
  // ID del curso (para llamadas API)
  courseId: number;

  // Stats iniciales (del server render)
  initialStats: RatingStats;
}

/**
 * Componente principal: RatingSection
 */
export const RatingSection = ({
  courseId,
  initialStats,
}: RatingSectionProps) => {
  const { state: authState } = useAuth();
  const {
    userRating,
    stats,
    status,
    error,
    submitRating,
    clearError,
  } = useRating({
    courseId,
    initialStats,
  });

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <section className={styles.ratingSection} aria-labelledby="ratings-title">
      <h3 id="ratings-title" className={styles.title}>
        Calificaciones
      </h3>

      {/* Rating Display - Promedio del curso */}
      <div className={styles.courseRating}>
        <h4 className={styles.subtitle}>Promedio del curso</h4>
        <div className={styles.ratingDisplay}>
          <StarRating
            rating={stats.average_rating}
            totalRatings={stats.total_ratings}
            showCount={false}
            size="large"
            readonly={true}
          />
          <div className={styles.ratingInfo}>
            <span className={styles.average}>
              {stats.average_rating.toFixed(1)} de 5
            </span>
            {stats.total_ratings > 0 && (
              <span className={styles.count}>
                ({stats.total_ratings} calificacion{stats.total_ratings !== 1 ? 'es' : ''})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* User Rating Panel - Votación del usuario */}
      {authState !== 'authenticated' ? (
        <div className={styles.loginPrompt}>
          <p>
            Por favor{' '}
            <Link href="/login" className={styles.loginLink}>
              inicia sesión
            </Link>{' '}
            para calificar este curso
          </p>
        </div>
      ) : (
      <div className={styles.userRating}>
        <h4 className={styles.subtitle}>
          {userRating === null ? 'Tu calificación' : 'Has calificado este curso'}
        </h4>

        <InteractiveStarRating
          value={userRating}
          onChange={submitRating}
          disabled={isLoading}
          size="large"
        />

        {/* Status Messages */}
        {isLoading && (
          <div className={styles.statusMessage} role="status" aria-live="polite">
            <span className={styles.spinner} aria-hidden="true"></span>
            <span>Guardando tu calificación...</span>
          </div>
        )}

        {isSuccess && (
          <div
            className={`${styles.statusMessage} ${styles.success}`}
            role="status"
            aria-live="polite"
          >
            <svg
              className={styles.checkmark}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>¡Calificación guardada!</span>
          </div>
        )}

        {isError && error && (
          <div
            className={`${styles.statusMessage} ${styles.error}`}
            role="alert"
            aria-live="assertive"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className={styles.closeButton}
              aria-label="Cerrar mensaje de error"
            >
              ×
            </button>
          </div>
        )}
      </div>
      )}
    </section>
  );
};
