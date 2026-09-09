import React, {useCallback, useMemo, useState} from "react";
import {ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useFocusEffect} from "@react-navigation/native";
import SvgIcon from "../../components/SvgIcon";
import {Colors} from "../../theme/colors";
import {CachedProduct, getCachedProducts} from "../../services/storage";

const ScanHistoryScreen = ({navigation}: any) => {
  const [history, setHistory] = useState<CachedProduct[]>([]);
  const [query, setQuery] = useState("");

  useFocusEffect(useCallback(() => {
    let active = true;
    getCachedProducts().then(items => { if (active) setHistory(items); });
    return () => { active = false; };
  }, []));

  const filteredHistory = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return history;
    return history.filter(item => [item.product.productName, item.product.category, item.product.batchNumber, item.product.productCode, item.product.barcode]
      .filter(Boolean).some(value => String(value).toLowerCase().includes(normalized)));
  }, [history, query]);

  return (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>TRACEABILITY LOG</Text>
      <Text style={styles.heading}>Scan history</Text>
      <View style={styles.searchShell}>
        <SvgIcon name="search-outline" size={20} color={Colors.gray} />
        <TextInput value={query} onChangeText={setQuery} style={styles.searchInput} placeholder="Search name, category, SKU or barcode" placeholderTextColor={Colors.grayLight} />
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>{history.length} verified product{history.length === 1 ? "" : "s"} saved offline</Text>
        <SvgIcon name="calendar-outline" size={18} color={Colors.primary} />
      </View>
      <Text style={styles.today}>RECENT</Text>
      <View style={styles.card}>
        {filteredHistory.length ? filteredHistory.map((item, index) => (
          <TouchableOpacity key={item.product.id || item.lookupKeys[0]} onPress={() => navigation.navigate("ProductDetails", {product: item.product, isOffline: true, cachedAt: item.cachedAt})} style={[styles.row, index < filteredHistory.length - 1 && styles.border]}>
            <View style={styles.productIcon}><SvgIcon name="cube-outline" size={21} color={Colors.primary} /></View>
            <View style={styles.copy}>
              <Text style={styles.category}>{item.product.category || "GENERAL"}</Text>
              <Text style={styles.product}>{item.product.productName}</Text>
              <Text style={styles.meta}>{item.product.batchNumber} · {new Date(item.cachedAt).toLocaleString()}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Saved</Text>
            </View>
          </TouchableOpacity>
        )) : <View style={styles.empty}><SvgIcon name="time-outline" size={28} color={Colors.primary} /><Text style={styles.emptyTitle}>{query ? "No matching scans" : "Your scan history is empty"}</Text><Text style={styles.emptyText}>Verified products will be available here, even when you are offline.</Text></View>}
      </View>
    </ScrollView>
  </SafeAreaView>
  );
};

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
  category: {fontSize: 8, color: Colors.primary, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase"},
  product: {fontSize: 14, fontWeight: "700", color: Colors.black},
  meta: {fontSize: 10, color: Colors.gray, marginTop: 5},
  badge: {backgroundColor: Colors.successSoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 15},
  badgeText: {color: Colors.success, fontSize: 10, fontWeight: "700"},
  empty: {alignItems: "center", paddingVertical: 34, paddingHorizontal: 24},
  emptyTitle: {fontSize: 14, fontWeight: "800", color: Colors.black, marginTop: 12},
  emptyText: {fontSize: 11, lineHeight: 17, color: Colors.gray, textAlign: "center", marginTop: 5},
});
