import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Image, ScrollView, Button, TouchableOpacity } from 'react-native';

export default function UpdateComic() {
  const [comicId, setComicId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState([{ page_number: 1, image_url: '' }]);

  const params = useLocalSearchParams();
  // Fetch categories and comic data on mount
  useEffect(() => {
    const id = params.id;
    if (params.id) {
        setComicId(parseInt(params.id as string, 10)); // Menyimpan comicId dari query params
    }
    if (id) {
      fetchComicData(id); 
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://ubaya.xyz/react/160421125/get_categories.php");
      const json = await response.json();

      if (json.result === "success") {
        setCategories(json.data);
      } else {
        alert("Error fetching categories: " + json.message);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
      alert("Failed to fetch categories");
    }
  };

  const fetchComicData = async (id) => {
    try {
      const response = await fetch(`https://ubaya.xyz/react/160421125/detailcomic.php?id=${id}`);
      const json = await response.json();

      if (json.result === "success") {
        const comic = json.data;
        setTitle(comic.title);
        setDescription(comic.description);
        setReleaseDate(comic.release_date);
        setAuthor(comic.author);
        setImage(comic.thumbnail);
        setSelectedCategories(comic.categories || []);
        setPages(comic.pages || []);
      } else {
        alert("Failed to fetch comic data: " + json.message);
      }
    } catch (error) {
      console.error("Error fetching comic data", error);
      alert("Failed to fetch comic data");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const addPage = () => {
    setPages((prevPages) => [...prevPages, { page_number: prevPages.length + 1, image_url: '' }]);
  };

  const updatePageImageUrl = (index, value) => {
    setPages((prevPages) => {
      const updatedPages = prevPages.map((page, i) => 
        i === index ? { ...page, image_url: value } : page
      );
      return updatedPages;
    });
  };

  const handleUpdate = () => {
    const options = {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      body: "id="+comicId+"&"+
      "title="+title+"&"+
      "description="+description+"&"+
      "release_date="+releaseDate+"&"+
      "author="+author+"&"+
      "image="+image+"&"+
      "categories="+JSON.stringify(selectedCategories)+"&"+
      "pages="+encodeURIComponent(JSON.stringify(pages))
    };

    try {
      fetch('https://ubaya.xyz/react/160421125/updatecomic.php', options)
        .then((response) => response.json())
        .then((resjson) => {
          if (resjson.result === 'success') {
            alert('Komik berhasil diperbarui!');
            router.push({ pathname: "/" });
          } else {
            alert('Gagal memperbarui komik: ' + resjson.message);
          }
        });
    } catch (error) {
      console.error("Error updating comic", error);
      alert("Error updating comic");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Judul Komik"
        onChangeText={setTitle}
        value={title}
      />

      <TextInput
        multiline
        numberOfLines={4}
        style={styles.input}
        placeholder="Deskripsi Komik"
        onChangeText={setDescription}
        value={description}
      />

      <TextInput
        style={styles.input}
        placeholder="Tanggal Rilis (YYYY-MM-DD)"
        onChangeText={setReleaseDate}
        value={releaseDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Nama Pengarang"
        onChangeText={setAuthor}
        value={author}
      />

      <Text style={styles.categoryTitle}>Pilih Kategori:</Text>
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => toggleCategory(category.id)}
            style={
              selectedCategories.includes(Number(category.id))
                ? styles.categorySelected
                : styles.categoryButton
            }
          >
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Gambar (URL)"
        onChangeText={setImage}
        value={image}
      />

      {image !== '' && (
        <Image
          style={{ width: 300, height: 400 }}
          resizeMode="contain"
          source={{ uri: image }}
        />
      )}

      <Text style={styles.pageTitle}>Halaman Komik:</Text>
      <ScrollView style={styles.pagesContainer} horizontal>
        {pages.map((page, index) => (
          <View key={index} style={styles.pageInputContainer}>
            <Text>Halaman {page.page_number}</Text>
            <TextInput
              style={styles.input}
              placeholder="URL Gambar"
              value={page.image_url}
              onChangeText={(value) => updatePageImageUrl(index, value)}
            />
          </View>
        ))}
      </ScrollView>
      <Button title="Tambah Halaman" onPress={addPage} />
      <Button title="Perbarui Komik" onPress={handleUpdate} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  categoryButton: {
    padding: 10,
    margin: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  categorySelected: {
    padding: 10,
    margin: 5,
    backgroundColor: '#4caf50',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#388e3c',
  },
  categoryText: {
    color: '#000',
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  pagesContainer: {
    maxHeight: 200,
  },
  pageInputContainer: {
    marginBottom: 10,
    marginRight: 10,
  },
});
