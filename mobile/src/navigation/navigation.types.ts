export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  MainTabs: undefined;
  CreateProduct: undefined;
  AdminDashboard: undefined;
  ScanQR: undefined;
  ProductDetails: {product: any; isOffline?: boolean; cachedAt?: string};
  Timeline: {traces: any[]};
  Profile: undefined;
  Error: undefined;
  Offline: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Scan: undefined;
  History: undefined;
  Notifications: undefined;
  ProfileTab: undefined;
};
