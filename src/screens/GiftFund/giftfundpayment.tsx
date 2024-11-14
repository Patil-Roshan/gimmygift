/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import React, {useState} from 'react';
import colors from '../../theme/colors';
import {useNavigation, useRoute} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Entypo from 'react-native-vector-icons/Entypo';
import {supabase} from '../../lib/supabase';
import Toast from 'react-native-toast-message';
import activeUserInstance from '../../../store/activeUsersInstance';
import {
  StripeProvider,
  useStripe,
  usePlatformPay,
} from '@stripe/stripe-react-native';
import {config} from '../../config';

import {termsLink} from '../../referenceData';
export default function Giftfundpayment() {
  //get variable from previous screen
  //declare route variable
  const route = useRoute();

  const navigation = useNavigation();
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);

  const {amount, fund_id, title} = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [customerID, setCustomerID] = useState('');

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

  const createPaymentRequest = async () => {
    const {data: userData} = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', activeUsers[0].user_id)
      .eq('user_type', 'NORMAL');

    const {error} = await supabase
      .schema('gift')
      .from('gift_fund_contributions')
      .insert([
        {
          third_party_payment_reference_id: 0,
          third_party_payment_system: 'STRIPE',
          gift_fund_id: fund_id,
          contributor_id: userData?.[0]?.user_id,
          amount: amount,
        },
      ]);

    const {data: giftFundData, error: giftFundError} = await supabase
      .schema('gift')
      .from('gift_funds')
      .select('current_amount')
      .eq('gift_fund_id', fund_id)
      .single();

    const newAmount =
      (giftFundData?.current_amount || 0) + parseFloat(amount || 0);

    await supabase
      .schema('gift')
      .from('gift_funds')
      .update({
        current_amount: newAmount,
      })
      .eq('gift_fund_id', fund_id);
    console.log('error', error);
    if (!error) {
      Toast.show({
        type: 'success',
        text1: 'Payment Successful',
        position: 'bottom',
      });
      navigation.goBack();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        position: 'bottom',
      });
    }
  };

  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const initializePaymentSheet = async () => {
    if (selectedPaymentMethod === '') {
      Toast.show({
        type: 'error',
        text1: 'Please select a payment method',
        position: 'bottom',
      });
      return;
    }
    setIsLoading(true);
    generatePaymentIntent();
    //TO DO //Retrieve customer_id from supabase table
    let customer_id = '';
    //Check for existing customer with customer_id
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${config.STRIPE_SECRET_KEY}`);

    const requestOptions: any = {
      method: 'GET',
      headers: headers,
      redirect: 'follow',
    };

    fetch(`https://api.stripe.com/v1/customers/${customer_id}`, requestOptions)
      .then(response => response.json())
      .then(result => setCustomerID(result?.id))
      .catch(error => console.error(error));
  };

  const generatePaymentIntent = async () => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Authorization', `Bearer ${config.STRIPE_SECRET_KEY}`);

    const data: any = {
      amount: amount * 100,
      currency: 'usd',
    };

    const formBody = Object.keys(data)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');

    const requestOptions: any = {
      method: 'POST',
      headers: headers,
      body: formBody,
      redirect: 'follow',
    };

    fetch('https://api.stripe.com/v1/payment_intents', requestOptions)
      .then(response => response.json())
      .then(async result => {
        if (result && result?.client_secret) {
          if (selectedPaymentMethod === 'card') {
            const {error} = await initPaymentSheet({
              merchantDisplayName: 'GimmeGift',
              appearance: {
                colors: {
                  primary: colors.primary,
                },
              },
              customerId: '',
              //TO DO //change to customerID retrieved from supabase
              // customerId: customerID,
              // customerEphemeralKeySecret: '',
              paymentIntentClientSecret: result?.client_secret,
              returnURL: 'https://www.gimmegift.com',
            });

            console.log('error-->', error);

            if (!error) {
              openPaymentSheet();
            }
          }
          if (selectedPaymentMethod === 'applepay') {
            pay(result?.client_secret);
          }
          if (selectedPaymentMethod === 'gpay') {
            pay(result?.client_secret);
          }
          if (selectedPaymentMethod === 'paypal') {
            setIsLoading(false);
            Toast.show({
              type: 'error',
              text1: 'Payment method currently not supported',
              position: 'bottom',
            });
          }
        } else {
          setIsLoading(false);
          Toast.show({
            type: 'error',
            text1: 'Unable to process payment',
            text2: 'Please try again',
            position: 'bottom',
          });
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error('E->', error);
      });
  };

  const openPaymentSheet = async () => {
    try {
      const {error} = await presentPaymentSheet();
      console.log('error-->', error);
      if (!error) {
        Toast.show({
          type: 'success',
          text1: 'Payment Successful',
          position: 'bottom',
        });
        createPaymentRequest();
      } else {
        setIsLoading(false);
        if (error?.code === 'Canceled') {
          Toast.show({
            type: 'error',
            text1: 'Payment Canceled',
            position: 'bottom',
          });
        }
      }
    } catch (e) {
      console.log('error--->', e);
    }
  };
  const {confirmPlatformPayPayment} = usePlatformPay();

  const pay = async (clientSecret: any) => {
    const {error} = await confirmPlatformPayPayment(clientSecret, {
      googlePay: {
        testEnv: true,
        merchantName: 'GimmeGift',
        merchantCountryCode: 'US',
        currencyCode: 'USD',
        billingAddressConfig: {
          isPhoneNumberRequired: true,
          isRequired: true,
        },
      },
      applePay: {
        merchantCountryCode: 'US',
        currencyCode: 'USD',
        cartItems: [
          {
            label: 'GimmeGift',
            amount: amount,
            paymentType: 'Immediate',
          },
        ],
      },
    });

    if (error) {
      console.log('error--->', error);

      Toast.show({
        type: 'error',
        text1: 'Unable to process payment',
        text2: 'Please try again',
        position: 'bottom',
      });
      setIsLoading(false);
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'Payment Successful',
      position: 'bottom',
    });
    createPaymentRequest();
  };

  return (
    <StripeProvider
      publishableKey={config.STRIPE_PUBLIC_KEY}
      merchantIdentifier="merchant.com.gimmegift"
      urlScheme="https://www.gimmegift.com">
      <ScrollView
        style={{
          flex: 1,

          paddingHorizontal: 15,
          marginTop: 50,
        }}>
        {/* <Text
        style={{
          fontFamily: 'SFPro',
          fontSize: 18,
          fontWeight: '500',
          fontStyle: 'normal',
          lineHeight: 18,
          letterSpacing: 0,
          color: '#000000',
        }}>
        Greeting card
      </Text> */}

        {/* <View style={[styles.newLabelText, {marginTop: 20}]}>
        <MaterialCommunityIcons
          name="plus-circle-outline"
          color={colors.primary}
          size={26}
          style={styles.headerIcons}
        />
        <Text style={[styles.btnLabel, {color: colors.primary, width: '100%'}]}>
          Text Message
        </Text>
      </View> */}

        <Text
          style={{
            fontFamily: 'SFPro',
            fontSize: 18,
            fontWeight: '500',
            fontStyle: 'normal',
            lineHeight: 18,
            letterSpacing: 0,
            color: '#000000',
            marginTop: 30,
          }}>
          Details and costs
        </Text>

        <View style={[styles.newLabelText, {marginTop: 20}]}>
          <Text style={[styles.btnLabel, {width: '85%', fontSize: 14}]}>
            Amount for Gift Fund ({title})
          </Text>
          <Text style={styles.btnLabel}>${amount}</Text>
        </View>

        <View style={[styles.newLabelText, {marginTop: 1}]}>
          <Text
            style={[
              styles.btnLabel,
              {width: '85%', fontSize: 18, fontWeight: '600'},
            ]}>
            Total to pay
          </Text>
          <Text style={[styles.btnLabel, {fontWeight: '600', fontSize: 18}]}>
            ${amount}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: 'SFPro',
            fontSize: 18,
            fontWeight: '500',
            fontStyle: 'normal',
            lineHeight: 18,
            letterSpacing: 0,
            color: '#000000',
            marginTop: 30,
          }}>
          Price point
        </Text>
        <View
          style={{
            backgroundColor: '#fff',
            padding: 5,
            justifyContent: 'center',
            borderRadius: 10,
            marginTop: 20,
          }}>
          {Platform.OS === 'ios' && (
            <View style={styles.payContainer}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: 10,
                }}
                onPress={() => setSelectedPaymentMethod('applepay')}>
                <Entypo
                  name="check"
                  color={'#fff'}
                  size={18}
                  style={[
                    styles.checkIcon,
                    {
                      backgroundColor:
                        selectedPaymentMethod === 'applepay'
                          ? colors.primary
                          : '#fff',
                    },
                  ]}
                />
              </TouchableOpacity>
              <FastImage
                source={require('../../assets/images/apple_pay.png')}
                style={{width: 48, height: 32, marginHorizontal: 10}}
              />
              <Text style={styles.payLabel}>Apple Pay</Text>
            </View>
          )}

          {Platform.OS === 'android' && (
            <View style={styles.payContainer}>
              <TouchableOpacity
                onPress={() => setSelectedPaymentMethod('gpay')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: 10,
                }}>
                <Entypo
                  name="check"
                  color={'#fff'}
                  size={18}
                  style={[
                    styles.checkIcon,
                    {
                      backgroundColor:
                        selectedPaymentMethod === 'gpay'
                          ? colors.primary
                          : '#fff',
                    },
                  ]}
                />
              </TouchableOpacity>
              <FastImage
                source={require('../../assets/images/gpay.png')}
                style={{width: 48, height: 32, marginHorizontal: 10}}
              />
              <Text style={styles.payLabel}>Google Pay</Text>
            </View>
          )}

          <View style={styles.payContainer}>
            <TouchableOpacity
              onPress={() => setSelectedPaymentMethod('card')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
              }}>
              <Entypo
                name="check"
                color={'#fff'}
                size={18}
                style={[
                  styles.checkIcon,
                  {
                    backgroundColor:
                      selectedPaymentMethod === 'card'
                        ? colors.primary
                        : '#fff',
                  },
                ]}
              />
            </TouchableOpacity>
            <FastImage
              source={require('../../assets/images/card.png')}
              style={{width: 48, height: 32, marginHorizontal: 10}}
            />
            <Text style={styles.payLabel}>Credit or debit card</Text>
          </View>

          <View style={styles.payContainer}>
            <TouchableOpacity
              onPress={() => setSelectedPaymentMethod('paypal')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 10,
              }}>
              <Entypo
                name="check"
                color={'#fff'}
                size={18}
                style={[
                  styles.checkIcon,
                  {
                    backgroundColor:
                      selectedPaymentMethod === 'paypal'
                        ? colors.primary
                        : '#fff',
                  },
                ]}
              />
            </TouchableOpacity>
            <FastImage
              source={require('../../assets/images/paypal.png')}
              style={{width: 48, height: 32, marginHorizontal: 10}}
            />
            <Text style={styles.payLabel}>Paypal</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.giftButton}
          onPress={() => initializePaymentSheet()}>
          <View style={styles.bg}>
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.giftButtonText}>Confirm and pay</Text>
            )}
          </View>
        </TouchableOpacity>

        <Text
          style={{
            fontFamily: 'SFPro',
            fontSize: 13,
            fontWeight: 'normal',
            fontStyle: 'normal',
            lineHeight: 18,
            letterSpacing: 0,
            textAlign: 'center',
            color: 'rgba(0, 0, 0, 0.5)',
            marginVertical: 25,
          }}>
          By continuing you accept our{' '}
          <Text
            onPress={() => Linking.openURL(termsLink)}
            style={{color: colors.primary}}>
            Conditions.
          </Text>
        </Text>
      </ScrollView>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  newLabelText: {
    flexDirection: 'row',
    width: '100%',
    alignSelf: 'center',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 10,
  },
  headerIcons: {
    width: 26,
    height: 26,
    textAlign: 'center',
    textAlignVertical: 'center',
    overflow: 'hidden',
  },
  btnLabel: {
    fontSize: 16,
    color: colors.black,
    padding: 8,
    fontWeight: '400',
  },
  payContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkIcon: {
    width: 22,
    height: 22,
    borderWidth: 0.5,
    borderColor: '#000',
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: true ? colors.primary : '#fff',
    overflow: 'hidden',
  },
  payLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
  },
  giftButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  bg: {
    width: 353,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftButtonText: {
    fontFamily: 'Inter-Regular_',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
});
