/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Linking,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import {styles} from './registration.styles';
import colors from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import {
  chevronBack,
  ic_apple,
  ic_camera,
  ic_delete,
  ic_facebook,
  ic_gallery,
  ic_google,
} from '../../assets/icons/icons';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import DatePicker from 'react-native-date-picker';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import {useNavigation} from '@react-navigation/core';
import {supabase} from '../../lib/supabase';
import Toast from 'react-native-toast-message';
import CountryPicker from 'react-native-country-picker-modal';
import {CountryCode, Country} from '../../countryTypes';
import RNFS from 'react-native-fs';
import {decode} from 'base64-arraybuffer';
import moment from 'moment';
import SelectionButton from '../../components/SelectionButton';
import {getUserId} from '../../lib/session';
import {privacyPolicyLink, termsLink} from '../../referenceData';
import {AsYouType, getExampleNumber} from 'libphonenumber-js';
import DownIcon from 'react-native-vector-icons/Entypo';
import examples from 'libphonenumber-js/mobile/examples';
import {
  checkAllMediaPermissions,
  checkContactsPermission,
} from '../../permission';
interface OptionBtnProps {
  label?: string;
  icon?: any;
  size?: number;
}

const Registration = ({route}: any) => {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [showBirthToggle, setShowBirthToggle] = useState(false);

  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState<boolean>(false);
  const totalSteps = 8;

  const registrationType = route?.params?.registrationType;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [phonePlaceholder, setPhonePlaceholder] = useState('000 000 0000');
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');

  const [phoneNumberError, setPhoneNumberError] = useState('');

  const [otpError, setOTPError] = useState('');

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [surname, setSurname] = useState('');
  const [surnameError, setSurnameError] = useState('');

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [birthdate, setBirthdate] = useState(new Date());

  const [selectedGender, setSelectedGender] = useState('');
  const [selectedGenderError, setSelectedGenderError] = useState('');

  const [occasionReminder, setOccasionReminder] = useState(false);

  const [shippingCountry, setShippingCountry] = useState('');

  const [shippingFullName, setShippingFullName] = useState('');
  const [shippingFullNameError, setShippingFullNameError] = useState('');

  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingPhoneError, setShippingPhoneError] = useState('');

  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingAddressError, setShippingAddressError] = useState('');

  const [shippingAddressLine2, setShippingAddressLine2] = useState('');
  const [shippingAddressLine2Error, setShippingAddressLine2Error] =
    useState('');

  const [shippingCity, setShippingCity] = useState('');
  const [shippingCityError, setShippingCityError] = useState('');

  const [shippingState, setShippingState] = useState('');
  const [shippingStateError, setShippingStateError] = useState('');

  const [shippingZipcode, setShippingZipcode] = useState('');
  const [shippingZipcodeError, setShippingZipcodeError] = useState('');

  const [shippingNotes, setShippingNotes] = useState('');

  const [selectedImage, setSelectedImage] = useState('');
  const [selectedImageError, setSelectedImageError] = useState('');

  const [timer, setTimer] = useState(120);
  const [timerText, setTimerText] = useState('2:00');
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [callingCode, setCallingCode] = useState('1');

  const [countryAddressCode, setCountryAddressCode] =
    useState<CountryCode>('US');

  const [countryName, setCountryName] = React.useState('United States');

  const withFlag = true;
  const withEmoji = true;
  const withFilter = true;
  const withCallingCode = true;

  const getPhoneNumberPlaceholder = (countryCode: CountryCode): string => {
    try {
      const exampleNumber = getExampleNumber(countryCode, examples);
      if (!exampleNumber) {
        return '000 000 0000';
      }

      // Get the formatted example number and convert to string
      const formattedExample = exampleNumber.formatInternational();

      // Remove country code and any leading characters
      const numberWithoutCode = formattedExample
        .replace(new RegExp(`\\+${exampleNumber.countryCallingCode}\\s*`), '')
        .trim();

      // Replace all digits with 0 while maintaining format
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

  const onAddressSelect = (selCountry: Country) => {
    console.log('selCountry', selCountry);

    setCountryAddressCode(selCountry.cca2);
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

  const handleResendCode = () => {
    setTimer(120);
    setIsTimerRunning(true);
    sendOTP('resent');
  };

  const sendOTP = async (type: string) => {
    setIsLoading(true);

    if (type !== 'resent') {
      const {data: userDetails, error: errorDetails} = await supabase
        .from('user_phones')
        .select()
        .eq('phone', `${callingCode}${phoneNumber}`);

      if (!errorDetails && userDetails && userDetails.length > 0) {
        Toast.show({
          type: 'error',
          text1: 'Phone number already registered',
          position: 'bottom',
        });
        setIsLoading(false);
        return;
      }
    }

    const {error} = await supabase.auth.signInWithOtp({
      phone: `${callingCode}${phoneNumber}`,
    });

    setIsLoading(false);

    if (error) {
      console.log('OTP Error', error.message);

      Toast.show({
        type: 'error',
        text1: 'Unable to send OTP, Please try again',

        position: 'bottom',
      });
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'OTP sent to ' + phoneNumber,
      position: 'bottom',
    });
    if (type === 'newcode') {
      setCurrentStep(currentStep + 1);
    }
  };

  const generateUsername = () => {
    const timestamp = Date.now().toString(36).slice(-4); // Last 4 chars of base36 timestamp
    const randomPart = Math.random().toString(36).substring(2, 4); // Random 2 chars
    return timestamp + randomPart;
  };

  const verifyOTP = async () => {
    setIsLoading(true);
    const {data, error} = await supabase.auth.verifyOtp({
      phone: `${callingCode}${phoneNumber}`,
      token: value,
      type: 'sms',
    });

    console.log('Error', error);

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
        text1: 'OTP verified successfully',
        position: 'bottom',
      });

      // const {data: userDetails, error: errorDetails} = await supabase
      //   .from('user_phones')
      //   .select()
      //   .eq('phone', `${callingCode}${phoneNumber}`);

      // if (!errorDetails && userDetails) {
      //   navigation.replace('tabnavigator');
      //   return;
      // }

      setCurrentStep(currentStep + 1);
    }
  };

  const handleContinue = () => {
    const validatePhoneNumber = () => phoneNumber.length < 1;
    switch (currentStep) {
      case 1:
        if (validatePhoneNumber()) {
          setPhoneNumberError('Please enter valid phone number');
          return;
        }
        sendOTP('newcode');
        break;
      case 2:
        if (value.length < 6) {
          setOTPError('Please enter valid OTP');
          return;
        }
        verifyOTP();
        break;
      case 3:
        if (name.length < 1) {
          setNameError('Please enter valid name');
          return;
        }
        if (surname.length < 1) {
          setSurnameError('Please enter valid surname');
          return;
        }
        setCurrentStep(currentStep + 1);
        break;
      case 4:
        if (email.length < 1) {
          setEmailError('Please enter valid email');
          return;
        }
        setCurrentStep(currentStep + 1);
        break;
      case 5:
        setCurrentStep(currentStep + 1);
        break;
      case 6:
        if (selectedGender.length < 1) {
          setSelectedGenderError('Please select your gender');
          return;
        }
        setCurrentStep(currentStep + 1);
        break;
      case 7:
        if (selectedImage.length < 1) {
          setSelectedImageError('Please select your GiftProfile picture');
          return;
        }
        setCurrentStep(currentStep + 1);
        break;
      case 8:
        if (shippingFullName.length < 1) {
          setShippingFullNameError('Please enter valid shipping name');
          return;
        }
        if (shippingPhone.length < 1) {
          console.log('shippingFullName-->', shippingFullName);
          console.log('Length-->', shippingFullName?.length);
          setShippingPhoneError('Please enter valid phone');
          return;
        }
        if (shippingAddress.length < 1) {
          setShippingAddressError('Please enter valid address');
          return;
        }
        if (shippingAddressLine2.length < 1) {
          setShippingAddressLine2Error('Please enter valid apt/suite');
          return;
        }
        if (shippingCity.length < 1) {
          setShippingCityError('Please enter valid city');
          return;
        }
        if (shippingState.length < 1) {
          setShippingStateError('Please enter valid state');
          return;
        }
        if (shippingZipcode.length < 1) {
          setShippingZipcodeError('Please enter valid zip code');
          return;
        }
        saveUserDetails();
        break;

      // case 7:
      //   if (shippingFullName.length < 1) {
      //     setShippingFullNameError('Please enter full name');
      //     return;
      //   } else if (shippingAddress.length < 1) {
      //     setShippingAddressError('Please enter valid address');
      //   } else if (shippingCity.length < 1) {
      //     setShippingCityError('Please enter valid city');
      //   } else if (shippingZipcode.length < 1) {
      //     setShippingZipcodeError('Please enter valid zip code');
      //   } else {
      //     setCurrentStep(currentStep + 1);
      //   }
      //   break;
    }
  };

  const updateEmailAddress = async () => {
    const {error} = await supabase.auth.updateUser({email: email});

    if (error) {
      console.log(' email error -->', error);
      return false;
    }
    return true;
  };

  const updateProfileAddress = async (id: string) => {
    const {error} = await supabase.from('profile_address').insert([
      {
        user_profile_id: id,
        profile_address: {
          full_name: shippingFullName,
          phone: shippingPhone,
          address: shippingAddress,
          address_line2: shippingAddressLine2,
          city: shippingCity,
          state: shippingState,
          country: countryName,
          zip_code: shippingZipcode,
          notes: shippingNotes,
        },
      },
    ]);
    if (error) {
      console.log(' address error -->', error);
      return false;
    }
    return true;
  };

  const saveUserDetails = async () => {
    try {
      setIsLoading(true);
      const uniquePart = generateUsername();
      const username = `G${uniquePart}`.substring(0, 7);
      const userID = await getUserId();

      const emailAddressStatus = await updateEmailAddress();

      if (!emailAddressStatus) {
        console.log('Email address update failed');
      }

      const {data: createdUser, error} = await supabase
        .from('profiles')
        .insert([
          {
            full_name: `${name} ${surname}`,
            country_code: callingCode,
            birthday: moment(birthdate).format('YYYY-MM-DD HH:mm:ss'),
            auth_id: userID,
            user_id: username,
            user_type: 'NORMAL',
            gender: selectedGender?.toUpperCase(),
            has_newsletter: isSubscribing,
          },
        ])
        .select();

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Something Went Wrong',
          position: 'bottom',
        });
      }

      if (selectedImage.length > 0 && createdUser) {
        let id = createdUser[0]?.user_id;
        await updateProfileAddress(username);
        const imageData = await RNFS.readFile(selectedImage, 'base64');
        const {error} = await supabase.storage
          .from('profiles')
          .upload(`${id}/${id}.png`, decode(imageData), {
            contentType: 'image/png',
            cacheControl: 'no-cache',
          });

        if (error) {
          console.log('Storage Error->', error);
          return;
        }
      }
      setIsLoading(false);

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        position: 'bottom',
      });
      setShowPermissionModal(true);
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong! Please try again.',
        position: 'bottom',
      });
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigation.goBack();
    }
    if (currentStep > 1) {
      if (currentStep === 3) {
        setCurrentStep(1);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleContactPermission = async (type: string) => {
    setShowPermissionModal(false);

    const redirectTo =
      registrationType === 'Kids' ? 'registrationkids' : 'quiz';

    if (type === 'Continue' || type === 'Skip') {
      if (type === 'Continue') {
        await checkContactsPermission();
      }
      //Workaround for iOS crash
      setTimeout(() => {
        navigation.replace(redirectTo);
      }, 500);
    }
  };

  const renderImageOption: React.FC<OptionBtnProps> = ({label, icon, size}) => {
    return (
      <TouchableOpacity
        onPress={() => selectImage(label ?? '')}
        testID={label}
        style={styles.btnImage}>
        <Icon icon={icon} size={size} />
        <Text style={styles.imageLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const selectImage = (type: string) => {
    const options = {
      width: 400,
      height: 400,
      cropping: true,
    };
    if (type === 'Select a profile picture') {
      ImagePicker.openPicker(options).then((image: any) => {
        setSelectedImage(image.path);
        setSelectedImageError('');
        setShowImageOptions(false);
      });
    } else if (type === 'Take a profile picture') {
      ImagePicker.openCamera(options).then(image => {
        setSelectedImage(image.path);
        setSelectedImageError('');
        setShowImageOptions(false);
      });
    } else if (type === 'Delete the profile picture') {
      setSelectedImage('');
      setSelectedImageError('');
      setShowImageOptions(false);
    }
  };

  const [value, setValue] = useState('');
  const ref = useBlurOnFulfill({value, cellCount: 6});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const today = new Date();
  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

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
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{flex: 1}}>
      <SafeAreaView style={{backgroundColor: colors.white}} />
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle={'dark-content'} />
        <Modal
          isVisible={showPermissionModal}
          style={{margin: 0}}
          onModalHide={() => setShowPermissionModal(false)}
          onBackButtonPress={() => setShowPermissionModal(false)}
          onBackdropPress={() => setShowPermissionModal(false)}>
          <View
            style={{
              backgroundColor: colors.primary,
              flex: 1,
              paddingTop: 60,
            }}>
            <StatusBar barStyle={'light-content'} />
            <FastImage
              source={require('../../assets/images/contactVectorNew.png')}
              style={{
                height: 220,
                width: 220,
                alignSelf: 'center',
                marginTop: 30,
              }}
            />

            <Text
              style={{
                color: '#fff',
                fontWeight: '600',
                fontSize: 25,
                textAlign: 'center',
                marginTop: 59,
                width: '80%',
                alignSelf: 'center',
              }}>
              Allow GimmeGift to access your contacts
            </Text>
            <Text
              style={{
                color: '#fff',
                fontWeight: '400',
                fontSize: 16,
                textAlign: 'center',
                marginTop: 30,
                lineHeight: 22,
                alignSelf: 'center',
                width: '85%',
              }}>
              This allows us to import your contacts into your recipient list,
              giving you the ability to easily send gifts. For a better
              experience we will also suggest GiftProfiles that you may know
              based on your contacts. Manage this permission in Settings.
            </Text>

            <View style={{position: 'absolute', width: '100%', bottom: 30}}>
              <Button
                onPress={() => {
                  handleContactPermission('Continue');
                }}
                width={'90%'}
                bg={colors.white}
                fontColor={colors.black}
                label={'Continue'}
              />
              <View style={{marginTop: -30}}>
                <Button
                  onPress={() => handleContactPermission('Skip')}
                  width={'90%'}
                  bg={'#FF7E89'}
                  fontColor={colors.white}
                  label={'Skip'}
                />
              </View>
            </View>
          </View>
        </Modal>
        <View style={styles.progressBarContainer}>
          <TouchableOpacity
            testID="backBtn"
            style={styles.backButton}
            onPress={handleBack}>
            <Icon size={26} icon={chevronBack} tintColor="#000" />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {width: `${(currentStep / totalSteps) * 100}%`},
              ]}
            />
          </View>
          {currentStep > 5 && (
            <TouchableOpacity
              testID="skipBtn"
              style={[
                styles.backButton,
                {
                  right: 0,
                },
              ]}
              onPress={async () => {
                if (currentStep === 8) {
                  await saveUserDetails();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}>
              <Text style={styles.skipButton}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {currentStep === 1 && (
          <View style={styles.formContainer}>
            <Text style={styles.mainLabel}>
              {registrationType === 'Personal'
                ? 'Register a new account'
                : 'To create a GiftProfile for your kids you need to create your personal GiftProfile'}
            </Text>
            <Text style={styles.subLabel}>
              Enter your personal phone number
            </Text>

            <Input
              testID="emailPhoneInput"
              prefix={'+' + callingCode}
              placeholder={phonePlaceholder}
              defaultValue={formattedPhoneNumber}
              keyboardType="numeric"
              error={phoneNumberError}
              leftIcon={
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
              }
              onChangeText={(txt: string) => {
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
            <Text style={styles.termsLabel}>
              By continuing you accept our
              <Text
                style={styles.highlightedTermsLabel}
                onPress={() => Linking.openURL(termsLink)}>
                {' '}
                Conditions
              </Text>{' '}
              and
              <Text
                onPress={() => Linking.openURL(privacyPolicyLink)}
                style={styles.highlightedTermsLabel}>
                {' '}
                Privacy terms.{' '}
              </Text>
            </Text>

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

            <TouchableOpacity onPress={() => navigation.navigate('login')}>
              <Text style={styles.signinLabel}>
                Already have a GiftProfile?
                <Text style={styles.signinLabelRed}> Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {currentStep === 2 && (
          <View style={[styles.formContainer, {width: '90%'}]}>
            <Text style={styles.mainLabel}>Enter the OTP code</Text>
            <Text style={[styles.subLabel, {marginBottom: 10}]}>
              We sent you an SMS with a numeric code. It may take a few minutes
              to receive.
            </Text>
            <Text style={styles.subLabel}>
              The code expires in {timerText} minutes.
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
                disabled={value.length < 6}
                testID="verifyBtn"
                onPress={handleContinue}
                width={'100%'}
                label={currentStep < totalSteps ? 'Continue' : 'Submit'}
              />
            </View>
          </View>
        )}
        {currentStep === 3 && (
          <View style={styles.formContainer}>
            <ScrollView style={{marginBottom: 60}}>
              <Text style={styles.mainLabel}>What is your full name?</Text>
              <Text
                style={[
                  styles.subLabel,
                  {
                    marginBottom: 0,

                    alignSelf: 'center',
                  },
                ]}>
                Anyone who wants to send you a gift can
              </Text>
              <Text
                style={[
                  styles.subLabel,
                  {
                    marginBottom: 0,
                    alignSelf: 'center',
                  },
                ]}>
                search your GiftProfile using your
              </Text>
              <Text
                style={[
                  styles.subLabel,
                  {
                    marginBottom: 62,
                    alignSelf: 'center',
                  },
                ]}>
                full name.
              </Text>

              <Input
                testID="nameInput"
                placeholder="Name"
                defaultValue={name}
                error={nameError}
                onChangeText={(txt: string) => {
                  setNameError('');
                  setName(txt);
                }}
              />
              <View style={styles.vSpacer} />
              <Input
                testID="surnameInput"
                placeholder="Surname"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                defaultValue={surname}
                error={surnameError}
                onChangeText={(txt: string) => {
                  setSurnameError('');
                  setSurname(txt);
                }}
              />
            </ScrollView>
            <View style={styles.btnView}>
              <Button
                testID="continueBtn3"
                disabled={!(name && surname)}
                onPress={handleContinue}
                width={'90%'}
                label={currentStep < totalSteps ? 'Continue' : 'Submit'}
              />
            </View>
          </View>
        )}
        {currentStep === 4 && (
          <View style={[styles.formContainer, {width: '90%'}]}>
            <Text style={styles.mainLabel}>What is your email?</Text>
            <Text style={[styles.subLabel, {marginBottom: 84, lineHeight: 22}]}>
              Anyone who wants to send you a gift can search your GiftProfile
              using your email.
            </Text>
            {/* <Text
              style={[
                styles.subLabel,
                {marginBottom: scale(84), alignSelf: 'center'},
              ]}>

            </Text> */}

            <Input
              placeholder="Email"
              customContainerStyle={{width: '100%'}}
              customStyle={{width: '100%'}}
              testID="emailInput"
              defaultValue={email}
              error={emailError}
              onChangeText={(txt: string) => {
                setEmailError('');
                setEmail(txt);
              }}
            />

            <View
              style={[
                styles.newsLetterContainer,
                {
                  backgroundColor: isSubscribing
                    ? 'rgba(246, 87, 95, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
                },
              ]}>
              <Text style={styles.newsLetterLabel}>
                Subscribe to our newsletter and stay updated.
              </Text>
              <Switch
                style={{
                  transform: [{scaleX: 1.1}, {scaleY: 1.1}],
                  alignSelf: 'center',
                }}
                trackColor={{false: '#a9a8ab', true: colors.primary}}
                thumbColor={colors.white}
                ios_backgroundColor="#a9a8ab"
                onValueChange={() => setIsSubscribing(!isSubscribing)}
                value={isSubscribing}
              />
            </View>

            <View style={styles.btnView}>
              <Button
                testID="continueBtn4"
                disabled={!email}
                onPress={handleContinue}
                width={'100%'}
                label={currentStep < totalSteps ? 'Continue' : 'Submit'}
              />
            </View>
          </View>
        )}
        {currentStep === 5 && (
          <View style={[styles.formContainer, {width: '90%'}]}>
            <Text style={styles.mainLabel}>When is your birthday?</Text>
            <Text style={[styles.subLabel, {marginBottom: 0}]}>
              It’s the perfect occasion to receive gifts
            </Text>
            <Text style={[styles.subLabel, {marginBottom: '10%'}]}>
              from friends and family.
            </Text>

            <View style={styles.datePickerContainer}>
              <DatePicker
                date={birthdate}
                maximumDate={maxDate}
                locale="en"
                mode="date"
                theme="light"
                onDateChange={(date: any) => setBirthdate(date)}
              />
            </View>

            <View
              style={[
                styles.newsLetterContainer,
                {
                  backgroundColor: showBirthToggle ? '#f6575f19' : '#0000000c',
                  marginTop: '10%',
                  height: 85,
                },
              ]}>
              <View style={{width: '80%', justifyContent: 'center'}}>
                <Text
                  style={[
                    styles.newsLetterLabel,
                    {
                      fontSize: 18,
                      margin: 0,
                      paddingLeft: 5,
                      padding: 0,
                      lineHeight: 22,
                      width: '100%',
                    },
                  ]}>
                  Show your year of birth on
                </Text>
                <Text
                  style={[
                    styles.newsLetterLabel,
                    {
                      fontSize: 18,
                      margin: 0,
                      padding: 0,
                      lineHeight: 22,
                      paddingLeft: 5,
                    },
                  ]}>
                  my GiftProfile.
                </Text>
              </View>

              <Switch
                style={{
                  transform: [{scaleX: 1.1}, {scaleY: 1.1}],
                  alignSelf: 'center',
                }}
                trackColor={{false: '#a9a8ab', true: colors.primary}}
                thumbColor={colors.white}
                ios_backgroundColor="#a9a8ab"
                onValueChange={() => setShowBirthToggle(!showBirthToggle)}
                value={showBirthToggle}
              />
            </View>

            <View style={styles.btnView}>
              <Button
                testID="continueBtn5"
                onPress={handleContinue}
                width={'100%'}
                label={currentStep < totalSteps ? 'Continue' : 'Submit'}
              />
            </View>
          </View>
        )}
        {currentStep === 6 && (
          <View style={styles.formContainer}>
            <Text style={styles.mainLabel}>What is your gender?</Text>
            <Text style={[styles.subLabel, {marginBottom: 84}]}>
              Select only one option.
            </Text>

            {SelectionButton({
              label: 'Male',
              selected: selectedGender,
              setSelected: setSelectedGender,
            })}

            {SelectionButton({
              label: 'Female',
              selected: selectedGender,
              setSelected: setSelectedGender,
            })}

            {SelectionButton({
              label: 'Other',
              selected: selectedGender,
              setSelected: setSelectedGender,
            })}

            {selectedGenderError ? (
              <Text style={styles.highlightedTermsLabel}>
                {selectedGenderError}
              </Text>
            ) : null}

            <View style={styles.btnView}>
              <Button
                testID="continueBtn6"
                onPress={handleContinue}
                width={'90%'}
                label={currentStep < totalSteps ? 'Continue' : 'Submit'}
              />
            </View>
          </View>
        )}
        {/* {currentStep === 7 && (
          <View style={styles.formContainer}>
            <Text style={styles.mainLabel}>What is your shipping address?</Text>
            <Text style={[styles.subLabel, {marginBottom: 84}]}>
              We never share this address publicly without your consent.
            </Text>

            <Input
              testID="fullNameInput"
              placeholder="Full Name"
              defaultValue={shippingFullName}
              error={shippingFullNameError}
              onChangeText={(txt: string) => {
                setShippingFullNameError('');
                setShippingFullName(txt);
              }}
            />
            <View style={styles.vSpacer} />
            <Input
              testID="addressInput"
              placeholder="Address"
              defaultValue={shippingAddress}
              error={shippingAddressError}
              onChangeText={(txt: string) => {
                setShippingAddressError('');
                setShippingAddress(txt);
              }}
            />
            <View style={styles.vSpacer} />
            <View style={{flexDirection: 'row', alignSelf: 'center'}}>
              <View style={{width: '48%'}}>
                <Input
                  testID="cityInput"
                  placeholder="City"
                  defaultValue={shippingCity}
                  error={shippingCityError}
                  onChangeText={(txt: string) => {
                    setShippingCityError('');
                    setShippingCity(txt);
                  }}
                />
              </View>
              <View style={{width: '48%'}}>
                <Input
                  testID="zipInput"
                  placeholder="Zip code"
                  defaultValue={shippingZipcode}
                  error={shippingZipcodeError}
                  onChangeText={(txt: string) => {
                    setShippingZipcodeError('');
                    setShippingZipcode(txt);
                  }}
                />
              </View>
            </View>
            <View style={styles.vSpacer} />
            <Input
              testID="notesInput"
              placeholder="Notes"
              numberOfLines={3}
              defaultValue={shippingNotes}
              error={shippingNotesError}
              onChangeText={(txt: string) => {
                setShippingNotesError('');
                setShippingNotes(txt);
              }}
            />
            <View style={{marginBottom: '40%'}} />

            <View style={styles.btnView}>
              <Button
                testID="continueBtn7"
                onPress={handleContinue}
                width={'100%'}
                label={currentStep < totalSteps ? 'Continue' : 'Submit'}
              />
            </View>
          </View>
        )} */}
        {currentStep === 7 && (
          <View style={styles.formContainer}>
            <Modal
              isVisible={showImageOptions}
              style={{margin: 0}}
              onBackdropPress={() => setShowImageOptions(false)}>
              <View
                style={{
                  width: '100%',
                  backgroundColor: '#fff',
                  position: 'absolute',
                  bottom: 0,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  paddingTop: 19,
                  paddingBottom: 25,
                }}>
                {renderImageOption({
                  label: 'Select a profile picture',
                  icon: ic_gallery,
                  size: 24,
                })}
                {renderImageOption({
                  label: 'Take a profile picture',
                  icon: ic_camera,
                  size: 24,
                })}

                {selectedImage.length > 1 &&
                  renderImageOption({
                    label: 'Delete the profile picture',
                    icon: ic_delete,
                    size: 24,
                  })}
              </View>
            </Modal>
            <Text style={styles.mainLabel}>GiftProfile picture</Text>
            <Text style={[styles.subLabel, {marginBottom: 74}]}>
              Upload your GiftProfile picture.
            </Text>

            <FastImage
              source={
                selectedImage
                  ? {uri: selectedImage}
                  : require('../../assets/images/user_placeholder.png')
              }
              style={{
                height: 200,
                width: 200,
                alignSelf: 'center',
                borderRadius: 110,
                marginBottom: 22,
              }}
            />

            <TouchableOpacity
              testID="imageBtn"
              onPress={async () => {
                const hasPermission = await checkAllMediaPermissions();
                if (hasPermission) {
                  setShowImageOptions(true);
                } else {
                  Alert.alert(
                    'Permission Required',
                    'Please enable photo access in your device settings to use this feature.',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      },
                      {
                        text: 'Open Settings',
                        onPress: () => Linking.openSettings(),
                      },
                    ],
                  );
                }
              }}
              style={[styles.btnContainer, {width: '40%', borderRadius: 45}]}>
              <Text style={styles.btnLabel}>Add a picture</Text>
            </TouchableOpacity>

            <Text style={{textAlign: 'center', color: colors.primary}}>
              {selectedImageError}
            </Text>

            <View style={styles.btnView}>
              <Button
                testID="continueBtn8"
                isLoading={isLoading}
                onPress={handleContinue}
                width={'100%'}
                label={'Continue'}
              />
            </View>
          </View>
        )}

        {currentStep === 8 && (
          <>
            <Text style={styles.title}>What is your delivery address?</Text>
            <Text style={styles.subTitle}>
              Indicate where you would like to receive your gifts.
            </Text>

            <View style={styles.form}>
              <View style={styles.country}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <CountryPicker
                    countryCode={countryAddressCode}
                    withFlag={true}
                    withCallingCode={false}
                    withEmoji={true}
                    withFilter={withFilter}
                    onSelect={(country: any) => {
                      setCountryAddressCode(country.cca2);
                      setCountryName(country.name);
                    }}
                    renderFlagButton={() => (
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          height: 50,
                          width: '90%',
                          borderRadius: 8,
                          backgroundColor: '#fff',
                          borderStyle: 'solid',
                          borderWidth: 1,
                          borderColor: '#e1e1e1',
                          padding: 14,
                        }}
                        onPress={() => setVisible(!visible)}>
                        <Text
                          style={{
                            fontFamily: 'SFPro',
                            width: '90%',
                            fontSize: 17,
                            fontWeight: 'normal',
                            fontStyle: 'normal',
                            lineHeight: 22,
                            letterSpacing: 0,
                            color: '#000000',
                          }}>
                          {countryName}
                        </Text>
                        <DownIcon
                          name="chevron-small-down"
                          color={colors.black}
                          size={25}
                        />
                      </TouchableOpacity>
                    )}
                    {...{
                      modalProps: {visible},
                      onClose: () => setVisible(false),
                      onOpen: () => setVisible(true),
                    }}
                  />
                </View>
              </View>
              <View style={{paddingVertical: 14}}>
                <Input
                  placeholder="Full name"
                  defaultValue={shippingFullName}
                  onChangeText={(txt: string) => {
                    setShippingFullNameError('');
                    setShippingFullName(txt);
                  }}
                  error={shippingFullNameError}
                />
              </View>
              <Input
                placeholder="Phone number"
                defaultValue={shippingPhone}
                onChangeText={(txt: string) => {
                  setShippingPhoneError('');
                  setShippingPhone(txt);
                }}
                error={shippingPhoneError}
              />
              <View style={{paddingVertical: 14}}>
                <Input
                  placeholder="Street address or P.O. Box"
                  customSubStyle={{
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                  defaultValue={shippingAddress}
                  onChangeText={(txt: string) => {
                    setShippingAddressError('');
                    setShippingAddress(txt);
                  }}
                  error={shippingAddressError}
                />
                <Input
                  customContainerStyle={{
                    marginTop: -0.5,
                    zIndex: -1,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}
                  customSubStyle={{
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}
                  placeholder="Apt, Unit, Suit, Building"
                  defaultValue={shippingAddressLine2}
                  onChangeText={(txt: string) => {
                    setShippingAddressLine2Error('');
                    setShippingAddressLine2(txt);
                  }}
                  error={shippingAddressLine2Error}
                />
              </View>
              <Input
                placeholder="City"
                defaultValue={shippingCity}
                onChangeText={(txt: string) => {
                  setShippingCityError('');
                  setShippingCity(txt);
                }}
                error={shippingCityError}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  paddingVertical: 14,
                }}>
                <View style={{width: '48%'}}>
                  <Input
                    placeholder="State"
                    defaultValue={shippingState}
                    onChangeText={(txt: string) => {
                      setShippingStateError('');
                      setShippingState(txt);
                    }}
                    error={shippingStateError}
                  />
                </View>

                <View style={{width: '48%'}}>
                  <Input
                    placeholder="Zip Code"
                    defaultValue={shippingZipcode}
                    onChangeText={(txt: string) => {
                      setShippingZipcodeError('');
                      setShippingZipcode(txt);
                    }}
                    error={shippingZipcodeError}
                  />
                </View>
              </View>
              <Input
                placeholder="Notes"
                multiline={true}
                customSubStyle={{height: 100, alignItems: 'flex-start'}}
                defaultValue={shippingNotes}
                onChangeText={(txt: string) => setShippingNotes(txt)}
              />
              <View style={styles.address}>
                <Text style={styles.addressText}>
                  Allow my Recipients List to see my delivery address
                </Text>
                <Switch
                  style={{
                    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                    alignSelf: 'center',
                  }}
                  trackColor={{false: '#a9a8ab', true: colors.primary}}
                  thumbColor={colors.white}
                  ios_backgroundColor="#a9a8ab"
                  onValueChange={() => setOccasionReminder(!occasionReminder)}
                  value={occasionReminder}
                />
              </View>
              <Text
                style={[
                  styles.addressText,
                  {
                    fontSize: 13,
                    lineHeight: 18,
                    marginTop: 10,
                    paddingHorizontal: 15,
                  },
                ]}>
                All contacts added to your Recipient List will be able to see
                your delivery address when purchasing a gift for you.
              </Text>
              <View style={styles.address}>
                <Text style={styles.addressText}>
                  Allow everyone has my phone number to see my delivery address
                </Text>
                <Switch
                  style={{
                    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                    alignSelf: 'center',
                  }}
                  trackColor={{false: '#a9a8ab', true: colors.primary}}
                  thumbColor={colors.white}
                  ios_backgroundColor="#a9a8ab"
                  onValueChange={() => setOccasionReminder(!occasionReminder)}
                  value={occasionReminder}
                />
              </View>
              <Text
                style={[
                  styles.addressText,
                  {
                    fontSize: 13,
                    lineHeight: 18,
                    marginTop: 10,
                    paddingHorizontal: 15,
                  },
                ]}>
                Everyone who has your phone number, will be able to see your
                delivery address when purchasing a gift for you.
              </Text>
              <View style={styles.address}>
                <Text style={styles.addressText}>
                  Allow everyone to see my delivery address
                </Text>
                <Switch
                  style={{
                    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                    alignSelf: 'center',
                  }}
                  trackColor={{false: '#a9a8ab', true: colors.primary}}
                  thumbColor={colors.white}
                  ios_backgroundColor="#a9a8ab"
                  onValueChange={() => setOccasionReminder(!occasionReminder)}
                  value={occasionReminder}
                />
              </View>
              <Text
                style={[
                  styles.addressText,
                  {
                    fontSize: 13,
                    lineHeight: 18,
                    marginTop: 10,
                    paddingHorizontal: 15,
                  },
                ]}>
                Everyone will be able to see your delivery address when
                purchasing a gift for you. We suggest using a P.O. Box or an
                office address.{'\n'}
              </Text>
              <Text
                style={{
                  fontFamily: 'SFPro',
                  fontSize: 13,
                  fontWeight: '600',
                  fontStyle: 'normal',
                  lineHeight: 18,
                  paddingHorizontal: 15,
                  color: 'rgba(0, 0, 0, 0.7)',
                  margin: 8,
                  top: -20,
                  left: 10,
                }}>
                ✨ Recommended for influencers.
              </Text>

              <View style={[styles.address, {marginTop: 5, marginBottom: 80}]}>
                <Text style={styles.addressText}>
                  Do not share my delivery address.
                </Text>
                <Switch
                  style={{
                    transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                    alignSelf: 'center',
                  }}
                  trackColor={{false: '#a9a8ab', true: colors.primary}}
                  thumbColor={colors.white}
                  ios_backgroundColor="#a9a8ab"
                  onValueChange={() => setOccasionReminder(!occasionReminder)}
                  value={occasionReminder}
                />
              </View>

              <View style={{marginBottom: 20}}>
                <Button
                  testID="continueBtn8"
                  isLoading={isLoading}
                  onPress={handleContinue}
                  width={'90%'}
                  label={'Continue'}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </ScrollView>
  );
};

export default Registration;
