import React, {useCallback, useState} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useFocusEffect} from "@react-navigation/native";
import SvgIcon from "../../components/SvgIcon";
import {CachedProduct, getCachedProducts} from "../../services/storage";
import {loadNotifications} from "../../services/notification.service";

import {Colors} from "../../theme/colors";

const categories = ["All", "Ayurveda", "Food", "Pharma", "Textile", "Electronics", "Cosmetics"];

const DashboardScreen = ({navigation}: any) => {
  const [cachedProducts, setCachedProducts] = useState<CachedProduct[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const recentScans = cachedProducts.slice(0, 3);
  const stats = [
    {label: "Saved scans", value: String(cachedProducts.length).padStart(2, "0"), icon: "scan-outline", tone: Colors.primarySoft},
    {label: "Verified", value: String(cachedProducts.length).padStart(2, "0"), icon: "shield-checkmark-outline", tone: Colors.successSoft},
    {label: "Attention", value: "00", icon: "alert-circle-outline", tone: Colors.warningSoft},
  ];

  useFocusEffect(useCallback(() => {
    let active = true;
    Promise.all([getCachedProducts(), loadNotifications()]).then(([items, feed]) => {
      if (active) {
        setCachedProducts(items);
        setUnreadNotifications(feed.unreadCount);
      }
    });
    return () => { active = false; };
  }, []));

  return (
  <SafeAreaView style={styles.safeArea}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SUNDAY, 30 AUGUST</Text>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.subHeading}>One platform. Every product journey.</Text>
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("Notifications")}>
          <SvgIcon name="notifications-outline" size={22} color={Colors.black} />
          {unreadNotifications > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>

      <View style={styles.searchShell}>
        <SvgIcon name="search-outline" size={20} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search product, batch, barcode or QR"
          placeholderTextColor={Colors.grayLight}
        />
        <SvgIcon name="options-outline" size={20} color={Colors.primary} />
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.scanCard}
        onPress={() => navigation.navigate("Scan")}>
        <View style={styles.scanDecoration} />
        <View style={styles.scanIconBox}>
          <SvgIcon name="scan" size={31} color={Colors.white} />
        </View>
        <View style={styles.scanCopy}>
          <Text style={styles.scanTitle}>Scan a product</Text>
          <Text style={styles.scanText}>Verify origin and journey instantly</Text>
        </View>
        <SvgIcon name="arrow-forward-circle" size={30} color="rgba(255,255,255,0.9)" />
      </TouchableOpacity>

      <Text style={styles.sectionKicker}>TRACE ACROSS INDUSTRIES</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {categories.map((category, index) => (
          <View key={category} style={[styles.categoryChip, index === 0 && styles.categoryChipActive]}>
            <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>{category}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Today’s activity</Text>
      <View style={styles.statsContainer}>
        {stats.map(item => (
          <View style={styles.statBox} key={item.label}>
            <View style={[styles.statIcon, {backgroundColor: item.tone}]}>
              <SvgIcon name={item.icon} size={18} color={Colors.primary} />
            </View>
            <Text style={styles.number}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent scans</Text>
        <TouchableOpacity onPress={() => navigation.navigate("History")}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listCard}>
        {recentScans.length ? recentScans.map((item, index) => (
          <TouchableOpacity
            key={item.product.id || item.lookupKeys[0]}
            style={[styles.productRow, index < recentScans.length - 1 && styles.rowBorder]}>
            <View style={styles.productIcon}>
              <SvgIcon name="cube-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.productCopy}>
              <Text style={styles.productCategory}>{item.product.category || "GENERAL"}</Text>
              <Text style={styles.productName}>{item.product.productName}</Text>
              <Text style={styles.batch}>{item.product.batchNumber} · {new Date(item.cachedAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <SvgIcon name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </TouchableOpacity>
        )) : (
          <View style={styles.emptyHistory}>
            <SvgIcon name="scan-outline" size={25} color={Colors.primary} />
            <View style={styles.emptyCopy}><Text style={styles.emptyTitle}>No products scanned yet</Text><Text style={styles.emptyText}>Scan any supported product to build your traceability history.</Text></View>
          </View>
        )}
      </View>
    </ScrollView>
  </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.background},
  container: {flex: 1},
  content: {paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  eyebrow: {fontSize: 10, fontWeight: "700", letterSpacing: 1.2, color: Colors.primary},
  greeting: {fontSize: 27, fontWeight: "800", color: Colors.black, marginTop: 5, letterSpacing: -0.5},
  subHeading: {fontSize: 13, color: Colors.gray, marginTop: 3},
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationDot: {
    position: "absolute",
    right: 10,
    top: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  searchShell: {
    height: 54,
    borderRadius: 15,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 18,
  },
  searchInput: {flex: 1, fontSize: 14, color: Colors.black, marginHorizontal: 10},
  scanCard: {
    minHeight: 118,
    borderRadius: 22,
    paddingHorizontal: 18,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 28,
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 7},
    elevation: 5,
  },
  scanDecoration: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.07)",
    right: -35,
    top: -55,
  },
  scanIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanCopy: {flex: 1, marginLeft: 14},
  scanTitle: {color: Colors.white, fontSize: 19, fontWeight: "800"},
  scanText: {color: "rgba(255,255,255,0.72)", fontSize: 12, marginTop: 5},
  sectionKicker: {fontSize: 9, fontWeight: "800", color: Colors.gray, letterSpacing: 1.2, marginBottom: 10},
  categories: {gap: 8, paddingBottom: 26},
  categoryChip: {height: 34, justifyContent: "center", paddingHorizontal: 14, borderRadius: 18, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border},
  categoryChipActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  categoryText: {fontSize: 11, fontWeight: "700", color: Colors.gray},
  categoryTextActive: {color: Colors.white},
  sectionTitle: {fontSize: 17, fontWeight: "700", color: Colors.black},
  statsContainer: {flexDirection: "row", gap: 10, marginTop: 13, marginBottom: 28},
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center"},
  number: {fontSize: 22, fontWeight: "800", color: Colors.black, marginTop: 12},
  label: {fontSize: 11, color: Colors.gray, marginTop: 2},
  sectionHeader: {flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 13},
  viewAll: {fontSize: 13, color: Colors.primary, fontWeight: "700"},
  listCard: {backgroundColor: Colors.white, borderRadius: 18, paddingHorizontal: 15, borderWidth: 1, borderColor: Colors.border},
  productRow: {flexDirection: "row", alignItems: "center", paddingVertical: 15},
  rowBorder: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  productIcon: {width: 43, height: 43, borderRadius: 13, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center"},
  productCopy: {flex: 1, marginLeft: 12},
  productCategory: {fontSize: 8, fontWeight: "800", letterSpacing: 0.8, color: Colors.primary, textTransform: "uppercase"},
  productName: {fontSize: 14, fontWeight: "700", color: Colors.black},
  batch: {fontSize: 10, color: Colors.gray, marginTop: 4},
  verifiedBadge: {flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: Colors.successSoft, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20},
  verifiedText: {fontSize: 10, fontWeight: "700", color: Colors.success},
  emptyHistory: {minHeight: 86, flexDirection: "row", alignItems: "center", paddingHorizontal: 8},
  emptyCopy: {flex: 1, marginLeft: 12},
  emptyTitle: {fontSize: 13, fontWeight: "800", color: Colors.black},
  emptyText: {fontSize: 10, color: Colors.gray, lineHeight: 15, marginTop: 3},
});
