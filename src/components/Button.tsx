/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import colors from '../theme/colors';

interface ButtonProps {
  label?: string;
  testID?: string;
  onPress?: any;
  isLoading?: boolean;
  width?: any;
  height?: any;
  bg?: string;
  fontSize?: number;
  fontColor?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  testID,
  onPress,
  isLoading,
  width,
  height,
  fontSize,
  fontColor,
  bg,
  disabled,
}) => {
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btnContainer,
        {
          width: width ?? '70%',
          height: height ?? 50,
          backgroundColor: disabled ? '#f6575f80' : bg ?? colors.primary,
        },
      ]}>
      {isLoading ? (
        <ActivityIndicator
          size={'small'}
          style={{
            padding: 8,
          }}
          color={colors.white}
        />
      ) : (
        <Text
          style={[
            styles.labelStyle,
            {
              fontSize: fontSize ?? 18,
              color: fontColor ?? colors.white,
            },
          ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btnContainer: {
    borderRadius: 8,
    width: '70%',
    height: 50,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    marginVertical: 20,
    justifyContent: 'center',
  },
  labelStyle: {
    color: colors.white,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
    textAlignVertical: 'center',
  },
});

export default Button;
