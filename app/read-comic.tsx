import React, { useEffect, useState } from "react";
import { View, Text, Image, TextInput, Button, FlatList, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";

interface ComicPage {
    page_number: number;
    image_url: string;
}

interface Comment {
    id: number;
    user: string;
    comment: string;
    created_at: string;
}
export default function ReadComic() {
    const [triggerRefresh, setTriggerRefresh] = useState(false);
    const [comicId, setComicId] = useState<number | null>(null);
    const [comicPages, setComicPages] = useState<ComicPage[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [rating, setRating] = useState(0);
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
                    setComments(resjson.data.comments);
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
    }, [comicId, triggerRefresh]); // Fungsi akan dijalankan setiap kali comicId berubah


    if (!comicId) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const handleRatingSubmit = async () => {
        if (rating === 0) {
            alert("Please select a rating!");
            return;
        }
        try {
            const response = await fetch("https://ubaya.xyz/react/160421125/submit_rating.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `comic_id=${comicId}&rating=${rating}&user_id=${idUser}`,
            });
            const data = await response.json();
            if (data.result === "success") {
                alert("Rating submitted!");
                setRating(0); // Reset rating setelah submit
            } else {
                alert("Failed to submit rating: " + data.message);
            }
        } catch (error) {
            console.error("Failed to submit rating:", error);
        }
    };

    // const handleRatingSubmit = async () => {
    //     if (!rating) return;
    //     try {
    //         const response = await fetch("https://ubaya.xyz/react/160421125/submit_rating.php", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/x-www-form-urlencoded" },
    //             body: `comic_id=${comicId}&rating=${rating}&user_id=${idUser}`,
    //         });
    //         const data = await response.json();
    //         if (data.result === "success") {
    //             setTriggerRefresh(prev => !prev)
    //             alert("Rating submitted!");
    //             setRating(null);
    //         } else {
    //             alert("Failed to submit rating: " + data.message);
    //         }
    //     } catch (error) {
    //         console.error("Failed to submit rating:", error);
    //     }
    // };

    const handleCommentSubmit = async () => {
        if (!commentText) return;
        try {
            const response = await fetch("https://ubaya.xyz/react/160421125/submit_comment.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `comic_id=${comicId}&comment=${encodeURIComponent(commentText)}&user_id=${idUser}`,
            });
            const data = await response.json();
            if (data.result === "success") {
                setTriggerRefresh(prev => !prev)
                setCommentText("");
            } else {
                alert("Failed to submit comment: " + data.message);
            }
        } catch (error) {
            console.error("Failed to submit comment:", error);
        }
    };

    return (
        <ScrollView nestedScrollEnabled={true} style={styles.container}>
            <FlatList
                data={comicPages}
                keyExtractor={(item) => item.page_number.toString()}
                renderItem={({ item }) => (
                    <Image source={{ uri: item.image_url }} style={styles.comicPage} resizeMode="contain"/>
                )}
                scrollEnabled={false}
            />
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingLabel}>Rate this comic:</Text>
                <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((value) => (
                        <TouchableOpacity key={value} onPress={() => setRating(value)}>
                            <Icon
                                name="star"
                                size={30}
                                color={value <= rating ? "#FFD700" : "#CCCCCC"} // Bintang yang dipilih berwarna emas
                                style={styles.star}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

            </View>
            <Button title="Submit Rating" onPress={handleRatingSubmit} />
            <Text style={styles.commentTitle}>Komentar</Text>
            <FlatList
                data={comments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.commentCard}>
                        <Text style={styles.commentText}>{item.comment}</Text>
                        <Text style={styles.commentMeta}>{item.user}, {item.created_at}</Text>
                    </View>
                )}
                scrollEnabled={false}
            />
            <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
            />
            <Button title="Submit Comment" onPress={handleCommentSubmit} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        width: "100%",
        backgroundColor: "#fff",
    },
    comicPage: {
        width: "100%",
        height: 500,
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
    ratingLabel: {
        fontSize: 18,
        marginBottom: 10,
    },
    stars: {
        flexDirection: "row",
        marginBottom: 10,
    },
    star: {
        marginHorizontal: 5,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    commentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        color: '#333',
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
