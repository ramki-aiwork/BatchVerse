import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { signup } from '../services/auth';

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [batchYear, setBatchYear] = useState('2004'); // Default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!fullName || !email || !password || !batchYear) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await signup(email, password, fullName, batchYear);
      console.log('Signup successful:', data);
      Alert.alert('Success', 'Account created! Please login.');
      navigation.goBack();
    } catch (err) {
      console.error('Signup failed:', err);
      const msg = err.response 
        ? JSON.stringify(err.response.data || err.response) 
        : (err.message || 'Unknown Error');
      Alert.alert('Signup Error', msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>Create Account</Title>
      
      <TextInput
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        mode="outlined"
        style={styles.input}
        autoCapitalize="words"
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        error={!!error}
      />
      
      <TextInput
        label="Batch Year (e.g., 2004)"
        value={batchYear}
        onChangeText={setBatchYear}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
        maxLength={4}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
        error={!!error}
      />

      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
        error={!!error}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button 
        mode="contained" 
        onPress={handleSignup} 
        loading={loading} 
        disabled={loading}
        style={styles.button}
      >
        Sign Up
      </Button>

      <Button 
        mode="text" 
        onPress={() => navigation.goBack()}
        style={styles.textButton}
      >
        Already have an account? Login
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  textButton: {
    marginTop: 10,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default SignupScreen;
