import { Stack } from 'expo-router';
import { View } from 'react-native';
import 'react-native-reanimated';
import "../global.css"
import Providers from '@/providers/QueryProvider';
import { PortalHost } from '@rn-primitives/portal';

export const unstable_settings = {
    anchor: '(tabs)',
};

export default function RootLayout() {
    return (
        <>
            <Providers>
                <View className="flex-1 pt-10">
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: 'transparent' },
                        }}
                    />
                </View>
            </Providers>
            <PortalHost />
        </>
    );
}
