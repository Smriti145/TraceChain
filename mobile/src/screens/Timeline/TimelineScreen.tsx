import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SvgIcon from "../../components/SvgIcon";
import {Colors} from "../../theme/colors";

const TimelineScreen = ({ navigation, route }: any) => {
  const timeline = route.params?.traces || [];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <SvgIcon name="arrow-back" size={22} color={Colors.black} />
      </TouchableOpacity>
      <Text style={styles.eyebrow}>PROVENANCE RECORD</Text>
      <Text style={styles.heading}>Product journey</Text>

      {timeline.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No trace information available.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {timeline.map((item: any, index: number) => (
            <View key={index} style={styles.item}>
              <View style={styles.leftContainer}>
                <View style={styles.circle} />

                {index !== timeline.length - 1 && (
                  <View style={styles.line} />
                )}
              </View>

              <View style={styles.content}>
                <Text style={styles.title}>
                  {item.stage}
                </Text>

                <Text style={styles.date}>
                  {item.eventDate ? new Date(item.eventDate).toLocaleDateString() : "Date not recorded"}
                </Text>

                <Text style={styles.location}>
                  {item.location}
                </Text>

                {item.temperature != null ? <Text style={styles.status}>{item.temperature}°C</Text> : null}
                {item.remarks ? <Text style={styles.remarks}>{item.remarks}</Text> : null}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.popToTop()}
      >
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TimelineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },

  heading: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
    color: Colors.black,
  },
  eyebrow: {fontSize: 10, fontWeight: "700", letterSpacing: 1.3, color: Colors.primary, marginTop: 22, marginBottom: 5},
  back: {width: 43, height: 43, borderRadius: 13, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center"},

  scrollView: {
    flex: 1,
  },

  item: {
    flexDirection: "row",
    marginBottom: 25,
  },

  leftContainer: {
    alignItems: "center",
    width: 20,
  },

  circle: {
    width: 18,
    height: 18,
    borderRadius: 10,
    backgroundColor: Colors.success,
  },

  line: {
    width: 3,
    height: 90,
    backgroundColor: Colors.border,
  },

  content: {
    marginLeft: 20,
    flex: 1,
  },

  title: {
    fontWeight: "700",
    fontSize: 18,
    color: "#111827",
  },

  date: {
    marginTop: 5,
    color: "#64748B",
    fontSize: 14,
  },

  location: {
    marginTop: 5,
    color: "#64748B",
    fontSize: 14,
  },

  status: {
    marginTop: 10,
    color: Colors.success,
    fontWeight: "700",
    fontSize: 15,
  },
  remarks: {marginTop: 7, color: Colors.gray, fontSize: 12, lineHeight: 18},

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#64748B",
    fontSize: 16,
  },

  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
