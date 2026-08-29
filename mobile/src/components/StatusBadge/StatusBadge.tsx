import React from "react";
import {View, Text, StyleSheet} from "react-native";

const StatusBadge = ({status}: any) => {
  const color =
    status === "Verified"
      ? "#22C55E"
      : status === "Warning"
      ? "#F59E0B"
      : "#EF4444";

  return (
    <View
      style={[
        styles.badge,
        {backgroundColor: `${color}20`},
      ]}>
      <Text style={[styles.text, {color}]}>
        {status}
      </Text>
    </View>
  );
};

export default StatusBadge;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  text: {
    fontWeight: "600",
  },
});