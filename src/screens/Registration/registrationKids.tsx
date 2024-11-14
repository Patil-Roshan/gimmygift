/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  SafeAreaView,
  Switch,
} from 'react-native';
import {styles} from './registration.styles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import colors from '../../theme/colors';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Icon from '../../components/Icon';
import {ic_camera, ic_delete, ic_gallery} from '../../assets/icons/icons';
import RNFS from 'react-native-fs';
import DatePicker from 'react-native-date-picker';
import FastImage from 'react-native-fast-image';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import {useNavigation} from '@react-navigation/core';
import Toast from 'react-native-toast-message';
import {supabase} from '../../lib/supabase';
import {decode} from 'base64-arraybuffer';
import moment from 'moment';
import SelectionButton from '../../components/SelectionButton';
import {getUserId} from '../../lib/session';
import {checkAllMediaPermissions} from '../../permission';
interface OptionBtnProps {
  label?: string;
  icon?: any;
  size?: number;
}

const RegistrationKids = () => {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState(1);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const totalSteps = 4;

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');

  const [surname, setSurname] = useState('');
  const [surnameError, setSurnameError] = useState('');

  const [birthdate, setBirthdate] = useState(new Date());

  const [selectedGender, setSelectedGender] = useState('');
  const [selectedGenderError, setSelectedGenderError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const [showBirthToggle, setShowBirthToggle] = useState(false);

  const handleContinue = () => {
    if (currentStep < totalSteps) {
      switch (currentStep) {
        case 1:
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
        case 2:
          if (selectedGender.length < 1) {
            setSelectedGenderError('Please select gender');
            return;
          }
          setCurrentStep(currentStep + 1);
          break;
        case 3:
          setCurrentStep(currentStep + 1);
          break;
      }
    } else {
      saveKidsProfile();
    }
  };

  const generateUsername = () => {
    const timestamp = Date.now().toString(36).slice(-4); // Last 4 chars of base36 timestamp
    const randomPart = Math.random().toString(36).substring(2, 4); // Random 2 chars
    return timestamp + randomPart;
  };

  const saveKidsProfile = async () => {
    try {
      const uniquePart = generateUsername();
      const username = `G${uniquePart}`.substring(0, 7);
      if (selectedImage?.length > 0) {
        const imageData = await RNFS.readFile(selectedImage, 'base64');
        await supabase.storage
          .from('profiles')
          .upload(`${username}/${username}.png`, decode(imageData), {
            contentType: 'image/png',
            cacheControl: 'no-cache',
          });
      }

      const userID = await getUserId();
      const {error} = await supabase.from('profiles').insert([
        {
          full_name: `${name} ${surname}`,
          user_type: 'CHILD',
          birthday: moment(birthdate).format('YYYY-MM-DD HH:mm:ss'),
          auth_id: userID,
          user_id: username,
        },
      ]);

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Unable to create kids profile, Please try again',
          position: 'bottom',
        });
        return;
      }
      navigation.replace('quiz');
    } catch (error) {
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
      setCurrentStep(currentStep - 1);
    }
  };

  const renderImageOption: React.FC<OptionBtnProps> = ({label, icon, size}) => {
    return (
      <TouchableOpacity
        testID={label}
        style={styles.btnImage}
        onPress={() => selectImage(label ?? '')}>
        <Icon size={size} icon={icon} />
        <Text style={styles.imageLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const selectImage = (type: string) => {
    if (type === 'Select a profile picture') {
      ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
      }).then((image: any) => {
        setSelectedImage(image.path);
        setShowImageOptions(false);
      });
    } else if (type === 'Take a profile picture') {
      ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
      }).then(image => {
        setSelectedImage(image.path);
        setShowImageOptions(false);
      });
    } else if (type === 'Delete the profile picture') {
      setSelectedImage('');
      setShowImageOptions(false);
    }
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{flex: 1}}>
      <SafeAreaView style={{backgroundColor: '#fff'}} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.progressBarContainer}>
          <TouchableOpacity
            testID="backBtn"
            onPress={handleBack}
            style={styles.backButton}>
            <AntDesign name="left" color={colors.black} size={25} />
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View
              style={[
                {width: `${(currentStep / totalSteps) * 100}%`},
                styles.progress,
              ]}
            />
          </View>
        </View>

        {currentStep === 1 && (
          <View style={styles.formContainer}>
            <Text style={styles.mainLabel}>What is your kid’s full name?</Text>
            <Text style={[styles.subLabel, {marginBottom: 62}]}>
              Anyone who wants to send a gift to your kid can search the
              GiftProfile by full name.
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
              defaultValue={surname}
              error={surnameError}
              onChangeText={(txt: string) => {
                setSurnameError('');
                setSurname(txt);
              }}
            />

            <View style={styles.btnView}>
              <Button
                testID="sendOTPBtn"
                onPress={handleContinue}
                width={'90%'}
                label={currentStep < totalSteps ? 'Continue' : 'Submit'}
              />
            </View>
          </View>
        )}
        {currentStep === 2 && (
          <View style={styles.formContainer}>
            <Text style={styles.mainLabel}>What is your kid’s gender?</Text>
            <Text style={[styles.subLabel, {marginBottom: 84}]}>
              Select only one option.
            </Text>

            {SelectionButton({
              label: 'Daughter',
              selected: selectedGender,
              setSelected: setSelectedGender,
            })}

            {SelectionButton({
              label: 'Son',
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
                testID="continueBtn2"
                onPress={handleContinue}
                width={'90%'}
                label={currentStep < totalSteps ? 'Continue' : 'Submit'}
              />
            </View>
          </View>
        )}
        {currentStep === 3 && (
          <View style={styles.formContainer}>
            <Text style={styles.mainLabel}>
              When is your kid’s birthday?
              {/* When is {selectedGender === 'Daughter' ? 'her' : ''}
              {selectedGender === 'Son' ? 'his' : ''}{' '}
              {selectedGender === 'Other' ? "kid's" : ''} birthday? */}
            </Text>
            <Text style={[styles.subLabel, {marginBottom: 84}]}>
              The perfect occasion to receive gifts from friends and family.
            </Text>

            <View style={styles.datePickerContainer}>
              <DatePicker
                date={birthdate}
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
                  width: '90%',
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
                testID="continueBtn3"
                onPress={handleContinue}
                width={'90%'}
                label={currentStep < totalSteps ? 'Continue' : 'Submit'}
              />
            </View>
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.formContainer}>
            <Modal
              isVisible={showImageOptions}
              style={{margin: 0}}
              onBackdropPress={() => setShowImageOptions(false)}>
              <View
                style={{
                  height: 215,
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
                {selectedImage?.length > 1 &&
                  renderImageOption({
                    label: 'Delete the profile picture',
                    icon: ic_delete,
                    size: 24,
                  })}
              </View>
            </Modal>
            <Text style={styles.mainLabel}>GiftProfile picture</Text>
            <Text style={[styles.subLabel, {marginBottom: 84}]}>
              Upload your Kid's GiftProfile picture.
            </Text>

            <FastImage
              source={
                selectedImage
                  ? {uri: selectedImage}
                  : require('../../assets/images/user_placeholder.png')
              }
              style={{
                height: 220,
                width: 220,
                marginBottom: 22,
                borderRadius: 110,
                alignSelf: 'center',
              }}
            />

            <TouchableOpacity
              testID="imageBtn"
              style={[styles.btnContainer, {width: '40%', borderRadius: 45}]}
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
              }}>
              <Text style={styles.btnLabel}>Add a picture</Text>
            </TouchableOpacity>

            <View style={styles.btnView}>
              <Button
                testID="continueBtn4"
                onPress={handleContinue}
                width={'90%'}
                label={currentStep < totalSteps ? 'Continue' : 'Submit'}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </ScrollView>
  );
};

export default RegistrationKids;
