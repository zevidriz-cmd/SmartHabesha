import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import VideoPlayer from './components/VideoPlayer';
import EpisodeList from './components/EpisodeList';
import API_BASE_URL from './config';

export default function App() {
  // Configurable URL (user can edit this in code or via UI if we add it)
  // For now we'll defaults to a known good URL or empty
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [currentVideoSrc, setCurrentVideoSrc] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async (url) => {
    if (!url) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/episode`, {
        params: { url }
      });
      console.log('Got data:', response.data);
      setData(response.data);
      setCurrentVideoSrc(response.data.videoUrl);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data. Check URL and backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodeSelect = (episode) => {
    // If we select an episode, we essentially want to "browse" to that page
    // The backend scraper scrapes a PAGE, which contains the video and list.
    // So we just re-fetch the new URL.
    setTargetUrl(episode.link);
    fetchData(episode.link);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Search / Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Episode URL"
          placeholderTextColor="#666"
          value={targetUrl}
          onChangeText={setTargetUrl}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => fetchData(targetUrl)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? '...' : 'GO'}</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.contentContainer}>
        {/* Video Player Section */}
        <VideoPlayer
          videoSource={currentVideoSrc}
          poster={data?.poster}
        />

        {/* Title Section */}
        {data && (
          <View style={styles.infoSection}>
            <Text style={styles.mediaTitle}>{data.title}</Text>
          </View>
        )}

        {/* Episode List Section */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#e50914" />
          </View>
        ) : (
          data && (
            <EpisodeList
              episodes={data.relatedEpisodes || []}
              onSelectEpisode={handleEpisodeSelect}
              currentUrl={targetUrl}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#141414',
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#fff',
    marginRight: 10,
  },
  button: {
    backgroundColor: '#e50914',
    paddingHorizontal: 15,
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  infoSection: {
    padding: 15,
  },
  mediaTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
