import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

interface Comic {
  id: number;
  title: string;
  thumbnail: string; // URL atau path gambar poster
  description: string;
  rating: number; // Rating rata-rata
}

export default function Comics() {
  const [kategoriId, setKategoriId] = useState<number | null>(null);
  const [kategoriName, setKategoriName] = useState<string | null>(null);
  const [comics, setComics] = useState<Comic[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Mengambil data params dari URL
    if (params.kategoriId) {
      setKategoriId(parseInt(params.kategoriId as string, 10));
    }
    if (params.kategoriName) {
      setKategoriName(params.kategoriName as string);
    }
  }, [params]);

  useEffect(() => {
    const fetchComics = async () => {
      if (!kategoriId || !kategoriName) return; // Pastikan kategoriId dan kategoriName tersedia

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${kategoriId}&name=${encodeURIComponent(kategoriName)}`, // Kirim ID dan nama kategori
      };

      try {
        const response = await fetch(
          "https://ubaya.xyz/react/160421125/get_comics.php",
          options
        );
        const data = await response.json();
        if (data.result === "success") {
          setComics(data.data);
        } else {
          console.error("Error fetching comics:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch comics:", error);
      }
    };

    if (kategoriId) {
      fetchComics();
    }
  }, [kategoriId]);

  const handleNavigate = (comicId: number, comicTitle: string) => {
    router.push({
      pathname: "/read-comic",
      params: { comicId, comicTitle },
    });
  };

  if (!kategoriId || !kategoriName) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Komik - {kategoriName}</Text>
      <FlatList
        data={comics}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigate(item.id, item.title)}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.poster} />
            <View style={styles.info}>
              <Text style={styles.comicTitle}>{item.title}</Text>
              <Text style={styles.rating}>Rating: {item.rating}</Text>
              <Text style={styles.rating}>Description: {item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    flexDirection: "row",
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
    elevation: 3, // Shadow effect for Android
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  comicTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  rating: {
    marginTop: 5,
    color: "#888",
  },
});
