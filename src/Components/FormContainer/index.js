import {
    View,
    ScrollView,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    Text,
    SafeAreaView
} from 'react-native'
import React from 'react'

export default function FormContainer({ children }) {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                // behavior="padding"
                // enabled
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
                        {children}
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}