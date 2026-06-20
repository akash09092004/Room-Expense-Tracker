import React, { useEffect, useMemo, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";

import CustomButton from "./CustomButton";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/helpers";
import {
  getNoteExpiry,
  isNoteLocked,
  loadUserNote,
  saveUserNote,
} from "../utils/userNotes";
import type { UserNote } from "../types";

const formatRemainingTime = (ms: number) => {
  if (ms <= 0) return "Locked";

  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m left`;
};

const UserNoteCard = () => {
  const { user } = useAuth();
  const userId = user?._id || user?.email || "";
  const [note, setNote] = useState<UserNote | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const savedNote = await loadUserNote(userId);

        if (!mounted) return;

        setNote(savedNote);
        setDraft(savedNote?.text || "");
      } catch (error) {
        console.log(error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [userId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, []);

  const locked = useMemo(() => {
    if (!note) return false;
    return isNoteLocked(note.createdAt);
  }, [note]);

  const remainingLabel = useMemo(() => {
    if (!note) return "You can save your note and edit it for 12 hours.";

    const remaining = getNoteExpiry(note.createdAt) - now;
    return locked
      ? "Locked after 12 hours."
      : `Editable for ${formatRemainingTime(remaining)}`;
  }, [locked, note, now]);

  const handleSave = async () => {
    if (!userId) {
      Alert.alert("Login required", "Please login to save your note.");
      return;
    }

    if (note && locked) {
      Alert.alert(
        "Locked",
        "This note can no longer be edited after 12 hours."
      );
      return;
    }

    try {
      setSaving(true);
      const savedNote = await saveUserNote(userId, draft);
      setNote(savedNote);
      setDraft(savedNote?.text || "");
      Alert.alert("Saved", savedNote ? "Your note is saved." : "Note cleared.");
    } catch (error: any) {
      Alert.alert(
        "Save failed",
        error?.message || "Could not save note right now."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-950">Your note</Text>
          <Text className="mt-1 text-sm text-slate-500">
            Write what items you brought and their price. You can edit it for
            12 hours after saving.
          </Text>
        </View>

        <View className="rounded-full bg-brand-50 px-3 py-1">
          <Text className="text-xs font-semibold text-brand-700">
            {locked ? "Locked" : "Editable"}
          </Text>
        </View>
      </View>

      <View className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        {loading ? (
          <Text className="text-sm text-slate-500">Loading note...</Text>
        ) : (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Example: I brought bread, milk, soap, tea. Price: 3444"
            placeholderTextColor="#94a3b8"
            multiline
            editable={!locked}
            textAlignVertical="top"
            className="min-h-[120px] text-base text-slate-900"
          />
        )}
      </View>

      <View className="mt-3 flex-row items-center justify-between gap-3">
        <Text className="flex-1 text-xs leading-5 text-slate-500">
          {remainingLabel}
        </Text>

        <CustomButton
          title={note ? "Update note" : "Save note"}
          onPress={handleSave}
          loading={saving}
          disabled={loading || locked}
          className="min-w-[140px]"
        />
      </View>

      {note ? (
        <Text className="mt-3 text-xs text-slate-400">
          Last saved on {formatDate(note.updatedAt)}
        </Text>
      ) : null}
    </View>
  );
};

export default UserNoteCard;
