import React, { useEffect, useState } from "react";
import { View, Text, Image, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ComicPage {
    page_number: number;
    image_url: string;
}

interface Comment {
    id: number;
    user: string;
    text: string;
    created_at: string;
}

export default function ReadComic() {
    const [comicId, setComicId] = useState<number | null>(null);
    const [comicPages, setComicPages] = useState<ComicPage[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [rating, setRating] = useState<number | null>(null);
    const [commentText, setCommentText] = useState("");
    const [idUser, setIdUser] = useState<string | null>(null);
    const params = useLocalSearchParams();

    const getUserId = async () => {
        try {
          const username = await AsyncStorage.getItem("username");
          if (username !== null) {
            setIdUser(username);  // Contoh: menyimpan id_user sebagai integer
          }
        } catch (error) {
          console.error("Failed to fetch user id from AsyncStorage", error);
        }
      };
    
      useEffect(() => {
        getUserId();  // Panggil fungsi untuk mendapatkan id_user dari AsyncStorage
      }, []);


    useEffect(() => {
        if (params.comicId) {
            setComicId(parseInt(params.comicId as string, 10)); // Menyimpan comicId dari query params
        }
    }, [params.comicId]);

    useEffect(() => {
        const fetchComicPages = async () => {
            if (!comicId) return; // Pastikan comicId ada

            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'id=' + comicId, // Kirim comicId ke PHP
            };

            try {
                const response = await fetch('https://ubaya.xyz/react/160421125/get_comic_pages.php', options);
                const resjson = await response.json();

                // Jika data berhasil diambil, set data dalam comicPages
                if (resjson.result === "success") {
                    setComicPages(resjson.data.pages); // Menyimpan data halaman komik langsung ke state
                } else {
                    console.error("Error fetching comic pages:", resjson.message);
                }
            } catch (error) {
                console.error("Failed to fetch comic pages:", error);
            }
        };

        if (comicId) {
            fetchComicPages(); // Panggil fungsi fetchComicPages
        }
    }, [comicId]); // Fungsi akan dijalankan setiap kali comicId berubah

    if (!comicId) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const handleRatingSubmit = async () => {
        if (!rating) return;
        try {
            const response = await fetch("https://ubaya.xyz/react/160421125/submit_rating.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `comic_id=${comicId}&rating=${rating}&userId=${idUser}`,
            });
            const data = await response.json();
            if (data.result === "success") {
                alert("Rating submitted!");
                setRating(null);
            } else {
                alert("Failed to submit rating: " + data.message);
            }
        } catch (error) {
            console.error("Failed to submit rating:", error);
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentText) return;
        try {
            const response = await fetch("https://ubaya.xyz/react/160421125/submit_comment.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `comic_id=${comicId}&comment=${encodeURIComponent(commentText)}`,
            });
            const data = await response.json();
            if (data.result === "success") {
                setComments((prev) => [...prev, data.data]);
                setCommentText("");
            } else {
                alert("Failed to submit comment: " + data.message);
            }
        } catch (error) {
            console.error("Failed to submit comment:", error);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={comicPages}
                keyExtractor={(item) => item.page_number.toString()}
                renderItem={({ item }) => (
                    <Image source={{ uri: item.image_url }} style={styles.comicPage} />
                )}
            />
            <View style={styles.ratingContainer}>
                <TextInput
                    style={styles.ratingInput}
                    keyboardType="number-pad"
                    maxLength={1}
                    placeholder="Rate (1-5)"
                    value={rating?.toString() || ""}
                    onChangeText={(text) => setRating(parseInt(text))}
                />
                <Button title="Submit Rating" onPress={handleRatingSubmit} />
            </View>
            <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
            />
            <Button title="Submit Comment" onPress={handleCommentSubmit} />
            <FlatList
                data={comments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.commentCard}>
                        <Text style={styles.commentText}>{item.text}</Text>
                        <Text style={styles.commentMeta}>- {item.user}, {item.created_at}</Text>
                    </View>
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
    comicPage: {
        width: "100%",
        height: 400,
        marginBottom: 10,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    ratingInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 5,
        marginRight: 10,
        width: 100,
        textAlign: "center",
    },
    commentInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    commentCard: {
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
    },
    commentText: {
        fontSize: 14,
        marginBottom: 5,
    },
    commentMeta: {
        fontSize: 12,
        color: "#888",
    },
});
