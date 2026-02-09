import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/react-native';
import { Track } from 'livekit-client';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';

// ⚠️ UPDATE THIS IF NGROK RESTARTS
const API_URL = "https://313c-2a09-bac1-3680-c8-00-242-be.ngrok-free.app";

// ⚠️ YOUR LIVEKIT URL
const LIVEKIT_WS = "wss://symtotrack-l0osmovg.livekit.cloud";

export default function ConsultationScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const roomId = params.roomId as string; 
  const patientName = params.patientName as string || "Patient";

  const [token, setToken] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Audio.requestPermissionsAsync();
      if (cameraStatus.status === 'granted' && audioStatus.status === 'granted') {
        setPermissionGranted(true);
      } else {
        Alert.alert("Permission Required", "Camera access is needed.");
      }
    })();
  }, []);

  useEffect(() => {
    if (!roomId || !permissionGranted) return;
    async function fetchToken() {
      try {
        console.log(`Connecting to Room: ${roomId}`);
        const response = await fetch(
          `${API_URL}/api/livekit?room=${roomId}&username=${encodeURIComponent(patientName)}`
        );
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error("Token Error:", error);
      }
    }
    fetchToken();
  }, [roomId, permissionGranted]);

  if (!permissionGranted) return <View style={styles.center}><Text style={styles.text}>Requesting Permissions...</Text></View>;
  if (!token) return <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /><Text style={styles.text}>Connecting...</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ FIX: Wrapped LiveKitRoom in a View. 
          LiveKitRoom does NOT accept 'style' prop directly. */}
      <View style={{ flex: 1 }}>
        <LiveKitRoom
          serverUrl={LIVEKIT_WS}
          token={token}
          connect={true}
          video={true}
          audio={true}
        >
          
          {/* End Call Button */}
          <View style={styles.controls}>
             <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
               <Text style={styles.btnText}>End Call</Text>
             </TouchableOpacity>
          </View>
        </LiveKitRoom>
      </View>
    </SafeAreaView>
  );
}

function VideoGrid({ roomId }: { roomId: string }) {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const hasDoctor = tracks.some(track => !track.participant.isLocal);

  if (tracks.length === 0) return <View style={styles.center}><Text style={styles.text}>Loading Camera...</Text></View>;

  return (
    <View style={styles.grid}>
      {tracks.map((track) => (
        <View key={track.participant.identity} style={styles.trackContainer}>
           <VideoTrack trackRef={track} style={{ width: '100%', height: '100%' }} objectFit="cover" />
        </View>
      ))}
      {!hasDoctor && (
        <View style={styles.waitingOverlay}>
           <Text style={styles.waitingText}>Waiting for doctor...</Text>
           <Text style={styles.subText}>Room: {roomId.slice(0,8)}...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  text: { color: 'white', marginTop: 10 },
  grid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
  trackContainer: { flex: 1, minWidth: '100%', minHeight: '50%' }, 
  controls: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  btn: { backgroundColor: '#ef4444', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 30 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  waitingOverlay: { position: 'absolute', bottom: 150, alignSelf: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 15, borderRadius: 20 },
  waitingText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  subText: { color: '#ccc', fontSize: 12 }
});