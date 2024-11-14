/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Input from '../../components/Input';
import colors from '../../theme/colors';
import Modal from 'react-native-modal';
import ImagePicker from 'react-native-image-crop-picker';
import Icon from '../../components/Icon';
import {
  ic_apple,
  ic_birthdate,
  ic_facebook,
  ic_gender,
  ic_google,
  ic_profile,
  ic_relationship,
} from '../../assets/icons/icons';
import Entypo from 'react-native-vector-icons/Entypo';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import {supabase} from '../../lib/supabase';
import {useNavigation} from '@react-navigation/core';
import CountryPicker from 'react-native-country-picker-modal';
import Toast from 'react-native-toast-message';
import activeUserInstance from '../../../store/activeUsersInstance';
import {decode} from 'base64-arraybuffer';
import RNFS from 'react-native-fs';
import {UserInterface} from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import scaledSize from '../../scaleSize';
import {checkAllMediaPermissions} from '../../permission';
import {CountryCode} from '../../countryTypes';

export default function Settings() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    userAuthInfo();
    fetchUserAddress();
  }, []);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showKidsProfileModal, setShowKidsProfileModal] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState('');
  const [isImageUpdated, setIsImageUpdated] = useState(false);
  const [selectedGender, setSelectedGender] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPublic, setShowPublic] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [isEmailChanged, setIsEmailChanged] = useState(false);
  const [updatedEmail, setUpdatedEmail] = useState('');
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userAccountInfo, setUserAccountInfo] = useState<any>([]);
  const [visible, setVisible] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  const [userAddress, setUserAddress] = useState('');
  const setActiveUsers = activeUserInstance(
    (state: any) => state.setActiveUsers,
  );

  const [countryAddressCode, setCountryAddressCode] =
    useState<CountryCode>('US');

  const [countryName, setCountryName] = React.useState('United States');

  const userAuthInfo = async () => {
    const user = await supabase.auth.getUser();

    setUserAccountInfo({
      phone: user?.data?.user?.phone,
      email: user?.data?.user?.email,
    });
  };

  const fetchUserAddress = async () => {
    try {
      // Fetch the registry ID for the current user
      const {data: user, error: userError} = await supabase
        .from('profile_address')
        .select('*')
        .eq('user_profile_id', activeUsers[0].user_id)
        .single();
      console.log('user', user);
      setUserAddress(user?.profile_address);
    } catch (error) {
      console.log('Registry Fetch Error', error);
    }
  };

  const updateUserAddress = async () => {
    try {
      // update user address
      const {data: user, error: userError} = await supabase
        .from('profile_address')
        .upsert(
          {
            user_profile_id: activeUsers[0].user_id,
            profile_address: userAddress,
          },
          {onConflict: ['user_profile_id']},
        )
        .single();

      if (!userError) {
        setShowOptionsModal(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Error updating address. Please try again.',
        });
        setShowOptionsModal(false);
      }
      console.log('user', user);
    } catch (error) {
      console.log('Registry Fetch Error', error);
    }
  };

  const selectImage = async () => {
    try {
      const options = {
        width: 400,
        height: 400,
        cropping: true,
      };
      await ImagePicker.openPicker(options).then((image: any) => {
        setSelectedProfileImage(image.path);
        setIsImageUpdated(true);
      });
    } catch (error) {
      console.log('Error', error);
    }
  };

  const Logout = async () => {
    setActiveUsers([]);
    await AsyncStorage.clear();
    await supabase.auth.signOut();
    await setShowLogoutModal(false);
    setTimeout(async () => {
      navigation.replace('landing');
    }, 600);
  };

  const updateProfile = async () => {
    try {
      setIsLoading(true);
      const userID = currentUser?.user_id;
      if (!userID) {
        throw new Error('User ID is missing');
      }

      const updatedUserObj = {
        full_name: currentUser?.full_name,
        gender: selectedGender?.toUpperCase(),
        birthday: birthdate,
      };

      if (isImageUpdated) {
        const imageData = await RNFS.readFile(selectedProfileImage, 'base64');
        const {error: updateError} = await supabase.storage
          .from('profiles')
          .update(`${userID}/${userID}.png`, decode(imageData), {
            contentType: 'image/png',
            cacheControl: 'no-cache',
          });

        if (updateError?.message?.includes('not found')) {
          const {error: uploadError} = await supabase.storage
            .from('profiles')
            .upload(`${userID}/${userID}.png`, decode(imageData), {
              contentType: 'image/png',
              cacheControl: 'no-cache',
            });
          console.error('Error while uploading image', uploadError);
        }
      }

      const {error: updateError} = await supabase
        .from('profiles')
        .update(updatedUserObj)
        .eq('user_id', userID);

      if (updateError) {
        console.error('Error while updating profile', updateError);
        setIsLoading(false);
        throw new Error('Profile update failed');
      }

      const updatedUser = {
        ...currentUser,
        ...updatedUserObj,
      };

      const updatedActiveUsers = activeUsers.map((user: UserInterface) =>
        user.id === currentUser?.id ? updatedUser : user,
      );

      updatedActiveUsers.sort((a: any, b: any) => {
        if (a.user_type === 'NORMAL' && b.user_type !== 'NORMAL') {
          return -1;
        }
        if (a.user_type !== 'NORMAL' && b.user_type === 'NORMAL') {
          return 1;
        }
        return 0;
      });

      const usersWithImages = await Promise.all(
        updatedActiveUsers.map(async (user: UserInterface) => {
          const imagePath = `${user.user_id}/${user.user_id}.png`;
          const {data: imageUrlData} = await supabase.storage
            .from('profiles')
            .createSignedUrl(imagePath, 86400);
          return {...user, profile_image: imageUrlData?.signedUrl};
        }),
      );

      setActiveUsers(usersWithImages);
      setShowEditProfileModal(false);
      setIsImageUpdated(false);
      setIsLoading(false);

      Toast.show({
        type: 'success',
        text1: 'Profile Updated Successfully',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error updating profile', error);
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Profile Update Failed',
        position: 'bottom',
      });
    }
  };

  const onChange = (event: any, selectedDate: any) => {
    setBirthdate(selectedDate);
    setShowDatePicker(false);
  };

  const socialCard = ({icon, title}: any) => {
    return (
      <View style={styles.card}>
        <View style={styles.container}>
          <View style={styles.row}>
            <View style={styles.logoContainer}>
              <Icon size={24} icon={icon} />
            </View>
            <Text style={styles.googleText}>{title}</Text>

            {/* <View style={styles.statusContainer}>
              <View style={[styles.dot, false && styles.connectedDot]} />
              <Text style={[styles.statusText, false && styles.connectedText]}>
                {false ? 'Connected' : 'Disconnected'}
              </Text>
            </View> */}
          </View>

          <View
            style={{
              height: 0.6,
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              width: '110%',
              alignSelf: 'center',
            }}
          />

          <TouchableOpacity style={styles.disconnectButton}>
            <Text style={styles.disconnectText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const updateUserEmail = async () => {
    try {
      Toast.show({
        type: 'info',
        text1: 'Updaing your email...',
        position: 'bottom',
      });
      const {error} = await supabase.auth.updateUser({
        email: updatedEmail,
      });

      if (error) {
        throw error;
      }

      Toast.show({
        type: 'success',
        text1: 'Email Updated Successfully',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error updating email', error);
      Toast.show({
        type: 'error',
        text1: 'Email Update Failed',
        position: 'bottom',
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={{backgroundColor: '#ecf0f1'}}>
      <Modal
        isVisible={showLogoutModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowLogoutModal(false)}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 10,
            borderRadius: 15,
            backgroundColor: '#fff',
            paddingHorizontal: 25,
            paddingVertical: 40,
          }}>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk',
              fontSize: 22,
              fontWeight: '600',
              fontStyle: 'normal',
              textAlign: 'center',
              color: colors.black,
            }}>
            Are you sure you want to logout?
          </Text>
          <Text
            style={{
              fontFamily: 'SpaceGrotesk',
              fontSize: 15,
              padding: 10,
              fontWeight: '300',
              fontStyle: 'normal',
              textAlign: 'center',
              color: colors.black,
            }}>
            You will be logged out of your current session and will be returned
            to the login screen.
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: '#E5E5E5',
              width: '100%',
              marginTop: 20,
            }}
          />

          <Text
            onPress={() => {
              setShowLogoutModal(false);
            }}
            style={{
              fontFamily: 'SpaceGrotesk',
              fontSize: 22,
              fontWeight: '600',
              fontStyle: 'normal',
              textAlign: 'center',
              color: colors.primary,
              paddingVertical: 10,
            }}>
            Cancel
          </Text>

          <View
            style={{
              borderWidth: 1,
              borderColor: '#E5E5E5',
              width: '100%',
            }}
          />

          <Text
            onPress={() => Logout()}
            style={{
              fontFamily: 'SpaceGrotesk',
              fontSize: 22,
              fontWeight: '600',
              fontStyle: 'normal',
              textAlign: 'center',
              color: colors.black,
              paddingVertical: 10,
            }}>
            Logout
          </Text>
        </View>
      </Modal>
      <Modal
        isVisible={showEditProfileModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowEditProfileModal(false)}
        onBackdropPress={() => setShowEditProfileModal(false)}>
        <ScrollView
          style={{
            height: '90%',
            width: '100%',
            backgroundColor: '#DEDDE4',
            position: 'absolute',
            alignSelf: 'center',
            borderRadius: 12,
            bottom: 0,
            overflow: 'hidden',
            paddingHorizontal: 20,
          }}>
          {/* gender modal */}
          <Modal
            isVisible={showGenderModal}
            style={{margin: 0}}
            onBackdropPress={() => setShowGenderModal(false)}>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 10,
                borderRadius: 15,
                backgroundColor: '#ECECF3',
                paddingHorizontal: 20,
                paddingVertical: 20,
                height: '75%',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text
                  style={[
                    styles.wishlistModalLabel,
                    {fontWeight: '700', fontSize: 25},
                  ]}>
                  Gender
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: '#fff',
                  paddingVertical: 12,
                  borderRadius: 10,
                }}>
                <TouchableOpacity
                  style={{flexDirection: 'row', paddingHorizontal: 6}}>
                  <Text
                    style={[
                      styles.wishlistModalLabel,
                      {
                        fontWeight: '400',
                        fontSize: 18,
                        paddingVertical: 15,

                        width: '90%',
                      },
                    ]}>
                    Female
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGender('Female');
                      setShowGenderModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 0.5,
                        borderColor: '#000',
                        textAlignVertical: 'center',
                        borderRadius: 12,
                        textAlign: 'center',
                        backgroundColor:
                          selectedGender === 'Female' ? colors.primary : '#fff',
                        overflow: 'hidden',
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#d6d6d6',
                    width: '100%',
                  }}
                />
                <TouchableOpacity
                  style={{flexDirection: 'row', paddingHorizontal: 6}}>
                  <Text
                    style={[
                      styles.wishlistModalLabel,
                      {
                        fontWeight: '400',
                        fontSize: 18,
                        paddingVertical: 15,

                        width: '90%',
                      },
                    ]}>
                    Male
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGender('Male');
                      setShowGenderModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 0.5,
                        borderColor: '#000',
                        textAlignVertical: 'center',
                        borderRadius: 12,
                        textAlign: 'center',
                        backgroundColor:
                          selectedGender === 'Male' ? colors.primary : '#fff',
                        overflow: 'hidden',
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                <View
                  style={{
                    height: 1,
                    backgroundColor: '#d6d6d6',
                    width: '100%',
                  }}
                />

                <TouchableOpacity
                  style={{flexDirection: 'row', paddingHorizontal: 6}}>
                  <Text
                    style={[
                      styles.wishlistModalLabel,
                      {
                        fontWeight: '400',
                        fontSize: 18,
                        paddingVertical: 15,
                        width: '90%',
                      },
                    ]}>
                    Other
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGender('Other');
                      setShowGenderModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 0.5,
                        borderColor: '#000',
                        textAlignVertical: 'center',
                        borderRadius: 12,
                        textAlign: 'center',
                        backgroundColor:
                          selectedGender === 'Other' ? colors.primary : '#fff',
                        overflow: 'hidden',
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* gender modal */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              onPress={() => setShowEditProfileModal(false)}
              style={{
                fontSize: 17,
                fontWeight: '600',
                lineHeight: 27,
                letterSpacing: 0,
                color: colors.primary,
                marginTop: 25,
              }}>
              Cancel
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                lineHeight: 27,
                letterSpacing: 0,
                color: '#000000',
                marginTop: 25,
              }}>
              Edit GiftProfile
            </Text>

            {isLoading ? (
              <ActivityIndicator
                color={colors.primary}
                style={{marginTop: 25}}
              />
            ) : (
              <Text
                onPress={() => updateProfile()}
                style={{
                  fontSize: 17,
                  fontWeight: '600',
                  lineHeight: 27,
                  letterSpacing: 0,
                  color: colors.primary,
                  marginTop: 25,
                }}>
                Save
              </Text>
            )}
          </View>

          <Image
            style={{
              height: 150,
              width: 150,
              borderRadius: 75,

              overflow: 'hidden',
              alignSelf: 'center',
              marginVertical: 25,
            }}
            source={
              isImageUpdated
                ? {uri: selectedProfileImage}
                : activeUsers[0]?.profile_image
                ? {uri: activeUsers[0]?.profile_image}
                : require('../../assets/images/user_placeholder.png')
            }
          />

          <View
            style={{
              width: '60%',
              alignSelf: 'center',
              borderRadius: 12,
              marginBottom: 15,
            }}>
            <TouchableOpacity
              onPress={async () => {
                const hasPermission = await checkAllMediaPermissions();
                if (hasPermission) {
                  selectImage();
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
              style={[styles.btnContainer, {width: '85%', borderRadius: 45}]}>
              <Text style={styles.btnLabel}>Add a picture</Text>
            </TouchableOpacity>
          </View>

          <Input
            placeholder="Name"
            defaultValue={currentUser?.full_name}
            onChangeText={(text: string) =>
              setCurrentUser({...currentUser, full_name: text})
            }
          />
          {/* <Input placeholder="Surname" /> */}

          <TouchableOpacity
            style={styles.cards}
            onPress={() => {
              setShowGenderModal(true);
            }}>
            <Icon icon={ic_gender} size={24} />
            <Text style={[styles.btnLabel, {width: '65%'}]}>Gender</Text>
            <Text style={[styles.btnLabel, {color: '#797979'}]}>
              {selectedGender}
            </Text>
            <Image
              source={require('../../assets/icons/ic_chevronRight.png')}
              style={styles.arrow}
            />
          </TouchableOpacity>

          <View
            style={{
              width: '90%',
              alignSelf: 'center',
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: '#fff',
              paddingHorizontal: 8,
              marginVertical: 5,
              zIndex: 1,
              marginTop: 30,
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            }}>
            <TouchableOpacity style={[styles.cards, {width: '100%'}]}>
              <Icon icon={ic_birthdate} size={24} />
              <Text style={[styles.btnLabel, {width: 'auto'}]}>Birthday</Text>

              <TouchableOpacity
                onPress={() => setShowDatePicker(!showDatePicker)}
                style={{
                  backgroundColor: 'rgba(118, 118, 128, 0.12)',
                  borderRadius: 8,
                  position: 'absolute',
                  right: 0,
                }}>
                <Text style={[styles.btnLabel, {padding: 6}]}>
                  {moment(birthdate).format('MMMM D YYYY')}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={[styles.cards, {width: '100%'}]}>
                <DateTimePicker
                  onChange={onChange}
                  style={{width: '100%'}}
                  value={birthdate}
                  mode={'date'}
                  display={'inline'}
                  themeVariant="light"
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.cards,
              {
                marginTop: -4,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                paddingHorizontal: 16,
                paddingVertical: 5,
              },
            ]}>
            <Icon icon={ic_profile} size={24} tintColor={colors.primary} />
            <Text style={[styles.btnLabel, {width: '70%'}]}>
              Show in public
            </Text>

            <Switch
              style={{
                transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                alignSelf: 'center',
              }}
              trackColor={{false: '#767577', true: colors.primary}}
              thumbColor={colors.white}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => setShowPublic(!showPublic)}
              value={showPublic}
            />
          </TouchableOpacity>

          <Text
            style={{
              color: '#a3a3a3',
              textAlign: 'left',
              alignSelf: 'center',
              width: '85%',
              marginBottom: 10,
              marginTop: 15,
            }}>
            Even if you disable the option to show your birthday in public, this
            may still be recommended to users who have added you to their
            recipient lists with notifications.
          </Text>
        </ScrollView>
      </Modal>

      <Modal
        isVisible={showKidsProfileModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowKidsProfileModal(false)}
        onBackdropPress={() => setShowKidsProfileModal(false)}>
        <ScrollView
          style={{
            height: '90%',
            width: '100%',
            backgroundColor: '#DEDDE4',
            position: 'absolute',
            alignSelf: 'center',
            borderRadius: 12,
            bottom: 0,
            overflow: 'hidden',
            paddingHorizontal: 20,
          }}>
          {/* gender modal */}
          <Modal
            isVisible={showGenderModal}
            style={{margin: 0}}
            onBackdropPress={() => setShowGenderModal(false)}>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 10,
                borderRadius: 15,
                backgroundColor: '#ECECF3',
                paddingHorizontal: 20,
                paddingVertical: 20,
                height: '75%',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                }}>
                <Text
                  style={[
                    styles.wishlistModalLabel,
                    {fontWeight: '700', fontSize: 25},
                  ]}>
                  Gender
                </Text>
              </View>
              <View
                style={{
                  backgroundColor: '#fff',
                  paddingVertical: 12,
                  borderRadius: 10,
                }}>
                <TouchableOpacity
                  style={{flexDirection: 'row', paddingHorizontal: 6}}>
                  <Text
                    style={[
                      styles.wishlistModalLabel,
                      {
                        fontWeight: '400',
                        fontSize: 18,
                        paddingVertical: 15,

                        width: '90%',
                      },
                    ]}>
                    Female
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGender('Female');
                      setShowGenderModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 0.5,
                        borderColor: '#000',
                        textAlignVertical: 'center',
                        borderRadius: 12,
                        textAlign: 'center',
                        backgroundColor:
                          selectedGender === 'Female' ? colors.primary : '#fff',
                        overflow: 'hidden',
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
                <View
                  style={{
                    height: 1,
                    backgroundColor: '#d6d6d6',
                    width: '100%',
                  }}
                />
                <TouchableOpacity
                  style={{flexDirection: 'row', paddingHorizontal: 6}}>
                  <Text
                    style={[
                      styles.wishlistModalLabel,
                      {
                        fontWeight: '400',
                        fontSize: 18,
                        paddingVertical: 15,

                        width: '90%',
                      },
                    ]}>
                    Male
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGender('Male');
                      setShowGenderModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 0.5,
                        borderColor: '#000',
                        textAlignVertical: 'center',
                        borderRadius: 12,
                        textAlign: 'center',
                        backgroundColor:
                          selectedGender === 'Male' ? colors.primary : '#fff',
                        overflow: 'hidden',
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>

                <View
                  style={{
                    height: 1,
                    backgroundColor: '#d6d6d6',
                    width: '100%',
                  }}
                />

                <TouchableOpacity
                  style={{flexDirection: 'row', paddingHorizontal: 6}}>
                  <Text
                    style={[
                      styles.wishlistModalLabel,
                      {
                        fontWeight: '400',
                        fontSize: 18,
                        paddingVertical: 15,

                        width: '90%',
                      },
                    ]}>
                    Other
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedGender('Other');
                      setShowGenderModal(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Entypo
                      name="check"
                      color={'#fff'}
                      size={18}
                      style={{
                        width: 24,
                        height: 24,
                        borderWidth: 0.5,
                        borderColor: '#000',
                        textAlignVertical: 'center',
                        borderRadius: 12,
                        textAlign: 'center',
                        backgroundColor:
                          selectedGender === 'Other' ? colors.primary : '#fff',
                        overflow: 'hidden',
                      }}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* gender modal */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              onPress={() => setShowKidsProfileModal(false)}
              style={{
                fontSize: 17,
                fontWeight: '600',
                lineHeight: 27,
                letterSpacing: 0,
                color: colors.primary,
                marginTop: 25,
              }}>
              Cancel
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                lineHeight: 27,
                letterSpacing: 0,
                color: '#000000',
                marginTop: 25,
              }}>
              Edit GiftProfile
            </Text>
            <Text
              onPress={() => setShowKidsProfileModal(false)}
              style={{
                fontSize: 17,
                fontWeight: '600',
                lineHeight: 27,
                letterSpacing: 0,
                color: colors.primary,
                marginTop: 25,
              }}>
              Save
            </Text>
          </View>

          <FastImage
            style={{
              height: 150,
              width: 150,
              borderRadius: 75,
              overflow: 'hidden',
              alignSelf: 'center',
              marginVertical: 25,
            }}
            source={
              selectedProfileImage
                ? {uri: selectedProfileImage}
                : require('../../assets/images/user_placeholder.png')
            }
          />

          <View
            style={{
              width: '60%',
              alignSelf: 'center',
              borderRadius: 12,
              marginBottom: 15,
            }}>
            <TouchableOpacity
              onPress={async () => {
                const hasPermission = await checkAllMediaPermissions();
                if (hasPermission) {
                  selectImage();
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
              style={[styles.btnContainer, {width: '85%', borderRadius: 45}]}>
              <Text style={styles.btnLabel}>Add a picture</Text>
            </TouchableOpacity>
          </View>

          <Input placeholder="Name" />
          <Input placeholder="Surname" />

          <View
            style={{
              width: '90%',
              alignSelf: 'center',
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: '#fff',
              paddingHorizontal: 10,
              paddingVertical: 10,
              marginVertical: 5,
              zIndex: 1,
            }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
              }}>
              <FastImage
                style={{height: 60, width: 60}}
                source={require('../../assets/images/ic_kidsprofile.png')}
              />
              <Text
                style={{
                  width: '50%',
                  fontFamily: 'SpaceGrotesk',
                  fontSize: 28,
                  fontWeight: '600',
                  fontStyle: 'normal',
                  lineHeight: 30,
                  letterSpacing: -1.3,
                  color: '#000000',
                  marginHorizontal: 15,
                }}>
                GiftProfile for Kids
              </Text>
              <Switch
                style={{
                  transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                  alignSelf: 'center',
                }}
                trackColor={{false: '#767577', true: colors.primary}}
                thumbColor={colors.white}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setShowPublic(!showPublic)}
                value={showPublic}
              />
            </TouchableOpacity>

            <View
              style={{
                height: 1,
                backgroundColor: '#d6d6d6',
                width: '100%',
                marginTop: 8,
              }}
            />

            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'normal',
                lineHeight: 18,
                letterSpacing: 0,
                color: '#000000',
                paddingVertical: 8,
              }}>
              Manage your kids’ GiftProfile. It can only be found through your
              personal phone number or email. Read more in GiftProfile for Kids.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.cards}
            onPress={() => {
              setShowGenderModal(true);
            }}>
            <Icon icon={ic_relationship} size={24} />
            <Text style={[styles.btnLabel, {width: '65%'}]}>Relationship</Text>
            <Text style={[styles.btnLabel, {color: '#797979'}]}>
              {selectedGender}
            </Text>
            <Image
              source={require('../../assets/icons/ic_chevronRight.png')}
              style={styles.arrow}
            />
          </TouchableOpacity>

          <View
            style={{
              width: '90%',
              alignSelf: 'center',
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: '#fff',
              paddingHorizontal: 8,
              marginVertical: 5,
              zIndex: 1,
              marginTop: 30,
              borderBottomRightRadius: 0,
              borderBottomLeftRadius: 0,
            }}>
            <TouchableOpacity style={[styles.cards, {width: '100%'}]}>
              <Icon icon={ic_birthdate} size={24} />
              <Text style={[styles.btnLabel, {width: 'auto'}]}>Birthday</Text>

              <TouchableOpacity
                onPress={() => setShowDatePicker(!showDatePicker)}
                style={{
                  backgroundColor: 'rgba(118, 118, 128, 0.12)',
                  borderRadius: 8,
                  position: 'absolute',
                  right: 0,
                }}>
                <Text style={[styles.btnLabel, {padding: 6}]}>
                  {moment(birthdate).format('MMMM D YYYY')}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={[styles.cards, {width: '100%'}]}>
                <DateTimePicker
                  onChange={onChange}
                  style={{width: '100%'}}
                  value={birthdate}
                  mode={'date'}
                  display={'inline'}
                />
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.cards,
              {
                marginTop: -4,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                paddingHorizontal: 16,
                paddingVertical: 5,
              },
            ]}>
            <Icon icon={ic_profile} size={24} tintColor={colors.primary} />
            <Text style={[styles.btnLabel, {width: '70%'}]}>
              Show in public
            </Text>

            <Switch
              style={{
                transform: [{scaleX: 0.8}, {scaleY: 0.8}],
                alignSelf: 'center',
              }}
              trackColor={{false: '#767577', true: colors.primary}}
              thumbColor={colors.white}
              ios_backgroundColor="#3e3e3e"
              onValueChange={() => setShowPublic(!showPublic)}
              value={showPublic}
            />
          </TouchableOpacity>

          <Text
            style={{
              color: '#a3a3a3',
              textAlign: 'left',
              alignSelf: 'center',
              width: '85%',
              marginBottom: 10,
              marginTop: 15,
            }}>
            Even if you disable the option to show your birthday in public, this
            may still be recommended to users who have added you to their
            recipient lists with notifications.
          </Text>

          <TouchableOpacity style={styles.cards}>
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
                padding: 8,
                fontWeight: '400',
              }}>
              Delete
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/* Account Modal */}
      <Modal
        isVisible={showAccountModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowAccountModal(false)}
        onBackdropPress={() => setShowAccountModal(false)}>
        <ScrollView
          style={{
            height: '90%',
            width: '100%',
            backgroundColor: '#efeff4',
            position: 'absolute',
            alignSelf: 'center',
            borderRadius: 12,
            bottom: 0,
            overflow: 'hidden',
            paddingHorizontal: 20,
          }}>
          <View
            style={{
              width: 40,
              height: 5,
              borderRadius: 3,
              alignSelf: 'center',
              backgroundColor: 'rgba(60, 60, 67, 0.3)',
              marginVertical: 10,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 18,
            }}>
            <Text
              style={{
                fontSize: 22,
                fontFamily: 'SFPro',
                fontWeight: '600',
                lineHeight: 27,
                letterSpacing: 0,
                color: '#000000',
              }}>
              Account
            </Text>
            <Text
              onPress={async () => {
                if (isEmailChanged) {
                  await updateUserEmail();
                }
                setShowAccountModal(false);
              }}
              style={{
                fontSize: 18,
                fontFamily: 'SFPro',
                fontWeight: 'normal',
                lineHeight: 27,
                letterSpacing: 0,
                color: colors.primary,
              }}>
              Done
            </Text>
          </View>

          <Text
            style={{
              width: '70%',
              height: scaledSize(66),
              fontFamily: 'SFPro',
              fontSize: 16,
              fontWeight: 'normal',
              fontStyle: 'normal',
              lineHeight: 22,
              letterSpacing: 0,
              color: '#848484',
              marginTop: 25,
              marginBottom: 10,
            }}>
            Access your GiftProfile using added phone number or email
          </Text>

          <Input
            placeholder="Mobile"
            editable={false}
            customContainerStyle={{
              width: '100%',
              opacity: 0.5,
            }}
            customSubStyle={{borderWidth: 0}}
            defaultValue={userAccountInfo.phone}
          />
          <Input
            placeholder="Email"
            customContainerStyle={{
              width: '100%',
              marginTop: 12,
              borderWidth: 0,
            }}
            customSubStyle={{borderWidth: 0}}
            defaultValue={userAccountInfo.email}
            onChangeText={(value: string) => {
              setIsEmailChanged(true);
              setUpdatedEmail(value);
            }}
          />

          <Text
            style={{
              fontFamily: 'SFPro',
              fontSize: 15,
              fontWeight: '600',
              fontStyle: 'normal',
              lineHeight: 20,
              letterSpacing: 0,
              color: 'rgba(60, 60, 67, 0.6)',
              marginTop: 50,
              marginBottom: 13,
            }}>
            Other accesses
          </Text>

          {socialCard({icon: ic_google, title: 'Google'})}
          {socialCard({icon: ic_facebook, title: 'Facebook'})}
          {socialCard({icon: ic_apple, title: 'Apple ID'})}

          <TouchableOpacity
            style={[
              styles.cards,
              {marginTop: 60, width: '100%', height: 50, marginBottom: 50},
            ]}>
            <Text
              style={{
                color: colors.primary,
                fontSize: 16,
                padding: 8,
                fontWeight: '400',
              }}>
              Delete your account
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>

      {/*Address Options Modal */}
      <Modal
        isVisible={showOptionsModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowOptionsModal(false)}
        onBackdropPress={() => setShowOptionsModal(false)}>
        <ScrollView
          style={{
            height: '90%',
            width: '100%',
            backgroundColor: '#efeff4',
            position: 'absolute',
            alignSelf: 'center',
            borderRadius: 12,
            bottom: 0,
            overflow: 'hidden',
            paddingHorizontal: 20,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 25,
            }}>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 22,
                fontWeight: '600',
                fontStyle: 'normal',
                lineHeight: 24,
                letterSpacing: 0,
                color: '#000000',
              }}>
              Other options
            </Text>
            <Text
              onPress={() => updateUserAddress()}
              style={{
                fontFamily: 'SFPro',
                fontSize: 18,
                fontWeight: 'normal',
                fontStyle: 'normal',
                lineHeight: 18,
                letterSpacing: 0,
                textAlign: 'right',
                color: colors.primary,
              }}>
              Done
            </Text>
          </View>

          <Text style={styles.inputLabel}>Country</Text>

          <View>
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
                withFilter={true}
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
                      width: '100%',
                      borderRadius: 8,
                      backgroundColor: '#fff',
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
                    <Entypo
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
          {/* <Input
            placeholder="Country"
            customContainerStyle={{width: '100%', borderWidth: 0}}
            customSubStyle={{borderWidth: 0}}
          /> */}

          <Text style={styles.inputLabel}>Language</Text>
          <Input
            placeholder="Language"
            defaultValue={'English'}
            editable={false}
            customContainerStyle={{
              width: '100%',
            }}
            customSubStyle={{
              borderWidth: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
            }}
          />

          <Text style={styles.inputLabel}>Currency</Text>
          <Input
            placeholder="Currency"
            defaultValue={'$ US Dollar'}
            editable={false}
            customContainerStyle={{width: '100%'}}
            customSubStyle={{
              borderWidth: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
            }}
          />
        </ScrollView>
      </Modal>

      <View style={styles.divider} />
      <View style={styles.autoView1}>
        <Text style={styles.text}>GiftProfile</Text>
      </View>
      <View style={styles.divider} />
      {activeUsers?.map((user: UserInterface) => (
        <>
          <TouchableOpacity
            key={user.user_id}
            style={styles.bg}
            onPress={() => {
              setCurrentUser(user);
              setSelectedGender(user?.gender);
              setBirthdate(new Date(user?.birthday));
              setShowEditProfileModal(true);
            }}>
            <Image
              source={
                user.profile_image
                  ? {uri: user.profile_image}
                  : require('../../assets/icons/ic_profile.png')
              }
              style={styles.profile}
            />
            <View style={styles.textContainer}>
              <Text style={styles.headerText}>{user.full_name}</Text>
              <Text style={styles.subHeaderText}>
                {user.user_type === 'NORMAL'
                  ? 'Main Gift Profile'
                  : 'GitProfile For Kids'}
              </Text>
            </View>
            <Image
              source={require('../../assets/icons/chevronRight.png')}
              style={styles.arrow}
            />
          </TouchableOpacity>
          <View style={styles.divider} />
        </>
      ))}

      <View style={styles.autoView1}>
        <Text style={styles.text}>General</Text>
      </View>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.bg}
        onPress={() => {
          setShowAccountModal(true);
          setIsEmailChanged(false);
        }}>
        <Image
          source={require('../../assets/icons/ic_profile.png')}
          style={styles.profile}
        />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Account</Text>
          <Text style={styles.subHeaderText}>
            Manage all account data to access Gimmegift
          </Text>
        </View>
        <Image
          source={require('../../assets/icons/chevronRight.png')}
          style={styles.arrow}
        />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.bg}
        onPress={() => navigation.navigate('notificationsettings')}>
        <Image
          source={require('../../assets/icons/notification.png')}
          style={styles.profile}
        />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Notifications</Text>
          <Text style={styles.subHeaderText}>Manage all notifications.</Text>
        </View>
        <Image
          source={require('../../assets/icons/chevronRight.png')}
          style={styles.arrow}
        />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.bg}
        onPress={() => setShowOptionsModal(true)}>
        <Image
          source={require('../../assets/icons/settings.png')}
          style={styles.profile}
        />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Other options</Text>
          <Text style={styles.subHeaderText}>
            Manage the country, language and currency.
          </Text>
        </View>
        <Image
          source={require('../../assets/icons/chevronRight.png')}
          style={styles.arrow}
        />
      </TouchableOpacity>
      <View style={styles.autoView1}>
        <Text style={styles.text}>Preferences</Text>
      </View>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.bg}
        onPress={() => navigation.navigate('preferencesmanager')}>
        <Image
          source={require('../../assets/icons/preference.png')}
          style={styles.profile}
        />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Preferences manager</Text>
          <Text style={styles.subHeaderText}>
            Manage answered and skipped questions.
          </Text>
        </View>
        <Image
          source={require('../../assets/icons/chevronRight.png')}
          style={styles.arrow}
        />
      </TouchableOpacity>
      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.bgMultiline}
        onPress={() => navigation.navigate('directpickmanager')}>
        <Image
          source={require('../../assets/icons/addProfile.png')}
          style={styles.profile}
        />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Items manager</Text>
          <Text style={styles.subHeaderText}>
            Manage items added to your GitProfile and discarded items. Organize
            your price points.
          </Text>
        </View>
        <Image
          source={require('../../assets/icons/chevronRight.png')}
          style={styles.arrow}
        />
      </TouchableOpacity>
      <View style={styles.autoView1}>
        <Text style={styles.text}>Payments</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.bgMultiline}>
        <Image
          source={require('../../assets/icons/dollar.png')}
          style={styles.profile}
        />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Credit cards</Text>
          <Text style={styles.subHeaderText}>
            Add your credit cards and favourite payment method.
          </Text>
        </View>
        <Image
          source={require('../../assets/icons/chevronRight.png')}
          style={styles.arrow}
        />
      </View>
      <View style={styles.divider} />
      <View style={styles.bg}>
        <Image
          source={require('../../assets/icons/rotate.png')}
          style={styles.profile}
        />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Payments transfers</Text>
          <Text style={styles.subHeaderText}>
            Request payment transfers to gift funds.
          </Text>
        </View>
        <Image
          source={require('../../assets/icons/chevronRight.png')}
          style={styles.arrow}
        />
      </View>

      <View style={styles.privacyContainer}>
        <Text
          style={styles.privacyText}
          onPress={() =>
            navigation.navigate('webview', {
              title: 'Privacy and Conditions',
              link: 'https://gimmegift.com/privacy-policy',
            })
          }>
          Privacy and Conditions
        </Text>
        <Text
          style={styles.privacyText}
          onPress={() =>
            navigation.navigate('webview', {
              title: 'Contact Us',
              link: 'https://gimmegift.com/#join-now',
            })
          }>
          Contact Us
        </Text>
        <Text style={styles.privacyText}>Write a review</Text>
        <TouchableOpacity onPress={() => setShowLogoutModal(true)}>
          <Text style={styles.privacyText}>Logout</Text>
        </TouchableOpacity>
        <Image
          source={require('../../assets/icons/logoGimmeGift.png')}
          style={styles.logoGimmeGift}
        />
        <Text style={styles.versionLabel}>Version 0.1 MVP</Text>
        <Text style={styles.versionLabel}>
          GimmeGift Inc © {new Date().getFullYear()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  autoView1: {
    backgroundColor: 'rgb(239, 239, 244)',
    width: '100%',
    height: 46,
    justifyContent: 'center',
  },
  text: {
    marginLeft: 20,
    color: 'rgba(60, 60, 67, 0.6)',
  },
  bg: {
    width: '100%',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  bgMultiline: {
    width: '100%',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    padding: 5,
  },
  profile: {
    width: 26,
    height: 26,
    marginHorizontal: 12,
    borderRadius: 15,
  },
  textContainer: {
    flex: 1,
    marginRight: 'auto',
    marginVertical: 8,
  },
  headerText: {
    flex: 1,
    fontWeight: 'normal',
    fontSize: 18,
    color: '#000000',
    overflow: 'hidden',
  },
  subHeaderText: {
    flex: 1,
    fontWeight: 'normal',
    width: '90%',
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  arrow: {
    width: 22,
    height: 22,
    position: 'absolute',
    right: 10,
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },

  privacyContainer: {
    marginTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    alignSelf: 'center',
  },
  privacyText: {
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
    marginTop: 36,
  },
  logoGimmeGift: {
    width: 154,
    height: 32,
    marginTop: 96,
    marginBottom: 16,
  },
  homeIndicator: {
    marginTop: 40,
    width: 140,
    height: 5,
    borderRadius: 100,
    backgroundColor: 'black',
  },
  btnContainer: {
    flexDirection: 'row',
    width: '95%',
    borderRadius: 8,
    alignSelf: 'center',
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#D4D3D9',
    marginVertical: 8,
    paddingHorizontal: 5,
  },
  btnLabel: {
    fontSize: 16,
    color: colors.black,
    padding: 8,
    fontWeight: '400',
  },
  cards: {
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginVertical: 5,
    zIndex: 1,
  },
  wishlistModalLabel: {
    fontSize: 18,
    color: '#000',
    paddingHorizontal: 10,
  },
  inputLabel: {
    width: '100%',
    fontFamily: 'SFPro',
    fontSize: 15,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    color: 'rgba(60, 60, 67, 0.6)',
    marginTop: 25,
    marginVertical: 13,
  },
  versionLabel: {
    fontFamily: 'SFPro',
    fontSize: 13,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 2,
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  container: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    width: 25,
    height: 25,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#gray',
  },
  connectedDot: {
    backgroundColor: '#34A853',
  },
  statusText: {
    fontSize: 14,
    color: 'gray',
  },
  connectedText: {
    color: '#34A853',
  },
  disconnectButton: {
    paddingTop: 0,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
  },
  disconnectText: {
    fontFamily: 'SFPro',
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.7)',
  },
});
