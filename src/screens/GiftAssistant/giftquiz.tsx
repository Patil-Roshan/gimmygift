/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import {WebView} from 'react-native-webview';
import Modal from 'react-native-modal';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DatePicker from 'react-native-date-picker';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from '../../components/Icon';
import Slider from 'rn-range-slider';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import activeUserInstance from '../../../store/activeUsersInstance';
import {
  fetchUserRecipients,
  generateRandomString,
} from '../../lib/supabaseQueries';
import ConfettiCannon from 'react-native-confetti-cannon';
import Clipboard from '@react-native-clipboard/clipboard';

const generationOption = [
  {id: 1, name: '1', selected: false},
  {id: 2, name: '2', selected: false},
  {id: 4, name: '3', selected: false},
  {id: 5, name: '4', selected: false},
  {id: 6, name: '5', selected: false},
  {id: 7, name: '6', selected: false},
  {id: 8, name: '7', selected: false},
  {id: 9, name: '8', selected: false},
];

const GiftQuiz = () => {
  const navigation = useNavigation<any>();
  const confettiRef = useRef(null);
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  const userContacts = contactsInstance((state: any) => state.userContacts);

  const localEvents = localInstance((state: any) => state.localEvents);
  const setLocalEvents = localInstance((state: any) => state.setLocalEvents);

  const [selectedGeneration, setSelectedGeneration] = useState('');

  const [lowValue, setLowValue] = useState(400);
  const [highValue, setHighValue] = useState(2500);

  const [showGiftModal, setShowGiftModal] = useState(false);
  const [wrappers, setWrappers] = useState([]);

  const [answers, setAnswers] = useState([
    {
      id: 1,
      question: 'How can I help you?',
      answers: ['Send a gift'],
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
      question: 'What is the delivery date?',
      answers: [],
    },
    {
      id: 6,
      question: 'Gift Budget',
      answers: [],
    },
    {
      id: 7,
      question: 'Gift options to generate',
      answers: [],
    },
    {
      id: 8,
      question: 'Selected Gifts',
      answers: [],
    },
    {
      id: 9,
      question: 'Send Virtual Gift ?',
      answers: [],
    },
  ]);

  const fetchGiftOptions = useCallback(async () => {
    const {data: giftOpt, error} = await supabase.functions.invoke(
      'get-gift-recommendations',
      {
        body: {
          sendee: {
            id: activeUsers[0].user_id,
          },
          priceRange: {
            minPrice: lowValue,
            maxPrice: highValue,
          },
          numRecommendations: parseInt(selectedGeneration || '1', 10),
        },
      },
    );
    if (!error && giftOpt) {
      const uniqueGiftOptions = giftOpt?.products?.map(
        (option: any, index: number) => ({
          ...option,
          id: index,
        }),
      );
      setGiftOptions(uniqueGiftOptions);
    }
  }, [activeUsers, highValue, lowValue, selectedGeneration]);

  const fetchWrappers = async () => {
    const {data, error} = await supabase.storage
      .from('assets')
      .list('WRAPPERS', {
        limit: 100,
        offset: 0,
      });
    if (error) {
      console.error('Error listing files:', error);
      return [];
    }

    const staticUrl = `${config.SUPABASE_URL}/storage/v1/object/public/assets/WRAPPERS/`;
    const wrappedData = data?.map((item: any) => ({
      ...item,
      url: `${staticUrl}${item.name}`,
    }));

    if (wrappedData) {
      setWrappers(wrappedData);
    }
  };

  const route = useRoute();
  const preSelectedRecipient = route?.params?.selectedRecipient;

  const [isStepSet, setIsStepSet] = useState(false);

  useEffect(() => {
    if (preSelectedRecipient && !isStepSet) {
      setSelectedRecipient(preSelectedRecipient);
      setCurrentStep(3);
      updateAnswersForId(2, preSelectedRecipient.full_name);
      setIsStepSet(true);
    }
    const fetchData = async () => {
      fetchGiftOptions();
      setIsLoading(true);
      const recipients = await fetchUserRecipients(activeUsers[0].user_id);

      if (recipients.length > 0) {
        setRecipients(recipients);
        setRecipientsHolder(recipients);
      }
      setIsLoading(false);
    };
    fetchData();
    fetchWrappers();
  }, [activeUsers, fetchGiftOptions, preSelectedRecipient, isStepSet]);

  const [currentStep, setCurrentStep] = useState(1);
  const [showAnswerModal, setShowAnswerModal] = useState(false);

  const [giftOptions, setGiftOptions] = useState([]);

  const [recipients, setRecipients] = useState<any>([]);
  const [recipientsHolder, setRecipientsHolder] = useState<any>([]);

  const [contacts, setContacts] = useState<any>(userContacts);
  const [selectedRecipient, setSelectedRecipient] = useState({});

  const [selectedOccasion, setSelectedOccasion] = useState('');
  const [occasions, setOccasions] = useState(occasionsData);
  const [searchOccasions, setSearchOccasions] = useState('');
  const [wrapperBgColour, setWrapperBgColour] = useState('');

  const [generation, setGeneration] = useState(generationOption);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [occasionReminder, setOccasionReminder] = useState(false);
  const [birthdate, setBirthdate] = useState(new Date());
  const [sendVirtualGift, setSendVirtualGift] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [dateType, setDateType] = useState('');
  const [selectedWrapper, setSelectedWrapper] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [reminderDate, setReminderDate] = useState(new Date());
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

  const handleContinue = async () => {
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
      updateAnswersForId(6, `${lowValue}-${highValue}`);
    }
    if (currentStep === 7) {
      updateAnswersForId(7, selectedGeneration);
    }
    if (currentStep === 7) {
      if (selectedGeneration === '') {
        Toast.show({
          type: 'error',
          text2: 'Please specify the number of options you want',
          text1: 'Please select an option',
          position: 'bottom',
        });
        return;
      }
      await fetchGiftOptions();
    }

    if (currentStep === 8) {
      if (giftOptions?.filter(option => option?.selected).length < 1) {
        Toast.show({
          type: 'error',
          text1: 'Please select at least one gift',
          position: 'bottom',
        });
        return;
      }
    }
    updateAnswersForId(
      8,
      giftOptions?.filter(option => option?.selected).length,
    );
    if (currentStep === 9) {
      if (sendVirtualGift === 'No') {
        handleSubmit();
        return;
      }
    }
    updateAnswersForId(9, sendVirtualGift);
    if (currentStep === 12) {
      handleSubmit();
      return;
    }
    setCurrentStep(currentStep + 1);
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

  const handleSubmit = async () => {
    const items = giftOptions.filter((item: any) => item.selected);
    const uniqueID = await generateRandomString();
    if (selectedRecipient?.type === 'contact') {
      const giftObject = {
        id: uniqueID,
        start_datetime: birthdate,
        created_by_user_id: activeUsers[0].user_id,
        event_type: selectedOccasion,
        user_id: activeUsers[0].user_id,
        gift_metadata: items.map((item: any) => ({
          id: item.id,
          _id: item._id,
          name: item.name,
          url: item.url,
          direct_url: item.direct_url,
          image: item.image,
          price: item.price,
          merchant: item.merchant,
          wrapper: selectedWrapper?.url,
          giftBackgroundColor: wrapperBgColour,
        })),
        gift_type: 'PHYSICAL',
        event_category: 'LOCAL',
        full_name: selectedRecipient?.full_name,
      };
      //store giftObject on setLocalEvents with existing localEvents
      let localGifts = [...localEvents, giftObject];
      setLocalEvents(localGifts);
      navigation.replace('messageconfirmation', {
        name: selectedRecipient?.full_name,
        type: 'PHYSICAL',
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
      const {data: giftData, error: giftError} = await supabase
        .schema('gift')
        .from('gift_transactions')
        .insert([
          {
            sendee_user_id: selectedRecipient?.user_id,
            user_id: activeUsers[0].user_id,
            gift_metadata: items.map((item: any) => ({
              id: item.id,
              _id: item._id,
              name: item.name,
              url: item.url,
              direct_url: item.direct_url,
              image: item.image,
              price: item.price,
              merchant: item.merchant,
              wrapper: selectedWrapper?.url,
              giftBackgroundColor: wrapperBgColour,
            })),
            gift_type: 'PHYSICAL',
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
              'You have received a new gift from ' + activeUsers[0].full_name,
            user_id: selectedRecipient?.user_id,
            scheduled_at: reminderDate,
            notification_metadata: {id: eventData[0].event_id},
          };
          const notification2 = {
            auth_id: activeUsers[0].auth_id,
            body:
              'You have scheduled a gift for ' + selectedRecipient?.full_name,
            user_id: activeUsers[0].user_id,
            scheduled_at: reminderDate,
            notification_metadata: {id: eventData[0].event_id},
          };
          await Promise.all([
            supabase
              .schema('notification')
              .from('notifications')
              .insert([notification1]),
            supabase
              .schema('notification')
              .from('notifications')
              .insert([notification2]),
          ]);
        }

        if (!eventGiftError) {
          navigation.replace('messageconfirmation', {
            name: selectedRecipient?.full_name,
            type: 'PHYSICAL',
            gift_metadata: items,
          });
        }
      }
    }
  };

  const handleValueChange = (low: number, high: number) => {
    setLowValue(low);
    setHighValue(high);
  };

  const filteredOccasions = occasions.filter(item =>
    item.name.toLowerCase().includes(searchOccasions.toLowerCase()),
  );

  const selectedGiftOptions = async (id: string) => {
    const updatedGiftOptions = giftOptions.map((option: any) => {
      if (option.id === id) {
        return {...option, selected: !option.selected};
      }
      return option;
    });
    await setGiftOptions(updatedGiftOptions);
  };

  const btnSelection = (label: string) => {
    return (
      <TouchableOpacity
        onPress={() => setSendVirtualGift(label)}
        style={[
          styles.btn,
          {
            backgroundColor:
              sendVirtualGift === label ? 'rgba(0, 0, 0, 0.5)' : '#fff',
          },
        ]}>
        <Text
          style={[
            styles.btnLabel,
            {color: sendVirtualGift === label ? '#fff' : '#000'},
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRail = useCallback(() => <View style={styles.rail} />, []);

  const renderRailSelected = useCallback(
    () => <View style={styles.railSelected} />,
    [],
  );

  const renderThumb = () => {
    return <View style={styles.thumbIcon} />;
  };

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [favicon, setFavicon] = useState('');
  const [loading, setLoading] = useState(true);

  const handleWebViewMessage = event => {
    const data = JSON.parse(event.nativeEvent.data);

    if (data.title) {
      setTitle(data.title);
    }
    if (data.url) {
      setUrl(data.url);
    }
    if (data.favicon) {
      setFavicon(data.favicon);
    }
  };

  const injectedJavaScript = `
    (function() {
      function getFavicon() {
        var favicon = '';
        var nodeList = document.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
        var sizes = [];
        
        nodeList.forEach(function(link) {
          if (link.href) {
            var size = link.getAttribute('sizes');
            if (size) {
              sizes.push({ size: parseInt(size.split('x')[0], 10), href: link.href });
            } else {
              sizes.push({ size: 16, href: link.href }); // Default to 16 if no size specified
            }
          }
        });

        if (sizes.length > 0) {
          sizes.sort(function(a, b) { return b.size - a.size; }); // Sort by size descending
          favicon = sizes[0].href; // Use the largest available icon
        }

        if (!favicon) {
          // Try common favicon locations if no <link> tag is found
          favicon = window.location.origin + '/favicon.ico';
        }
        
        return favicon;
      }

      function sendMetadata() {
        const metadata = {
          title: document.title,
          url: window.location.href,
          favicon: getFavicon()
        };
        window.ReactNativeWebView.postMessage(JSON.stringify(metadata));
      }

      sendMetadata();
      window.addEventListener('load', sendMetadata);
      window.addEventListener('popstate', sendMetadata);
    })();
  `;

  const renderAddressModal = () => {
    return (
      <Modal
        isVisible={showAddressModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowAddressModal(false)}>
        <View
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 0,
            height: 480,
            backgroundColor: '#fff',
          }}>
          <FastImage
            source={{
              uri: selectedRecipient?.profile_image,
            }}
            resizeMode="cover"
            style={{
              height: 80,
              width: 80,
              alignSelf: 'center',
              marginVertical: 25,
              borderRadius: 40,
            }}
          />

          <Text
            style={{
              fontFamily: 'SFPro',
              fontSize: 26,
              fontWeight: '500',
              fontStyle: 'normal',
              letterSpacing: 0,
              textAlign: 'center',
            }}>
            {selectedRecipient?.full_name}’s address
          </Text>

          <Text
            style={{
              fontFamily: 'SFPro',
              fontSize: 17,
              fontWeight: 'normal',
              fontStyle: 'normal',
              lineHeight: 22,
              letterSpacing: 0,
              textAlign: 'center',
              color: 'rgba(0, 0, 0, 0.7)',
              marginVertical: 10,
            }}>
            Copy and enter this address in the shipping address fields required
            by the store.
          </Text>

          <View
            style={{
              backgroundColor: '#f1f1f1',
              width: '90%',
              alignSelf: 'center',
              padding: 15,
              margin: 10,
              paddingVertical: 40,
              borderRadius: 8,
            }}>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 18,
                fontWeight: 'normal',
                fontStyle: 'normal',
                lineHeight: 27,
                letterSpacing: 0,
                color: '#000000',
              }}>
              {selectedRecipient?.profile_address?.profile_address?.address}
            </Text>
            <TouchableOpacity
              onPress={() =>
                Clipboard.setString(
                  selectedRecipient?.profile_address?.profile_address?.address,
                )
              }
              style={{position: 'absolute', right: 12, bottom: 12}}>
              <MaterialCommunityIcons
                name="content-copy"
                size={20}
                color="#000000"
              />
            </TouchableOpacity>
          </View>

          <Button
            label="Done"
            width={'90%'}
            onPress={() => setShowAddressModal(false)}
          />
        </View>
      </Modal>
    );
  };

  const renderPreviewModal = () => {
    return (
      <Modal
        isVisible={showPreviewModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowPreviewModal(false)}>
        <View
          style={{
            width: '100%',
            position: 'absolute',
            bottom: 0,
            height: '100%',
            backgroundColor: wrapperBgColour || '#fff',
            padding: 10,
            paddingTop: '12%',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <FastImage
              source={{
                uri: selectedRecipient?.profile_image,
              }}
              resizeMode="cover"
              style={{
                height: 40,
                width: 40,
                marginVertical: 25,
                borderRadius: 40,
                borderWidth: 1,
                borderColor: '#d6d6d6',
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
              source={
                activeUsers[0]?.profile_image
                  ? {uri: activeUsers[0]?.profile_image}
                  : require('../../assets/images/user_placeholder.png')
              }
              resizeMode="cover"
              style={{
                height: 40,
                width: 40,
                marginVertical: 25,
                borderRadius: 40,
              }}
            />

            <MaterialCommunityIcons
              onPress={() => setShowPreviewModal(false)}
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
            Gift to {selectedRecipient?.full_name}
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
            By {activeUsers[0]?.full_name}
          </Text>

          <ConfettiCannon
            count={250}
            origin={{x: -10, y: 0}}
            autoStart={false}
            explosionSpeed={450}
            ref={confettiRef}
          />

          {showGift ? (
            <TouchableOpacity
              style={{zIndex: -1}}
              onPress={() => {
                console.log(
                  'selGift: ',
                  giftOptions.find(option => option.selected)?.image,
                );

                setShowGift(!showGift);
              }}>
              <FastImage
                source={{
                  uri: giftOptions.find(option => option.selected)?.image || '',
                }}
                resizeMode="cover"
                style={{
                  height: 330,
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
                source={{uri: selectedWrapper?.url}}
                style={{
                  height: 330,
                  width: '100%',
                  alignSelf: 'center',
                  marginVertical: 25,
                  borderRadius: 40,
                  overflow: 'hidden',
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
          )}

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
            {showGift
              ? giftOptions.find(option => option.selected)?.familyname || ''
              : 'Tap to unwrap'}
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
              {selectedOccasion} • Scheduled{' '}
              {moment(birthdate).format('MMMM D, YYYY')}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

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

  const renderGiftOptionModal = () => {
    return (
      <Modal
        isVisible={showGiftModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowGiftModal(false)}
        onBackdropPress={() => setShowGiftModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.headerDragButton} />

          <View style={styles.headerModalContainer}>
            <Text style={styles.answerLabel}>
              Purchased Gifts{'\n'}
              <Text style={[styles.answerLabel, {fontWeight: '300'}]}>
                Your gift will be shipped by the seller, within the specified
                timeframe.
              </Text>
            </Text>

            <Text
              onPress={() => setShowGiftModal(false)}
              style={styles.doneLabel}>
              Done
            </Text>
          </View>
          <ScrollView>
            {giftOptions
              ?.filter(option => option?.selected)
              ?.map((item: any) => (
                <View key={item?.question} style={styles.questionCard}>
                  <View style={styles.questionSubCard}>
                    <Text style={styles.questionLabel}>{item?.name}</Text>
                  </View>
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

  return (
    <View style={{flex: 1}}>
      <SafeAreaView style={{backgroundColor: 'rgba(249, 249, 249, 0.8)'}} />
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {renderPreviewModal()}
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
                onChangeText={text => handleSearch(text)}
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
            <Text style={styles.giftLabel}>
              What is your budget for this gift?
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
              <Text style={styles.dateLabel}>Price point</Text>
              <Text style={styles.budgetLabel}>
                Indicate your budget, by selecting a minimum and maximum.
              </Text>

              <View style={styles.priceContainer}>
                <View style={styles.priceInputContainer}>
                  <View style={styles.priceInputBox}>
                    <Text style={styles.priceLabel}>Min</Text>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.currencyLabel}>$</Text>
                      <TextInput
                        keyboardType="numeric"
                        maxLength={5}
                        defaultValue={lowValue.toString()}
                        onChangeText={text =>
                          setLowValue(parseInt(text || 0, 10))
                        }
                        returnKeyType="done"
                        style={{
                          fontSize: 24,
                          width: '85%',
                          color: '#000',
                          height: 35,
                          padding: 0,
                        }}
                      />
                    </View>
                  </View>

                  <View style={styles.priceInputBox}>
                    <Text style={styles.priceLabel}>Max</Text>
                    <View style={{flexDirection: 'row'}}>
                      <Text style={styles.currencyLabel}>$</Text>
                      <TextInput
                        keyboardType="numeric"
                        maxLength={5}
                        defaultValue={highValue.toString()}
                        returnKeyType="done"
                        style={{
                          fontSize: 24,
                          width: '85%',
                          color: '#000',
                          height: 35,
                          padding: 0,
                        }}
                        onChangeText={text =>
                          setHighValue(parseInt(text || 0, 10))
                        }
                      />
                    </View>
                  </View>
                </View>

                <Slider
                  disableRange={false}
                  style={{marginVertical: 20}}
                  low={lowValue}
                  high={highValue}
                  max={9999}
                  min={1}
                  onValueChanged={handleValueChange}
                  renderRail={renderRail}
                  renderRailSelected={renderRailSelected}
                  renderThumb={renderThumb}
                  step={1}
                  renderNotch={renderRailSelected}
                />
              </View>

              <Text style={styles.dateNoteLabel}>
                Only products falling within the selected range will be
                suggested. Products that slightly exceed the chosen budget may
                also be displayed.
              </Text>
            </View>
          </>
        )}

        {currentStep === 7 && (
          <>
            <Text style={styles.giftLabel}>
              How many gift options would you like me to generate for you?
            </Text>
            <Text style={[styles.giftSubLabel, {marginBottom: 30}]}>
              Select only one option.
            </Text>

            <View style={{height: '67%'}}>
              <ScrollView contentContainerStyle={styles.listContainer}>
                {generation.map(item => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedGeneration(item.name);
                      }}
                      key={item.id}
                      style={[
                        styles.listItem,
                        {
                          backgroundColor:
                            selectedGeneration === item.name
                              ? '#77777A'
                              : '#fff',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.listLabel,
                          {
                            color:
                              selectedGeneration === item.name
                                ? '#fff'
                                : '#000',
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

        {currentStep === 8 && (
          <>
            <Modal
              isVisible={showWebView}
              style={{margin: 0}}
              onBackdropPress={() => setShowWebView(false)}>
              <SafeAreaView
                style={{
                  flex: 1,
                }}>
                <View
                  style={{
                    backgroundColor: '#fff',
                    flexDirection: 'row',
                    paddingVertical: 15,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <MaterialCommunityIcons
                    onPress={() => setShowWebView(false)}
                    name="close"
                    color={colors.primary}
                    size={26}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 12,
                      textAlign: 'center',
                      textAlignVertical: 'center',
                      overflow: 'hidden',
                      paddingVertical: 3,
                    }}
                  />
                  <View
                    style={{
                      width: '70%',
                      alignSelf: 'center',
                      marginHorizontal: 12,
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: '#000000',
                      }}
                      numberOfLines={1}>
                      {title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: '#000000',
                        marginTop: 2,
                      }}
                      numberOfLines={1}>
                      {url}
                    </Text>
                  </View>

                  <Entypo
                    onPress={() => navigation.goBack()}
                    name="dots-three-horizontal"
                    color={colors.primary}
                    size={26}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 12,
                      textAlign: 'center',
                      textAlignVertical: 'center',
                      overflow: 'hidden',
                      paddingVertical: 3,
                    }}
                  />
                </View>
                {loading && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      zIndex: 1,
                    }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                )}
                <WebView
                  source={{uri: selectedProduct?.direct_url}}
                  style={{flex: 1}}
                  onMessage={handleWebViewMessage}
                  injectedJavaScript={injectedJavaScript}
                  onLoadStart={() => setLoading(true)}
                  onLoadEnd={() => setLoading(false)}
                />

                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: colors.primary,
                    padding: 10,
                    paddingVertical: 15,
                    alignItems: 'center',
                  }}>
                  <FastImage
                    source={{uri: favicon}}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      overflow: 'hidden',
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: '#fff',

                      width: '70%',
                      paddingHorizontal: 10,
                    }}
                    numberOfLines={2}>
                    Once you complete your gift purchase, tap here to continue.
                  </Text>

                  <TouchableOpacity
                    onPress={() => setShowWebView(false)}
                    style={{
                      width: 85,
                      height: 31,
                      borderRadius: 16,
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'SFPro',
                        fontSize: 16,
                        fontWeight: '600',
                        fontStyle: 'normal',
                        lineHeight: 18,
                        letterSpacing: 0,
                        textAlign: 'center',
                        color: '#fff',
                      }}
                      numberOfLines={2}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Modal>

            {renderAddressModal()}
            {renderGiftOptionModal()}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                width: '100%',
                backgroundColor: '#fff',
                alignItems: 'center',
                paddingHorizontal: 10,
              }}
              onPress={() => setShowAddressModal(true)}>
              <FastImage
                source={{
                  uri: selectedRecipient?.profile_image,
                }}
                resizeMode="cover"
                style={{
                  height: 30,
                  width: 30,
                  alignSelf: 'center',
                  marginVertical: 10,
                  borderRadius: 15,
                }}
              />
              <Text
                style={{
                  fontFamily: 'SFPro',
                  fontSize: 13,
                  fontWeight: 'normal',
                  fontStyle: 'normal',
                  lineHeight: 16,
                  letterSpacing: 0,
                  paddingHorizontal: 8,
                }}>
                View the recipient's address to send your gift.
              </Text>
            </TouchableOpacity>
            <View
              style={{
                width: '100%',
                backgroundColor: '#EDEDF3',
                alignItems: 'center',
              }}>
              <Text style={styles.giftLabel}>
                🎉 I found some great gift options. Choose the gift!
              </Text>
              <Text style={[styles.giftSubLabel, {marginBottom: 30}]}>
                Purchase one or multiple gifts.
              </Text>
            </View>

            <View style={{height: '56%'}}>
              <FlatList
                numColumns={2}
                data={giftOptions}
                style={{marginBottom: scaledSize(70)}}
                renderItem={({item}: any) => {
                  return (
                    <TouchableOpacity
                      key={Date.now()}
                      onPress={() => {
                        setSelectedProduct(item);
                        setShowWebView(true);
                      }}
                      style={{
                        width: giftOptions?.length === 1 ? '100%' : '50%',
                        borderWidth: 0.5,
                        borderColor: '#d6d6d6',
                        paddingHorizontal: 10,
                      }}>
                      <Entypo
                        name="dots-three-horizontal"
                        color={'rgba(0, 0, 0, 0.5)'}
                        size={20}
                        style={{
                          position: 'absolute',
                          left: 18,
                          top: 25,
                          zIndex: 1,
                          backgroundColor: '#fff',
                          borderRadius: 15,
                          padding: 4,
                          overflow: 'hidden',
                        }}
                      />
                      <FastImage
                        source={{
                          uri: item.image,
                        }}
                        resizeMode="cover"
                        style={{
                          height: 125,
                          width: '100%',
                          alignSelf: 'center',
                          marginVertical: 15,
                        }}
                      />
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: 'SFPro',
                          fontSize: 12,
                          fontWeight: 'normal',
                          fontStyle: 'normal',
                          lineHeight: 18,
                          letterSpacing: 0,
                          color: '#848484',
                        }}>
                        {item.merchant}
                      </Text>

                      <Text
                        numberOfLines={2}
                        style={{
                          fontFamily: 'SFPro',
                          fontSize: 14,
                          fontWeight: '500',
                          fontStyle: 'normal',
                          lineHeight: 16,
                          letterSpacing: 0,
                          color: '#000000',
                          paddingVertical: 5,
                        }}>
                        {item.name}
                      </Text>

                      <Text
                        style={{
                          fontFamily: 'SFPro',
                          fontSize: 14,
                          fontWeight: 'normal',
                          fontStyle: 'normal',
                          lineHeight: 18,
                          letterSpacing: 0,
                          color: '#000000',
                        }}>
                        ${item.price}
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          selectedGiftOptions(item.id);
                        }}
                        style={{
                          flexDirection: 'row',
                          paddingVertical: 15,
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            fontFamily: 'SFPro',
                            fontSize: 16,
                            fontWeight: 'normal',
                            fontStyle: 'normal',
                            color: item.selected
                              ? '#ff0000'
                              : 'rgba(0, 0, 0, 0.5)',
                          }}>
                          {item.selected ? 'Selected option' : 'Select option'}
                        </Text>
                        <Entypo
                          name="plus"
                          color={colors.white}
                          size={15}
                          style={{
                            backgroundColor: item.selected
                              ? '#ff0000'
                              : '#a3a3a3',
                            borderRadius: 12,
                            overflow: 'hidden',
                            padding: 5,
                          }}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
            {giftOptions?.filter(option => option?.selected).length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setShowGiftModal(true);
                }}
                style={{
                  flexDirection: 'row',
                  bottom: scaledSize(70),
                  width: '100%',
                  height: 50,
                  backgroundColor: '#EDEDF3',
                  alignItems: 'center',
                  padding: 15,
                }}>
                <Image
                  tintColor={'#d6d6d6'}
                  style={{
                    width: 30,
                    height: 30,
                    padding: 15,
                    marginHorizontal: 5,
                    backgroundColor: '#717174',
                    borderRadius: 15,
                  }}
                  source={require('../../assets/icons/ic_gift.png')}
                />
                <Text
                  style={[
                    styles.giftSubLabel,
                    {textAlign: 'left', fontWeight: '600'},
                  ]}>
                  {giftOptions?.filter(option => option?.selected).length} gift
                  purchased
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {currentStep === 9 && (
          <>
            <Text style={styles.giftLabel}>
              Would you like to send a Virtual Gift to{' '}
              {selectedRecipient?.full_name}?
            </Text>
            <Text style={styles.giftSubLabel}>Select only one option.</Text>
            <View style={{marginVertical: 35}} />
            {btnSelection('Yes')}
            {btnSelection('No')}
          </>
        )}

        {currentStep === 10 && (
          <>
            <Text style={styles.giftLabel}>
              Which wrapping do you want to use for this Virtual Gift?
            </Text>
            <Text style={styles.giftSubLabel}>Select only one option.</Text>
            <View style={{marginVertical: 35}} />
            <View style={{height: '67%'}}>
              <FlatList
                numColumns={2}
                data={wrappers}
                style={{marginBottom: '25%'}}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      onPress={() => setSelectedWrapper(item)}
                      style={{
                        width: '50%',
                        borderWidth: 0.5,
                        borderColor: '#d6d6d6',
                        paddingHorizontal: 10,
                        backgroundColor:
                          selectedWrapper?.id === item?.id ? '#a3a3a3' : '#fff',
                        borderRadius: 10,
                      }}>
                      <FastImage
                        source={{
                          uri: item.url,
                        }}
                        resizeMode="cover"
                        style={{
                          height: 170,
                          width: '100%',
                          alignSelf: 'center',
                          marginVertical: 15,
                          borderRadius: 10,
                        }}
                      />
                    </TouchableOpacity>
                  );
                }}
                keyExtractor={item => item.id?.toString()}
              />
            </View>
          </>
        )}

        {currentStep === 11 && (
          <>
            <Text style={styles.giftLabel}>
              What color would you like for the background of this Virtual Gift?
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
                value={searchOccasions}
              />
            </View>

            <View style={{height: '67%'}}>
              <ScrollView contentContainerStyle={styles.listContainer}>
                {[
                  {id: 1, name: 'Red', color: '#FF0000'},
                  {id: 2, name: 'Orange', color: '#FFC000'},
                  {id: 3, name: 'Yellow', color: '#e6cc90'},
                  {id: 4, name: 'Blue', color: '#0000FF'},
                  {id: 4, name: 'Pink', color: '#FF00FF'},
                ].map(item => {
                  return (
                    <TouchableOpacity
                      onPress={() => setWrapperBgColour(item.color)}
                      key={item.id}
                      style={[
                        styles.listItem,
                        {
                          backgroundColor:
                            wrapperBgColour === item.color ? '#77777A' : '#fff',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.listLabel,
                          {
                            color:
                              wrapperBgColour === item.color ? '#fff' : '#000',
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

        {currentStep === 12 && (
          <>
            <Text style={styles.giftLabel}>
              Here is a preview of the link that will be sent to Jhon.
            </Text>
            <Text style={styles.giftSubLabel}>
              Tap on the preview to open it.
            </Text>
            <TouchableOpacity
              onPress={() => setShowPreviewModal(true)}
              style={{
                width: '90%',
                backgroundColor: wrapperBgColour,
                height: 240,
                borderRadius: 15,
                marginVertical: 25,
                alignItems: 'center',
              }}>
              <ImageBackground
                source={{
                  uri: selectedWrapper?.url,
                }}
                style={{
                  height: 150,
                  width: 150,
                  backgroundColor: '#000',
                  marginTop: 20,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                <Image
                  source={require('../../assets/images/ribbon.png')}
                  style={{height: '100%', width: '100%'}}
                />
              </ImageBackground>

              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: 60,
                  backgroundColor: '#C8C8D3',
                  borderBottomLeftRadius: 15,
                  borderBottomRightRadius: 15,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  padding: 15,
                }}>
                <Text style={styles.giftSubLabel}>
                  Gift by {activeUsers[0]?.full_name}
                </Text>
                <Text style={[styles.giftSubLabel, {fontSize: 10}]}>
                  gimmegift.com
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.giftSubLabel}>
              Tap on the preview to open it. You will receive a notification
              confirming delivery.
            </Text>
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
              label={currentStep === 11 ? 'Confirm' : 'Continue'}
              onPress={handleContinue}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
export default GiftQuiz;

import {Platform, StyleSheet} from 'react-native';
import {supabase} from '../../lib/supabase';
import ShimmerPlaceholderVertical from '../../components/ShimmerPlaceholdersVertical';
import {occasionsData} from '../../referenceData';
import contactsInstance from '../../../store/contactsInstance ';
import {config} from '../../config';
import localInstance from '../../../store/localEventsInstance';
import Toast from 'react-native-toast-message';
import scaledSize from '../../scaleSize';

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
    height: scaledSize(100),
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
