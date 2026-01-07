import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/services/AuthContext";

function RootLayoutNav() {
  const { user, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "register";

    if (!user && !inAuthGroup) {
      // Redirigir a login si no está autenticado
      router.replace("/login");
    } else if (user && !profile && segments[0] !== "profile") {
      // Redirigir a crear perfil si está autenticado pero no tiene perfil
      router.replace("/profile");
    } else if (user && profile && inAuthGroup) {
      // Redirigir a main si está autenticado y tiene perfil
      router.replace("/main");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="main" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
