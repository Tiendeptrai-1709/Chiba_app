import { Stack } from 'expo-router';
import { View } from 'react-native';
import 'react-native-reanimated';
import "../global.css"
import Providers from '@/providers/QueryProvider';
import { PortalHost } from '@rn-primitives/portal';
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Notification from '@/components/reuse-components/Notification';

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    return (
        <>
            <Providers>
                <GestureHandlerRootView className="flex-1 pt-10">
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: 'transparent' },
                        }}
                    />
                    <Notification/>
                    <Toaster position="top-center" richColors closeButton />
                </GestureHandlerRootView>
            </Providers>
            <PortalHost />
        </>
    );
}
