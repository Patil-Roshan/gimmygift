/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import colors from '../theme/colors';

import scaledSize from '../scaleSize';

const CustomTabBar = ({state, descriptors, navigation}) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const {options} = descriptors[route.key];

        // Get the label for the tab
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;
        const color = isFocused ? colors.primary : '#ff0000';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!event.defaultPrevented) {
            if (options.listeners && options.listeners.tabPress) {
              options.listeners.tabPress(event);
            } else {
              navigation.navigate(route.name);
            }
          }
        };

        const renderIcon = () => {
          if (options.tabBarIcon) {
            return options.tabBarIcon({color: color, focused: isFocused});
          }
          return null;
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? {selected: true} : {}}
            onPress={onPress}
            style={styles.tabItem}>
            {renderIcon()}
            <Text
              style={{
                color: color,
                // Remove border or shadow from labels
                textShadowColor: 'transparent',
                textShadowOffset: {width: 0, height: 0},
                textShadowRadius: 0,
                borderWidth: 0,
              }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(249, 249, 249, 0.8)',
    height: scaledSize(85),
    paddingHorizontal: scaledSize(12),
    marginBottom: scaledSize(8),
    borderTopColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 0.5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
});

export default CustomTabBar;
