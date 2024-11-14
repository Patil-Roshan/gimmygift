// VirtualGiftList.tsx
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import VirtualGiftReceived from './VirtualGiftReceived'; // Adjust the import path as necessary
import VirtualGiftSent from './VirtualGiftSent'; // Adjust the import path as necessary
import colors from '../../theme/colors';
import Icon from '../../components/Icon';
import {chevronBack, ic_back} from '../../assets/icons/icons';
import {useNavigation} from '@react-navigation/native';

const TopTab = createMaterialTopTabNavigator();

const VirtualGiftList = () => {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={{backgroundColor: '#fff'}} />
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.header_left}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon icon={chevronBack} size={30} tintColor={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.header_text}>Virtual Gifts</Text>
          </View>
          {/* <Icon icon={ic_searchprofile} size={30} tintColor={colors.primary} /> */}
        </View>
        <View style={{height: '100%'}}>
          <TopTab.Navigator
            screenOptions={{
              tabBarStyle: {
                backgroundColor: colors.white,
                marginBottom: 10,
              },
            }}>
            <TopTab.Screen name="Received" component={VirtualGiftReceived} />
            <TopTab.Screen name="Sent" component={VirtualGiftSent} />
          </TopTab.Navigator>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.pastelRed,
  },
  container: {
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header_left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  header_text: {
    fontSize: 28,
    color: colors.black,
    fontWeight: '600',
  },
});
export default VirtualGiftList;
