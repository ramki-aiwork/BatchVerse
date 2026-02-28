import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Searchbar, List, Avatar, Text, ActivityIndicator, Divider } from 'react-native-paper';
import { getUsers } from '../services/directory';

const DirectoryScreen = ({ navigation, route }) => {
  const { token } = route.params || {}; 
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]); // Debounce? Nah, MVP.

  const fetchUsers = async () => {
    if (!token) return; // Should be handled by Auth Context
    setLoading(true);
    try {
      const data = await getUsers(token, searchQuery);
      setUsers(data);
    } catch (err) {
      console.error(err);
      // Alert.alert('Error', 'Failed to load directory'); // Silent fail is better for search
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <List.Item
      title={item.fullName}
      description={`Batch: ${item.batchYear}`}
      left={props => 
        item.photoUrl 
          ? <Avatar.Image {...props} size={40} source={{ uri: item.photoUrl }} />
          : <Avatar.Text {...props} size={40} label={item.fullName.substring(0, 2).toUpperCase()} />
      }
      onPress={() => console.log('View Profile', item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search Batchmates"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {loading && <ActivityIndicator animating={true} style={styles.loader} />}

      <FlatList
        data={users}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={Divider}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    margin: 10,
    elevation: 2,
  },
  loader: {
    marginVertical: 10,
  },
  list: {
    paddingBottom: 20,
  },
});

export default DirectoryScreen;
