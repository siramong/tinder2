import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
import { colors, spacing, fontSize, borderRadius, fontWeight, shadows } from '../constants/theme';

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
      
      // Crear un nombre único para el archivo
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Obtener el blob del archivo
      const response = await fetch(uri);
      const blob = await response.blob();

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      // Obtener URL pública
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <User size={48} color={colors.primary} />
        <Text style={styles.title}>Tu Perfil</Text>
        <Text style={styles.subtitle}>Cuéntanos sobre ti</Text>
      </View>

      {/* Fotos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fotos (máximo 6)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.photo} />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePhoto(index)}
              >
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 6 && (
            <>
              <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                <ImageIcon size={32} color={colors.primary} />
                <Text style={styles.addPhotoText}>Galería</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addPhotoButton} onPress={takePhoto}>
                <Camera size={32} color={colors.primary} />
                <Text style={styles.addPhotoText}>Cámara</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

      {/* Información básica */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Básica</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor={colors.textLight}
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Fecha de nacimiento (DD/MM/AAAA)"
          placeholderTextColor={colors.textLight}
          value={birthday}
          onChangeText={setBirthday}
          editable={!loading}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Biografía"
          placeholderTextColor={colors.textLight}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          editable={!loading}
        />
      </View>

      {/* Género */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Género</Text>
        <View style={styles.optionsRow}>
          {['hombre', 'mujer', 'otro'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                gender === option && styles.optionButtonActive,
              ]}
              onPress={() => setGender(option as any)}
            >
              <Text
                style={[
                  styles.optionText,
                  gender === option && styles.optionTextActive,
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Interesado en */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interesado en</Text>
        <View style={styles.optionsRow}>
          {['hombres', 'mujeres', 'todos'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                interestedIn === option && styles.optionButtonActive,
              ]}
              onPress={() => setInterestedIn(option as any)}
            >
              <Text
                style={[
                  styles.optionText,
                  interestedIn === option && styles.optionTextActive,
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Guardando...' : 'Guardar Perfil'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  photosScroll: {
    flexDirection: 'row',
  },
  photoContainer: {
    marginRight: spacing.md,
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 160,
    borderRadius: borderRadius.lg,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
    ...shadows.small,
  },
  addPhotoButton: {
    width: 120,
    height: 160,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  addPhotoText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    fontWeight: fontWeight.medium,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  optionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  optionTextActive: {
    color: colors.textDark,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.textDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});
