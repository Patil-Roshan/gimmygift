import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import AntDesign from 'react-native-vector-icons/AntDesign';
import colors from '../../theme/colors';
import {useNavigation} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import activeUserInstance from '../../../store/activeUsersInstance';
import Icon from '../../components/Icon';
import {chevronBack} from '../../assets/icons/icons';
export default function FavoriteCategories() {
  const navigation = useNavigation();
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);

  return (
    <ScrollView contentContainerStyle={{backgroundColor: '#ecf0f1'}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          paddingVertical: 10,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon icon={chevronBack} size={30} tintColor={colors.primary} />
        </TouchableOpacity>
        <FastImage
          style={{
            width: 42,
            height: 42,
            marginHorizontal: 10,
            borderRadius: 24,
          }}
          source={{uri: activeUsers[0].profile_image}}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: 25,
            color: '#000',
            fontWeight: '500',
            paddingHorizontal: 10,
            width: '68%',
          }}>
          {activeUsers[0].full_name}
        </Text>
        <Feather name="search" color={colors.primary} size={26} />
      </View>
      <View style={styles.sectionLightTitleDescriptionSecondary}>
        <Text style={styles.section}>Favorite categories</Text>
        <Text style={styles.labelCopy4}>
          Drag the chosen categories in order of preference. Tap on to manage
          the added items. Manage your favorite categories
        </Text>
      </View>
      {/* New View for "Clothings" and Images */}
      <TouchableOpacity
        style={styles.bgField}
        onPress={() => navigation.navigate('directpickmanager')}>
        <View style={styles.clothingsContainer}>
          <Text style={styles.clothingsText}>Clothings</Text>
          {/* Icon on the right corner */}
          <Entypo name="menu" color={'#A9A9A9'} size={25} />
        </View>
        {/* Row of six images */}
        <View style={styles.imageRow}>
          {/* Add your images here */}
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
        </View>
      </TouchableOpacity>
      <View style={styles.bgField}>
        <View style={styles.clothingsContainer}>
          <Text style={styles.clothingsText}>Shoes</Text>
          <Entypo name="menu" color={'#A9A9A9'} size={25} />
        </View>
        <View style={styles.imageRow}>
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
        </View>
      </View>
      <View style={styles.bgField}>
        <View style={styles.clothingsContainer}>
          <Text style={styles.clothingsText}>Bags and accessories</Text>

          <Entypo name="menu" color={'#A9A9A9'} size={25} />
        </View>
        <View style={styles.imageRow}>
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
        </View>
      </View>
      <View style={styles.bgField}>
        <View style={styles.clothingsContainer}>
          <Text style={styles.clothingsText}>Consumer electronics</Text>

          <Entypo name="menu" color={'#A9A9A9'} size={25} />
        </View>
        <View style={styles.imageRow}>
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
          <Image
            style={styles.image}
            source={{
              uri: 'https://picsum.photos/200/300',
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionLightTitleDescriptionSecondary: {
    width: 393,
    height: 116,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  labelCopy4: {
    width: 361,
    height: 54,
    fontFamily: 'SFPro',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
  },
  section: {
    width: 157,
    height: 18,
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
  },
  bgField: {
    width: 361,
    height: 104,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  clothingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clothingsText: {
    fontFamily: 'SFPro',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  icon: {
    width: 24,
    height: 24,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  image: {
    width: 42,
    height: 42,
    borderRadius: 6,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
});
