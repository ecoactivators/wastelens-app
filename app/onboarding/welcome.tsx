import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 80 }, (_, i) => currentYear - i);
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState<string>('January');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2000);

  const handleContinue = () => {
    router.push('/onboarding/location');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.background, theme.colors.surface]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={theme.colors.text} strokeWidth={2} />
          </TouchableOpacity>
          
          {/* Progress Bar */}
          <View style={[styles.progressContainer, { backgroundColor: theme.colors.border }]}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.text, width: '25%' }]} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            When were you born?
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            This will be used to personalize your waste reduction goals.
          </Text>

          {/* Date Picker */}
          <View style={styles.datePickerContainer}>
            <ScrollView 
              style={[styles.picker, { backgroundColor: theme.colors.surface }]}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pickerContent}
            >
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.pickerItem,
                    selectedMonth === month && { backgroundColor: theme.colors.primaryLight }
                  ]}
                  onPress={() => setSelectedMonth(month)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.pickerText,
                    { color: selectedMonth === month ? theme.colors.primary : theme.colors.textSecondary }
                  ]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView 
              style={[styles.picker, { backgroundColor: theme.colors.surface }]}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pickerContent}
            >
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.pickerItem,
                    selectedDay === day && { backgroundColor: theme.colors.primaryLight }
                  ]}
                  onPress={() => setSelectedDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.pickerText,
                    { color: selectedDay === day ? theme.colors.primary : theme.colors.textSecondary }
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView 
              style={[styles.picker, { backgroundColor: theme.colors.surface }]}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.pickerContent}
            >
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    selectedYear === year && { backgroundColor: theme.colors.primaryLight }
                  ]}
                  onPress={() => setSelectedYear(year)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.pickerText,
                    { color: selectedYear === year ? theme.colors.primary : theme.colors.textSecondary }
                  ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.continueButton, { backgroundColor: theme.colors.text }]}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={[styles.buttonText, { color: theme.colors.surface }]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 60,
  },
  datePickerContainer: {
    flexDirection: 'row',
    gap: 12,
    height: 300,
  },
  picker: {
    flex: 1,
    borderRadius: 16,
    maxHeight: 300,
  },
  pickerContent: {
    paddingVertical: 20,
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  pickerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  continueButton: {
    borderRadius: 25,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
});