import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet, Button, FlatList, TouchableOpacity, ImageBackground } from "react-native";
import { useRouter } from 'expo-router';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./authContext";

export default function Index() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://ubaya.xyz/react/160421125/get_categories.php");
      const json = await response.json();

      if (json.result === "success") {
        setCategories(json.data);
      } else {
        alert("Error: " + json.message);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
      alert("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const cekLogin = async () => {
    try {
      const value = await AsyncStorage.getItem('username');
      if (value !== null) {
        setUsername(value);
      } else {
        setUsername('');
        logout();
      }
    } catch (e) {
      console.error('Error reading username from AsyncStorage', e);
      setUsername('');
      logout();
    }
  };
  const doLogout = async () => {
    try {
      await AsyncStorage.removeItem('username')
      alert('logged out');
      logout();
    } catch (e) {
    }
  }

  useEffect(() => {
    cekLogin()
  }, [username]);

  const handleNavigate = (kategoriId: number, kategoriName:string) => {
    router.push({
      pathname: '/comics',
      params: { kategoriId, kategoriName },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Halo, {username}! Pilih Kategori Komik:</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => handleNavigate(item.id,item.name)}
            >
              <ImageBackground
                source={{ uri: item.image }}
                style={styles.imageBackground}
                resizeMode="cover"
            ></ImageBackground>
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={doLogout} color="#d9534f" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  imageBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    opacity:0.5,
    borderRadius:10
},
  categoryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "rgba(161, 43, 151, 0.8)",
    borderBottomRightRadius:10,
    borderBottomLeftRadius:10
  },
  categoryItem: {
    width: 200,
    height: 70,
    marginBottom: 12,
    borderRadius: 10,
    overflow:"hidden"
  },
  logoutContainer: {
    marginTop: 20,
  },
});
