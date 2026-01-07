import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, User, Trash2 } from 'lucide-react-native';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../services/supabase';

export default function ProfileScreen() {
  const { profile, updateProfile, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<'hombre' | 'mujer' | 'otro'>('hombre');
  const [interestedIn, setInterestedIn] = useState<'hombres' | 'mujeres' | 'todos'>('mujeres');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setBio(profile.bio || '');
      setBirthday(profile.birthday || '');
      setGender(profile.gender || 'hombre');
      setInterestedIn(profile.interested_in || 'mujeres');
      setPhotos(profile.photos || []);
    }
  }, [profile]);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert('Permisos necesarios', 'Necesitamos permisos para acceder a tu cámara y galería');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user) return;
    if (photos.length >= 6) {
      Alert.alert('Límite alcanzado', 'Puedes subir máximo 6 fotos');
      return;
    }

    try {
      setLoading(true);
      
      const fileExt = uri.split('.').pop() || 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      setPhotos([...photos, publicUrl]);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo subir la foto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = (index: number) => {
    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de que quieres eliminar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const newPhotos = [...photos];
            newPhotos.splice(index, 1);
            setPhotos(newPhotos);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name || !birthday || photos.length === 0) {
      Alert.alert('Error', 'Por favor completa todos los campos y sube al menos una foto');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name,
        bio,
        birthday,
        gender,
        interested_in: interestedIn,
        photos,
      });
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
      router.push('/main');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6">
      <View className="items-center mb-8">
        <User size={48} color="#8B5CF6" />
        <Text className="text-3xl font-bold text-gray-900 mt-2">Tu Perfil</Text>
        <Text className="text-base text-gray-600 mt-1">Cuéntanos sobre ti</Text>
      </View>

      {/* Fotos */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Fotos (máximo 6)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {photos.map((photo, index) => (
            <View key={index} className="mr-4 relative">
              <Image source={{ uri: photo }} className="w-30 h-40 rounded-2xl" />
              <TouchableOpacity
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
                onPress={() => deletePhoto(index)}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 6 && (
            <>
              <TouchableOpacity
                className="w-30 h-40 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 justify-center items-center mr-4"
                onPress={pickImage}
              >
                <ImageIcon size={32} color="#8B5CF6" />
                <Text className="text-primary text-sm mt-1 font-medium">Galería</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-30 h-40 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-300 justify-center items-center mr-4"
                onPress={takePhoto}
              >
                <Camera size={32} color="#8B5CF6" />
                <Text className="text-primary text-sm mt-1 font-medium">Cámara</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

      {/* Información básica */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Información Básica</Text>
        
        <TextInput
          className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 mb-4 border border-gray-200"
          placeholder="Nombre"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <TextInput
          className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 mb-4 border border-gray-200"
          placeholder="Fecha de nacimiento (DD/MM/AAAA)"
          placeholderTextColor="#9CA3AF"
          value={birthday}
          onChangeText={setBirthday}
          editable={!loading}
        />

        <TextInput
          className="bg-gray-50 rounded-lg p-4 text-base text-gray-900 mb-4 border border-gray-200 h-24"
          placeholder="Biografía"
          placeholderTextColor="#9CA3AF"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      {/* Género */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Género</Text>
        <View className="flex-row gap-2">
          {(['hombre', 'mujer', 'otro'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              className={`flex-1 p-4 rounded-lg border items-center ${
                gender === option
                  ? 'bg-primary border-primary'
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() => setGender(option)}
            >
              <Text
                className={`text-base font-medium ${
                  gender === option ? 'text-white' : 'text-gray-900'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Interesado en */}
      <View className="mb-8">
        <Text className="text-lg font-semibold text-gray-900 mb-4">Interesado en</Text>
        <View className="flex-row gap-2">
          {(['hombres', 'mujeres', 'todos'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              className={`flex-1 p-4 rounded-lg border items-center ${
                interestedIn === option
                  ? 'bg-primary border-primary'
                  : 'bg-gray-50 border-gray-200'
              }`}
              onPress={() => setInterestedIn(option)}
            >
              <Text
                className={`text-base font-medium ${
                  interestedIn === option ? 'text-white' : 'text-gray-900'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        className={`bg-primary rounded-2xl p-4 items-center mt-4 mb-12 ${loading ? 'opacity-60' : ''}`}
        onPress={handleSave}
        disabled={loading}
      >
        <Text className="text-white text-lg font-semibold">
          {loading ? 'Guardando...' : 'Guardar Perfil'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
