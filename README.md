# Tinder2 - Aplicación de Citas

Una aplicación móvil tipo Tinder desarrollada con React Native, Expo y Supabase.

## 🚀 Características

- **Autenticación**: Login y registro de usuarios con Supabase Auth
- **Perfil de Usuario**: Creación y edición de perfiles con fotos múltiples
- **Sistema de Swipe**: Like/Dislike de otros usuarios
- **Matching**: Detección automática de matches cuando dos usuarios se dan like mutuamente
- **Notificaciones**: Sistema de notificaciones para likes y matches
- **Carga de Fotos**: Subir fotos desde galería o tomar con la cámara
- **Base de Datos**: Supabase como backend con Row Level Security

## 🛠️ Tecnologías

- **React Native** - Framework para desarrollo móvil
- **Expo** - Plataforma de desarrollo y herramientas
- **TypeScript** - Lenguaje de programación tipado
- **NativeWind** - Tailwind CSS para React Native
- **Tailwind CSS** - Framework de utilidades CSS
- **Supabase** - Backend as a Service (autenticación, base de datos, storage)
- **Lucide Icons** - Biblioteca de iconos
- **Expo Router** - Navegación basada en archivos
- **Expo Image Picker** - Selección de imágenes y cámara

## 📋 Prerequisitos

- Node.js (v16 o superior)
- npm o yarn
- Cuenta en Supabase
- Expo CLI (opcional, se incluye en el proyecto)

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/siramong/tinder2.git
cd tinder2
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar `.env` con tus credenciales de Supabase:
```
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

5. Configurar la base de datos en Supabase siguiendo las instrucciones en `SUPABASE_SETUP.md`

6. Limpiar la caché de Metro Bundler (recomendado después de instalar):
```bash
npx expo start -c
```

## 🎨 Uso de NativeWind/Tailwind CSS

Este proyecto utiliza NativeWind para estilizar componentes con clases de Tailwind CSS.

### Ejemplos de uso:

```tsx
// Estilos básicos
<View className="flex-1 bg-white p-6">
  <Text className="text-2xl font-bold text-gray-900">Título</Text>
</View>

// Clases condicionales
<TouchableOpacity
  className={`bg-primary rounded-2xl p-4 ${loading ? 'opacity-60' : ''}`}
>
  <Text className="text-white text-lg font-semibold">Botón</Text>
</TouchableOpacity>

// Colores personalizados (definidos en tailwind.config.js)
<View className="bg-primary">  {/* #8B5CF6 */}
<View className="bg-like">     {/* #10B981 */}
<View className="bg-dislike">  {/* #EF4444 */}
```

### Configuración personalizada:

La paleta de colores se define en `tailwind.config.js`:
- `primary`: Morado vibrante (#8B5CF6)
- `like`: Verde (#10B981)
- `dislike`: Rojo (#EF4444)
- `superlike`: Azul (#3B82F6)

## 🚀 Ejecutar la aplicación

### Desarrollo

```bash
# Iniciar el servidor de desarrollo
npm start

# Para Android
npm run android

# Para iOS
npm run ios

# Para Web
npm run web
```

### Producción

```bash
# Build para Android
expo build:android

# Build para iOS
expo build:ios
```

## 📁 Estructura del Proyecto

```
tinder2/
├── app/                    # Rutas de navegación (Expo Router)
│   ├── _layout.tsx        # Layout raíz con AuthProvider
│   ├── index.tsx          # Página de inicio (redirige a login)
│   ├── login.tsx          # Ruta de login
│   ├── register.tsx       # Ruta de registro
│   ├── profile.tsx        # Ruta de perfil
│   ├── main.tsx           # Pantalla principal (swipe)
│   └── notifications.tsx  # Pantalla de notificaciones
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── constants/         # Constantes y tema
│   │   └── theme.ts       # Paleta de colores y estilos
│   ├── screens/           # Pantallas de la aplicación
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── MainScreen.tsx
│   │   └── NotificationsScreen.tsx
│   ├── services/          # Servicios y lógica de negocio
│   │   ├── supabase.ts    # Cliente de Supabase
│   │   └── AuthContext.tsx # Contexto de autenticación
│   ├── types/             # Tipos TypeScript
│   │   └── index.ts
│   └── utils/             # Utilidades
├── assets/                # Recursos estáticos
├── .env.example           # Ejemplo de variables de entorno
├── babel.config.js        # Configuración de Babel con NativeWind
├── metro.config.js        # Configuración de Metro con NativeWind
├── tailwind.config.js     # Configuración de Tailwind CSS
├── global.css             # Estilos globales de Tailwind
├── SUPABASE_SETUP.md      # Instrucciones de configuración de Supabase
└── package.json
```

## 🎨 Paleta de Colores

La aplicación utiliza una paleta de colores morada/púrpura en lugar del tradicional naranja/rosa de Tinder:

- **Primary**: #8B5CF6 (Morado vibrante)
- **Like**: #10B981 (Verde)
- **Dislike**: #EF4444 (Rojo)
- **Super Like**: #3B82F6 (Azul)

## 📱 Funcionalidades Principales

### Autenticación
- Login con email y contraseña
- Registro de nuevos usuarios
- Verificación de email
- Persistencia de sesión

### Perfil
- Nombre, biografía, fecha de nacimiento
- Género e intereses
- Hasta 6 fotos de perfil
- Subir desde galería o tomar con cámara

### Swipe y Matching
- Vista de tarjetas de usuarios compatibles
- Swipe para dar like o dislike
- Detección automática de matches
- Filtrado por preferencias de género

### Notificaciones
- Notificaciones de likes recibidos
- Notificaciones de nuevos matches
- Lista de notificaciones con fecha

## 🔐 Seguridad

- Autenticación mediante Supabase Auth
- Row Level Security (RLS) en todas las tablas
- Políticas de acceso granulares
- Variables de entorno para credenciales

## 📝 Base de Datos

La aplicación utiliza las siguientes tablas en Supabase:

- `profiles` - Perfiles de usuarios
- `likes` - Registro de likes entre usuarios
- `matches` - Matches confirmados
- `notifications` - Notificaciones de usuarios

Ver `SUPABASE_SETUP.md` para más detalles sobre el esquema.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios siguiendo el formato:
   ```
   emoji tipo_commit(archivo): Titulo
   - Cambio 1
   - Cambio 2
   ```
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Autores

- [@siramong](https://github.com/siramong)

## 🙏 Agradecimientos

- Tinder por la inspiración
- Supabase por el backend
- Expo por las herramientas de desarrollo
- La comunidad de React Native

---

> Editado para uso en IDX el 07/09/12
