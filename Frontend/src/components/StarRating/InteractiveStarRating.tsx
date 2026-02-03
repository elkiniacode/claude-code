/**
 * InteractiveStarRating Component
 * Estrellas interactivas para que el usuario califique un curso
 */

'use client';

import { useState, useCallback, KeyboardEvent } from 'react';
import styles from './InteractiveStarRating.module.scss';

interface InteractiveStarRatingProps {
  // Rating actualmente seleccionado (1-5 o null)
  value: number | null;

  // Callback cuando el usuario selecciona un rating
  onChange: (rating: number) => void;

  // Deshabilitar interacción (durante loading)
  disabled?: boolean;

  // Tamaño de las estrellas
  size?: 'small' | 'medium' | 'large';

  // Clase CSS adicional
  className?: string;
}

/**
 * Sub-componente: Icono de estrella
 */
const StarIcon = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * Componente principal: InteractiveStarRating
 */
export const InteractiveStarRating = ({
  value,
  onChange,
  disabled = false,
  size = 'large',
  className = '',
}: InteractiveStarRatingProps) => {
  // Rating en hover (para preview)
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Rating efectivo a mostrar (hover o value)
  const displayRating = hoverRating ?? value ?? 0;

  /**
   * Handler: Click en una estrella
   */
  const handleClick = useCallback(
    (rating: number) => {
      if (disabled) return;
      onChange(rating);
    },
    [disabled, onChange]
  );

  /**
   * Handler: Mouse enter en una estrella
   */
  const handleMouseEnter = useCallback(
    (rating: number) => {
      if (disabled) return;
      setHoverRating(rating);
    },
    [disabled]
  );

  /**
   * Handler: Mouse leave del contenedor
   */
  const handleMouseLeave = useCallback(() => {
    setHoverRating(null);
  }, []);

  /**
   * Handler: Teclado (Enter o Space para seleccionar)
   */
  const handleKeyDown = useCallback(
    (rating: number, event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onChange(rating);
      }
    },
    [disabled, onChange]
  );

  /**
   * Determina si una estrella debe estar llena
   */
  const isStarFilled = (starIndex: number): boolean => {
    return displayRating >= starIndex;
  };

  return (
    <div
      className={`${styles.interactiveStarRating} ${styles[size]} ${
        disabled ? styles.disabled : ''
      } ${className}`}
      onMouseLeave={handleMouseLeave}
      role="radiogroup"
      aria-label="Calificar curso"
    >
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${
              isStarFilled(star) ? styles.filled : styles.empty
            }`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onKeyDown={(e) => handleKeyDown(star, e)}
            disabled={disabled}
            aria-label={`Calificar con ${star} estrella${
              star > 1 ? 's' : ''
            }`}
            aria-checked={value === star}
            role="radio"
            tabIndex={disabled ? -1 : 0}
          >
            <StarIcon />
          </button>
        ))}
      </div>

      {/* Texto descriptivo del rating actual */}
      {value !== null && (
        <span className={styles.ratingText} aria-live="polite">
          {value} de 5 estrella{value > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};
