import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LiveLocationService {
  constructor() {
    this.watchSubscription = null;
    this.isTracking = false;
    this.onLocationUpdate = null;
    this.intervalId = null;
  }

  async start(callback) {
    if (this.isTracking) return;

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Location permission not granted');
      return false;
    }

    this.isTracking = true;
    this.onLocationUpdate = callback;

    // Poll location every 30 seconds
    this.intervalId = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;

        if (this.onLocationUpdate) {
          this.onLocationUpdate(latitude, longitude);
        }
      } catch (e) {
        console.warn('Location update failed:', e.message);
      }
    }, 30000);

    // Also send an immediate update
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (this.onLocationUpdate) {
        this.onLocationUpdate(location.coords.latitude, location.coords.longitude);
      }
    } catch (e) {
      console.warn('Initial location failed:', e.message);
    }

    return true;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isTracking = false;
    this.onLocationUpdate = null;
  }
}

export default new LiveLocationService();
