/**
 * TextInput Component
 * Black and white wireframe style text input
 */

import React from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { theme } from '../../config/theme';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  prefix?: string;
}

export function TextInput({
  label,
  error,
  containerStyle,
  inputStyle,
  prefix,
  ...props
}: TextInputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <RNTextInput
          style={[styles.input, prefix && styles.inputWithPrefix, inputStyle]}
          placeholderTextColor={theme.colors.text.disabled}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  prefix: {
    paddingLeft: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  inputWithPrefix: {
    paddingLeft: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default TextInput;
