import React from "react";
import {TextInput, StyleSheet} from "react-native";

const SearchBar = ({placeholder}: any) => {
  return (
    <TextInput
      placeholder={placeholder}
      style={styles.input}
    />
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 15,
    marginBottom: 15,
  },
});