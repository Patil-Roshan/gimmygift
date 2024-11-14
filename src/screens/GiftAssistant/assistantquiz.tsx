/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';

import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {styles} from './assistantquiz.style';
import DatePicker from 'react-native-date-picker';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';
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

const occasionsData = [
  {id: 1, name: 'Chinese New Year', selected: false},
  {id: 2, name: 'Birthday', selected: false},
  {id: 4, name: 'Retirement', selected: false},
  {id: 5, name: 'Job celebration', selected: false},
  {id: 6, name: 'Christmas', selected: false},
  {id: 7, name: 'Bar Mitzvah', selected: false},
  {id: 8, name: 'Party', selected: false},
  {id: 9, name: 'Wedding', selected: false},
  {id: 10, name: 'Thanksgiving Day', selected: false},
  {id: 11, name: 'Apology', selected: false},
  {id: 12, name: 'Mothers Day', selected: false},
  {id: 13, name: 'Pride', selected: false},
  {id: 14, name: 'Easter', selected: false},
];

const AssistantQuiz = (route: any) => {
  const navigation = useNavigation();

  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  useEffect(() => {
    const fetchData = async () => {
      const recipients = await fetchUserRecipients(activeUsers[0].id);
      if (recipients.length > 0) {
        setRecipients(recipients);
      }
    };
    fetchData();
  }, []);

  const [currentStep, setCurrentStep] = useState(1);
  const [showAnswerModal, setShowAnswerModal] = useState(false);

  const [recipients, setRecipients] = useState<any>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<any>({});

  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [occasions, setOccasions] = useState(occasionsData);
  const [searchOccasions, setSearchOccasions] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [occasionReminder, setOccasionReminder] = useState(false);
  const [birthdate, setBirthdate] = useState(new Date());

  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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
            source={{
              uri: item.profile_image,
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
          <Text style={styles.userName}>{item.full_name}</Text>
          {/* <Text style={styles.userDescription}>{item.description}</Text> */}
        </View>

        <Icon icon={ic_add} size={22} />
      </View>
    </TouchableOpacity>
  );

  const handleContinue = () => {
    if (currentStep === 12) {
      setShowPreviewModal(true);
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const filteredOccasions = occasions.filter(item =>
    item.name.toLowerCase().includes(searchOccasions.toLowerCase()),
  );

  const handleOccasionSelection = (occasion: string) => {
    setSelectedOccasion(occasion);
    occasion === 'Birthday'
      ? setBirthdate(selectedRecipient.birthday)
      : setBirthdate(new Date());
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLView}>
          <AntDesign
            name="close"
            color={colors.black}
            style={{paddingHorizontal: 10}}
            size={25}
            onPress={() => navigation.replace('tabnavigator')}
          />
          <View style={{width: selectedRecipient?.profile_image ? 80 : 40}}>
            <Icon size={38} icon={ic_giftbox} />
            <FastImage
              source={{uri: selectedRecipient?.profile_image}}
              style={{
                width: 38,
                height: 38,
                borderRadius: 20,
                position: 'absolute',
                left: 30,
              }}
            />
          </View>
          <View>
            <Text style={styles.label}>Gift Assistant</Text>
            <Text style={styles.subLabel}>{selectedRecipient?.full_name}</Text>
          </View>
        </View>
        <View style={styles.headerRView}>
          <Entypo name="dots-three-horizontal" color={colors.black} size={25} />
        </View>
      </View>

      {currentStep === 1 && (
        <>
          <Text style={styles.giftLabel}>
            Let’s send a gift to someone. Who is the recipient?
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

          <FlatList
            data={recipients}
            style={{width: '90%', marginBottom: 80}}
            renderItem={renderUserDetails}
            keyExtractor={item => item.id}
          />
        </>
      )}

      {currentStep === 2 && (
        <>
          <Text style={styles.giftLabel}>
            Let’s send a gift to someone. Who is the recipient?
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
                {/* <Text style={styles.userDescription}>
                  {selectedRecipient.description}
                </Text> */}
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
                      {item.name}
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
          <Modal
            isVisible={showDatePicker}
            style={{margin: 0}}
            onBackdropPress={() => setShowDatePicker(false)}>
            <View style={styles.datePickerContainer}>
              <DatePicker
                date={new Date(birthdate)}
                mode="date"
                theme="light"
                onDateChange={(date: any) => setBirthdate(date)}
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
            <TouchableOpacity onPressIn={() => setShowDatePicker(true)}>
              <Input
                value={moment(birthdate).format('MMMM D YYYY')}
                editable={false}
                onPressIn={() => setShowDatePicker(true)}
              />
            </TouchableOpacity>
            {selectedOccasion === 'Birthday' && (
              <Text style={styles.dateNoteLabel}>
                If the selected user already has a GiftProfile, this field will
                be automatically filled.
              </Text>
            )}

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
        <View style={{width: '75%'}}>
          <Button
            label={currentStep === 12 ? 'Surprise Me' : 'Continue'}
            onPress={handleContinue}
          />
        </View>
      </View>
    </View>
  );
};
export default AssistantQuiz;
