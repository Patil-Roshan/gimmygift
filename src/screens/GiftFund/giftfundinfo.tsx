/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import colors from '../../theme/colors';
import {Bar} from 'react-native-progress';
import Modal from 'react-native-modal';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {supabase} from '../../lib/supabase';
import moment from 'moment';
import {config} from '../../config';
import {termsLink} from '../../referenceData';
import shareEventLink from '../../branch/shareLinks';
import activeUserInstance from '../../../store/activeUsersInstance';

const ProgressBarView = (progress: number, imagePath: any, title: string) => {
  return (
    <View style={styles.progresscontainer}>
      <Image source={{uri: imagePath}} style={styles.image} />
      <View style={[styles.progressBar, {width: `${progress}%`}]} />
      <Text style={styles.progressText}>{title}</Text>
      <Entypo name="chevron-small-right" color={colors.white} size={22} />
    </View>
  );
};
export default function GiftFund() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {fundDetails} = route.params;

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<any>(true);
  const [giftFundDetails, setGiftFundDetails] = useState<any>([]);
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);

  const getFundDetails = useCallback(async () => {
    try {
      const {data: details, error: contributionsError} = await supabase
        .schema('gift')
        .from('gift_funds')
        .select('*')
        .eq('gift_fund_id', fundDetails?.gift_fund_id);

      if (contributionsError) {
        console.log('Contributions Fetch Error', contributionsError);
        return null;
      }

      const url = `${config.SUPABASE_URL}/storage/v1/object/public/assets/GIFT_FUNDS/${fundDetails?.gift_fund_id}.png`;
      details[0].image_url = url;

      setGiftFundDetails(details[0] || {});
    } catch (error) {
      console.log('Error', error);

      return null;
    }
  }, [fundDetails?.gift_fund_id]);

  const getContributions = useCallback(async () => {
    try {
      const {data: contributions, error: contributionsError} = await supabase
        .schema('gift')
        .from('gift_fund_contributions')
        .select('*')
        .eq('gift_fund_id', fundDetails?.gift_fund_id);

      if (contributionsError) {
        console.log('Contributions Fetch Error', contributionsError);

        return null;
      }

      if (!contributions || contributions.length === 0) {
        return [];
      }

      // Step 2: Extract contributor IDs
      const contributorIds = contributions.map(
        contribution => contribution.contributor_id,
      );

      // Step 3: Fetch profiles
      const {data: profiles, error: profilesError} = await supabase
        .from('profiles')
        .select(' user_id, full_name')
        .in('user_id', contributorIds);

      if (profilesError) {
        console.log('Profiles Fetch Error', profilesError);

        return null;
      }

      // Step 4: Combine contributions with profiles
      const combinedData = await Promise.all(
        contributions.map(async contribution => {
          const profile = profiles.find(
            profile => profile.user_id === contribution.contributor_id,
          );
          let profileImageUrl = null;
          if (profile) {
            const imagePath = `${profile.user_id}/${profile.user_id}.png`;
            const {data: imageUrlData, error: imageError} =
              await supabase.storage
                .from('profiles')
                .createSignedUrl(imagePath, 86400);

            if (imageError) {
              console.log(
                `Image Fetch Error for user ${profile.user_id}`,
                imageError,
              );
            } else {
              profileImageUrl = imageUrlData.signedUrl;
            }
          }

          return {
            ...contribution,
            profile: {
              ...profile,
              imageUrl: profileImageUrl,
            },
          };
        }),
      );

      setContributionDetails(combinedData);
    } catch (error) {
      console.log('Error', error);

      return null;
    }
  }, [fundDetails?.gift_fund_id]);

  const fetchFundUserDetails = useCallback(async () => {
    try {
      // Fetch the registry ID for the current user
      const {data: user} = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', giftFundDetails?.created_by_user_id)
        .single();
      setUser(user);
      setIsLoading(false);
    } catch (error) {
      console.log('Registry Fetch Error', error);
    }
  }, [giftFundDetails?.created_by_user_id]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        await getFundDetails();
        await getContributions();
        await fetchFundUserDetails();
      };
      fetchData();
      return () => {};
    }, [fetchFundUserDetails, getContributions, getFundDetails]),
  );
  const [showAmountOptions, setShowAmountOptions] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [showCustomAmountModal, setShowCustomAmountModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const [contributionDetails, setContributionDetails] = useState([]);
  const renderUserDetails = ({item}) => (
    <View key={item.id} style={styles.userDetailsContainer}>
      <Image source={{uri: item?.profile?.imageUrl}} style={styles.profile} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item?.profile?.full_name}</Text>
        <Text style={styles.userDescription}>${item.amount}</Text>
      </View>
    </View>
  );

  const shareGiftFund = () => {
    shareEventLink('Gift Fund', 'giftfunds', giftFundDetails?.gift_fund_id);
  };

  const getBarProgress = () => {
    if (contributionDetails.length > 0) {
      const contributionTotal = contributionDetails?.reduce(
        (total, item) => total + item.amount,
        0,
      );
      const goalAmount = parseInt(giftFundDetails.target_amount || '0');
      const progress = contributionTotal / goalAmount;
      return progress;
    }

    return 0.1;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={{backgroundColor: '#ecf0f1'}} />
      <StatusBar barStyle="dark-content" />

      {isLoading && (
        <View
          style={{
            flex: 1,
            position: 'absolute',
            zIndex: 1,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <Modal
        isVisible={showAmountOptions}
        style={{margin: 0}}
        onBackdropPress={() => setShowAmountOptions(false)}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 10,
            borderRadius: 15,
            backgroundColor: '#efeff4',
            paddingHorizontal: 25,
            paddingVertical: 25,
          }}>
          {/* Custom Amount Modal */}
          <Modal
            isVisible={showCustomAmountModal}
            style={{margin: 0}}
            onBackdropPress={() => setShowCustomAmountModal(false)}>
            <KeyboardAvoidingView
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 10,
                borderRadius: 15,
                backgroundColor: '#efeff4',
                paddingHorizontal: 25,
                paddingVertical: 25,
              }}>
              <Text
                style={{
                  fontFamily: 'SFPro',
                  fontSize: 18,
                  fontWeight: '500',
                  fontStyle: 'normal',
                  lineHeight: 18,
                  letterSpacing: 0,
                  color: '#000000',
                  textAlign: 'center',
                }}>
                Type the amount
              </Text>
              <TextInput
                maxLength={5}
                placeholder="$0"
                onChangeText={text => {
                  if (text === '') {
                    setCustomAmount('0');
                  } else {
                    setCustomAmount(text);
                  }
                }}
                defaultValue={customAmount}
                style={{
                  width: '100%',
                  fontSize: 36,
                  textAlign: 'center',
                  fontWeight: '500',
                  marginVertical: 20,
                }}
              />

              <TouchableOpacity
                style={styles.giftButton}
                onPress={() => {
                  setSelectedAmount(customAmount);
                  setShowCustomAmountModal(false);
                }}>
                <View style={[styles.bg, {backgroundColor: '#E1E0E1'}]}>
                  <Text style={[styles.giftButtonText, {color: '#000'}]}>
                    Done
                  </Text>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </Modal>
          <Text
            style={{
              fontSize: 27,
              fontWeight: 'bold',
              fontStyle: 'normal',
              lineHeight: 32,
              letterSpacing: 0,
            }}>
            Let's get to the goal. Contribute to my GiftFund:
          </Text>

          {ProgressBarView(
            getBarProgress() * 100,
            activeUsers[0]?.profile_image,
            giftFundDetails?.gift_name,
          )}

          <View
            style={{
              backgroundColor: '#fff',
              width: '100%',
              borderRadius: 10,
              padding: 15,
            }}>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 18,
                fontWeight: '500',
                fontStyle: 'normal',
                lineHeight: 18,
                letterSpacing: 0,
                color: '#3b3b3b',
              }}>
              Select the gift amount
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 15,
              }}>
              <TouchableOpacity
                style={styles.amountCardContainer}
                onPress={() => setShowCustomAmountModal(true)}>
                <Text style={styles.amountLabel}>${customAmount}</Text>
                <Text style={styles.amountSubLabel}>Customize</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.amountCardContainer,
                  {
                    borderColor:
                      selectedAmount === '50'
                        ? colors.primary
                        : 'rgba(0, 0, 0, 0.2)',
                  },
                ]}
                onPress={() => setSelectedAmount('50')}>
                <Text style={styles.amountLabel}>$50</Text>
                <Text style={styles.amountSubLabel}>Butterfly</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.amountCardContainer,
                  {
                    borderColor:
                      selectedAmount === '100'
                        ? colors.primary
                        : 'rgba(0, 0, 0, 0.2)',
                  },
                ]}
                onPress={() => setSelectedAmount('100')}>
                <Text style={styles.amountLabel}>$100</Text>
                <Text style={styles.amountSubLabel}>Dreamer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.amountCardContainer,
                  {
                    borderColor:
                      selectedAmount === '200'
                        ? colors.primary
                        : 'rgba(0, 0, 0, 0.2)',
                  },
                ]}
                onPress={() => setSelectedAmount('200')}>
                <Text style={styles.amountLabel}>$200</Text>
                <Text style={styles.amountSubLabel}>Superstar</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsChecked(!isChecked)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Entypo
                name="check"
                color={'#fff'}
                size={18}
                style={{
                  width: 22,
                  height: 22,
                  borderWidth: 0.5,
                  borderColor: '#000',
                  borderRadius: 12,
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  backgroundColor: isChecked ? colors.primary : '#fff',
                  overflow: 'hidden',
                }}
              />
              <Text style={{marginLeft: 8, color: '#000', fontSize: 12}}>
                I want to be anonymous in the gifted amounts list.
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              width: '100%',
              borderBottomColor: '#d6d6d6',
              borderBottomWidth: 0.8,
              paddingVertical: 5,
            }}
          />
          <TouchableOpacity
            disabled={
              parseFloat(selectedAmount || '0') < 0.1 ||
              selectedAmount === '0' ||
              selectedAmount === undefined ||
              selectedAmount === null
            }
            style={styles.giftButton}
            onPress={() => {
              setShowAmountOptions(false);
              navigation.navigate('giftfundpayment', {
                title: giftFundDetails.gift_name,
                amount: selectedAmount.toString(),
                fund_id: fundDetails.gift_fund_id,
              });
            }}>
            <View
              style={[
                styles.bg,
                (parseFloat(selectedAmount || '0') < 0.1 ||
                  selectedAmount === '0' ||
                  selectedAmount === undefined ||
                  selectedAmount === null) &&
                  styles.disabledButton,
              ]}>
              <Text style={styles.giftButtonText}>
                Continue ${selectedAmount || ''}
              </Text>
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
              marginTop: 25,
            }}>
            The process involves the use of{' '}
            <Image
              resizeMode="center"
              source={require('../../assets/icons/ic_giftbox.png')}
              style={{width: 20, height: 20}}
            />{' '}
            Gift Assistant
          </Text>

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
              marginBottom: 25,
            }}>
            By continuing you accept our{' '}
            <Text
              style={{color: colors.primary}}
              onPress={() => Linking.openURL(termsLink)}>
              Conditions.
            </Text>
          </Text>
        </View>
      </Modal>
      <View style={styles.header}>
        <AntDesign
          style={{position: 'absolute', top: 15, left: 15}}
          name="left"
          color={colors.primary}
          size={25}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.title}>Gift Fund</Text>
        <TouchableOpacity>
          {/* <Entypo
            name="dots-three-horizontal"
            color={colors.primary}
            size={25}
          /> */}
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />

      <View style={styles.descriptionSection}>
        <Text style={styles.descriptionText}>Description</Text>
        <View style={styles.descContent}>
          <Image
            source={{uri: activeUsers[0]?.profile_image}}
            style={styles.descImage}
          />
          <Text style={styles.userName}>
            {user?.full_name} •{' '}
            {moment(giftFundDetails?.created_at).format('MMMM Do YYYY')}
          </Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.labelContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{giftFundDetails.gift_name}</Text>
            <Text style={styles.labelsmall}>{giftFundDetails.description}</Text>
          </View>
          <Image
            source={{
              uri: giftFundDetails.image_url,
            }}
            style={styles.coverImage}
          />
        </View>
      </View>

      <View style={styles.goalSection}>
        <Text style={styles.goalText}> Goal </Text>
        <Text style={styles.amount}>
          {' '}
          $
          {contributionDetails.reduce(
            (total, item) => total + item?.amount,
            0,
          )}{' '}
          of ${giftFundDetails.target_amount}{' '}
        </Text>
        <Bar
          progress={getBarProgress()}
          width={null}
          unfilledColor="#E6E6E6"
          color={colors.primary}
          borderWidth={0}
          height={6}
          style={{marginHorizontal: 10, marginVertical: 15}}
        />
      </View>

      <View style={styles.giftedAmountsSection}>
        <Text style={styles.giftedAmounts}>Gifted amounts</Text>

        <FlatList
          data={contributionDetails}
          renderItem={renderUserDetails}
          keyExtractor={item => item.id}
        />

        {/* <Text style={styles.moreText}> Show more</Text> */}
      </View>

      <View style={styles.divider} />

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.giftButton}
          onPress={() => setShowAmountOptions(true)}>
          <View style={styles.bg}>
            <Text style={styles.giftButtonText}>Gift an amount</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.giftButton}
          onPress={() => shareGiftFund()}>
          <View style={styles.shareBg}>
            <Text style={styles.buttonText}>Share</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  buttonSection: {
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  shareBg: {
    width: 353,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#efeff4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  giftButton: {
    alignItems: 'center',
    marginTop: 20,
  },

  disabledButton: {
    backgroundColor: '#d6d6d6',
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
  container: {
    backgroundColor: '#ecf0f1',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  title: {
    width: 78,
    height: 22,
    alignSelf: 'center',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  headerImage: {
    width: 30,
    height: 30,
  },
  moreOptionsIcon: {
    width: 30,
    height: 30,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  descriptionSection: {
    width: '100%',
    height: 252,
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  descriptionText: {
    width: 116,
    height: 24,
    fontSize: 22,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 24,
    letterSpacing: 0,
    color: '#000000',
    marginBottom: 20,
  },
  descImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  descContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 17,
    fontWeight: 'normal',
    fontStyle: 'normal',
    marginLeft: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    padding: 2,
  },
  labelsmall: {
    fontSize: 14,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coverImage: {
    width: 105,
    height: 105,
    borderRadius: 8,
    margin: 10,
    borderWidth: 0.5,
  },
  textContainer: {
    width: '70%',
  },
  goalSection: {
    padding: 15,
    width: '100%',
    height: 138,
    backgroundColor: 'white',
    marginTop: 10,
  },
  goalText: {
    fontSize: 22,
    fontWeight: '600',
  },
  amount: {
    fontSize: 24,
    fontWeight: '300',
    marginTop: 10,
  },
  goalLine: {
    width: 351,
    height: 6,
    margin: 10,
  },
  giftedAmountsSection: {
    padding: 20,
    marginTop: 10,
    backgroundColor: 'white',
  },
  giftedAmounts: {
    fontSize: 22,
    fontWeight: '600',
  },

  userDetailsContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 2,
    width: '100%',
    marginVertical: 5,
  },

  userDescription: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    alignItems: 'center',
    marginLeft: 10,
  },
  profile: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 0.5,
  },
  userDetails: {
    flexDirection: 'row',
  },
  userInfo: {
    marginLeft: 10,
    alignSelf: 'center',
  },
  moreText: {
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'center',
    color: colors.primary,
    marginTop: 40,
  },

  progresscontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9D9DA0',
    borderRadius: 20,
    width: '100%',
    zIndex: 4,
    height: 40,
    paddingHorizontal: 10,
    overflow: 'hidden',
    marginVertical: 20,
  },
  image: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderRadius: 15,
  },
  progressBar: {
    position: 'absolute',
    height: '100%',
    backgroundColor: colors.primary,
    zIndex: -1,
    borderRadius: 20,
  },
  progressText: {
    fontFamily: 'SFPro',
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'normal',
    color: '#ffffff',
  },

  amountCardContainer: {
    width: 88,
    height: 88,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    marginHorizontal: 6,
  },
  amountLabel: {
    fontFamily: 'SFPro',
    fontSize: 22,
    fontWeight: '500',
    fontStyle: 'normal',
    color: '#3b3b3b',
  },
  amountSubLabel: {
    fontFamily: 'SFPro',
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 20,
    letterSpacing: 0,
    color: 'rgba(0, 0, 0, 0.5)',
  },
});
