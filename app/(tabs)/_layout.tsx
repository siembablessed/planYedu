import { Tabs } from "expo-router";
import {
  ListChecks,
  Wallet,
  Sparkles,
  Users,
} from "lucide-react-native";
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import colors from "@/constants/colors";

// Custom icon component with better styling
function TabIcon({
  Icon,
  active,
  size = 26,
}: {
  Icon: any;
  active: boolean;
  size?: number;
}) {
  return (
    <View
      style={[
        styles.iconContainer,
        active && styles.iconContainerActive,
      ]}
    >
      <Icon
        size={size}
        color={active ? colors.primary : colors.textTertiary}
        strokeWidth={active ? 2.5 : 2}
        fill={active ? colors.primary + "15" : "none"}
      />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 70,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 6,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600" as const,
          marginTop: 2,
          marginBottom: Platform.OS === "ios" ? 0 : 4,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Checklist",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={ListChecks} active={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Wallet} active={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI Help",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Sparkles} active={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="shared"
        options={{
          title: "Shared",
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Users} active={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  iconContainerActive: {
    backgroundColor: colors.primary + "10",
  },
});
