import React from "react";
import {StyleSheet} from "react-native";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import {BottomTabParamList} from "./navigation.types";
import {Colors} from "../theme/colors";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import ScanQRScreen from "../screens/ScanQR/ScanQRScreen";
import ScanHistoryScreen from "../screens/ScanHistory/ScanHistoryScreen";
import NotificationScreen from "../screens/Notifications/NotificationScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";

const Tab = createBottomTabNavigator<BottomTabParamList>();

const makeTabIcon = (name: string) =>
  ({color, focused}: {color: string; focused: boolean}) => (
    <Ionicons name={`${name}${focused ? "" : "-outline"}`} size={22} color={color} />
  );

const homeIcon = makeTabIcon("home");
const scanIcon = makeTabIcon("scan");
const historyIcon = makeTabIcon("time");
const notificationIcon = makeTabIcon("notifications");
const profileIcon = makeTabIcon("person");

const BottomTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.grayLight,
      tabBarLabelStyle: styles.label,
      tabBarStyle: styles.tabBar,
    }}>
    <Tab.Screen name="Home" component={DashboardScreen} options={{tabBarIcon: homeIcon}} />
    <Tab.Screen name="Scan" component={ScanQRScreen} options={{tabBarIcon: scanIcon}} />
    <Tab.Screen name="History" component={ScanHistoryScreen} options={{tabBarIcon: historyIcon}} />
    <Tab.Screen name="Notifications" component={NotificationScreen} options={{tabBarIcon: notificationIcon}} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{title: "Profile", tabBarIcon: profileIcon}} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    height: 68,
    paddingTop: 7,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    elevation: 10,
    shadowColor: Colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  label: {fontSize: 10, fontWeight: "600"},
});

export default BottomTabs;
