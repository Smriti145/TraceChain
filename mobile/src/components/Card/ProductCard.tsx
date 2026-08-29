import React from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from "react-native";

const ProductCard = ({
  title,
  subtitle,
  status,
}: any) => {
  return (
    <TouchableOpacity style={styles.card}>
      <View>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>

      <Text style={styles.status}>{status}</Text>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    fontWeight: "700",
  },

  subtitle: {
    color: "#64748B",
    marginTop: 5,
  },

  status: {
    color: "#22C55E",
  },
});