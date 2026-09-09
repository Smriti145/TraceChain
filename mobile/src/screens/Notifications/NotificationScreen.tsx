import React, {useCallback, useState} from "react";
import {ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useFocusEffect} from "@react-navigation/native";
import SvgIcon from "../../components/SvgIcon";
import {Colors} from "../../theme/colors";
import {AppNotification} from "../../services/storage";
import {loadNotifications, readAllNotifications, readNotification} from "../../services/notification.service";

const timeAgo = (value: string) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr`;
  return `${Math.floor(seconds / 86400)} d`;
};

const appearance = (item: AppNotification) => {
  if (item.severity === "SUCCESS") return {icon: "shield-checkmark-outline", color: Colors.success, tone: Colors.successSoft};
  if (item.severity === "WARNING") return {icon: "warning-outline", color: Colors.warning, tone: Colors.warningSoft};
  if (item.severity === "ERROR") return {icon: "alert-circle-outline", color: Colors.danger, tone: Colors.dangerSoft};
  return {icon: "git-commit-outline", color: Colors.primary, tone: Colors.primarySoft};
};

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  const refresh = useCallback(async (pullToRefresh = false) => {
    if (pullToRefresh) setRefreshing(true);
    const feed = await loadNotifications();
    setNotifications(feed.notifications);
    setUnreadCount(feed.unreadCount);
    setOffline(feed.offline);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    refresh();
  }, [refresh]));

  const markRead = async (item: AppNotification) => {
    if (item.readAt) return;
    const updated = await readNotification(item.id);
    setNotifications(updated);
    setUnreadCount(updated.filter(notification => !notification.readAt).length);
  };

  const markAllRead = async () => {
    const updated = await readAllNotifications();
    setNotifications(updated);
    setUnreadCount(0);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => refresh(true)} tintColor={Colors.primary} />}>
        <Text style={styles.eyebrow}>ACTIVITY CENTRE</Text>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>Notifications</Text>
          <View style={styles.count}><Text style={styles.countText}>{unreadCount} new</Text></View>
        </View>

        <View style={styles.toolbar}>
          <Text style={styles.today}>RECENT ACTIVITY</Text>
          {unreadCount > 0 && <TouchableOpacity onPress={() => markAllRead()}><Text style={styles.markAll}>Mark all read</Text></TouchableOpacity>}
        </View>

        {offline && <View style={styles.offlineBanner}><SvgIcon name="cloud-offline-outline" size={16} color={Colors.warning} /><Text style={styles.offlineText}>Showing saved notifications while offline</Text></View>}

        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" color={Colors.primary} />
        ) : notifications.length ? (
          <View style={styles.card}>
            {notifications.map((item, index) => {
              const visual = appearance(item);
              return (
                <TouchableOpacity key={item.id} activeOpacity={0.75} onPress={() => markRead(item)} style={[styles.row, index < notifications.length - 1 && styles.border, !item.readAt && styles.unreadRow]}>
                  <View style={[styles.iconBox, {backgroundColor: visual.tone}]}><SvgIcon name={visual.icon} size={21} color={visual.color} /></View>
                  <View style={styles.copy}>
                    <View style={styles.titleRow}>{!item.readAt && <View style={styles.unreadDot} />}<Text style={styles.title}>{item.title}</Text></View>
                    <Text style={styles.detail}>{item.message}</Text>
                    {item.product && <Text style={styles.product}>{item.product.category} · {item.product.batchNumber}</Text>}
                  </View>
                  <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><SvgIcon name="notifications-outline" size={28} color={Colors.primary} /></View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyText}>Product registrations and journey updates will appear here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.background},
  container: {padding: 20, paddingBottom: 34, flexGrow: 1},
  eyebrow: {fontSize: 10, fontWeight: "700", letterSpacing: 1.3, color: Colors.primary, marginTop: 8},
  headingRow: {flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5, marginBottom: 26},
  heading: {fontSize: 28, fontWeight: "800", color: Colors.black},
  count: {backgroundColor: Colors.primarySoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6},
  countText: {fontSize: 11, fontWeight: "700", color: Colors.primary},
  toolbar: {flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10},
  today: {fontSize: 10, fontWeight: "700", color: Colors.gray, letterSpacing: 1.2},
  markAll: {fontSize: 11, fontWeight: "700", color: Colors.primary},
  offlineBanner: {flexDirection: "row", alignItems: "center", backgroundColor: Colors.warningSoft, borderRadius: 12, padding: 11, marginBottom: 12},
  offlineText: {fontSize: 11, color: Colors.gray, marginLeft: 8},
  loader: {marginTop: 64},
  card: {backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, overflow: "hidden"},
  row: {flexDirection: "row", paddingHorizontal: 15, paddingVertical: 17, alignItems: "flex-start"},
  unreadRow: {backgroundColor: "#FAFCFB"},
  border: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  iconBox: {width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center"},
  copy: {flex: 1, marginLeft: 12},
  titleRow: {flexDirection: "row", alignItems: "center"},
  unreadDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginRight: 6},
  title: {fontSize: 14, fontWeight: "700", color: Colors.black, flexShrink: 1},
  detail: {fontSize: 12, color: Colors.gray, lineHeight: 18, marginTop: 4},
  product: {fontSize: 10, fontWeight: "600", color: Colors.primary, marginTop: 6},
  time: {fontSize: 10, color: Colors.grayLight, marginLeft: 8},
  empty: {alignItems: "center", justifyContent: "center", flex: 1, paddingTop: 70},
  emptyIcon: {width: 58, height: 58, borderRadius: 18, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center"},
  emptyTitle: {fontSize: 16, fontWeight: "700", color: Colors.black, marginTop: 15},
  emptyText: {fontSize: 12, lineHeight: 18, color: Colors.gray, textAlign: "center", marginTop: 6, maxWidth: 260},
});
