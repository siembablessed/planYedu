import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { Heart, User, UserCircle, Edit2, Save, User as UserIcon } from "lucide-react-native";
import colors from "@/constants/colors";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VOWS_STORAGE_KEY = "@planYedu:vows";

interface VowsData {
  mine: string;
  hers: string;
}

export default function VowsScreen() {
  const router = useRouter();
  const [vows, setVows] = useState<VowsData>({ mine: "", hers: "" });
  const [isEditing, setIsEditing] = useState({ mine: false, hers: false });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadVows();
  }, []);

  const loadVows = async () => {
    try {
      const data = await AsyncStorage.getItem(VOWS_STORAGE_KEY);
      if (data) {
        setVows(JSON.parse(data));
      }
    } catch (error) {
      console.error("Failed to load vows:", error);
    }
  };

  const saveVows = async (updatedVows: VowsData) => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(VOWS_STORAGE_KEY, JSON.stringify(updatedVows));
      setVows(updatedVows);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Failed to save vows:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (type: "mine" | "hers") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditing({ ...isEditing, [type]: true });
  };

  const handleSave = (type: "mine" | "hers") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsEditing({ ...isEditing, [type]: false });
    saveVows(vows);
  };

  const handleChange = (type: "mine" | "hers", text: string) => {
    setVows({ ...vows, [type]: text });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Our Wedding Vows",
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push("/(tabs)/profile");
              }}
              style={{ marginRight: 16 }}
            >
              <UserIcon size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Heart size={32} color={colors.pink} fill={colors.pink} />
          </View>
          <Text style={styles.headerTitle}>Our Wedding Vows</Text>
          <Text style={styles.headerSubtitle}>
            Write your heartfelt promises to each other
          </Text>
        </View>

        {/* Mine Section */}
        <View style={styles.vowSection}>
          <View style={styles.vowHeader}>
            <View style={styles.vowHeaderLeft}>
              <View style={[styles.avatar, styles.avatarMine]}>
                <UserCircle size={24} color={colors.primary} fill={colors.primary + "20"} />
              </View>
              <View>
                <Text style={styles.vowTitle}>My Vows</Text>
                <Text style={styles.vowSubtitle}>Your promises to her</Text>
              </View>
            </View>
            {!isEditing.mine ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit("mine")}
              >
                <Edit2 size={18} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={() => handleSave("mine")}
                disabled={isSaving}
              >
                <Save size={18} color={colors.success} />
              </TouchableOpacity>
            )}
          </View>
          {isEditing.mine ? (
            <TextInput
              style={[styles.vowText, styles.vowInput]}
              value={vows.mine}
              onChangeText={(text) => handleChange("mine", text)}
              placeholder="Write your vows here... Pour your heart out and express your love, commitment, and promises for your life together."
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          ) : (
            <View style={styles.vowCard}>
              {vows.mine ? (
                <Text style={styles.vowText}>{vows.mine}</Text>
              ) : (
                <Text style={styles.vowPlaceholder}>
                  Tap the edit icon to write your vows...
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Heart size={20} color={colors.pink} fill={colors.pink} />
          <View style={styles.dividerLine} />
        </View>

        {/* Hers Section */}
        <View style={styles.vowSection}>
          <View style={styles.vowHeader}>
            <View style={styles.vowHeaderLeft}>
              <View style={[styles.avatar, styles.avatarHers]}>
                <UserCircle size={24} color={colors.pink} fill={colors.pink + "20"} />
              </View>
              <View>
                <Text style={styles.vowTitle}>Her Vows</Text>
                <Text style={styles.vowSubtitle}>Her promises to you</Text>
              </View>
            </View>
            {!isEditing.hers ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit("hers")}
              >
                <Edit2 size={18} color={colors.pink} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={() => handleSave("hers")}
                disabled={isSaving}
              >
                <Save size={18} color={colors.success} />
              </TouchableOpacity>
            )}
          </View>
          {isEditing.hers ? (
            <TextInput
              style={[styles.vowText, styles.vowInput]}
              value={vows.hers}
              onChangeText={(text) => handleChange("hers", text)}
              placeholder="Write her vows here... Capture her promises, dreams, and commitment to your shared future."
              placeholderTextColor={colors.textTertiary}
              multiline
              textAlignVertical="top"
            />
          ) : (
            <View style={styles.vowCard}>
              {vows.hers ? (
                <Text style={styles.vowText}>{vows.hers}</Text>
              ) : (
                <Text style={styles.vowPlaceholder}>
                  Tap the edit icon to write her vows...
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
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
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 8,
  },
  headerIcon: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
  },
  vowSection: {
    marginBottom: 32,
  },
  vowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  vowHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMine: {
    backgroundColor: colors.primary + "15",
  },
  avatarHers: {
    backgroundColor: colors.pink + "15",
  },
  vowTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 2,
  },
  vowSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: colors.success + "15",
  },
  vowCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
  },
  vowText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
  },
  vowInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    minHeight: 200,
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
  },
  vowPlaceholder: {
    fontSize: 15,
    lineHeight: 26,
    color: colors.textTertiary,
    fontStyle: "italic",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  bottomSpacer: {
    height: 40,
  },
});

