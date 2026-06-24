import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
  Animated,
  useWindowDimensions,
  type LayoutChangeEvent,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../hooks/useAuth";
import { useExpenses } from "../../hooks/useExpenses";
import ExpenseCard from "../../component/ExpenseCard";
import EmptyState from "../../component/EmptyState";
import Loader from "../../component/Loader";
import UserNoteCard from "../../component/UserNoteCard";
import { APP_NAME } from "../../utils/constants";
import {
  calculateTotalExpense,
  formatCurrency,
  normalizeCategory,
} from "../../utils/helpers";
import type { Expense } from "../../types";
type IconName = React.ComponentProps<typeof Ionicons>["name"];

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#05081A",
  card: "#0D1230",
  cardBorder: "rgba(110,231,183,0.18)",
  cardBorderSubtle: "rgba(255,255,255,0.07)",
  accent: "#6EE7B7",
  accentGlow: "rgba(110,231,183,0.12)",
  purple: "#818CF8",
  purpleGlow: "rgba(129,140,248,0.15)",
  amber: "#FCD34D",
  amberGlow: "rgba(252,211,77,0.12)",
  red: "#F87171",
  redGlow: "rgba(248,113,113,0.12)",
  white: "#FFFFFF",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate600: "#475569",
  slate700: "#334155",
  inputBg: "rgba(255,255,255,0.05)",
  inputBorder: "rgba(255,255,255,0.1)",
  inputBorderFocus: "#6EE7B7",
};

// ─── Floating Orb ─────────────────────────────────────────────────────────────
const Orb = ({ size, color, style }: { size: number; color: string; style?: any }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.2, duration: 4500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 4500, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[{ position: "absolute", width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ scale: pulse }] }, style]}
    />
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, icon, accent,
}: { label: string; value: string; icon: IconName; accent: string }) => (
  <View style={[styles.statCard, { borderColor: accent + "30" }]}>
    <View style={[styles.statIconWrap, { backgroundColor: accent + "18" }]}>
      <Ionicons name={icon} size={18} color={accent} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── Quick Action Button ──────────────────────────────────────────────────────
const ActionBtn = ({
  label, icon, onPress, variant = "default",
}: { label: string; icon: IconName; onPress: () => void; variant?: "default" | "accent" | "danger" }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.95, duration: 70, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  const bg =
    variant === "accent" ? C.accent :
    variant === "danger" ? C.redGlow :
    "rgba(255,255,255,0.06)";
  const border =
    variant === "accent" ? "transparent" :
    variant === "danger" ? "rgba(248,113,113,0.25)" :
    C.cardBorderSubtle;
  const textColor =
    variant === "accent" ? C.bg :
    variant === "danger" ? C.red : C.white;
  const iconColor = textColor;

  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1, minWidth: 140 }}>
      <Pressable onPress={press} style={[styles.actionBtn, { backgroundColor: bg, borderColor: border }]}>
        <View style={[styles.actionBtnIcon, { backgroundColor: variant === "accent" ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.06)" }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={[styles.actionBtnText, { color: textColor }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

// ─── Edit Field ───────────────────────────────────────────────────────────────
const EditField = ({ label, placeholder, value, onChangeText, keyboardType, icon }: any) => {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const borderColor = anim.interpolate({ inputRange: [0, 1], outputRange: [C.inputBorder, C.inputBorderFocus] });
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.editLabel}>{label}</Text>
      <Animated.View style={[styles.editInput, { borderColor }]}>
        <Ionicons name={icon} size={16} color={focused ? C.accent : C.slate600} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.editInputText}
          placeholder={placeholder}
          placeholderTextColor={C.slate600}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => { setFocused(true); Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: false }).start(); }}
          onBlur={() => { setFocused(false); Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: false }).start(); }}
          keyboardType={keyboardType || "default"}
          selectionColor={C.accent}
        />
      </Animated.View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { expenses, loading, error, removeExpense, updateExpenseById, fetchExpenses } = useExpenses();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const scrollRef = useRef<ScrollView | null>(null);
  const [recentSectionY, setRecentSectionY] = useState(0);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const list: Expense[] = expenses;
  const totalExpense = calculateTotalExpense(list);
  const perHead = list.length ? totalExpense / Math.max(list.length, 1) : 0;
  const recentExpenses = list.slice(0, 4);

  const canManageExpense = (expense: Expense) => {
    const ownerId = expense.user?._id || expense.userId?._id;
    const ownerEmail = expense.user?.email || expense.userId?.email;
    return !!user && (user.role === "admin" || ownerId === user._id || ownerEmail === user.email);
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const stats: Array<{ label: string; value: string; icon: IconName; accent: string }> = [
    { label: "Total spent", value: formatCurrency(totalExpense), icon: "card-outline", accent: C.accent },
    { label: "Entries", value: String(list.length), icon: "layers-outline", accent: C.purple },
    { label: "Avg / item", value: formatCurrency(perHead), icon: "trending-up-outline", accent: C.amber },
  ];

  const jumpToRecentExpenses = () =>
    scrollRef.current?.scrollTo({ y: Math.max(recentSectionY - 16, 0), animated: true });

  const startEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setEditItemName(expense.itemName || "");
    setEditAmount(String(expense.amount ?? ""));
    setEditCategory(expense.category || "");
    scrollRef.current?.scrollTo({ y: Math.max(recentSectionY - 16, 0), animated: true });
  };

  const cancelEditExpense = () => {
    setEditingExpense(null);
    setEditItemName(""); setEditAmount(""); setEditCategory("");
  };

  const handleSaveExpense = async () => {
    if (!editingExpense) return;
    if (!editItemName.trim() || !editAmount.trim()) {
      Alert.alert("Missing info", "Item name and amount are required.");
      return;
    }
    try {
      setSavingEdit(true);
      await updateExpenseById(editingExpense._id, {
        itemName: editItemName.trim(),
        amount: Number(editAmount),
        category: normalizeCategory(editCategory),
      });
      await fetchExpenses();
      cancelEditExpense();
      Alert.alert("Updated", "Expense updated successfully.");
    } catch (e: any) {
      Alert.alert("Update failed", e?.response?.data?.message || "Could not update expense.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    Alert.alert("Delete expense", `Delete "${expense.itemName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await removeExpense(expense._id);
            if (editingExpense?._id === expense._id) cancelEditExpense();
          } catch (e: any) {
            Alert.alert("Delete failed", e?.response?.data?.message || "Could not delete.");
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    (async () => {
      try { await logout(); }
      catch { Alert.alert("Logout failed", "Please try again."); }
    })();
  };

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <View style={styles.screen}>
      {/* Background orbs */}
      <Orb size={360} color={C.accentGlow} style={{ top: -120, left: -130 }} />
      <Orb size={260} color={C.purpleGlow} style={{ top: 340, right: -90 }} />
      <Orb size={180} color={C.amberGlow} style={{ bottom: 200, left: "45%" }} />

      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.body, isDesktop && styles.bodyDesktop]}>

          {/* ── HERO HEADER ── */}
          <View style={styles.hero}>
            {/* Top bar */}
            <View style={styles.heroTopBar}>
              <View style={styles.heroLogoRow}>
                <View style={styles.heroLogoIcon}>
                  <Ionicons name="analytics" size={22} color={C.accent} />
                </View>
                <View>
                  <Text style={styles.heroAppName}>{APP_NAME}</Text>
                  <Text style={styles.heroAppSub}>Shared expense workspace</Text>
                </View>
              </View>
              <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                <Ionicons name="log-out-outline" size={16} color={C.slate400} />
                <Text style={styles.logoutBtnText}>Logout</Text>
              </Pressable>
            </View>

            {/* Greeting */}
            <View style={styles.greetingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingEyebrow}>
                  {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"} 👋
                </Text>
                <Text style={[styles.greetingName, isDesktop && styles.greetingNameDesktop]}>
                  {firstName}
                </Text>
                <Text style={styles.greetingBody}>
                  Here's your room's expense overview. Track, edit, and settle up — all in one place.
                </Text>
              </View>

              {/* Quick nav cards */}
              <View style={[styles.quickNavCards, isDesktop && { flexDirection: "column", width: 200 }]}>
                <Pressable
                  onPress={() => navigation.navigate("Expenses")}
                  style={styles.quickNavCard}
                >
                  <Text style={styles.quickNavCardLabel}>Total spent</Text>
                  <Text style={styles.quickNavCardValue}>{formatCurrency(totalExpense)}</Text>
                  <Ionicons name="arrow-forward" size={12} color={C.slate400} style={{ marginTop: 4 }} />
                </Pressable>
                <Pressable
                  onPress={() => navigation.navigate("Settlement")}
                  style={[styles.quickNavCard, { borderColor: C.cardBorder }]}
                >
                  <Text style={styles.quickNavCardLabel}>Next step</Text>
                  <Text style={[styles.quickNavCardValue, { color: C.accent }]}>Settle up</Text>
                  <Ionicons name="arrow-forward" size={12} color={C.accent} style={{ marginTop: 4 }} />
                </Pressable>
              </View>
            </View>

            {/* Stat cards */}
            <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
              {stats.map((s) => (
                <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />
              ))}
            </View>
          </View>

          {/* ── QUICK ACTIONS + STATUS ── */}
          <View style={[styles.row, isDesktop && styles.rowDesktop]}>
            {/* Quick actions */}
            <View style={[styles.sectionCard, { flex: isDesktop ? 1.4 : undefined }]}>
              <View style={styles.sectionCardHeader}>
                <View style={[styles.sectionCardIcon, { backgroundColor: "rgba(110,231,183,0.1)" }]}>
                  <Ionicons name="flash" size={18} color={C.accent} />
                </View>
                <View>
                  <Text style={styles.sectionCardTitle}>Quick actions</Text>
                  <Text style={styles.sectionCardSub}>Jump to common tasks fast</Text>
                </View>
              </View>
              <View style={styles.actionGrid}>
                <ActionBtn label="Add expense" icon="add-circle-outline" onPress={() => navigation.navigate("AddExpense")} variant="accent" />
                <ActionBtn label="Update expenses" icon="create-outline" onPress={jumpToRecentExpenses} />
                <ActionBtn label="Settlement" icon="checkmark-done-outline" onPress={() => navigation.navigate("Settlement")} />
                <ActionBtn label="Logout" icon="log-out-outline" onPress={handleLogout} variant="danger" />
              </View>
            </View>

            {/* Status */}
            <View style={[styles.sectionCard, { flex: 1 }]}>
              <View style={styles.sectionCardHeader}>
                <View style={[styles.sectionCardIcon, { backgroundColor: error ? C.redGlow : "rgba(110,231,183,0.1)" }]}>
                  <Ionicons
                    name={error ? "warning-outline" : "shield-checkmark-outline"}
                    size={18}
                    color={error ? C.red : C.accent}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionCardTitle}>Connection status</Text>
                  <Text style={styles.sectionCardSub}>
                    {error ? "Backend unreachable — demo data shown" : "Live data connected"}
                  </Text>
                </View>
              </View>
              {/* Role badge */}
              {user?.role && (
                <View style={styles.roleBadge}>
                  <Ionicons
                    name={user.role === "admin" ? "shield-checkmark" : "person"}
                    size={13}
                    color={user.role === "admin" ? C.amber : C.purple}
                  />
                  <Text style={[styles.roleBadgeText, { color: user.role === "admin" ? C.amber : C.purple }]}>
                    {user.role === "admin" ? "Admin access" : "Member access"}
                  </Text>
                </View>
              )}
              <View style={styles.statusDotRow}>
                <View style={[styles.statusDot, { backgroundColor: error ? C.red : C.accent }]} />
                <Text style={styles.statusDotText}>{error ? "Offline" : "Online"}</Text>
              </View>
            </View>
          </View>

          {/* ── USER NOTE CARD ── */}
          <View style={{ marginTop: 16 }}>
            <UserNoteCard />
          </View>

          {/* ── RECENT EXPENSES ── */}
          <View
            style={styles.sectionCard}
            onLayout={(e: LayoutChangeEvent) => setRecentSectionY(e.nativeEvent.layout.y)}
          >
            <View style={styles.recentHeader}>
              <View>
                <Text style={styles.sectionCardTitle}>Recent expenses</Text>
                <Text style={styles.sectionCardSub}>Latest {recentExpenses.length} entries in your room</Text>
              </View>
              <View style={styles.recentCount}>
                <Text style={styles.recentCountText}>{recentExpenses.length} shown</Text>
              </View>
            </View>

            {/* Edit form */}
            {editingExpense && (
              <View style={styles.editForm}>
                <View style={styles.editFormHeader}>
                  <View style={[styles.sectionCardIcon, { backgroundColor: C.amberGlow }]}>
                    <Ionicons name="create-outline" size={16} color={C.amber} />
                  </View>
                  <View>
                    <Text style={styles.editFormTitle}>Edit expense</Text>
                    <Text style={styles.editFormSub}>Update the details below</Text>
                  </View>
                </View>

                <View style={{ marginTop: 16 }}>
                  <EditField label="Item name" placeholder="e.g. Groceries" value={editItemName} onChangeText={setEditItemName} icon="pricetag-outline" />
                  <EditField label="Amount (₹)" placeholder="e.g. 500" value={editAmount} onChangeText={setEditAmount} keyboardType="numeric" icon="cash-outline" />
                  <EditField label="Category" placeholder="e.g. Food" value={editCategory} onChangeText={setEditCategory} icon="grid-outline" />
                </View>

                <View style={styles.editFormActions}>
                  <Pressable onPress={handleSaveExpense} style={styles.editSaveBtn} disabled={savingEdit}>
                    {savingEdit ? (
                      <ActivityIndicator size="small" color={C.bg} />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={16} color={C.bg} />
                        <Text style={styles.editSaveBtnText}>Save changes</Text>
                      </>
                    )}
                  </Pressable>
                  <Pressable onPress={cancelEditExpense} style={styles.editCancelBtn}>
                    <Ionicons name="close" size={16} color={C.slate400} />
                    <Text style={styles.editCancelBtnText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Expense list */}
            <View style={{ gap: 10, marginTop: editingExpense ? 16 : 8 }}>
              {recentExpenses.length ? (
                recentExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense._id}
                    expense={expense}
                    canEdit={canManageExpense(expense)}
                    canDelete={canManageExpense(expense)}
                    onEdit={canManageExpense(expense) ? () => startEditExpense(expense) : undefined}
                    onDelete={canManageExpense(expense) ? () => handleDeleteExpense(expense) : undefined}
                  />
                ))
              ) : (
                <EmptyState title="No expenses yet" />
              )}
            </View>

            {/* See all link */}
            {list.length > 4 && (
              <Pressable
                onPress={() => navigation.navigate("Expenses")}
                style={styles.seeAllBtn}
              >
                <Text style={styles.seeAllText}>See all {list.length} expenses</Text>
                <Ionicons name="arrow-forward" size={14} color={C.accent} />
              </Pressable>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80, gap: 16 },
  bodyDesktop: { paddingHorizontal: 48, paddingTop: 24, maxWidth: 1200, alignSelf: "center", width: "100%" },

  // Hero
  hero: {
    backgroundColor: C.card,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 24,
    overflow: "hidden",
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 30,
    elevation: 8,
  },
  heroTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  heroLogoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroLogoIcon: {
    width: 42, height: 42, borderRadius: 13,
    backgroundColor: "rgba(110,231,183,0.12)",
    borderWidth: 1, borderColor: "rgba(110,231,183,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  heroAppName: { fontSize: 15, fontWeight: "900", color: C.white, letterSpacing: -0.3 },
  heroAppSub: { fontSize: 10, color: C.slate400, textTransform: "uppercase", letterSpacing: 1 },
  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
  },
  logoutBtnText: { fontSize: 12, fontWeight: "600", color: C.slate400 },

  greetingRow: { flexDirection: "row", alignItems: "flex-start", gap: 16, marginBottom: 24 },
  greetingEyebrow: { fontSize: 13, color: C.slate400, marginBottom: 4 },
  greetingName: { fontSize: 32, fontWeight: "900", color: C.white, letterSpacing: -0.8, lineHeight: 38 },
  greetingNameDesktop: { fontSize: 44, lineHeight: 50 },
  greetingBody: { fontSize: 13, color: C.slate400, lineHeight: 20, marginTop: 6, maxWidth: 400 },

  quickNavCards: { flexDirection: "row", gap: 8 },
  quickNavCard: {
    minWidth: 110, flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: C.cardBorderSubtle,
    borderRadius: 16, padding: 12,
  },
  quickNavCardLabel: { fontSize: 10, fontWeight: "600", color: C.slate400, textTransform: "uppercase", letterSpacing: 0.6 },
  quickNavCardValue: { fontSize: 16, fontWeight: "900", color: C.white, marginTop: 4 },

  statsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  statsRowDesktop: { flexWrap: "nowrap" },
  statCard: {
    flex: 1, minWidth: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderRadius: 18, padding: 16,
    gap: 8,
  },
  statIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontWeight: "900", color: C.white, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: "600", color: C.slate400, textTransform: "uppercase", letterSpacing: 0.6 },

  // Row layout
  row: { gap: 16 },
  rowDesktop: { flexDirection: "row" },

  // Section card (generic white card equivalent)
  sectionCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.cardBorderSubtle,
    padding: 20,
  },
  sectionCardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  sectionCardIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  sectionCardTitle: { fontSize: 15, fontWeight: "800", color: C.white },
  sectionCardSub: { fontSize: 12, color: C.slate400, marginTop: 1 },

  // Action buttons
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    borderWidth: 1, borderRadius: 14,
    paddingVertical: 11, paddingHorizontal: 14,
  },
  actionBtnIcon: { width: 26, height: 26, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  actionBtnText: { fontSize: 13, fontWeight: "700" },

  // Status card extras
  roleBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 10,
  },
  roleBadgeText: { fontSize: 12, fontWeight: "700" },
  statusDotRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusDotText: { fontSize: 12, color: C.slate400 },

  // Recent section
  recentHeader: {
    flexDirection: "row", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: 4,
  },
  recentCount: {
    backgroundColor: "rgba(110,231,183,0.08)",
    borderWidth: 1, borderColor: "rgba(110,231,183,0.2)",
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  recentCountText: { fontSize: 11, fontWeight: "700", color: C.accent },

  // Edit form
  editForm: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1, borderColor: "rgba(252,211,77,0.2)",
    borderRadius: 20, padding: 16,
  },
  editFormHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  editFormTitle: { fontSize: 14, fontWeight: "800", color: C.white },
  editFormSub: { fontSize: 12, color: C.slate400, marginTop: 1 },
  editLabel: {
    fontSize: 11, fontWeight: "600", color: C.slate400,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6,
  },
  editInput: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.inputBg, borderWidth: 1.5, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 11,
  },
  editInputText: { flex: 1, fontSize: 14, color: C.white, padding: 0 },
  editFormActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  editSaveBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: C.accent, borderRadius: 12, paddingVertical: 12,
  },
  editSaveBtnText: { fontSize: 14, fontWeight: "800", color: C.bg },
  editCancelBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1, borderColor: C.cardBorderSubtle,
    borderRadius: 12, paddingVertical: 12,
  },
  editCancelBtnText: { fontSize: 14, fontWeight: "700", color: C.slate400 },

  // See all
  seeAllBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)",
  },
  seeAllText: { fontSize: 13, fontWeight: "700", color: C.accent },
});

export default DashboardScreen;