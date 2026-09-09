import React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {Colors} from "../../theme/colors";

const CreateProductScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Create Product</Text>

      <TextInput
        placeholder="Product Name"
        style={styles.input}
      />

      <TextInput
        placeholder="Batch Number"
        style={styles.input}
      />

      <TextInput
        placeholder="Description"
        style={[styles.input, styles.description]}
        multiline
      />

      <TouchableOpacity style={styles.button}
      >
        <Text style={styles.buttonText}>Generate QR</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default CreateProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 25,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },

  description: {
    height: 120,
  },

  button: {
    marginTop: 15,
    padding: 18,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
