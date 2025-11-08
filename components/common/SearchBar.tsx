import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Search, X } from "lucide-react-native";
import colors from "@/constants/colors";
import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  value?: string;
}

export default function SearchBar({ placeholder = "Search...", onSearch, value: controlledValue }: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (text: string) => {
    if (controlledValue === undefined) {
      setInternalValue(text);
    }
    onSearch(text);
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalValue("");
    }
    onSearch("");
  };

  return (
    <View style={styles.container}>
      <Search size={20} color={colors.textTertiary} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={handleChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 10,
  },
  clearButton: {
    padding: 4,
  },
});

