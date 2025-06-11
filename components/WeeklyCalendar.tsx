import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface WeeklyCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function WeeklyCalendar({ selectedDate, onDateSelect }: WeeklyCalendarProps) {
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <View style={styles.container}>
      {weekDates.map((date, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dayContainer,
            isSelected(date) && styles.selectedDay,
          ]}
          onPress={() => onDateSelect(date)}
        >
          <Text style={[
            styles.dayLabel,
            isSelected(date) && styles.selectedDayLabel,
          ]}>
            {dayLabels[index]}
          </Text>
          <Text style={[
            styles.dayNumber,
            isSelected(date) && styles.selectedDayNumber,
          ]}>
            {date.getDate()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  dayContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 20,
    minWidth: 40,
  },
  selectedDay: {
    backgroundColor: '#000000',
  },
  dayLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  selectedDayLabel: {
    color: '#ffffff',
  },
  dayNumber: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#111827',
  },
  selectedDayNumber: {
    color: '#ffffff',
  },
});