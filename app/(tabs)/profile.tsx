import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  LogOut,
  LogIn,
  Settings,
  Mail,
  UserCircle,
  Shield,
  Bell,
  HelpCircle,
  AlertCircle,
} from "lucide-react-native";
import colors from "@/constants/colors";
import * as Haptics from "expo-haptics";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function ProfileScreen() {
  const { user, isAuthenticated, signOut, signIn } = useAuth();
  const router = useRouter();
  const isConfigured = isSupabaseConfigured();

  const handleSignOut = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert("Error", error.message || "Failed to sign out");
            }
          },
        },
      ]
    );
  };

  const handleSignIn = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/(auth)/login");
  };

  const handleSignUp = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/(auth)/signup");
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Profile & Settings",
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {isAuthenticated && user ? (
          <>
            {/* User Info Card */}
            <View style={styles.userCard}>
              <View style={styles.avatarContainer}>
                <UserCircle size={64} color={colors.primary} />
              </View>
              <Text style={styles.userName}>{user.name || "User"}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>

            {/* Account Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
                <View style={styles.menuItemLeft}>
                  <LogOut size={20} color={colors.error} />
                  <Text style={[styles.menuItemText, { color: colors.error }]}>
                    Sign Out
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Not Authenticated State */}
            <View style={styles.userCard}>
              <View style={styles.avatarContainer}>
                <User size={64} color={colors.textTertiary} />
              </View>
              <Text style={styles.userName}>Guest User</Text>
              <Text style={styles.userEmail}>
                Sign in to sync your data across devices
              </Text>
            </View>

            {/* Configuration Notice */}
            {!isConfigured && (
              <View style={styles.configNotice}>
                <AlertCircle size={20} color={colors.warning} />
                <View style={styles.configNoticeText}>
                  <Text style={styles.configNoticeTitle}>
                    Supabase Not Configured
                  </Text>
                  <Text style={styles.configNoticeBody}>
                    To enable authentication, create a .env file with your Supabase credentials.
                    See the README for setup instructions.
                  </Text>
                </View>
              </View>
            )}

            {/* Authentication Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Authentication</Text>
              <TouchableOpacity 
                style={[styles.button, !isConfigured && styles.buttonDisabled]} 
                onPress={handleSignIn}
                disabled={!isConfigured}
              >
                <LogIn size={20} color={colors.surface} />
                <Text style={styles.buttonText}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.buttonSecondary,
                  !isConfigured && styles.buttonDisabled
                ]}
                onPress={handleSignUp}
                disabled={!isConfigured}
              >
                <User size={20} color={colors.primary} />
                <Text style={[styles.buttonText, { color: colors.primary }]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Bell size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Shield size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Privacy & Security</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <HelpCircle size={20} color={colors.text} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>planYedu v1.0.0</Text>
          <Text style={styles.footerText}>Event Planning Made Easy</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  menuItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.text,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 8,
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.surface,
  },
  footer: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  configNotice: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning + "40",
    gap: 12,
  },
  configNoticeText: {
    flex: 1,
  },
  configNoticeTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 4,
  },
  configNoticeBody: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

