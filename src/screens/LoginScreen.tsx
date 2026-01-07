import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useAuth } from '../services/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-12">
          <Heart size={64} color="#8B5CF6" fill="#8B5CF6" />
          <Text className="text-5xl font-bold text-gray-900 mt-4">
            Bienvenido
          </Text>
          <Text className="text-base text-gray-600 mt-1">
            Encuentra tu match perfecto
          </Text>
        </View>

        <View className="w-full">
          <TextInput
            className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 mb-4 border border-gray-200"
            placeholder="Correo electrónico"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 mb-4 border border-gray-200"
            placeholder="Contraseña"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            className={`bg-primary rounded-2xl p-4 items-center mt-4 ${loading ? 'opacity-60' : ''}`}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white text-lg font-semibold">
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-6 items-center"
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-gray-600 text-base">
              ¿No tienes cuenta?{' '}
              <Text className="text-primary font-bold">Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
