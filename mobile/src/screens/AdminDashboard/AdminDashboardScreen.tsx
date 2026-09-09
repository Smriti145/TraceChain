import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

const AdminDashboardScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>
        Admin Dashboard
      </Text>

      <ScrollView>
        <View style={styles.card}>
          <Text style={styles.value}>5,240</Text>
          <Text>Total Scans</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.value}>4,931</Text>
          <Text>Verified Products</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.value}>27</Text>
          <Text>Suspicious Activities</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.value}>1,320</Text>
          <Text>Active Users</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 25,
  },

  card: {
    backgroundColor: "#F8FAFC",
    padding: 25,
    borderRadius: 20,
    marginBottom: 15,
  },

  value: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2563EB",
  },
});
