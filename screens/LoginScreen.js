import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, StyleSheet, Text, View } from 'react-native';
import AlertAsync from "react-native-alert-async";
import { auth, db } from '../firebase';
import { registerIndieID } from 'native-notify';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        navigation.replace("Tasks");
      }
    });

    return unsubscribe;
    }, []);

  const handleSignUp = async () => {
    var accountType = await AlertAsync(
      "Selection",
      'Select your account type',
      [
        { text: "Patient", onPress: () => 'Patient' },
        { text: "Subscriber", onPress: () => 'Subscriber' }
      ],
      { cancelable: false }
    );

    await auth
      .createUserWithEmailAndPassword(email, password)
      .then(userCredentials => {
        db.collection('users').doc(userCredentials.user.uid).set({
          accountType: accountType
        });
        const user = userCredentials.user;
        console.log(`Success: Signed up as ${user.email}`);
      })
      .catch(error => {
        Alert.alert(
          "Error",
          error.message,
          [{ text: "OK", onPress: () => {} }]
        );
        console.log(`Error: ${error.message}`);
      });
  }

  const handleLogin = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then(async userCredentials => {
        await registerIndieID(email, 5033, 'iCsXYfWlLbPcCl9Dr0P1H9');

        const user = userCredentials.user;
        Alert.alert(
          "Success",
          `Logged in as ${user.email}`,
          [{ text: "OK", onPress: () => {} }]
        );
        console.log(`Success: Logged in as ${user.email}`);
      })
      .catch(error => {
        Alert.alert(
          "Error",
          error.message,
          [{ text: "OK", onPress: () => {} }]
        );
        console.log(`Error: ${error.message}`);
      });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behaviour="padding"
    >
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={text => setEmail(text.toLowerCase())}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleLogin}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSignUp}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
   container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   },
   inputContainer: {
    width: '75%'
   },
   input: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginTop: 20,
   },
   buttonContainer: {
    width: '30%',
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
   },
   button: {
    backgroundColor: '#55BCF6',
    width: '100%',
    height: '100%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
   },
   buttonOutline: {
    backgroundColor: 'white',
    marginLeft: 20,
    borderColor: '#55BCF6',
    borderWidth: 2,
   },
   buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
   },
   buttonOutlineText: {
    color: '#55BCF6',
    fontWeight: '700',
    fontSize: 16,
   },
});