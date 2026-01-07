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

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert(
        'Éxito',
        'Cuenta creada exitosamente. Por favor verifica tu correo electrónico.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.back();
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
            Crear Cuenta
          </Text>
          <Text className="text-base text-gray-600 mt-1">
            Únete y encuentra el amor
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

          <TextInput
            className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 mb-4 border border-gray-200"
            placeholder="Confirmar contraseña"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            className={`bg-primary rounded-2xl p-4 items-center mt-4 ${loading ? 'opacity-60' : ''}`}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text className="text-white text-lg font-semibold">
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-6 items-center"
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-gray-600 text-base">
              ¿Ya tienes cuenta?{' '}
              <Text className="text-primary font-bold">Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
