import { Accelerometer } from 'expo-sensors';
import { Platform } from 'react-native';

const SHAKE_THRESHOLD = 1.8; // G-force threshold for a shake
const SHAKE_COUNT_THRESHOLD = 3; // Number of shakes needed to trigger
const SHAKE_WINDOW_MS = 2000; // Time window to detect shakes
const COOLDOWN_MS = 10000; // Cooldown after SOS trigger (prevent double-trigger)

class ShakeDetectorService {
  constructor() {
    this.subscription = null;
    this.shakeTimestamps = [];
    this.onShakeDetected = null;
    this.isEnabled = false;
    this.lastTrigger = 0;
  }

  async start(callback) {
    if (this.subscription) return;
    
    // Feature NOT supported on Web
    if (Platform.OS === 'web') {
      console.warn('Shake detection is not supported on web platforms.');
      return;
    }

    this.onShakeDetected = callback;
    this.isEnabled = true;

    try {
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (!isAvailable) {
        console.warn('Accelerometer is not available on this device');
        return;
      }

      Accelerometer.setUpdateInterval(100); // Check every 100ms

      this.subscription = Accelerometer.addListener(({ x, y, z }) => {
        if (!this.isEnabled) return;

        const totalForce = Math.sqrt(x * x + y * y + z * z);

        if (totalForce > SHAKE_THRESHOLD) {
          const now = Date.now();

          // Add timestamp
          this.shakeTimestamps.push(now);

          // Remove old timestamps outside the window
          this.shakeTimestamps = this.shakeTimestamps.filter(
            ts => now - ts < SHAKE_WINDOW_MS
          );

          // Check if we have enough shakes in the window
          if (this.shakeTimestamps.length >= SHAKE_COUNT_THRESHOLD) {
            // Cooldown check
            if (now - this.lastTrigger > COOLDOWN_MS) {
              this.lastTrigger = now;
              this.shakeTimestamps = [];
              if (this.onShakeDetected) {
                this.onShakeDetected();
              }
            }
          }
        }
      });
    } catch (e) {
      console.warn('ShakeDetector initialization failed:', e.message);
    }
  }

  stop() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.isEnabled = false;
    this.shakeTimestamps = [];
  }

  toggle(enabled, callback) {
    if (enabled) {
      this.start(callback);
    } else {
      this.stop();
    }
  }
}

// Singleton instance
export default new ShakeDetectorService();
