import React, {useState} from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import SvgIcon from "../../components/SvgIcon";

import InputField from "../../components/InputField";
import {login, register} from "../../services/auth.service";
import {saveApiBaseUrl, saveCurrentUser, saveToken} from "../../services/storage";
import {DEFAULT_BASE_URL} from "../../api/axios";
import {normalizeApiBaseUrl} from "../../api/axios";
import axios from "axios";
import {Colors} from "../../theme/colors";

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConnection, setShowConnection] = useState(false);
  const [serverUrl, setServerUrl] = useState(DEFAULT_BASE_URL || "");
  const [isCheckingServer, setIsCheckingServer] = useState(false);
  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [name, setName] = useState("");

  const handleSaveServer = async () => {
    const normalizedUrl = normalizeApiBaseUrl(serverUrl);
    if (!normalizedUrl) {
      Alert.alert("Invalid address", "Enter your backend server address.");
      return;
    }

    try {
      setIsCheckingServer(true);
      await axios.get(`${normalizedUrl}/health`, {timeout: 5000});
      await saveApiBaseUrl(normalizedUrl);
      setServerUrl(normalizedUrl);
      setShowConnection(false);
      Alert.alert("Server connected", "The app can reach your TraceChain backend.");
    } catch {
      Alert.alert(
        "Server not reachable",
        `Could not connect to ${normalizedUrl}. Keep the backend running and ensure both devices use the same Wi-Fi.`,
      );
    } finally {
      setIsCheckingServer(false);
    }
  };

  const handleLogin = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password || (mode === "REGISTER" && name.trim().length < 3)) {
      Alert.alert("Missing details", mode === "REGISTER" ? "Enter your name, email and a password of at least 12 characters." : "Enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = mode === "LOGIN"
        ? await login(normalizedEmail, password)
        : await register(name.trim(), normalizedEmail, password, "CUSTOMER");
      if (response.user?.role !== "CUSTOMER") {
        Alert.alert("Customer app only", "Use the TraceChain web portal for manufacturer and supply-chain roles.");
        return;
      }
      await saveToken(response.token);
      await saveCurrentUser(response.user);
      navigation.replace("MainTabs");
    } catch (err: any) {
      Alert.alert(
        "Login failed",
        err.response?.data?.message || "Unable to connect to the server.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandMark}>
            <SvgIcon name="git-network-outline" size={32} color={Colors.white} />
          </View>
          <Text style={styles.brand}>TRACECHAIN</Text>
          <Text style={styles.title}>{mode === "LOGIN" ? "Welcome to TraceChain." : "Create your workspace."}</Text>
          <Text style={styles.subtitle}>
            Scan and verify the real journey of products across every industry.
          </Text>
          <View style={styles.modeSwitch}>
            <TouchableOpacity style={[styles.modeButton, mode === "LOGIN" && styles.modeButtonActive]} onPress={() => setMode("LOGIN")}><Text style={[styles.modeText, mode === "LOGIN" && styles.modeTextActive]}>Sign in</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modeButton, mode === "REGISTER" && styles.modeButtonActive]} onPress={() => setMode("REGISTER")}><Text style={[styles.modeText, mode === "REGISTER" && styles.modeTextActive]}>Create account</Text></TouchableOpacity>
          </View>

          {mode === "LOGIN" ? <><Text style={styles.demoLabel}>CUSTOMER DEMO</Text><TouchableOpacity style={[styles.demoPill, email === "customer@tracechain.demo" && styles.demoPillActive]} onPress={() => {setEmail("customer@tracechain.demo"); setPassword("TraceChain@123");}}><Text style={[styles.demoText, email === "customer@tracechain.demo" && styles.demoTextActive]}>Use customer demo account</Text></TouchableOpacity></> : <>
            <InputField label="Full name / organisation" placeholder="Your name or company" icon="business-outline" value={name} onChangeText={setName} />
            <View style={styles.customerNotice}><SvgIcon name="person-outline" size={17} color={Colors.primary}/><Text style={styles.customerNoticeText}>A Customer account will be created for product verification.</Text></View>
          </>}

          <InputField
            label="Email address"
            placeholder="you@company.com"
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.connectionToggle} onPress={() => setShowConnection(value => !value)}>
            <SvgIcon name="server-outline" size={16} color={Colors.primary} />
            <Text style={styles.connectionToggleText}>Connection settings</Text>
            <SvgIcon name={showConnection ? "chevron-up" : "chevron-down"} size={15} color={Colors.gray} />
          </TouchableOpacity>
          {showConnection ? (
            <View style={styles.connectionPanel}>
              <Text style={styles.connectionHelp}>The mentor build is connected to TraceChain Cloud. Developers may enter another HTTPS API URL here.</Text>
              <TextInput
                value={serverUrl}
                onChangeText={setServerUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="https://your-api.example.com/api"
                placeholderTextColor={Colors.grayLight}
                style={styles.serverInput}
              />
              <TouchableOpacity style={styles.saveServer} onPress={handleSaveServer} disabled={isCheckingServer}>
                <Text style={styles.saveServerText}>{isCheckingServer ? "Checking server…" : "Test & save server"}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <InputField
            label="Password"
            placeholder="Enter your password"
            icon="lock-closed-outline"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            activeOpacity={0.86}
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isSubmitting}>
            <Text style={styles.buttonText}>
              {isSubmitting ? "Please wait…" : mode === "LOGIN" ? "Sign in securely" : "Create account"}
            </Text>
            {!isSubmitting ? (
              <SvgIcon name="arrow-forward" size={19} color={Colors.white} />
            ) : null}
          </TouchableOpacity>

          <View style={styles.secureRow}>
            <SvgIcon name="shield-checkmark-outline" size={16} color={Colors.success} />
            <Text style={styles.secureText}>Secure, encrypted access</Text>
          </View>
        </ScrollView>
        <Text style={styles.footer}>Product provenance you can trust.</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  keyboardView: {flex: 1},
  content: {flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 24},
  brandMark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 5,
  },
  brand: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.black,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 15,
    color: Colors.gray,
    fontSize: 15,
    lineHeight: 22,
  },
  modeSwitch: {flexDirection: "row", backgroundColor: Colors.primarySoft, padding: 4, borderRadius: 14, marginTop: 20, marginBottom: 16},
  modeButton: {flex: 1, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 11},
  modeButtonActive: {backgroundColor: Colors.white},
  modeText: {fontSize: 12, fontWeight: "700", color: Colors.gray},
  modeTextActive: {color: Colors.primaryDark},
  demoLabel: {fontSize: 9, fontWeight: "800", letterSpacing: 1.1, color: Colors.gray, marginBottom: 9},
  demoRow: {gap: 7, paddingBottom: 15},
  demoPill: {paddingHorizontal: 12, height: 38, justifyContent: "center", alignItems: "center", borderRadius: 16, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, marginBottom: 15},
  demoPillActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  demoText: {fontSize: 10, fontWeight: "700", color: Colors.gray},
  demoTextActive: {color: Colors.white},
  customerNotice: {flexDirection: "row", gap: 8, alignItems: "center", padding: 12, backgroundColor: Colors.primarySoft, borderRadius: 12, marginBottom: 10},
  customerNoticeText: {flex: 1, fontSize: 11, lineHeight: 16, color: Colors.primaryDark},
  button: {
    marginTop: 6,
    height: 58,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 5},
    elevation: 4,
  },
  connectionToggle: {flexDirection: "row", alignItems: "center", gap: 7, marginTop: -4, marginBottom: 10},
  connectionToggleText: {flex: 1, color: Colors.primary, fontSize: 12, fontWeight: "700"},
  connectionPanel: {backgroundColor: Colors.primarySoft, borderRadius: 14, padding: 13, marginBottom: 8},
  connectionHelp: {fontSize: 11, color: Colors.gray, lineHeight: 16},
  serverInput: {backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 11, height: 43, marginTop: 10, color: Colors.black, fontSize: 11},
  saveServer: {alignSelf: "flex-start", marginTop: 10},
  saveServerText: {fontSize: 11, fontWeight: "700", color: Colors.primaryDark},
  buttonText: {color: Colors.white, fontWeight: "700", fontSize: 16},
  buttonDisabled: {opacity: 0.6},
  secureRow: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  secureText: {color: Colors.gray, fontSize: 12},
  footer: {
    textAlign: "center",
    color: Colors.grayLight,
    fontSize: 12,
    paddingBottom: 18,
  },
});
