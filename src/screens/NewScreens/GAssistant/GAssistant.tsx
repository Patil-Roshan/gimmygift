import {
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import colors from '../../../theme/colors';
import Icon from '../../../components/Icon';
import {ic_back, ic_searchprofile} from '../../../assets/icons/icons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {G} from 'react-native-svg';

const GAssistant = () => {
  const [price, setPrice] = useState(249);
  const [zip, setZip] = useState('');
  const [priceAT, setPriceAT] = useState('');
  const [gcAmount, setGcAmount] = useState('');
  return (
    <ScrollView style={styles.container}>
      <StatusBar
        backgroundColor={colors.gray.light}
        barStyle={'dark-content'}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 30,
          borderBottomWidth: 1,
          backgroundColor: colors.gray.light,
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <MaterialCommunityIcons name="close" color={'#000'} size={30} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 10,
            }}>
            <Image
              source={require('../../../assets/icons/ic_assistant.png')}
              style={{width: 45, height: 45, marginRight: -10}}
            />
            <ImageBackground
              source={require('../../../assets/images/user_jhon.png')}
              style={{width: 45, height: 45}}
            />
          </View>
          <View style={{marginLeft: 8}}>
            <Text
              style={{
                color: colors.black,
                fontSize: 20,
                lineHeight: 24,
                fontWeight: '600',
              }}>
              Gift Assistant
            </Text>
            <Text
              style={{
                color: colors.fontSubColor,
                fontSize: 16,
                lineHeight: 16,
              }}>
              Jhon Truman
            </Text>
          </View>
        </View>
        <Entypo name="dots-three-horizontal" color={'#000'} size={30} />
      </View>

      <View
        style={{
          padding: 20,
          borderBottomWidth: 1,
          flex: 1,
          alignItems: 'center',
          flexDirection: 'row',
          gap: 12,
          backgroundColor: colors.gray.light,
        }}>
        <Image
          source={require('../../../assets/icons/ic_kidsprofile.png')}
          style={{width: 40, height: 40}}
        />
        <Text style={{color: colors.black, fontSize: 16, paddingRight: 14}}>
          Enter the price of the gift you have chosen which amount to $249{' '}
        </Text>
      </View>

      <View style={{margin: 36}}>
        <Text
          style={{
            color: colors.black,
            fontSize: 25,
            lineHeight: 28,
            fontWeight: '600',
            textAlign: 'center',
          }}>
          What is the amount of your GiftCard?
        </Text>
        <Text
          style={{
            color: colors.black,
            fontSize: 16,
            lineHeight: 18,
            textAlign: 'center',
            marginTop: 18,
          }}>
          Complete the required field.
        </Text>
      </View>

      <View style={styles.card}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            margin: 8,
            padding: 10,
            justifyContent: 'space-between',
            backgroundColor: colors.white,
          }}>
          <Image
            source={require('../../../assets/images/gimmyGiftCards.png')}
            style={{width: 124, height: 35}}
          />
          <Text style={{color: colors.black, fontSize: 28}}>$249</Text>
        </View>
        <View
          style={{
            justifyContent: 'space-between',
            height: 125,
            borderWidth: 1,
            borderColor: 'red',
            margin: 4,
            backgroundColor: colors.primary,
            borderRadius: 12,
          }}>
          <View style={styles.cardNumber}>
            <Text>● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●</Text>
            <View style={styles.cardDetail}>
              <View style={{paddingRight: 20}}>
                <Text>CVC</Text>
                <Text>● ● ● </Text>
              </View>
              <View style={{paddingLeft: 20}}>
                <Text>CARD EXPIRES</Text>
                <Text>● ● / ● ●</Text>
              </View>
              <Image
                source={require('../../../assets/images/visa.png')}
                style={{height: 40, width: 100, marginLeft: 70, marginTop: 10}}
              />
            </View>
          </View>
        </View>
      </View>

      {/* form */}
      <View style={{marginHorizontal: 20, marginTop: 40}}>
        <Text style={styles.formTitle}>Gift price</Text>
        <TextInput
          style={styles.inputField}
          onChangeText={setPrice}
          value={price}
          placeholder="Enter price"
          placeholderTextColor={colors.lineColor}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.zip}>
        <View style={{marginHorizontal: 20, marginTop: 40, width: '41%'}}>
          <Text style={styles.formTitle}>Zip code</Text>
          <TextInput
            style={styles.inputField}
            onChangeText={setZip}
            value={zip}
            placeholder="Enter zip code"
            placeholderTextColor={colors.lineColor}
            keyboardType="numeric"
          />
        </View>
        <View style={{marginHorizontal: 20, marginTop: 40, width: '41%'}}>
          <Text style={styles.formTitle}>Price with taxes</Text>
          <TextInput
            style={styles.inputField}
            onChangeText={setPriceAT}
            value={priceAT}
            placeholder="- -"
            placeholderTextColor={colors.lineColor}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={{marginHorizontal: 20, marginTop: 40}}>
        <Text style={styles.formTitle}>GiftCard amount</Text>
        <TextInput
          style={styles.inputField}
          onChangeText={setGcAmount}
          value={gcAmount}
          placeholder="Enter price"
          placeholderTextColor={colors.lineColor}
          keyboardType="numeric"
        />
      </View>

      <View style={{marginHorizontal: 20, marginVertical: 60}}>
        <Text style={styles.formTitle}>Details</Text>
        <View style={styles.summary}>
          <View style={styles.row}>
            <Text style={styles.txt}>GiftCard amount</Text>
            <Text style={styles.txt}>${gcAmount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.txt}>Platform fee</Text>
            <Text style={styles.txt}>-</Text>
          </View>
          <View style={[styles.row, {marginTop: 24}]}>
            <Text
              style={[
                styles.txt,
                {fontWeight: '500', fontSize: 24, lineHeight: 24},
              ]}>
              Total to Pay
            </Text>
            <Text
              style={[
                styles.txt,
                {fontWeight: '500', fontSize: 24, lineHeight: 24},
              ]}>
              -
            </Text>
          </View>
        </View>

        <View style={{paddingHorizontal: 16}}>
          <Text style={styles.txt2}>
            The recipient will receive a link via sms or email to complete the
            purchase of chosen gift or redeem the amount, requesting a payment
            transfer to a personal PayPal or bank account.{'\n'}
          </Text>
          <Text style={styles.txt2}>
            A platform fee of 2.5% on the selected amount will automatically be
            added to the total to be paid. No further costs will be charged to
            the recipient even if they choose to proceed with the transfer of
            the amount to a personal account.
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.iconBtn}>
          <Image
            source={require('../../../assets/icons/ic_answers.png')}
            style={{width: 23, height: 23, tintColor: colors.black}}
          />
        </View>
        <View style={styles.iconBtn}>
          <Image
            source={require('../../../assets/icons/ic_back.png')}
            style={{width: 23, height: 23, tintColor: colors.black}}
          />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: '#faabaf',
          }}>
          <TouchableOpacity
            onPress={() => {
              console.log('Clicked!!');
            }}>
            <Text
              style={{
                textAlign: 'center',
                verticalAlign: 'middle',
                fontSize: 18,
              }}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default GAssistant;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pageBg,
  },
  header: {
    backgroundColor: colors.pageBg,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.16,
    borderWidth: 1,
  },
  headerText: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.black,
    fontWeight: '600',
  },
  card: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  cardNumber: {
    flex: 1,
    padding: 20,
  },
  cardDetail: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 24,
  },
  formTitle: {
    fontSize: 18,
    lineHeight: 18,
    color: colors.black,
  },
  inputField: {
    color: colors.black,
    borderWidth: 0,
    paddingHorizontal: 10,
    fontSize: 18,
    lineHeight: 22,
    marginTop: 14,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  zip: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summary: {
    borderWidth: 0.2,
    paddingHorizontal: 10,
    marginVertical: 20,
    borderRadius: 8,
    gap: 6,
    paddingVertical: 14,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txt: {
    fontSize: 16,
    lineHeight: 18,
    color: colors.black,
  },
  txt2: {
    fontSize: 14,
    lineHeight: 18,
    color: colors.fontSubColor,
  },
  bottom: {
    padding: 20,
    borderTopWidth: 0.2,
    borderColor: colors.fontSubColor,
    backgroundColor: colors.white,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    backgroundColor: colors.gray.medium,
    padding: 9,
    borderRadius: 8,
  },
});
