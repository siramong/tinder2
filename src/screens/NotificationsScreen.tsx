import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../services/AuthContext';
import { supabase } from '../services/supabase';
import { Notification } from '../types';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
    } catch (error: any) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const getNotificationIcon = (type: string) => {
    return (
      <Heart
        size={24}
        color={type === 'match' ? '#8B5CF6' : '#10B981'}
        fill={type === 'match' ? '#8B5CF6' : 'transparent'}
      />
    );
  };

  const getNotificationText = (notification: Notification) => {
    if (notification.type === 'match') {
      return `¡Tienes un match con ${notification.from_user_name}!`;
    } else {
      return `${notification.from_user_name} te ha dado like`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `Hace ${diffMinutes} minutos`;
      }
      return `Hace ${diffHours} horas`;
    } else if (diffDays === 1) {
      return 'Ayer';
    } else {
      return `Hace ${diffDays} días`;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-4 shadow-sm">
      <View className="mr-4">{getNotificationIcon(item.type)}</View>
      {item.from_user_photo && (
        <Image
          source={{ uri: item.from_user_photo }}
          className="w-12 h-12 rounded-full mr-4"
        />
      )}
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">
          {getNotificationText(item)}
        </Text>
        <Text className="text-sm text-gray-600 mt-1">{formatDate(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={28} color="#111827" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Notificaciones</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-xl font-semibold text-gray-900 mt-6 text-center">
            Cargando notificaciones...
          </Text>
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Heart size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-900 mt-6 text-center">
            No tienes notificaciones
          </Text>
          <Text className="text-base text-gray-600 mt-2 text-center">
            Cuando alguien te dé like, aparecerá aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-6"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
            />
          }
        />
      )}
    </View>
  );
}
