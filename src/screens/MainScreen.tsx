import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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

      const { data: likedUsers } = await supabase
        .from('likes')
        .select('liked_id')
        .eq('liker_id', user.id);

      const likedIds = likedUsers?.map((like) => like.liked_id) || [];

      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', user.id);

      if (profile.interested_in === 'hombres') {
        query = query.eq('gender', 'hombre');
      } else if (profile.interested_in === 'mujeres') {
        query = query.eq('gender', 'mujer');
      }

      const { data, error } = await query;

      if (error) throw error;

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
      const { error: likeError } = await supabase
        .from('likes')
        .insert({
          liker_id: user!.id,
          liked_id: likedProfile.user_id,
        });

      if (likeError) throw likeError;

      const { data: reciprocalLike } = await supabase
        .from('likes')
        .select('*')
        .eq('liker_id', likedProfile.user_id)
        .eq('liked_id', user!.id)
        .single();

      if (reciprocalLike) {
        const { error: matchError } = await supabase
          .from('matches')
          .insert({
            user1_id: user!.id,
            user2_id: likedProfile.user_id,
            notified_user1: true,
            notified_user2: false,
          });

        if (matchError) throw matchError;

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
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
          <Heart size={32} color="#8B5CF6" fill="#8B5CF6" />
        </View>
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-xl font-semibold text-gray-900 mt-6 text-center">
            Cargando perfiles...
          </Text>
        </View>
      </View>
    );
  }

  const currentProfile = profiles[currentIndex];

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
        <TouchableOpacity onPress={goToProfile}>
          <UserIcon size={28} color="#8B5CF6" />
        </TouchableOpacity>
        <Heart size={32} color="#8B5CF6" fill="#8B5CF6" />
        <TouchableOpacity onPress={goToNotifications}>
          <Bell size={28} color="#8B5CF6" />
        </TouchableOpacity>
      </View>

      {currentProfile ? (
        <>
          <View className="flex-1 justify-center items-center px-6">
            <View 
              className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg"
              style={{ width: SCREEN_WIDTH - 48, height: SCREEN_HEIGHT * 0.65 }}
            >
              <Image
                source={{ uri: currentProfile.photos[0] }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 left-0 right-0 p-6 bg-black/50 flex-row justify-between items-end">
                <View>
                  <Text className="text-white text-2xl font-bold">
                    {currentProfile.name}
                    {currentProfile.age && `, ${currentProfile.age}`}
                  </Text>
                  {currentProfile.bio && (
                    <Text className="text-white text-base mt-1" numberOfLines={2}>
                      {currentProfile.bio}
                    </Text>
                  )}
                </View>
                <TouchableOpacity className="bg-white rounded-full p-2">
                  <Info size={24} color="#8B5CF6" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="flex-row justify-center items-center py-8 gap-8">
            <TouchableOpacity
              className="w-16 h-16 rounded-full justify-center items-center bg-white border-2 border-dislike shadow-md"
              onPress={handleDislike}
            >
              <X size={32} color="#EF4444" />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-16 h-16 rounded-full justify-center items-center bg-white border-2 border-like shadow-md"
              onPress={handleLike}
            >
              <Heart size={32} color="#10B981" />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          <Heart size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-900 mt-6 text-center">
            No hay más perfiles por ahora
          </Text>
          <Text className="text-base text-gray-600 mt-2 text-center">
            Vuelve más tarde
          </Text>
          <TouchableOpacity
            className="mt-8 bg-primary px-8 py-4 rounded-2xl"
            onPress={loadProfiles}
          >
            <Text className="text-white text-base font-semibold">Recargar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
