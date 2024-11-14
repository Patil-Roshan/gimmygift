/* eslint-disable react-native/no-inline-styles */
//create s simple message preview screen
import React, {useRef, useState} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import FastImage from 'react-native-fast-image';
import colors from '../../theme/colors';
import {useNavigation, useRoute} from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function GiftPreview() {
  const route = useRoute<any>();

  const {
    receipient_profile_image,
    receipient_name,
    sender_profile_image,
    sender_name,
    gift_image,
    event_type,
    event_date,
    gift_wrapper,
    gift_color,
  } = route?.params || {};

  const navigation = useNavigation();

  const confettiRef = useRef(null);
  const [showGift, setShowGift] = useState(false);
  return (
    <View
      style={{
        width: '100%',
        position: 'absolute',
        bottom: 0,
        height: '100%',
        backgroundColor: gift_color ? gift_color : colors.primary,
        padding: 10,
      }}>
      <SafeAreaView style={{backgroundColor: colors.primary}} />
      <StatusBar barStyle="dark-content" />
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <FastImage
          source={
            receipient_profile_image
              ? {uri: receipient_profile_image}
              : require('../../assets/images/user_placeholder.png')
          }
          resizeMode="cover"
          style={{
            height: 40,
            width: 40,
            marginVertical: 25,
            borderRadius: 40,
          }}
        />
        <View
          style={{
            width: 1.2,
            backgroundColor: '#fff',
            height: 40,
            margin: 15,
          }}
        />
        <FastImage
          source={
            sender_profile_image
              ? {uri: sender_profile_image}
              : require('../../assets/images/user_placeholder.png')
          }
          resizeMode="cover"
          style={{
            height: 40,
            width: 40,
            marginVertical: 25,
            borderRadius: 40,
          }}
        />
        <MaterialCommunityIcons
          onPress={() => navigation.goBack()}
          style={{position: 'absolute', right: 10}}
          name="close"
          size={30}
          color="#fff"
        />
      </View>

      <Text
        style={{
          fontFamily: 'SFPro',
          fontSize: 22,
          fontWeight: '500',
          fontStyle: 'normal',
          letterSpacing: 0,
          color: '#fff',
        }}>
        Gift to {receipient_name}
      </Text>

      <Text
        style={{
          fontFamily: 'SFPro',
          fontSize: 16,
          fontWeight: '500',
          fontStyle: 'normal',
          letterSpacing: 0,
          color: '#fff',
        }}>
        By {sender_name}
      </Text>

      <ConfettiCannon
        count={250}
        origin={{x: -10, y: 0}}
        autoStart={false}
        explosionSpeed={450}
        ref={confettiRef}
      />

      {showGift ? (
        <TouchableOpacity
          style={{zIndex: -1}}
          onPress={() => {
            setShowGift(!showGift);
          }}>
          <FastImage
            source={{
              uri: gift_image,
            }}
            resizeMode="cover"
            style={{
              height: 350,
              width: '95%',
              backgroundColor: '#d6d6d6',
              alignSelf: 'center',
              marginVertical: 25,
              borderRadius: 40,
              zIndex: -1,
            }}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={{zIndex: -1}}
          onPress={() => {
            setShowGift(!showGift);
            confettiRef?.current?.start();
          }}>
          <ImageBackground
            source={{
              uri: gift_wrapper,
            }}
            style={{
              height: 350,
              width: '100%',
              alignSelf: 'center',
              marginVertical: 25,
              borderRadius: 40,
              overflow: 'hidden',
              borderWidth: 0.5,
            }}>
            <FastImage
              source={require('../../assets/images/ribbon.png')}
              resizeMode="cover"
              style={{
                height: '100%',
                width: '100%',
                alignSelf: 'center',
              }}
            />
          </ImageBackground>
        </TouchableOpacity>
      )}

      <Text
        style={{
          fontFamily: 'SFPro',
          fontSize: 16,
          fontWeight: '500',
          fontStyle: 'normal',
          letterSpacing: 0,
          color: '#fff',
          textAlign: 'center',
        }}>
        {showGift ? '' : 'Tap to unwrap'}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          marginTop: 55,
          alignItems: 'center',
          alignSelf: 'center',
        }}>
        <Image
          style={{height: 25, width: 25}}
          tintColor={'#fff'}
          source={require('../../assets/icons/ic_occasions.png')}
        />

        <Text
          style={{
            fontFamily: 'SFPro',
            fontSize: 20,
            fontWeight: '600',
            fontStyle: 'normal',
            letterSpacing: 0,
            color: '#fff',
            textAlign: 'center',
            paddingHorizontal: 10,
          }}>
          {event_type} • Scheduled {event_date}
        </Text>
      </View>
    </View>
  );
}
