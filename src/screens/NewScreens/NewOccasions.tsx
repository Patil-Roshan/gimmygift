/* eslint-disable react-native/no-inline-styles */
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  Switch,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../../theme/colors';
import Icon from '../../components/Icon';
import {
  ic_bell,
  ic_chevronRight,
  ic_reminder,
  ic_date,
  ic_occasion_blue,
  ic_settings,
  ic_textmessage,
  ic_date_green,
  ic_rounded_gift,
  ic_birthday_profile,
  ic_greeting_card,
  chevronBack,
} from '../../assets/icons/icons';
import Modal from 'react-native-modal';
import {useNavigation, useRoute} from '@react-navigation/native';
import moment from 'moment';
import {supabase} from '../../lib/supabase';
import SelectionModal from '../../components/SelectionModal';
import {repetitionData} from '../../referenceData';
import DatePicker from 'react-native-date-picker';
import Button from '../../components/Button';
import Toast from 'react-native-toast-message';

import scale from '../../scale';
const NewOccasions = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {item} = route?.params || {};

  useEffect(() => {
    fetchEventRecurrence();
  }, []);

  const handleGreetingCardLink = async (path: string) => {
    const filepath = path.split('/');
    const {data: imageUrlData} = await supabase.storage
      .from('events')
      .createSignedUrl(filepath[filepath.length - 1], 86400);
    if (imageUrlData?.signedUrl) {
      Linking.openURL(imageUrlData?.signedUrl).catch(err =>
        console.error('An error occurred', err),
      );
    }
  };

  const [notification, setNotification] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthdate, setBirthdate] = useState(new Date());
  const [dateType, setDateType] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [giftID, setGiftID] = useState('');

  const [showRepetitionModal, setShowRepetitionModal] = useState(false);
  const [repetition, setRepetition] = useState('');
  const [notificationTiming, setNotificationTiming] = useState('');

  async function fetchEventRecurrence() {
    const {data: repetitionDetails, error: repetitionError} = await supabase
      .schema('event')
      .from('event_recurrences')
      .select('*')
      .eq('event_id', item?.event_id)
      .single();
    if (!repetitionError) {
      setNotification(repetitionDetails?.send_notifications);
      setRepetition(repetitionDetails?.recurrence_pattern);
      setNotificationTiming(repetitionDetails?.next_scheduled_at || '');
    }
  }

  async function updateEventNotification(status: boolean) {
    const {error: updateError} = await supabase
      .schema('event')
      .from('event_recurrences')
      .update({send_notifications: status ? 'TRUE' : 'FALSE'})
      .eq('event_id', item?.event_id);

    console.log('updateError', updateError, notification, item?.event_id);

    if (updateError) {
      console.error(updateError);
    } else {
      Toast.show({
        type: 'success',
        text1: 'Notification Preference Updated Successfully',
        position: 'bottom',
      });
    }
  }

  async function upsertEventRecurrence() {
    try {
      const {data: existingEvent, error: fetchError} = await supabase
        .schema('event')
        .from('event_recurrences')
        .select('*')
        .eq('event_id', item?.event_id)
        .single();

      if (fetchError && !existingEvent) {
        const {error: insertError} = await supabase
          .schema('event')
          .from('event_recurrences')
          .insert({event_id: item?.event_id, recurrence_pattern: repetition});

        if (insertError) {
          console.error(insertError);
        } else {
          Toast.show({
            type: 'success',
            text1: 'Event Recurrence Updated Successfully',
            position: 'bottom',
          });
        }
      } else {
        if (existingEvent) {
          const {error: updateError} = await supabase
            .schema('event')
            .from('event_recurrences')
            .update({recurrence_pattern: repetition})
            .eq('event_id', item?.event_id);

          if (updateError) {
            console.error(updateError);
          } else {
            Toast.show({
              type: 'success',
              text1: 'Event Recurrence Updated Successfully',
              position: 'bottom',
            });
          }
        } else {
          // If the event_id does not exist, insert a new row
          const {error: insertError} = await supabase
            .schema('event')
            .from('event_recurrences')
            .insert({event_id: item?.event_id, recurrence_pattern: repetition});

          if (insertError) {
            console.error(insertError);
          } else {
            Toast.show({
              type: 'success',
              text1: 'Event Recurrence Updated Successfully',
              position: 'bottom',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error upserting event recurrence:', error);
    }
  }

  const handleDateChange = async () => {
    if (dateType === 'ODATE') {
      const {error} = await supabase
        .schema('event')
        .from('events')
        .update({start_datetime: birthdate})
        .eq('event_id', item?.event_id)
        .select('event_id');

      if (!error) {
        Toast.show({
          type: 'success',
          text1: 'Event Date Updated Successfully',
          position: 'bottom',
        });
        navigation.goBack();
      }
    }
    if (dateType === 'DDATE') {
      const {error} = await supabase
        .schema('gift')
        .from('gift_transactions')
        .update({scheduled_at: deliveryDate})
        .eq('id', giftID)
        .select('id');

      if (!error) {
        Toast.show({
          type: 'success',
          text1: 'Delivery Date Updated Successfully',
          position: 'bottom',
        });
        navigation.goBack();
      }
    }
    if (dateType === 'RDATE') {
      const {data: existingEvent, error: updateError} = await supabase
        .schema('event')
        .from('event_recurrences')
        .update({next_scheduled_at: notificationTiming})
        .eq('event_id', item?.event_id)
        .select('*');

      if (!updateError) {
        Toast.show({
          type: 'success',
          text1: 'Notification Timing Updated Successfully',
          position: 'bottom',
        });
        navigation.goBack();
      }
    }
    setShowDatePicker(false);
  };

  const renderDateModal = () => {
    return (
      <Modal
        isVisible={showDatePicker}
        style={{margin: 0}}
        onBackdropPress={() => setShowDatePicker(false)}>
        <View style={styles.datePickerContainer}>
          <DatePicker
            date={
              dateType === 'ODATE'
                ? new Date(birthdate)
                : dateType === 'DDATE'
                ? new Date(deliveryDate)
                : new Date(notificationTiming || new Date())
            }
            mode={dateType === 'ODATE' ? 'date' : 'datetime'}
            theme="light"
            onDateChange={(date: any) => {
              if (dateType === 'ODATE') {
                setBirthdate(date);
              } else if (dateType === 'DDATE') {
                setDeliveryDate(date);
              } else {
                setNotificationTiming(date);
              }
            }}
          />
          <Button
            label="Confirm"
            width={'100%'}
            height={40}
            bg="#d6d6d6"
            fontColor="#000"
            onPress={() => handleDateChange()}
          />
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={{backgroundColor: colors.pageBg}}>
      <SafeAreaView style={{backgroundColor: '#fff'}} />
      {renderDateModal()}
      <StatusBar backgroundColor={colors.white} barStyle={'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{position: 'absolute', left: 13}}>
          <Icon icon={chevronBack} size={30} tintColor={colors.primary} />
        </TouchableOpacity>
        <View style={styles.user}>
          <Image
            source={
              item?.gifts[0]?.recipient[0]?.profile_image
                ? {uri: item?.gifts[0]?.recipient[0]?.profile_image}
                : require('../../assets/images/user_placeholder.png')
            }
            style={{
              width: 46,
              height: 46,
              borderRadius: 25,
              marginBottom: 10,
            }}
          />
          <Text style={styles.headerText}>
            {item?.gifts[0]?.recipient[0]?.full_name}
          </Text>
          <Text style={[styles.headerSubText, {color: colors.fontSubColor}]}>
            {item?.event_type || 'Occasion'} •{' '}
            {moment(item?.start_datetime).format('MMM D')}
          </Text>
        </View>

        {/* <Entypo name="dots-three-horizontal" color={colors.primary} size={20} /> */}
      </View>

      <View
        style={{
          marginHorizontal: 16,
          borderRadius: 20,
          marginTop: 24,
          marginBottom: 50,
        }}>
        {/* occation */}
        <View style={styles.occasion_container}>
          <View style={styles.occasion}>
            <View style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
              <Icon icon={ic_occasion_blue} size={28} />
              <Text style={[styles.txt, styles.occasionTxt]}>Occasion</Text>
            </View>
            <View style={{flexDirection: 'row', gap: 7, alignItems: 'center'}}>
              <Text
                style={[
                  styles.txt,
                  styles.occasionTxt,
                  {color: colors.fontSubColor},
                ]}>
                {item?.event_type || 'Occasion'}
              </Text>
              <Icon
                icon={ic_chevronRight}
                size={28}
                tintColor={colors.fontSubColor}
              />
            </View>
          </View>
          <View
            style={[
              styles.occasion,
              {
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 12,
                borderTopRightRadius: 0,
                borderTopLeftRadius: 0,
                borderTopWidth: 0.5,
                borderColor: colors.lineColor,
              },
            ]}>
            <View style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
              <Icon icon={ic_date} size={28} />
              <Text style={[styles.txt, styles.occasionTxt]}>Date</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(true);
                setDateType('ODATE');
              }}
              style={{flexDirection: 'row', gap: 7, alignItems: 'center'}}>
              <Text
                style={[
                  styles.txt,
                  {
                    backgroundColor: colors.lineColor,
                    paddingVertical: 7,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    fontSize: 17,
                    overflow: 'hidden',
                  },
                ]}>
                {moment(item?.start_datetime).format('MMM DD YYYY')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification */}
        <View style={[styles.occasion_container, {marginBottom: 12}]}>
          <View style={styles.occasion}>
            <View style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
              <Icon icon={ic_bell} size={28} />
              <Text style={[styles.txt, styles.occasionTxt]}>Notification</Text>
            </View>
            <View style={{flexDirection: 'row', gap: 7, alignItems: 'center'}}>
              <Switch
                style={{
                  // transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
                  alignSelf: 'center',
                  width: 50,
                  height: 30,
                }}
                trackColor={{false: '#767577', true: colors.primary}}
                thumbColor={colors.white}
                ios_backgroundColor="#3e3e3e"
                onValueChange={async () => {
                  await setNotification(!notification);
                  updateEventNotification(!notification);
                }}
                value={notification}
              />
            </View>
          </View>

          {notification && (
            <View
              style={[
                styles.occasion,
                {
                  borderBottomRightRadius: 12,
                  borderBottomLeftRadius: 12,
                  borderTopRightRadius: 0,
                  borderTopLeftRadius: 0,
                  borderTopWidth: 0.5,
                  borderColor: colors.lineColor,
                  overflow: 'hidden',
                },
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: 14,
                  alignItems: 'center',
                  marginRight: 20,
                }}>
                <Icon icon={ic_reminder} size={28} />
                <Text style={[styles.txt, styles.occasionTxt]}>Timing</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setDateType('RDATE');
                  setShowDatePicker(true);
                }}
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  alignItems: 'center',
                }}>
                <Text
                  style={[
                    styles.txt,
                    {
                      backgroundColor: colors.lineColor,
                      paddingVertical: 7,
                      paddingHorizontal: 10,
                      borderRadius: 6,
                      fontSize: scale(16),
                      overflow: 'hidden',
                    },
                  ]}>
                  {notificationTiming
                    ? moment(notificationTiming).format('MMM D YYYY -  hh:mm A')
                    : '-'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Repetition */}
        <View style={[styles.occasion_container, {marginBottom: 30}]}>
          <SelectionModal
            data={repetitionData}
            isOpen={showRepetitionModal}
            onSelect={(item: string) => {
              setRepetition(item);
            }}
            title="Repetition"
            onClose={() => {
              upsertEventRecurrence();
              setShowRepetitionModal(false);
            }}
          />
          <TouchableOpacity
            onPress={() => setShowRepetitionModal(true)}
            style={[
              styles.occasion,
              {borderBottomLeftRadius: 12, borderBottomRightRadius: 12},
            ]}>
            {/* Timing Selection Modal */}

            <View style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
              <Icon icon={ic_settings} size={28} />
              <Text style={[styles.txt, styles.occasionTxt]}>Repetition</Text>
            </View>
            <View style={{flexDirection: 'row', gap: 7, alignItems: 'center'}}>
              <Text
                style={[
                  styles.txt,
                  styles.occasionTxt,
                  {color: colors.fontSubColor},
                ]}>
                {repetition || '-'}
              </Text>
              <Icon
                icon={ic_chevronRight}
                size={28}
                tintColor={colors.fontSubColor}
              />
            </View>
          </TouchableOpacity>
          {/* <View style={[styles.occasion, {
                        borderBottomRightRadius: 12,
                        borderBottomLeftRadius: 12,
                        borderTopRightRadius: 0,
                        borderTopLeftRadius: 0,
                        borderTopWidth: 0.5,
                        borderColor: colors.lineColor
                    }]}>
                        <View style={{ flexDirection: "row", gap: 14, alignItems: 'center' }}>
                            <Icon icon={ic_bell} size={28} />
                            <Text style={[styles.txt, styles.occasionTxt]}>Timing</Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 7, alignItems: 'center' }}>
                            <Text style={[styles.txt, styles.occasionTxt, { color: colors.fontSubColor }]}>3 day before</Text>

                        </View>
                    </View> */}
        </View>

        {item?.gifts?.map((gift: any) => {
          return (
            <>
              {/* Greeting card */}
              {gift?.transactions[0]?.gift_type === 'GREETING_CARD' && (
                <>
                  <View style={[styles.occasion_container, {marginBottom: 12}]}>
                    <View style={[styles.occasion, {height: 72}]}>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 14,
                          alignItems: 'center',
                        }}>
                        <Icon icon={ic_greeting_card} size={40} />
                        <View>
                          <Text style={[styles.txt, styles.occasionTxt, {}]}>
                            Greeting card
                          </Text>
                          <Text
                            style={[
                              styles.txt,
                              styles.occasionTxt,
                              {
                                color: colors.fontSubColor,
                                lineHeight: 18,
                                fontSize: 14,
                              },
                            ]}>
                            Send a greeting card for an occasion
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 7,
                          alignItems: 'center',
                        }}>
                        {/* <Icon icon={ic_gimmepick_close} size={28} /> */}
                      </View>
                    </View>
                    <View
                      style={[
                        styles.occasion,
                        {
                          borderBottomRightRadius: 12,
                          borderBottomLeftRadius: 12,
                          borderTopRightRadius: 0,
                          borderTopLeftRadius: 0,
                          borderTopWidth: 0.5,
                          borderColor: colors.lineColor,
                          height: 100,
                        },
                      ]}>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 14,
                          alignItems: 'stretch',
                        }}>
                        <Icon icon={ic_date_green} size={28} />
                        <View>
                          <Text style={[styles.txt, styles.occasionTxt, {}]}>
                            Delivery Greeting Card
                          </Text>

                          <TouchableOpacity
                            onPress={() => {
                              setDateType('DDATE');
                              setGiftID(gift?.transactions[0]?.id);
                              setShowDatePicker(true);
                            }}
                            style={{
                              flexDirection: 'row',
                              gap: 8,
                              alignItems: 'center',
                              marginTop: 14,
                            }}>
                            <Text
                              style={[
                                styles.txt,
                                {
                                  backgroundColor: colors.lineColor,
                                  paddingVertical: 7,
                                  paddingHorizontal: 12,
                                  borderRadius: 6,
                                  fontSize: 17,
                                  overflow: 'hidden',
                                },
                              ]}>
                              {moment(
                                gift?.transactions[0]?.scheduled_at,
                              ).format('MMM D YYYY -  hh:mm A')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 7,
                          alignItems: 'center',
                        }}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.greetingContainer}
                    onPress={() => {
                      handleGreetingCardLink(
                        gift?.transactions[0]?.gift_metadata?.greeting_card_url,
                      );
                    }}>
                    <Image
                      source={require('../../assets/images/greeting_card_gift.png')}
                      style={styles.greeting}
                    />
                    <View style={styles.greetingTxt}>
                      <View>
                        <Text
                          style={[
                            styles.txt,
                            {fontSize: 16, lineHeight: 21.6},
                          ]}>
                          Greeting card
                        </Text>
                        <Text
                          style={[
                            styles.txt,
                            {
                              fontSize: 14.6,
                              lineHeight: 16.2,
                              color: colors.fontSubColor,
                            },
                          ]}>
                          gimmegift.com
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </>
              )}

              {/* Text card */}
              {gift?.transactions[0]?.gift_type === 'TEXT' && (
                <View style={[styles.occasion_container, {marginBottom: 12}]}>
                  <View style={[styles.occasion, {height: 72}]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 14,
                        alignItems: 'center',
                      }}>
                      <Icon icon={ic_textmessage} size={40} />
                      <View>
                        <Text style={[styles.txt, styles.occasionTxt, {}]}>
                          Text Message
                        </Text>
                        <Text
                          style={[
                            styles.txt,
                            styles.occasionTxt,
                            {
                              color: colors.fontSubColor,
                              lineHeight: 18,
                              fontSize: 14,
                            },
                          ]}>
                          Send a text message for an occasion
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 7,
                        alignItems: 'center',
                      }}>
                      {/* <Icon icon={ic_gimmepick_close} size={28} /> */}
                    </View>
                  </View>
                  <Text style={[styles.txt, styles.occasionTxt, {padding: 15}]}>
                    Message : {gift?.transactions[0]?.gift_metadata?.message}
                  </Text>
                  <View
                    style={[
                      styles.occasion,
                      {
                        borderBottomRightRadius: 12,
                        borderBottomLeftRadius: 12,
                        borderTopRightRadius: 0,
                        borderTopLeftRadius: 0,
                        borderTopWidth: 0.5,
                        borderColor: colors.lineColor,
                        height: 100,
                      },
                    ]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 14,
                        alignItems: 'stretch',
                      }}>
                      <Icon icon={ic_date_green} size={28} />
                      <View>
                        <Text style={[styles.txt, styles.occasionTxt, {}]}>
                          Delivery Message
                        </Text>

                        <TouchableOpacity
                          onPress={() => {
                            setDateType('DDATE');
                            setGiftID(gift?.transactions[0]?.id);
                            setShowDatePicker(true);
                          }}
                          style={{
                            flexDirection: 'row',
                            gap: 8,
                            alignItems: 'center',
                            marginTop: 14,
                          }}>
                          <Text
                            style={[
                              styles.txt,
                              {
                                backgroundColor: colors.lineColor,
                                paddingVertical: 7,
                                paddingHorizontal: 12,
                                borderRadius: 6,
                                fontSize: 17,
                                overflow: 'hidden',
                              },
                            ]}>
                            {moment(
                              gift?.transactions[0]?.scheduled_at || '-',
                            ).format('MMM D YYYY -  hh:mm A')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 7,
                        alignItems: 'center',
                      }}
                    />
                  </View>
                </View>
              )}

              {/* Gift */}
              {gift?.transactions[0]?.gift_type === 'PHYSICAL' && (
                <View style={styles.occasion_container}>
                  <View style={[styles.occasion, {height: 72}]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 14,
                        alignItems: 'center',
                      }}>
                      <Icon icon={ic_rounded_gift} size={40} />
                      <View>
                        <Text style={[styles.txt, styles.occasionTxt, {}]}>
                          Gift
                        </Text>
                        <Text
                          style={[
                            styles.txt,
                            styles.occasionTxt,
                            {
                              color: colors.fontSubColor,
                              lineHeight: 18,
                              fontSize: 14,
                            },
                          ]}>
                          Send a gift for an occasion
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 7,
                        alignItems: 'center',
                      }}>
                      {/* <Icon icon={ic_gimmepick_close} size={28} /> */}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.occasion,
                      {
                        borderTopRightRadius: 0,
                        borderTopLeftRadius: 0,
                        borderTopWidth: 0.5,
                        borderColor: colors.lineColor,
                      },
                    ]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 14,
                        alignItems: 'center',
                      }}>
                      <Icon icon={ic_birthday_profile} size={28} />
                      <Text style={[styles.txt, styles.occasionTxt]}>
                        Virtual Gift
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 7,
                        alignItems: 'center',
                      }}>
                      <Text
                        style={[
                          styles.txt,
                          styles.occasionTxt,
                          {color: colors.fontSubColor},
                        ]}>
                        Virtual Gift
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.occasion,
                      {
                        borderBottomRightRadius: 12,
                        borderBottomLeftRadius: 12,
                        borderTopRightRadius: 0,
                        borderTopLeftRadius: 0,
                        borderTopWidth: 0.5,
                        borderColor: colors.lineColor,
                        height: 100,
                      },
                    ]}>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 14,
                        alignItems: 'stretch',
                      }}>
                      <Icon
                        icon={ic_date_green}
                        size={28}
                        tintColor={colors.primary}
                      />
                      <View>
                        <Text style={[styles.txt, styles.occasionTxt, {}]}>
                          Delivery Virtual Gift
                        </Text>

                        <TouchableOpacity
                          onPress={() => {
                            setDateType('DDATE');
                            setGiftID(gift?.transactions[0]?.id);
                            setShowDatePicker(true);
                          }}
                          style={{
                            flexDirection: 'row',
                            gap: 8,
                            alignItems: 'center',
                            marginTop: 14,
                          }}>
                          <Text
                            style={[
                              styles.txt,
                              {
                                backgroundColor: colors.lineColor,
                                paddingVertical: 7,
                                paddingHorizontal: 12,
                                borderRadius: 6,
                                fontSize: 17,
                                overflow: 'hidden',
                              },
                            ]}>
                            {moment(gift?.transactions[0]?.scheduled_at).format(
                              'MMM DD YYYY - HH:mm',
                            )}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 7,
                        alignItems: 'center',
                      }}
                    />
                  </View>
                </View>
              )}
            </>
          );
        })}

        {/* <TouchableOpacity
          style={styles.textMsg}
          onPress={() => {
            shareEventLink('Events', 'events', item?.event_id);
          }}>
          <Text style={{color: colors.primary, fontSize: 18, lineHeight: 22}}>
            Copy Share Link
          </Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};

export default NewOccasions;

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    padding: 10,
    borderBottomWidth: 0.16,
  },
  user: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  headerText: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.black,
    fontWeight: '500',
  },
  headerSubText: {
    fontFamily: 'SFPro',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  occasion_container: {
    flexDirection: 'column',
    marginBottom: 30,
    borderRadius: 10,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  occasion: {
    backgroundColor: colors.white,
    color: colors.black,
    height: 50,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
  },

  txt: {
    color: colors.black,
  },
  occasionTxt: {
    fontSize: 18,
    lineHeight: 18,
  },
  greeting: {
    width: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  greetingContainer: {
    backgroundColor: colors.gray.medium,
    borderRadius: 10,
  },
  greetingTxt: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textMsg: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    gap: 14,
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  datePickerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 10,
    borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 25,
  },
});
