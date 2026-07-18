import React, { useEffect, useState } from 'react';
import { NavigationContainer }          from '@react-navigation/native';
import { createStackNavigator }         from '@react-navigation/stack';
import { createBottomTabNavigator }     from '@react-navigation/bottom-tabs';
import AsyncStorage                      from '@react-native-async-storage/async-storage';
import Icon                              from 'react-native-vector-icons/MaterialCommunityIcons';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Screens
import LoginScreen    from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen     from '../screens/HomeScreen';
import LibraryScreen  from '../screens/LibraryScreen';
import ModuleScreen   from '../screens/ModuleScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen  from '../screens/ProfileScreen';
import AskAIScreen from '../screens/AskAIScreen';

// Admin screens
import AdminHomeScreen    from '../screens/admin/AdminHomeScreen';
import ManageModulesScreen from '../screens/admin/ManageModulesScreen';
import ManageUsersScreen   from '../screens/admin/ManageUsersScreen';
import UploadModuleScreen  from '../screens/admin/UploadModuleScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

const COLORS = {
  primary: '#2D6A4F',
  inactive: '#95B8A8',
};

// ─── Farmer Bottom Tab Navigator ──────────────────────
function FarmerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: { paddingBottom: 6, height: 60 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home:     'home-outline',
            Library:  'book-open-outline',
            AskAI:    'robot-happy-outline',
            Progress: 'chart-line',
            Profile:  'account-circle-outline',
          };
          return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}     />
      <Tab.Screen name="Library"  component={LibraryScreen}  />
      <Tab.Screen name="AskAI"    component={AskAIScreen}    options={{ title: 'Ask AI' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen}  />
    </Tab.Navigator>
  );
}

// ─── Officer / Admin Bottom Tab Navigator ─────────────
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: { paddingBottom: 6, height: 60 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'view-dashboard-outline',
            Modules:   'book-edit-outline',
            Users:     'account-group-outline',
            Upload:    'cloud-upload-outline',
            Profile:   'account-circle-outline',
          };
          return <Icon name={icons[route.name] || 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminHomeScreen}    />
      <Tab.Screen name="Modules"   component={ManageModulesScreen} />
      <Tab.Screen name="Users"     component={ManageUsersScreen}   options={{ tabBarBadge: undefined }} />
      <Tab.Screen name="Upload"    component={UploadModuleScreen}  />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────
export default function AppNavigator() {
  const [loading,      setLoading]      = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setInitialRoute(
          user.role === 'admin' || user.role === 'officer' ? 'AdminMain' : 'Main'
        );
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        {/* Auth */}
        <Stack.Screen name="Login"    component={LoginScreen}    />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Farmer App */}
        <Stack.Screen name="Main"   component={FarmerTabs} />
        <Stack.Screen name="Module" component={ModuleScreen}
          options={{ headerShown: true, title: 'Learning Module',
                     headerTintColor: COLORS.primary }} />

        {/* Admin / Officer App */}
        <Stack.Screen name="AdminMain" component={AdminTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5FFF9' },
});
