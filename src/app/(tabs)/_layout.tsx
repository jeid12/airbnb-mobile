import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useUnreadCount } from '@/features/messages/hooks/useMessages';

function TabBarIcon({ name, color }: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

function InboxIcon({ color, focused }: { color: string; focused: boolean }) {
  const unread = useUnreadCount();
  return (
    <View>
      <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} size={24} color={color} />
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const role = (user?.role ?? 'GUEST') as string;
  const isAdmin = role === 'ADMIN';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>

      <Tabs.Screen
        name="home"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlists',
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'airplane' : 'airplane-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          href: isAdmin ? null : undefined,
          tabBarIcon: ({ color, focused }) => <InboxIcon color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
  },
  tabBarLabel: { fontSize: 10, fontWeight: '500' },
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: Colors.brand, borderRadius: 8,
    minWidth: 16, height: 16, paddingHorizontal: 3,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.white,
  },
  badgeText: { fontSize: 9, color: Colors.white, fontWeight: '700' },
});
