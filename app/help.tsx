import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Send, Bot, User, Sparkles, MessageCircle, Lightbulb } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickQuestion {
  id: string;
  question: string;
  category: 'getting-started' | 'features' | 'troubleshooting';
}

const quickQuestions: QuickQuestion[] = [
  {
    id: '1',
    question: 'How do I snap my first waste item?',
    category: 'getting-started'
  },
  {
    id: '2',
    question: 'What is the environmental score?',
    category: 'features'
  },
  {
    id: '3',
    question: 'How do I earn points and rewards?',
    category: 'features'
  },
  {
    id: '4',
    question: 'Why is my camera not working?',
    category: 'troubleshooting'
  },
  {
    id: '5',
    question: 'How do I set waste reduction goals?',
    category: 'features'
  },
  {
    id: '6',
    question: 'What types of waste can I track?',
    category: 'getting-started'
  }
];

export default function HelpScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your Waste Lens assistant. I can help you with questions about using the app, understanding features, troubleshooting issues, and more. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await getChatbotResponse(messageText.trim(), messages);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Here are some common solutions:\n\n• Try restarting the app\n• Check your internet connection\n• Make sure you have the latest app version\n\nFor immediate help, you can also check our quick questions below or try asking your question again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  const getChatbotResponse = async (userMessage: string, chatHistory: ChatMessage[]): Promise<string> => {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create context about the app
    const appContext = `
You are a helpful assistant for Waste Lens, a mobile app that helps users track their waste, reduce their environmental impact, and earn rewards. Here's what you need to know about the app:

CORE FEATURES:
- Camera scanning: Users can take photos of waste items for AI analysis
- AI Analysis: Uses computer vision to identify waste items, calculate environmental scores (1-10), determine if items are recyclable/compostable, and provide disposal recommendations
- Waste Tracking: Tracks total weight, weekly/monthly stats, recycling rates, food vs other waste percentages
- Goals: Users can set and track waste reduction, recycling, and composting goals
- Rewards System: Users earn points by snapping waste items and can redeem rewards like fishnet bags, reusable water bottles, and sustainably sourced coffee beans
- Streaks: Track daily waste logging streaks
- Environmental Impact: Shows CO₂ savings and environmental benefits

MAIN SCREENS:
- Home: Shows stats, goals, and get started section
- Camera: For taking photos of waste items with scanning guidelines
- Analysis: Shows AI analysis results with environmental score, disposal tips, and map suggestions for recycling centers
- Activate: Shows challenges, achievements, recently snapped items, and notifications settings
- Rewards: Points balance and available/locked rewards
- Settings: Profile, app settings, achievements, and data management

KEY CONCEPTS:
- Environmental Score: 1-10 rating based on recyclability, compostability, material type, carbon footprint, and disposal method
- Waste Types: Food, plastic, paper, glass, metal, electronic, textile, organic, hazardous, other
- Categories: Recyclable, compostable, landfill, hazardous
- Points: Earned by snapping waste items (roughly 1 point per 10g of waste)
- Challenges: Daily, weekly, monthly goals like "snap 3 items today" or "recycle 5 items this week"

TROUBLESHOOTING:
- Camera issues: Check permissions, restart app, ensure good lighting
- Analysis problems: Make sure item is clearly visible, not blurry, within scan frame
- Sync issues: Check internet connection, try refreshing data

USER PROFILE:
- Default user: Danielle Alexander (danielle@ecoactivators.com)
- Location-aware: Provides local recycling center recommendations

Be helpful, friendly, and knowledgeable about these features. Provide specific, actionable advice. If users ask about features not mentioned here, politely explain what the app currently offers.
`;

    const conversationHistory = chatHistory
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: appContext
            },
            ...conversationHistory,
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting-started':
        return <Sparkles size={16} color="#10b981" />;
      case 'features':
        return <Lightbulb size={16} color="#3b82f6" />;
      case 'troubleshooting':
        return <MessageCircle size={16} color="#f59e0b" />;
      default:
        return <MessageCircle size={16} color="#6b7280" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'getting-started':
        return '#10b981';
      case 'features':
        return '#3b82f6';
      case 'troubleshooting':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#ffffff' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#ffffff', borderBottomColor: '#e5e7eb' }]}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={24} color="#111827" strokeWidth={1.5} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Bot size={24} color="#3b82f6" strokeWidth={1.5} />
          <Text style={[styles.headerTitle, { color: '#111827' }]}>Help & Support</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View key={message.id} style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer
            ]}>
              <View style={[
                styles.messageAvatar,
                { backgroundColor: message.role === 'user' ? '#3b82f6' : '#dbeafe' }
              ]}>
                {message.role === 'user' ? (
                  <User size={16} color={message.role === 'user' ? '#ffffff' : '#3b82f6'} strokeWidth={1.5} />
                ) : (
                  <Bot size={16} color="#3b82f6" strokeWidth={1.5} />
                )}
              </View>
              <View style={styles.messageContent}>
                <View style={[
                  styles.messageBubble,
                  {
                    backgroundColor: message.role === 'user' ? '#3b82f6' : '#ffffff',
                    borderColor: '#e5e7eb'
                  }
                ]}>
                  <Text style={[
                    styles.messageText,
                    { color: message.role === 'user' ? '#ffffff' : '#111827' }
                  ]}>
                    {message.content}
                  </Text>
                </View>
                <Text style={[styles.messageTime, { color: '#9ca3af' }]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageContainer, styles.assistantMessageContainer]}>
              <View style={[styles.messageAvatar, { backgroundColor: '#dbeafe' }]}>
                <Bot size={16} color="#3b82f6" strokeWidth={1.5} />
              </View>
              <View style={styles.messageContent}>
                <View style={[styles.messageBubble, { backgroundColor: '#ffffff', borderColor: '#e5e7eb' }]}>
                  <View style={styles.typingIndicator}>
                    <View style={[styles.typingDot, { backgroundColor: '#9ca3af' }]} />
                    <View style={[styles.typingDot, { backgroundColor: '#9ca3af' }]} />
                    <View style={[styles.typingDot, { backgroundColor: '#9ca3af' }]} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <View style={styles.quickQuestionsContainer}>
              <Text style={[styles.quickQuestionsTitle, { color: '#111827' }]}>
                Quick Questions
              </Text>
              <Text style={[styles.quickQuestionsSubtitle, { color: '#6b7280' }]}>
                Tap a question to get started
              </Text>
              
              <View style={styles.quickQuestionsList}>
                {quickQuestions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.quickQuestionButton, { backgroundColor: '#ffffff', borderColor: '#e5e7eb' }]}
                    onPress={() => handleQuickQuestion(item.question)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.quickQuestionContent}>
                      <View style={styles.quickQuestionHeader}>
                        {getCategoryIcon(item.category)}
                        <Text style={[styles.quickQuestionCategory, { color: getCategoryColor(item.category) }]}>
                          {item.category.replace('-', ' ')}
                        </Text>
                      </View>
                      <Text style={[styles.quickQuestionText, { color: '#111827' }]}>
                        {item.question}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: '#ffffff', borderTopColor: '#e5e7eb' }]}>
          <View style={[styles.inputWrapper, { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }]}>
            <TextInput
              style={[styles.textInput, { color: '#111827' }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask me anything about Waste Lens..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() && !isLoading ? '#3b82f6' : '#e5e7eb',
                }
              ]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <Send 
                size={18} 
                color={inputText.trim() && !isLoading ? '#ffffff' : '#9ca3af'} 
                strokeWidth={1.5} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    letterSpacing: -0.3,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    maxWidth: '85%',
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  quickQuestionsContainer: {
    marginTop: 24,
  },
  quickQuestionsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 8,
  },
  quickQuestionsSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 20,
  },
  quickQuestionsList: {
    gap: 12,
  },
  quickQuestionButton: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  quickQuestionContent: {
    gap: 8,
  },
  quickQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickQuestionCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  quickQuestionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 20,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});