/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Linking,
  ScrollView,
  StatusBar,
} from 'react-native';
import Modal from 'react-native-modal';
import Button from '../../components/Button';
import FastImage from 'react-native-fast-image';
import colors from '../../theme/colors';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './giftassistant.styles.';
import activeUserInstance from '../../../store/activeUsersInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {termsLink} from '../../referenceData';
import Icon from '../../components/Icon';
import {ic_info, ic_share_gray} from '../../assets/icons/icons';
import shareEventLink from '../../branch/shareLinks';
import AssistantLogo from '../../assets/images/AssistantLogo.svg';
interface ListData {
  id: number;
  image: any;
  title: string;
  sub_title: string;
  route?: string;
}

const GiftAssistant = () => {
  const navigation = useNavigation<any>();
  const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  const [showOptionModal, setShowOptionModal] = useState(false);

  useEffect(() => {
    async function checkFirstAccess() {
      const response = await AsyncStorage.getItem('assistant_first_access');
      if (!response || response === 'false') {
        setShowFirstAccessModal(true);
      }
    }
    checkFirstAccess();
  }, []);
  const assistantInfoSlider = [
    {
      id: '1',
      image: require('../../assets/images/assistantPic1.png'),
      text: 'Gift Assistant helps you schedule text messages for special occasions. Receive a reminder to copy the message and send it wherever you want.',
    },
    {
      id: '2',
      image: require('../../assets/images/assistantPic2.png'),
      text: 'Let’s choose a fantastic virtual greeting card to send with a message and your signature inside. The recipient will receive an SMS with a link to open the card in app.',
    },
    {
      id: '3',
      image: require('../../assets/images/assistantPic3.png'),
      text: 'Based on the occasion, relationship and your budget the Gift Assistant will recommend a gift to purchase and send, consulting the recipient’s public wishlist.',
    },
  ];

  const assistantOptions: ListData[] = [
    {
      id: 0,
      image: require('../../assets/images/gift_white.png'),
      title: 'Send a gift',
      sub_title:
        'Purchase a gift for someone and include a text message or a virtual greeting card.',
      route: 'giftquiz',
    },
    {
      id: 1,
      image: require('../../assets/images/outlined_message_white.png'),
      title: 'Schedule a text message',
      sub_title: 'Just schedule a text message for someone.',
      route: 'messagequiz',
    },
    {
      id: 2,
      image: require('../../assets/images/greeting_card_white.png'),
      title: 'Schedule a greeting card',
      sub_title:
        'Just schedule a virtual greeting card for one or multiple recipients.',
      route: 'cardquiz',
    },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isChecked, setIsChecked] = useState(false);

  const renderItem = ({item}: {item: {image: any}}) => {
    return (
      <View
        style={{
          width: Dimensions.get('window').width * 0.9,
          alignSelf: 'center',
        }}>
        <View
          style={{
            width: '98%',
            height: 200,
            alignSelf: 'center',
            justifyContent: 'center',
            borderRadius: 8,
          }}>
          <FastImage
            source={item.image}
            resizeMode="cover"
            style={{
              width: '100%',
              height: 190,
              borderRadius: 8,
            }}
          />
        </View>
      </View>
    );
  };

  const renderIndicator = (index: number) => {
    return (
      <TouchableOpacity
        key={index}
        style={{
          width: 8,
          height: 8,
          borderRadius: 8 / 2,
          marginHorizontal: 5,
          backgroundColor: index === activeIndex ? colors.primary : 'lightgray',
        }}
        onPress={() => setActiveIndex(index)}
      />
    );
  };

  const renderFirstAccessModal = () => {
    return (
      <Modal
        isVisible={showFirstAccessModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowFirstAccessModal(false)}
        onBackdropPress={() => setShowFirstAccessModal(false)}>
        <ScrollView style={styles.modalContainer}>
          <View
            style={{
              width: 40,
              height: 5,
              borderRadius: 3,
              backgroundColor: 'rgba(60, 60, 67, 0.3)',
              margin: 8,
              alignSelf: 'center',
            }}
          />
          <View
            style={{
              borderWidth: 1,
              borderRadius: 8,
              width: 76,
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: 'rgba(0, 0, 0, 0.1)',
              marginTop: '10%',
              padding: 10,
            }}>
            {/* <Image
              style={styles.assistantLogo}
              source={require('../../assets/icons/ic_assistant.png')}
            /> */}
            <AssistantLogo style={{height: 56, width: 56}} />
          </View>

          <Text style={styles.assistantLabel}>Gift Assistant</Text>
          <Text style={styles.descriptionLabel}>
            AI personal assistant service for gifts.
          </Text>

          <FlatList
            data={assistantInfoSlider}
            style={{maxHeight: 220, marginTop: 10, minHeight: 220}}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.id}
            onScroll={event => {
              const contentOffsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(
                contentOffsetX / Dimensions.get('window').width,
              );
              setActiveIndex(index);
            }}
          />
          <View style={styles.indicator}>
            {assistantInfoSlider.map((_, index) => renderIndicator(index))}
          </View>

          <Text style={styles.indicatorLabel}>
            {assistantInfoSlider[activeIndex].text}
          </Text>

          <TouchableOpacity
            onPress={() => setIsChecked(!isChecked)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Entypo
              name="check"
              color={'#fff'}
              size={18}
              style={{
                width: 24,
                height: 24,
                borderWidth: 0.5,
                borderColor: '#000',
                borderRadius: 12,
                textAlign: 'center',
                textAlignVertical: 'center',
                backgroundColor: isChecked ? colors.primary : '#fff',
                overflow: 'hidden',
              }}
            />
            <Text style={{marginLeft: 8, color: '#000'}}>
              Don't show it again next time.
            </Text>
          </TouchableOpacity>

          <Button
            label="Continue"
            width={'100%'}
            onPress={async () => {
              if (isChecked) {
                await AsyncStorage.setItem('assistant_first_access', 'true');
              }
              setShowFirstAccessModal(false);
            }}
          />
          <Text
            style={{
              color: '#a3a3a3',
              textAlign: 'center',
              width: '100%',
              lineHeight: 18,
              paddingBottom: 8,
            }}>
            Gift Assistant is an AI service offered by{' '}
            <Image
              resizeMode="center"
              source={require('../../assets/icons/ic_giftclub.png')}
              style={{width: 20, height: 20}}
            />{' '}
            GimmeGift.
          </Text>
          <Text
            style={{
              color: '#a3a3a3',
              textAlign: 'center',
              width: '100%',
              marginBottom: 10,
            }}>
            By continuing you accept our{' '}
            <Text
              onPress={() => Linking.openURL(termsLink)}
              style={{
                color: colors.primary,
                textAlign: 'center',
                width: '100%',
              }}>
              Conditions.
            </Text>
          </Text>
        </ScrollView>
      </Modal>
    );
  };

  const renderListItem = ({item}: {item: ListData}) => {
    return (
      <TouchableOpacity
        style={styles.backgroundContainer}
        onPress={() => navigation.navigate(item.route)}>
        <View style={styles.iconTextContainer}>
          <FastImage
            resizeMode="contain"
            source={item.image}
            style={{width: 24, height: 24}}
          />
          <Text style={styles.listHeadText}>{item.title}</Text>
        </View>
        <View>
          <Text style={styles.listHeadSubText}>{item.sub_title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderOptionsModal = () => {
    return (
      <Modal
        isVisible={showOptionModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowOptionModal(false)}>
        <ScrollView
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 10,
            borderRadius: 15,
            backgroundColor: '#fff',
            paddingHorizontal: 25,
            paddingVertical: 25,
          }}>
          <TouchableOpacity
            onPress={() => {
              shareEventLink(
                'Gift Assistant by GimmeGift - Send a direct link to your friends ',
                'giftassistant',
                'giftassistant',
              );
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Icon icon={ic_share_gray} size={24} />
            <Text style={{fontSize: 18, color: '#000', paddingHorizontal: 10}}>
              Share assistant
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowOptionModal(false);
              setTimeout(() => {
                setShowFirstAccessModal(true);
              }, 600);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Icon icon={ic_info} size={24} />
            <Text style={{fontSize: 18, color: '#000', paddingHorizontal: 10}}>
              Read more
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderFirstAccessModal()}
      {renderOptionsModal()}
      <ImageBackground
        source={require('../../assets/images/birhdayBg.png')}
        style={styles.backgroundImage}
        blurRadius={1}>
        <View style={{marginHorizontal: 20, flex: 1}}>
          <View style={styles.imageContainer}>
            <View style={styles.imageIconContainer}>
              <MaterialCommunityIcons
                onPress={() => navigation.goBack()}
                name="close"
                color={'#ffffff'}
                size={24}
              />
            </View>
            <View style={styles.imageIconContainer}>
              <MaterialCommunityIcons
                onPress={() => setShowOptionModal(true)}
                name="dots-horizontal"
                color={'#ffffff'}
                size={24}
              />
            </View>
          </View>
          <View>
            <View style={styles.imgContainer}>
              <FastImage
                resizeMode="contain"
                source={require('../../assets/images/gift_gradient.png')}
                style={{width: 74, height: 74, marginBottom: 14}}
              />
              <View style={styles.headTextContainer}>
                <Text style={styles.headTextStyle}>
                  Hi {activeUsers[0]?.full_name}, I’m your Gift Assistant.
                </Text>
                <Text style={styles.headTextStyle}>How can I help you?</Text>

                <Text style={styles.headSubTextStyle}>
                  Select only one option
                </Text>
              </View>
            </View>
            <View>
              <FlatList
                data={assistantOptions}
                style={{marginBottom: '30%'}}
                keyExtractor={item => item.id.toString()}
                renderItem={renderListItem}
              />
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
export default GiftAssistant;
