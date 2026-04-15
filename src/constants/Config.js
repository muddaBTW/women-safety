import AsyncStorage from '@react-native-async-storage/async-storage';

const ESP_IP_KEY = 'esp32_ip';
const DEFAULT_ESP_IP = '192.168.31.160';

export const getEspIp = async () => {
  try {
    const ip = await AsyncStorage.getItem(ESP_IP_KEY);
    return ip || DEFAULT_ESP_IP;
  } catch {
    return DEFAULT_ESP_IP;
  }
};

export const setEspIp = async (ip) => {
  const cleaned = ip.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  await AsyncStorage.setItem(ESP_IP_KEY, cleaned);
  return cleaned;
};

export const getEspBaseUrl = async () => {
  const ip = await getEspIp();
  return `http://${ip}`;
};

// Quick connectivity check — 3 second timeout
export const pingEsp = async () => {
  try {
    const baseUrl = await getEspBaseUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${baseUrl}/ping`, { signal: controller.signal });
    clearTimeout(timeoutId);

    return response.ok;
  } catch {
    return false;
  }
};

export const DEFAULT_ESP_IP_VALUE = DEFAULT_ESP_IP;

// Security: Do not push this key to public repositories
// Security: Replace this with your actual key locally. 
// GitHub will block the push if a real key is detected here.
export const GROQ_API_KEY = 'PASTE_YOUR_GROQ_API_KEY_HERE';
export const GROQ_WHISPER_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
