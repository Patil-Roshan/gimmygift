/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  Text,
  TextInput,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SectionList,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import activeUserInstance from '../../../store/activeUsersInstance';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {styles} from './recipients.styles';
import {relationships, relationshipsTags} from '../../referenceData';
import {fetchUserRecipients} from '../../lib/supabaseQueries';
import {fetchQuickChoiceRecipients} from '../../lib/supabaseFunctions';
import ShimmerPlaceholderVertical from '../../components/ShimmerPlaceholdersVertical';
import contactsInstance from '../../../store/contactsInstance ';
import {supabase} from '../../lib/supabase';
import Toast from 'react-native-toast-message';
import MultiSelectionModal from '../../components/MultiSelectionModal';
import {RootStackParamList} from '../../types';
import FastImage from 'react-native-fast-image';
import RNFS from 'react-native-fs';
import {getContacts} from '../../permission';

export default function Recipients() {
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  // const userContacts = contactsInstance((state: any) => state.userContacts);

  const setUserContacts = contactsInstance(
    (state: any) => state.setUserContacts,
  );

  async function fetchData() {
    setIsLoading(true);
    const recipients = await fetchUserRecipients(activeUsers[0].user_id);

    if (recipients.length > 0) {
      const {data: relationshipsDetails, error} = await supabase
        .from('user_relationships')
        .select('relationship_id, relationships')
        .eq('user_id', activeUsers[0].user_id);

      if (error) {
        throw new Error(error.message);
      }

      const recipientsWithRelationships = recipients.map(recipient => {
        const recipientRelationships = relationshipsDetails.filter(
          relationship => relationship.relationship_id === recipient.user_id,
        );

        const relationshipTypes = recipientRelationships
          .map(relationship => relationship.relationships)
          .flat();

        const relationshipsString = relationshipTypes.join(', ');
        return {
          ...recipient,
          relationships: relationshipsString,
        };
      });
      const combinedData = recipientsWithRelationships.concat(contacts);
      const sections = await getSections(combinedData);
      setRecipients(sections);
      setSearchHolder([...recipientsWithRelationships, ...contacts]);
    } else {
      console.log('contacts lentghu', contacts.length);

      const sections = await getSections(contacts);

      setRecipients(sections);
      setSearchHolder(contacts);
    }
    setIsLoading(false);
  }

  const navigation: NavigationProp<RootStackParamList> = useNavigation();
  // useFocusEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       await fetchContacts();
  //       await fetchData();
  //       await fetchQuickChoices();
  //     } catch (error) {
  //       console.error('Error loading data:', error);
  //     }
  //   };

  //   loadData();
  //   return () => {};
  // }, [activeUsers]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (isMounted) {
          await fetchContacts();

          await fetchQuickChoices();
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    // Only run when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });

    // Run once on mount
    loadData();

    // Cleanup
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const transformContacts = (contacts: any, platform: string) => {
    return contacts?.map((contact: any, index: number) => {
      let full_name = '';
      let phone = '';
      let email = '';

      if (platform === 'ios') {
        full_name = `${contact.givenName || ''} ${contact.middleName || ''} ${
          contact.familyName || ''
        }`.trim();
        phone = contact.phoneNumbers?.[0]?.number || '';
        email = contact.emailAddresses?.[0]?.email || '';
      } else if (platform === 'android') {
        full_name =
          contact.displayName ||
          `${contact.givenName || ''} ${contact.middleName || ''} ${
            contact.familyName || ''
          }`.trim();
        phone = contact.phoneNumbers?.[0]?.number || '';
        email = contact.emailAddresses?.[0]?.email || '';
      }

      return {
        id: index + 1,
        full_name,
        phone,
        email,
        type: 'contact',
      };
    });
  };

  const fetchContacts = async () => {
    try {
      const allContacts: any = await getContacts();
      console.log('allContacts len', allContacts.length);
      await fetchData();
      if (allContacts.length < 1) {
        await setUserContacts([]);
        return;
      }
      const unifiedContacts = await transformContacts(allContacts, Platform.OS);
      await setContacts(unifiedContacts);
      await setUserContacts(unifiedContacts);

      const contactsJson = JSON.stringify(unifiedContacts);
      const jsonFilePath = `${RNFS.DocumentDirectoryPath}/contacts.json`;
      await RNFS.writeFile(jsonFilePath, contactsJson, 'utf8');
      const fileContent = await RNFS.readFile(jsonFilePath, 'utf8');
      const filePath = `${activeUsers[0]?.user_id}/contacts.json`;

      const {error} = await supabase.storage
        .from('profiles')
        .upload(filePath, fileContent, {
          contentType: 'application/json',
          upsert: true,
        });

      if (error) {
        console.log('Upload error:', error);
      }
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [contacts, setContacts] = useState([]);

  const [selectedTag, setSelectedTag] = useState('All');

  const [selectedRelationship, setSelectedRelationship] = useState<string[]>(
    [],
  );
  const [recipients, setRecipients] = useState<any>([]);
  const [searchHolder, setSearchHolder] = useState<any>([]);
  const [quickChoices, setQuickChoices] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipient, setSelectedReceipient] = useState<any>('');
  const fetchQuickChoices = async () => {
    const quickChoicesRecipients = await fetchQuickChoiceRecipients();
    setQuickChoices(quickChoicesRecipients || []);
  };

  const renderQuickChoices = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.frequentRecipientContainer}
      onPress={() =>
        navigation.navigate('recipientgiftprofile', {profile: item})
      }>
      <Image
        source={
          item.profile_image
            ? {uri: item.profile_image}
            : require('../../assets/images/user_placeholder.png')
        }
        style={styles.image}
      />
      <Text style={styles.imageText}>{item.full_name?.split(' ')[0]}</Text>
    </TouchableOpacity>
  );

  const getSections = (data: any) => {
    const sections: any = {};
    data.forEach((item: any) => {
      const firstLetter = item.full_name[0].toUpperCase();
      if (!sections[firstLetter]) {
        sections[firstLetter] = [];
      }
      sections[firstLetter].push(item);
    });

    return Object.keys(sections)
      .sort()
      .map(key => ({
        title: key,
        data: sections[key],
      }));
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filteredData = searchHolder.filter((item: any) => {
      return item?.full_name?.toLowerCase().includes(text.toLowerCase());
    });

    setRecipients(getSections(filteredData));
  };

  const handleTags = (tag: string) => {
    if (tag === 'All') {
      const sections = getSections(searchHolder);
      setRecipients(sections);
      return;
    }

    const filteredOccasions = searchHolder.filter((occasion: any) => {
      const eventTypeMatches = occasion?.relationships
        ?.toLowerCase()
        .includes(tag?.toLowerCase());
      return eventTypeMatches;
    });
    const sections = getSections(filteredOccasions);
    setRecipients(sections);
  };

  const [searchText, setSearchText] = useState('');

  const updateRelationship = async () => {
    const {error} = await supabase
      .from('user_relationships')
      .update({relationships: selectedRelationship})
      .eq('user_id', activeUsers[0].user_id)
      .eq('relationship_id', selectedReceipient?.user_id);
    if (!error) {
      fetchData();
      Toast.show({
        type: 'success',
        text1: 'Relationship updated successfully',
        visibilityTime: 2000,
        position: 'bottom',
      });
      console.log('error', error);
    } else {
      console.log('error', error);
    }
  };

  const emptyRecipientView = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: Dimensions.get('window').height * 0.4,
        }}>
        <FastImage
          source={require('../../assets/images/no_recipients.png')}
          style={{height: 132, width: '100%', alignSelf: 'center'}}
        />
        <Text
          style={{
            fontFamily: 'SFPro',
            fontSize: 16,
            fontWeight: '600',
            fontStyle: 'normal',
            lineHeight: 20,
            letterSpacing: 0,
            textAlign: 'center',
            color: '#000000',
          }}>
          {recipients.length === 0 && searchText.length < 1
            ? '0 recipients'
            : 'No search results found'}
        </Text>

        {recipients.length === 0 && searchText.length < 1 && (
          <>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 14,
                fontWeight: 'normal',
                fontStyle: 'normal',
                lineHeight: 18,
                letterSpacing: 0,
                textAlign: 'center',
                color: '#848484',
                paddingVertical: 5,
              }}>
              Create a recipient’s profile or import your contacts
            </Text>
            <TouchableOpacity
              onPress={() => fetchContacts()}
              style={{
                width: 154,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: 20,
              }}>
              <Text
                style={{
                  fontFamily: 'Inter-Regular_',
                  fontSize: 16,
                  fontWeight: '500',
                  fontStyle: 'normal',
                  lineHeight: 16,
                  letterSpacing: 0,
                  textAlign: 'center',
                  color: '#000000',
                }}>
                Import contacts
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={{flex: 1}}>
      <SafeAreaView style={{backgroundColor: 'rgba(249, 249, 249, 0.8)'}} />
      <StatusBar barStyle={'dark-content'} />
      <ScrollView>
        <SafeAreaView />
        <MultiSelectionModal
          data={relationships}
          isOpen={showRelationshipModal}
          onSelect={async (item: string[]) => {
            await setSelectedRelationship(item);
          }}
          title="Relationship"
          onClose={() => {
            updateRelationship();
            setShowRelationshipModal(false);
          }}
        />

        <View
          style={{
            backgroundColor: '#rgba(249, 249, 249, 0.8)',
            paddingHorizontal: 16,
          }}>
          <View style={styles.container}>
            <Text style={styles.title}>Recipients list</Text>
          </View>
          <View style={styles.searchContainer}>
            <Feather
              name="search"
              color={'rgba(0, 0, 0, 0.5)'}
              size={18}
              style={{marginRight: 10}}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search someone"
              placeholderTextColor="rgba(0, 0, 0, 0.5)"
              value={searchText}
              onChangeText={(text: string) => handleSearch(text)}
            />
          </View>
        </View>
        <View style={styles.divider} />

        <View style={styles.labelContainer}>
          <FlatList
            data={relationshipsTags}
            horizontal
            style={{backgroundColor: '#efeff4'}}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.label,
                  {
                    backgroundColor:
                      selectedTag === item.title
                        ? 'rgba(0, 0, 0, 0.5)'
                        : 'transparent',
                  },
                ]}
                onPress={() => {
                  setSelectedTag(item.title);
                  handleTags(item.title);
                }}>
                <Text
                  style={[
                    styles.labelText,
                    {
                      color: selectedTag === item.title ? '#fff' : '#000',
                    },
                  ]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.title}
          />
        </View>

        <View style={styles.mainSection}>
          <FlatList
            data={quickChoices}
            renderItem={renderQuickChoices}
            keyExtractor={item => item.user_id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imageContainer}
          />
        </View>

        {isLoading ? (
          <FlatList
            data={[1, 2, 3]}
            renderItem={() => <ShimmerPlaceholderVertical />}
            keyExtractor={item => item.toString()}
          />
        ) : (
          <SectionList
            sections={recipients}
            style={{backgroundColor: '#efeff4', paddingHorizontal: 16}}
            ListEmptyComponent={() => emptyRecipientView()}
            renderSectionHeader={({section: {title}}) => (
              <Text
                style={{
                  color: 'rgba(60, 60, 67, 0.6)',
                  paddingHorizontal: 5,
                  marginTop: 17,
                  marginBottom: 5,
                }}>
                {title}
              </Text>
            )}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.userView}
                onPress={() =>
                  navigation.navigate('recipientgiftprofile', {profile: item})
                }>
                <View style={styles.userDetailsContainer}>
                  <View style={styles.userDetails}>
                    <View>
                      <Image
                        source={
                          item.type === 'contact'
                            ? require('../../assets/images/user_placeholder.png')
                            : {uri: item.profile_image}
                        }
                        style={styles.profile}
                      />
                      {item.type !== 'contact' && (
                        <View style={styles.notificationIconContainer}>
                          <Image
                            source={require('../../assets/icons/ic_logo.png')}
                            style={styles.notificationIcon}
                          />
                        </View>
                      )}
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.full_name}</Text>
                      {item.type !== 'contact' && (
                        <TouchableOpacity
                          onPress={async () => {
                            await setSelectedReceipient(item);
                            setShowRelationshipModal(true);
                          }}>
                          <Text style={[styles.userDescription]}>
                            {item.relationships
                              ? item?.relationships
                              : 'Add Relationship'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </ScrollView>
    </View>
  );
}
