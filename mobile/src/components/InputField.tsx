import React from "react";
import {StyleSheet, Text, TextInput, TextInputProps, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import {Colors} from "../theme/colors";

type Props = {
  placeholder: string;
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  icon?: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
};

export default function InputField({
  placeholder,
  secureTextEntry,
  value,
  onChangeText,
  label,
  icon,
  keyboardType,
  autoCapitalize,
}: Props) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputShell}>
        {icon ? <Ionicons name={icon} size={19} color={Colors.gray} /> : null}
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={Colors.grayLight}
          style={styles.input}
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {marginBottom: 18},
  label: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputShell: {
    height: 56,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: Colors.black,
    fontSize: 15,
    marginLeft: 11,
  },
});
