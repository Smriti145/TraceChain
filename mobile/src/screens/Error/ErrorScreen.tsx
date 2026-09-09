import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

const ErrorScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>

      <Text style={styles.heading}>
        Something went wrong
      </Text>

      <Text style={styles.text}>
        Please try again later.
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ErrorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  icon: {
    fontSize: 60,
  },

  heading: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: "700",
  },

  text: {
    marginTop: 10,
    color: "#64748B",
  },

  button: {
    marginTop: 30,
    backgroundColor: "#2563EB",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
