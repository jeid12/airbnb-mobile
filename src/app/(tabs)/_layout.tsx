import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={name} size={24} color={color} />
      {focused && <View style={[styles.dot, { backgroundColor: Colors.text }]} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'search' : 'search-outline'} color={color} focused={false} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlists',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'heart' : 'heart-outline'} color={color} focused={false} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'airplane' : 'airplane-outline'} color={color} focused={false} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} focused={false} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person-circle' : 'person-circle-outline'} color={color} focused={false} />
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
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: -4,
  },
  iconWrap: {
    alignItems: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
