import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { TextInput, Button, Title, Text, ActivityIndicator, Avatar } from 'react-native-paper';
import { getProfile, updateProfile } from '../services/profile';

// For MVP, we pass the token via navigation params or context. 
// Ideally, use SecureStore or Context. Assuming Params for simplicity now.

const ProfileScreen = ({ route, navigation }) => {
  const { token } = route.params || {}; // Expect token to be passed from Login
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!token) {
        Alert.alert('Error', 'No token found. Please login again.');
        navigation.navigate('Login');
        return;
      }
      const data = await getProfile(token);
      setProfile(data);
      setBio(data.bio || '');
      setPhotoUrl(data.photoUrl || '');
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(token, bio, photoUrl);
      Alert.alert('Success', 'Profile Updated!');
      fetchProfile(); // Refresh
    } catch (err) {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.title}>My Profile</Title>
      
      <View style={styles.avatarContainer}>
        {photoUrl ? (
          <Avatar.Image size={100} source={{ uri: photoUrl }} />
        ) : (
          <Avatar.Text size={100} label={profile?.fullName?.substring(0, 2).toUpperCase() || "ME"} />
        )}
      </View>

      <Text style={styles.label}>Name: {profile?.fullName}</Text>
      <Text style={styles.label}>Batch: {profile?.batchYear}</Text>
      <Text style={styles.label}>Email: {profile?.email}</Text>

      <TextInput
        label="Bio"
        value={bio}
        onChangeText={setBio}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
      />

      <TextInput
        label="Photo URL (Link to image)"
        value={photoUrl}
        onChangeText={setPhotoUrl}
        mode="outlined"
        style={styles.input}
        autoCapitalize="none"
      />

      <Button 
        mode="contained" 
        onPress={handleSave} 
        loading={saving} 
        disabled={saving}
        style={styles.button}
      >
        Save Profile
      </Button>

      <Button 
        mode="outlined" 
        onPress={() => navigation.navigate('Login')}
        style={styles.logoutButton}
        color="red"
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
  logoutButton: {
    marginTop: 20,
    borderColor: 'red',
  },
});

export default ProfileScreen;
