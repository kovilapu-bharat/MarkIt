import { Tabs } from 'expo-router';
import React from 'react';

import { AnimatedTabBar } from '@/components/animated-tab-bar';
import ResultsOverlay from '@/components/ResultsOverlay';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
          },
        }}
        tabBar={(props) => <AnimatedTabBar {...props} />}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Date-wise',
          }}
        />
        <Tabs.Screen
          name="predict"
          options={{
            title: 'Goals',
          }}
        />
      </Tabs>
      <ResultsOverlay />
    </>
  );
}
