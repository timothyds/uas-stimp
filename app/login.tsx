import * as React from 'react';
import { Card, Button } from "@rneui/base";
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useAuth } from './authContext';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

function Login() {
  const { login } = useAuth(); // Access login function from context
  const [username, setUsername] = useState(''); // State for username
  const [password, setPassword] = useState(''); // State for passwo


  const styles = StyleSheet.create({
    input: {
      height: 40,
      width: 200,
      borderWidth: 1,
      padding: 10,
    },
    button: {
      height: 40,
      width: 200,
    },
    viewRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: 'center',
      paddingRight: 50,
      margin: 3
    }
  });

  const doLogin = async () => {
    if (!username || !password) {
        alert('Please fill in both username and password');
        return;
      }
    const options = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded'
      }),
      body: "user_id=" + username + "&user_password=" + password
    };
    const response = await fetch('https://ubaya.xyz/react/160421125/login.php',
      options);
    const json = await response.json();

    if (json.result == 'success') {
      try {
        await AsyncStorage.setItem('username', username);
        alert('Login successful');
        login(); // Use the login function from context
      } catch (e) {
        console.error('Error saving data to AsyncStorage', e);
      }
    } else {
      alert('Username or password is incorrect');
    }
  };


  return (
    <Card>
      <Card.Title>Silakan Login</Card.Title>
      <Card.Divider />
      <View style={styles.viewRow}>
        <Text>Username </Text>
        <TextInput style={styles.input} onChangeText={(text) => setUsername(text)} value={username}
        />
      </View>
      <View style={styles.viewRow}>
        <Text>Password </Text>
        <TextInput secureTextEntry={true} style={styles.input} onChangeText={(text) => setPassword(text)} value={password}
        />
      </View>
      <View style={styles.viewRow}>
        <Button style={styles.button} title="Submit" onPress={() => { doLogin() }} />
      </View>

      {/*ini nanti diisi textfiel dan button*/}
    </Card>
  );
}


export default Login;
