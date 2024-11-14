/* eslint-disable react-native/no-inline-styles */
import React, {useState, useCallback} from 'react';
import {StyleSheet, TextInput, View, Text, Platform} from 'react-native';
import colors from '../theme/colors';

interface InputProps {
  id?: string;
  testID?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  type?: 'phone' | 'text' | 'email' | 'password';
  value?: string;
  onChangeText?: (text: string) => void;
  country?: string;
  maxLength?: number;
  [propName: string]: any;
}

interface MaskPattern {
  pattern: string;
  length: number;
}

const MASK_PATTERNS: Record<string, MaskPattern> = {
  '1': {
    pattern: '000 000 0000',
    length: 10,
  },
  '91': {
    pattern: '00000 00000',
    length: 10,
  },
  '44': {
    pattern: '00000 000000',
    length: 11,
  },
  '86': {
    pattern: '000 0000 0000',
    length: 11,
  },
  default: {
    pattern: '', // Empty pattern means no formatting
    length: 15, // Default max length for unknown formats
  },
};

const Input: React.FC<InputProps> = ({
  id,
  testID,
  leftIcon,
  prefix,
  rightIcon,
  error,
  type = 'text',
  value = '',
  onChangeText,
  country = '+1',
  maxLength,
  ...otherProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getCurrentMask = useCallback(() => {
    return MASK_PATTERNS[country] || MASK_PATTERNS.default;
  }, [country]);
  console.log('country', country);
  const formatPhoneNumber = useCallback(
    (text: string) => {
      if (type !== 'phone') {
        return text;
      }

      // Remove all non-numeric characters
      const cleaned = text.replace(/\D/g, '');
      const {pattern, length} = getCurrentMask();

      // If no pattern (unknown country code), return cleaned number without formatting
      if (!pattern) {
        return cleaned;
      }

      let formatted = '';
      let numberIndex = 0;

      // Apply the mask pattern
      for (let i = 0; i < pattern.length && numberIndex < cleaned.length; i++) {
        if (pattern[i] === '0') {
          formatted += cleaned[numberIndex];
          numberIndex++;
        } else {
          formatted += pattern[i];
          if (numberIndex < cleaned.length) {
            formatted += cleaned[numberIndex];
            numberIndex++;
          }
        }
      }

      return formatted;
    },
    [getCurrentMask, type],
  );

  const handleTextChange = (text: string) => {
    if (type === 'phone') {
      const cleaned = text.replace(/\D/g, '');
      const {length} = getCurrentMask();
      const effectiveMaxLength = maxLength || length;

      if (cleaned.length <= effectiveMaxLength) {
        const formatted = formatPhoneNumber(cleaned);
        onChangeText?.(formatted);
      }
    } else {
      onChangeText?.(text);
    }
  };

  const getEffectiveMaxLength = () => {
    if (type !== 'phone') {
      return maxLength;
    }

    const {pattern, length} = getCurrentMask();
    if (!pattern) {
      return maxLength || length;
    } // For unknown country codes, use provided maxLength or default length

    // For known patterns, calculate max length including spaces
    const spacesCount = (pattern.match(/ /g) || []).length;
    return length + spacesCount;
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.subContainer,
          {borderColor: isFocused ? colors.primary : '#DBD6D7'},
        ]}>
        {leftIcon && (
          <View
            style={[
              styles.leftIconContainer,
              {borderColor: isFocused ? colors.primary : '#DBD6D7'},
            ]}>
            <View style={styles.leftIcon}>{leftIcon}</View>
          </View>
        )}
        {prefix && (
          <View
            style={[
              {
                borderColor: isFocused ? colors.primary : '#DBD6D7',
                paddingHorizontal: 5,
              },
            ]}>
            <View style={styles.prefix}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  lineHeight: 22,
                  letterSpacing: 0,
                  color: '#000000',
                }}>
                {prefix}
              </Text>
            </View>
          </View>
        )}
        <TextInput
          testID={testID}
          key={id}
          multiline={false}
          style={styles.input}
          placeholderTextColor={'#747474'}
          onFocus={handleFocus}
          onBlur={handleBlur}
          defaultValue={type === 'phone' ? formatPhoneNumber(value) : value}
          onChangeText={handleTextChange}
          keyboardType={type === 'phone' ? 'phone-pad' : 'default'}
          maxLength={getEffectiveMaxLength()}
          {...otherProps}
        />
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            <View style={styles.leftIcon}>{rightIcon}</View>
          </View>
        )}
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    alignSelf: 'center',
  },
  subContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderColor: '#DBD6D7',
    borderWidth: 1,
    width: '100%',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.white,
    height: 50,
  },
  leftIconContainer: {
    borderRightWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
    paddingRight: 20,
    height: '100%',
  },
  rightIconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'SFPro',
    fontWeight: 'normal',
    color: colors.black,
    fontSize: 17,
    letterSpacing: 0,
    width: '80%',
    margin: Platform.OS === 'ios' ? 10 : 0,
  },
  prefix: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginRight: -8,
  },
  leftIcon: {
    width: 35,
    height: 35,
  },
  rightIcon: {
    width: 24,
    height: 24,
  },
  errorContainer: {
    padding: 3,
  },
  error: {
    fontSize: 13,
    color: '#FF6961',
    fontWeight: '500',
  },
});

export default Input;
