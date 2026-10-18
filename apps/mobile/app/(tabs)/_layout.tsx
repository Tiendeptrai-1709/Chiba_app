import { Tabs } from "expo-router";
import { Home, MapPin, ReceiptText, User } from "lucide-react-native";


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#1E4620",
        tabBarInactiveTintColor: "#6B5E53",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Món ngon",
          tabBarIcon: ({ color }) => (
            <Home color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          title: "Cửa hàng",
          tabBarIcon: ({ color }) => (
            <MapPin color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color }) => (
            <ReceiptText color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => (
            <User color={color} />
          )
        }}
      />
    </Tabs>
  )
}