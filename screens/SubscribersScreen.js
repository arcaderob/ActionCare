import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity, Keyboard, ScrollView } from 'react-native';
import { auth, db } from '../firebase';
import Subscriber from '../components/Subscriber';
import axios from 'axios';

const SubscribersScreen = () => {
  const navigation = useNavigation();

  const [subscriber, setSubscriber] = useState();
  const [subscriberItems, setSubscriberItems] = useState([]);

  const email = auth.currentUser.email;

  useEffect(() => {
    axios.get(`http://localhost:3001/subscribers?email=${email}`)
      .then(resp => {
        let subscriberData = [...subscriberItems];
        resp.data.forEach((item) => {
          subscriberData = [...subscriberData, item.subscriberEmail];
        });
        setSubscriberItems(subscriberData);
      })
      .catch(e => console.error(e));
  }, []);

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

    const handleTasks = () => {
        navigation.replace("Tasks");
    };

    const deleteSubscriptionOnBackend = (data) => {
      axios.post('http://localhost:3001/deleteSubscriber', {
        patient: email,
        subscriber: data[0]
      })
        .then(resp => {
          console.log('succcess', resp);
        })
        .catch(e => {
          console.error(e);
        });
    };

    const deleteSubscriber = (index) => {
      let itemsCopy = [...subscriberItems];
      const item = itemsCopy.splice(index, 1);
      deleteSubscriptionOnBackend(item);
      setSubscriberItems(itemsCopy);
    };

    const addSubscriptionOnBackend = (data) => {
      axios.post('http://localhost:3001/subscriber', {data})
        .then(resp => {
          console.log('succcess', resp);
        })
        .catch(e => {
          console.error(e);
        });
    };

    const handleSettingSubscriberData = () => {
      Keyboard.dismiss();

      // Check if user exists
      auth.fetchSignInMethodsForEmail(subscriber)
        .then(providers => {
          if (providers.length != 0) {
            const subscriberData = [...subscriberItems, subscriber];
            addSubscriptionOnBackend({
              patient: auth.currentUser.email,
              subscriber
            });
            setSubscriberItems(subscriberData);
            setSubscriber(null);
          }
          else {
            Alert.alert(
              "Error",
              "User does not exist",
              [{ text: "OK", onPress: () => {} }]
            );
          }
      })
      .catch((e) => console.error(e));
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

      {/*Logout and Add Tasks Button*/}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleTasks}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Tasks</Text>
        </TouchableOpacity>
      </View>

      {/* Subscribers */}
      <View style={styles.subscribersWrapper}>
        <Text style={styles.sectionTitle}>Subscribers</Text>
        <View style={styles.items}>
          {
            subscriberItems.map((item, index) => {
              return (
                <TouchableOpacity key={index}  onPress={() => deleteSubscriber(index)}>
                  <Subscriber text={item} />
                </TouchableOpacity>
              )
            })
          }
        </View>
      </View>

      </ScrollView>

      {/* Add a subscriber */}
      {/* Uses a keyboard avoiding view which ensures the keyboard does not cover the items on screen */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.addSubscriberWrapper}
      >
        <TextInput style={styles.input} placeholder={'Add a subscriber by email'} value={subscriber} onChangeText={text => setSubscriber(text)} />
        <TouchableOpacity onPress={() => {
          if (!subscriber) {
            Alert.alert('Error', 'Please enter an email address');
          } else {
            handleSettingSubscriberData();
          }
        }}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

export default SubscribersScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
  },
  subscribersWrapper: {
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
  addSubscriberWrapper: {
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