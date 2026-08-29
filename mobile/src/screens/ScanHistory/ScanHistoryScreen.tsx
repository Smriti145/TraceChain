import React from "react";
import {SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Colors} from "../../theme/colors";

const history = [
  {name: "Maize Premium Grade", batch: "FD-20260830-0042", status: "Verified", warning: false},
  {name: "Organic Sunflower Oil", batch: "FD-20260829-0038", status: "Review", warning: true},
  {name: "Milk Powder 500g", batch: "FD-20260829-0031", status: "Verified", warning: false},
  {name: "Tata Salt", batch: "FD-20260828-0027", status: "Verified", warning: false},
];

const ScanHistoryScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>TRACEABILITY LOG</Text>
      <Text style={styles.heading}>Scan history</Text>
      <View style={styles.searchShell}>
        <Ionicons name="search-outline" size={20} color={Colors.gray} />
        <TextInput style={styles.searchInput} placeholder="Search product or batch" placeholderTextColor={Colors.grayLight} />
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>128 scans in the last 30 days</Text>
        <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
      </View>
      <Text style={styles.today}>RECENT</Text>
      <View style={styles.card}>
        {history.map((item, index) => (
          <View key={item.batch} style={[styles.row, index < history.length - 1 && styles.border]}>
            <View style={styles.productIcon}><Ionicons name="cube-outline" size={21} color={Colors.primary} /></View>
            <View style={styles.copy}>
              <Text style={styles.product}>{item.name}</Text>
              <Text style={styles.meta}>{item.batch} · Today, 10:30</Text>
            </View>
            <View style={[styles.badge, item.warning && styles.warningBadge]}>
              <Text style={[styles.badgeText, item.warning && styles.warningText]}>{item.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  </SafeAreaView>
);

export default ScanHistoryScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.background},
  container: {padding: 20, paddingBottom: 35},
  eyebrow: {fontSize: 10, fontWeight: "700", letterSpacing: 1.3, color: Colors.primary, marginTop: 8},
  heading: {fontSize: 28, fontWeight: "800", color: Colors.black, marginTop: 5, marginBottom: 22},
  searchShell: {height: 54, borderRadius: 15, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 15},
  searchInput: {flex: 1, fontSize: 14, color: Colors.black, marginLeft: 10},
  summary: {marginTop: 14, marginBottom: 25, backgroundColor: Colors.primarySoft, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 13, flexDirection: "row", justifyContent: "space-between", alignItems: "center"},
  summaryText: {fontSize: 12, fontWeight: "600", color: Colors.primaryDark},
  today: {fontSize: 10, fontWeight: "700", color: Colors.gray, letterSpacing: 1.2, marginBottom: 10},
  card: {backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14},
  row: {flexDirection: "row", alignItems: "center", paddingVertical: 15},
  border: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  productIcon: {width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center"},
  copy: {flex: 1, marginLeft: 12},
  product: {fontSize: 14, fontWeight: "700", color: Colors.black},
  meta: {fontSize: 10, color: Colors.gray, marginTop: 5},
  badge: {backgroundColor: Colors.successSoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 15},
  badgeText: {color: Colors.success, fontSize: 10, fontWeight: "700"},
  warningBadge: {backgroundColor: Colors.warningSoft},
  warningText: {color: Colors.warning},
});
