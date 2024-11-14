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
      const {data: events, error: eventsError} = await supabase
        .schema('event')
        .from('events')
        .select('event_id, event_type, created_by_user_id, start_datetime')
        .eq('created_by_user_id', activeUsers[0].user_id);

      if (eventsError) {
        throw eventsError;
      }

      const allGiftsWithEventDetails = [];

      for (const event of events) {
        const {data: eventGifts, error: eventGiftsError} = await supabase
          .schema('event')
          .from('event_gifts')
          .select('gift_id')
          .eq('event_id', event.event_id);

        if (eventGiftsError) {
          throw eventGiftsError;
        }

        for (const gift of eventGifts) {
          const {data: giftTransactions, error: giftTransactionsError} =
            await supabase
              .schema('gift')
              .from('gift_transactions')
              .select('*')
              .eq('id', gift.gift_id);

          if (giftTransactionsError) {
            throw giftTransactionsError;
          }

          const sendeeUserIds = giftTransactions.map(
            transaction => transaction.sendee_user_id,
          );
          const {data: sendeeUsers, error: sendeeUsersError} = await supabase
            .from('profiles')
            .select('full_name, user_id')
            .in('user_id', sendeeUserIds);

          if (sendeeUsersError) {
            throw sendeeUsersError;
          }

          const usersWithImages = await Promise.all(
            sendeeUsers.map(async user => {
              const imagePath = `${user.user_id}/${user.user_id}.png`;
              const {data: imageUrlData} = await supabase.storage
                .from('profiles')
                .createSignedUrl(imagePath, 86400);
              return {...user, profile_image: imageUrlData?.signedUrl};
            }),
          );

          allGiftsWithEventDetails.push({
            ...event,
            gifts: [
              {
                gift_id: gift.gift_id,
                transactions: giftTransactions,
                recipient: usersWithImages,
              },
            ],
          });
        }
      }

      setReceivedGifts(allGiftsWithEventDetails);
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
        data={receivedGifts}
        onRefresh={() => fetchData()}
        refreshing={isLoading}
        style={{marginBottom: '30%'}}
        ListEmptyComponent={() =>
          !isLoading && (
            <Text style={{textAlign: 'center', margin: 50}}>
              No Sent Gift Found
            </Text>
          )
        }
        renderItem={({item}) => {
          const typeLabel =
            item?.gifts[0]?.transactions[0]?.gift_type === 'GREETING_CARD'
              ? 'Greeting Card'
              : item?.gifts[0]?.transactions[0]?.gift_type === 'PHYSICAL'
              ? 'Gift'
              : item?.gifts[0]?.transactions[0]?.gift_type === 'TEXT'
              ? 'Message'
              : '';

          return (
            <TouchableOpacity
              style={styles.list}
              onPress={() =>
                item?.gifts[0]?.transactions[0]?.gift_type === 'GREETING_CARD'
                  ? navigation.navigate('CardPreview', {
                      receipient_profile_image:
                        item?.gifts[0]?.recipient[0]?.profile_image,
                      receipient_name: item?.gifts[0]?.recipient[0]?.full_name,
                      sender_profile_image: activeUsers[0]?.profile_image,
                      sender_name: activeUsers[0]?.full_name,
                      gift_image: `${config.SUPABASE_URL}/storage/v1/object/public/${item?.gifts[0]?.transactions[0]?.gift_metadata?.greeting_card_url}`,
                      event_type: item?.event_type,
                      event_date: moment(item?.start_datetime).format(
                        'MMM D YYYY',
                      ),
                    })
                  : item?.gifts[0]?.transactions[0]?.gift_type === 'PHYSICAL'
                  ? navigation.navigate('GiftPreview', {
                      receipient_profile_image:
                        item?.gifts[0]?.recipient[0]?.profile_image,
                      receipient_name: item?.gifts[0]?.recipient[0]?.full_name,
                      sender_profile_image: activeUsers[0]?.profile_image,
                      sender_name: activeUsers[0]?.full_name,
                      gift_image:
                        item?.gifts[0]?.transactions[0]?.gift_metadata[0]
                          ?.image,
                      gift_wrapper:
                        item?.gifts[0]?.transactions[0]?.gift_metadata[0]
                          ?.wrapper,
                      gift_color:
                        item?.gifts[0]?.transactions[0]?.gift_metadata[0]
                          ?.giftBackgroundColor,
                      event_type: item?.event_type,
                      event_date: moment(item?.start_datetime).format(
                        'MMM D YYYY',
                      ),
                    })
                  : item?.gifts[0]?.transactions[0]?.gift_type === 'TEXT'
                  ? navigation.navigate('MessagePreview', {
                      receipient_profile_image:
                        item?.gifts[0]?.recipient[0]?.profile_image,
                      receipient_name: item?.gifts[0]?.recipient[0]?.full_name,
                      sender_profile_image: activeUsers[0]?.profile_image,
                      sender_name: activeUsers[0]?.full_name,
                      event_type: item?.event_type,
                      event_date: moment(item?.start_datetime).format(
                        'MMM D YYYY',
                      ),
                      message:
                        item?.gifts[0]?.transactions[0]?.gift_metadata?.message,
                    })
                  : ''
              }>
              <View>
                <Text style={styles.title}>
                  {item.event_type} - {typeLabel}
                </Text>
                <Text style={styles.left_content}>
                  {moment(item?.start_datetime).format('MMM D YYYY')}
                </Text>
                <View style={styles.img_container}>
                  <FastImage
                    source={
                      item?.gifts[0]?.recipient[0]?.profile_image
                        ? {uri: item?.gifts[0]?.recipient[0]?.profile_image}
                        : require('../../assets/images/user_placeholder.png')
                    }
                    style={styles.imgs}
                  />
                  <Text style={styles.left_content}>|</Text>
                  <FastImage
                    source={
                      activeUsers[0]?.profile_image
                        ? {uri: activeUsers[0]?.profile_image}
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
