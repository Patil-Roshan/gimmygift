/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '../../theme/colors';
import Modal from 'react-native-modal';
import Icon from '../../components/Icon';
import DatePicker from 'react-native-date-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';

import {
  ic_bell,
  ic_date,
  ic_occasion_blue,
  ic_settings,
} from '../../assets/icons/icons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RecipientSelection from '../../components/RecipientSelection';
import {
  notificationTimingPreference,
  occasionsData,
  repetitionData,
} from '../../referenceData';
import SelectionModal from '../../components/SelectionModal';

import FastImage from 'react-native-fast-image';
import moment from 'moment';
import {supabase} from '../../lib/supabase';
import {
  ParamListBase,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import ShimmerPlaceholderVertical from '../../components/ShimmerPlaceholdersVertical';
import activeUserInstance from '../../../store/activeUsersInstance';
import {UserInterface} from '../../types';
import localInstance from '../../../store/localEventsInstance';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {fetchUserRecipients} from '../../lib/supabaseQueries';
import contactsInstance from '../../../store/contactsInstance ';
import DateTimePickerModal from '../../components/DateTimePicker';
import Input from '../../components/Input';
import scaledSize from '../../scaleSize';

const occasionsTags = [
  {
    id: 1,
    title: 'All',
  },
  {
    id: 2,
    title: 'Birthday',
  },
  {
    id: 3,
    title: 'Anniversary',
  },
  {
    id: 4,
    title: 'Wedding',
  },
  {
    id: 5,
    title: 'Graduation',
  },
];

export default function Occasions() {
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  const localStoredEvents = localInstance((state: any) => state.localEvents);
  const userContacts = contactsInstance((state: any) => state.userContacts);

  const localEvents = Array.isArray(localStoredEvents)
    ? localStoredEvents.filter(
        (event: any) => event.user_id === activeUsers[0]?.user_id,
      )
    : [];

  const [recipients, setRecipients] = useState<any>([]);
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showInputMessageModal, setShowInputMessageModal] =
    useState<boolean>(false);

  const [textMessage, setTextMessage] = useState('');
  const [isMsgLoading, setIsMsgLoading] = useState(false);

  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchRecipients();
      //Updated Functions
      const fetchData = async () => {
        try {
          const {data: events, error: eventsError} = await supabase
            .schema('event')
            .from('events')
            .select('event_id, event_type, created_by_user_id, start_datetime')
            .eq('created_by_user_id', activeUsers[0].user_id);

          if (eventsError) {
            throw eventsError;
          }

          const eventsWithGifts = await Promise.all(
            events.map(async event => {
              const {data: eventGifts, error: eventGiftsError} = await supabase
                .schema('event')
                .from('event_gifts')
                .select('gift_id')
                .eq('event_id', event.event_id);

              if (eventGiftsError) {
                throw eventGiftsError;
              }

              const giftsDetails = await Promise.all(
                eventGifts.map(async gift => {
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
                  const {data: sendeeUsers, error: sendeeUsersError} =
                    await supabase
                      .from('profiles') // Assuming 'profiles' is the schema and 'profiles' is the table
                      .select('full_name, user_id')
                      .in('user_id', sendeeUserIds);

                  if (sendeeUsersError) {
                    throw sendeeUsersError;
                  }

                  const usersWithImages = await Promise.all(
                    sendeeUsers.map(async (user: UserInterface) => {
                      const imagePath = `${user.user_id}/${user.user_id}.png`;
                      const {data: imageUrlData} = await supabase.storage
                        .from('profiles')
                        .createSignedUrl(imagePath, 86400);
                      return {...user, profile_image: imageUrlData?.signedUrl};
                    }),
                  );

                  return {
                    ...gift,
                    transactions: giftTransactions,
                    recipient: usersWithImages,
                  };
                }),
              );

              return {...event, gifts: giftsDetails};
            }),
          );

          setOccasions(eventsWithGifts);
          setFilterOccasion(eventsWithGifts);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          console.error('fetchData error:', error);
        }
      };
      fetchData();
    }, []),
  );

  async function fetchRecipients() {
    setIsLoading(true);
    const recipients = await fetchUserRecipients(activeUsers[0].user_id);
    if (recipients.length > 0) {
      const {data: relationshipsDetails, error} = await supabase
        .from('user_relationships')
        .select('relationship_id, relationships')
        .eq('user_id', activeUsers[0].user_id);

      if (error) {
        throw new Error(error.message);
      }

      const recipientsWithRelationships = recipients.map(recipient => {
        const recipientRelationships = relationshipsDetails.filter(
          relationship => relationship.relationship_id === recipient.user_id,
        );

        const relationshipTypes = recipientRelationships
          .map(relationship => relationship.relationships)
          .flat();

        const relationshipsString = relationshipTypes.join(', ');
        return {
          ...recipient,
          relationships: relationshipsString,
        };
      });
      const combinedData = recipientsWithRelationships.concat(userContacts);

      setRecipients(combinedData);
    } else {
      setRecipients(userContacts);
    }
    setIsLoading(false);
  }

  const createEvent = async () => {
    const {data: eventData, error: eventError} = await supabase
      .schema('event')
      .from('events')
      .insert([
        {
          start_datetime: birthdate,
          created_by_user_id: activeUsers[0].user_id,
          event_type: selectedOccasion,
        },
      ])
      .select();

    if (!eventError && eventData) {
    }
  };

  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [showOccasionSelectionModal, setShowOccasionSelectionModal] =
    useState(false);
  const [birthdayEnabled, setBirthdayEnabled] = useState(false);
  const [birthdate, setBirthdate] = useState(new Date());

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [showTimingModal, setShowTimingModal] = useState(false);
  const [selectedTiming, setSelectedTiming] = useState('');

  const [showRepetitionModal, setShowRepetitionModal] = useState(false);
  const [selectedRepetition, setSelectedRepetition] = useState('');
  const [showCreateMessageModal, setShowCreateMessageModal] = useState(false);
  const [textMessageDetails, setTextMessageDetails] = useState('');

  const [occasions, setOccasions] = useState<any>('');
  const [filterOccasion, setFilterOccasion] = useState<any>('');

  const [selectedTag, setSelectedTag] = useState('All');

  const handleSearch = (text: string) => {
    const filteredOccasions = filterOccasion?.filter((occasion: any) => {
      const eventTypeMatches = occasion?.event_type
        ?.toLowerCase()
        .includes(text?.toLowerCase());
      const recipientMatches = occasion?.gifts[0]?.recipient?.some(
        (recipient: any) =>
          recipient?.full_name?.toLowerCase().includes(text?.toLowerCase()),
      );

      return eventTypeMatches || recipientMatches;
    });

    setOccasions(filteredOccasions);
  };

  const handleTags = (tag: string) => {
    if (tag === 'All') {
      setOccasions(filterOccasion);
      return;
    }
    const filteredOccasions = filterOccasion?.filter((occasion: any) => {
      const eventTypeMatches = occasion?.event_type
        ?.toLowerCase()
        .includes(tag?.toLowerCase());
      return eventTypeMatches;
    });
    setOccasions(filteredOccasions);
  };

  const renderOccasionItem = ({item}: {item: any}) => {
    const formattedEvent = item?.event_type?.replace(/_/g, ' ');
    if (item.event_category === 'LOCAL') {
      return (
        <TouchableOpacity
          style={styles.userView}
          onPress={() => {
            navigation.navigate('ContactOccasion', {
              item,
            });
          }}>
          <View
            style={{
              width: 90,
              height: 15,
              top: 15,
              backgroundColor: '#d6d6d6',
              position: 'absolute',
              right: -15,
              transform: [{rotate: '40deg'}],
            }}>
            <Text
              style={{
                fontSize: 12,
                paddingHorizontal: 8,
                textAlign: 'center',
                color: '#000',
              }}>
              Contact
            </Text>
          </View>
          <View style={styles.userDetailsContainer}>
            <View style={styles.userDetails}>
              <Image
                source={require('../../assets/images/user_placeholder.png')}
                style={styles.profile}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item?.full_name}</Text>
                <Text style={styles.userDescription}>
                  {formattedEvent || 'Occasion'} •{' '}
                  {moment(item?.start_datetime).format('MMM D')}
                </Text>
              </View>
            </View>
          </View>
          <ScrollView horizontal style={styles.greetingCardContainer}>
            {item?.gift_type === 'TEXT' && (
              <View style={styles.greetingCardBox}>
                <View
                  style={{
                    position: 'relative',
                    marginVertical: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View style={styles.warningLine} />
                  <Text style={styles.greetingCardText}>Message</Text>
                  {/* <Text style={styles.timeText}>
                {moment(item?.start_datetime).format('hh:mm A')}
              </Text> */}
                </View>
              </View>
            )}

            {item?.gift_type === 'PHYSICAL' && (
              <View
                style={[styles.greetingCardBox, {backgroundColor: '#D2E0CE'}]}>
                <View style={{position: 'relative', marginVertical: 5}}>
                  <View
                    style={[styles.warningLine, {backgroundColor: '#3EAF14'}]}
                  />
                  <Text style={styles.greetingCardText}>
                    Gift (Virtual Preview)
                  </Text>
                </View>
              </View>
            )}

            {item?.gift_type === 'GREETING_CARD' && (
              <View style={styles.greetingCardBox}>
                <View style={{position: 'relative', marginVertical: 5}}>
                  <View style={styles.warningLine} />
                  <Text style={styles.greetingCardText}>Greeting card</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.userView}
          onPress={() => navigation.navigate('NewOccasions', {item})}>
          <View style={styles.userDetailsContainer}>
            <View style={styles.userDetails}>
              <Image
                source={
                  item?.gifts[0]?.recipient[0]?.profile_image
                    ? {uri: item?.gifts[0]?.recipient[0]?.profile_image}
                    : require('../../assets/images/user_placeholder.png')
                }
                style={styles.profile}
              />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {item?.gifts[0]?.recipient[0]?.full_name}
                </Text>
                <Text style={styles.userDescription}>
                  {formattedEvent || 'Occasion'} •{' '}
                  {moment(item?.start_datetime).format('MMM D')}
                </Text>
              </View>
            </View>
          </View>
          <ScrollView
            horizontal
            style={styles.greetingCardContainer}
            pointerEvents="none">
            {item?.gifts?.map((gift: any) => {
              return (
                <>
                  {gift?.transactions[0]?.gift_type === 'TEXT' && (
                    <View style={styles.greetingCardBox}>
                      <View
                        style={{
                          position: 'relative',
                          marginVertical: 5,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <View style={styles.warningLine} />
                        <Text style={styles.greetingCardText}>Message</Text>
                        <Text style={styles.timeText}>
                          {moment(gift?.transactions[0]?.scheduled_at).format(
                            'hh:mm A',
                          )}
                        </Text>
                      </View>
                    </View>
                  )}

                  {gift?.transactions[0]?.gift_type === 'PHYSICAL' && (
                    <View
                      style={[
                        styles.greetingCardBox,
                        {backgroundColor: '#D2E0CE'},
                      ]}>
                      <View style={{position: 'relative', marginVertical: 5}}>
                        <View
                          style={[
                            styles.warningLine,
                            {backgroundColor: '#3EAF14'},
                          ]}
                        />
                        <Text style={styles.greetingCardText}>
                          Gift (Virtual Preview)
                        </Text>
                        {/* <Text style={styles.timeText}>
                    {moment(item?.start_datetime).format('hh:mm A')}
                  </Text> */}
                      </View>
                    </View>
                  )}

                  {gift?.transactions[0]?.gift_type === 'GREETING_CARD' && (
                    <View style={styles.greetingCardBox}>
                      <View style={{position: 'relative', marginVertical: 5}}>
                        <View style={styles.warningLine} />
                        <Text style={styles.greetingCardText}>
                          Greeting card
                        </Text>
                        {/* <Text style={styles.timeText}>
                    {moment(item?.start_datetime).format('hh:mm A')}
                  </Text> */}
                      </View>
                    </View>
                  )}
                </>
              );
            })}
          </ScrollView>
        </TouchableOpacity>
      );
    }
  };

  const renderNewOccasionModal = () => {
    return (
      <Modal
        isVisible={showOccasionModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowOccasionModal(false)}
        onBackdropPress={() => setShowOccasionModal(false)}>
        <ScrollView style={styles.NewOccasionsModalContainer}>
          {/* Recipient Selection Modal */}
          <RecipientSelection
            data={recipients}
            isOpen={showRecipientModal}
            selected={selectedRecipient}
            onClose={() => setShowRecipientModal(false)}
            title="Recipient"
            onSelect={(item: string) => {
              setSelectedRecipient(item);
            }}
          />

          {/* Occasion Selection Modal */}
          <SelectionModal
            data={occasionsData}
            isOpen={showOccasionSelectionModal}
            onSelect={(item: string) => {
              setSelectedOccasion(item);
            }}
            title="Occasion"
            onClose={() => setShowOccasionSelectionModal(false)}
          />

          {/* Timing Selection Modal */}
          <SelectionModal
            data={notificationTimingPreference}
            isOpen={showTimingModal}
            onSelect={(item: string) => {
              setSelectedTiming(item);
            }}
            title="Timing"
            onClose={() => setShowTimingModal(false)}
          />

          {/* Repetition Selection Modal */}
          <SelectionModal
            data={repetitionData}
            isOpen={showRepetitionModal}
            onSelect={(item: string) => {
              setSelectedRepetition(item);
            }}
            title="Timing"
            onClose={() => setShowRepetitionModal(false)}
          />

          {/* Message Selection Modal */}
          {renderTextMessageModal()}

          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              onPress={() => setShowOccasionModal(false)}
              style={{
                fontSize: 17,
                fontWeight: '600',
                lineHeight: 27,
                letterSpacing: 0,
                color: colors.primary,
                marginTop: 25,
              }}>
              Cancel
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                lineHeight: 27,
                letterSpacing: 0,
                color: '#000000',
                marginTop: 25,
              }}>
              New occasion
            </Text>
            <Text
              onPress={() => setShowOccasionModal(false)}
              style={{
                fontSize: 17,
                fontWeight: '600',
                lineHeight: 27,
                letterSpacing: 0,
                color: colors.primary,
                marginTop: 25,
              }}>
              Save
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              selectedRecipient
                ? setSelectedRecipient('')
                : setShowRecipientModal(true);
            }}
            style={{
              flexDirection: 'row',
              backgroundColor: '#fff',
              borderRadius: 10,
              paddingHorizontal: 15,
              marginTop: 25,
              marginBottom: 15,
            }}>
            <Image
              style={{
                height: 72,
                width: 72,
                borderRadius: 75,
                overflow: 'hidden',
                alignSelf: 'center',
                marginVertical: 10,
              }}
              source={
                selectedRecipient
                  ? {uri: selectedRecipient?.profile_image}
                  : require('../../assets/images/user_placeholder.png')
              }
            />

            <View
              style={{
                flexDirection: 'row',
                width: '65%',
                alignSelf: 'center',
                borderRadius: 12,
                alignItems: 'center',
              }}>
              {selectedRecipient ? (
                <View style={{flexDirection: 'column', width: '100%'}}>
                  <Text
                    style={[
                      styles.btnLabel,
                      {
                        fontFamily: 'SFPro',
                        color: '#000',
                        width: '100%',
                        fontSize: 22,
                        fontWeight: '500',
                        padding: 0,
                        paddingHorizontal: 8,
                      },
                    ]}>
                    {selectedRecipient
                      ? selectedRecipient?.full_name
                      : 'Select a recipient'}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'SFPro',
                      fontSize: 17,
                      fontWeight: 'normal',
                      fontStyle: 'normal',
                      padding: 0,
                      paddingHorizontal: 10,
                      lineHeight: 22,
                      color: 'rgba(0, 0, 0, 0.5)',
                    }}>
                    {selectedRecipient?.relationships
                      ? selectedRecipient?.relationships
                      : 'No relationship added'}
                  </Text>
                </View>
              ) : (
                <Text
                  style={[
                    styles.btnLabel,
                    {color: 'rgba(0, 0, 0, 0.5)', width: '100%'},
                  ]}>
                  Select a recipient
                </Text>
              )}

              {selectedRecipient ? (
                <MaterialCommunityIcons
                  name="minus-circle-outline"
                  color={'#848484'}
                  size={26}
                  style={styles.headerIcons}
                />
              ) : (
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  color={colors.primary}
                  size={26}
                  style={styles.headerIcons}
                />
              )}
            </View>
          </TouchableOpacity>

          <View
            style={{
              width: '110%',
              alignSelf: 'center',
            }}>
            <View style={{height: 40}} />
            <TouchableOpacity
              style={styles.recipientCard}
              onPress={() => setShowOccasionSelectionModal(true)}>
              <Icon icon={ic_occasion_blue} size={24} />
              <Text style={styles.btnLabel}>Occasion</Text>
              <Text
                style={[styles.btnLabel, {position: 'absolute', right: 30}]}>
                {selectedOccasion?.replace(/_/g, ' ')}
              </Text>
              <Image
                source={require('../../assets/icons/ic_chevronRight.png')}
                style={styles.arrow}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.recipientCard}>
              <Icon icon={ic_date} size={24} />
              <Text style={[styles.btnLabel, {width: '75%'}]}>Date</Text>

              <TouchableOpacity
                style={{
                  backgroundColor: '#d6d6d6',
                  borderRadius: 15,
                  position: 'absolute',
                  right: 5,
                }}
                onPress={() => setBirthdayEnabled(!birthdayEnabled)}>
                <Text style={[styles.btnLabel]}>
                  {birthdate ? birthdate.toDateString() : '-- --'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
            {birthdayEnabled && (
              <View
                style={{
                  width: '90%',
                  alignSelf: 'center',
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: '#fff',
                  marginTop: -18,
                }}>
                <DatePicker
                  date={birthdate}
                  mode="date"
                  theme="light"
                  onDateChange={(date: any) => setBirthdate(date)}
                />
              </View>
            )}

            <TouchableOpacity style={[styles.recipientCard, {marginTop: 30}]}>
              <Icon icon={ic_bell} size={24} />
              <Text style={[styles.btnLabel, {width: '75%'}]}>
                Notifications
              </Text>
              <Switch
                style={{
                  transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                  alignSelf: 'center',
                }}
                trackColor={{false: '#767577', true: colors.primary}}
                thumbColor={colors.white}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                }}
                value={notificationsEnabled}
              />
            </TouchableOpacity>

            {notificationsEnabled ? (
              <TouchableOpacity
                style={[styles.recipientCard, {marginBottom: 15}]}
                onPress={() => setShowTimingModal(true)}>
                <Image
                  source={require('../../assets/icons/ic_clock.png')}
                  tintColor={'#812FFF'}
                  style={{height: 24, width: 24}}
                />
                <Text style={styles.btnLabel}>Timing</Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.btnLabel,
                    {position: 'absolute', right: 30, width: '50%'},
                  ]}>
                  {selectedTiming}
                </Text>
                <Image
                  source={require('../../assets/icons/ic_chevronRight.png')}
                  style={styles.arrow}
                />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.recipientCard}
              onPress={() => setShowRepetitionModal(true)}>
              <Icon icon={ic_settings} size={24} />
              <Text style={styles.btnLabel}>Repetition</Text>
              <Text
                style={[
                  styles.btnLabel,
                  {position: 'absolute', right: 25, color: '#a3a3a3'},
                ]}>
                {selectedRepetition}
              </Text>
              <Image
                source={require('../../assets/icons/ic_chevronRight.png')}
                style={styles.arrow}
              />
            </TouchableOpacity>
          </View>

          {textMessage && selectedDateTime ? (
            <>
              <View
                style={[
                  styles.newLabelText,
                  {
                    marginTop: 30,
                    flexDirection: 'column',
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 13,
                  },
                ]}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <FastImage
                    source={require('../../assets/icons/ic_filled_text.png')}
                    style={{height: 40, width: 40}}
                  />
                  <View style={{width: '80%'}}>
                    <Text
                      style={[
                        styles.btnLabel,
                        {width: '100%', padding: 4, paddingHorizontal: 15},
                      ]}>
                      Text Message
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.btnLabel,
                        {
                          color: '#848484',
                          width: '100%',
                          padding: 0,
                          paddingHorizontal: 15,
                        },
                      ]}>
                      Send a message for an occasion
                    </Text>
                  </View>
                  <AntDesign
                    onPress={() => setTextMessageDetails('')}
                    name="closecircle"
                    color={'rgba(0, 0, 0, 0.3)'}
                    size={22}
                    style={styles.headerIcons}
                  />
                </View>

                <View style={[styles.divider, {marginVertical: 10}]} />

                <View
                  style={[
                    styles.newLabelText,
                    {
                      marginTop: -5,
                      flexDirection: 'column',
                      paddingHorizontal: 0,
                      alignItems: 'flex-start',
                    },
                  ]}>
                  <View style={{flexDirection: 'row'}}>
                    <FastImage
                      source={require('../../assets/icons/ic_clock.png')}
                      style={{height: 28, width: 28}}
                    />

                    <Text
                      style={[
                        styles.btnLabel,
                        {
                          padding: 4,
                          paddingHorizontal: 15,
                          fontSize: 18,
                        },
                      ]}>
                      Reminder (Delivery date)
                    </Text>
                  </View>
                </View>

                {/* {Date} */}
                <TouchableOpacity
                  onPress={() => setShowCreateMessageModal(true)}
                  style={{
                    flexDirection: 'row',
                    alignSelf: 'center',
                    paddingTop: 10,
                    paddingBottom: 10,
                    width: '70%',
                  }}>
                  <View
                    style={{
                      backgroundColor: 'rgba(118, 118, 128, 0.12)',
                      borderRadius: 6,
                    }}>
                    <Text
                      style={[
                        styles.btnLabel,
                        {
                          width: '100%',
                          padding: 4,
                          paddingHorizontal: 15,
                          fontSize: 18,
                        },
                      ]}>
                      {moment(selectedDateTime).format('MMM DD YYYY')}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: 'rgba(118, 118, 128, 0.12)',
                      borderRadius: 6,
                      marginLeft: 8,
                    }}>
                    <Text
                      style={[
                        styles.btnLabel,
                        {
                          width: '100%',
                          padding: 4,
                          paddingHorizontal: 15,
                          fontSize: 18,
                        },
                      ]}>
                      {moment(selectedDateTime).format('hh:mm A')}
                    </Text>
                  </View>
                </TouchableOpacity>

                <View style={[styles.divider, {marginVertical: 10}]} />

                <View
                  style={[
                    styles.newLabelText,
                    {
                      marginTop: -5,
                      flexDirection: 'column',
                      paddingHorizontal: 0,
                      alignItems: 'flex-start',
                    },
                  ]}>
                  <View style={{flexDirection: 'row'}}>
                    <FastImage
                      source={require('../../assets/icons/ic_settings.png')}
                      style={{height: 28, width: 28}}
                    />

                    <Text
                      style={[
                        styles.btnLabel,
                        {
                          width: '40%',
                          padding: 4,
                          paddingHorizontal: 15,
                          fontSize: 18,
                        },
                      ]}>
                      Settings
                    </Text>

                    <Text
                      style={[
                        styles.btnLabel,
                        {
                          color: '#848484',
                          padding: 4,
                          paddingHorizontal: 15,
                          fontSize: 18,
                        },
                      ]}>
                      Manual sending
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.newLabelText,
                  {
                    flexDirection: 'column',
                  },
                ]}>
                <Text
                  style={[
                    styles.btnLabel,
                    {
                      width: '100%',
                      padding: 4,
                      paddingHorizontal: 15,
                      paddingVertical: 12,
                      fontSize: 18,
                    },
                  ]}>
                  {textMessage}
                </Text>
              </View>

              <Text style={styles.noteLabel}>
                You will receive an in-app notification on the day and time of
                the occasion, allowing you to copy and send the created message
                through the messaging apps you prefer.
              </Text>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.newLabelText, {marginTop: 30}]}
              onPress={() => setShowCreateMessageModal(true)}>
              <MaterialCommunityIcons
                name="plus-circle-outline"
                color={colors.primary}
                size={26}
                style={styles.headerIcons}
              />
              <Text
                style={[
                  styles.btnLabel,
                  {color: colors.primary, width: '100%'},
                ]}>
                Text Message
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.newLabelText}>
            <MaterialCommunityIcons
              name="plus-circle-outline"
              color={colors.primary}
              size={26}
              style={styles.headerIcons}
            />
            <Text
              style={[styles.btnLabel, {color: colors.primary, width: '100%'}]}>
              Greeting card
            </Text>
          </View>

          <View style={styles.newLabelText}>
            <MaterialCommunityIcons
              name="plus-circle-outline"
              color={colors.primary}
              size={26}
              style={styles.headerIcons}
            />
            <Text
              style={[styles.btnLabel, {color: colors.primary, width: '100%'}]}>
              Gift
            </Text>
          </View>
          <View
            style={[
              styles.bg,
              {
                flexDirection: 'column',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                marginBottom: 50,
              },
            ]}>
            <View style={styles.divider} />
          </View>
        </ScrollView>
      </Modal>
    );
  };

  const isButtonActive = () => {
    return !(
      selectedRecipient &&
      selectedOccasion &&
      selectedDateTime &&
      textMessage
    );
  };

  const renderMessageModal = () => {
    return (
      <Modal
        isVisible={showInputMessageModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowInputMessageModal(false)}>
        <ScrollView contentContainerStyle={styles.messageModalContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 20,
            }}>
            <Text
              style={styles.messageHeaderLabel}
              onPress={() => setShowInputMessageModal(false)}>
              Cancel
            </Text>
            <Text style={styles.messageMainLabel}>Message</Text>
            <Text
              style={styles.messageHeaderLabel}
              onPress={() => setShowInputMessageModal(false)}>
              Done
            </Text>
          </View>

          <View style={styles.divider} />

          <TextInput
            value={textMessage}
            numberOfLines={8}
            multiline={true}
            placeholder="Type your message"
            placeholderTextColor={'#000000'}
            style={styles.messageInput}
            onChangeText={(txt: string) => setTextMessage(txt)}
          />

          <TouchableOpacity
            onPress={() => getAISuggestions()}
            style={styles.surpriseBtn}>
            {isMsgLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <FastImage
                style={{height: 20, width: 20}}
                source={require('../../assets/images/ai.png')}
              />
            )}
            <Text style={styles.surpriseLabel}>Surprise me</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    );
  };

  const renderTextMessageModal = () => {
    return (
      <Modal
        isVisible={showCreateMessageModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowCreateMessageModal(false)}
        onBackdropPress={() => setShowCreateMessageModal(false)}>
        <ScrollView style={styles.container}>
          {renderMessageModal()}
          <DateTimePickerModal
            isOpen={showDatePicker}
            onClose={() => setShowDatePicker(false)}
            onSelect={(item: string) => {
              setSelectedDateTime(item);
            }}
          />

          <View style={styles.headerContainer}>
            <Text
              onPress={() => setShowCreateMessageModal(false)}
              style={styles.headerLabel}>
              Cancel
            </Text>
            <Text style={[styles.headerLabel, {color: colors.black}]}>
              Text Message
            </Text>
            <Text
              onPress={() => setShowCreateMessageModal(false)}
              style={[
                styles.headerLabel,
                {color: isButtonActive() === true ? 'gray' : colors.primary},
              ]}
              disabled={isButtonActive()}>
              Done
            </Text>
          </View>

          <Text style={styles.inputLabel}>Recipient</Text>
          <View style={{flexDirection: 'row'}}>
            <FastImage
              style={{height: 50, width: 50, borderRadius: 25}}
              source={
                selectedRecipient
                  ? {uri: selectedRecipient?.profile_image}
                  : require('../../assets/images/user_placeholder.png')
              }
            />
          </View>

          <Text style={styles.inputLabel}>Occasion</Text>
          <TouchableOpacity onPress={() => setShowOccasionModal(true)}>
            <Input
              editable={false}
              value={selectedOccasion?.replace(/_/g, ' ')}
              defaultValue={selectedOccasion}
            />
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Delivery date</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Input
              placeholder="Select a date and time"
              editable={false}
              defaultValue={selectedDateTime?.toString()}
              onPressIn={() => setShowDatePicker(true)}
            />
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Message</Text>
          <Input
            editable={false}
            onPressIn={() => setShowInputMessageModal(true)}
            numberOfLines={5}
            multiLine={true}
            placeholder="Message"
            defaultValue={textMessage}
            // onChangeText={(text: string) => setMessage(text)}
          />

          <Text style={styles.noteLabel}>
            You will receive an in-app notification on the day and time of the
            occasion, allowing you to copy and send the created message through
            the messaging apps you prefer.
          </Text>
        </ScrollView>
      </Modal>
    );
  };

  const getAISuggestions = async () => {
    setIsMsgLoading(true);
    const {data: suggestion, error} = await supabase.functions.invoke(
      'llm-completion',
      {
        body: {
          query:
            'Generate a wish message from this text  - ' +
            textMessage +
            'for the occasion of ' +
            selectedOccasion +
            'for' +
            selectedRecipient?.full_name,
        },
      },
    );
    if (!error && suggestion?.response) {
      setTextMessage(suggestion?.response);
    }
    setIsMsgLoading(false);
  };

  return (
    <View style={{backgroundColor: 'rgba(249, 249, 249, 0.8)'}}>
      <SafeAreaView />
      {renderNewOccasionModal()}
      <View style={styles.occasionContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.occasionText}>Occasions</Text>
        </View>
        <View style={styles.imageContainer}>
          <MaterialIcons
            // onPress={() => {
            //   setShowOccasionModal(true);
            //   setSelectedRecipient(null);
            // }}
            onPress={() => navigation.navigate('giftassistant')}
            name="add-circle-outline"
            color={colors.primary}
            size={26}
            style={{marginRight: 10}}
          />
        </View>
      </View>
      <View style={styles.searchContainer}>
        <Feather
          name="search"
          color={'#737373'}
          size={18}
          style={{marginRight: 10}}
        />
        <TextInput
          numberOfLines={1}
          style={styles.searchInput}
          placeholder="Search occasion and receipient"
          placeholderTextColor="rgba(0, 0, 0, 0.5)"
          onChangeText={text => handleSearch(text)}
        />
      </View>
      <View style={styles.divider} />
      <View style={styles.mainSection}>
        <View style={styles.labelContainer}>
          <FlatList
            data={occasionsTags}
            horizontal
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.label,
                  {
                    backgroundColor:
                      selectedTag === item.title
                        ? 'rgba(0, 0, 0, 0.5)'
                        : 'transparent',
                  },
                ]}
                onPress={() => {
                  setSelectedTag(item.title);
                  handleTags(item.title);
                }}>
                <Text
                  style={[
                    styles.labelText,
                    {
                      color: selectedTag === item.title ? '#fff' : '#000',
                    },
                  ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.title}
          />
        </View>
        <View style={styles.divider} />
        {isLoading ? (
          <FlatList
            data={[1, 2, 3, 4, 5]}
            renderItem={() => <ShimmerPlaceholderVertical />}
            keyExtractor={item => item.toString()}
          />
        ) : (
          <FlatList
            // data={occasions}
            data={[...occasions, ...localEvents]}
            style={{marginBottom: scaledSize(125)}}
            ListEmptyComponent={
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Text
                  style={{
                    fontFamily: 'SFPro',
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: '#333333',
                    marginVertical: 20,
                  }}>
                  No Occasions Found
                </Text>
              </View>
            }
            renderItem={renderOccasionItem}
            keyExtractor={item => item.event_id}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  occasionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  textContainer: {
    flex: 1,
  },
  occasionText: {
    fontFamily: 'SFPro',
    fontSize: 32,
    fontWeight: 'bold',
    color: '##4b494d',
  },
  imageContainer: {
    marginLeft: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 42,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    margin: 20,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'normal',
    color: 'rgba(0, 0, 0  , 0.5)',
  },
  mainSection: {
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#EFEFF4',
    height: '82%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  selectedLabel: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#77777A',
  },
  label: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    margin: 5,
  },
  selectedLabelText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  labelText: {
    fontSize: 14,
    color: '#333333',
  },
  divider: {
    width: '100%',
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  dateText: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#000000',
  },
  dateSection: {
    width: 393,
    height: 60,
    backgroundColor: '#efeff4',
    justifyContent: 'center',
  },
  userView: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingVertical: 13,
    marginTop: 10,
    overflow: 'hidden',
  },
  userDetailsContainer: {
    flexDirection: 'row',
  },
  greetingCardContainer: {
    marginLeft: 10,
    flexDirection: 'row',
  },
  userViewSmall: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 14,
    marginTop: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  userDescription: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    alignItems: 'center',
  },
  profile: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 0.5,
    borderColor: '#d6d6d6',
  },
  userDetails: {
    flexDirection: 'row',
    marginLeft: 10,
    alignItems: 'flex-start',
  },
  userInfo: {
    marginLeft: 10,
    alignSelf: 'flex-start',
  },
  greetingCardBox: {
    paddingHorizontal: 10,
    marginVertical: 12,
    paddingVertical: 5,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(212, 193, 103, 0.2)',
    margin: 10,
    alignSelf: 'center',
  },
  greetingCardText: {
    fontSize: 17,
    fontWeight: 'normal',
    marginLeft: 10,
    color: '#000',
    fontStyle: 'normal',
    lineHeight: 18,
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'normal',
    marginLeft: 10,
    lineHeight: 18,
    paddingTop: 5,
  },
  loadIcon: {
    width: 22,
    height: 22,
  },
  loadingWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 40,
  },
  warningLine: {
    width: 3,
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#FFD100',
    alignSelf: 'center',
  },
  recipientCard: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginVertical: 5,
    zIndex: 1,
  },
  bg: {
    width: '95%',
    alignSelf: 'center',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#000000',
    overflow: 'hidden',
  },
  multiLineText: {
    color: 'rgba(0, 0, 0, 0.5)',
    width: '95%',
  },
  arrow: {
    width: 22,
    height: 22,
    position: 'absolute',
    right: 10,
  },
  btnContainer: {
    flexDirection: 'row',
    width: '95%',
    borderRadius: 8,
    alignSelf: 'center',
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#D4D3D9',
    marginVertical: 8,
    paddingHorizontal: 5,
  },
  btnLabel: {
    fontSize: 16,
    color: colors.black,
    padding: 8,
    fontWeight: '400',
  },
  newLabelText: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 10,
  },
  headerIcons: {
    width: 26,
    height: 26,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
  },

  NewOccasionsModalContainer: {
    height: '90%',
    width: '100%',
    backgroundColor: '#ECECF3',
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 12,
    bottom: 0,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingBottom: 25,
  },

  //Text Msg Modal
  container: {
    height: '90%',
    width: '100%',
    backgroundColor: '#DEDDE4',
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 12,
    bottom: 0,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 25,
  },
  headerLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
  inputLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 20,
    marginBottom: 10,
  },
  noteLabel: {
    width: '90%',
    textAlign: 'justify',
    alignSelf: 'center',
    fontSize: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: 'rgba(0, 0, 0, 0.5)',
    marginVertical: 20,
  },
  recipientBtn: {
    backgroundColor: '#D3D4D9',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    marginRight: 15,
  },
  messageModalContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    height: 360,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  messageHeaderLabel: {
    fontFamily: 'SFPro',
    fontSize: 17,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    color: colors.primary,
  },
  messageMainLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  surpriseBtn: {
    width: '90%',
    backgroundColor: '#f1f1f1',
    height: 40,
    borderRadius: 12,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 10,
  },
  surpriseLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 16,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
    padding: 8,
  },
  messageInput: {
    width: '90%',
    backgroundColor: '#fff',
    height: 150,
    borderRadius: 12,
    alignSelf: 'center',
    padding: 12,
    paddingVertical: 20,
    margin: 15,
    lineHeight: 28,
    fontSize: 20,
    color: '#000',
  },
});
