import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  useWindowDimensions,
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { registerUser } from "../../services/authApi";
import { APP_NAME } from "../../utils/constants";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  bg: "#05081A",
  card: "#0D1230",
  cardBorder: "rgba(110,231,183,0.18)",
  accent: "#6EE7B7",
  accentDark: "#10B981",
  accentGlow: "rgba(110,231,183,0.12)",
  purple: "#818CF8",
  purpleGlow: "rgba(129,140,248,0.15)",
  white: "#FFFFFF",
  slate400: "#94A3B8",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1E293B",
  error: "#F87171",
  inputBg: "rgba(255,255,255,0.05)",
  inputBorder: "rgba(255,255,255,0.1)",
  inputBorderFocus: "#6EE7B7",
};

// ─── Floating Orb ────────────────────────────────────────────────────────────
const Orb = ({
  size,
  color,
  style,
}: {
  size: number;
  color: string;
  style?: any;
}) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ scale: pulse }],
        },
        style,
      ]}
    />
  );
};

// ─── Custom Input ─────────────────────────────────────────────────────────────
const Field = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  icon,
}: any) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(anim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.inputBorder, C.inputBorderFocus],
  });

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[styles.inputWrapper, { borderColor }]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={focused ? C.accent : C.slate400}
          style={{ marginRight: 10 }}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={C.slate600}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType || "default"}
          autoCapitalize={autoCapitalize || "none"}
          selectionColor={C.accent}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setShowPass(!showPass)}>
            <Ionicons
              name={showPass ? "eye-outline" : "eye-off-outline"}
              size={18}
              color={C.slate400}
            />
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
};

// ─── Submit Button ────────────────────────────────────────────────────────────
const SubmitButton = ({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }], marginTop: 8 }}>
      <Pressable onPress={press} style={styles.btn} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={C.bg} size="small" />
        ) : (
          <>
            <Text style={styles.btnText}>Create Account</Text>
            <Ionicons name="arrow-forward" size={18} color={C.bg} style={{ marginLeft: 6 }} />
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

// ─── Feature Pill ─────────────────────────────────────────────────────────────
const Pill = ({ icon, label, sub }: { icon: any; label: string; sub: string }) => (
  <View style={styles.pill}>
    <View style={styles.pillIcon}>
      <Ionicons name={icon} size={16} color={C.accent} />
    </View>
    <View>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillSub}>{sub}</Text>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      return Alert.alert("Missing info", "Please fill all fields");
    }
    try {
      setLoading(true);
      await registerUser({ name, email, password });
      Alert.alert("Account created", "You can now log in with your credentials.");
      navigation.navigate("Login");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Something went wrong";
      if (message === "User already exists") {
        Alert.alert("Already registered", "This email is taken. Try logging in instead.");
        return;
      }
      Alert.alert("Registration failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Background orbs */}
      <Orb size={340} color={C.accentGlow} style={{ top: -100, left: -120 }} />
      <Orb size={260} color={C.purpleGlow} style={{ top: 200, right: -80 }} />
      <Orb size={180} color={C.accentGlow} style={{ bottom: 60, left: "35%" }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, isDesktop && styles.containerDesktop]}>
            {/* ── LEFT PANEL (desktop only) ── */}
            {isDesktop && (
              <Animated.View
                style={[
                  styles.leftPanel,
                  { opacity: fadeIn, transform: [{ translateY: slideUp }] },
                ]}
              >
                {/* Logo mark */}
                <View style={styles.logoMark}>
                  <Ionicons name="people" size={26} color={C.accent} />
                </View>

                <Text style={styles.heroEyebrow}>Welcome to {APP_NAME}</Text>
                <Text style={styles.heroHeading}>
                  Split bills.{"\n"}
                  <Text style={{ color: C.accent }}>Stay friends.</Text>
                </Text>
                <Text style={styles.heroBody}>
                  Track shared room expenses effortlessly — clear balances,
                  instant settlements, zero awkward conversations.
                </Text>

                <View style={{ marginTop: 36, gap: 14 }}>
                  <Pill icon="flash-outline" label="Instant setup" sub="Be ready in under a minute" />
                  <Pill icon="bar-chart-outline" label="Clear balances" sub="Always know who owes what" />
                  <Pill icon="shield-checkmark-outline" label="Secure & private" sub="Your data stays yours" />
                </View>

                {/* Decorative stat strip */}
                <View style={styles.statRow}>
                  {[
                    { n: "10k+", l: "Users" },
                    { n: "₹2M+", l: "Settled" },
                    { n: "4.9★", l: "Rating" },
                  ].map((s) => (
                    <View key={s.l} style={styles.stat}>
                      <Text style={styles.statNum}>{s.n}</Text>
                      <Text style={styles.statLabel}>{s.l}</Text>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            {/* ── RIGHT PANEL / FORM ── */}
            <Animated.View
              style={[
                styles.formCard,
                isDesktop && styles.formCardDesktop,
                { opacity: fadeIn, transform: [{ translateY: slideUp }] },
              ]}
            >
              {/* Mobile-only header */}
              {!isDesktop && (
                <View style={{ marginBottom: 28 }}>
                  <View style={styles.logoMark}>
                    <Ionicons name="people" size={22} color={C.accent} />
                  </View>
                  <Text style={styles.mobileAppName}>{APP_NAME}</Text>
                  <Text style={styles.mobileTagline}>
                    Split expenses, not friendships.
                  </Text>
                </View>
              )}

              <Text style={styles.formTitle}>
                {isDesktop ? "Create your account" : "Get started"}
              </Text>
              <Text style={styles.formSub}>
                {isDesktop
                  ? "Join your room group and start tracking."
                  : "Register in seconds — it's completely free."}
              </Text>

              <View style={{ marginTop: 24 }}>
                <Field
                  label="Full Name"
                  placeholder="Rahul Sharma"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  icon="person-outline"
                />
                <Field
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  icon="mail-outline"
                />
                <Field
                  label="Password"
                  placeholder="Create a strong password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                />
              </View>

              <SubmitButton onPress={handleRegister} loading={loading} />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Login link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginPrompt}>Already have an account? </Text>
                <Pressable onPress={() => navigation.navigate("Login")}>
                  <Text style={styles.loginLink}>Log in →</Text>
                </Pressable>
              </View>

              {/* Terms note */}
              <Text style={styles.terms}>
                By creating an account you agree to our{" "}
                <Text style={{ color: C.accent }}>Terms</Text> &{" "}
                <Text style={{ color: C.accent }}>Privacy Policy</Text>.
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  containerDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
    gap: 40,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
  },

  // ── Left panel ──
  leftPanel: {
    flex: 1,
    paddingVertical: 32,
    paddingRight: 20,
  },
  logoMark: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(110,231,183,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(110,231,183,0.3)",
    marginBottom: 20,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: C.accent,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  heroHeading: {
    fontSize: 46,
    fontWeight: "900",
    color: C.white,
    lineHeight: 54,
    letterSpacing: -1,
  },
  heroBody: {
    fontSize: 15,
    color: C.slate400,
    lineHeight: 26,
    marginTop: 16,
    maxWidth: 380,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pillIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(110,231,183,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: C.white,
  },
  pillSub: {
    fontSize: 12,
    color: C.slate400,
    marginTop: 1,
  },
  statRow: {
    flexDirection: "row",
    gap: 0,
    marginTop: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    overflow: "hidden",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.08)",
  },
  statNum: {
    fontSize: 20,
    fontWeight: "800",
    color: C.accent,
  },
  statLabel: {
    fontSize: 11,
    color: C.slate400,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  // ── Form card ──
  formCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: C.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 28,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 10,
  },
  formCardDesktop: {
    width: 420,
    maxWidth: 420,
    flexShrink: 0,
  },

  // Mobile header
  mobileAppName: {
    fontSize: 28,
    fontWeight: "900",
    color: C.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  mobileTagline: {
    fontSize: 14,
    color: C.slate400,
    lineHeight: 22,
  },

  // Form heading
  formTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -0.4,
  },
  formSub: {
    fontSize: 13,
    color: C.slate400,
    marginTop: 4,
    lineHeight: 20,
  },

  // Fields
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: C.slate400,
    marginBottom: 7,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.white,
    padding: 0,
  },

  // Button
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.accent,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 4,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "800",
    color: C.bg,
    letterSpacing: 0.2,
  },

  // Divider
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 22,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  dividerText: {
    fontSize: 12,
    color: C.slate600,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Login row
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginPrompt: {
    fontSize: 14,
    color: C.slate400,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: C.accent,
  },

  // Terms
  terms: {
    fontSize: 11,
    color: C.slate600,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 18,
  },
});

export default RegisterScreen;