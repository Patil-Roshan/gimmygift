/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import PhotoEditor from '@baronha/react-native-photo-editor';
import colors from '../../theme/colors';
import activeUserInstance from '../../../store/activeUsersInstance';
import {supabase} from '../../lib/supabase';
import {uploadFile} from '../../api/storage';
import localInstance from '../../../store/localEventsInstance';
import {generateRandomString} from '../../lib/supabaseQueries';

export default function NewGreetingCard() {
  useEffect(() => {
    editImage();
  }, []);
  const navigation = useNavigation();
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);

  const localEvents = localInstance((state: any) => state.localEvents);
  const setLocalEvents = localInstance((state: any) => state.setLocalEvents);

  const [photo, setPhoto] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const {cardURL, recipient, occasion, occasionDate, reminderDate} =
    route.params;

  const stickers = [
    'https://cdn-icons-png.flaticon.com/512/5272/5272911.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272912.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272913.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272914.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272915.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272916.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272917.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272918.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272919.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272920.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272915.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272916.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272917.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272918.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272919.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272920.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272915.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272916.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272917.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272918.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272919.png',
    'https://cdn-icons-png.flaticon.com/512/5272/5272920.png',
  ];

  const editImage = async () => {
    try {
      const path = await PhotoEditor.open({
        path: photo?.path || cardURL,
        // path: photo.path,
        stickers,
      });
      setPhoto({
        ...photo,
        path,
      });
    } catch (e) {
      console.log('e', e);
    }
  };

  const uploadGreetingCard = async () => {
    setIsLoading(true);
    if (recipient?.type === 'contact') {
      const id = `${recipient?.full_name}_${Date.now()}`;
      const uniqueID = await generateRandomString();
      const {data: uploadedImg} = await uploadFile(
        'events/LocalEvents',
        `${id}.png`,
        photo?.path,
      );
      const items = {
        greeting_card_url: uploadedImg?.fullPath,
      };
      const giftObject = {
        id: uniqueID,
        start_datetime: reminderDate,
        created_by_user_id: activeUsers[0].user_id,
        event_type: occasion,
        user_id: activeUsers[0].user_id,
        gift_metadata: items,
        gift_type: 'GREETING_CARD',
        event_category: 'LOCAL',
        full_name: recipient?.full_name,
      };
      //store giftObject on setLocalEvents with existing localEvents
      let localGifts = [...localEvents, giftObject];
      setLocalEvents(localGifts);
      navigation.replace('messageconfirmation', {
        name: recipient?.full_name,
        type: 'GREETING_CARD',
        gift_metadata: items,
      });
      return;
    }
    const {data: eventData, error: eventError} = await supabase
      .schema('event')
      .from('events')
      .insert([
        {
          start_datetime: occasionDate,
          created_by_user_id: activeUsers[0].user_id,
          event_type: occasion,
        },
      ])
      .select();

    const id = eventData[0].event_id;
    const {data: uploadedImg} = await uploadFile(
      'events',
      `${id}.png`,
      photo?.path,
    );

    if (!eventError && eventData) {
      const items = {
        greeting_card_url: uploadedImg?.fullPath,
      };

      const {data: giftData, error: giftError} = await supabase
        .schema('gift')
        .from('gift_transactions')
        .insert([
          {
            sendee_user_id: recipient?.user_id,
            user_id: activeUsers[0].user_id,
            gift_metadata: items,
            gift_type: 'GREETING_CARD',
            scheduled_at: reminderDate,
          },
        ])
        .select();

      console.log('giftError', giftError);
      if (!giftError && giftData) {
        const {error: eventGiftError} = await supabase
          .schema('event')
          .from('event_gifts')
          .insert([
            {
              event_id: eventData[0].event_id,
              gift_id: giftData[0].id,
            },
          ]);

        console.log('eventGiftError', eventGiftError);

        if (reminderDate) {
          const notification1 = {
            auth_id: recipient?.auth_id,
            body:
              'You have received a new gift from ' + activeUsers[0].full_name,
            user_id: recipient?.user_id,
            scheduled_at: reminderDate,
            notification_metadata: {event_id: eventData[0].event_id},
          };
          const notification2 = {
            auth_id: activeUsers[0].auth_id,
            body: 'You have scheduled a gift for ' + recipient?.full_name,
            user_id: activeUsers[0].user_id,
            scheduled_at: reminderDate,
            notification_metadata: {event_id: eventData[0].event_id},
          };
          await Promise.all([
            supabase
              .schema('notification')
              .from('scheduled_notifications')
              .insert([notification1]),
            supabase
              .schema('notification')
              .from('scheduled_notifications')
              .insert([notification2]),
          ]);
        }

        if (!eventGiftError) {
          navigation.replace('messageconfirmation', {
            name: recipient?.full_name,
            type: 'GREETING_CARD',
            gift_metadata: items,
          });
        }
      }
    }
    setIsLoading(false);
  };

  const loaderOverlay = () => {
    if (isLoading) {
      return (
        <View
          style={{
            position: 'absolute',
            zIndex: 1,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text
            style={{
              color: colors.white,
              marginTop: 10,
              fontWeight: '700',
              fontSize: 20,
            }}>
            Generating your greeting card...
          </Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: colors.primary}} />
      {loaderOverlay()}
      <View style={styles.headerContainer}>
        <Text style={styles.headerLabel} onPress={() => navigation.goBack()}>
          Cancel
        </Text>
        <Text style={[styles.headerLabel, {color: colors.white}]}>
          New Greeting Card
        </Text>
        <Text style={styles.headerLabel} onPress={() => uploadGreetingCard()}>
          {isLoading ? 'Generating...' : 'Done'}
        </Text>
      </View>

      <View style={styles.imageContainer}>
        {photo?.path ? (
          <TouchableOpacity onPress={() => editImage()}>
            <Image
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
              source={{
                uri: photo.path,
              }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => editImage()}>
            <Image
              resizeMode="contain"
              style={{height: '100%', width: '100%'}}
              source={{
                uri: cardURL,
              }}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={{color: '#fff', textAlign: 'center', fontWeight: 'bold'}}>
        Tap to Edit
      </Text>

      {/* <View style={styles.indicatorContainer}>
        {Array(2)
          .fill(null)
          .map((_, index) => renderIndicator(index))}
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    padding: 10,
  },
  headerLabel: {
    fontFamily: 'SFPro',
    fontSize: 17,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    color: '#f6575f',
  },
  imageContainer: {
    backgroundColor: '#fff',
    width: '90%',
    height: '80%',
    alignSelf: 'center',
    borderRadius: 10,
    marginVertical: 30,
    overflow: 'hidden',
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 8 / 2,
    marginHorizontal: 5,
  },
  bottomSheet: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 5,
  },
});
