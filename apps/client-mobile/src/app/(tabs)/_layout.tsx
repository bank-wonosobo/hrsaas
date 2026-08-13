import { Tabs } from "expo-router";
import { Calendar, Home, LucideIcon, User2 } from "lucide-react-native";
import { View } from "react-native";

const ACTIVE_COLOR = "#3f9aae";
const INACTIVE_COLOR = "#9ca3af";

function TabIcon({
  focused,
  icon: Icon,
}: {
  focused: boolean;
  icon: LucideIcon;
}) {
  return (
    <View
      style={{
        width: 44,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? "#3f9aae1f" : "transparent",
      }}
    >
      <Icon
        size={22}
        color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
        strokeWidth={focused ? 2.4 : 2}
      />
    </View>
  );
}

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarLabelStyle: {
          fontFamily: "Poppins_500Medium",
          width: "100%",
          fontSize: 10,
          marginTop: 4,
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: "#fff",
          elevation: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 66,
          paddingBottom: 8,
          paddingTop: 10,
          paddingHorizontal: 12,
          shadowColor: "#006D77",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Home} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Kehadiran Harian",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Calendar} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={User2} />
          ),
        }}
      />
    </Tabs>
  );
}
