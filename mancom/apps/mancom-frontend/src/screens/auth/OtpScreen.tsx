import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  verifyOtpAndLogin,
  requestOtp,
  selectIsLoading,
  selectAuthError,
  clearError,
} from '../../store/slices/authSlice';
import { theme } from '../../config/theme';
import type { AuthStackScreenProps } from '../../navigation/types';

type RouteProp = AuthStackScreenProps<'Otp'>['route'];

const OTP_LENGTH = 6;

export function OtpScreen() {
  const route = useRoute<RouteProp>();
  const navigation = useNavigation();
  const { phoneNumber, otpUserId } = route.params;

  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectAuthError);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (error) {
      dispatch(clearError());
    }

    const newOtp = [...otp];

    if (value.length > 1) {
      const pastedOtp = value.slice(0, OTP_LENGTH).split('');
      pastedOtp.forEach((digit, i) => {
        if (i < OTP_LENGTH) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      const focusIndex = Math.min(pastedOtp.length, OTP_LENGTH - 1);
      setActiveIndex(focusIndex);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      setActiveIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) return;

    await dispatch(
      verifyOtpAndLogin({
        userId: otpUserId,
        otp: otpString,
      }),
    );
  };

  const handleResend = async () => {
    await dispatch(requestOtp({ phone: phoneNumber } as any));
    setOtp(Array(OTP_LENGTH).fill(''));
    setCountdown(30);
    setActiveIndex(0);
    inputRefs.current[0]?.focus();
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>💬</Text>
          </View>

          <Text style={styles.heading}>Verify Your Number</Text>
          <Text style={styles.subtext}>
            We sent a 6-digit code to <Text style={styles.boldPhone}>{phoneNumber}</Text>
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => {
              const isFilled = digit !== '';
              const isActive = activeIndex === index;
              return (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    isFilled && styles.otpBoxFilled,
                    isActive && styles.otpBoxActive
                  ]}
                >
                  <RNTextInput
                    ref={ref => { inputRefs.current[index] = ref; }}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={value => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    onFocus={() => setActiveIndex(index)}
                    keyboardType="number-pad"
                    maxLength={index === 0 ? OTP_LENGTH : 1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                  />
                </View>
              );
            })}
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.resendContainer}
            onPress={handleResend}
            disabled={countdown > 0}
          >
            <Text style={styles.resendText}>
              {countdown > 0 ? (
                `Resend code in 00:${countdown.toString().padStart(2, '0')}`
              ) : (
                <Text style={styles.resendLink}>Resend OTP</Text>
              )}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.verifyButton, !isOtpComplete && styles.verifyDisabled]}
            onPress={handleVerify}
            disabled={!isOtpComplete || isLoading}
          >
            <Text style={styles.verifyText}>{isLoading ? 'Verifying...' : 'Verify'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  backButton: {
    paddingVertical: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconText: {
    fontSize: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxl,
    lineHeight: 22,
  },
  boldPhone: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  otpBox: {
    width: 52,
    height: 60,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  otpBoxActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  otpInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  resendContainer: {
    paddingVertical: theme.spacing.md,
  },
  resendText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  resendLink: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  footer: {
    padding: theme.spacing.lg,
  },
  verifyButton: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyDisabled: {
    backgroundColor: '#C4B5FD',
  },
  verifyText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default OtpScreen;
