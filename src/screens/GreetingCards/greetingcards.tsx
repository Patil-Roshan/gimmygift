/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  SectionList,
  FlatList,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useNavigation} from '@react-navigation/native';
import colors from '../../theme/colors';
import Feather from 'react-native-vector-icons/Feather';
import {supabase} from '../../lib/supabase';
import GradientText from '../../components/GradientText';
import RNFS from 'react-native-fs';

export default function GreetingCards() {
  const [cardDetails, setCardDetails] = useState([]);

  const navigation = useNavigation<any>();

  async function downloadAndSaveImage(url, folder, fileName) {
    const path = `${RNFS.DocumentDirectoryPath}/${folder}/${fileName}`;
    const fileExists = await RNFS.exists(path);
    if (fileExists) {
      return `file://${path}`;
    } else {
      const dirExists = await RNFS.exists(
        `${RNFS.DocumentDirectoryPath}/${folder}`,
      );
      if (!dirExists) {
        await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/${folder}`);
      }
      await RNFS.downloadFile({fromUrl: url, toFile: path}).promise;
      return `file://${path}`;
    }
  }

  async function listFiles(folder: string) {
    const {data, error} = await supabase.storage
      .from('assets')
      .list(`GREETING_CARDS/${folder}`, {
        limit: 100,
        offset: 0,
      });
    if (error) {
      console.error('Error listing files:', error);
      return [];
    }

    const fileWithLocalPath = await Promise.all(
      data.map(async (file: any) => {
        const {data: urlData} = await supabase.storage
          .from('assets')
          .createSignedUrl(`GREETING_CARDS/${folder}/${file.name}`, 86400);
        const localPath = await downloadAndSaveImage(
          urlData.signedUrl,
          folder,
          file.name,
        );
        return {...file, localPath};
      }),
    );

    console.log(
      'filesWithLocalPaths--->',
      JSON.stringify(fileWithLocalPath, null, 2),
    );

    return fileWithLocalPath;
  }

  const fetchAllFiles = useCallback(async () => {
    const folders = ['BIRTHDAY', 'CHRISTMAS', 'FATHERS_DAY'];
    const allFiles: any = {};
    for (const folder of folders) {
      const files = await listFiles(folder);
      allFiles[folder] = files;
    }
    return allFiles;
  }, []);

  useEffect(() => {
    fetchAllFiles().then(allFiles => {
      if (allFiles) {
        setCardDetails(allFiles);
      }
    });
  }, [fetchAllFiles]);

  const formatDataForSectionList = cardDetails => {
    return Object.keys(cardDetails).map(key => ({
      title: key,
      data: cardDetails[key],
    }));
  };

  const renderCategoryLabel = (label: string) => {
    return (
      <TouchableOpacity style={styles.filterContainer}>
        <Text style={styles.filterLabel}>{label}</Text>
        <AntDesign name="right" color={'rgba(0, 0, 0, 0.3)'} size={16} />
      </TouchableOpacity>
    );
  };

  const sections = formatDataForSectionList(cardDetails);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLView}>
          <AntDesign
            name="left"
            color={colors.primary}
            style={{paddingHorizontal: 15}}
            size={25}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.label}>Greeting Cards</Text>
        </View>
      </View>

      <View
        style={{backgroundColor: '#fff', width: '100%', paddingVertical: 20}}>
        <View style={styles.searchContainer}>
          <Feather name="search" color={'#717174'} size={18} />
          <TextInput
            placeholder="Search occasion, style, color…"
            style={styles.searchInput}
            placeholderTextColor={'#717174'}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        contentContainerStyle={{
          marginVertical: 10,
          height: 40,
          alignItems: 'center',
        }}>
        {renderCategoryLabel('Birthday')}
        {renderCategoryLabel('All styles')}
        {renderCategoryLabel('Mix of colors')}
        {renderCategoryLabel('Only free')}
      </ScrollView>

      <View style={styles.newCardContainer}>
        <View style={{width: '30%', alignSelf: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('newgreetingcard', {
                cardURL:
                  'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
              })
            }
            style={styles.newCardSubContainer}>
            <Feather
              name="plus-circle"
              color={'rgba(1, 0, 0, 0.3)'}
              size={20}
            />
          </TouchableOpacity>
        </View>
        <View style={{width: '80%', justifyContent: 'center'}}>
          <Text style={styles.newCardLabel}>New greeting card</Text>
          <GradientText>Generate with AI</GradientText>
          <Text
            style={[styles.newCardLabel, {fontSize: 12, fontWeight: 'normal'}]}>
            Free • No credit limitations.
          </Text>
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => null}
        renderSectionHeader={({section: {title, data}}) => (
          <View style={styles.section}>
            <View style={styles.header}>
              <Text style={styles.headerText}>{title}</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            <View>
              <FlatList
                horizontal
                data={data.slice(0, Math.ceil(data.length / 2))}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() =>
                      navigation.navigate('newgreetingcard', {
                        cardURL: item.localPath,
                      })
                    }>
                    <Image
                      source={{uri: item.localPath}}
                      style={styles.image}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
              />
              <FlatList
                horizontal
                data={data.slice(Math.ceil(data.length / 2))}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() =>
                      navigation.navigate('newgreetingcard', {
                        cardURL: item.localPath,
                      })
                    }>
                    <Image
                      source={{uri: item.localPath}}
                      style={styles.image}
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {},
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
  },
  headerLView: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 32,
    fontWeight: 'bold',
    fontStyle: 'normal',
    color: '#565459',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 22,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchInput: {
    fontSize: 18,
    marginLeft: 5,
    paddingVertical: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginHorizontal: 4,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  filterLabel: {
    fontFamily: 'SFPro',
    fontSize: 15,
    fontWeight: 'normal',
    fontStyle: 'normal',
    color: '#000000',
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  newCardContainer: {
    width: '100%',
    flexDirection: 'row',
    marginVertical: 5,
    borderTopWidth: 0.2,
    borderBottomWidth: 0.2,
    paddingVertical: 18,
    borderColor: 'rbga(0, 0, 0, 0.05)',
  },
  newCardSubContainer: {
    width: 70,
    height: 90,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  newCardLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: '600',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
  },
  categoryLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
  },
  cardStyle: {
    width: 140,
    height: 180,
    margin: 10,
    borderRadius: 5,
  },
  wishlistModalLabel: {
    fontSize: 18,
    color: '#000',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  viewAllSection: {
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'space-between',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 18,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAll: {
    color: 'red',
  },
  item: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 140,
    height: 180,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#d6d6d6',
    borderRadius: 5,
  },
  section: {
    marginBottom: 20,
  },
});
