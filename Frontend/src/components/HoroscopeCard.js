import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

const EMPTY_VALUE = "-";

export default function HoroscopeCard({
  signName,
  dateRange,
  prediction,
  luckyColor,
  luckyNumber,
  luckyLetter,
}) {
  const { colors, spacing, typography, borderRadius, shadows } = useContext(ThemeContext);

  const attributes = [
    { label: "Lucky Color", value: luckyColor },
    { label: "Lucky Number", value: luckyNumber },
    { label: "Lucky Letter", value: luckyLetter },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderRadius: borderRadius.xl, padding: spacing.xl, ...shadows.soft }]}>
      <View style={[styles.headerRow, { marginBottom: spacing.md }]}>
        <View>
          <Text style={{ fontSize: typography.sizes.h2, fontWeight: typography.weights.bold, color: colors.primary }}>{signName}</Text>
          {dateRange && <Text style={[styles.dateRange, { fontSize: typography.sizes.small, color: colors.textSub }]}>{dateRange}</Text>}
        </View>
        <Text style={styles.zodiacIcon}>*</Text>
      </View>

      <Text style={[styles.prediction, { fontSize: typography.sizes.body, color: colors.textMain, lineHeight: 22, marginBottom: spacing.xl }]}>{prediction}</Text>

      <View style={[styles.attributesGrid, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: borderRadius.md, paddingVertical: spacing.md, paddingHorizontal: spacing.sm }]}>
        {attributes.map((attribute, index) => (
          <React.Fragment key={attribute.label}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            <View style={styles.attributeItem}>
              <Text style={{ fontSize: typography.sizes.caption, fontWeight: typography.weights.medium, color: colors.textSub }}>{attribute.label}</Text>
              <Text numberOfLines={1} style={[styles.attributeValue, { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: colors.primary }]}>{attribute.value || EMPTY_VALUE}</Text>
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dateRange: { marginTop: 2 },
  zodiacIcon: { fontSize: 28 },
  prediction: {},
  attributesGrid: { flexDirection: "row", alignItems: "stretch", borderWidth: 1 },
  attributeItem: { flex: 1, alignItems: "center", paddingHorizontal: 3 },
  attributeValue: { marginTop: 5, textAlign: "center" },
  divider: { width: 1, marginVertical: 2 },
});
