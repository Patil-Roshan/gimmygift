import React, {useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  SectionList,
} from 'react-native';
import colors from '../../theme/colors';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import Icon from '../../components/Icon';
import {ic_bell, ic_notification_mail} from '../../assets/icons/icons';

const CardComponent = ({title, subTitle, icon, onPress}) => (
  <TouchableOpacity style={styles.bg} onPress={onPress}>
    <Image source={icon} style={styles.profile} tintColor="#848484" />
    <View style={styles.textContainer}>
      <Text style={styles.headerText}>{title}</Text>
      <Text style={styles.multiLineText}>{subTitle}</Text>
    </View>
    <Image
      source={require('../../assets/icons/chevronRight.png')}
      style={styles.arrow}
    />
    <View style={styles.divider} />
  </TouchableOpacity>
);

export default function NotificationSettings() {
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [selectedType, setShowSelectedType] = useState('');

  const handleNotificationSetting = async (type: string) => {
    setShowSelectedType(type);
    setShowSettingModal(true);
  };

  const sections = [
    {
      title: 'For you',
      data: [
        {
          title: 'Virtual Gifts',
          subTitle: 'Push and email',
          icon: require('../../assets/icons/ic_birthday_profile.png'),
        },
        {
          title: 'Preferences quiz',
          subTitle: 'Push',
          icon: require('../../assets/icons/ic_quiz_profile.png'),
        },
        {
          title: 'Gimme Pick',
          subTitle: 'Push',
          icon: require('../../assets/icons/ic_pick_profile.png'),
        },
        {
          title: 'Gift Funds',
          subTitle: 'Push',
          icon: require('../../assets/icons/ic_giftfund.png'),
        },
        {
          title: 'Wishlist',
          subTitle: 'Push',
          icon: require('../../assets/icons/ic_wishlist_ot.png'),
        },
      ],
    },
    {
      title: 'Reminders',
      data: [
        {
          title: 'GiftProfiles',
          subTitle: 'Push',
          icon: require('../../assets/icons/ic_giftprofiles.png'),
        },
        {
          title: 'Birthdays',
          subTitle: 'Push',
          icon: require('../../assets/icons/ic_birthdate.png'),
        },
        {
          title: 'Other occasions',
          subTitle: 'Push',
          icon: require('../../assets/icons/ic_occasions.png'),
        },
      ],
    },
    {
      title: 'GiftClub',
      data: [
        {
          title: 'Suggested items',
          subTitle: 'Push',
          icon: require('../../assets/icons/ic_suggestedItems.png'),
        },
        {
          title: 'Payment transfers',
          subTitle: 'Push',
          icon: require('../../assets/icons/ic_payment_transfer.png'),
        },
        {
          title: 'App suggestions',
          subTitle: 'Push',
          icon: require('../../assets/icons/ic_app_suggestions.png'),
        },
      ],
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <Modal
        isVisible={showSettingModal}
        style={styles.modal}
        onBackButtonPress={() => setShowSettingModal(false)}
        onBackdropPress={() => setShowSettingModal(false)}>
        <ScrollView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedType}</Text>
            <Text
              onPress={() => setShowSettingModal(false)}
              style={styles.modalDone}>
              Done
            </Text>
          </View>
          <Text style={styles.modalDescription}>
            Get notified about new virtual gifts you received from other users.
          </Text>
          <TouchableOpacity style={[styles.cards, styles.cardTop]}>
            <Icon icon={ic_bell} size={24} tintColor="#3b3b3b" />
            <Text style={[styles.btnLabel, styles.btnLabelWidth]}>Push</Text>
            <Switch
              style={styles.switch}
              trackColor={{false: '#767577', true: colors.primary}}
              thumbColor={colors.white}
              ios_backgroundColor="#a9a8ab"
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cards, styles.cardBottom]}>
            <Icon icon={ic_notification_mail} size={24} tintColor="#3b3b3b" />
            <Text style={[styles.btnLabel, styles.btnLabelWidth]}>Email</Text>
            <Switch
              style={styles.switch}
              trackColor={{false: '#767577', true: colors.primary}}
              thumbColor={colors.white}
              ios_backgroundColor="#a9a8ab"
            />
          </TouchableOpacity>
          <Text style={styles.modalFooter}>
            Even if you disable the notification options, GimmeGift may still
            send you important notifications in the app, via email or via text
            message.
          </Text>
        </ScrollView>
      </Modal>

      <FastImage
        source={require('../../assets/images/notification_settings.png')}
        resizeMode="contain"
        style={styles.fastImage}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.title + index}
        renderItem={({item}) => (
          <CardComponent
            title={item.title}
            subTitle={item.subTitle}
            icon={item.icon}
            onPress={() => handleNotificationSetting(item.title)}
          />
        )}
        renderSectionHeader={({section: {title}}) => (
          <View style={styles.autoView1}>
            <Text style={styles.text}>{title}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    backgroundColor: '#ecf0f1',
  },
  modal: {
    margin: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalContent: {
    height: '90%',
    width: '100%',
    backgroundColor: '#efeff4',
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 12,
    bottom: 0,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: 'SFPro',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 27,
    color: '#000000',
    marginTop: 25,
    marginBottom: 40,
  },
  modalDone: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 27,
    color: colors.primary,
    marginTop: 25,
  },
  modalDescription: {
    width: '100%',
    fontFamily: 'SFPro',
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 22,
    color: '#848484',
    marginBottom: 10,
  },
  modalFooter: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 13,
    padding: 8,
    fontWeight: '400',
  },
  autoView1: {
    backgroundColor: 'rgb(239, 239, 244)',
    width: '100%',
    height: 46,
    justifyContent: 'center',
  },
  text: {
    textAlign: 'left',
    marginLeft: 20,
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(60, 60, 67, 0.6)',
  },
  bg: {
    width: '100%',
    height: 70,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profile: {
    width: 26,
    height: 26,
    margin: 15,
  },
  textContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#000000',
  },
  arrow: {
    width: 22,
    height: 22,
    position: 'absolute',
    right: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  multiLineText: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    color: 'rgba(0, 0, 0, 0.5)',
    paddingTop: 4,
  },
  cards: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 5,
    zIndex: 1,
  },
  cardTop: {
    marginTop: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  cardBottom: {
    marginTop: -4,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  btnLabel: {
    fontSize: 16,
    color: colors.black,
    padding: 8,
    fontWeight: '400',
  },
  btnLabelWidth: {
    width: '75%',
  },
  switch: {
    transform: [{scaleX: 1}, {scaleY: 1}],
    alignSelf: 'center',
    paddingVertical: 5,
  },
  fastImage: {
    width: '90%',
    height: 200,
    alignSelf: 'center',
    marginTop: 20,
  },
});
