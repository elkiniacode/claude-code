# Platziflix - Proyecto Multi-plataforma

## Visión General

Platziflix es una plataforma de cursos online estilo Netflix con arquitectura multi-plataforma:
- **Backend**: API REST con FastAPI + PostgreSQL
- **Frontend**: Aplicación web con Next.js 15
- **Mobile**: Apps nativas Android (Kotlin) + iOS (Swift)

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTES                                        │
├───────────────────┬───────────────────┬─────────────────────────────────────┤
│   Android         │   iOS             │   Web (Next.js)                     │
│   Kotlin/Compose  │   Swift/SwiftUI   │   React 19 / TypeScript             │
│   MVVM + Retrofit │   MVVM + URLSession│   Server Components + fetch        │
└─────────┬─────────┴─────────┬─────────┴───────────────┬─────────────────────┘
          │                   │                         │
          └───────────────────┼─────────────────────────┘
                              │ HTTP/JSON (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          API REST (FastAPI)                                  │
│                          http://localhost:8000                               │
│  Patrones: Service Layer + Repository + Dependency Injection                │
└─────────────────────────────────────────────────────────────────────────────┘
                              │ SQLAlchemy ORM
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL 15 (Docker)                                │
│                        platziflix_db @ localhost:5432                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Estructura del Proyecto

```
claude-code/
├── Backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app principal
│   │   ├── core/
│   │   │   └── config.py           # Settings con Pydantic
│   │   ├── db/
│   │   │   ├── base.py             # SQLAlchemy engine + session
│   │   │   └── seed.py             # Datos de prueba
│   │   ├── models/
│   │   │   ├── base.py             # BaseModel (id, timestamps, soft delete)
│   │   │   ├── course.py           # Course model
│   │   │   ├── teacher.py          # Teacher model
│   │   │   ├── lesson.py           # Lesson model
│   │   │   ├── class_.py           # Class model
│   │   │   ├── course_rating.py    # CourseRating model
│   │   │   └── course_teacher.py   # Tabla asociación M:N
│   │   ├── schemas/
│   │   │   └── rating.py           # Pydantic schemas
│   │   ├── services/
│   │   │   └── course_service.py   # Lógica de negocio
│   │   ├── alembic/
│   │   │   └── versions/           # Migraciones
│   │   └── tests/                  # pytest tests
│   ├── docker-compose.yml          # PostgreSQL + API
│   ├── Dockerfile                  # Python 3.11 image
│   ├── Makefile                    # Comandos desarrollo
│   └── pyproject.toml              # Dependencias UV
│
├── Frontend/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── page.tsx            # Home - catálogo cursos
│   │   │   ├── course/[slug]/
│   │   │   │   ├── page.tsx        # Detalle curso
│   │   │   │   ├── error.tsx       # Error boundary
│   │   │   │   ├── loading.tsx     # Skeleton loading
│   │   │   │   └── not-found.tsx   # 404 personalizado
│   │   │   └── classes/[class_id]/
│   │   │       └── page.tsx        # Reproductor video
│   │   ├── components/
│   │   │   ├── Course/             # Card de curso
│   │   │   ├── CourseDetail/       # Vista detalle
│   │   │   ├── VideoPlayer/        # Reproductor HTML5
│   │   │   └── StarRating/         # Sistema estrellas
│   │   ├── services/
│   │   │   └── ratingsApi.ts       # Cliente HTTP ratings
│   │   ├── styles/
│   │   │   ├── vars.scss           # Variables SCSS
│   │   │   └── reset.scss          # CSS reset
│   │   ├── types/
│   │   │   ├── index.ts            # Course, Class, etc.
│   │   │   └── rating.ts           # Rating types
│   │   └── test/
│   │       └── setup.ts            # Vitest config
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── vitest.config.ts
│
└── Mobile/
    ├── PlatziFlixAndroid/
    │   └── app/src/main/java/com/espaciotiago/platziflixandroid/
    │       ├── data/
    │       │   ├── entities/       # CourseDTO
    │       │   ├── mappers/        # CourseMapper
    │       │   ├── network/        # ApiService, NetworkModule
    │       │   └── repositories/   # RemoteCourseRepository
    │       ├── domain/
    │       │   ├── models/         # Course
    │       │   └── repositories/   # CourseRepository interface
    │       ├── presentation/
    │       │   └── courses/
    │       │       ├── components/ # CourseCard, ErrorMessage
    │       │       ├── screen/     # CourseListScreen
    │       │       ├── state/      # UiState, UiEvent
    │       │       └── viewmodel/  # CourseListViewModel
    │       ├── di/                 # AppModule (DI manual)
    │       └── ui/theme/           # Material3 theme
    │
    └── PlatziFlixiOS/
        └── PlatziFlixiOS/
            ├── Data/
            │   ├── Entities/       # DTOs (CourseDTO, TeacherDTO)
            │   ├── Mapper/         # CourseMapper, TeacherMapper
            │   └── Repositories/   # RemoteCourseRepository
            ├── Domain/
            │   ├── Models/         # Course, Teacher, Class
            │   └── Repositories/   # CourseRepository protocol
            ├── Presentation/
            │   ├── ViewModels/     # CourseListViewModel
            │   └── Views/          # CourseListView, CourseCardView
            └── Services/           # NetworkService, NetworkManager
```

---

## Stack Tecnológico

| Capa | Backend | Frontend | Android | iOS |
|------|---------|----------|---------|-----|
| **Framework** | FastAPI | Next.js 15 | Jetpack Compose | SwiftUI |
| **Lenguaje** | Python 3.11 | TypeScript | Kotlin | Swift |
| **HTTP Client** | - | fetch() | Retrofit + OkHttp | URLSession |
| **ORM/BD** | SQLAlchemy 2.0 | - | - | - |
| **State Mgmt** | - | Server Components | StateFlow | @Published |
| **Estilos** | - | SCSS + CSS Modules | Material3 | DesignSystem |
| **Testing** | pytest | Vitest + RTL | JUnit | XCTest |
| **Patrón** | Service Layer | App Router | MVVM | MVVM + Repository |

---

## Modelo de Datos

### Diagrama de Entidades

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   Teacher    │◄──────│  course_teachers │──────►│    Course    │
├──────────────┤  M:N  ├──────────────────┤  M:N  ├──────────────┤
│ id (PK)      │       │ teacher_id (FK)  │       │ id (PK)      │
│ name         │       │ course_id (FK)   │       │ name         │
│ email (UQ)   │       └──────────────────┘       │ description  │
│ created_at   │                                  │ thumbnail    │
│ updated_at   │                                  │ slug (UQ,IX) │
│ deleted_at   │                                  │ created_at   │
└──────────────┘                                  │ updated_at   │
                                                  │ deleted_at   │
                                                  └──────┬───────┘
                                                         │ 1:N
                       ┌─────────────────────────────────┼─────────────────┐
                       ▼                                 ▼                 ▼
              ┌──────────────┐                  ┌──────────────┐  ┌──────────────┐
              │    Lesson    │                  │    Class     │  │ CourseRating │
              ├──────────────┤                  ├──────────────┤  ├──────────────┤
              │ id (PK)      │                  │ id (PK)      │  │ id (PK)      │
              │ course_id FK │                  │ course_id FK │  │ course_id FK │
              │ name         │                  │ name         │  │ user_id (IX) │
              │ description  │                  │ description  │  │ rating 1-5   │
              │ slug (IX)    │                  │ slug         │  │ created_at   │
              │ video_url    │                  │ video_url    │  │ deleted_at   │
              └──────────────┘                  └──────────────┘  └──────────────┘
```

### Campos Comunes (BaseModel)
Todos los modelos heredan de `BaseModel`:
- `id`: Integer, Primary Key, autoincrement
- `created_at`: DateTime, auto-timestamp en creación
- `updated_at`: DateTime, auto-timestamp en actualización
- `deleted_at`: DateTime, NULL (soft delete pattern)

### Constraints Especiales
- `CourseRating.rating`: CHECK constraint (1-5)
- `CourseRating`: UNIQUE constraint (course_id, user_id, deleted_at)

---

## API Endpoints

### Base URL: `http://localhost:8000`

### Health & Root
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Mensaje de bienvenida |
| GET | `/health` | Health check + estado BD |

### Courses (tag: "courses")
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/courses` | Lista todos los cursos con rating stats |
| GET | `/courses/{slug}` | Detalle curso + profesores + lecciones |
| GET | `/classes/{class_id}` | Detalle de una clase/lección |

### Ratings (tag: "ratings")
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/courses/{course_id}/ratings` | Crear/actualizar rating (201) |
| GET | `/courses/{course_id}/ratings` | Todos los ratings del curso |
| GET | `/courses/{course_id}/ratings/stats` | Estadísticas agregadas |
| GET | `/courses/{course_id}/ratings/user/{user_id}` | Rating del usuario (204 si no existe) |
| PUT | `/courses/{course_id}/ratings/{user_id}` | Actualizar rating existente |
| DELETE | `/courses/{course_id}/ratings/{user_id}` | Soft delete (204) |

### Documentación
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Rutas Frontend (Next.js App Router)

| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Home - Catálogo de cursos (grid) |
| `/course/[slug]` | `app/course/[slug]/page.tsx` | Detalle del curso |
| `/course/[slug]/error` | `app/course/[slug]/error.tsx` | Error boundary |
| `/course/[slug]/loading` | `app/course/[slug]/loading.tsx` | Skeleton loading |
| `/course/[slug]/not-found` | `app/course/[slug]/not-found.tsx` | 404 personalizado |
| `/classes/[class_id]` | `app/classes/[class_id]/page.tsx` | Reproductor de video |

---

## Comandos de Desarrollo

### Backend (Docker obligatorio)
```bash
cd Backend

# Ciclo de vida
make start              # Iniciar Docker Compose (PostgreSQL + API)
make stop               # Detener containers
make restart            # Reiniciar containers
make logs               # Ver logs de todos los servicios

# Base de datos
make migrate            # Aplicar migraciones Alembic
make create-migration   # Crear nueva migración (autogenerate)
make seed               # Poblar datos de prueba
make seed-fresh         # Limpiar BD + poblar datos frescos

# Testing
make test               # Ejecutar pytest
make shell              # Shell dentro del container API
```

### Frontend
```bash
cd Frontend

yarn dev                # Servidor desarrollo (http://localhost:3000)
yarn build              # Build de producción
yarn start              # Servidor producción
yarn test               # Ejecutar Vitest
yarn lint               # ESLint
```

### Mobile
```bash
# Android
# Abrir PlatziFlixAndroid/ en Android Studio → Run

# iOS
# Abrir PlatziFlixiOS/ en Xcode → Product → Run
```

---

## Configuración de Base de Datos

### Docker Compose
```yaml
# Backend/docker-compose.yml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: platziflix_user
      POSTGRES_PASSWORD: platziflix_password
      POSTGRES_DB: platziflix_db
    ports:
      - "5432:5432"

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://platziflix_user:platziflix_password@db:5432/platziflix_db
```

### Connection String
```
postgresql://platziflix_user:platziflix_password@db:5432/platziflix_db
```

### Migraciones Alembic
- Ubicación: `Backend/app/alembic/versions/`
- Config: `Backend/app/alembic.ini`

---

## URLs del Sistema

| Servicio | URL | Puerto |
|----------|-----|--------|
| Backend API | http://localhost:8000 | 8000 |
| API Docs (Swagger) | http://localhost:8000/docs | 8000 |
| Frontend Web | http://localhost:3000 | 3000 |
| PostgreSQL | localhost:5432 | 5432 |

### URLs Base para Mobile
- **Android Emulator**: `http://10.0.2.2:8000` (mapea a localhost del host)
- **iOS Simulator**: `http://localhost:8000`

---

## Patrones de Diseño

### Backend (Python/FastAPI)
- **Service Layer Pattern**: Lógica en `services/course_service.py`
- **Repository Pattern**: Acceso a BD via SQLAlchemy
- **Dependency Injection**: `Depends()` de FastAPI
- **Soft Delete**: Campo `deleted_at` en todos los modelos
- **Pydantic Schemas**: Validación request/response

### Frontend (Next.js/React)
- **Server Components**: Por defecto, fetch en servidor
- **Client Components**: Solo donde necesario (`"use client"`)
- **CSS Modules**: Scoping de estilos por componente
- **Error Boundaries**: `error.tsx` por ruta
- **Suspense**: `loading.tsx` para estados de carga

### Mobile (Android/iOS)
- **MVVM**: Model-View-ViewModel
- **Repository Pattern**: Abstracción de fuente de datos
- **Mapper Pattern**: DTO → Domain Model
- **Clean Architecture**: Capas Data/Domain/Presentation

---

## Convenciones de Código

### Naming
| Plataforma | Variables/Funciones | Clases/Tipos | Archivos |
|------------|---------------------|--------------|----------|
| Python | snake_case | PascalCase | snake_case.py |
| TypeScript | camelCase | PascalCase | PascalCase.tsx |
| Kotlin | camelCase | PascalCase | PascalCase.kt |
| Swift | camelCase | PascalCase | PascalCase.swift |

### Campos JSON API
- Usar **snake_case** para campos JSON (ej: `created_at`, `video_url`)
- Frontend/Mobile mapean a camelCase internamente

---

## Testing

### Backend (pytest)
```bash
cd Backend
make test
# o dentro del container:
make shell
pytest app/tests/
```

Archivos de test:
- `app/tests/test_course_rating_service.py`
- `app/tests/test_rating_db_constraints.py`
- `app/tests/test_rating_endpoints.py`
- `app/test_main.py`

### Frontend (Vitest + React Testing Library)
```bash
cd Frontend
yarn test
```

Archivos de test:
- `src/components/Course/__test__/Course.test.tsx`
- `src/components/VideoPlayer/VideoPlayer.test.tsx`
- `src/components/StarRating/__tests__/StarRating.test.tsx`

### Mobile
- **Android**: JUnit tests en `app/src/test/`
- **iOS**: XCTest en `PlatziFlixiOSTests/`

---

## Funcionalidades Implementadas

| Funcionalidad | Backend | Frontend | Android | iOS |
|---------------|:-------:|:--------:|:-------:|:---:|
| Catálogo de cursos | ✅ | ✅ | ✅ | ✅ |
| Detalle de curso | ✅ | ✅ | 🔜 | 🔜 |
| Lista de lecciones | ✅ | ✅ | - | - |
| Reproductor de video | ✅ | ✅ | - | - |
| Sistema de ratings | ✅ | ✅ | - | - |
| Health checks | ✅ | - | - | - |
| Error handling | ✅ | ✅ | ✅ | ✅ |
| Loading states | - | ✅ | ✅ | ✅ |
| Soft delete | ✅ | - | - | - |
| Tests automatizados | ✅ | ✅ | ✅ | ✅ |

---

## Archivos Clave por Componente

### Backend
| Archivo | Propósito |
|---------|-----------|
| `app/main.py` | FastAPI app, routers, CORS |
| `app/core/config.py` | Settings (Pydantic) |
| `app/db/base.py` | Engine SQLAlchemy, SessionLocal |
| `app/services/course_service.py` | Lógica de negocio cursos |
| `app/models/*.py` | Modelos SQLAlchemy |
| `app/schemas/rating.py` | Pydantic schemas ratings |
| `Makefile` | Comandos de desarrollo |

### Frontend
| Archivo | Propósito |
|---------|-----------|
| `src/app/layout.tsx` | Layout raíz, fonts, metadata |
| `src/app/page.tsx` | Home, fetch cursos |
| `src/components/Course/Course.tsx` | Card de curso |
| `src/components/StarRating/StarRating.tsx` | Sistema 5 estrellas |
| `src/services/ratingsApi.ts` | Cliente HTTP para ratings |
| `src/types/index.ts` | TypeScript interfaces |
| `src/styles/vars.scss` | Variables SCSS globales |

### Android
| Archivo | Propósito |
|---------|-----------|
| `MainActivity.kt` | Entry point |
| `data/network/ApiService.kt` | Retrofit interface |
| `data/network/NetworkModule.kt` | Retrofit config |
| `domain/models/Course.kt` | Domain model |
| `presentation/viewmodel/CourseListViewModel.kt` | ViewModel |
| `presentation/screen/CourseListScreen.kt` | UI Compose |
| `di/AppModule.kt` | Dependency injection |

### iOS
| Archivo | Propósito |
|---------|-----------|
| `PlatziFlixiOSApp.swift` | Entry point |
| `Services/NetworkManager.swift` | URLSession wrapper |
| `Domain/Models/Course.swift` | Domain model |
| `Presentation/ViewModels/CourseListViewModel.swift` | ViewModel |
| `Presentation/Views/CourseListView.swift` | SwiftUI view |
| `Data/Repositories/RemoteCourseRepository.swift` | API repository |

---

## Consideraciones de Desarrollo

1. **Docker obligatorio** para el backend - PostgreSQL y API corren en containers
2. **Ejecutar comandos en container**: Usar `make shell` o comandos del Makefile
3. **TypeScript strict** habilitado en Frontend
4. **Testing requerido** para nuevas funcionalidades
5. **Migraciones Alembic** para cualquier cambio de esquema BD
6. **Server Components** por defecto en Next.js (usar `"use client"` solo si necesario)
7. **API REST** es la única fuente de datos para Frontend y Mobile
8. **Soft delete** - No borrar registros, usar `deleted_at`

---

## Flujo de Desarrollo Típico

```bash
# 1. Iniciar backend
cd Backend && make start

# 2. Verificar que esté corriendo
curl http://localhost:8000/health

# 3. Iniciar frontend (otra terminal)
cd Frontend && yarn dev

# 4. Desarrollo iterativo
# - Backend tiene hot reload automático
# - Frontend tiene Fast Refresh

# 5. Ejecutar tests antes de commit
cd Backend && make test
cd Frontend && yarn test

# 6. Detener servicios
cd Backend && make stop
```

---

## Troubleshooting

### Backend no inicia
```bash
# Verificar containers
docker ps -a

# Ver logs
cd Backend && make logs

# Reiniciar
cd Backend && make restart
```

### Error de conexión a BD
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Recrear containers
cd Backend && make stop && make start
```

### Migraciones fallidas
```bash
# Ver estado actual
cd Backend && make shell
alembic current

# Aplicar migraciones pendientes
alembic upgrade head
```

### Frontend no conecta con API
- Verificar que backend esté en http://localhost:8000
- Revisar CORS en `app/main.py`
- Verificar `cache: "no-store"` en fetch calls

---

Esta documentación sirve como memoria completa del proyecto Platziflix para continuar el desarrollo en cualquier momento.
