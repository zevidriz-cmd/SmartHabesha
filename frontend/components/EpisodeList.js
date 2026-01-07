import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';

const EpisodeList = ({ episodes, onSelectEpisode, currentUrl }) => {
    const renderItem = ({ item }) => {
        const isSelected = item.url === currentUrl;

        return (
            <TouchableOpacity
                style={[styles.itemContainer, isSelected && styles.selectedItem]}
                onPress={() => onSelectEpisode(item)}
            >
                <Image
                    source={{ uri: item.thumbnail || 'https://via.placeholder.com/150' }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
                <View style={styles.infoContainer}>
                    <Text style={[styles.title, isSelected && styles.selectedText]} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.subtitle}>Click to play</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Episodes</Text>
            <FlatList
                data={episodes}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.url + index}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#141414',
        paddingHorizontal: 10,
    },
    header: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    listContent: {
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: '#1f1f1f',
    },
    selectedItem: {
        backgroundColor: '#333',
        borderLeftWidth: 3,
        borderLeftColor: '#e50914', // Netflix red
    },
    thumbnail: {
        width: 120,
        height: 68, // 16:9ish
    },
    infoContainer: {
        flex: 1,
        padding: 10,
        justifyContent: 'center',
    },
    title: {
        color: '#ccc',
        fontSize: 14,
        fontWeight: '600',
    },
    selectedText: {
        color: '#fff',
    },
    subtitle: {
        color: '#666',
        fontSize: 12,
        marginTop: 4,
    },
});

export default EpisodeList;
