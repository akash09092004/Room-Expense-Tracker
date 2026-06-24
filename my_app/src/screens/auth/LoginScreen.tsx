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

import { loginUser } from "../../services/authApi";
import { useAuth } from "../../hooks/useAuth";
import { APP_NAME } from "../../utils/constants";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#05081A",
  card: "#0D1230",
  cardBorder: "rgba(110,231,183,0.18)",
  accent: "#6EE7B7",
  accentGlow: "rgba(110,231,183,0.12)",
  purpleGlow: "rgba(129,140,248,0.15)",
  white: "#FFFFFF",
  slate400: "#94A3B8",
  slate600: "#475569",
  inputBg: "rgba(255,255,255,0.05)",
  inputBorder: "rgba(255,255,255,0.1)",
  inputBorderFocus: "#6EE7B7",
};

// ─── Floating Orb ─────────────────────────────────────────────────────────────
const Orb = ({ size, color, style }: { size: number; color: string; style?: any }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 3500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 3500, useNativeDriver: true }),
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

// ─── Custom Field ─────────────────────────────────────────────────────────────
const Field = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  icon,
}: any) => {
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.inputBorder, C.inputBorderFocus],
  });

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
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
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType || "default"}
          autoCapitalize="none"
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

// ─── Submit Button ─────────────────────────────────────────────────────────────
const SubmitButton = ({ onPress, loading }: { onPress: () => void; loading: boolean }) => {
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
            <Text style={styles.btnText}>Sign In</Text>
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

// ─── Main Screen ───────────────────────────────────────────────────────────────
const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

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

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Missing info", "Please fill all fields");
    }
    try {
      setLoading(true);
      const data = await loginUser({ email, password });
      await login(data.token, data.user);
      Alert.alert("Welcome back!", "Your session has been saved securely.");
    } catch (error: any) {
      const message = error?.response?.data?.message || "Something went wrong";
      if (message === "User not found") {
        Alert.alert("Account not found", "No account exists for this email. Please register first.");
        return;
      }
      if (message === "Invalid Credentials") {
        Alert.alert("Wrong credentials", "Check your email and password and try again.");
        return;
      }
      Alert.alert("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Background orbs */}
      <Orb size={320} color={C.accentGlow} style={{ top: -90, right: -100 }} />
      <Orb size={240} color={C.purpleGlow} style={{ top: 260, left: -70 }} />
      <Orb size={160} color={C.accentGlow} style={{ bottom: 80, right: "30%" }} />

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

            {/* ── FORM CARD (left on desktop) ── */}
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
                    <Ionicons name="wallet" size={22} color={C.accent} />
                  </View>
                  <Text style={styles.mobileAppName}>{APP_NAME}</Text>
                  <Text style={styles.mobileTagline}>
                    Your shared expenses, sorted.
                  </Text>
                </View>
              )}

              {/* Greeting */}
              <View style={styles.greetingRow}>
                <View>
                  <Text style={styles.formTitle}>Welcome back 👋</Text>
                  <Text style={styles.formSub}>
                    {isDesktop
                      ? "Sign in to continue to your workspace."
                      : "Sign in to manage your room expenses."}
                  </Text>
                </View>
                {isDesktop && (
                  <View style={styles.logoMark}>
                    <Ionicons name="wallet" size={22} color={C.accent} />
                  </View>
                )}
              </View>

              <View style={{ marginTop: 24 }}>
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
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  icon="lock-closed-outline"
                />

                {/* Forgot password */}
                <Pressable style={{ alignSelf: "flex-end", marginTop: -8, marginBottom: 4 }}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </View>

              <SubmitButton onPress={handleLogin} loading={loading} />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Register link */}
              <View style={styles.registerRow}>
                <Text style={styles.registerPrompt}>Don't have an account? </Text>
                <Pressable onPress={() => navigation.navigate("Register")}>
                  <Text style={styles.registerLink}>Register →</Text>
                </Pressable>
              </View>

              {/* Security note */}
              <View style={styles.secureNote}>
                <Ionicons name="shield-checkmark-outline" size={13} color={C.slate600} />
                <Text style={styles.secureText}>
                  Secured with end-to-end encryption
                </Text>
              </View>
            </Animated.View>

            {/* ── RIGHT PANEL (desktop only) ── */}
            {isDesktop && (
              <Animated.View
                style={[
                  styles.rightPanel,
                  { opacity: fadeIn, transform: [{ translateY: slideUp }] },
                ]}
              >
                {/* Live balance card (decorative) */}
                <View style={styles.balanceCard}>
                  <View style={styles.balanceCardHeader}>
                    <Text style={styles.balanceCardLabel}>Room Balance</Text>
                    <View style={styles.liveChip}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>Live</Text>
                    </View>
                  </View>
                  <Text style={styles.balanceAmount}>₹4,280</Text>
                  <Text style={styles.balanceSub}>Total outstanding across 3 members</Text>

                  <View style={styles.memberRow}>
                    {["R", "S", "A"].map((initial, i) => (
                      <View key={i} style={[styles.avatar, { marginLeft: i === 0 ? 0 : -10 }]}>
                        <Text style={styles.avatarText}>{initial}</Text>
                      </View>
                    ))}
                    <Text style={styles.memberCount}>+2 more</Text>
                  </View>
                </View>

                <Text style={styles.heroEyebrow}>Everything in one place</Text>
                <Text style={styles.heroHeading}>
                  Track bills.{"\n"}
                  <Text style={{ color: C.accent }}>Stay balanced.</Text>
                </Text>
                <Text style={styles.heroBody}>
                  Real-time balances, smart splits, and instant settlements
                  — so your group stays fair and friction-free.
                </Text>

                <View style={{ marginTop: 28, gap: 12 }}>
                  <Pill icon="analytics-outline" label="Live balances" sub="Updated every time you add an expense" />
                  <Pill icon="people-outline" label="Group splits" sub="Split equally or by custom amounts" />
                  <Pill icon="checkmark-circle-outline" label="Quick settle" sub="Mark debts paid with one tap" />
                </View>
              </Animated.View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
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
    gap: 48,
    maxWidth: 1100,
    alignSelf: "center",
    width: "100%",
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
    width: 400,
    maxWidth: 400,
    flexShrink: 0,
  },

  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "rgba(110,231,183,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(110,231,183,0.3)",
    marginBottom: 16,
  },
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

  greetingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
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
    maxWidth: 260,
  },

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
  forgotText: {
    fontSize: 12,
    color: C.accent,
    fontWeight: "600",
    marginBottom: 16,
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

  // Register link
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerPrompt: {
    fontSize: 14,
    color: C.slate400,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: "700",
    color: C.accent,
  },

  // Security note
  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 16,
  },
  secureText: {
    fontSize: 11,
    color: C.slate600,
  },

  // ── Right panel ──
  rightPanel: {
    flex: 1,
    paddingVertical: 32,
    paddingLeft: 20,
  },

  // Balance card (decorative)
  balanceCard: {
    backgroundColor: "rgba(110,231,183,0.07)",
    borderWidth: 1,
    borderColor: "rgba(110,231,183,0.2)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  balanceCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: C.slate400,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(110,231,183,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.accent,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.accent,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "900",
    color: C.white,
    letterSpacing: -1,
  },
  balanceSub: {
    fontSize: 12,
    color: C.slate400,
    marginTop: 2,
    marginBottom: 14,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(110,231,183,0.2)",
    borderWidth: 2,
    borderColor: C.card,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.accent,
  },
  memberCount: {
    fontSize: 12,
    color: C.slate400,
    marginLeft: 10,
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
    fontSize: 42,
    fontWeight: "900",
    color: C.white,
    lineHeight: 50,
    letterSpacing: -1,
  },
  heroBody: {
    fontSize: 15,
    color: C.slate400,
    lineHeight: 26,
    marginTop: 14,
    maxWidth: 360,
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
});

export default LoginScreen;