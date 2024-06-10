import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_BOARDING_PASS = 'boarding-pass';

export function saveBoarding(data: string) {
    AsyncStorage.setItem(KEY_BOARDING_PASS, data);
}

export async function getBoarding() {
    return await AsyncStorage.getItem(KEY_BOARDING_PASS);
}