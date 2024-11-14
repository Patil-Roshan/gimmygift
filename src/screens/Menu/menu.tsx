/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {styles} from './menu.style';
import colors from '../../theme/colors';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../components/Button';
import activeUserInstance from '../../../store/activeUsersInstance';
import {UserInterface} from '../../types';
import {chevronBack, ic_back, ic_searchprofile} from '../../assets/icons/icons';
import Icon from '../../components/Icon';
interface ListItem {
  id: number;
  image: any;
  title: string;
}
interface EndList {
  id: number;
  image: any;
  title: string;
  sub_title: string;
}
interface UserList {
  id: number;
  image: any;
  full_name: string;
  relation: string;
  profile_image: string;
}

const Menu = (navigation: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(0);
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);

  const giftingOptions: ListItem[] = [
    {
      id: 0,
      image: require('../../assets/images/gift.png'),
      title: 'Find a Gift',
    },
    {
      id: 1,

      image: require('../../assets/images/greeting_card.png'),
      title: 'Send Greeting Card',
    },
    {
      id: 2,
      image: require('../../assets/images/text_message.png'),
      title: 'Send Text Message',
    },
  ];
  const optionsList: EndList[] = [
    {
      id: 0,
      image: require('../../assets/images/gift_blue.png'),
      title: 'Virtual Gifts',
      sub_title: 'Open received and sent virtual gifts.',
    },
    {
      id: 1,
      image: require('../../assets/images/prefrence_quiz.png'),
      title: 'Preferences Quiz',
      sub_title: 'Answer questions about you.',
    },
    {
      id: 2,
      image: require('../../assets/images/gimmi_pick.png'),
      title: 'GimmePick',
      sub_title: 'Add fav items to your GiftProfile. ',
    },
    {
      id: 3,
      image: require('../../assets/images/setting.png'),
      title: 'Settings',
      sub_title: 'Account, preferences, notifications… ',
    },
  ];

  const renderUserList = ({item}: {item: UserList; index: number}) => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedUser(item.id)}
        style={styles.userListContainer}>
        <View style={styles.userListLeftContainer}>
          <FastImage
            // source={item.image}
            source={
              item.profile_image
                ? {uri: item.profile_image}
                : require('../../assets/images/user_placeholder.png')
            }
            style={{
              width: 35,
              height: 35,
              borderWidth: 0.5,
              borderColor: '#000',
              borderRadius: 17,
            }}
          />
          <Text style={styles.userListTextStyle}>
            {item.full_name}
            {item.relation ? ' (' + item.relation + ')' : ''}
          </Text>
        </View>
        <View style={styles.userListRightContainer}>
          {selectedUser === item.id ? (
            <Ionicons name="checkmark-sharp" size={20} color={colors.primary} />
          ) : (
            <></>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleOptions = (title: string) => {
    switch (title) {
      case 'Virtual Gifts':
        navigation.navigation.navigate('VirtualGiftList');
        break;
      case 'Preferences Quiz':
        navigation.navigation.navigate('quiz');
        break;
      case 'GimmePick':
        navigation.navigation.navigate('gimmepick');
        break;
      case 'Settings':
        navigation.navigation.navigate('settings');
        break;

      case 'Find a Gift':
        navigation.navigation.navigate('giftquiz');
        break;
      case 'Send Greeting Card':
        navigation.navigation.navigate('cardquiz');
        break;
      case 'Send Text Message':
        navigation.navigation.navigate('messagequiz');
        break;

      default:
        break;
    }
  };
  const renderBottomList = ({item}: {item: EndList; index: number}) => {
    return (
      <TouchableOpacity
        style={styles.endListContainer}
        onPress={() => handleOptions(item.title)}>
        <View style={styles.endListSubContainer}>
          <View style={styles.endListLeftContainer}>
            <FastImage
              resizeMode="contain"
              source={item.image}
              style={{width: 50, height: 50}}
            />
            <View style={styles.endListLeftSubContainer}>
              <Text style={styles.endListTitleText}>{item.title}</Text>
              <Text style={styles.endListSubTitleText}>{item.sub_title}</Text>
            </View>
          </View>
          <View style={styles.endListIconContainer}>
            <Ionicons
              name="chevron-forward"
              size={25}
              color={colors.gray.medium}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const renderActionList = ({item}: {item: ListItem; index: number}) => {
    return (
      <TouchableOpacity
        style={styles.actionListContainer}
        onPress={() => handleOptions(item.title)}>
        <View style={styles.actionTitleContainer}>
          <Text style={styles.actionTitleStyle}>{item.title}</Text>
        </View>
        <View style={styles.actionImgContainer}>
          <FastImage
            resizeMode="contain"
            source={item.image}
            style={styles.actionImgStyle}
          />
        </View>
      </TouchableOpacity>
    );
  };
  const renderUserItem = ({
    item,
    index,
  }: {
    item: UserInterface;
    index: number;
  }) => {
    return (
      <View style={styles.userContainer}>
        <View>
          <FastImage
            source={
              item.profile_image
                ? {uri: item.profile_image}
                : require('../../assets/images/user_placeholder.png')
            }
            style={styles.profileImage}
          />
          <TouchableOpacity
            onPress={() => {
              setModalVisible(true);
            }}>
            {index === 0 && (
              <FastImage
                source={require('../../assets/images/arraow_down.png')}
                style={styles.subImage}
              />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{item?.full_name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{backgroundColor: colors.white}} />
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={styles.header_left}>
          <TouchableOpacity onPress={() => navigation.navigation.goBack()}>
            <Icon icon={chevronBack} size={30} tintColor={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.header_text}>Menu</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigation.navigate('search')}>
          <Icon icon={ic_searchprofile} size={30} tintColor={colors.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.listItemContainer}>
          <Text style={styles.listItemHeaderText}>Quick Choices</Text>
          <FlatList data={activeUsers} renderItem={renderUserItem} horizontal />
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <TouchableOpacity
            style={styles.modalContainer}
            onPress={() => {
              setModalVisible(false);
            }}>
            <View style={styles.modalContent}>
              <View>
                <FlatList
                  data={activeUsers}
                  renderItem={renderUserList}
                  style={styles.actionList}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 25,
                  paddingVertical: 5,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: colors.gray.medium,
                    borderRadius: 50,
                    padding: 3,
                  }}>
                  <Ionicons
                    name="add-sharp"
                    size={20}
                    color={colors.gray.dark}
                  />
                </View>
                <Text
                  onPress={() => {
                    setModalVisible(false);
                    navigation.navigation.navigate('registrationkids');
                  }}
                  style={{
                    fontWeight: '500',
                    color: colors.black,
                    paddingLeft: 10,
                  }}>
                  Create a GiftProfile for your kids
                </Text>
              </View>
              <View style={styles.btnView}>
                <Button
                  // onPress={handleContinue}
                  width={'100%'}
                  bg={colors.gray.medium}
                  fontColor={colors.primary}
                  label={'Logout'}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
        <View style={styles.horizontalLine} />
        <View style={styles.listItemContainer}>
          <Text style={{...styles.listItemHeaderText, paddingHorizontal: 10}}>
            For Someone
          </Text>
          <FlatList
            data={giftingOptions}
            renderItem={renderActionList}
            // horizontal
            numColumns={3}
            style={styles.actionList}
          />
          {/* Gift Assistant */}
          <View style={styles.assistantContainer}>
            <FastImage
              resizeMode="cover"
              source={require('../../assets/images/bgField.png')}
              style={{width: '100%', height: 60, borderRadius: 10}}
            />
            <TouchableOpacity
              style={styles.assistantSubContainer}
              onPress={() => navigation.navigation.navigate('giftassistant')}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <FastImage
                  resizeMode="contain"
                  source={require('../../assets/images/gift_gradient.png')}
                  style={{width: 35, height: 35}}
                />
                <Text style={styles.assistantTextStyle}>Gift Assistant</Text>
              </View>
              <View>
                <FastImage
                  resizeMode="contain"
                  source={require('../../assets/images/arrow_right.png')}
                  style={{width: 35, height: 35}}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.horizontalLine} />
        <View style={styles.listItemContainer}>
          <Text style={{...styles.listItemHeaderText, paddingHorizontal: 10}}>
            For You
          </Text>
          <FlatList
            data={optionsList}
            renderItem={renderBottomList}
            style={styles.endList}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Menu;
