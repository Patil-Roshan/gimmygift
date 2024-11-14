/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {StyleSheet, TextInput, View, Text, Platform} from 'react-native';
import colors from '../theme/colors';
import scale from '../scale';

interface InputProps {
  id?: string;
  testID?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  [propName: string]: any;
  customStyle?: any;
  customSubStyle?: any;
  customContainerStyle?: any;
}

const Input: React.FC<InputProps> = ({
  id,
  testID,
  leftIcon,
  prefix,
  rightIcon,
  error,
  customStyle,
  customSubStyle,
  customContainerStyle,
  ...otherProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };
  return (
    <View style={[styles.container, customContainerStyle]}>
      <View
        style={[
          styles.subContainer,
          customSubStyle,
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
                  fontFamily: 'SFPro',
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
          style={[styles.input, customStyle]}
          placeholderTextColor={'#747474'}
          onFocus={handleFocus}
          onBlur={handleBlur}
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
    height: Platform.OS === 'ios' ? 50 : 50,
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
    lineHeight: 21,
    margin: Platform.OS === 'ios' ? scale(12) : 0,
    paddingLeft: Platform.OS === 'ios' ? 0 : scale(14),
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
