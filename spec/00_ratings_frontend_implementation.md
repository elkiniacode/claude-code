# Especificacion Tecnica: Sistema de Ratings en Frontend

**Proyecto:** Platziflix
**Componente:** Frontend (Next.js)
**Fecha:** 2026-01-29
**Version:** 1.0
**Spec ID:** 00

---

## 1. Resumen Ejecutivo

### 1.1 Objetivo
Completar la implementacion del sistema de ratings en el Frontend de Platziflix, permitiendo a los usuarios:
- Visualizar el rating promedio y distribucion de calificaciones en la pagina de detalle del curso
- Calificar cursos con un sistema interactivo de 1-5 estrellas
- Ver y modificar su calificacion existente

### 1.2 Alcance
- **Incluido:** Componentes de UI, hooks de estado, integracion con API existente
- **Excluido:** Autenticacion de usuarios (se usara user_id hardcodeado para MVP), modificaciones al Backend

### 1.3 Restricciones
- El Backend esta 100% completo y NO debe modificarse
- Debe seguir los patrones existentes de la aplicacion (Server Components, CSS Modules)
- El componente interactivo debe ser Client Component (`"use client"`)

---

## 2. Analisis del Estado Actual

### 2.1 Componentes Existentes

| Archivo | Estado | Descripcion |
|---------|--------|-------------|
| `src/types/rating.ts` | Completo | Tipos `CourseRating`, `RatingRequest`, `RatingStats`, `ApiError` |
| `src/services/ratingsApi.ts` | Completo | Cliente HTTP con todos los metodos CRUD |
| `src/components/StarRating/StarRating.tsx` | Readonly | Solo muestra estrellas, no permite interaccion |
| `src/components/Course/Course.tsx` | Completo | Muestra `average_rating` en cards del catalogo |
| `src/components/CourseDetail/CourseDetail.tsx` | Incompleto | NO muestra ratings, NO permite votar |

### 2.2 API Disponible (ratingsApi.ts)

```typescript
// Metodos ya implementados:
ratingsApi.getRatingStats(courseId)      // GET /courses/{id}/ratings/stats
ratingsApi.getCourseRatings(courseId)    // GET /courses/{id}/ratings
ratingsApi.getUserRating(courseId, userId) // GET /courses/{id}/ratings/{userId}
ratingsApi.createRating(courseId, request) // POST /courses/{id}/ratings
ratingsApi.updateRating(courseId, userId, request) // PUT /courses/{id}/ratings/{userId}
ratingsApi.deleteRating(courseId, userId)  // DELETE /courses/{id}/ratings/{userId}
```

### 2.3 Tipos Existentes

```typescript
// rating.ts
interface RatingStats {
  average_rating: number; // 0.0 - 5.0
  total_ratings: number;
}

interface RatingRequest {
  user_id: number;
  rating: number; // 1-5
}

interface CourseRating {
  id: number;
  course_id: number;
  user_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

type RatingState = 'idle' | 'loading' | 'success' | 'error';
```

### 2.4 Brechas Identificadas

1. **CourseDetail no recibe datos de rating** - El tipo `CourseDetail` no incluye `average_rating` ni `total_ratings`
2. **No existe componente interactivo** - `StarRating` es readonly, necesitamos `InteractiveStarRating`
3. **No hay hook de estado** - Falta logica para manejar el ciclo de vida del rating del usuario
4. **No hay seccion de rating en CourseDetail** - El componente no tiene UI para mostrar/votar

---

## 3. Arquitectura de la Solucion

### 3.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        page.tsx (Server Component)                           │
│                        /course/[slug]                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  Fetch: getCourseData(slug)                                             ││
│  │  Returns: CourseDetail + average_rating + total_ratings                 ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ props: course
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   CourseDetailComponent (Server Component)                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  - Header: thumbnail, title, teacher, description                       ││
│  │  - Stats: duration, class count                                         ││
│  │  - NEW: RatingSection (displays average + allows voting)                ││
│  │  - Classes list                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ props: courseId, initialStats
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     RatingSection (Client Component)                         │
│                     "use client"                                             │
│  ┌───────────────────────────────┐  ┌──────────────────────────────────────┐│
│  │  RatingDisplay                │  │  UserRatingPanel                     ││
│  │  - StarRating (readonly)      │  │  - InteractiveStarRating             ││
│  │  - Average: 4.5/5             │  │  - Submit button                     ││
│  │  - Total: (123 calificaciones)│  │  - Loading/Error states              ││
│  └───────────────────────────────┘  └──────────────────────────────────────┘│
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  useRating(courseId, userId) - Custom Hook                              ││
│  │  - state: { userRating, stats, status, error }                          ││
│  │  - actions: { submitRating, deleteRating, refresh }                     ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Datos

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE RENDERIZADO                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Server: page.tsx fetches course data (includes rating stats)             │
│                          │                                                   │
│                          ▼                                                   │
│  2. Server: CourseDetailComponent renders with initial stats                 │
│                          │                                                   │
│                          ▼                                                   │
│  3. Client: RatingSection hydrates, useRating hook initializes               │
│                          │                                                   │
│                          ▼                                                   │
│  4. Client: useRating fetches user's existing rating (if any)                │
│                          │                                                   │
│                          ▼                                                   │
│  5. Client: UI shows interactive stars with user's current rating            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE CALIFICACION                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Usuario hace hover sobre estrellas (feedback visual)                     │
│                          │                                                   │
│                          ▼                                                   │
│  2. Usuario hace click en una estrella (1-5)                                 │
│                          │                                                   │
│                          ▼                                                   │
│  3. useRating.submitRating(rating) es invocado                               │
│                          │                                                   │
│                          ▼                                                   │
│  4. Hook determina: userRating existe?                                       │
│           │                    │                                             │
│           │ NO                 │ SI                                          │
│           ▼                    ▼                                             │
│  5a. POST createRating    5b. PUT updateRating                               │
│           │                    │                                             │
│           └────────┬───────────┘                                             │
│                    ▼                                                         │
│  6. Hook actualiza estado local + refetch stats                              │
│                    │                                                         │
│                    ▼                                                         │
│  7. UI muestra estado success (confirmacion visual)                          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Manejo de Estado

```typescript
// Estado del hook useRating
interface UseRatingState {
  // Rating del usuario actual
  userRating: number | null;        // null = no ha calificado

  // Estadisticas del curso
  stats: RatingStats;               // { average_rating, total_ratings }

  // Estado de la operacion actual
  status: RatingState;              // 'idle' | 'loading' | 'success' | 'error'

  // Error (si existe)
  error: string | null;

  // Rating seleccionado (hover/preview)
  hoverRating: number | null;
}

// Acciones del hook
interface UseRatingActions {
  submitRating: (rating: number) => Promise<void>;
  deleteRating: () => Promise<void>;
  setHoverRating: (rating: number | null) => void;
  clearError: () => void;
}
```

---

## 4. Especificacion de Componentes

### 4.1 InteractiveStarRating

**Ubicacion:** `src/components/StarRating/InteractiveStarRating.tsx`

**Proposito:** Componente de estrellas interactivo que permite al usuario seleccionar una calificacion.

**Props:**

```typescript
interface InteractiveStarRatingProps {
  // Rating actualmente seleccionado (1-5 o null)
  value: number | null;

  // Callback cuando el usuario selecciona un rating
  onChange: (rating: number) => void;

  // Rating en hover (para preview visual)
  hoverValue?: number | null;

  // Callback cuando el usuario hace hover
  onHover?: (rating: number | null) => void;

  // Deshabilitar interaccion (durante loading)
  disabled?: boolean;

  // Tamano de las estrellas
  size?: 'small' | 'medium' | 'large';

  // Clase CSS adicional
  className?: string;
}
```

**Comportamiento:**
1. Muestra 5 estrellas clicables
2. Hover sobre una estrella resalta todas las estrellas hasta ese punto
3. Click selecciona el rating y dispara `onChange`
4. Si `disabled=true`, no responde a interacciones
5. Muestra el rating actual con estrellas llenas
6. Accesibilidad: navegable por teclado (Tab + Enter/Space)

**Estados Visuales:**
- **Idle:** Muestra `value` o estrellas vacias si `value=null`
- **Hover:** Muestra preview del rating bajo el cursor
- **Disabled:** Opacidad reducida, cursor not-allowed

### 4.2 RatingSection

**Ubicacion:** `src/components/RatingSection/RatingSection.tsx`

**Proposito:** Seccion completa de ratings para la pagina de detalle del curso. Contiene la visualizacion de estadisticas y el panel de votacion del usuario.

**Props:**

```typescript
interface RatingSectionProps {
  // ID del curso (para llamadas API)
  courseId: number;

  // Stats iniciales (del server render)
  initialStats: RatingStats;
}
```

**Estructura Interna:**

```
RatingSection
├── RatingDisplay
│   ├── StarRating (readonly, large)
│   ├── Average rating text (e.g., "4.5 de 5")
│   └── Total ratings text (e.g., "123 calificaciones")
│
└── UserRatingPanel
    ├── Title: "Tu calificacion"
    ├── InteractiveStarRating
    ├── Status indicator (loading spinner / success checkmark)
    └── Error message (if any)
```

**Estados del Componente:**

| Estado | UI |
|--------|-----|
| `idle` (sin rating) | Estrellas vacias, texto "Califica este curso" |
| `idle` (con rating) | Estrellas con rating del usuario, texto "Tu calificacion: X/5" |
| `loading` | Spinner, estrellas deshabilitadas |
| `success` | Checkmark temporal (2s), luego vuelve a idle |
| `error` | Mensaje de error, boton retry |

### 4.3 useRating Hook

**Ubicacion:** `src/hooks/useRating.ts`

**Proposito:** Custom hook que encapsula toda la logica de estado y comunicacion con la API de ratings.

**Signature:**

```typescript
function useRating(
  courseId: number,
  userId: number,
  initialStats?: RatingStats
): UseRatingReturn;

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
```

**Logica Interna:**

```typescript
// Pseudo-codigo del hook
function useRating(courseId, userId, initialStats) {
  const [state, dispatch] = useReducer(ratingReducer, initialState);

  // Fetch inicial: obtener rating del usuario
  useEffect(() => {
    fetchUserRating();
  }, [courseId, userId]);

  // Funcion para enviar rating
  const submitRating = async (rating: number) => {
    dispatch({ type: 'LOADING' });

    try {
      if (state.userRating === null) {
        // Crear nuevo rating
        await ratingsApi.createRating(courseId, { user_id: userId, rating });
      } else {
        // Actualizar rating existente
        await ratingsApi.updateRating(courseId, userId, { user_id: userId, rating });
      }

      // Refetch stats para actualizar promedio
      const newStats = await ratingsApi.getRatingStats(courseId);

      dispatch({ type: 'SUCCESS', payload: { userRating: rating, stats: newStats } });

      // Auto-clear success status after 2s
      setTimeout(() => dispatch({ type: 'IDLE' }), 2000);
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message });
    }
  };

  return { ...state, submitRating, deleteRating, setHoverRating, clearError };
}
```

---

## 5. Archivos a Crear

### 5.1 Lista de Archivos Nuevos

| # | Archivo | Tipo | Descripcion |
|---|---------|------|-------------|
| 1 | `src/hooks/useRating.ts` | Hook | Custom hook para manejar estado de ratings |
| 2 | `src/components/StarRating/InteractiveStarRating.tsx` | Component | Estrellas interactivas para votar |
| 3 | `src/components/StarRating/InteractiveStarRating.module.scss` | Styles | Estilos del componente interactivo |
| 4 | `src/components/RatingSection/RatingSection.tsx` | Component | Seccion completa de ratings |
| 5 | `src/components/RatingSection/RatingSection.module.scss` | Styles | Estilos de la seccion |
| 6 | `src/components/RatingSection/index.ts` | Export | Re-export del componente |
| 7 | `src/hooks/useRating.test.ts` | Test | Tests unitarios del hook |
| 8 | `src/components/RatingSection/__tests__/RatingSection.test.tsx` | Test | Tests del componente |

### 5.2 Detalle de Cada Archivo

#### 5.2.1 `src/hooks/useRating.ts`

```typescript
/**
 * useRating Hook
 * Maneja el estado y operaciones del sistema de ratings
 */
import { useState, useEffect, useCallback, useReducer } from 'react';
import * as ratingsApi from '@/services/ratingsApi';
import type { RatingStats, RatingState } from '@/types/rating';

// ... implementacion completa del hook
```

#### 5.2.2 `src/components/StarRating/InteractiveStarRating.tsx`

```typescript
/**
 * InteractiveStarRating Component
 * Estrellas clicables para que el usuario califique
 */
'use client';

import { useState, useCallback } from 'react';
import styles from './InteractiveStarRating.module.scss';

// ... implementacion completa del componente
```

#### 5.2.3 `src/components/RatingSection/RatingSection.tsx`

```typescript
/**
 * RatingSection Component
 * Seccion completa de ratings para la pagina de detalle del curso
 */
'use client';

import { StarRating } from '@/components/StarRating/StarRating';
import { InteractiveStarRating } from '@/components/StarRating/InteractiveStarRating';
import { useRating } from '@/hooks/useRating';
import styles from './RatingSection.module.scss';

// ... implementacion completa del componente
```

---

## 6. Archivos a Modificar

### 6.1 `src/types/index.ts`

**Cambio:** Verificar que `CourseDetail` incluya los campos de rating (heredados de `Course`).

```typescript
// ANTES (si no tiene los campos)
export interface CourseDetail extends Course {
  description: string;
  classes: Class[];
}

// DESPUES (verificar que Course ya los tiene)
// Course ya incluye average_rating y total_ratings opcionales
// CourseDetail los hereda automaticamente
```

### 6.2 `src/components/CourseDetail/CourseDetail.tsx`

**Cambios:**
1. Importar `RatingSection`
2. Agregar seccion de ratings en el JSX
3. Pasar props necesarios

```typescript
// AGREGAR IMPORT
import { RatingSection } from "@/components/RatingSection";

// AGREGAR EN JSX (despues de .stats y antes de .classesSection)
{course.id && (
  <RatingSection
    courseId={course.id}
    initialStats={{
      average_rating: course.average_rating ?? 0,
      total_ratings: course.total_ratings ?? 0,
    }}
  />
)}
```

### 6.3 `src/components/CourseDetail/CourseDetail.module.scss`

**Cambio:** Agregar estilos para la seccion de ratings (opcional, puede usar los propios de RatingSection).

```scss
// Agregar al final si se necesita wrapper adicional
.ratingWrapper {
  margin-top: 2rem;
  margin-bottom: 2rem;
}
```

---

## 7. Orden de Implementacion

### Fase 1: Infraestructura (Estimado: 1 hora)

| # | Tarea | Dependencias | Archivos |
|---|-------|--------------|----------|
| 1.1 | Crear custom hook useRating | ninguna | `src/hooks/useRating.ts` |
| 1.2 | Tests del hook | 1.1 | `src/hooks/useRating.test.ts` |

### Fase 2: Componente Interactivo (Estimado: 1.5 horas)

| # | Tarea | Dependencias | Archivos |
|---|-------|--------------|----------|
| 2.1 | Crear InteractiveStarRating | ninguna | `InteractiveStarRating.tsx` |
| 2.2 | Estilos del componente | 2.1 | `InteractiveStarRating.module.scss` |
| 2.3 | Tests del componente | 2.1, 2.2 | Test file |

### Fase 3: Seccion de Ratings (Estimado: 1.5 horas)

| # | Tarea | Dependencias | Archivos |
|---|-------|--------------|----------|
| 3.1 | Crear RatingSection | 1.1, 2.1 | `RatingSection.tsx` |
| 3.2 | Estilos de la seccion | 3.1 | `RatingSection.module.scss` |
| 3.3 | Export index | 3.1 | `index.ts` |
| 3.4 | Tests del componente | 3.1, 3.2 | Test file |

### Fase 4: Integracion (Estimado: 1 hora)

| # | Tarea | Dependencias | Archivos |
|---|-------|--------------|----------|
| 4.1 | Modificar CourseDetail | 3.1 | `CourseDetail.tsx` |
| 4.2 | Agregar estilos | 4.1 | `CourseDetail.module.scss` |
| 4.3 | Verificar tipos | 4.1 | `src/types/index.ts` |
| 4.4 | Testing E2E manual | 4.1, 4.2, 4.3 | - |

### Fase 5: QA y Polish (Estimado: 1 hora)

| # | Tarea | Dependencias | Archivos |
|---|-------|--------------|----------|
| 5.1 | Testing completo | Todas | - |
| 5.2 | Ajustes de accesibilidad | 5.1 | Varios |
| 5.3 | Revision de responsive | 5.1 | SCSS files |
| 5.4 | Documentacion inline | 5.1 | TSDoc comments |

**Tiempo Total Estimado:** 6 horas

---

## 8. Consideraciones Tecnicas

### 8.1 Manejo de Errores

| Escenario | Comportamiento | UI |
|-----------|---------------|----|
| Network error | Mostrar mensaje, permitir retry | Toast o mensaje inline |
| API error 400 | Mostrar mensaje del backend | Mensaje inline rojo |
| API error 404 | Usuario no ha calificado (normal) | No mostrar error |
| Timeout | Mostrar mensaje, permitir retry | Mensaje + boton retry |

### 8.2 User ID (MVP)

Para el MVP sin autenticacion, usar un `user_id` hardcodeado:

```typescript
// Constante temporal hasta implementar auth
const TEMP_USER_ID = 1;
```

**Nota:** Este valor debera reemplazarse por el ID del usuario autenticado cuando se implemente el sistema de auth.

### 8.3 Optimistic Updates

Para mejor UX, considerar actualizaciones optimistas:

```typescript
const submitRating = async (rating: number) => {
  // 1. Guardar estado anterior
  const previousState = { ...state };

  // 2. Actualizar UI inmediatamente (optimistic)
  dispatch({ type: 'OPTIMISTIC_UPDATE', payload: rating });

  try {
    // 3. Hacer request al servidor
    await ratingsApi.createOrUpdate(...);

    // 4. Confirmar con datos reales del servidor
    const newStats = await ratingsApi.getRatingStats(courseId);
    dispatch({ type: 'SUCCESS', payload: newStats });
  } catch (error) {
    // 5. Rollback si falla
    dispatch({ type: 'ROLLBACK', payload: previousState });
  }
};
```

### 8.4 UX - Feedback Visual

| Accion | Feedback |
|--------|----------|
| Hover sobre estrella | Estrellas se iluminan hasta ese punto |
| Click en estrella | Animacion de seleccion (scale) |
| Enviando rating | Spinner pequeno, estrellas deshabilitadas |
| Rating exitoso | Checkmark verde temporal (2s) |
| Error | Mensaje rojo, estrellas vuelven a estado anterior |

### 8.5 Accesibilidad (a11y)

| Requisito | Implementacion |
|-----------|----------------|
| Keyboard navigation | Tab entre estrellas, Enter/Space para seleccionar |
| ARIA labels | `aria-label="Calificar con X estrellas"` |
| Screen reader | Anunciar rating actual y total |
| Focus visible | Outline claro en foco |
| Color contrast | Estrellas amarillas sobre fondo claro |

### 8.6 Performance

| Consideracion | Solucion |
|---------------|----------|
| Re-renders excesivos | `useCallback` para handlers, `useMemo` para calculos |
| Multiple API calls | Debounce en cambios rapidos (si se permite click multiple) |
| Bundle size | Componentes pequenos, tree-shakeable |

### 8.7 Responsive Design

| Breakpoint | Ajustes |
|------------|---------|
| Desktop (>768px) | Rating section al lado de stats |
| Tablet (768px) | Rating section debajo de stats |
| Mobile (<480px) | Estrellas mas grandes (touch-friendly), layout vertical |

---

## 9. Criterios de Aceptacion

### 9.1 Funcionales

- [ ] **AC-1:** Usuario puede ver el rating promedio del curso en la pagina de detalle
- [ ] **AC-2:** Usuario puede ver el numero total de calificaciones
- [ ] **AC-3:** Usuario puede calificar un curso haciendo click en las estrellas (1-5)
- [ ] **AC-4:** Usuario puede modificar su calificacion existente
- [ ] **AC-5:** El rating promedio se actualiza despues de enviar una calificacion
- [ ] **AC-6:** Se muestra feedback visual durante el proceso de calificacion
- [ ] **AC-7:** Se muestran mensajes de error apropiados cuando falla la operacion

### 9.2 Tecnicos

- [ ] **TC-1:** Componente RatingSection es Client Component (`"use client"`)
- [ ] **TC-2:** Hook useRating maneja todos los estados (idle, loading, success, error)
- [ ] **TC-3:** Se usa ratingsApi existente sin duplicar codigo
- [ ] **TC-4:** Estilos usan CSS Modules y variables SCSS existentes
- [ ] **TC-5:** Componentes tienen tests unitarios con >80% coverage
- [ ] **TC-6:** TypeScript strict mode sin errores
- [ ] **TC-7:** ESLint pasa sin warnings

### 9.3 UX/Accesibilidad

- [ ] **UX-1:** Hover sobre estrellas muestra preview visual
- [ ] **UX-2:** Loading state visible durante operaciones
- [ ] **UX-3:** Success state confirmacion temporal (2s)
- [ ] **UX-4:** Error messages son claros y accionables
- [ ] **UX-5:** Componente navegable por teclado
- [ ] **UX-6:** ARIA labels apropiados para screen readers
- [ ] **UX-7:** Responsive: funciona correctamente en mobile

### 9.4 Definition of Done

Un item se considera DONE cuando:

1. Codigo implementado y funcionando
2. Tests unitarios escritos y pasando
3. Sin errores de TypeScript
4. ESLint sin warnings
5. Probado manualmente en Chrome y Firefox
6. Probado en viewport mobile (375px)
7. Code review aprobado

---

## 10. Apendice

### 10.1 Mockup de UI

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CURSO: Fundamentos de JavaScript                                            │
│                                                                              │
│  [Thumbnail]     Fundamentos de JavaScript                                   │
│                  Por Juan Garcia                                             │
│                  Aprende los conceptos basicos...                            │
│                                                                              │
│                  Duracion: 4h 30m  |  12 clases                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  CALIFICACIONES                                                         ││
│  │                                                                         ││
│  │  Promedio del curso:                                                    ││
│  │  [★][★][★][★][☆]  4.5 de 5  (123 calificaciones)                        ││
│  │                                                                         ││
│  │  ─────────────────────────────────────────────────                      ││
│  │                                                                         ││
│  │  Tu calificacion:                                                       ││
│  │  [★][★][★][★][ ]  <-- Estrellas interactivas                            ││
│  │                                                                         ││
│  │  "Has calificado este curso con 4 estrellas"                            ││
│  │                                                                         ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│  CONTENIDO DEL CURSO                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │  01  |  Introduccion al curso                                           ││
│  │  ...                                                                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Paleta de Colores para Ratings

| Elemento | Color | Valor |
|----------|-------|-------|
| Estrella llena | Amarillo/Dorado | `#ffc107` |
| Estrella vacia | Gris | `#e0e0e0` |
| Estrella hover | Amarillo brillante | `#ffca2c` |
| Success message | Verde | `#28a745` |
| Error message | Rojo | `#dc3545` |
| Loading spinner | Primary | `#ff2d2d` |

### 10.3 Dependencias Externas

Ninguna dependencia nueva requerida. Se usaran las existentes:
- React 19
- Next.js 15
- TypeScript
- SCSS/CSS Modules

---

**Fin del Documento**

*Autor: Arquitecto de Software - Platziflix*
*Revision: 1.0*
*Fecha: 2026-01-29*
