import { Stack } from 'expo-router';
import 'react-native-reanimated';
import "../global.css"
import Providers from '@/providers/QueryProvider';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, View } from 'react-native';


export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    return (
        <Providers>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: 'transparent' },
                }}
            />
        </Providers>
    );
}
