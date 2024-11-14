/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import CustomModal from '../../components/Modal';
import colors from '../../theme/colors';
import activeUserInstance from '../../../store/activeUsersInstance';
import {termsLink} from '../../referenceData';

const GimmePick = () => {
  const [isModalVisible, setIsModalVisible] = useState(true);
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const styles = StyleSheet.create({
    footer: {
      color: colors.black,
      textAlign: 'center',
      width: '100%',
    },
  });

  const footerTxt = (
    <View
      style={{
        marginVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{color: colors.black, textAlign: 'center', width: '100%'}}>
        This process involves the use of{' '}
        <Image
          resizeMode="center"
          source={require('../../assets/images/app_logo_red.png')}
          style={{width: 20, height: 20}}
        />{' '}
        GiftProfile.
      </Text>
      <Text style={styles.footer}>
        You will be able to manage added items in settings.
      </Text>
      <Text style={styles.footer}>
        By continuing you accept our
        <Text
          onPress={() => Linking.openURL(termsLink)}
          style={[styles.footer, {color: colors.primary}]}>
          {' '}
          Conditions.
        </Text>
      </Text>
    </View>
  );

  return (
    <View>
      <TouchableOpacity onPress={toggleModal}>
        <Text>Open Modal</Text>
      </TouchableOpacity>
      <CustomModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        icon={require('../../assets/icons/ic_pick.png')}
        title="GimmePick"
        content="Add to GiftProfile the items you would like to receive as gifts. Train our AI about what you really love for each category and price point."
        actions={[
          {
            label: 'Continue',
            onPress: () => setIsModalVisible(false),
          },
        ]}
        footer={footerTxt}
      />
    </View>
  );
};

export default GimmePick;
