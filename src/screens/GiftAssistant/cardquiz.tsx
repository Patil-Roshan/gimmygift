/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  StyleSheet,
  SectionList,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import GradientText from '../../components/GradientText';
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
import {fetchUserRecipients} from '../../lib/supabaseQueries';
import {supabase} from '../../lib/supabase';
import ShimmerPlaceholderVertical from '../../components/ShimmerPlaceholdersVertical';
import contactsInstance from '../../../store/contactsInstance ';
import {occasionsData} from '../../referenceData';
import {config} from '../../config';
import Toast from 'react-native-toast-message';
import scaledSize from '../../scaleSize';

const CardQuiz = () => {
  const navigation = useNavigation<any>();

  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  const userContacts = contactsInstance((state: any) => state.userContacts);
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
  }, [activeUsers]);

  const [currentStep, setCurrentStep] = useState(1);
  const [showAnswerModal, setShowAnswerModal] = useState(false);

  const [recipients, setRecipients] = useState<any>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<any>({});

  const [recipientsHolder, setRecipientsHolder] = useState<any>([]);

  const [contacts, setContacts] = useState<any>(userContacts);

  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [searchOccasions, setSearchOccasions] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [dateType, setDateType] = useState('');

  const [occasionReminder, setOccasionReminder] = useState(false);

  const [birthdate, setBirthdate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  const [cardDetails, setCardDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(new Date());

  const [answers, setAnswers] = useState([
    {
      id: 1,
      question: 'How can I help you?',
      answers: ['Send a greeting card'],
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

  async function listFiles(folder: string) {
    const {data, error} = await supabase.storage
      .from('assets')
      .list(`GREETING_CARDS/${folder}`, {
        limit: 100,
        offset: 0,
      });
    if (error) {
      console.error('Error listing files:', error);
      return [];
    }

    // const fileWithURL = await Promise.all(
    //   data.map(async (file: any) => {
    //     const {data: url} = await supabase.storage
    //       .from('assets')
    //       .createSignedUrl(`GREETING_CARDS/${folder}/${file.name}`, 86400);
    //     return {...file, url: url?.signedUrl};
    //   }),
    // );`

    const staticUrl = `${config.SUPABASE_URL}/storage/v1/object/public/assets/GREETING_CARDS/${folder}/`;
    const fileWithURL = data?.map((item: any) => ({
      id: item?.id,
      name: item?.name,
      url: `${staticUrl}${item.name}`,
    }));

    return fileWithURL;
  }

  const fetchAllFiles = useCallback(async () => {
    console.log('Called---->');

    const folders = [
      'BIRTHDAY',
      'CHRISTMAS',
      'FATHERS_DAY',
      'MOTHERS_DAY',
      'NO_OCCASION',
      'VALENTINES_DAY',
    ];
    const allFiles: any = {};
    for (const folder of folders) {
      const files = await listFiles(folder);
      allFiles[folder] = files;
    }
    return allFiles;
  }, []);

  useEffect(() => {
    fetchAllFiles().then(allFiles => {
      if (allFiles) {
        const formattedSections = formatDataForSectionList(allFiles);
        setCardDetails(allFiles);
        setSections(formattedSections);
        setFilteredCardSections(formattedSections);
      }
    });
  }, [fetchAllFiles]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

  const updateAnswersForId = (id, newValue) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(answer =>
        answer.id === id ? {...answer, answers: [newValue]} : answer,
      ),
    );
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
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const filteredOccasions = occasionsData.filter(item =>
    item.name.toLowerCase().includes(searchOccasions.toLowerCase()),
  );

  const handleOccasionSelection = (occasion: string) => {
    setSelectedOccasion(occasion);
    occasion === 'Birthday'
      ? setBirthdate(selectedRecipient.birthday || new Date())
      : setBirthdate(new Date());
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
  useEffect(() => {
    applyFilters(selectedCategory, searchText);
  }, [selectedCategory, searchText, applyFilters]);

  const applyFilters = useCallback(
    (category, search) => {
      console.log('Applying filters:', category, search); // Add this console log
      let filtered = sections;

      // Apply category filter
      if (category !== 'ALL') {
        if (category === 'OTHER') {
          filtered = filtered.filter(
            section => section.title === 'NO_OCCASION',
          );
        } else {
          filtered = filtered.filter(section => section.title === category);
        }
      }

      // Apply search filter
      if (search) {
        filtered = filtered
          .map(section => ({
            ...section,
            data: section.data.filter(item =>
              item.name.toLowerCase().includes(search.toLowerCase()),
            ),
          }))
          .filter(section => section.data.length > 0);
      }

      setFilteredCardSections(filtered);
    },
    [sections, setFilteredCardSections],
  ); // Include all dependencies
  const renderCategoryLabel = useCallback(
    (label: string) => {
      return (
        <TouchableOpacity
          style={[
            styles.filterContainer,
            {
              backgroundColor:
                selectedCategory === label ? '#d6d6d6' : 'transparent',
            },
          ]}
          onPress={() => {
            setSelectedCategory(label);
            // Remove the direct call to applyFilters here
          }}>
          <Text style={styles.filterLabel}>{label}</Text>
        </TouchableOpacity>
      );
    },
    [selectedCategory],
  );

  const formatDataForSectionList = (cardDetail: any) => {
    return Object.keys(cardDetail).map(key => ({
      title: key,
      data: cardDetail[key],
    }));
  };
  const [sections, setSections] = useState([]);
  const [filteredCardSections, setFilteredCardSections] = useState(sections);

  const handleCardSearch = (text: string) => {
    setSearchText(text);
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
  return (
    <View style={{flex: 1}}>
      <SafeAreaView style={{backgroundColor: 'rgba(249, 249, 249, 0.8)'}} />
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
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
              Let’s send a virtual greeting card to someone. Who is the
              recipient?
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
                onChangeText={text => handleSearch(text)}
                placeholder="Search"
                placeholderTextColor="#rgba(0, 0, 0, 0.5)"
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
              Let’s send a virtual greeting card to someone. Who is the
              recipient?
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
                {filteredOccasions.map((item: any) => {
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
              What is the {selectedOccasion === 'Birthday' ? 'birthday ' : ''}
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
                {selectedOccasion === 'Birthday' ? 'Birthday date' : 'Date'}
              </Text>
              <TouchableOpacity
                onPressIn={() => {
                  setDateType('ODATE');
                  setShowDatePicker(true);
                }}>
                <Input
                  value={moment(birthdate).format('MMMM D YYYY')}
                  editable={false}
                  onPressIn={() => {
                    setDateType('ODATE');
                    setShowDatePicker(true);
                  }}
                />
              </TouchableOpacity>
              {selectedOccasion === 'Birthday' && (
                <Text style={styles.dateNoteLabel}>
                  If the selected user already has a GiftProfile, this field
                  will be automatically filled.
                </Text>
              )}
            </View>
          </>
        )}

        {currentStep === 5 && (
          <>
            <Text style={styles.giftLabel}>
              What is the delivery date and time?
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
              <Text style={styles.dateLabel}>Delivery date and time</Text>
              <TouchableOpacity
                onPress={() => {
                  setDateType('DDATE');
                  setShowDatePicker(true);
                }}>
                <Input
                  value={moment(deliveryDate).format('MMMM D YYYY')}
                  editable={false}
                  onPressIn={() => {
                    setDateType('DDATE');
                    setShowDatePicker(true);
                  }}
                />
              </TouchableOpacity>

              <Text style={[styles.dateLabel, {marginVertical: 30}]}>
                Suggestion
              </Text>
              <View style={styles.reminderBox}>
                <TouchableOpacity
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
                </TouchableOpacity>

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
                    onPress={() => {
                      setDateType('RDATE');
                      setShowDatePicker(true);
                    }}>
                    <Input
                      value={moment(reminderDate).format('MMM D YYYY hh:mm A')}
                      editable={false}
                      onPressIn={() => {
                        setDateType('RDATE');
                        setShowDatePicker(true);
                      }}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}

        {currentStep === 6 && (
          <ScrollView
            contentContainerStyle={{maxWidth: '100%', paddingBottom: '20%'}}>
            <View
              style={{
                backgroundColor: '#fff',
                width: '100%',
                paddingVertical: 20,
              }}>
              <View style={styles.searchContainer}>
                <Feather name="search" color={'#717174'} size={18} />
                <TextInput
                  placeholder="Search occasion, style, color…"
                  style={styles.searchInput}
                  onChangeText={handleCardSearch}
                  placeholderTextColor={'#717174'}
                />
              </View>
            </View>

            <ScrollView
              horizontal
              contentContainerStyle={{
                marginVertical: 10,
                height: 40,
                alignItems: 'center',
              }}>
              {renderCategoryLabel('ALL')}
              {renderCategoryLabel('BIRTHDAY')}
              {renderCategoryLabel('CHRISTMAS')}
              {renderCategoryLabel('OTHER')}
            </ScrollView>

            <View style={styles.newCardContainer}>
              <View
                style={{
                  width: '30%',
                  alignSelf: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('newgreetingcard', {
                      recipient: selectedRecipient,
                      occasion: selectedOccasion,
                      occasionDate: birthdate,
                      reminderDate: occasionReminder ? reminderDate : null,
                      cardURL:
                        'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                    })
                  }
                  style={styles.newCardSubContainer}>
                  <Feather
                    name="plus-circle"
                    color={'rgba(1, 0, 0, 0.3)'}
                    size={20}
                  />
                </TouchableOpacity>
              </View>
              <View style={{width: '80%', justifyContent: 'center'}}>
                <Text style={styles.newCardLabel}>New greeting card</Text>
                <GradientText>Generate with AI</GradientText>
                <Text
                  style={[
                    styles.newCardLabel,
                    {fontSize: 12, fontWeight: 'normal'},
                  ]}>
                  Free • No credit limitations.
                </Text>
              </View>
            </View>

            <SectionList
              sections={filteredCardSections}
              keyExtractor={(item, index) => item.id + index}
              renderItem={({}) => null}
              renderSectionHeader={({section: {title, data}}) => (
                <View style={styles.section}>
                  <View style={styles.header}>
                    <Text style={styles.headerText}>
                      {title?.replace(/_/g, ' ')}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('cardcategory', {
                          type: title?.replace(/_/g, ' '),
                          data: data,
                          recipient: selectedRecipient,
                          occasion: selectedOccasion,
                          occasionDate: birthdate,
                          reminderDate: reminderDate,
                        })
                      }>
                      <Text style={styles.viewAll}>View all</Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <FlatList
                      horizontal
                      data={data.slice(0, Math.ceil(data.length / 2))}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate('newgreetingcard', {
                              recipient: selectedRecipient,
                              occasion: selectedOccasion,
                              occasionDate: birthdate,
                              reminderDate: reminderDate,
                              cardURL: item.url,
                            })
                          }
                          style={styles.item}>
                          <Image
                            source={{uri: item.url}}
                            style={styles.image}
                          />
                        </TouchableOpacity>
                      )}
                      keyExtractor={(item, index) => item.id + index}
                      showsHorizontalScrollIndicator={false}
                    />
                    <FlatList
                      horizontal
                      data={data.slice(Math.ceil(data.length / 2))}
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={styles.item}
                          onPress={() =>
                            navigation.navigate('newgreetingcard', {
                              recipient: selectedRecipient,
                              occasion: selectedOccasion,
                              occasionDate: birthdate,
                              reminderDate: reminderDate,
                              cardURL: item.url,
                            })
                          }>
                          <Image
                            source={{uri: item.url}}
                            style={styles.image}
                          />
                        </TouchableOpacity>
                      )}
                      keyExtractor={(item, index) => item.id + index}
                      showsHorizontalScrollIndicator={false}
                    />
                  </View>
                </View>
              )}
            />
          </ScrollView>
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
              bg={currentStep === 6 ? '#d6d6d6' : colors.primary}
              label={'Continue'}
              onPress={handleContinue}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
export default CardQuiz;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(249, 249, 249, 0.8)',
    height: '8%',
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
    paddingBottom: 29,
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
    height: 0.5,
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
    fontSize: 27,
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
  filterContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginHorizontal: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  filterLabel: {
    fontFamily: 'SFPro',
    fontSize: 15,
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#000000',
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  newCardContainer: {
    width: '100%',
    flexDirection: 'row',
    marginVertical: 5,
    borderTopWidth: 0.2,
    borderBottomWidth: 0.2,
    paddingVertical: 18,
    borderColor: 'rbga(0, 0, 0, 0.05)',
  },
  newCardSubContainer: {
    width: 70,
    height: 90,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  newCardLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
  },
  categoryLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
  },
  cardStyle: {
    width: 140,
    height: 180,
    margin: 10,
    borderRadius: 5,
  },
  wishlistModalLabel: {
    fontSize: 18,
    color: '#000',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  viewAllSection: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-between',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 18,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  viewAll: {
    color: 'red',
  },
  item: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 140,
    height: 180,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d6d6d6',
    borderRadius: 5,
  },
  section: {
    marginBottom: 20,
  },
  headerLabel: {
    height: 20,
    alignSelf: 'flex-start',
    marginVertical: 12,
    marginHorizontal: 20,
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
});
