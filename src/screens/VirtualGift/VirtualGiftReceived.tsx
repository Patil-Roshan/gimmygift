/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from '../../components/Icon';
import {ic_chevronRight} from '../../assets/icons/icons';

import colors from '../../theme/colors';
import FastImage from 'react-native-fast-image';
import {supabase} from '../../lib/supabase';
import activeUserInstance from '../../../store/activeUsersInstance';
import moment from 'moment';
import {useNavigation} from '@react-navigation/native';
import {config} from '../../config';

const VirtualGiftReceived = () => {
  const [receivedGifts, setReceivedGifts] = useState<any>([]);
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Step 1: Fetch gift transactions where sendee_user_id is the active user
      const {data: giftTransactions, error: giftTransactionsError} =
        await supabase
          .schema('gift')
          .from('gift_transactions')
          .select('*')
          .eq('sendee_user_id', activeUsers[0].user_id);

      if (giftTransactionsError) {
        throw giftTransactionsError;
      }

      // Step 2: Fetch event gift details for each gift transaction
      const giftsDetails = await Promise.all(
        giftTransactions.map(async transaction => {
          const {data: eventGifts, error: eventGiftsError} = await supabase
            .schema('event')
            .from('event_gifts')
            .select('event_id, gift_id')
            .eq('gift_id', transaction.id);

          if (eventGiftsError) {
            throw eventGiftsError;
          }

          // Step 3: Fetch event details for each event gift
          const events = await Promise.all(
            eventGifts.map(async eventGift => {
              const {data: event, error: eventError} = await supabase
                .schema('event')
                .from('events')
                .select(
                  'event_id, event_type, created_by_user_id, start_datetime',
                )
                .eq('event_id', eventGift.event_id)
                .single();

              if (eventError) {
                throw eventError;
              }

              return event;
            }),
          );

          // Step 4: Fetch sendee user details
          const sendeeUserId = transaction.user_id;
          const {data: sendeeUser, error: sendeeUserError} = await supabase
            .from('profiles') // Assuming 'profiles' is the schema and 'profiles' is the table
            .select('full_name, user_id')
            .eq('user_id', sendeeUserId)
            .single();

          if (sendeeUserError) {
            throw sendeeUserError;
          }

          // Fetch sendee user profile image
          const imagePath = `${sendeeUser.user_id}/${sendeeUser.user_id}.png`;
          const {data: imageUrlData} = await supabase.storage
            .from('profiles')
            .createSignedUrl(imagePath, 86400);

          const userWithImage = {
            ...sendeeUser,
            profile_image: imageUrlData?.signedUrl,
          };

          return {
            ...transaction,
            events,
            recipient: userWithImage,
          };
        }),
      );

      setReceivedGifts(giftsDetails);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('fetchData error:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <View style={styles.container}>
      {isLoading && (
        <ActivityIndicator
          color={colors.primary}
          size="large"
          style={{marginTop: 20}}
        />
      )}
      <FlatList
        style={{marginBottom: '30%'}}
        onRefresh={() => fetchData()}
        refreshing={isLoading}
        data={receivedGifts}
        ListEmptyComponent={() =>
          !isLoading && (
            <Text style={{textAlign: 'center', margin: 50}}>
              No Received Gift Found
            </Text>
          )
        }
        renderItem={({item}) => {
          const typeLabel =
            item?.gift_type === 'GREETING_CARD'
              ? 'Greeting Card'
              : item?.gift_type === 'PHYSICAL'
              ? 'Gift'
              : item?.gift_type === 'TEXT'
              ? 'Message'
              : '';

          return (
            <TouchableOpacity
              style={styles.list}
              onPress={() =>
                item?.gift_type === 'GREETING_CARD'
                  ? navigation.navigate('CardPreview', {
                      receipient_profile_image: activeUsers[0]?.profile_image,
                      receipient_name: activeUsers[0]?.full_name,
                      sender_profile_image: item?.recipient?.profile_image,
                      sender_name: item?.recipient?.full_name,
                      gift_image: `${config.SUPABASE_URL}/storage/v1/object/public/${item?.gift_metadata?.greeting_card_url}`,
                      event_type: item?.events[0]?.event_type,
                      event_date: moment(
                        item?.events[0]?.start_datetime,
                      ).format('MMM D YYYY'),
                    })
                  : item?.gift_type === 'PHYSICAL'
                  ? navigation.navigate('GiftPreview', {
                      receipient_profile_image: activeUsers[0]?.profile_image,
                      receipient_name: activeUsers[0]?.full_name,
                      sender_profile_image: item?.recipient?.profile_image,
                      sender_name: item?.recipient?.full_name,
                      gift_image: item?.gift_metadata[0]?.image,
                      gift_wrapper: item?.gift_metadata[0]?.wrapper,
                      gift_color: item?.gift_metadata[0]?.giftBackgroundColor,
                      event_type: item?.events[0]?.event_type,
                      event_date: moment(
                        item?.events[0]?.start_datetime,
                      ).format('MMM D YYYY'),
                    })
                  : item?.gift_type === 'TEXT'
                  ? navigation.navigate('MessagePreview', {
                      receipient_profile_image: activeUsers[0]?.profile_image,
                      receipient_name: activeUsers[0]?.full_name,
                      sender_profile_image: item?.recipient?.profile_image,
                      sender_name: item?.recipient?.full_name,
                      event_type: item?.events[0]?.event_type,
                      event_date: moment(
                        item?.events[0]?.start_datetime,
                      ).format('MMM D YYYY'),
                      message: item?.gift_metadata?.message,
                    })
                  : ''
              }>
              <View>
                <Text style={styles.title}>
                  {item?.events[0]?.event_type} - {typeLabel}
                </Text>
                <Text style={styles.left_content}>
                  {moment(item?.start_datetime).format('MMM D YYYY')}
                </Text>
                <View style={styles.img_container}>
                  <FastImage
                    source={
                      activeUsers[0]?.profile_image
                        ? {uri: activeUsers[0]?.profile_image}
                        : require('../../assets/images/user_placeholder.png')
                    }
                    style={styles.imgs}
                  />
                  <Text style={styles.left_content}>|</Text>
                  <FastImage
                    source={
                      item?.recipient?.profile_image
                        ? {uri: item?.recipient?.profile_image}
                        : require('../../assets/images/user_placeholder.png')
                    }
                    style={styles.imgs}
                  />
                </View>
              </View>
              <View>
                <TouchableOpacity
                  onPress={() => {
                    console.log('Navigate to gifts');
                  }}>
                  <Icon
                    icon={ic_chevronRight}
                    size={30}
                    tintColor={colors.gray.medium}
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
  header: {
    color: 'red',
  },
  list: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomColor: '#d6d6d6',
    borderBottomWidth: 0.5,
  },

  title: {
    fontSize: 20,
    color: colors.black,
    fontWeight: '600',
  },
  left_content: {
    fontSize: 20,
    color: colors.fontSubColor,
  },
  img_container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 20,
  },
  imgs: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  img_divider: {
    fontSize: 20,
    color: colors.fontSubColor,
  },
});

export default VirtualGiftReceived;
