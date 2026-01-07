import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, X, Bell, User as UserIcon, Info } from 'lucide-react-native';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../services/supabase';
import { Profile } from '../types';
import { colors, spacing, fontSize, borderRadius, fontWeight, shadows } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MainScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      router.replace('/profile');
    } else {
      loadProfiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const loadProfiles = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);

      // Obtener IDs de usuarios ya likeados
      const { data: likedUsers } = await supabase
        .from('likes')
        .select('liked_id')
        .eq('liker_id', user.id);

      const likedIds = likedUsers?.map((like) => like.liked_id) || [];

      // Obtener perfiles disponibles
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      // Filtrar por preferencias
      if (profile.interested_in === 'hombres') {
        query = query.eq('gender', 'hombre');
      } else if (profile.interested_in === 'mujeres') {
        query = query.eq('gender', 'mujer');
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filtrar usuarios ya likeados
      const availableProfiles = data?.filter(
        (p) => !likedIds.includes(p.user_id)
      ) || [];

      setProfiles(availableProfiles);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los perfiles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (currentIndex >= profiles.length) return;

    const likedProfile = profiles[currentIndex];
    
    try {
      // Guardar like
      const { error: likeError } = await supabase
        .from('likes')
        .insert({
          liker_id: user!.id,
          liked_id: likedProfile.user_id,
        });

      if (likeError) throw likeError;

      // Verificar si es un match
      const { data: reciprocalLike } = await supabase
        .from('likes')
        .select('*')
        .eq('liker_id', likedProfile.user_id)
        .eq('liked_id', user!.id)
        .single();

      if (reciprocalLike) {
        // Es un match!
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: user!.id,
            user2_id: likedProfile.user_id,
            notified_user1: true,
            notified_user2: false,
          });

        if (matchError) throw matchError;

        // Crear notificación para el otro usuario
        await supabase.from('notifications').insert({
          user_id: likedProfile.user_id,
          type: 'match',
          from_user_id: user!.id,
          from_user_name: profile!.name,
          from_user_photo: profile!.photos[0],
          read: false,
        });

        Alert.alert(
          '¡Match! 💜',
          `¡Tienes un match con ${likedProfile.name}!`,
          [{ text: 'Genial!', style: 'default' }]
        );
      } else {
        // Solo like, crear notificación
        await supabase.from('notifications').insert({
          user_id: likedProfile.user_id,
          type: 'like',
          from_user_id: user!.id,
          from_user_name: profile!.name,
          from_user_photo: profile!.photos[0],
          read: false,
        });
      }

      setCurrentIndex(currentIndex + 1);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo registrar el like: ' + error.message);
    }
  };

  const handleDislike = () => {
    setCurrentIndex(currentIndex + 1);
  };

  const goToProfile = () => {
    router.push('/profile');
  };

  const goToNotifications = () => {
    router.push('/notifications');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Heart size={32} color={colors.primary} fill={colors.primary} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Cargando perfiles...</Text>
        </View>
      </View>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToProfile}>
          <UserIcon size={28} color={colors.primary} />
        </TouchableOpacity>
        <Heart size={32} color={colors.primary} fill={colors.primary} />
        <TouchableOpacity onPress={goToNotifications}>
          <Bell size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {currentProfile ? (
        <>
          <View style={styles.cardContainer}>
            <View style={[styles.card, shadows.large]}>
              <Image
                source={{ uri: currentProfile.photos[0] }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardInfo}>
                <View>
                  <Text style={styles.cardName}>
                    {currentProfile.name}
                    {currentProfile.age && `, ${currentProfile.age}`}
                  </Text>
                  {currentProfile.bio && (
                    <Text style={styles.cardBio} numberOfLines={2}>
                      {currentProfile.bio}
                    </Text>
                  )}
                </View>
                <TouchableOpacity style={styles.infoButton}>
                  <Info size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.dislikeButton]}
              onPress={handleDislike}
            >
              <X size={32} color={colors.dislike} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.likeButton]}
              onPress={handleLike}
            >
              <Heart size={32} color={colors.like} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Heart size={64} color={colors.textLight} />
          <Text style={styles.emptyText}>No hay más perfiles por ahora</Text>
          <Text style={styles.emptySubtext}>Vuelve más tarde</Text>
          <TouchableOpacity style={styles.reloadButton} onPress={loadProfiles}>
            <Text style={styles.reloadButtonText}>Recargar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    height: SCREEN_HEIGHT * 0.65,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  cardBio: {
    fontSize: fontSize.md,
    color: colors.textDark,
    marginTop: spacing.xs,
  },
  infoButton: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    ...shadows.medium,
  },
  dislikeButton: {
    borderWidth: 2,
    borderColor: colors.dislike,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: colors.like,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  reloadButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  reloadButtonText: {
    color: colors.textDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
