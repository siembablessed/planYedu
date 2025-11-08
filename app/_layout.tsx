import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PlannerContext } from "@/contexts/PlannerContext";
import { AuthContext, useAuth } from "@/contexts/AuthContext";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // For now, allow app to work without auth (will show tabs directly)
  // Once Supabase is configured, uncomment the auth check below
  const requireAuth = false; // Set to true when Supabase is configured

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      {requireAuth && !isAuthenticated ? (
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext>
        <PlannerContext>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </PlannerContext>
      </AuthContext>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
