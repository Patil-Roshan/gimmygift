import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import React from 'react';
import colors from '../../theme/colors';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FastImage from 'react-native-fast-image';
import {
  useNavigation,
  useRoute,
  RouteProp,
  ParamListBase,
} from '@react-navigation/native';
import {RootStackParamList} from '../../types';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import {config} from '../../config';
export default function MessageConfirmation() {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'MessageConfirmation'>>();
  const {name, type, gift_metadata} = route?.params || {};
  const label =
    type === 'TEXT'
      ? 'text message'
      : type === 'PHYSICAL'
      ? 'virtual gift'
      : type === 'GREETING_CARD'
      ? 'greeting card'
      : 'Details';
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <FastImage
        source={require('../../assets/images/done.gif')}
        style={styles.successImage}
      />
      <Text style={styles.title}>Thank you!</Text>
      <Text style={styles.subtitle}>Your request is confirmed.</Text>

      <View style={styles.itemContainer}>
        <View style={styles.dotContainer}>
          <View style={styles.dot} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>
            The {label} for {name} is scheduled
          </Text>
          <Text style={styles.subText}>
            You created a {label} to be manually sent by you in time for the
            occasion
          </Text>
        </View>
      </View>

      <View style={styles.itemContainer}>
        <View style={styles.dotContainer}>
          <View style={styles.dot} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Message reminder</Text>
          <Text style={styles.subText}>
            You will receive an in-app notification to manually send the
            scheduled {label}. Just copy and paste the link you've already
            created for the occasion and send it to the recipient via SMS or
            other messaging apps.
          </Text>
        </View>
      </View>

      <View style={styles.itemContainer}>
        <AntDesign name="infocirlceo" color={'rgba(0, 0, 0, 0.5)'} size={20} />

        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Suggestion for you</Text>
          <Text style={styles.subText}>
            Manage this scheduled gift in your Occasions. Once it's sent, it
            will also appear on the Virtual Gifts page under the Sent section.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.textMsg}
        onPress={() => {
          console.log('gift_metadata', gift_metadata);

          const link =
            type === 'TEXT'
              ? gift_metadata?.message
              : type === 'PHYSICAL'
              ? gift_metadata[0]?.direct_url
              : type === 'GREETING_CARD'
              ? `${config.SUPABASE_URL}/storage/v1/object/public/${gift_metadata?.greeting_card_url}`
              : '';
          Clipboard.setString(link);
          Alert.alert('', 'Details Copied');
          Share.share({
            message: link,
            // url: link,
          });
        }}>
        <Text
          style={{
            color: colors.white,
            fontSize: 18,
            lineHeight: 22,
          }}>
          Copy{' '}
          {type === 'TEXT'
            ? 'Gift Message'
            : type === 'PHYSICAL'
            ? 'Gift Link'
            : type === 'GREETING_CARD'
            ? 'Greeting Card Link'
            : 'Details'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('tabnavigator')}>
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,

    alignItems: 'center',
    padding: 25,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#000',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: '5%',
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  mainText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  subText: {
    fontSize: 14,
    color: '#555',
  },
  button: {
    width: '90%',
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
  },
  successImage: {
    height: 200,
    width: 200,
  },
  dotContainer: {
    height: 22,
    width: 22,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.pastelGreen,
    padding: 6,
  },
  textMsg: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    height: 45,
    borderRadius: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    alignContent: 'center',
    borderWidth: 0.2,
  },
});
