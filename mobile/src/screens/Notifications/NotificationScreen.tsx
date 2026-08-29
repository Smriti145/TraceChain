import React from "react";
import {SafeAreaView, ScrollView, StyleSheet, Text, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Colors} from "../../theme/colors";

const notifications = [
  {title: "Product verified successfully", detail: "Batch FD-20260830-0042 passed all checks.", time: "5 min", icon: "shield-checkmark-outline", color: Colors.success, tone: Colors.successSoft},
  {title: "Suspicious scan detected", detail: "An unusual scan location needs your review.", time: "25 min", icon: "warning-outline", color: Colors.warning, tone: Colors.warningSoft},
  {title: "Batch journey updated", detail: "Warehouse checkpoint was added successfully.", time: "1 hr", icon: "git-commit-outline", color: Colors.primary, tone: Colors.primarySoft},
];

const NotificationScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>ACTIVITY CENTRE</Text>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Notifications</Text>
        <View style={styles.count}><Text style={styles.countText}>3 new</Text></View>
      </View>
      <Text style={styles.today}>TODAY</Text>
      <View style={styles.card}>
        {notifications.map((item, index) => (
          <View key={item.title} style={[styles.row, index < notifications.length - 1 && styles.border]}>
            <View style={[styles.iconBox, {backgroundColor: item.tone}]}>
              <Ionicons name={item.icon} size={21} color={item.color} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.detail}>{item.detail}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  </SafeAreaView>
);

export default NotificationScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.background},
  container: {padding: 20},
  eyebrow: {fontSize: 10, fontWeight: "700", letterSpacing: 1.3, color: Colors.primary, marginTop: 8},
  headingRow: {flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5, marginBottom: 28},
  heading: {fontSize: 28, fontWeight: "800", color: Colors.black},
  count: {backgroundColor: Colors.primarySoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6},
  countText: {fontSize: 11, fontWeight: "700", color: Colors.primary},
  today: {fontSize: 10, fontWeight: "700", color: Colors.gray, letterSpacing: 1.2, marginBottom: 10},
  card: {backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 15},
  row: {flexDirection: "row", paddingVertical: 17, alignItems: "flex-start"},
  border: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  iconBox: {width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center"},
  copy: {flex: 1, marginLeft: 12},
  title: {fontSize: 14, fontWeight: "700", color: Colors.black},
  detail: {fontSize: 12, color: Colors.gray, lineHeight: 18, marginTop: 4},
  time: {fontSize: 10, color: Colors.grayLight, marginLeft: 8},
});
