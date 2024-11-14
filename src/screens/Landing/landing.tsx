import React from 'react';
import {ScrollView, Text, TouchableOpacity} from 'react-native';
import {styles} from './landing.styles';
import FastImage from 'react-native-fast-image';
import Icon from '../../components/Icon';
import {
  ic_gift,
  ic_giftprofile,
  ic_greeting_card,
  ic_greetingcard,
  ic_kidsprofile,
  ic_searchprofile,
  ic_textmessage,
} from '../../assets/icons/icons';
import Divider from '../../components/Divider';
import {useNavigation} from '@react-navigation/core';

interface OptionBtnProps {
  label: string | undefined;
  icon?: any;
  size?: number;
}

const Landing = () => {
  const navigation = useNavigation<any>();

  const renderOptionButton: React.FC<OptionBtnProps> = ({
    label,
    icon,
    size,
  }) => {
    return (
      <TouchableOpacity
        testID={label}
        style={styles.btnContainer}
        onPress={() => handleNavigation(label)}>
        <Icon size={size} icon={icon} />
        <Text style={styles.btnLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const handleNavigation = (type: string | undefined) => {
    if (type === 'Create a GiftProfile for your kids') {
      navigation.navigate('registration', {registrationType: 'Kids'});
    } else {
      navigation.navigate('registration', {registrationType: 'Personal'});
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <FastImage
        source={require('../../assets/images/app_logo_red.png')}
        style={styles.image}
      />

      <Text style={styles.welcomeLabel}>Welcome to GimmeGift</Text>
      <Text style={styles.welcomeSubLabel}>
        To continue, choose one of these options
      </Text>

      {renderOptionButton({
        label: 'Create your GiftProfile',
        icon: ic_giftprofile,
        size: 28,
      })}

      {renderOptionButton({
        label: 'Create a GiftProfile for your kids',
        icon: ic_kidsprofile,
        size: 28,
      })}

      <Divider label="or" />

      {renderOptionButton({
        label: 'Find a gift',
        icon: ic_gift,
        size: 28,
      })}

      {renderOptionButton({
        label: 'Send a greeting card',
        icon: ic_greetingcard,
        size: 28,
      })}

      {renderOptionButton({
        label: 'Send a text message',
        icon: ic_textmessage,
        size: 28,
      })}

      {renderOptionButton({
        label: 'Search a GiftProfile',
        icon: ic_searchprofile,
        size: 28,
      })}

      <TouchableOpacity
        testID="btnLogin"
        onPress={() => navigation.navigate('login')}>
        <Text style={styles.signinLabel}>
          Already have a GiftProfile?
          <Text style={styles.signinLabelRed}> Sign in</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
export default Landing;
