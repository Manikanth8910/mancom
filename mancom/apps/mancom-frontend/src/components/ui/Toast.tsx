import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { Animated, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../../config/theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextProps {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [message, setMessage] = useState('');
    const [type, setType] = useState<ToastType>('info');
    const slideAnim = useRef(new Animated.Value(-100)).current;

    const showToast = (msg: string, t: ToastType = 'info') => {
        setMessage(msg);
        setType(t);

        Animated.sequence([
            Animated.timing(slideAnim, {
                toValue: 20,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2500),
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return theme.colors.success;
            case 'error': return theme.colors.error;
            default: return theme.colors.primary;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Animated.View
                style={[
                    styles.toastContainer,
                    { backgroundColor: getBackgroundColor(), transform: [{ translateY: slideAnim }] }
                ]}
            >
                <SafeAreaView>
                    <Text style={styles.toastText}>{message}</Text>
                </SafeAreaView>
            </Animated.View>
        </ToastContext.Provider>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    toastText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 14,
    },
});
