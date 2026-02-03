// Teacher types
export interface Teacher {
  id: number;
  name: string;
  email: string;
}

// Course types
export interface Course {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  slug: string;
  // Campos opcionales de rating
  average_rating?: number; // 0.0 - 5.0
  total_ratings?: number; // Cantidad de ratings
}

// Class types
export interface Class {
  id: number;
  name: string; // Backend uses 'name' not 'title'
  description: string;
  video: string;
  duration?: number; // Optional - may be null/undefined
  slug: string;
  course_id?: number; // Course FK
  course_slug?: string; // Course slug for navigation
}

// Course Detail type
export interface CourseDetail extends Course {
  description: string;
  classes: Class[];
  teachers?: Teacher[]; // Teachers associated with the course
}

// Progress types
export interface Progress {
  progress: number; // seconds
  user_id: number;
}

// Quiz types
export interface QuizOption {
  id: number;
  answer: string;
  correct: boolean;
}

export interface Quiz {
  id: number;
  question: string;
  options: QuizOption[];
}

// Favorite types
export interface FavoriteToggle {
  course_id: number;
}