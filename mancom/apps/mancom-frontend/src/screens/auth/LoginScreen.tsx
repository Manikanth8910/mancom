import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput as RNTextInput, SafeAreaView } from 'react-native';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectIsLoading, selectAuthError, clearError, login, requestOtp } from '../../store/slices/authSlice';
import { theme } from '../../config/theme';

export function LoginScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const authError = useAppSelector(selectAuthError);

  const [phone, setPhone] = useState('');
  const fullPhone = `+91${phone}`;

  const handleSendOtp = async () => {
    if (phone.length < 10) return;
    dispatch(clearError());
    const result = await dispatch(requestOtp(fullPhone));
    if (requestOtp.fulfilled.match(result)) {
      navigation.navigate('Otp', { phoneNumber: `+91 ${phone}`, otpUserId: fullPhone });
    }
  };

  const handleQuickLogin = (email: string) => {
    dispatch(clearError());
    dispatch(login({ email, password: 'password', role: 'user' }));
  };

  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (authError) dispatch(clearError());
  };

  return (
    <View style={styles.container}>
      {/* Top Background Section mimicking gradient */}
      <View style={styles.topSection}>
        <SafeAreaView>
          <View style={styles.brandContainer}>
            <Text style={styles.logoMark}>ManCom</Text>
            <Text style={styles.tagline}>Your Society, Simplified</Text>
          </View>
        </SafeAreaView>
      </View>

      {/* Bottom Sheet Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.bottomSheetWrapper}
      >
        <View style={styles.card}>
          <Text style={styles.heading}>Welcome Back</Text>
          <Text style={styles.subtext}>Enter your registered mobile number</Text>

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.countryCodePill}>
              <Text style={styles.countryCodeText}>+91 🇮🇳</Text>
            </TouchableOpacity>

            <RNTextInput
              style={styles.phoneInput}
              placeholder="98765 43210"
              placeholderTextColor={theme.colors.text.disabled}
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

          <TouchableOpacity
            style={[styles.ctaButton, (!phone || phone.length < 10) && styles.ctaDisabled]}
            onPress={handleSendOtp}
            disabled={!phone || phone.length < 10 || isLoading}
          >
            <Text style={styles.ctaText}>{isLoading ? 'Sending...' : 'Send OTP'}</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            By continuing you agree to our Terms & Privacy Policy
          </Text>

          {/* Development Quick Login Options */}
          <View style={styles.devLoginContainer}>
            <Text style={styles.devLoginText}>Developer Quick Logins:</Text>
            <View style={styles.devButtonsRow}>
              <TouchableOpacity style={styles.devBtn} onPress={() => handleQuickLogin('resident@mancom.com')}>
                <Text style={styles.devBtnText}>Resident</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.devBtn, { borderColor: theme.colors.warning }]} onPress={() => handleQuickLogin('security@mancom.com')}>
                <Text style={[styles.devBtnText, { color: theme.colors.warning }]}>Security</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.devBtn, { borderColor: theme.colors.primary }]} onPress={() => handleQuickLogin('admin@mancom.com')}>
                <Text style={[styles.devBtnText, { color: theme.colors.primary }]}>Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.devBtn, { borderColor: '#1E1B4B' }]} onPress={() => handleQuickLogin('superadmin@mancom.com')}>
                <Text style={[styles.devBtnText, { color: '#1E1B4B' }]}>Super</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary, // Using solid color as fallback for gradient
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: -theme.spacing.xxl,
  },
  logoMark: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.surface,
    letterSpacing: -1,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.regular,
    color: 'rgba(255,255,255,0.8)',
  },
  bottomSheetWrapper: {
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl,
    minHeight: '55%',
  },
  heading: {
    fontSize: 26,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtext: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  countryCodePill: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  countryCodeText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  phoneInput: {
    flex: 1,
    height: 56,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  ctaButton: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.text.disabled,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  devLoginContainer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  devLoginText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  devButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  devBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary,
    alignItems: 'center',
  },
  devBtnText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.secondary,
  }
});

export default LoginScreen;
