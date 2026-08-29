import React from "react";
import {SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Colors} from "../../theme/colors";

const InfoRow = ({label, value}: {label: string; value?: string | number | null}) => value ? (
  <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
) : null;

const ProductDetailsScreen = ({navigation, route}: any) => {
  const product = route.params?.product;
  if (!product) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.black} />
        </TouchableOpacity>
        <View style={styles.hero}>
          <View style={styles.verifiedIcon}><Ionicons name="shield-checkmark" size={38} color={Colors.success} /></View>
          <Text style={styles.eyebrow}>AUTHENTIC PRODUCT</Text>
          <Text style={styles.title}>{product.productName}</Text>
          <Text style={styles.subtitle}>Batch {product.batchNumber}</Text>
          <View style={styles.badge}><View style={styles.dot} /><Text style={styles.badgeText}>Verified by TraceChain</Text></View>
        </View>
        <Text style={styles.sectionLabel}>PRODUCT DETAILS</Text>
        <View style={styles.infoContainer}>
          <InfoRow label="Current status" value={String(product.status).replaceAll("_", " ")} />
          <InfoRow label="Manufacturer" value={product.manufacturer?.name} />
          <InfoRow label="Supplier" value={product.supplier} />
          <InfoRow label="Processing plant" value={product.processingPlant} />
          <InfoRow label="Warehouse" value={product.warehouse} />
          <InfoRow label="Distributor" value={product.distributor} />
          <InfoRow label="Retailer" value={product.retailer} />
          <InfoRow label="Temperature" value={product.temperature != null ? `${product.temperature} °C` : null} />
        </View>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Timeline", {traces: product.traces || []})}>
          <Ionicons name="git-branch-outline" size={20} color={Colors.white} />
          <Text style={styles.buttonText}>View complete journey</Text>
          <Ionicons name="arrow-forward" size={19} color={Colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.background},
  container: {padding: 20, paddingBottom: 34},
  back: {width: 43, height: 43, borderRadius: 13, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center"},
  hero: {alignItems: "center", paddingVertical: 26},
  verifiedIcon: {width: 72, height: 72, borderRadius: 23, backgroundColor: Colors.successSoft, alignItems: "center", justifyContent: "center", marginBottom: 17},
  eyebrow: {fontSize: 10, fontWeight: "800", color: Colors.success, letterSpacing: 1.4},
  title: {fontSize: 26, fontWeight: "800", color: Colors.black, textAlign: "center", marginTop: 8},
  subtitle: {fontSize: 13, color: Colors.gray, marginTop: 5},
  badge: {flexDirection: "row", alignItems: "center", backgroundColor: Colors.successSoft, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, marginTop: 14},
  dot: {width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.success, marginRight: 6},
  badgeText: {color: Colors.success, fontWeight: "700", fontSize: 11},
  sectionLabel: {fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: Colors.gray, marginBottom: 9},
  infoContainer: {backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 18, paddingHorizontal: 17},
  row: {minHeight: 52, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: Colors.border},
  label: {color: Colors.gray, fontSize: 13},
  value: {fontWeight: "700", color: Colors.black, fontSize: 13, maxWidth: "58%", textAlign: "right", textTransform: "capitalize"},
  button: {height: 58, borderRadius: 15, marginTop: 22, backgroundColor: Colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10},
  buttonText: {color: Colors.white, fontWeight: "700", fontSize: 14},
});
