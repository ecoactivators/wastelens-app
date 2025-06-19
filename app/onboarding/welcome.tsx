import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: height * 0.03,
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
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
    paddingTop: height * 0.02,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: Math.min(width * 0.075, 30),
    marginBottom: 12,
    lineHeight: Math.min(width * 0.09, 36),
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: height * 0.05,
  },
  datePickerContainer: {
    flexDirection: 'row',
    gap: 10,
    height: Math.min(height * 0.35, 280),
  },
  picker: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  pickerContent: {
    paddingVertical: 16,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginHorizontal: 6,
    marginVertical: 1,
  },
  pickerText: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: height * 0.04,
    paddingTop: height * 0.02,
  },
  continueButton: {
    borderRadius: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
});