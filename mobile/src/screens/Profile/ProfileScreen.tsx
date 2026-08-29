import React from "react";
import {Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import {removeToken} from "../../services/storage";
import {Colors} from "../../theme/colors";

const menuItems = [
  {title: "Account details", icon: "person-outline"},
  {title: "Organisation", icon: "business-outline"},
  {title: "Security & privacy", icon: "shield-checkmark-outline"},
  {title: "Help & support", icon: "help-circle-outline"},
];

const ProfileScreen = ({navigation}: any) => {
  const logout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      {text: "Cancel", style: "cancel"},
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await removeToken();
          navigation.getParent()?.reset({index: 0, routes: [{name: "Login"}]});
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
        <Text style={styles.heading}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>TC</Text></View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>TraceChain Operator</Text>
            <Text style={styles.role}>Manufacturer workspace</Text>
            <View style={styles.activeBadge}><View style={styles.activeDot} /><Text style={styles.activeText}>Active account</Text></View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.card}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[styles.menuItem, index < menuItems.length - 1 && styles.menuBorder]}>
              <View style={styles.menuIcon}><Ionicons name={item.icon} size={19} color={Colors.primary} /></View>
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.grayLight} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
        <Text style={styles.version}>TraceChain · Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {flex: 1, backgroundColor: Colors.background},
  container: {padding: 20, paddingBottom: 35},
  eyebrow: {fontSize: 10, fontWeight: "700", letterSpacing: 1.3, color: Colors.primary, marginTop: 8},
  heading: {fontSize: 28, fontWeight: "800", color: Colors.black, marginTop: 5, marginBottom: 22},
  profileCard: {backgroundColor: Colors.primaryDark, borderRadius: 22, padding: 20, flexDirection: "row", alignItems: "center", marginBottom: 28},
  avatar: {width: 62, height: 62, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center"},
  avatarText: {color: Colors.white, fontSize: 20, fontWeight: "800"},
  profileCopy: {marginLeft: 15, flex: 1},
  name: {fontSize: 18, fontWeight: "700", color: Colors.white},
  role: {fontSize: 12, color: "rgba(255,255,255,0.68)", marginTop: 3},
  activeBadge: {flexDirection: "row", alignItems: "center", marginTop: 9},
  activeDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: "#74D6AF", marginRight: 6},
  activeText: {fontSize: 10, fontWeight: "600", color: "#BDEBD8"},
  sectionLabel: {fontSize: 10, fontWeight: "700", color: Colors.gray, letterSpacing: 1.2, marginBottom: 10},
  card: {backgroundColor: Colors.white, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 15},
  menuItem: {height: 62, flexDirection: "row", alignItems: "center"},
  menuBorder: {borderBottomWidth: 1, borderBottomColor: Colors.border},
  menuIcon: {width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center"},
  menuText: {flex: 1, marginLeft: 12, color: Colors.black, fontSize: 14, fontWeight: "600"},
  logoutButton: {height: 54, borderRadius: 15, backgroundColor: Colors.dangerSoft, flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center", marginTop: 22},
  logoutText: {color: Colors.danger, fontWeight: "700", fontSize: 14},
  version: {textAlign: "center", color: Colors.grayLight, fontSize: 10, marginTop: 20},
});
