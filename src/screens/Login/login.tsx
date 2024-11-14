import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import {styles} from './login.styles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import DownIcon from 'react-native-vector-icons/Entypo';
import colors from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import {AsYouType, getExampleNumber} from 'libphonenumber-js';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/core';
import {supabase} from '../../lib/supabase';
import Toast from 'react-native-toast-message';
import CountryPicker from 'react-native-country-picker-modal';
import {CountryCode, Country} from '../../countryTypes';
import {ic_apple, ic_facebook, ic_google} from '../../assets/icons/icons';
import examples from 'libphonenumber-js/mobile/examples';
interface VerifyOtpParams {
  phone?: string;
  email?: string;
  token: string;
  type: 'sms' | 'email';
}

const Login = () => {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 2;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [phonePlaceholder, setPhonePlaceholder] = useState('000 000 0000');

  const [otpError, setOTPError] = useState('');

  const [timer, setTimer] = useState(120);
  const [timerText, setTimerText] = useState('2:00');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [callingCode, setCallingCode] = useState('1');
  const [authCategory, setAuthCategory] = useState('EMAIL'); //EMAIL or SMS
  const withFlag = true;
  const withEmoji = true;
  const withFilter = true;
  const withCallingCode = true;

  const getPhoneNumberPlaceholder = (code: CountryCode): string => {
    try {
      const exampleNumber = getExampleNumber(code, examples);
      if (!exampleNumber) {
        return '000 000 0000';
      }
      const formattedExample = exampleNumber.formatInternational();
      const numberWithoutCode = formattedExample
        .replace(new RegExp(`\\+${exampleNumber.countryCallingCode}\\s*`), '')
        .trim();
      return numberWithoutCode.replace(/\d/g, '0');
    } catch (error) {
      return '000 000 0000';
    }
  };

  const onSelect = (selCountry: Country) => {
    setCountryCode(selCountry.cca2);
    setCallingCode(selCountry.callingCode[0] || '');
    setPhonePlaceholder(getPhoneNumberPlaceholder(selCountry.cca2));
  };

  useEffect(() => {
    if (currentStep === 2 && !isTimerRunning && timer !== 0) {
      setIsTimerRunning(true);
    }
  }, [currentStep, isTimerRunning]);

  useEffect(() => {
    let interval: any;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            return 0;
          }

          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    setTimerText(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
  }, [timer]);

  const handleResendCode = async () => {
    sendOTP('resent');
    setTimer(120);
    setIsTimerRunning(true);
  };

  const sendOTP = async (type: string) => {
    setIsLoading(true);

    const signInParams: {
      email?: string;
      phone?: string;
      options: {shouldCreateUser: false};
    } = {
      options: {shouldCreateUser: false},
    };

    if (authCategory === 'SMS') {
      signInParams.phone = `${callingCode}${phoneNumber || ''}`;
    } else {
      signInParams.email = phoneNumber || '';
    }

    const isValidInput = validateInput(authCategory, phoneNumber);
    if (!isValidInput) {
      setIsLoading(false);
      return;
    }

    try {
      const {error} = await supabase.auth.signInWithOtp(signInParams);
      setIsLoading(false);

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Invalid Credentials',
          position: 'bottom',
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: `OTP sent to ${phoneNumber}`,
        position: 'bottom',
      });

      if (type === 'newcode') {
        setCurrentStep(currentStep + 1);
        setTimer(120);
        setIsTimerRunning(true);
      }
    } catch (error: any) {
      handleError(error);
    }
  };

  const validateInput = (type: string, email: string): boolean => {
    if (type === 'EMAIL') {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        Toast.show({
          type: 'error',
          text1: 'Please enter a valid email',
          position: 'bottom',
        });
        return false;
      }
    }
    return true;
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error.message || 'Please check your Email/Phone',
      position: 'bottom',
    });
  };

  const verifyOTP = async () => {
    if (value.length < 6) {
      setOTPError('Please enter valid OTP');
      return;
    }
    setIsLoading(true);

    let authParams = {};

    if (authCategory === 'SMS') {
      authParams = {
        phone: `${callingCode}${phoneNumber}`,
        type: 'sms',
      };
    } else {
      authParams = {
        email: phoneNumber,
        type: 'email',
      };
    }

    const {
      data,
      error,
      //@ts-ignore
    } = await supabase.auth.verifyOtp({
      ...authParams,
      token: value,
    } as VerifyOtpParams);

    setIsLoading(false);

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP, Please check your OTP',
        position: 'bottom',
      });
      return;
    }

    if (data?.session) {
      Toast.show({
        type: 'success',
        text1: 'Welcome Back',
        position: 'bottom',
      });
      navigation.replace('tabnavigator');
    }
  };

  const handleContinue = () => {
    if (currentStep < totalSteps) {
      if (currentStep === 1) {
        if (phoneNumber.length < 1) {
          setPhoneNumberError('Please enter valid phone number or email');
          return;
        }
        sendOTP('newcode');
      }
    } else {
      verifyOTP();
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: 6});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const renderOptionButton: React.FC<OptionBtnProps> = ({
    label,
    icon,
    size,
  }) => {
    return (
      <TouchableOpacity testID={label} style={styles.btnContainer}>
        <Icon size={size} icon={icon} />
        <Text style={styles.btnLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      testID="loginComponent">
      <SafeAreaView style={{backgroundColor: '#ff0000'}} />
      {currentStep === 2 && (
        <View style={styles.progressBarContainer}>
          <TouchableOpacity
            testID="backBtn"
            style={styles.backButton}
            onPress={handleBack}>
            <AntDesign name="left" color={colors.black} size={25} />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {width: `${(currentStep / totalSteps) * 90}%`},
              ]}
            />
          </View>
        </View>
      )}

      {currentStep === 1 && (
        <View style={styles.formContainer}>
          <FastImage
            resizeMode="contain"
            style={{
              height: 60,
              width: 60,
              marginHorizontal: 18,
              marginBottom: 13,
            }}
            source={require('../../assets/images/app_logo_red.png')}
          />
          <Text
            style={[
              styles.mainLabel,
              {textAlign: 'left', paddingHorizontal: 18, marginBottom: 2},
            ]}>
            Sign in
          </Text>
          <Text
            style={[
              styles.subLabel,
              {textAlign: 'left', paddingHorizontal: 18},
            ]}>
            Access to your GiftProfile.
          </Text>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 18,
              justifyContent: 'flex-start',
              width: '100%',
              padding: 15,
            }}>
            <TouchableOpacity
              hitSlop={{top: 10, bottom: 10, left: 10, right: 0}}
              onPress={() => setAuthCategory('EMAIL')}
              style={[
                styles.categoryView,
                {borderBottomWidth: authCategory === 'EMAIL' ? 2 : 0},
              ]}>
              <Text
                style={[
                  styles.categoryLabel,
                  {
                    color:
                      authCategory === 'EMAIL'
                        ? colors.black
                        : 'rgba(0, 0, 0, 0.5)',
                  },
                ]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={{top: 10, bottom: 10, left: 0, right: 10}}
              onPress={() => setAuthCategory('SMS')}
              style={[
                styles.categoryView,
                {borderBottomWidth: authCategory === 'SMS' ? 2 : 0},
              ]}>
              <Text
                style={[
                  styles.categoryLabel,
                  {
                    color:
                      authCategory === 'SMS'
                        ? colors.black
                        : 'rgba(0, 0, 0, 0.5)',
                  },
                ]}>
                Phone number
              </Text>
            </TouchableOpacity>
          </View>

          <Input
            testID="emailPhoneInput"
            type={authCategory === 'SMS' ? 'phone' : 'email'}
            country={callingCode}
            prefix={authCategory === 'SMS' ? '+' + callingCode : null}
            placeholder={
              authCategory === 'SMS' ? phonePlaceholder : 'hello@example.com'
            }
            keyboardType={authCategory === 'SMS' ? 'numeric' : 'email-address'}
            // defaultValue={phoneNumber}
            defaultValue={
              authCategory === 'SMS' ? formattedPhoneNumber : phoneNumber
            }
            leftIcon={
              authCategory === 'SMS' ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <CountryPicker
                    {...{
                      countryCode,
                      withFilter,
                      withFlag,
                      withCallingCode,
                      withEmoji,
                      onSelect,
                    }}
                  />
                  <DownIcon
                    name="chevron-small-down"
                    color={colors.black}
                    size={15}
                  />
                </View>
              ) : null
            }
            error={phoneNumberError}
            onChangeText={(txt: string) => {
              // setPhoneNumberError('');
              // setPhoneNumber(txt);
              try {
                const formatedText = new AsYouType(countryCode).input(txt);
                setPhoneNumberError('');
                setFormattedPhoneNumber(formatedText);
                const cleanedNumber = txt.replace(/\D/g, '');
                setPhoneNumber(cleanedNumber);
              } catch (error) {
                setPhoneNumber(txt);
              }
            }}
          />

          <Button
            testID="otpBtn"
            disabled={phoneNumber?.length < 1}
            onPress={handleContinue}
            width={'90%'}
            isLoading={isLoading}
            label={currentStep < totalSteps ? 'Continue' : 'Submit'}
          />

          <View style={styles.termsLabel} />
          {renderOptionButton({
            label: 'Continue with Google',
            icon: ic_google,
            size: 24,
          })}
          {renderOptionButton({
            label: 'Continue with Facebook',
            icon: ic_facebook,
            size: 24,
          })}
          {renderOptionButton({
            label: 'Continue with Apple',
            icon: ic_apple,
            size: 24,
          })}

          <TouchableOpacity
            testID="registerBtn"
            onPress={() => navigation.goBack()}>
            <Text style={styles.signinLabel}>
              Don’t have a GiftProfile?
              <Text style={styles.signinLabelRed}> Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {currentStep === 2 && (
        <View style={styles.formContainer}>
          <Text testID="codeLabel" style={styles.mainLabel}>
            Enter the access code
          </Text>
          <Text style={[styles.subLabel, {marginBottom: 10}]}>
            We sent you an sms with a OTP code. It may take a few minutes to
            receive the message containing the GimmeGift code.
          </Text>
          <Text style={styles.subLabel}>
            The code expires in {timerText} minutes
          </Text>

          {/* @ts-ignore */}
          <CodeField
            ref={ref}
            {...props}
            value={value}
            rootStyle={styles.otpContainer}
            onChangeText={setValue}
            cellCount={6}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete={Platform.select({
              android: 'sms-otp',
              default: 'one-time-code',
            })}
            testID="otp-input"
            renderCell={({index, symbol, isFocused}) => (
              <Text
                key={index}
                style={[
                  {
                    ...styles.cell,
                    color: symbol ? '#000' : '#dfdbdc',
                  },
                  isFocused && styles.focusCell,
                ]}
                onLayout={getCellOnLayoutHandler(index)}>
                {symbol || (isFocused ? <Cursor /> : '0')}
              </Text>
            )}
          />

          {otpError ? (
            <Text style={styles.highlightedTermsLabel}> {otpError} </Text>
          ) : null}

          <TouchableOpacity
            testID="resendOTPBtn"
            onPress={handleResendCode}
            disabled={isTimerRunning}
            style={styles.btnContainer}>
            <Text
              style={[
                styles.btnLabel,
                {color: isTimerRunning ? '#a3a3a3' : colors.black},
              ]}>
              Send a new OTP code
            </Text>
          </TouchableOpacity>

          <View style={styles.btnView}>
            <Button
              disabled={value?.length < 6}
              testID="verifyOTPBtn"
              onPress={handleContinue}
              isLoading={isLoading}
              width={'100%'}
              label={'Continue'}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default Login;
