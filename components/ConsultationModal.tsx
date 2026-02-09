import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LiveKitRoom, useTracks, VideoTrack } from '@livekit/react-native';
import { Track } from 'livekit-client';
import { Audio } from 'expo-av';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

// ⚠️ UPDATE THIS IF NGROK RESTARTS
const API_URL = "https://313c-2a09-bac1-3680-c8-00-242-be.ngrok-free.app";

// ⚠️ YOUR LIVEKIT URL
const LIVEKIT_WS = "wss://symtotrack-l0osmovg.livekit.cloud";

interface ConsultationModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  patientName: string;
}

export default function ConsultationModal({ visible, onClose, roomId, patientName }: ConsultationModalProps) {
  const [token, setToken] = useState("");
  const [permissionGranted, setPermissionGranted] = useState(false);

  // 1. Request Permissions
  useEffect(() => {
    if (visible) {
      (async () => {
        const cameraStatus = await Camera.requestCameraPermissionsAsync();
        const audioStatus = await Audio.requestPermissionsAsync();
        if (cameraStatus.status === 'granted' && audioStatus.status === 'granted') {
          setPermissionGranted(true);
        } else {
          Alert.alert("Permission Required", "Camera access is needed.");
        }
      })();
    }
  }, [visible]);

  // 2. Fetch Token
  useEffect(() => {
    if (!visible || !roomId || !permissionGranted) return;

    async function fetchToken() {
      try {
        // Double check we strip any prefix just in case
        const cleanRoomId = roomId.replace('appointment-', '');
        
        console.log(`Fetching token for room: ${cleanRoomId}`);
        const response = await fetch(
          `${API_URL}/api/livekit?room=${cleanRoomId}&username=${encodeURIComponent(patientName)}`
        );
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error("Token Error:", error);
      }
    }
    fetchToken();
  }, [visible, roomId, permissionGranted]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        {!permissionGranted ? (
          <View style={styles.center}><Text style={styles.text}>Requesting Permissions...</Text></View>
        ) : !token ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#2563EB" /><Text style={styles.text}>Connecting...</Text></View>
        ) : (
          <LiveKitRoom
            serverUrl={LIVEKIT_WS}
            token={token}
            connect={true}
            video={true}
            audio={true}
          >
            <VideoGrid roomId={roomId} />
            <View style={styles.controls}>
               <TouchableOpacity style={styles.btn} onPress={onClose}>
                 <Text style={styles.btnText}>End Consultation</Text>
               </TouchableOpacity>
            </View>
          </LiveKitRoom>
        )}
      </View>
    </Modal>
  );
}

function VideoGrid({ roomId }: { roomId: string }) {
  // ✅ FIX: onlySubscribed: false makes your camera show up!
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const hasDoctor = tracks.some(track => !track.participant.isLocal);

  if (tracks.length === 0) return <View style={styles.center}><Text style={styles.text}>Loading Video...</Text></View>;

  return (
    <View style={styles.grid}>
      {tracks.map((track) => (
        <View key={track.participant.identity} style={styles.trackContainer}>
           <VideoTrack trackRef={track} style={{ width: '100%', height: '100%' }} objectFit="cover" />
           <Text style={styles.label}>{track.participant.isLocal ? "You" : "Doctor"}</Text>
        </View>
      ))}
      {!hasDoctor && (
        <View style={styles.waitingOverlay}>
           <Text style={styles.waitingText}>Waiting for doctor...</Text>
           <Text style={styles.subText}>Room: {roomId.replace('appointment-', '').slice(0,8)}...</Text>
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
 trackContainer: {
  flex: 1, 
  minWidth: '100%', 
  minHeight: '50%',
  // Remove: border: '1px solid #333',
  // Add these instead:
  borderWidth: 1,
  borderColor: '#333',
  borderStyle: 'solid', // 'solid' is the default, but you can explicitly add it
},
  controls: { position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' },
  btn: { backgroundColor: '#ef4444', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 30 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  label: { position: 'absolute', top: 10, left: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, borderRadius: 4 },
  waitingOverlay: { position: 'absolute', bottom: 150, alignSelf: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', padding: 15, borderRadius: 20 },
  waitingText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  subText: { color: '#ccc', fontSize: 12 }
});