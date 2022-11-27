import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import registerNNPushToken from 'native-notify';
import LoginScreen from './screens/LoginScreen';
import TasksScreen from './screens/TasksScreen';
import SubscribersScreen from './screens/SubscribersScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  registerNNPushToken(5024, 'V52zpwBsjIZRO8ollX2o53');

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Subscribers" component={SubscribersScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
    alignItems: 'center',
    justifyContent: 'center',
  },
});