/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';

// Tab Imports
import Dashboard from '../screens/Dashboard/dashboard';
import Icon from '../components/Icon';
import {
  ic_assistant,
  ic_home,
  ic_occasions,
  ic_profile,
  ic_recipients,
} from '../assets/icons/icons';

import GiftAssistant from '../screens/GiftAssistant/giftassistant';
import GiftProfile from '../screens/GiftProfile/giftprofile';
import Occasions from '../screens/Occasions/occasions';
import Recipients from '../screens/Recipients/recipients';
import colors from '../theme/colors';
import {navigationRef} from './navigationService';
import scaledSize from '../scaleSize';

const Tab = createMaterialBottomTabNavigator();

const TabNavigator = () => {
  const renderTabBarIcon = (
    name: string,
    tintColor: string,
    focused: boolean,
  ) => (
    <View
      style={{
        borderTopWidth: focused ? 1 : 0,
        borderColor: colors.primary,
        position: 'absolute',
        top: -16,
        paddingTop: name === ic_assistant ? scaledSize(8) : scaledSize(15),
        width: Dimensions.get('window').width / 5,
        alignItems: 'center',
      }}>
      <Icon
        size={name === ic_assistant ? scaledSize(30) : scaledSize(24)}
        icon={name}
        tintColor={tintColor}
      />
    </View>
  );

  return (
    <Tab.Navigator
      shifting={false}
      labeled={true}
      activeColor={colors.primary}
      activeIndicatorStyle={{backgroundColor: 'transparent'}}
      inactiveColor="gray"
      barStyle={styles.barStyle}>
      <Tab.Screen
        name="Home"
        component={Dashboard}
        options={{
          tabBarIcon: ({color, focused}) =>
            renderTabBarIcon(ic_home, color, focused),
        }}
      />
      <Tab.Screen
        name="Occasions"
        component={Occasions}
        options={{
          tabBarIcon: ({color, focused}) =>
            renderTabBarIcon(ic_occasions, color, focused),
        }}
      />
      <Tab.Screen
        name="Assistant"
        component={GiftAssistant}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            navigationRef.navigate('giftassistant');
          },
        }}
        options={{
          tabBarIcon: ({color, focused}) =>
            renderTabBarIcon(ic_assistant, null, focused),
        }}
      />
      <Tab.Screen
        name="Recipients"
        component={Recipients}
        options={{
          tabBarIcon: ({color, focused}) =>
            renderTabBarIcon(ic_recipients, color, focused),
        }}
      />
      <Tab.Screen
        name="GiftProfile"
        component={GiftProfile}
        options={{
          tabBarIcon: ({color, focused}) =>
            renderTabBarIcon(ic_profile, color, focused),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({
  barStyle: {
    marginBottom: scaledSize(8),
    paddingHorizontal: scaledSize(12),
    height: scaledSize(85),
    backgroundColor: 'rgba(249, 249, 249, 0.8)',
    shadowColor: 'rgba(0, 0, 0, 0)',
    borderTopColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 0.5,
  },
});
