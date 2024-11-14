/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {Image} from 'react-native';

interface IconProps {
  icon?: any;
  size?: number;
  tintColor?: string;
}

const Icon: React.FC<IconProps> = ({icon, size, tintColor}) => {
  return (
    <Image
      resizeMode="cover"
      source={icon}
      tintColor={tintColor ?? undefined}
      style={{height: size, width: size, zIndex: 1}}
    />
  );
};

export default Icon;
