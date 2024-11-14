/* eslint-disable react-native/no-inline-styles */
//create s simple message preview screen
import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import FastImage from 'react-native-fast-image';
import colors from '../../theme/colors';
import {useNavigation, useRoute} from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';
import {supabase} from '../../lib/supabase';
import moment from 'moment';
import {config} from '../../config';
import Toast from 'react-native-toast-message';

export default function LinkMessagePreview() {
  const route = useRoute<any>();
  const {eventID} = route?.params || {};

  const navigation = useNavigation();
  const confettiRef = useRef(null);
  const [showGift, setShowGift] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState({});
  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    if (eventID) {
      try {
        let eventDetails = {};

        // Fetch details from the 'events' table
        const {data, error} = await supabase
          .schema('event')
          .from('events')
          .select('event_id, event_type, created_by_user_id, start_datetime')
          .eq('event_id', eventID);

        if (!error && data.length > 0) {
          // Add event details to the eventDetails object
          eventDetails = {
            ...eventDetails,
            event: data[0],
          };

          // Fetch user data from the 'profiles' table
          const {data: sender, error: userError} = await supabase
            .from('profiles')
            .select('full_name, user_id')
            .eq('user_id', data[0].created_by_user_id)
            .single();

          if (!userError && sender) {
            // Add user data to the eventDetails object
            eventDetails = {
              ...eventDetails,
              sender,
            };

            // Fetch profile image using createSignedUrl
            const {data: profileImage, error: profileImageError} =
              await supabase.storage
                .from('profiles')
                .createSignedUrl(
                  `${sender.user_id}/${sender.user_id}.png`,
                  6000,
                );

            if (!profileImageError && profileImage) {
              // Add profile image URL to the eventDetails object
              eventDetails = {
                ...eventDetails,
                senderProfileImage: profileImage.signedUrl,
              };
            }
          }

          // Fetch gift details from the 'event_gifts' table
          const {data: gift, error: giftError} = await supabase
            .schema('event')
            .from('event_gifts')
            .select('gift_id')
            .eq('event_id', eventID);

          if (!giftError && gift.length > 0) {
            // Fetch gift transaction details
            const {data: giftDetails, error: giftDetailsError} = await supabase
              .schema('gift')
              .from('gift_transactions')
              .select('*')
              .eq('id', gift[0].gift_id);

            if (!giftDetailsError && giftDetails.length > 0) {
              // Add gift details to the eventDetails object
              eventDetails = {
                ...eventDetails,
                gift: giftDetails[0],
              };
            }

            // Fetch recipient data from the 'profiles' table
            const {data: recipient, error: recipientError} = await supabase
              .from('profiles')
              .select('full_name, user_id')
              .eq('user_id', giftDetails[0].sendee_user_id)
              .single();

            if (!recipientError && recipient) {
              // Add user data to the eventDetails object
              eventDetails = {
                ...eventDetails,
                recipient,
              };

              // Fetch profile image using createSignedUrl
              const {
                data: recipientprofileImage,
                error: recipientprofileImageError,
              } = await supabase.storage
                .from('profiles')
                .createSignedUrl(
                  `${recipient.user_id}/${recipient.user_id}.png`,
                  6000,
                );

              if (!recipientprofileImageError && recipientprofileImage) {
                // Add profile image URL to the eventDetails object
                eventDetails = {
                  ...eventDetails,
                  recipientProfileImage: recipientprofileImage.signedUrl,
                };
              }
            }
          }
          setEvent(eventDetails);
          setIsLoading(false);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Event not found',
            position: 'bottom',
          });
          navigation.replace('tabnavigator');
        }
      } catch (error) {
        setIsLoading(false);
        console.log('Error fetching event details:', error);
      }
    }
  };

  return (
    <View
      style={{
        width: '100%',
        position: 'absolute',
        bottom: 0,
        height: '100%',
        backgroundColor: colors.primary,
        padding: 10,
      }}>
      {isLoading && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.95)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{color: '#fff', marginTop: 10, fontSize: 18}}>
            Finding your gift...
          </Text>
        </View>
      )}
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <FastImage
          source={{
            // uri: receipient_profile_image,
            uri: event?.recipientProfileImage,
          }}
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
          source={{
            // uri: sender_profile_image,
            uri: event?.senderProfileImage,
          }}
          resizeMode="cover"
          style={{
            height: 40,
            width: 40,
            marginVertical: 25,
            borderRadius: 40,
          }}
        />

        <MaterialCommunityIcons
          onPress={() => navigation.replace('tabnavigator')}
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
        {/* Gift to {receipient_name} */}
        Gift to {event?.recipient?.full_name}
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
        {/* By {sender_name} */}
        By {event?.sender?.full_name}
      </Text>

      <ConfettiCannon
        count={250}
        origin={{x: -10, y: 0}}
        autoStart={false}
        explosionSpeed={450}
        ref={confettiRef}
      />

      {event?.gift?.gift_type === 'TEXT' &&
        (showGift ? (
          <TouchableOpacity
            style={{zIndex: -1}}
            onPress={() => {
              setShowGift(!showGift);
            }}>
            <Text
              numberOfLines={6}
              style={{
                backgroundColor: '#fff',
                color: '#000',
                padding: 50,
                borderRadius: 15,
                overflow: 'hidden',
                marginVertical: '40%',
              }}>
              {event?.gift?.gift_metadata?.message}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{zIndex: -1}}
            onPress={() => {
              setShowGift(!showGift);
              confettiRef?.current?.start();
            }}>
            <ImageBackground
              source={{uri: ''}}
              style={{
                height: 350,
                width: '100%',
                alignSelf: 'center',
                marginVertical: 25,
                borderRadius: 40,
                overflow: 'hidden',
              }}>
              <Text
                style={{
                  backgroundColor: '#fff',
                  color: '#fff',
                  padding: 50,
                  borderRadius: 15,
                  overflow: 'hidden',
                  marginVertical: 100,
                }}>
                {''}
              </Text>
            </ImageBackground>
          </TouchableOpacity>
        ))}

      {event?.gift?.gift_type === 'GREETING_CARD' &&
        (showGift ? (
          <TouchableOpacity
            style={{zIndex: -1}}
            onPress={() => {
              setShowGift(!showGift);
            }}>
            <FastImage
              source={{
                uri: `${config.SUPABASE_URL}/storage/v1/object/public/${event?.gift?.gift_metadata?.greeting_card_url}`,
              }}
              resizeMode="contain"
              style={{
                height: '65%',
                width: '95%',
                backgroundColor: '#d6d6d6',
                alignSelf: 'center',
                marginVertical: 15,
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
              source={require('../../assets/images/closedcard.png')}
              style={{
                height: 280,
                width: '100%',
                alignSelf: 'center',
                marginVertical: 50,
                borderRadius: 40,
                overflow: 'hidden',
                borderWidth: 0.5,
              }}
            />
          </TouchableOpacity>
        ))}

      {event?.gift?.gift_type === 'PHYSICAL' &&
        (showGift ? (
          <TouchableOpacity
            style={{zIndex: -1}}
            onPress={() => {
              setShowGift(!showGift);
            }}>
            <FastImage
              source={{
                uri: event?.gift?.gift_metadata[0]?.image,
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
                uri: event?.gift?.gift_metadata[0]?.wrapper,
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
        ))}

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
        Tap to {showGift ? 'wrap' : 'unwrap'}
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
          {/* {event_type} • Scheduled {event_date} */}
          {event?.event?.event_type} • Scheduled{' '}
          {moment(event?.event?.start_datetime).format('MMM DD')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    height: 50,
    width: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '500',
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
  },
  previewText: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '500',
  },
});
