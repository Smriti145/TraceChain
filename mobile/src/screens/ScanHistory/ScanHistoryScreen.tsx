import React, {useCallback, useMemo, useState} from "react";
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useFocusEffect} from "@react-navigation/native";
import SvgIcon from "../../components/SvgIcon";
import {Colors} from "../../theme/colors";
import {type ScanEvent} from "../../services/storage";
import {loadScanHistory} from "../../services/scan.service";

const ScanHistoryScreen = ({navigation}: any) => {
  const [history, setHistory] = useState<ScanEvent[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [suspiciousCount, setSuspiciousCount] = useState(0);

  const refresh = useCallback(async (pullToRefresh = false) => {
    pullToRefresh ? setRefreshing(true) : setLoading(true);
    const result = await loadScanHistory();
    setHistory(result.events);
    setSuspiciousCount(result.suspiciousCount);
    setIsOffline(result.isOffline);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    let active = true;
    loadScanHistory().then(result => {
      if (!active) return;
      setHistory(result.events);
      setSuspiciousCount(result.suspiciousCount);
      setIsOffline(result.isOffline);
      setLoading(false);
    });
    return () => { active = false; };
  }, []));

  const filteredHistory = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return history;
    return history.filter(item => [item.product?.productName, item.product?.category, item.product?.batchNumber, item.product?.productCode, item.product?.barcode, item.result, item.suspiciousReason]
      .filter(Boolean).some(value => String(value).toLowerCase().includes(normalized)));
  }, [history, query]);

  return (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh(true)} tintColor={Colors.primary} />}>
      <Text style={styles.eyebrow}>TRACEABILITY LOG</Text>
      <Text style={styles.heading}>Scan history</Text>
      <View style={styles.searchShell}>
        <SvgIcon name="search-outline" size={20} color={Colors.gray} />
        <TextInput value={query} onChangeText={setQuery} style={styles.searchInput} placeholder="Search name, category, SKU or barcode" placeholderTextColor={Colors.grayLight} />
      </View>
      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryText}>{history.length} audited scan{history.length === 1 ? "" : "s"} · {suspiciousCount} flagged</Text>
          <Text style={styles.syncText}>{isOffline ? "Offline history · pending scans sync automatically" : "Database synced"}</Text>
        </View>
        <SvgIcon name={isOffline ? "cloud-offline-outline" : "shield-checkmark-outline"} size={19} color={isOffline ? Colors.warning : Colors.primary} />
      </View>
      <Text style={styles.today}>RECENT</Text>
      <View style={styles.card}>
        {loading ? <View style={styles.empty}><ActivityIndicator color={Colors.primary} /><Text style={styles.emptyText}>Loading secure audit history…</Text></View> : filteredHistory.length ? filteredHistory.map((item, index) => (
          <TouchableOpacity disabled={!item.product} key={item.id} onPress={() => navigation.navigate("ProductDetails", {product: item.product, isOffline: isOffline || item.networkStatus === "OFFLINE_SYNC", cachedAt: item.scannedAt})} style={[styles.row, index < filteredHistory.length - 1 && styles.border]}>
            <View style={[styles.productIcon, item.isSuspicious && styles.warningIcon]}><SvgIcon name={item.isSuspicious ? "warning-outline" : "cube-outline"} size={21} color={item.isSuspicious ? Colors.warning : Colors.primary} /></View>
            <View style={styles.copy}>
              <Text style={styles.category}>{item.product?.category || "UNRECOGNIZED CODE"}</Text>
              <Text style={styles.product}>{item.product?.productName || "Product not found"}</Text>
              <Text style={styles.meta}>{item.product?.batchNumber || item.result} · {new Date(item.scannedAt).toLocaleString()}</Text>
              {item.suspiciousReason ? <Text style={styles.reason}>{item.suspiciousReason.replaceAll("_", " ")}</Text> : null}
            </View>
            <View style={[styles.badge, item.isSuspicious && styles.warningBadge]}>
              <Text style={[styles.badgeText, item.isSuspicious && styles.warningBadgeText]}>{item.isSuspicious ? "Flagged" : item.networkStatus === "OFFLINE_SYNC" ? "Queued" : "Verified"}</Text>
            </View>
          </TouchableOpacity>
        )) : <View style={styles.empty}><SvgIcon name="time-outline" size={28} color={Colors.primary} /><Text style={styles.emptyTitle}>{query ? "No matching scans" : "Your audit history is empty"}</Text><Text style={styles.emptyText}>Every online scan is recorded in the database. Offline scans will appear here and sync later.</Text></View>}
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
  syncText: {fontSize: 9, color: Colors.gray, marginTop: 3},
  today: {fontSize: 10, fontWeight: "700", color: Colors.gray, letterSpacing: 1.2, marginBottom: 10},
  card: {backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14},
  row: {flexDirection: "row", alignItems: "center", paddingVertical: 15},
  border: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  productIcon: {width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center"},
  warningIcon: {backgroundColor: Colors.warningSoft},
  copy: {flex: 1, marginLeft: 12},
  category: {fontSize: 8, color: Colors.primary, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase"},
  product: {fontSize: 14, fontWeight: "700", color: Colors.black},
  meta: {fontSize: 10, color: Colors.gray, marginTop: 5},
  badge: {backgroundColor: Colors.successSoft, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 15},
  badgeText: {color: Colors.success, fontSize: 10, fontWeight: "700"},
  warningBadge: {backgroundColor: Colors.warningSoft},
  warningBadgeText: {color: Colors.warning},
  reason: {fontSize: 9, color: Colors.warning, fontWeight: "700", marginTop: 4, textTransform: "capitalize"},
  empty: {alignItems: "center", paddingVertical: 34, paddingHorizontal: 24},
  emptyTitle: {fontSize: 14, fontWeight: "800", color: Colors.black, marginTop: 12},
  emptyText: {fontSize: 11, lineHeight: 17, color: Colors.gray, textAlign: "center", marginTop: 5},
});
