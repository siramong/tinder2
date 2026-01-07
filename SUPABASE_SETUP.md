# Configuración de Supabase

Este documento describe cómo configurar la base de datos en Supabase para la aplicación.

## Prerequisitos

1. Crear una cuenta en [Supabase](https://supabase.com)
2. Crear un nuevo proyecto en Supabase

## Configuración de Variables de Entorno

1. Copia el archivo `.env.example` a `.env`
2. Obtén tus credenciales de Supabase:
   - Ve a tu proyecto en Supabase
   - Navega a Settings > API
   - Copia la URL del proyecto y la clave anónima
3. Actualiza el archivo `.env` con tus credenciales

```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

## Esquema de Base de Datos

### 1. Tabla: profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  birthday DATE NOT NULL,
  gender TEXT CHECK (gender IN ('hombre', 'mujer', 'otro')) NOT NULL,
  interested_in TEXT CHECK (interested_in IN ('hombres', 'mujeres', 'todos')) NOT NULL,
  photos TEXT[] NOT NULL DEFAULT '{}',
  location TEXT,
  age INTEGER GENERATED ALWAYS AS (
    DATE_PART('year', AGE(birthday))
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_interested_in ON profiles(interested_in);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver todos los perfiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuarios pueden insertar su propio perfil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### 2. Tabla: likes

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  liker_id UUID REFERENCES auth.users NOT NULL,
  liked_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(liker_id, liked_id)
);

-- Índices
CREATE INDEX idx_likes_liker_id ON likes(liker_id);
CREATE INDEX idx_likes_liked_id ON likes(liked_id);

-- RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propios likes"
  ON likes FOR SELECT
  USING (auth.uid() = liker_id OR auth.uid() = liked_id);

CREATE POLICY "Usuarios pueden crear likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = liker_id);
```

### 3. Tabla: matches

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES auth.users NOT NULL,
  user2_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notified_user1 BOOLEAN DEFAULT FALSE,
  notified_user2 BOOLEAN DEFAULT FALSE,
  UNIQUE(user1_id, user2_id)
);

-- Índices
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);

-- RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propios matches"
  ON matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Sistema puede crear matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Sistema puede actualizar matches"
  ON matches FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);
```

### 4. Tabla: notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT CHECK (type IN ('like', 'match')) NOT NULL,
  from_user_id UUID REFERENCES auth.users NOT NULL,
  from_user_name TEXT NOT NULL,
  from_user_photo TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema puede crear notificaciones"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar sus notificaciones"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

## Configuración de Storage

### Crear bucket para fotos

1. Ve a Storage en tu proyecto de Supabase
2. Crea un nuevo bucket llamado `photos`
3. Configura las políticas de acceso:

```sql
-- Política para permitir que usuarios autenticados suban fotos
CREATE POLICY "Usuarios pueden subir sus propias fotos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir acceso público de lectura
CREATE POLICY "Fotos son públicamente accesibles"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Política para permitir que usuarios eliminen sus propias fotos
CREATE POLICY "Usuarios pueden eliminar sus propias fotos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Funciones y Triggers (Opcional)

### Función para actualizar updated_at automáticamente

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Verificación

Después de ejecutar todos los scripts SQL, verifica que:

1. Todas las tablas estén creadas correctamente
2. Los índices estén en su lugar
3. Las políticas RLS estén habilitadas y configuradas
4. El bucket de storage esté creado y configurado
5. Las variables de entorno estén correctamente configuradas en tu aplicación

## Datos de Prueba (Opcional)

Para desarrollo, puedes insertar datos de prueba después de registrar un usuario:

```sql
-- Nota: Reemplaza 'user-uuid-aqui' con un UUID real de auth.users
INSERT INTO profiles (user_id, name, bio, birthday, gender, interested_in, photos)
VALUES 
  ('user-uuid-aqui', 'Usuario de Prueba', 'Bio de prueba', '1995-01-01', 'hombre', 'mujeres', 
   ARRAY['https://via.placeholder.com/400x600']);
```
