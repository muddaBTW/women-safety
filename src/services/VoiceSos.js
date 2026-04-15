import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { GROQ_API_KEY, GROQ_WHISPER_URL } from '../constants/Config';

// Keywords that trigger SOS (English + Hindi)
const TRIGGER_KEYWORDS = [
  'help me', 'help', 'save me', 'save', 'emergency',
  'bachao', 'bachaao', 'bacha lo', 'madad', 'mujhe bachao',
  'please help', 'somebody help', 'danger', 'stop',
  'call police', 'call the police',
];

class VoiceSosService {
  constructor() {
    this.recording = null;
    this.isListening = false;
    this.onSosDetected = null;
    this.onTranscription = null;
    this.intervalId = null;
  }

  async start(onSosDetected, onTranscription) {
    if (this.isListening) return false;

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.warn('Microphone permission denied');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      this.isListening = true;
      this.onSosDetected = onSosDetected;
      this.onTranscription = onTranscription;

      // Start continuous listen loop
      this.listenLoop();

      return true;
    } catch (e) {
      console.error('Voice SOS start failed:', e);
      return false;
    }
  }

  async listenLoop() {
    while (this.isListening) {
      try {
        // Record 4 seconds of audio
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.LOW,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 64000,
          },
        });

        await recording.startAsync();
        this.recording = recording;

        // Record for 4 seconds
        await new Promise(resolve => setTimeout(resolve, 4000));

        if (!this.isListening) {
          await recording.stopAndUnloadAsync();
          break;
        }

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        if (uri) {
          // Transcribe in background
          this.transcribeAndCheck(uri);
        }
      } catch (e) {
        console.warn('Recording cycle failed:', e.message);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  async transcribeAndCheck(audioUri) {
    try {
      // Create form data for Groq Whisper API
      const formData = new FormData();

      if (Platform.OS === 'web') {
        // On web, fetch the blob
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append('file', blob, 'audio.m4a');
      } else {
        // On mobile, use the file URI
        formData.append('file', {
          uri: audioUri,
          type: 'audio/m4a',
          name: 'audio.m4a',
        });
      }

      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'en');
      formData.append('response_format', 'json');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(GROQ_WHISPER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Whisper API error:', response.status);
        return;
      }

      const result = await response.json();
      const text = (result.text || '').toLowerCase().trim();

      if (!text || text.length < 2) return;

      console.log('Heard:', text);

      if (this.onTranscription) {
        this.onTranscription(text);
      }

      // Check for trigger keywords
      const triggered = TRIGGER_KEYWORDS.some(keyword => text.includes(keyword));

      if (triggered && this.onSosDetected) {
        console.log('🚨 Voice SOS triggered! Heard:', text);
        this.onSosDetected(text);
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.warn('Transcription failed:', e.message);
      }
    }
  }

  async stop() {
    this.isListening = false;

    if (this.recording) {
      try {
        const status = await this.recording.getStatusAsync();
        if (status.isRecording) {
          await this.recording.stopAndUnloadAsync();
        }
      } catch (e) {
        // Already stopped
      }
      this.recording = null;
    }

    this.onSosDetected = null;
    this.onTranscription = null;
  }
}

export default new VoiceSosService();
