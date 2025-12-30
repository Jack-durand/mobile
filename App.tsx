import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { DYScreen } from './src/screens/dy/DYScreen';
import { JRDScreen } from './src/screens/jrd/JRDScreen';
import { AutoScreen } from './src/screens/auto/AutoScreen';
import { apiBase } from './src/api';

type TabName = 'home' | 'dy' | 'jrd' | 'auto';

const HomeScreen = () => (
  <View style={styles.screen}>
    <Text style={styles.title}>Price-O-Tron 3000</Text>
    <Text style={styles.subtitle}>v6.2.0 • Mock data wired</Text>
    <Text style={styles.hint}>Select a company below</Text>
  </View>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'dy': return <DYScreen />;
      case 'jrd': return <JRDScreen />;
      case 'auto': return <AutoScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

       {/* quick banner so you can see hot reload and API base */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Mock API: {apiBase}</Text>
      </View>

      {renderScreen()}

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('home')}>
          <Text style={[styles.tabIcon, activeTab === 'home' && styles.activeTab]}>🧠</Text>
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.activeTab]}>Brain</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('dy')}>
          <Text style={[styles.tabIcon, activeTab === 'dy' && styles.activeTab]}>🏪</Text>
          <Text style={[styles.tabLabel, activeTab === 'dy' && styles.activeTab]}>Holiday</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('jrd')}>
          <Text style={[styles.tabIcon, activeTab === 'jrd' && styles.activeTab]}>🛒</Text>
          <Text style={[styles.tabLabel, activeTab === 'jrd' && styles.activeTab]}>In-N-Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('auto')}>
          <Text style={[styles.tabIcon, activeTab === 'auto' && styles.activeTab]}>🚗</Text>
          <Text style={[styles.tabLabel, activeTab === 'auto' && styles.activeTab]}>Auto</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f97316',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: 20,
    paddingTop: 10,
  },
  banner: {
    backgroundColor: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  bannerText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    fontSize: 24,
  },
  tabLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  activeTab: {
    color: '#f97316',
  },
});
