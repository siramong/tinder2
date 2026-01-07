// Tipos de datos principales de la aplicación

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  birthday: string;
  gender: 'hombre' | 'mujer' | 'otro';
  interested_in: 'hombres' | 'mujeres' | 'todos';
  photos: string[];
  location?: string;
  age?: number;
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  liker_id: string;
  liked_id: string;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  notified_user1: boolean;
  notified_user2: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'match';
  from_user_id: string;
  from_user_name: string;
  from_user_photo?: string;
  read: boolean;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
}
