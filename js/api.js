// Treasure Hunt API Service
const API_BASE_URL = 'https://codecyprus.org/th/api';
const REQUEST_TIMEOUT_MS = 10000; // 10 seconds

async function request(endpoint, options = {}) {
    
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);


    try{
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            signal: controller.signal,
            ...options,
        });

    
        const data = await response.json();

        if (!response.ok || data.status === 'error' || data.error) {
            throw new Error(data.message || data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

export async function fetchTreasureHunts() {
    const res = await request('/list');
    const list = Array.isArray(res.list) ? res.list : (res.treasureHunts || res.hunts || res.data || []);
    return list.map ((item, idx) => ({
        id: item.id ?? item._uuid ?? `hunt-${idx}`,
        name: item.name || item.title || 'Untitled Hunt',
    ));