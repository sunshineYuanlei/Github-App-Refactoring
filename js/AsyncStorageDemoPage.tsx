import React, { useState } from 'react';
import {
    Button,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = "devio.org";
export default (props: any) => {
    const [text, onChangeText] = useState("");
    const [showText, setShowText] = useState("");
    const onSave = async () => {
        try {
            await AsyncStorage.setItem(KEY, text);
        } catch (error) {
            console.log(error);
        }
    }
    const onGet = async () => {
        try {
            const value = await AsyncStorage.getItem(KEY);
            setShowText(value || '');
            console.log(value);
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <SafeAreaView style={styles.root}>
            <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                value={text}
            />
            <Button title={"Save"} onPress={onSave} />
            <Button title={"Get"} onPress={onGet} />
            <Text>Restult：{showText}</Text>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});