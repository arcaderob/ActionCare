import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, Button, View } from 'react-native';
import Task from './components/Task';

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.taskAdder}>
        <Button
          id="addTask"
          title="Add Task"
        >
          Add Task
        </Button>
      </View>
      <View style={styles.tasksWrapper}>
          <Text style={styles.sectionTitle}>These are the tasks for today:</Text>

          <View style={styles.items}>
            <Task />
            <Task />
            <Task />
            <Task />
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
  },
  taskAdder: {
    paddingTop: 30,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  tasksWrapper: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  items: {
    marginTop: 30,
  },
});
