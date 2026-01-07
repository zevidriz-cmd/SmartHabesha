import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

const VideoPlayer = ({ videoSource, poster }) => {
    const video = React.useRef(null);
    const [status, setStatus] = React.useState({});

    if (!videoSource) {
        return <View style={styles.placeholder} />;
    }

    return (
        <View style={styles.container}>
            <Video
                ref={video}
                style={styles.video}
                source={{
                    uri: videoSource,
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                posterSource={poster ? { uri: poster } : undefined}
                onPlaybackStatusUpdate={status => setStatus(() => status)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 250, // Fixed height for player area
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: 250,
        backgroundColor: '#1a1a1a',
    },
});

export default VideoPlayer;
