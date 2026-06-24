import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Animated,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { APP_NAME } from "../../utils/constants";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#05081A",
  card: "#0D1230",
  cardBorder: "rgba(110,231,183,0.18)",
  cardBorderLight: "rgba(255,255,255,0.07)",
  accent: "#6EE7B7",
  accentGlow: "rgba(110,231,183,0.12)",
  purpleGlow: "rgba(129,140,248,0.15)",
  purple: "#818CF8",
  white: "#FFFFFF",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1E293B",
};

// ─── Floating Orb ─────────────────────────────────────────────────────────────
const Orb = ({ size, color, style }: { size: number; color: string; style?: any }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 4000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 4000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        { position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ scale: pulse }] },
        style,
      ]}
    />
  );
};

// ─── Animated Button ──────────────────────────────────────────────────────────
const NavBtn = ({
  label,
  onPress,
  variant = "ghost",
}: {
  label: string;
  onPress: () => void;
  variant?: "ghost" | "solid" | "accent";
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 70, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  const bg =
    variant === "accent" ? C.accent : variant === "solid" ? "rgba(255,255,255,0.1)" : "transparent";
  const border =
    variant === "ghost" ? "rgba(255,255,255,0.15)" : "transparent";
  const textColor = variant === "accent" ? C.bg : C.white;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={press}
        style={[styles.navBtn, { backgroundColor: bg, borderColor: border }]}
      >
        <Text style={[styles.navBtnText, { color: textColor }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

// ─── Hero CTA Button ──────────────────────────────────────────────────────────
const HeroBtn = ({
  label,
  onPress,
  primary,
  icon,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  icon?: any;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 70, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={press}
        style={[styles.heroBtn, primary ? styles.heroBtnPrimary : styles.heroBtnSecondary]}
      >
        <Text style={[styles.heroBtnText, primary ? { color: C.bg } : { color: C.white }]}>
          {label}
        </Text>
        {icon && (
          <Ionicons name={icon} size={16} color={primary ? C.bg : C.white} style={{ marginLeft: 6 }} />
        )}
      </Pressable>
    </Animated.View>
  );
};

// ─── Step Card ────────────────────────────────────────────────────────────────
const StepCard = ({
  index,
  icon,
  title,
  description,
  delay,
}: {
  index: number;
  icon: any;
  title: string;
  description: string;
  delay: number;
}) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[styles.stepCard, { opacity: fade, transform: [{ translateY: slide }] }]}>
      <View style={styles.stepIndex}>
        <Text style={styles.stepIndexText}>{String(index).padStart(2, "0")}</Text>
      </View>
      <View style={styles.stepIconWrap}>
        <Ionicons name={icon} size={20} color={C.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{description}</Text>
      </View>
    </Animated.View>
  );
};

// ─── Stat Chip ────────────────────────────────────────────────────────────────
const Stat = ({ num, label }: { num: string; label: string }) => (
  <View style={styles.stat}>
    <Text style={styles.statNum}>{num}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Feature Tile ─────────────────────────────────────────────────────────────
const Tile = ({ icon, label, sub }: { icon: any; label: string; sub: string }) => (
  <View style={styles.tile}>
    <View style={styles.tileIcon}>
      <Ionicons name={icon} size={18} color={C.accent} />
    </View>
    <Text style={styles.tileLabel}>{label}</Text>
    <Text style={styles.tileSub}>{sub}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const steps = [
    {
      icon: "person-add-outline",
      title: "Register your account",
      description: "Sign up with your name, email, and password in under a minute.",
    },
    {
      icon: "qr-code-outline",
      title: "Join with an invite code",
      description: "Your admin shares a room code — enter it to join your group instantly.",
    },
    {
      icon: "pulse-outline",
      title: "Track live balances",
      description: "Every expense is split and displayed in real time for all members.",
    },
    {
      icon: "checkmark-done-outline",
      title: "Settle & close the month",
      description: "Admin closes the month once all dues are settled — clean slate every time.",
    },
  ];

  return (
    <View style={styles.screen}>
      {/* Orbs */}
      <Orb size={380} color={C.accentGlow} style={{ top: -140, left: -140 }} />
      <Orb size={280} color={C.purpleGlow} style={{ top: 300, right: -100 }} />
      <Orb size={200} color={C.accentGlow} style={{ bottom: 100, left: "40%" }} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* ── NAVBAR ── */}
        <Animated.View style={[styles.navbar, { opacity: fadeIn }]}>
          {/* Logo */}
          <View style={styles.navLogo}>
            <View style={styles.navLogoIcon}>
              <Ionicons name="wallet" size={20} color={C.accent} />
            </View>
            <View>
              <Text style={styles.navAppName}>{APP_NAME}</Text>
              <Text style={styles.navTagline}>room expense tracker</Text>
            </View>
          </View>

          {/* Nav buttons */}
          <View style={styles.navActions}>
            <NavBtn label="Login" onPress={() => navigation.navigate("Login")} variant="ghost" />
            <NavBtn label="Register" onPress={() => navigation.navigate("Register")} variant="accent" />
          </View>
        </Animated.View>

        <View style={[styles.body, isDesktop && styles.bodyDesktop]}>

          {/* ── HERO SECTION ── */}
          <Animated.View
            style={[
              styles.heroSection,
              isDesktop && styles.heroSectionDesktop,
              { opacity: fadeIn, transform: [{ translateY: slideUp }] },
            ]}
          >
            {/* Left: Copy */}
            <View style={[styles.heroLeft, isDesktop && { flex: 1 }]}>
              <View style={styles.eyebrowChip}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.eyebrowText}>Now available on web & mobile</Text>
              </View>

              <Text style={[styles.heroHeading, isDesktop && styles.heroHeadingDesktop]}>
                Split bills.{"\n"}
                <Text style={{ color: C.accent }}>No drama.</Text>
              </Text>

              <Text style={styles.heroBody}>
                Register your account, join a room group with an invite code, and let {APP_NAME} handle
                who paid, who owes, and when to close the month — automatically.
              </Text>

              <View style={styles.heroCtas}>
                <HeroBtn
                  label="Get started"
                  onPress={() => navigation.navigate("Register")}
                  primary
                  icon="arrow-forward"
                />
                <HeroBtn
                  label="Sign in"
                  onPress={() => navigation.navigate("Login")}
                  icon="log-in-outline"
                />
              </View>

              {/* Stats */}
              <View style={styles.statsRow}>
                <Stat num="10k+" label="Users" />
                <View style={styles.statDivider} />
                <Stat num="₹2M+" label="Settled" />
                <View style={styles.statDivider} />
                <Stat num="4.9★" label="Rating" />
              </View>
            </View>

            {/* Right: Feature tiles (desktop) or condensed (mobile) */}
            {isDesktop ? (
              <View style={styles.heroRight}>
                {/* Mock dashboard card */}
                <View style={styles.mockCard}>
                  <View style={styles.mockCardHeader}>
                    <Text style={styles.mockCardTitle}>Room Balance</Text>
                    <View style={styles.liveChip}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>Live</Text>
                    </View>
                  </View>
                  <Text style={styles.mockAmount}>₹4,280</Text>
                  <Text style={styles.mockSub}>Outstanding across 3 members</Text>

                  {/* Member list */}
                  {[
                    { name: "Rahul", owes: "₹1,200", color: "#6EE7B7" },
                    { name: "Sneha", owes: "₹980", color: "#818CF8" },
                    { name: "Arjun", owes: "₹2,100", color: "#F472B6" },
                  ].map((m) => (
                    <View key={m.name} style={styles.mockMember}>
                      <View style={[styles.mockAvatar, { backgroundColor: m.color + "22", borderColor: m.color + "44" }]}>
                        <Text style={[styles.mockAvatarText, { color: m.color }]}>{m.name[0]}</Text>
                      </View>
                      <Text style={styles.mockMemberName}>{m.name}</Text>
                      <View style={styles.mockOwesChip}>
                        <Text style={styles.mockOwesText}>Owes {m.owes}</Text>
                      </View>
                    </View>
                  ))}

                  <Pressable style={styles.mockSettleBtn}>
                    <Text style={styles.mockSettleBtnText}>Settle all →</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              // Mobile tiles
              <View style={styles.mobileTiles}>
                <Tile icon="flash-outline" label="Instant" sub="Signup in 30s" />
                <Tile icon="bar-chart-outline" label="Clear" sub="Live balances" />
                <Tile icon="shield-checkmark-outline" label="Secure" sub="Admin controls" />
              </View>
            )}
          </Animated.View>

          {/* ── HOW IT WORKS ── */}
          <View style={[styles.section, isDesktop && styles.sectionDesktop]}>
            <View style={[styles.sectionLeft, isDesktop && { flex: 1 }]}>
              <Text style={styles.sectionEyebrow}>How it works</Text>
              <Text style={styles.sectionHeading}>
                Up and running{"\n"}
                <Text style={{ color: C.accent }}>in four steps.</Text>
              </Text>
              <Text style={styles.sectionBody}>
                No complex setup. Just register, join your room group, and start
                tracking. The dashboard does the rest.
              </Text>

              {isDesktop && (
                <View style={{ marginTop: 28 }}>
                  <HeroBtn
                    label="Create your account"
                    onPress={() => navigation.navigate("Register")}
                    primary
                    icon="arrow-forward"
                  />
                </View>
              )}
            </View>

            <View style={[styles.stepsList, isDesktop && { flex: 1 }]}>
              {steps.map((s, i) => (
                <StepCard
                  key={s.title}
                  index={i + 1}
                  icon={s.icon as any}
                  title={s.title}
                  description={s.description}
                  delay={i * 100}
                />
              ))}
            </View>
          </View>

          {/* ── CTA BANNER ── */}
          <View style={styles.ctaBanner}>
            <View style={styles.ctaBannerGlow} />
            <Text style={styles.ctaEyebrow}>Ready to simplify?</Text>
            <Text style={styles.ctaHeading}>
              Join your room group today.
            </Text>
            <Text style={styles.ctaBody}>
              Register free, get an invite code from your admin, and start tracking shared expenses in minutes.
            </Text>
            <View style={styles.ctaBtns}>
              <HeroBtn label="Register now" onPress={() => navigation.navigate("Register")} primary icon="arrow-forward" />
              <HeroBtn label="Already have an account? Login" onPress={() => navigation.navigate("Login")} />
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 20, paddingBottom: 60 },
  bodyDesktop: { paddingHorizontal: 60, maxWidth: 1200, alignSelf: "center", width: "100%" },

  // Navbar
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
    backgroundColor: "rgba(13,18,48,0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  navLogo: { flexDirection: "row", alignItems: "center", gap: 12 },
  navLogoIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(110,231,183,0.12)",
    borderWidth: 1,
    borderColor: "rgba(110,231,183,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  navAppName: { fontSize: 16, fontWeight: "900", color: C.white, letterSpacing: -0.3 },
  navTagline: { fontSize: 10, color: C.slate400, textTransform: "uppercase", letterSpacing: 1.2, marginTop: 1 },
  navActions: { flexDirection: "row", gap: 8 },
  navBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  navBtnText: { fontSize: 13, fontWeight: "700" },

  // Hero
  heroSection: { paddingTop: 36, paddingBottom: 16, gap: 32 },
  heroSectionDesktop: { flexDirection: "row", alignItems: "center", gap: 60, paddingTop: 60 },
  heroLeft: {},
  eyebrowChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    backgroundColor: "rgba(110,231,183,0.08)",
    borderWidth: 1,
    borderColor: "rgba(110,231,183,0.2)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 18,
  },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  eyebrowText: { fontSize: 12, fontWeight: "600", color: C.accent },
  heroHeading: {
    fontSize: 40,
    fontWeight: "900",
    color: C.white,
    lineHeight: 48,
    letterSpacing: -1.2,
  },
  heroHeadingDesktop: { fontSize: 58, lineHeight: 66 },
  heroBody: {
    fontSize: 15,
    color: C.slate400,
    lineHeight: 26,
    marginTop: 14,
    maxWidth: 480,
  },
  heroCtas: { flexDirection: "row", gap: 12, marginTop: 28, flexWrap: "wrap" },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
  },
  heroBtnPrimary: { backgroundColor: C.accent },
  heroBtnSecondary: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroBtnText: { fontSize: 15, fontWeight: "800" },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginTop: 32,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    overflow: "hidden",
  },
  stat: { paddingHorizontal: 20, paddingVertical: 14, alignItems: "center" },
  statNum: { fontSize: 18, fontWeight: "900", color: C.accent },
  statLabel: { fontSize: 10, color: C.slate400, marginTop: 2, textTransform: "uppercase", letterSpacing: 0.8 },
  statDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.08)" },

  // Mock card (desktop hero right)
  heroRight: { flex: 1, alignItems: "center" },
  mockCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 22,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
  },
  mockCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  mockCardTitle: { fontSize: 12, fontWeight: "600", color: C.slate400, textTransform: "uppercase", letterSpacing: 0.8 },
  liveChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(110,231,183,0.12)",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  liveText: { fontSize: 10, fontWeight: "700", color: C.accent },
  mockAmount: { fontSize: 34, fontWeight: "900", color: C.white, letterSpacing: -1 },
  mockSub: { fontSize: 12, color: C.slate400, marginTop: 2, marginBottom: 18 },
  mockMember: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  mockAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mockAvatarText: { fontSize: 13, fontWeight: "800" },
  mockMemberName: { flex: 1, fontSize: 14, fontWeight: "600", color: C.white },
  mockOwesChip: {
    backgroundColor: "rgba(248,113,113,0.1)",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  mockOwesText: { fontSize: 12, fontWeight: "700", color: "#F87171" },
  mockSettleBtn: {
    marginTop: 16,
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  mockSettleBtnText: { fontSize: 14, fontWeight: "800", color: C.bg },

  // Mobile tiles
  mobileTiles: { flexDirection: "row", gap: 10, marginTop: 4 },
  tile: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(110,231,183,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  tileLabel: { fontSize: 13, fontWeight: "800", color: C.white, textAlign: "center" },
  tileSub: { fontSize: 11, color: C.slate400, textAlign: "center", marginTop: 2 },

  // How it works
  section: { marginTop: 64, gap: 32 },
  sectionDesktop: { flexDirection: "row", alignItems: "flex-start", gap: 60 },
  sectionLeft: {},
  sectionEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 34,
    fontWeight: "900",
    color: C.white,
    lineHeight: 42,
    letterSpacing: -0.8,
  },
  sectionBody: {
    fontSize: 14,
    color: C.slate400,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 340,
  },
  stepsList: { gap: 12 },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 16,
  },
  stepIndex: {
    minWidth: 28,
    alignItems: "center",
    paddingTop: 2,
  },
  stepIndexText: { fontSize: 11, fontWeight: "800", color: C.slate600, letterSpacing: 0.5 },
  stepIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "rgba(110,231,183,0.1)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepTitle: { fontSize: 14, fontWeight: "700", color: C.white, marginBottom: 3 },
  stepDesc: { fontSize: 13, color: C.slate400, lineHeight: 20 },

  // CTA Banner
  ctaBanner: {
    marginTop: 64,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    overflow: "hidden",
  },
  ctaBannerGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(110,231,183,0.06)",
    top: -80,
    alignSelf: "center",
  },
  ctaEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: C.accent,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  ctaHeading: {
    fontSize: 30,
    fontWeight: "900",
    color: C.white,
    textAlign: "center",
    letterSpacing: -0.6,
  },
  ctaBody: {
    fontSize: 14,
    color: C.slate400,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 420,
  },
  ctaBtns: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 24, justifyContent: "center" },
});

export default HomeScreen;