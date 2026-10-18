import { Stack } from 'expo-router';
import 'react-native-reanimated';
import "../global.css"
import Providers from '@/providers/QueryProvider';
import { PortalHost } from '@rn-primitives/portal';
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    return (
        <>
            <Providers>
                <GestureHandlerRootView className="flex-1 mt-20">
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: 'transparent' },
                        }}
                    />
                    <Toaster position="top-center" richColors closeButton />
                </GestureHandlerRootView>
            </Providers>
            <PortalHost />
        </>
    );
}
