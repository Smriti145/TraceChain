import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {RootStackParamList} from "./navigation.types";

import SplashScreen from "../screens/Splash/SplashScreen";
import LoginScreen from "../screens/Login/LoginScreen";
import CreateProductScreen from "../screens/CreateProduct/CreateProductScreen";
import ScanQRScreen from "../screens/ScanQR/ScanQRScreen";
import ProductDetailsScreen from "../screens/ProductDetails/ProductDetailsScreen";
import TimelineScreen from "../screens/Timeline/TimelineScreen";
import ProfileScreen from "../screens/Profile/ProfileScreen";
import AdminDashboardScreen from "../screens/AdminDashboard/AdminDashboardScreen";
import ErrorScreen from "../screens/Error/ErrorScreen";
import OfflineScreen from "../screens/Offline/OfflineScreen";
import BottomTabs from "./BottomTabs";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="ScanQR" component={ScanQRScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Timeline" component={TimelineScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Error" component={ErrorScreen} />
        <Stack.Screen name="Offline" component={OfflineScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}