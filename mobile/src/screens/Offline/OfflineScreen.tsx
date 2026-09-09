import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

const OfflineScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.icon}>📡</Text>
      </View>

      <Text style={styles.heading}>
        No Internet Connection
      </Text>

      <Text style={styles.text}>
        Please check your network connection.
      </Text>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Retry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OfflineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 50,
  },

  heading: {
    marginTop: 25,
    fontSize: 24,
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
