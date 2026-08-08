import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css"

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Text, View } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-xl font-bold text-red-500">
          Welcome to Nativewind! test
        </Text>
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
