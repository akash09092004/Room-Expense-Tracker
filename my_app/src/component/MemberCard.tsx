import React from "react";
import { View, Text } from "react-native";
import { generateAvatar } from "../utils/helpers";
import type { Member } from "../types";

type MemberCardProps = {
  member: Member;
};

const MemberCard = ({ member }: MemberCardProps) => {
  return (
    <View className="mb-3 flex-row items-center rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-brand-600">
        <Text className="text-sm font-bold text-white">
          {generateAvatar(member.name)}
        </Text>
      </View>

      <View className="flex-1">
        <Text className="text-base font-semibold text-slate-900">
          {member.name}
        </Text>

        <Text className="text-sm text-slate-500">
          {member.email}
        </Text>
      </View>

      <View
        className={`rounded-full px-3 py-1 ${
          member.role === "admin" ? "bg-emerald-50" : "bg-brand-50"
        }`}
      >
        <Text
          className={`text-xs font-bold uppercase tracking-wide ${
            member.role === "admin"
              ? "text-emerald-700"
              : "text-brand-700"
          }`}
        >
          {member.role}
        </Text>
      </View>
    </View>
  );
};

export default MemberCard;
