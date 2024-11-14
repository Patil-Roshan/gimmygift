/* eslint-disable react-native/no-inline-styles */
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import colors from '../../theme/colors';
import Icon from '../../components/Icon';
import {
  ic_back,
  ic_date,
  ic_occasion_blue,
  ic_textmessage,
  ic_rounded_gift,
  ic_birthday_profile,
  ic_greeting_card,
} from '../../assets/icons/icons';
import Modal from 'react-native-modal';
import {useNavigation, useRoute} from '@react-navigation/native';
import moment from 'moment';
import {supabase} from '../../lib/supabase';
import DatePicker from 'react-native-date-picker';
import Button from '../../components/Button';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';
import localInstance from '../../../store/localEventsInstance';
import {config} from '../../config';
const ContactOccasion = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {item} = route?.params || {};

  const localEvents = localInstance((state: any) => state.localEvents);
  const setLocalEvents = localInstance((state: any) => state.setLocalEvents);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [birthdate, setBirthdate] = useState(new Date());
  const [dateType, setDateType] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [reminderDate, setReminderDate] = useState(new Date());

  const handleDateChange = async () => {
    if (dateType === 'ODATE') {
      //find object from localEvents and update where item.id matches

      const updatedEvents = localEvents?.map((event: any) => {
        if (event.id === item.id) {
          return {
            ...event,
            start_datetime: birthdate,
          };
        }
        return event;
      });
      setLocalEvents(updatedEvents);
      setShowDatePicker(false);
      Toast.show({
        type: 'success',
        text1: 'Date Updated Successfully',
        position: 'bottom',
      });
    }
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
                : new Date(reminderDate)
            }
            mode={dateType === 'ODATE' ? 'date' : 'datetime'}
            theme="light"
            onDateChange={(date: any) => {
              if (dateType === 'ODATE') {
                setBirthdate(date);
              } else if (dateType === 'DDATE') {
                setDeliveryDate(date);
              } else {
                setReminderDate(date);
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
      {renderDateModal()}
      <StatusBar backgroundColor={colors.white} barStyle={'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon icon={ic_back} size={30} tintColor={colors.primary} />
        </TouchableOpacity>
        <View style={styles.user}>
          <Image
            source={require('../../assets/images/user_placeholder.png')}
            style={{width: 50, height: 50, borderRadius: 25, borderWidth: 0.5}}
          />
          <Text style={styles.headerText}>{item?.full_name}</Text>
          <Text style={[styles.headerText, {color: colors.fontSubColor}]}>
            {item?.event_type || 'Occasion'} •{' '}
            {moment(item?.start_datetime).format('MMM D')}
          </Text>
        </View>
        <View style={{width: '12%'}} />
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
              {/* <Icon
                icon={ic_chevronRight}
                size={28}
                tintColor={colors.fontSubColor}
              /> */}
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
                  },
                ]}>
                {moment(item?.start_datetime).format('MMM DD YYYY')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting card */}
        {item?.gift_type === 'GREETING_CARD' && (
          <>
            <View style={[styles.occasion_container, {marginBottom: 12}]}>
              <View style={[styles.occasion, {height: 72}]}>
                <View
                  style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
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
                  style={{flexDirection: 'row', gap: 7, alignItems: 'center'}}>
                  {/* <Icon icon={ic_gimmepick_close} size={28} /> */}
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.greetingContainer}
              onPress={() => {
                const link = `${config.SUPABASE_URL}/storage/v1/object/public/${item?.gift_metadata?.greeting_card_url}`;
                Linking.openURL(link);
              }}>
              <Image
                source={require('../../assets/images/greeting_card_gift.png')}
                style={styles.greeting}
              />
              <View style={styles.greetingTxt}>
                <View>
                  <Text style={[styles.txt, {fontSize: 16, lineHeight: 21.6}]}>
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
        {item?.gift_type === 'TEXT' && (
          <View style={[styles.occasion_container, {marginBottom: 12}]}>
            <View style={[styles.occasion, {height: 72}]}>
              <View
                style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
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
                style={{flexDirection: 'row', gap: 7, alignItems: 'center'}}>
                {/* <Icon icon={ic_gimmepick_close} size={28} /> */}
              </View>
            </View>
            <Text style={[styles.txt, styles.occasionTxt, {padding: 15}]}>
              Message : {item?.gift_metadata?.message}
            </Text>
          </View>
        )}

        {/* Gift */}
        {item?.gift_type === 'PHYSICAL' && (
          <>
            <View style={styles.occasion_container}>
              <View style={[styles.occasion, {height: 72}]}>
                <View
                  style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
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
                  style={{flexDirection: 'row', gap: 7, alignItems: 'center'}}>
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
                  style={{flexDirection: 'row', gap: 14, alignItems: 'center'}}>
                  <Icon icon={ic_birthday_profile} size={28} />
                  <Text style={[styles.txt, styles.occasionTxt]}>
                    Virtual Gift
                  </Text>
                </View>
                <View
                  style={{flexDirection: 'row', gap: 7, alignItems: 'center'}}>
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
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.textMsg}
          onPress={() => {
            if (item?.gift_type === 'TEXT') {
              Clipboard.setString(item?.gift_metadata?.message);
              Alert.alert('Gift Message Copied');
            }
            if (item?.gift_type === 'PHYSICAL') {
              Clipboard.setString(item?.gift_metadata[0]?.direct_url);
              Alert.alert('Gift URL Copied');
            }
            if (item?.gift_type === 'GREETING_CARD') {
              const link = `${config.SUPABASE_URL}/storage/v1/object/public/${item?.gift_metadata?.greeting_card_url}`;
              Clipboard.setString(link);
              Alert.alert('Card Link Copied');
            }
          }}>
          <Text style={{color: colors.primary, fontSize: 18, lineHeight: 22}}>
            Copy Gift Details
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ContactOccasion;

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    // height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
    borderBottomWidth: 0.16,
  },
  user: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.black,
    fontWeight: '600',
  },
  occasion_container: {
    flexDirection: 'column',
    marginBottom: 30,
    backgroundColor: colors.white,
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
