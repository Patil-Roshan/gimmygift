/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {
  Dimensions,
  FlatList,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import {styles} from './dashboard.styles';
import colors from '../../theme/colors';
import FastImage from 'react-native-fast-image';
import Icon from '../../components/Icon';
import {
  ic_add,
  ic_birthdate,
  ic_chevronRight,
  ic_link,
  ic_logo,
  ic_menu,
  ic_new_product,
} from '../../assets/icons/icons';
import Feather from 'react-native-vector-icons/Feather';
import Button from '../../components/Button';
import {Bar} from 'react-native-progress';
import {useNavigation} from '@react-navigation/core';
import messaging from '@react-native-firebase/messaging';
import {supabase} from '../../lib/supabase';
import {getUserId} from '../../lib/session';
import activeUserInstance from '../../../store/activeUsersInstance';
import {UserInterface} from '../../types';
import moment from 'moment';
import ShimmerPlaceholder from '../../components/ShimmerPlaceholders';
import TextMessage from '../../components/TextMessage';
import {
  fetchProductDetailsFromURL,
  fetchSuggestedProfiles,
} from '../../lib/supabaseFunctions';
import {config} from '../../config';
import {Database} from '../../../types/supabase';
import Collage from '../../components/Collage';
import {useFocusEffect} from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import shareEventLink from '../../branch/shareLinks';
import ImagePicker from 'react-native-image-crop-picker';
import {LinkPreview} from '@flyerhq/react-native-link-preview';
import Toast from 'react-native-toast-message';
import {uploadFile} from '../../api/storage';
import Input from '../../components/Input';
import scaledSize from '../../scaleSize';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFirstAccessAssistant, setShowFirstAccessAssistant] =
    useState(false);
  const [giftFunds, setGiftFunds] = useState<any>([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState<any>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [showTextMessageModal, setShowTextMessageModal] = useState(false);
  const [nextQuestion, setNextQuestion] = useState<any>('');
  const [refreshing, setRefreshing] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [showNewWishlistModal, setShowNewWishlistModal] = useState(false);
  const [wishlistPicture, setWishlistPicture] = useState('');
  const [wishlistTitle, setWishlistTitle] = useState('');
  const [wishlistLink, setWishlistLink] = useState('');
  const [wishlistPrice, setWishlistPrice] = useState('');
  const [productLink, setProductLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWishlistItem, setSelectedWishlistItem] = useState<any>('');
  const [isWishlistImageUpdated, setIsWishlistImageUpdated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const navigation = useNavigation<any>();
  const setActiveUsers = activeUserInstance(
    (state: any) => state.setActiveUsers,
  );

  const [wishlistCategories, setWishlistCategories] = useState([
    {id: 1, title: 'Until $100', images: []},
    {id: 2, title: 'Until $250', images: []},
    {id: 3, title: 'Until $500', images: []},
    {id: 4, title: 'Until $1000', images: []},
    {id: 5, title: 'All', images: []},
  ]);

  const activeUsers = activeUserInstance((state: any) => state.activeUsers);

  const typeData = [
    {id: 1, title: 'Gift', image: require('../../assets/images/gift_bg.png')},
    {
      id: 2,
      title: 'Text Message',
      image: require('../../assets/images/text_messages_bg.png'),
    },
    {
      id: 3,
      title: 'Greeting Card',
      image: require('../../assets/images/greeting_card_bg.png'),
    },
  ];

  const fetchUserDetails = useCallback(async () => {
    const userID = await getUserId();

    const {data: users, error} = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', userID || '');

    if (users) {
      const usersWithImages = await Promise.all(
        users.map(
          async (user: Database['public']['Tables']['profiles']['Row']) => {
            const imagePath = `${user.user_id}/${user.user_id}.png`;
            const {data: imageUrlData} = await supabase.storage
              .from('profiles')
              .createSignedUrl(imagePath, 86400);
            return {...user, profile_image: imageUrlData?.signedUrl};
          },
        ),
      );

      if (!error && users?.length > 0) {
        const sortedUsers = usersWithImages.slice().sort((a: any, b: any) => {
          if (a.user_type === 'NORMAL' && b.user_type !== 'NORMAL') {
            return -1;
          } else if (a.user_type !== 'NORMAL' && b.user_type === 'NORMAL') {
            return 1;
          } else {
            return 0;
          }
        });

        setActiveUsers(sortedUsers);
      }
    }
  }, [setActiveUsers]);

  const updateFCMToken = useCallback(async () => {
    try {
      const fcmToken = await messaging().getToken();
      const userID = await getUserId();

      await supabase
        .from('profiles')
        .update({
          fcm_token: fcmToken,
        })
        .eq('auth_id', userID || '');
    } catch (error) {
      console.log('error fcm', error);
    }
  }, []);

  const fetchSuggestedProfileList = useCallback(async () => {
    const userID = activeUsers[0].user_id;

    // Create fetch profiles promise
    const fetchProfiles = async () => {
      try {
        const profiles = await fetchSuggestedProfiles(userID);
        setSuggestedProfiles(profiles);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setSuggestedProfiles([]);
      }
    };

    // Create timeout promise
    const timeoutPromise = new Promise(resolve => setTimeout(resolve, 8000));

    // Race between fetch and timeout
    await Promise.race([fetchProfiles(), timeoutPromise]);

    // Set loading to false after either fetch completes or timeout
    setProfilesLoading(false);
  }, []);

  const fetchNextQuestion = useCallback(async () => {
    const token = (await supabase.auth.getSession()).data?.session
      ?.access_token;

    const {data: response, error} = await supabase.functions.invoke(
      'get-next-question',
      {
        headers: {
          Authorization: 'Bearer ' + token,
        },
        method: 'GET',
      },
    );
    if (!error && response?.question) {
      setNextQuestion(response);
    }
  }, []);

  // const fetchGiftFunds = useCallback(async () => {
  //   console.log('fetching gift funds');

  //   // Fetch gift fund details
  //   const {data: fundDetails, error: fundError} = await supabase
  //     .schema('gift')
  //     .from('gift_funds')
  //     .select('*')
  //     .limit(5);

  //   if (fundError) {
  //     console.error('Error fetching gift funds:', fundError);
  //     return;
  //   }

  //   const staticUrl = `${config.SUPABASE_URL}/storage/v1/object/public/assets/GIFT_FUNDS/`;

  //   const enrichedFunds = await Promise.all(
  //     fundDetails?.map(async (fund: any) => {
  //       const {data: userData, error: profileError} = await supabase
  //         .from('profiles')
  //         .select('*')
  //         .eq('user_id', fund.created_by_user_id)
  //         .single();

  //       if (profileError) {
  //         console.error('Error fetching user profile:', profileError);
  //         return {...fund, created_by_user: null, profile_image_url: null};
  //       }

  //       const imagePath = `${userData?.user_id}/${userData?.user_id}.png`;
  //       const {data: imageUrlData} = await supabase.storage
  //         .from('profiles')
  //         .createSignedUrl(imagePath, 86400);

  //       return {
  //         ...fund,
  //         image_url: `${staticUrl}${fund.gift_fund_id}.png`,
  //         created_by_user: userData,
  //         profile_image_url: imageUrlData?.signedUrl || null,
  //       };
  //     }),
  //   );

  //   // Set the enriched gift fund data
  //   setGiftFunds(enrichedFunds);
  // }, []);

  const fetchGiftFunds = useCallback(async () => {
    // Fetch gift fund details
    const {data: fundDetails, error: fundError} = await supabase
      .schema('gift')
      .from('gift_funds')
      .select('*')
      .limit(5);

    if (fundError) {
      console.error('Error fetching gift funds:', fundError);
      return;
    }

    const staticUrl = `${config.SUPABASE_URL}/storage/v1/object/public/assets/GIFT_FUNDS/`;

    const enrichedFunds = await Promise.all(
      fundDetails?.map(async (fund: any) => {
        // Fetch user profile of the creator
        const {data: userData, error: profileError} = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', fund.created_by_user_id)
          .single();

        if (profileError) {
          return {...fund, created_by_user: null, profile_image_url: null};
        }

        // Fetch contributors for the gift fund
        const {data: contributors, error: contributorsError} = await supabase
          .schema('gift')
          .from('gift_fund_contributions')
          .select('contributor_id')
          .eq('gift_fund_id', fund.gift_fund_id);

        if (contributorsError) {
          console.error('Error fetching contributors:', contributorsError);
          return {
            ...fund,
            created_by_user: userData,
            profile_image_url: null,
            contributors: [],
          };
        }

        // Fetch profile images for each contributor
        const contributorsWithImages = await Promise.all(
          contributors.map(async (contributor: any) => {
            const {data: contributorData, error: contributorProfileError} =
              await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', contributor.contributor_id)
                .single();

            if (contributorProfileError) {
              console.error(
                'Error fetching contributor profile:',
                contributorProfileError,
              );
              return {...contributor, profile_image_url: null};
            }

            const imagePath = `${contributorData?.user_id}/${contributorData?.user_id}.png`;
            const {data: imageUrlData} = await supabase.storage
              .from('profiles')
              .createSignedUrl(imagePath, 86400);

            return {
              ...contributor,
              profile_image_url: imageUrlData?.signedUrl || null,
            };
          }),
        );

        const imagePath = `${userData?.user_id}/${userData?.user_id}.png`;
        const {data: imageUrlData} = await supabase.storage
          .from('profiles')
          .createSignedUrl(imagePath, 86400);

        return {
          ...fund,
          image_url: `${staticUrl}${fund.gift_fund_id}.png`,
          created_by_user: userData,
          profile_image_url: imageUrlData?.signedUrl || null,
          contributors: contributorsWithImages,
        };
      }),
    );
    setGiftFunds(enrichedFunds);
  }, []);

  const getBarProgress = (total: string, target_amount: string) => {
    const goalAmount = parseInt(target_amount || '0', 10);
    const progress = total / goalAmount;
    return progress || 0;
  };

  const renderIndicator = (index: number) => {
    return (
      <View
        testID={'indicator' + index}
        key={index}
        style={[
          styles.indicator,
          {
            backgroundColor:
              index === activeIndex ? colors.primary : 'lightgray',
          },
        ]}
        // onPress={() => setActiveIndex(index)}
      />
    );
  };

  const renderAssistantFirstAccessModal = () => {
    return (
      <Modal
        isVisible={showFirstAccessAssistant}
        style={{margin: 0}}
        onBackdropPress={() => setShowFirstAccessAssistant(false)}>
        <View style={styles.assistantModalContainer}>
          <ImageBackground
            source={require('../../assets/images/giftcard_bg.png')}
            style={{
              width: '100%',
              height: '100%',
            }}>
            <Image
              style={styles.assistantImage}
              source={require('../../assets/icons/ic_assistant.png')}
            />
            <Text style={styles.assistantMainLabel}>Gift Assistant</Text>
            <Text style={styles.assistantSubLabel}>
              Find and send your gifts or messages with AI.
            </Text>

            <View style={styles.assistantDivier} />

            <View
              style={{
                flexDirection: 'row',
                height: 44,
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setShowFirstAccessAssistant(false);
                }}
                style={styles.assistantBtnCancelView}>
                <Text style={styles.assistantBtnLabel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await AsyncStorage.setItem(
                    'launch_assistant_first_access',
                    'true',
                  );
                  await setShowFirstAccessAssistant(false);
                  navigation.navigate('giftassistant');
                }}
                style={{height: 44, width: '50%', justifyContent: 'center'}}>
                <Text
                  style={[
                    styles.assistantBtnLabel,
                    {fontSize: 17, fontWeight: '600'},
                  ]}>
                  Start now
                </Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
      </Modal>
    );
  };

  const inviteUser = () => {
    shareEventLink('Referral', 'referral', activeUsers[0]?.user_id);
  };

  const handleCarousal = (type: string) => {
    if (type === 'Greeting Card') {
      navigation.navigate('cardquiz');
    }
    if (type === 'Text Message') {
      navigation.navigate('messagequiz');
      // setShowTextMessageModal(true);
    }
    if (type === 'Gift') {
      navigation.navigate('giftquiz');
    }
  };

  const getWishlistItems = useCallback(async () => {
    try {
      // Fetch the registry ID for the current user
      const {data: registry, error: registryError} = await supabase
        .schema('registry')
        .from('registries')
        .select('registry_id, created_by')
        .eq('created_by', activeUsers[0]?.user_id)
        .single();

      if (registryError) {
        console.log('Registry Fetch Error', registryError);
        setWishlistCategories([]);
        return;
      }

      const registryId = registry.registry_id;

      // Fetch all products from registry_items where registry_id matches
      const {data: products, error: productsError} = await supabase
        .schema('registry')
        .from('registry_items')
        .select('*')
        .eq('registry_id', registryId);

      if (productsError) {
        return;
      }

      //map products and add images
      const wishlistImages = products?.map(product => {
        return {
          ...product,
          image_url: `${config.SUPABASE_URL}/storage/v1/object/public/assets/WISHLISTS/${product?.item_id}.png`,
        };
      });

      setWishlistCategories(
        await categorizeWishlist(wishlistImages, wishlistCategories),
      );
    } catch (error) {
      console.log('Error', error);
    }
  }, [activeUsers]);

  const categorizeWishlist = async (wishlistData: any, categories: any) => {
    const categorizedData = categories.map(category => ({
      ...category,
      items: [],
      images: [],
    }));

    // Categorize wishlist items
    wishlistData.forEach(item => {
      let foundCategory = false;
      for (let category of categorizedData) {
        switch (category.id) {
          case 1:
            if (item.price <= 100) {
              category.items.push(item);
              category.images.push(item.image_url);
              foundCategory = true;
            }
            break;
          case 2:
            if (item.price <= 250) {
              category.items.push(item);
              category.images.push(item.image_url);
              foundCategory = true;
            }
            break;
          case 3:
            if (item.price <= 500) {
              category.items.push(item);
              category.images.push(item.image_url);
              foundCategory = true;
            }
            break;
          case 4:
            if (item.price <= 1000) {
              category.items.push(item);
              category.images.push(item.image_url);
              foundCategory = true;
            }
            break;
          case 5:
            category.items.push(item);
            category.images.push(item.image_url);
            foundCategory = true;
            break;
        }
        if (foundCategory) {
          break;
        }
      }
    });

    // Remove empty categories
    const filteredCategories = await categorizedData.filter(
      category => category.items.length > 0,
    );

    return filteredCategories;
  };

  const renderGifts = ({item}: {item: any; index: number}) => {
    return (
      <TouchableOpacity
        style={styles.wishlistCatContainer}
        onPress={() =>
          navigation.navigate('wishlistcategory', {
            title: item.title,
            items: item,
          })
        }>
        <Collage images={item.images} />
        <Text style={styles.wishlistCatLabel}>{item.title} </Text>
      </TouchableOpacity>
    );
  };

  const isValidURL = (link: string) => {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    );
    return !!urlPattern.test(link);
  };

  const handleLinkChange = (text: string) => {
    if (isValidURL(text)) {
      setProductLink(text);
    } else {
      setProductLink('');
    }
  };

  useEffect(() => {
    fetchUserDetails();
    fetchSuggestedProfileList();
    updateFCMToken();
    fetchGiftFunds();
    fetchNextQuestion();
    getWishlistItems();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const userID = await getUserId();
      if (userID) {
        const {data: user, error} = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_id', userID)
          .single();

        if (error || !user) {
          // User does not exist in the database
          Toast.show({
            type: 'error',
            text1: 'Session expired',
            text2: 'Please login to continue',
            position: 'bottom',
          });
          navigation.navigate('landing');
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Session expired',
          text2: 'Please login to continue',
          position: 'bottom',
        });
        navigation.navigate('landing');
      }
    };
    checkSession();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          await fetchGiftFunds();
        } catch (error) {
          console.error('Error fetching gift funds:', error);
        }
      };

      fetchData();
      getWishlistItems();

      return () => {};
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserDetails();
    fetchSuggestedProfileList();
    updateFCMToken();
    fetchGiftFunds();
    fetchNextQuestion();
    setRefreshing(false);
  };

  const handleNewWishlist = () => {
    setShowWishlistModal(false);
    setTimeout(() => {
      setShowNewWishlistModal(true);
    }, 2000);
  };

  const handleProductLink = async () => {
    if (!productLink) {
      Alert.alert('Error', 'Please enter a valid product link');
      return;
    }
    const productDetails = await fetchProductDetailsFromURL(productLink);
    if (productDetails) {
      const isNumeric = (str: string) =>
        !isNaN(parseFloat(str)) && isFinite(Number(str));

      setWishlistLink(productDetails?.link);
      setWishlistPrice(
        isNumeric(productDetails?.price) ? productDetails?.price : '',
      );
      setWishlistTitle(
        productDetails?.brand?.replace(/\s+/g, ' ').trim()?.slice(0, 50),
      );

      const response = await fetch(productDetails?.image);
      const blob = await response.blob();
      let imageData = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader?.result?.split(',')[1]);
        reader.readAsDataURL(blob);
      });
      setWishlistPicture('data:image/png;base64,' + imageData);
      setShowWishlistModal(false);
      setTimeout(() => {
        setShowNewWishlistModal(true);
      }, 800);
    }
  };

  const createWishlistItem = async () => {
    if (!wishlistTitle) {
      Alert.alert(
        'brand or store name is required',
        'Please enter brand or store name',
        [{text: 'OK'}],
      );
    } else if (!wishlistLink) {
      Alert.alert('product link is required', 'Please enter product link', [
        {text: 'OK'},
      ]);
    } else if (!wishlistPrice) {
      Alert.alert('Product price is required', 'Please enter wishlist price', [
        {text: 'OK'},
      ]);
    } else {
      setIsLoading(true);
      let registryId;

      // Check if registry already exists for the user
      const {data: existingRegistry, error: fetchError} = await supabase
        .schema('registry')
        .from('registries')
        .select('registry_id')
        .eq('created_by', activeUsers[0]?.user_id)
        .single();

      if (!existingRegistry && fetchError?.code === 'PGRST116') {
        // If registry doesn't exist, create one
        const {data: createdRegistry, error: createError} = await supabase
          .schema('registry')
          .from('registries')
          .insert([
            {
              title: activeUsers[0]?.full_name,
              description: '',
              created_by: activeUsers[0]?.user_id,
            },
          ])
          .select();

        if (createError) {
          console.log('Create Error', createError);
          setIsLoading(false);
          Toast.show({
            type: 'error',
            text1: 'Failed to create registry',
            position: 'bottom',
          });
          return;
        }

        registryId = createdRegistry[0]?.registry_id;
      } else {
        // If registry exists, get the id

        registryId = existingRegistry?.registry_id;
      }

      // Insert item into registry_items
      const {data: itemInsertData, error: itemInsertError} = await supabase
        .schema('registry')
        .from('registry_items')
        .insert([
          {
            product_name: wishlistTitle,
            link: wishlistLink,
            price: wishlistPrice,
            registry_id: registryId,
          },
        ])
        .select();

      if (itemInsertError) {
        console.log('Item Insert Error', itemInsertError);
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Failed to add item to registry',
          position: 'bottom',
        });
        return;
      }

      if (wishlistPicture.length > 0) {
        const item_id = itemInsertData[0].item_id;
        const {error: iError} = await uploadFile(
          'assets',
          `WISHLISTS/${item_id}.png`,
          wishlistPicture,
        );

        if (iError) {
          console.log('Storage Upload Error->', iError);
          setIsLoading(false);
          return;
        }
      }

      Toast.show({
        type: 'success',
        text1: 'Wishlist item created successfully',
        position: 'bottom',
      });

      getWishlistItems();

      setShowNewWishlistModal(false);
      setIsLoading(false);
    }
  };

  const updateWishlistItem = async () => {
    if (!wishlistTitle) {
      Alert.alert(
        'brand or store name is required',
        'Please enter brand or store name',
        [{text: 'OK'}],
      );
    } else if (!wishlistLink) {
      Alert.alert('product link is required', 'Please enter product link', [
        {text: 'OK'},
      ]);
    } else if (!wishlistPrice) {
      Alert.alert('Product price is required', 'Please enter wishlist price', [
        {text: 'OK'},
      ]);
    } else {
      setIsLoading(true);

      // Update the registry item
      const {data: itemUpdateData, error: itemUpdateError} = await supabase
        .schema('registry')
        .from('registry_items')
        .update({
          product_name: wishlistTitle,
          link: wishlistLink,
          price: parseFloat(wishlistPrice),
        })
        .eq('item_id', selectedWishlistItem?.item_id)
        .select();

      if (itemUpdateError) {
        console.log('Item Update Error', itemUpdateError);
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Failed to update registry item',
          position: 'bottom',
        });
        return;
      }

      // Update the picture if a new one is provided
      if (wishlistPicture.length > 0 && isWishlistImageUpdated) {
        const {error: iError} = await uploadFile(
          'assets',
          `WISHLISTS/${selectedWishlistItem?.item_id}.png`,
          wishlistPicture,
        );

        if (iError) {
          console.log('Storage Upload Error->', iError);
          setIsLoading(false);
          Toast.show({
            type: 'error',
            text1: 'Failed to update item picture',
            position: 'bottom',
          });
          return;
        }
      }

      setIsLoading(false);
      Toast.show({
        type: 'success',
        text1: 'Wishlist item updated successfully',
        position: 'bottom',
      });

      getWishlistItems();
      setShowNewWishlistModal(false);
      setIsEditing(false);
      setIsLoading(false);
    }
  };

  const renderWishlistModal = () => {
    return (
      <Modal
        isVisible={showWishlistModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowWishlistModal(false)}>
        <ScrollView
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 10,
            borderRadius: 15,
            backgroundColor: '#fff',
            paddingHorizontal: 25,
            paddingVertical: 25,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Icon icon={ic_link} size={24} />
            <Text style={styles.wishlistModalLabel}>Add a link</Text>
          </View>

          <TextInput
            placeholderTextColor={'#737273'}
            style={{
              backgroundColor: '#eeeeee',
              padding: 12,
              borderRadius: 5,
              margin: 5,
            }}
            placeholder={'Paste the product link here'}
            onChangeText={handleLinkChange}
          />

          {productLink && (
            <>
              <LinkPreview
                renderDescription={text => (
                  <Text
                    ellipsizeMode="tail"
                    style={{color: '#000', fontWeight: '400'}}
                    numberOfLines={2}>
                    {text}
                  </Text>
                )}
                renderText={text => (
                  <Text
                    ellipsizeMode="tail"
                    style={{color: '#000', fontWeight: '700'}}
                    numberOfLines={1}>
                    {text}
                  </Text>
                )}
                renderImage={PreviewDataImage => {
                  return (
                    <Image
                      source={
                        PreviewDataImage ||
                        require('../../assets/images/placeholder-image.jpg')
                      }
                      style={{
                        height: 120,
                        width: '95%',
                        alignSelf: 'center',
                        borderRadius: 8,
                        marginBottom: 5,
                      }}
                    />
                  );
                }}
                containerStyle={{
                  width: '100%',
                  maxHeight: 250,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                }}
                enableAnimation
                text={productLink}
              />
              <Button
                bg="#4b494d"
                width={'100%'}
                height={44}
                onPress={() => handleProductLink()}
                label="Add in wishlist"
              />
            </>
          )}

          <View
            style={{
              width: '100%',
              borderBottomColor: '#d6d6d6',
              borderBottomWidth: 0.8,
              paddingVertical: 5,
            }}
          />
          <TouchableOpacity
            onPress={() => handleNewWishlist()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Icon icon={ic_new_product} size={24} />
            <Text style={styles.wishlistModalLabel}>
              Add a product manually
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    );
  };

  const selectImage = (type: string) => {
    const options = {
      width: 400,
      height: 400,
      cropping: true,
    };
    ImagePicker.openPicker(options).then((image: any) => {
      if (type === 'GiftFund') {
        setSelectedImage(image.path);
      }
      if (type === 'Wishlist') {
        setWishlistPicture(image.path);
        setIsWishlistImageUpdated(true);
      }
    });
  };

  const renderAddWishlistModal = () => {
    return (
      <Modal
        isVisible={showNewWishlistModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowNewWishlistModal(false)}
        onBackdropPress={() => setShowNewWishlistModal(false)}>
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
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              onPress={() => setShowNewWishlistModal(false)}
              style={styles.modalBtnLabel}>
              Cancel
            </Text>
            <Text style={styles.modalBtnTitle}>New item</Text>

            {isLoading ? (
              <ActivityIndicator
                size={'small'}
                color={'#000'}
                style={{marginTop: 25}}
              />
            ) : isEditing ? (
              <Text
                onPress={() => updateWishlistItem()}
                style={styles.modalBtnLabel}>
                Update
              </Text>
            ) : (
              <Text
                onPress={() => createWishlistItem()}
                style={styles.modalBtnLabel}>
                Add
              </Text>
            )}
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 20,
              alignItems: 'center',
            }}>
            <View
              style={{
                flexDirection: 'row',
                width: '40%',
                backgroundColor: '#fff',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
                borderRadius: 12,
                height: 195,
              }}>
              <Image
                resizeMode="contain"
                style={{
                  height: wishlistPicture ? '99%' : 44,
                  width: wishlistPicture ? '99%' : 44,
                  borderRadius: 10,
                }}
                source={
                  wishlistPicture
                    ? {uri: wishlistPicture}
                    : require('../../assets/icons/ic_image_placeholder.png')
                }
              />
            </View>
            <View
              style={{
                width: '65%',
                justifyContent: 'center',
                alignContent: 'center',
                borderRadius: 12,
                height: 150,
                paddingHorizontal: 20,
              }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '600',
                  letterSpacing: 0,
                  color: '#000',
                }}>
                Picture
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  color: '#7F7E7F',
                }}>
                Add a photo of the product
              </Text>
              <TouchableOpacity
                onPress={() => selectImage('Wishlist')}
                style={[styles.btnContainer, {width: '95%', borderRadius: 45}]}>
                <Text style={styles.btnLabel}>Upload a picture</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.inputLabel}>Brand or store name</Text>
          <Input
            placeholder="Type the brand or store name"
            defaultValue={wishlistTitle}
            onChangeText={(value: string) => setWishlistTitle(value)}
          />

          <Text style={styles.inputLabel}>Link</Text>
          <Input
            numberOfLines={5}
            multiLine={true}
            defaultValue={wishlistLink}
            placeholder="Paste the product link here"
            onChangeText={(value: string) => setWishlistLink(value)}
          />

          <Text style={styles.inputLabel}>Price</Text>
          <Input
            defaultValue={wishlistPrice}
            leftIcon={
              <Text
                style={{
                  color: colors.black,
                  paddingVertical: 5,
                  fontSize: 20,
                  textAlign: 'center',
                }}>
                $
              </Text>
            }
            onChangeText={(value: string) => setWishlistPrice(value)}
          />
        </ScrollView>
      </Modal>
    );
  };

  const SLIDER_WIDTH = Dimensions.get('window').width;
  const ITEM_WIDTH = SLIDER_WIDTH * 0.9;
  const ITEM_HEIGHT = ITEM_WIDTH * 0.6;

  return (
    <>
      <SafeAreaView style={{backgroundColor: colors.primary}} />
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <TextMessage
          isOpen={showTextMessageModal}
          onClose={() => setShowTextMessageModal(false)}
          type="scheduling"
        />

        {renderAssistantFirstAccessModal()}
        {renderWishlistModal()}
        {renderAddWishlistModal()}

        <View
          style={{
            width: '100%',
            backgroundColor: colors.primary,
            paddingHorizontal: 15,
            paddingVertical: 18,
          }}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <FastImage
              source={require('../../assets/images/dashboard_logo.png')}
              style={{width: 172, height: 36}}
            />
            <TouchableOpacity
              testID="btnMenu"
              onPress={() => navigation.navigate('menu')}>
              <Icon icon={ic_menu} size={26} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.searchContainer}
            onPress={() => navigation.navigate('search')}>
            <Feather name="search" color={'#717174'} size={18} />
            <TextInput
              onPressIn={() => navigation.navigate('search')}
              editable={false}
              placeholder="Search a GiftProfile"
              style={styles.searchInput}
              placeholderTextColor={'#717174'}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: '100%',
            borderBottomWidth: 1,
            borderBottomColor: '#e6e6e6',
            paddingVertical: 15,
            paddingHorizontal: 15,
            flexDirection: 'row',
          }}>
          <Text
            onPress={() => navigation.navigate('quiz')}
            style={[styles.categoryLabel, {width: '37%', textAlign: 'left'}]}>
            Preferences Quiz
          </Text>
          <Text
            onPress={() => navigation.navigate('VirtualGiftList')}
            style={[styles.categoryLabel, {width: '30%'}]}>
            Virtual Gifts
          </Text>
          <Text style={[styles.categoryLabel]} onPress={() => inviteUser()}>
            Invite a friend
          </Text>
        </View>

        <FlatList
          data={typeData}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            justifyContent: 'center',
            backgroundColor: '#efeff4',
            paddingLeft: 16,
          }}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => handleCarousal(item.title)}>
              <ImageBackground
                resizeMode="contain"
                style={styles.categoryCard}
                source={item.image}>
                <Text style={styles.categoryTitle}>{item.title}</Text>
              </ImageBackground>
            </TouchableOpacity>
          )}
        />

        <ImageBackground
          source={require('../../assets/images/gift_assistant_bg.png')}
          resizeMode="stretch"
          style={{
            width: '100%',
            backgroundColor: '#53436E',
            height: 204,
            justifyContent: 'center',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 25,
            }}>
            <View style={{width: '60%'}}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 26,
                  fontWeight: 'bold',
                  fontFamily: 'SpaceGrotesk-Bold',
                }}>
                Gift Assistant
              </Text>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontFamily: 'Inter-Regular',
                  width: '100%',
                  fontWeight: '500',
                  lineHeight: 19,
                  marginTop: 8,
                }}>
                Just create and send{'\n'}all your gifts easily!
              </Text>

              <TouchableOpacity
                style={{
                  width: 100,
                  height: 30,
                  borderRadius: 8,
                  borderStyle: 'solid',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderWidth: 1,
                  marginTop: 28,
                }}
                onPress={async () => {
                  const response = await AsyncStorage.getItem(
                    'launch_assistant_first_access',
                  );
                  if (!response || response === 'false') {
                    setShowFirstAccessAssistant(true);
                  } else {
                    navigation.navigate('giftassistant');
                  }
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontFamily: 'Inter-Regular',
                    fontSize: 14,
                    textAlign: 'center',
                    fontWeight: '600',
                    padding: 4,
                  }}>
                  Launch
                </Text>
              </TouchableOpacity>
            </View>
            <FastImage
              resizeMode="contain"
              source={require('../../assets/images/giftbox.png')}
              style={{
                width: 120,
                height: 120,
                alignSelf: 'center',
              }}
            />
          </View>
        </ImageBackground>

        <View style={styles.aboutDivider} />

        <Text style={styles.aboutLabel}>Suggested GiftProfiles</Text>

        {profilesLoading ? (
          <FlatList
            data={[1, 2, 3]}
            style={{paddingLeft: scaledSize(15)}}
            horizontal={true}
            renderItem={() => <ShimmerPlaceholder />}
            keyExtractor={item => item.toString()}
          />
        ) : (
          <FlatList
            data={suggestedProfiles}
            horizontal={true}
            ListEmptyComponent={
              <Text style={styles.noProfilesLabel}>
                No Profiles at the Moment
              </Text>
            }
            style={{paddingLeft: scaledSize(15)}}
            renderItem={({item}: {item: UserInterface}) => (
              <TouchableOpacity
                style={styles.profilesContainer}
                onPress={() =>
                  navigation.navigate('recipientgiftprofile', {profile: item})
                }>
                <FastImage
                  resizeMode="cover"
                  source={
                    item.profile_image
                      ? {uri: item.profile_image}
                      : require('../../assets/images/user_placeholder.png')
                  }
                  style={styles.profileImage}
                />

                <View style={styles.profileImageBox}>
                  <Text numberOfLines={1} style={styles.profileNameLabel}>
                    {item.full_name}
                  </Text>
                  <Icon icon={ic_logo} size={20} />
                </View>

                <View style={styles.profileBirthdayBox}>
                  <Icon icon={ic_birthdate} size={16} />
                  <Text style={styles.profileBirthdayLabel}>
                    Birthday{' '}
                    {item.birthday
                      ? moment(item.birthday).format('MMM DD')
                      : '-'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('recipientgiftprofile', {profile: item})
                  }
                  style={styles.profileBtnContainer}>
                  <Text style={styles.profileBtnLabel}>
                    Visit this GiftProfile
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}

        {!!nextQuestion && (
          <>
            <View style={styles.aboutDivider} />
            <View style={[styles.aboutContainer, {paddingVertical: 15}]}>
              <FastImage
                resizeMode="cover"
                source={
                  activeUsers[0]?.profile_image
                    ? {uri: activeUsers[0]?.profile_image}
                    : require('../../assets/images/user_placeholder.png')
                }
                style={styles.aboutImage}
              />
              <Text
                style={[
                  styles.aboutLabel,
                  {
                    paddingTop: 0,
                    alignSelf: 'center',
                  },
                ]}>
                About you
              </Text>
            </View>

            <View style={styles.aboutQuestion}>
              <Text style={styles.aboutQuestionLabel}>
                {nextQuestion?.question}
              </Text>
              <View style={styles.aboutAnswerContainer}>
                <TouchableOpacity
                  style={[
                    styles.aboutAnswerBox,
                    {
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      width: 68,
                    },
                  ]}>
                  <Text style={styles.aboutAnswerLabel}>Skip</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* <Text
            style={styles.quizContinueLabel}
            onPress={() => navigation.navigate('quiz')}>
            Continue to answer {'>'}
          </Text> */}
          </>
        )}
        {!!nextQuestion && (
          <>
            <View style={styles.aboutDivider} />
            <View style={[styles.aboutContainer, {flexDirection: 'column'}]}>
              <Text style={[styles.aboutLabel, {paddingBottom: 0}]}>
                Preferences Quiz
              </Text>
              <Text
                style={[
                  styles.aboutLabel,
                  {
                    fontSize: 14,
                    paddingTop: 8,
                    fontWeight: 'normal',
                  },
                ]}>
                Answer questions about your personal preferences.
              </Text>
            </View>

            <View
              style={[
                styles.aboutQuestion,
                {
                  backgroundColor: colors.white,
                  borderWidth: 1,
                  borderColor: 'rgba(0, 0, 0, 0.1)',
                  height: 110,
                },
              ]}>
              <Text
                style={[
                  styles.aboutQuestionLabel,
                  {color: '#000', fontSize: 16, fontWeight: '600'},
                ]}>
                {nextQuestion?.question}
              </Text>
              <View style={styles.aboutAnswerContainer}>
                <ScrollView horizontal>
                  {nextQuestion?.response
                    ?.split(',')
                    ?.map((answer: string, index: number) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.aboutAnswerBox,
                          {
                            backgroundColor: 'transparent',
                            borderWidth: 1,
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                          },
                        ]}>
                        <Text style={styles.aboutAnswerLabel}>{answer}</Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            </View>
            <View
              style={{height: 0.5, backgroundColor: 'rgba(0, 0, 0, 0.15)'}}
            />
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={styles.quizContinueLabel}
                onPress={() => navigation.navigate('quiz')}>
                Continue to answer
              </Text>
              <Icon icon={ic_chevronRight} size={16} />
            </View>
          </>
        )}

        <View style={styles.aboutDivider} />

        <View style={{flexDirection: 'row'}}>
          <FastImage
            resizeMode="contain"
            source={require('../../assets/images/funds_vector.png')}
            style={{
              width: 68,
              height: 68,
              marginLeft: 19,
              marginVertical: 18,
            }}
          />
          <View>
            <Text style={[styles.aboutLabel, {paddingBottom: 0}]}>
              GiftFund
            </Text>
            <Text style={styles.giftFundDesc}>
              Send an amount as gift to contribuite a dream of your friends.
            </Text>
          </View>
        </View>

        <View style={styles.giftFundContainer}>
          <Carousel
            loop
            data={giftFunds}
            width={SLIDER_WIDTH}
            height={ITEM_HEIGHT}
            renderItem={({item}: {item: any}) => (
              <View
                style={{
                  width: ITEM_WIDTH,
                  height: ITEM_HEIGHT - 20,
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  flexDirection: 'row',
                  shadowColor: 'rgba(0, 0, 0, 0.09)',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 1,
                  shadowRadius: 4,
                  elevation: 5,
                  margin: 1,
                }}>
                <View style={{width: '40%', height: '100%'}}>
                  <FastImage
                    resizeMode="cover"
                    source={
                      item.image_url
                        ? {uri: item.image_url}
                        : require('../../assets/images/gift_fund.png')
                    }
                    style={{
                      width: '100%',
                      height: '100%',
                      borderTopLeftRadius: 10,
                      borderBottomLeftRadius: 10,
                    }}
                  />
                  <FastImage
                    source={
                      item.profile_image_url
                        ? {uri: item.profile_image_url}
                        : require('../../assets/images/user_placeholder.png')
                    }
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      shadowColor: 'rgba(0, 0, 0, 0.9)',
                      shadowOffset: {
                        width: 0,
                        height: 3,
                      },
                      shadowRadius: 6,
                      shadowOpacity: 1,
                    }}
                  />
                </View>
                <View
                  style={{
                    width: '60%',
                    paddingVertical: scaledSize(14),
                    paddingHorizontal: scaledSize(10),
                    justifyContent: 'space-between',
                  }}>
                  <View>
                    <Text
                      numberOfLines={2}
                      style={{
                        fontSize: scaledSize(18),
                        fontWeight: '600',
                        fontFamily: 'SFPro',
                        color: '#000',
                      }}>
                      {item.gift_name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter-Regular',
                        fontSize: scaledSize(14),
                        fontWeight: '500',
                        letterSpacing: -0.26,
                        color: '#000000',
                        paddingTop: 10,
                        lineHeight: 20,
                      }}>
                      ${item.current_amount} of ${item.target_amount}
                    </Text>
                  </View>
                  <Bar
                    progress={getBarProgress(
                      item.current_amount,
                      item.target_amount,
                    )}
                    width={null}
                    color={colors.primary}
                    unfilledColor="#E6E6E6"
                    borderWidth={0}
                    height={6}
                    style={{marginVertical: 2}}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 8,
                    }}>
                    {item.contributors?.map((contributor, index) => (
                      <FastImage
                        key={index}
                        source={{uri: contributor.profile_image_url}}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 15,
                          borderWidth: 2,
                          borderColor: 'white',
                          marginLeft: index > 0 ? 4 : 0,
                        }}
                      />
                    ))}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',

                      justifyContent: 'space-evenly',
                      marginTop: 10,
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        shareEventLink(
                          item?.gift_name + ' - ' + item?.description,
                          'giftfunds',
                          item?.gift_fund_id,
                        );
                      }}
                      style={{
                        width: scaledSize(62),
                        alignItems: 'center',
                        backgroundColor: '#E4E4E5',
                        paddingVertical: scaledSize(7),
                        marginRight: 7,
                        borderRadius: 8,
                      }}>
                      <Text
                        style={{
                          color: '#333',
                          fontSize: scaledSize(14),
                          fontWeight: '600',
                          fontFamily: 'Inter-Regular',
                        }}>
                        Share
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('giftfundinfo', {
                          fundDetails: item || {},
                        });
                      }}
                      style={{
                        width: scaledSize(120),
                        alignItems: 'center',
                        backgroundColor: colors.primary,
                        paddingVertical: scaledSize(7),
                        // paddingHorizontal: scaledSize(12),
                        borderRadius: 8,
                      }}>
                      <Text
                        style={{
                          color: '#fff',
                          fontFamily: 'Inter-Regular',
                          fontSize: scaledSize(14),
                          fontWeight: '600',
                        }}>
                        Gift an amount
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            onSnapToItem={setActiveIndex}
          />

          <View style={styles.indicatorContainer}>
            {giftFunds.map((_: any, index: number) => renderIndicator(index))}
          </View>
        </View>

        <View style={styles.aboutDivider} />

        <View style={[styles.aboutContainer, {flexDirection: 'column'}]}>
          <Text style={[styles.aboutLabel, {paddingBottom: 0}]}>
            Your wishlist
          </Text>
          <Text
            style={[
              styles.aboutLabel,
              {fontSize: 14, paddingTop: 8, fontWeight: 'normal'},
            ]}>
            Add all the products you love to your public wishlist, automatically
            organized according to budget.
          </Text>
        </View>

        <FlatList
          data={wishlistCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderGifts}
          style={{paddingHorizontal: 20}}
        />

        <TouchableOpacity
          style={styles.addContainer}
          onPress={() => setShowWishlistModal(true)}>
          <Icon icon={ic_add} size={19} />
          <Text style={styles.addLabel}>Add an item</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};
export default Dashboard;
