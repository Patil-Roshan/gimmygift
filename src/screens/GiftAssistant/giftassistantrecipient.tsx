/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import colors from '../../theme/colors';
import {useNavigation, useRoute} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {styles} from './giftassistant.styles.';

interface ListData {
  id: number;
  image: any;
  title: string;
  sub_title: string;
  route?: string;
}

const GiftAssistantRecipient = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const preSelectedRecipient = route?.params?.selectedRecipient;

  console.log('preSelectedRecipient ----->', preSelectedRecipient);

  const assistantOptions: ListData[] = [
    {
      id: 0,
      image: require('../../assets/images/gift_white.png'),
      title: 'Find a gift',
      sub_title:
        'Purchase a gift. You could include a text message or a virtual greeting card',
      route: 'giftquiz',
    },
    {
      id: 1,
      image: require('../../assets/images/outlined_message_white.png'),
      title: 'Send a text message',
      sub_title: 'Just schedule a message',
      route: 'messagequiz',
    },
    {
      id: 2,
      image: require('../../assets/images/greeting_card_white.png'),
      title: 'Send a greeting card',
      sub_title: 'Just send a virtual greeting card',
      route: 'cardquiz',
    },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isChecked, setIsChecked] = useState(false);

  const renderItem = ({item}: {item: {image: any}}) => {
    return (
      <View
        style={{
          width: Dimensions.get('window').width * 0.89,
          marginHorizontal: 5,
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

  const renderListItem = ({item}: {item: ListData}) => {
    return (
      <TouchableOpacity
        style={styles.backgroundContainer}
        onPress={() =>
          navigation.navigate(item.route, {
            selectedRecipient: preSelectedRecipient,
          })
        }>
        <View style={styles.listContainer}>
          <View style={styles.iconTextContainer}>
            <FastImage
              resizeMode="contain"
              source={item.image}
              style={{width: 25, height: 25}}
            />
            <Text style={styles.listHeadText}>{item.title}</Text>
          </View>
          <View style={styles.listHeadSubTextContainer}>
            <Text style={styles.listHeadSubText}>{item.sub_title}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/birhdayBg.png')}
        style={styles.backgroundImage}
        blurRadius={1}>
        <View style={styles.imageContainer}>
          <View style={styles.imageIconContainer}>
            <MaterialCommunityIcons
              onPress={() => navigation.goBack()}
              name="close"
              color={'#fff'}
              size={24}
            />
          </View>
          <View style={styles.imageIconContainer}>
            <MaterialCommunityIcons
              onPress={() => navigation.goBack()}
              name="dots-horizontal"
              color={'#fff'}
              size={24}
            />
          </View>
        </View>
        <View style={styles.container}>
          <View style={styles.imgContainer}>
            <FastImage
              resizeMode="contain"
              source={require('../../assets/images/gift_gradient.png')}
              style={{width: 70, height: 70, paddingVertical: 50}}
            />
            <View style={styles.headTextContainer}>
              <Text style={styles.headTextStyle}>
                What do you want send to {preSelectedRecipient?.full_name}?
              </Text>
              <Text style={styles.headSubTextStyle}>
                Select only one option
              </Text>
            </View>
          </View>
          <View>
            <FlatList
              data={assistantOptions}
              style={{marginBottom: '15%'}}
              keyExtractor={item => item.id.toString()}
              renderItem={renderListItem}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};
export default GiftAssistantRecipient;
