import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {Colors} from "../../theme/colors";

import {
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import {CodeScanner, type Barcode} from "react-native-vision-camera-barcode-scanner";
import api from "../../api/axios";

const ScanQRScreen = ({ navigation }: any) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const scanningRef = useRef(false);
  const { hasPermission, requestPermission } =
    useCameraPermission();

  const device = useCameraDevice("back");

  const verifyCode = useCallback(async (value: string) => {
    if (scanningRef.current) {
      return;
    }

    scanningRef.current = true;
    setIsVerifying(true);

    try {
      const response = await api.get(`/products/verify/${encodeURIComponent(value)}`);
      navigation.navigate("ProductDetails", {product: response.data.product});
    } catch (error: any) {
      Alert.alert(
        "Product not verified",
        error.response?.data?.message || "This QR code is not registered with TraceChain.",
      );
    } finally {
      setIsVerifying(false);
      setTimeout(() => {
        scanningRef.current = false;
      }, 1200);
    }
  }, [navigation]);

  const handleCodes = useCallback((codes: Barcode[]) => {
    const value = codes[0]?.rawValue;
    if (value) {
      verifyCode(value);
    }
  }, [verifyCode]);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>
          Camera Permission Required
        </Text>

        <Text style={styles.text}>
          TraceChain needs camera access to scan QR codes.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Allow Camera
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>
          Camera Not Available
        </Text>

        <Text style={styles.text}>
          TraceChain cannot find a usable camera on this
          Android device.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CodeScanner
        style={StyleSheet.absoluteFill}
        isActive={true}
        barcodeFormats={["qr-code"]}
        onBarcodeScanned={handleCodes}
        onError={error => console.error("QR scanner error", error)}
      />

      <View
        pointerEvents="box-none"
        style={styles.overlay}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color={Colors.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Scan Product
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.center}>
          <View style={styles.frame}>
            <View style={styles.topLeft} />
            <View style={styles.topRight} />
            <View style={styles.bottomLeft} />
            <View style={styles.bottomRight} />
          </View>

          <Text style={styles.instruction}>
            Position the product QR code inside the frame
          </Text>
        </View>

        <View style={styles.bottom}>
          {isVerifying ? (
            <View style={styles.verifyingRow}>
              <ActivityIndicator color={Colors.white} size="small" />
              <Text style={styles.bottomText}>Verifying product…</Text>
            </View>
          ) : (
            <Text style={styles.bottomText}>Camera ready · QR codes only</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ScanQRScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
  },

  center: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  padding: 30,
},

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  text: {
    color: "#CBD5E1",
    fontSize: 15,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
  },

  button: {
    marginTop: 25,
    backgroundColor: Colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerSpacer: {
    width: 30,
  },

  close: {
    color: "#fff",
    fontSize: 26,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  frame: {
  width: 280,
  height: 210,
  position: "relative",
  justifyContent: "center",
  alignItems: "center",
},

  topLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 55,
    height: 55,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#fff",
  },

  topRight: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 55,
    height: 55,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: "#fff",
  },

  bottomLeft: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 55,
    height: 55,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: "#fff",
  },

  bottomRight: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 55,
    height: 55,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: "#fff",
  },

  instruction: {
    color: "#fff",
    marginTop: 25,
    textAlign: "center",
    fontSize: 15,
  },

  bottom: {
    height: 100,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomText: {
    color: "#fff",
    fontSize: 14,
  },

  verifyingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
});
