/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {supabase} from '../../lib/supabase';
import {
  FlatList,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DatePicker from 'react-native-date-picker';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from '../../components/Icon';
import {
  ic_add,
  ic_answers,
  ic_back,
  ic_giftbox,
  ic_remove,
} from '../../assets/icons/icons';
import Feather from 'react-native-vector-icons/Feather';
import colors from '../../theme/colors';
import Button from '../../components/Button';
import Input from '../../components/Input';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import activeUserInstance from '../../../store/activeUsersInstance';
import {
  fetchUserRecipients,
  generateRandomString,
} from '../../lib/supabaseQueries';
import {UserInterface} from '../../types';
import ShimmerPlaceholderVertical from '../../components/ShimmerPlaceholdersVertical';
import {occasionsData} from '../../referenceData';
import contactsInstance from '../../../store/contactsInstance ';
import localInstance from '../../../store/localEventsInstance';
import Toast from 'react-native-toast-message';
import scaledSize from '../../scaleSize';

const MessageQuiz = () => {
  const navigation = useNavigation<any>();

  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  const userContacts = contactsInstance((state: any) => state.userContacts);

  const localEvents = localInstance((state: any) => state.localEvents);
  const setLocalEvents = localInstance((state: any) => state.setLocalEvents);
  const route = useRoute();
  const preSelectedRecipient = route?.params?.selectedRecipient;
  useEffect(() => {
    if (preSelectedRecipient) {
      setSelectedRecipient(preSelectedRecipient);
      setCurrentStep(3);
      updateAnswersForId(2, preSelectedRecipient.full_name);
    }
    const fetchData = async () => {
      setIsLoading(true);
      const recipients = await fetchUserRecipients(activeUsers[0].user_id);
      if (recipients.length > 0) {
        setRecipients(recipients);
        setRecipientsHolder(recipients);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [showAnswerModal, setShowAnswerModal] = useState(false);

  const [recipients, setRecipients] = useState<any>([]);
  const [recipientsHolder, setRecipientsHolder] = useState<any>([]);

  const [contacts, setContacts] = useState<any>(userContacts);
  const [selectedRecipient, setSelectedRecipient] = useState<UserInterface>({});

  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [occasions, setOccasions] = useState(occasionsData);
  const [searchOccasions, setSearchOccasions] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [occasionReminder, setOccasionReminder] = useState(false);
  const [birthdate, setBirthdate] = useState(new Date());
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isMsgLoading, setIsMsgLoading] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [reminderDate, setReminderDate] = useState(new Date());
  const [dateType, setDateType] = useState('');
  const [textMessage, setTextMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [answers, setAnswers] = useState([
    {
      id: 1,
      question: 'How can I help you?',
      answers: ['Send a message'],
    },
    {
      id: 2,
      question: 'Who is the recipient?',
      answers: [],
    },
    {
      id: 3,
      question: 'What is the occasion?',
      answers: [],
    },
    {
      id: 4,
      question: 'What is the date?',
      answers: [],
    },
    {
      id: 5,
      question: 'What date and time…the message?',
      answers: [],
    },
  ]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateAnswersForId = (id, newValue) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(answer =>
        answer.id === id ? {...answer, answers: [newValue]} : answer,
      ),
    );
  };

  const renderUserDetails = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.userView}
      onPress={() => {
        setSelectedRecipient(item);
        setCurrentStep(currentStep + 1);
      }}>
      <View style={styles.userDetails}>
        <View>
          <Image
            source={
              item.type === 'contact'
                ? require('../../assets/images/user_placeholder.png')
                : {uri: item.profile_image}
            }
            style={styles.profile}
          />

          {item.type !== 'contact' && (
            <View style={styles.notificationIconContainer}>
              <Image
                source={require('../../assets/icons/ic_logo.png')}
                style={styles.notificationIcon}
              />
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name}</Text>
          <Text style={styles.userDescription}>{item.relationship}</Text>
        </View>

        <Icon icon={ic_add} size={26} />
      </View>
    </TouchableOpacity>
  );

  const confirmMessageScheduling = async () => {
    setIsLoading(true);
    const items = {
      message: textMessage,
    };
    const uniqueID = await generateRandomString();
    if (selectedRecipient?.type === 'contact') {
      const giftObject = {
        id: uniqueID,
        start_datetime: birthdate,
        created_by_user_id: activeUsers[0].user_id,
        event_type: selectedOccasion,
        user_id: activeUsers[0].user_id,
        gift_metadata: items,
        gift_type: 'TEXT',
        event_category: 'LOCAL',
        full_name: selectedRecipient?.full_name,
      };
      //store giftObject on setLocalEvents with existing localEvents
      let localGifts = [...localEvents, giftObject];
      setLocalEvents(localGifts);
      navigation.replace('messageconfirmation', {
        name: selectedRecipient?.full_name,
        type: 'TEXT',
        gift_metadata: items,
      });
      return;
    }

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
      const items = {
        message: textMessage,
      };

      const {data: giftData, error: giftError} = await supabase
        .schema('gift')
        .from('gift_transactions')
        .insert([
          {
            sendee_user_id: selectedRecipient?.user_id,
            user_id: activeUsers[0].user_id,
            gift_metadata: items,
            gift_type: 'TEXT',
            scheduled_at: deliveryDate,
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

        if (occasionReminder) {
          const notification1 = {
            auth_id: selectedRecipient?.auth_id,
            body:
              'You have received a new gift from : ' + activeUsers[0].full_name,
            user_id: selectedRecipient?.user_id,
            scheduled_at: reminderDate,
            notification_metadata: {id: eventData[0].event_id},
          };
          const notification2 = {
            auth_id: activeUsers[0].auth_id,
            body:
              'You have scheduled a gift for : ' + selectedRecipient?.full_name,
            user_id: activeUsers[0].user_id,
            scheduled_at: reminderDate,
            notification_metadata: {id: eventData[0].event_id},
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
            name: selectedRecipient?.full_name,
            type: 'TEXT',
            gift_metadata: items,
          });
        }
      }
    }
    setIsLoading(false);
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      if (Object.keys(selectedRecipient).length === 0) {
        Toast.show({
          type: 'error',
          text1: 'Please select a recipient',
          position: 'bottom',
        });
        return;
      }
    }

    updateAnswersForId(2, selectedRecipient?.full_name);

    if (currentStep === 3) {
      if (selectedOccasion === '') {
        Toast.show({
          type: 'error',
          text1: 'Please select occasion',
          position: 'bottom',
        });
        return;
      }
    }
    updateAnswersForId(3, selectedOccasion);
    if (currentStep === 4) {
      updateAnswersForId(4, moment(birthdate).format('DD MMM'));
    }
    if (currentStep === 5) {
      updateAnswersForId(5, moment(deliveryDate).format('DD MMM'));
    }
    if (currentStep === 6) {
      if (textMessage === '') {
        Toast.show({
          type: 'error',
          text1: 'Please enter your message',
          position: 'bottom',
        });
        return;
      } else {
        confirmMessageScheduling();
      }
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const filteredOccasions = occasions.filter(item =>
    item.name.toLowerCase().includes(searchOccasions.toLowerCase()),
  );

  const renderMessageModal = () => {
    return (
      <Modal
        isVisible={showMessageModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowMessageModal(false)}>
        <ScrollView contentContainerStyle={styles.messageModalContainer}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 20,
            }}>
            <Text
              style={styles.messageHeaderLabel}
              onPress={() => setShowMessageModal(false)}>
              Cancel
            </Text>
            <Text style={styles.messageMainLabel}>Message</Text>
            <Text
              style={styles.messageHeaderLabel}
              onPress={() => setShowMessageModal(false)}>
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

  const renderAnswersModal = () => {
    return (
      <Modal
        isVisible={showAnswerModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowAnswerModal(false)}
        onBackdropPress={() => setShowAnswerModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.headerDragButton} />

          <View style={styles.headerModalContainer}>
            <Text style={styles.answerLabel}>List answered questions</Text>
            <Text
              onPress={() => setShowAnswerModal(false)}
              style={styles.doneLabel}>
              Done
            </Text>
          </View>
          <ScrollView>
            {answers?.map((item: any) => (
              <View key={item?.question} style={styles.questionCard}>
                <View style={styles.questionSubCard}>
                  <Text style={styles.questionLabel}>{item?.question}</Text>
                </View>

                <ScrollView
                  horizontal
                  style={{flexDirection: 'row'}}
                  showsHorizontalScrollIndicator={false}>
                  {item?.answers?.map((option: string) => (
                    <TouchableOpacity key={option} style={[styles.listItem]}>
                      <Text style={[styles.listLabel]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    );
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
            mode={dateType === 'RDATE' ? 'datetime' : 'date'}
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
            onPress={() => setShowDatePicker(false)}
          />
        </View>
      </Modal>
    );
  };
  const handleOccasionSelection = (occasion: string) => {
    setSelectedOccasion(occasion);
    occasion === 'BIRTHDAY'
      ? setBirthdate(selectedRecipient.birthday || new Date())
      : setBirthdate(new Date());
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

  const handleSearch = (text: string) => {
    const filteredReceipients = recipientsHolder.filter((item: any) => {
      return item?.full_name?.toLowerCase().includes(text.toLowerCase());
    });
    setRecipients(filteredReceipients);

    const filteredContacts = userContacts.filter((item: any) => {
      return item?.full_name?.toLowerCase().includes(text.toLowerCase());
    });
    setContacts(filteredContacts);
  };

  return (
    <View style={{flex: 1}}>
      <SafeAreaView style={{backgroundColor: 'rgba(249, 249, 249, 0.8)'}} />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />

        {renderMessageModal()}
        {renderDateModal()}
        {renderAnswersModal()}
        <View style={styles.headerContainer}>
          <View style={styles.headerLView}>
            <AntDesign
              name="close"
              color={colors.black}
              style={{paddingHorizontal: 10}}
              size={25}
              onPress={() => navigation.replace('tabnavigator')}
            />
            <View
              style={{
                flexDirection: 'row',
              }}>
              <Icon size={38} icon={ic_giftbox} />
              {selectedRecipient?.profile_image && (
                <FastImage
                  source={{uri: selectedRecipient?.profile_image}}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 20,
                    marginLeft: -10,
                  }}
                />
              )}
            </View>
            <View>
              <Text style={styles.label}>Gift Assistant</Text>
              {selectedRecipient?.full_name && (
                <Text style={styles.subLabel}>
                  {selectedRecipient?.full_name}
                </Text>
              )}
            </View>
          </View>
        </View>

        {currentStep === 1 && (
          <>
            <Text style={styles.giftLabel}>
              Let’s send a text message to someone.{'\n'}Who is the recipient?
            </Text>

            <Text style={styles.giftSubLabel}>Select only one option.</Text>

            <View style={styles.searchContainer}>
              <Feather
                name="search"
                color={'rgba(0, 0, 0, 0.5)'}
                size={18}
                style={{marginRight: 10}}
              />
              <TextInput
                style={styles.searchInput}
                onChangeText={text => handleSearch(text)}
                placeholder="Search"
                placeholderTextColor="rgba(0, 0, 0, 0.5)"
              />
            </View>

            {isLoading ? (
              <FlatList
                data={[1, 2, 3]}
                style={{width: '92%', marginBottom: 80}}
                renderItem={() => <ShimmerPlaceholderVertical />}
                keyExtractor={item => item.toString()}
              />
            ) : (
              <>
                <View style={styles.headerLabel}>
                  <Text style={{fontSize: 16, color: '#a3a3a3'}}>
                    Receipients
                  </Text>
                </View>
                <FlatList
                  data={recipients}
                  style={{width: '90%', minHeight: '26%', maxHeight: '26%'}}
                  renderItem={renderUserDetails}
                  keyExtractor={(item, index) => index.toString()}
                />
                <View style={styles.headerLabel}>
                  <Text style={{fontSize: 16, color: '#a3a3a3'}}>Contacts</Text>
                </View>
                <FlatList
                  data={contacts}
                  style={{width: '90%', marginBottom: 80, maxHeight: '50%'}}
                  renderItem={renderUserDetails}
                  keyExtractor={(item, index) => index.toString()}
                />
              </>
            )}
          </>
        )}

        {currentStep === 2 && (
          <>
            <Text style={styles.giftLabel}>
              Let’s send a text message to someone. Who is the recipient?
            </Text>
            <Text style={styles.giftSubLabel}>Select only one option.</Text>

            <View style={styles.searchContainer}>
              <Feather
                name="search"
                color={'#737373'}
                size={18}
                style={{marginRight: 10}}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#999999"
              />
            </View>

            <TouchableOpacity
              style={[styles.userView, {width: '90%'}]}
              onPress={() => {
                setSelectedRecipient({});
                setCurrentStep(currentStep - 1);
              }}>
              <View style={styles.userDetails}>
                <View>
                  <Image
                    source={{
                      uri: selectedRecipient.profile_image,
                    }}
                    style={styles.profile}
                  />

                  <View style={styles.notificationIconContainer}>
                    <Image
                      source={require('../../assets/icons/ic_logo.png')}
                      style={styles.notificationIcon}
                    />
                  </View>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {selectedRecipient.full_name}
                  </Text>
                  <Text style={styles.userDescription}>
                    {selectedRecipient.relationship}
                  </Text>
                </View>

                <Icon icon={ic_remove} size={22} />
              </View>
            </TouchableOpacity>
          </>
        )}

        {currentStep === 3 && (
          <>
            <Text style={styles.giftLabel}>What is the occasion?</Text>
            <Text style={styles.giftSubLabel}>Select only one option.</Text>

            <View style={styles.searchContainer}>
              <Feather
                name="search"
                color={'#737373'}
                size={18}
                style={{marginRight: 10}}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#999999"
                onChangeText={text => setSearchOccasions(text)}
                value={searchOccasions}
              />
            </View>

            <View style={{height: '67%'}}>
              <ScrollView contentContainerStyle={styles.listContainer}>
                {filteredOccasions.map(item => {
                  const formattedName = item?.name?.replace(/_/g, ' ');
                  return (
                    <TouchableOpacity
                      onPress={() => handleOccasionSelection(item.name)}
                      key={item.id}
                      style={[
                        styles.listItem,
                        {
                          backgroundColor:
                            selectedOccasion === item.name ? '#77777A' : '#fff',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.listLabel,
                          {
                            color:
                              selectedOccasion === item.name ? '#fff' : '#000',
                          },
                        ]}>
                        {formattedName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </>
        )}

        {currentStep === 4 && (
          <>
            <Text style={styles.giftLabel}>
              What is the {selectedOccasion === 'BIRTHDAY' ? 'birthday ' : ''}
              date?
            </Text>
            <Text style={[styles.giftSubLabel, {marginBottom: 50}]}>
              Fill all requests.
            </Text>

            <View
              style={{
                alignItems: 'flex-start',
                width: '100%',
                paddingHorizontal: 15,
              }}>
              <Text style={styles.dateLabel}>
                {selectedOccasion === 'BIRTHDAY' ? 'Birthday date' : 'Date'}
              </Text>
              <TouchableOpacity
                onPressIn={() => {
                  setShowDatePicker(true);
                  setDateType('ODATE');
                }}>
                <Input
                  value={moment(birthdate).format('MMMM D YYYY')}
                  editable={false}
                  onPressIn={() => {
                    setShowDatePicker(true);
                    setDateType('ODATE');
                  }}
                />
              </TouchableOpacity>
              {selectedOccasion === 'BIRTHDAY' && (
                <Text style={styles.dateNoteLabel}>
                  If the selected user already has a GiftProfile, this field
                  will be automatically filled.
                </Text>
              )}
            </View>
          </>
        )}

        {currentStep === 5 && (
          <ScrollView
            contentContainerStyle={{
              width: Dimensions.get('window').width,
              alignItems: 'center',
            }}>
            <Text style={styles.giftLabel}>
              What date and time would you receive the reminder to send the text
              message?
            </Text>
            <Text style={[styles.giftSubLabel, {marginBottom: 50}]}>
              Fill all requests.
            </Text>

            <View
              style={{
                width: '92%',
              }}>
              <Text style={styles.dateLabel}>Delivery date and time</Text>
              <TouchableOpacity
                onPressIn={() => {
                  setShowDatePicker(true);
                  setDateType('DDATE');
                }}>
                <Input
                  value={moment(deliveryDate).format('MMMM D YYYY')}
                  editable={false}
                  onPressIn={() => {
                    setShowDatePicker(true);
                    setDateType('DDATE');
                  }}
                />
              </TouchableOpacity>

              <Text style={[styles.dateLabel, {marginVertical: 30}]}>
                Suggestion
              </Text>
              <View style={styles.reminderBox}>
                <View
                  style={{
                    flexDirection: 'row',
                  }}>
                  <FastImage
                    style={{height: 60, width: 60}}
                    source={require('../../assets/images/occasion.png')}
                  />
                  <Text style={styles.reminderLabel}>
                    Be reminded of this occasion
                  </Text>
                  <Switch
                    style={{
                      transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                      alignSelf: 'center',
                    }}
                    trackColor={{false: '#767577', true: colors.primary}}
                    thumbColor={colors.white}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={() => setOccasionReminder(!occasionReminder)}
                    value={occasionReminder}
                  />
                </View>

                <View style={styles.reminderDivider} />

                <Text style={styles.reminderNote}>
                  Add this occasion in your occasions list to receive a
                  notification and easily schedule a gift. The recipient will
                  never know about it.
                </Text>
              </View>
              {occasionReminder && (
                <>
                  <Text style={[styles.dateLabel, {marginVertical: 30}]}>
                    Reminder date and time
                  </Text>
                  <TouchableOpacity
                    style={{marginBottom: '50%'}}
                    onPressIn={() => {
                      setShowDatePicker(true);
                      setDateType('RDATE');
                    }}>
                    <Input
                      value={moment(reminderDate).format('MMM D YYYY hh:mm A')}
                      editable={false}
                      onPressIn={() => {
                        setShowDatePicker(true);
                        setDateType('RDATE');
                      }}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        )}

        {currentStep === 6 && (
          <>
            <Text style={styles.giftLabel}>Create your message:</Text>
            <Text style={[styles.giftSubLabel, {marginBottom: 50}]}>
              Fill all requests.
            </Text>

            <View
              style={{
                alignItems: 'flex-start',
                width: '100%',
                paddingHorizontal: 15,
              }}>
              <TouchableOpacity
                onPress={() => setShowMessageModal(true)}
                style={styles.messageContainer}>
                <Text style={styles.messageLabel}>{textMessage}</Text>
              </TouchableOpacity>
              <Text style={styles.dateNoteLabel}>
                You will receive an in-app notification on the day and time of
                the occasion, allowing you to copy and send the created message
                through the messaging apps you prefer.
              </Text>
            </View>
          </>
        )}

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.bottomBtnContainer}
            onPress={() => setShowAnswerModal(true)}>
            <Icon size={35} icon={ic_answers} tintColor={'#000'} />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={currentStep === 1}
            style={styles.bottomBtnContainer}
            onPress={handleBack}>
            <Icon size={35} icon={ic_back} tintColor={'#000'} />
          </TouchableOpacity>
          <View style={{width: '70%'}}>
            <Button
              width={'98%'}
              isLoading={isLoading}
              label={currentStep === 6 ? 'Confirm' : 'Continue'}
              onPress={handleContinue}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
export default MessageQuiz;
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#efeff4',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(249, 249, 249, 0.8)',
    height: 58,
    borderBottomWidth: 0.3,
    borderBottomColor: '#969297',
  },
  headerLView: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRView: {
    width: '20%',
    justifyContent: 'center',
  },
  headerRecipient: {
    width: 38,
    height: 38,
    borderRadius: 20,
  },
  label: {
    color: '#000',
    fontSize: 18,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  subLabel: {
    fontFamily: 'SFPro',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    paddingHorizontal: 10,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  giftLabel: {
    width: '90%',
    fontFamily: 'SFPro',
    fontSize: 25,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 28,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
    paddingTop: 33,
    paddingBottom: 18,
  },
  giftSubLabel: {
    fontFamily: 'SFPro',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#3b3b3b',
    paddingBottom: 25,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderColor: '#999999',
    padding: 1,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    margin: 10,
    width: '90%',
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  userDetails: {
    flexDirection: 'row',
    marginLeft: 10,
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 10,
    alignSelf: 'center',
    width: '70%',
  },
  userDetailsContainer: {
    flexDirection: 'row',
    margin: 10,
  },
  profile: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 0.5,
    borderColor: '#d6d6d6',
  },
  notificationIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    backgroundColor: '#ffffff',
    borderRadius: 50,
  },
  notificationIcon: {
    width: 22,
    height: 22,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    paddingHorizontal: 10,
  },
  userDescription: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  divider: {
    width: '100%',
    height: 0.8,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  fomateText: {
    marginLeft: 25,
    marginTop: 15,
  },
  userView: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginVertical: 4,
    width: '100%',
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d6d6d6',
    borderRadius: 10,
    width: '95%',
    alignSelf: 'center',
    minHeight: 120,
  },
  messageLabel: {
    fontFamily: 'SFPro',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: 'rgba(0, 0, 0, 0.8)',
  },
  bottomBar: {
    width: '100%',
    paddingHorizontal: scaledSize(20),
    backgroundColor: '#f9f9f9',
    borderTopColor: '#969297',
    borderTopWidth: 0.3,
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
    bottom: 0,
    zIndex: 1,
    paddingBottom: 10,
  },
  bottomBtnContainer: {
    backgroundColor: '#F1F1F2',
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '2%',
    borderRadius: 8,
  },
  btn: {
    width: '90%',
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  btnLabel: {
    fontFamily: 'SFPro',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  listItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 5,
    borderRadius: 21,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    width: 'auto',
  },
  listLabel: {
    fontSize: 16,
    color: '#000',
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flexGrow: 1,
    width: '95%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  dateLabel: {
    marginBottom: 10,
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
  },
  dateNoteLabel: {
    fontFamily: 'SFPro',
    fontSize: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: 'rgba(0, 0, 0, 0.5)',
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
  reminderBox: {
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginVertical: 5,
    zIndex: 1,
  },
  reminderLabel: {
    width: '65%',
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 25,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 28,
    letterSpacing: -1.25,
    color: '#000000',
    paddingHorizontal: 15,
  },
  reminderNote: {
    fontFamily: 'SFPro',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
    paddingVertical: 8,
  },
  reminderDivider: {
    height: 1,
    backgroundColor: '#d6d6d6',
    width: '100%',
    marginTop: 8,
  },
  budgetLabel: {
    fontFamily: 'SFPro',
    fontSize: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    paddingVertical: 1,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  rail: {
    backgroundColor: '#d6d6d6',
    borderRadius: 2,
    flex: 1,
    height: 4,
  },
  railSelected: {
    backgroundColor: '#ff0000',
    borderRadius: 3,
    height: 4,
  },
  priceContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
  },
  priceInputContainer: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  priceInputBox: {
    borderWidth: 1,
    borderColor: '#d6d6d6',
    width: '45%',
    borderRadius: 10,
    height: 65,
    paddingHorizontal: 10,
  },
  priceLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 20,
    letterSpacing: 0,
    color: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
  },
  currencyLabel: {
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    paddingHorizontal: 5,
    paddingRight: 6,
    color: '#363132',
  },
  thumbIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
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
  modalContainer: {
    backgroundColor: '#EDEDF3',
    height: '90%',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: {
    backgroundColor: '#EDEDF3',
    height: '90%',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerDragButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 3,
    alignSelf: 'center',
    backgroundColor: '#C4C4CA',
    width: 40,
    height: 5,
    margin: 10,
  },
  headerModalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  answerLabel: {
    color: '#000',
    fontWeight: '500',
    fontSize: 22,
    width: '80%',
  },
  doneLabel: {
    color: '#ff0000',
    fontWeight: '400',
    fontSize: 18,
  },
  questionCard: {
    backgroundColor: '#fff',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 18,
    overflow: 'hidden',
    marginVertical: 5,
  },
  questionSubCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questionLabel: {
    color: '#000',
    width: '80%',
    fontWeight: '600',
    fontSize: 18,
  },
  headerLabel: {
    height: 20,
    alignSelf: 'flex-start',
    marginVertical: 12,
    marginHorizontal: 20,
  },
});
