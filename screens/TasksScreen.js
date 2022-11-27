import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ScrollView } from 'react-native';
import { auth, db } from '../firebase';
import Task from '../components/Task';
import axios from 'axios';
import DatePicker from 'react-native-date-picker';
import dayjs from 'dayjs';

const TaskScreen = () => {
  const navigation = useNavigation();

  const [task, setTask] = useState();
  const [taskItems, setTaskItems] = useState([]);
  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [daily, setDaily] = useState(false);
  const [send, setSend] = useState(false);
  const [accountType, setAccountType] = useState();
  
  const email = auth.currentUser.email;

  useEffect(() => {
    // get data
    db.collection('users').doc(auth.currentUser.uid)
      .get().then((ds) => {
          const accountType = ds.data().accountType;
          setAccountType(accountType);
      });

    // TODO: change email to it's patient
    if (accountType == 'Subscriber')
    {
      email = getPatientEmailBackend(email);
    }

    axios.get(`https://e253-142-134-243-111.ngrok.io/tasks?email=${email}`)
      .then(resp => {
        const items = resp.data.map((item) => {
          return `${item.task} at ${item.datetime}`;
        })
        const taskData = [...taskItems, ...items];
        setTaskItems(sortByTime(getUniqueSet(taskData)));
      })
      .catch(e => console.error(e));
  }, []);

  useEffect(() => {
    if (send) {
      sendTaskDataToBackend();
    }
  }, [send]);

  const getUniqueSet = tasks => [...new Set(tasks)];

  const sortByTime = (a) => a.sort(function(x,y){
    var xp = getTimeFromDate(x.substring(x.lastIndexOf(' ')));
    var yp = getTimeFromDate(y.substring(y.lastIndexOf(' ')));
    return xp == yp ? 0 : xp < yp ? -1 : 1;
  });

  // TODO
  const getPatientEmailBackend = (subscriberEmail) => {

  };

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login");
      })
      .catch(error => {
        Alert.alert(
          "Error",
          error.message,
          [{ text: "OK", onPress: () => {} }]
        );
        console.log(`Error: ${error.message}`);
      });
  };

  const handleSubscribers = () => {
      navigation.replace("Subscribers");
  };

  const createTwoButtonAlert = () =>
    Alert.alert(
      "Daily Alert",
      "Repeat Daily?",
      [
        {
          text: "No",
          onPress: () => {
            setDaily(false);
            setSend(true);
          },
          style: "cancel"
        },
        { text: "Yes", onPress: () => {
            setDaily(true);
            setSend(true);
          }
        }
      ]
    );

  const postTaskDataToBackEnd = (taskData) => {
    axios.post('https://e253-142-134-243-111.ngrok.io/task', {taskData})
      .then(resp => {
        console.log('succcess', resp);
      })
      .catch(e => {
        console.error(e);
      });
  };

  const getTimeFromDate = (datetime) => dayjs(datetime).format('HH:mm');

  const handleSettingTaskData = () => {
    Keyboard.dismiss();
    const taskData = [...taskItems, task];
    setTaskItems(taskData);
    setOpen(true);
  };

  const sendTaskDataToBackend = () => {
    const dataToSend = { task, date, daily, email };
    postTaskDataToBackEnd(dataToSend);
    setTask(null);
    setDate(new Date());
    setDaily(false);
    setSend(false);
  };

  const completeTaskOnBackend = (item) => {
    axios.post('https://e253-142-134-243-111.ngrok.io/deleteTask', {item: item[0], email, deleteTime: new Date()})
      .then(resp => {
        console.log('success', resp);
      })
      .catch(e => {
        console.error(e);
      })
  };

  const completeTask = (index) => {
    if (accountType == "Patient")
    {
      let itemsCopy = [...taskItems];
      const item = itemsCopy.splice(index, 1);
      completeTaskOnBackend(item);
      setTaskItems(sortByTime(itemsCopy));
    }
  };

  return (
    <View style={styles.container}>
      {/* Added this scroll view to enable scrolling when list gets longer than the page */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1
        }}
        keyboardShouldPersistTaps='handled'
      >

      {/*Logout and Subscribers Button*/}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        { accountType == "Patient" ?
          <TouchableOpacity
            onPress={handleSubscribers}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Subscribers</Text>
          </TouchableOpacity> : null
        }
      </View>

      {/* Today's Tasks */}
      <View style={styles.tasksWrapper}>
        <Text style={styles.sectionTitle}>Today's tasks</Text>
        <View style={styles.items}>
          {/* This is where the tasks will go! */}
          {
            taskItems.map((item, index) => {
              return (
                <TouchableOpacity key={index}  onPress={() => completeTask(index)}>
                  <Task text={item} />
                </TouchableOpacity>
              )
            })
          }
        </View>
      </View>

      </ScrollView>

      {/* Write a task */}
      {/* Uses a keyboard avoiding view which ensures the keyboard does not cover the items on screen */}
      { accountType == "Patient" ?
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.writeTaskWrapper}
        >
          <TextInput style={styles.input} placeholder={'Write a task'} value={task} onChangeText={text => setTask(text)} />
          <TouchableOpacity onPress={() => {
            handleSettingTaskData();
          }}>
            <View style={styles.addWrapper}>
              <Text style={styles.addText}>+</Text>
            </View>
            <DatePicker
              modal
              open={open}
              date={date}
              onConfirm={(date) => {
                setDate(date);
                let lastTask = taskItems.pop();
                if (lastTask) {
                  lastTask = `${lastTask} at ${date}`;
                  setTaskItems(sortByTime([...taskItems, lastTask]));
                }
                setOpen(false);
                createTwoButtonAlert();

              }}
              onCancel={() => {
                setOpen(false)
              }}
            />
          </TouchableOpacity>
        </KeyboardAvoidingView> : null
      }
    </View>
  );
}

export default TaskScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
  },
  tasksWrapper: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  items: {
    marginTop: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 30,
    paddingHorizontal: 20
  },
  button: {
    backgroundColor: '#55BCF6',
    width: '35%',
    height: '100%',
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16
  },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    borderRadius: 60,
    borderColor: '#C0C0C0',
    borderWidth: 1,
    width: 250
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#C0C0C0',
    borderWidth: 1
  },
  addText: {},
});