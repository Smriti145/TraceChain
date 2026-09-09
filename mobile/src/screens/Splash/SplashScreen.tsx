import React, {useEffect} from "react";
import {StyleSheet, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import SvgIcon from "../../components/SvgIcon";

import {getCurrentUser, getToken, removeToken} from "../../services/storage";
import {Colors} from "../../theme/colors";

export default function SplashScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    let active = true;
    const restoreSession = async () => {
      const [token, user] = await Promise.all([getToken(), getCurrentUser()]);
      const validCustomerSession = Boolean(token && user?.role === "CUSTOMER");
      if (token && !validCustomerSession) await removeToken();
      if (active) {
        navigation.replace(validCustomerSession ? "MainTabs" : "Login");
      }
    };
    const timer = setTimeout(restoreSession, 800);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandMark}>
        <SvgIcon name="git-network-outline" size={42} color={Colors.white} />
      </View>
      <Text style={styles.title}>TRACECHAIN</Text>
      <Text style={styles.subtitle}>Track every step. Trust every product.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 30,
  },
  brandMark: {
    width: 82,
    height: 82,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 24,
  },
  title: {fontSize: 25, fontWeight: "800", letterSpacing: 3.5, color: Colors.white},
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
});
