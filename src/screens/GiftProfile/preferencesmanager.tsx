/* eslint-disable react-native/no-inline-styles */
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import colors from '../../theme/colors';
import Feather from 'react-native-vector-icons/Feather';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import Modal from 'react-native-modal';
import activeUserInstance from '../../../store/activeUsersInstance';
import {supabase} from '../../lib/supabase';
import Icon from '../../components/Icon';
import {chevronBack, ic_new_product} from '../../assets/icons/icons';
import {config} from '../../config';

interface Preference {
  id: string;
  type: string;
  answers: string[];
  category: string;
  question: string;
  response: string;
  timestamp: string;
}
export default function PreferencesManager() {
  useEffect(() => {
    fetchQuestions();
  }, []);
  const navigation = useNavigation();
  const [activeToggle, setActiveToggle] = useState('Answered');
  const [questions, setQuestions] = useState([]);
  const activeUsers = activeUserInstance((state: any) => state.activeUsers);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>('');
  const selectedAnswers: any = [];
  const [showAddPrefsModal, setShowAddPrefsModal] = useState(false);
  const [categories, setCategories] = useState([
    {id: 1, title: 'Size', count: 0},
    {id: 2, title: 'Brand', count: 0},
    {id: 3, title: 'Color', count: 0},
    {id: 4, title: 'Style', count: 0},
  ]);

  const updateCategoryCounts = apiResponse => {
    const updatedCategories = [...categories];
    const categoryMap = new Map(
      updatedCategories.map(cat => [cat.title.toLowerCase(), cat]),
    );
    apiResponse.forEach(item => {
      const category = categoryMap.get(item.category.toLowerCase());

      if (category) {
        category.count += 1;
      }
    });

    setCategories(updatedCategories);
  };

  const fetchQuestions = async () => {
    const {data, error} = await supabase
      .from('profiles')
      .select('questions')
      .eq('user_id', activeUsers[0]?.user_id);

    if (!error && data) {
      console.log('data', JSON.stringify(data[0]?.questions));

      setQuestions(data[0]?.questions);
      updateCategoryCounts(data[0]?.questions);
    }
  };
  const renderToggle = (label: string) => {
    return (
      <TouchableOpacity
        onPress={() => setActiveToggle(label)}
        style={{
          borderBottomColor:
            activeToggle === label ? colors.primary : '#d6d6d6',
          borderBottomWidth: 1,
          paddingBottom: 10,
          width: '50%',
        }}>
        <Text
          style={[
            styles.toggleLabel,
            {color: activeToggle === label ? '#000' : '#797979'},
          ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };
  const renderEditModal = () => {
    return (
      <Modal
        isVisible={showEditModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowEditModal(false)}
        onBackdropPress={() => setShowEditModal(false)}>
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
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              style={styles.modalBtnLabel}
              onPress={() => setShowEditModal(false)}>
              Cancel
            </Text>
            <Text style={styles.modalBtnTitle}>Manage answers</Text>
            <Text
              style={styles.modalBtnLabel}
              onPress={() => setShowEditModal(false)}>
              Save
            </Text>
          </View>
          <View style={styles.optionsContainer}>
            <Text
              style={{
                fontFamily: 'SFPro',
                fontSize: 25,
                fontWeight: '600',
                fontStyle: 'normal',
                lineHeight: 28,
                letterSpacing: 0,
                textAlign: 'center',
                color: '#000000',
                marginVertical: 40,
              }}>
              {currentQuestion.question}
            </Text>
            {currentQuestion?.type === 'image' &&
              currentQuestion?.answers.map((option: any) => (
                <TouchableOpacity
                  key={option.title}
                  style={[
                    styles.imageOptionButton,
                    selectedAnswers.includes(option.title) &&
                      styles.optionSelected,
                  ]}>
                  <Image source={{uri: option.images}} style={styles.image} />
                  <Text
                    style={[
                      styles.optionText,
                      selectedAnswers.includes(option) &&
                        styles.optionTextSelected,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            {currentQuestion?.type === 'color' &&
              currentQuestion?.answers.map((option: any) => (
                <TouchableOpacity
                  key={option.title}
                  style={[
                    styles.colorBox,
                    selectedAnswers.includes(option.title) &&
                      styles.optionSelected,
                  ]}>
                  <View
                    style={[
                      styles.colorBoxInner,
                      {backgroundColor: option.images},
                    ]}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedAnswers.includes(option.title) &&
                        styles.optionTextSelected,
                    ]}>
                    {option.title}
                  </Text>
                </TouchableOpacity>
              ))}
            {!currentQuestion?.type &&
              currentQuestion?.answers?.map((option: any) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    selectedAnswers.includes(option) && styles.optionSelected,
                  ]}>
                  <Text
                    style={[
                      styles.optionText,
                      selectedAnswers.includes(option) &&
                        styles.optionTextSelected,
                    ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </ScrollView>
      </Modal>
    );
  };

  const removeHighlighted = async () => {
    try {
      const {data, error} = await supabase
        .from('profiles')
        .select('highlighted_preferences')
        .eq('user_id', activeUsers[0]?.user_id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      let preferences: Preference[] = data?.highlighted_preferences || [];
      const preferenceExists = preferences.some(
        p => p.id === currentQuestion.id,
      );
      if (!preferenceExists) {
        preferences.push(currentQuestion);
      }

      // Update the highlighted_preferences field in the database
      const {error: updateError} = await supabase
        .from('profiles')
        .update({highlighted_preferences: preferences})
        .eq('user_id', activeUsers[0]?.user_id);

      console.log('updateError', updateError);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setShowAddPrefsModal(false);
    } catch (error) {
      setShowAddPrefsModal(false);
      console.error('Error updating highlighted preferences:', error.message);
    }
  };

  const renderAddPreferences = () => {
    return (
      <Modal
        isVisible={showAddPrefsModal}
        style={{margin: 0}}
        onBackdropPress={() => setShowAddPrefsModal(false)}>
        <View
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
              width: '100%',
              borderBottomColor: '#d6d6d6',
              borderBottomWidth: 0.8,
              paddingVertical: 5,
            }}
          />
          <TouchableOpacity
            onPress={() => removeHighlighted()}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
            }}>
            <Icon icon={ic_new_product} size={24} />
            <Text style={{marginLeft: 10, fontSize: 18}}>
              Add to Highlighted
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  return (
    <View>
      <SafeAreaView style={{backgroundColor: '#fff'}} />
      <StatusBar barStyle="dark-content" />
      {renderEditModal()}
      {renderAddPreferences()}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          paddingHorizontal: 14,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon icon={chevronBack} size={26} tintColor={colors.primary} />
        </TouchableOpacity>
        <FastImage
          style={styles.profileImage}
          source={
            activeUsers[0]?.profile_image
              ? {uri: activeUsers[0]?.profile_image}
              : require('../../assets/images/user_placeholder.png')
          }
          resizeMode="contain"
        />
        <Text style={styles.profileLabel}>{activeUsers[0]?.full_name}</Text>
        <Feather name="search" color={colors.primary} size={26} />
      </View>
      <View style={styles.toggleContainer}>
        {renderToggle('Answered')}
        {renderToggle('Skipped')}
      </View>
      <ScrollView style={styles.container}>
        <ScrollView style={styles.tagContainer} horizontal>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginVertical: 15,
            }}>
            <Text
              style={[
                styles.filterLabel,
                {backgroundColor: '#6C6C6F', color: '#fff'},
              ]}>
              All
            </Text>
            <Text style={styles.filterLabel}>Clothings</Text>
            <Text style={styles.filterLabel}>Shoes</Text>
            <Text style={styles.filterLabel}>Bags and accessories</Text>
          </View>
        </ScrollView>
        {activeToggle === 'Answered' && (
          <>
            <FlatList
              data={categories}
              numColumns={2}
              renderItem={({item}) => (
                <View style={styles.cardContainer} key={item.id}>
                  <View style={styles.card}>
                    <View style={{width: '70%'}}>
                      <Text style={{color: '#000', fontWeight: '600'}}>
                        {item.title}
                      </Text>
                      <Text style={{color: '#797979'}}>{item.count}</Text>
                    </View>
                    <FastImage
                      source={require('../../assets/icons/chevronRight.png')}
                      style={{width: 22, height: 22}}
                    />
                  </View>
                </View>
              )}
            />

            <Text style={styles.answerLabel}>Answered questions</Text>
            <Text style={styles.skippedDescription}>
              Tap on the question to manage the selected options and manage the
              order of preference.
            </Text>

            {questions.map((item: any) => (
              <View key={item.question} style={styles.questionCard}>
                <View style={styles.questionSubCard}>
                  <Text style={styles.questionLabel}>{item.question}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentQuestion(item);
                      setShowAddPrefsModal(true);
                    }}>
                    <Entypo
                      name="dots-three-horizontal"
                      color={'#A9A9A9'}
                      size={25}
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  style={{flexDirection: 'row'}}
                  showsHorizontalScrollIndicator={false}>
                  {item?.type === 'text' &&
                    item?.answers?.map((option: string) => (
                      <View
                        // onPress={() => {
                        //   setCurrentQuestion(item);
                        //   setShowEditModal(true);
                        // }}
                        key={option}
                        style={[styles.listItem]}>
                        <Text style={[styles.listLabel]}>{option}</Text>
                      </View>
                    ))}
                  {item?.type === 'image' &&
                    item?.answers?.map((option: string) => (
                      <View
                        // onPress={() => {
                        //   setCurrentQuestion(item);
                        //   setShowEditModal(true);
                        // }}
                        key={option}
                        style={[styles.listItem]}>
                        <Image
                          source={{
                            uri: `${
                              config.SUPABASE_URL
                            }/storage/v1/object/public${option?.trim()}`,
                          }}
                          style={{height: 50, width: 50}}
                        />
                      </View>
                    ))}
                </ScrollView>
              </View>
            ))}

            <View style={{marginBottom: '50%'}} />
          </>
        )}

        {activeToggle === 'Skipped' && (
          <>
            <Text style={styles.answerLabel}>Skipped questions</Text>
            <Text style={styles.skippedDescription}>
              Tap on the question to answer, selecting one or more options, and
              manage the order of preference.
            </Text>

            {/* <View style={styles.questionCard}>
                <View style={styles.questionSubCard}>
                  <Text style={styles.questionLabel}>
                    What type of trousers do you prefer?
                  </Text>
                  <TouchableOpacity>
                    <Entypo
                      name="dots-three-horizontal"
                      size={25}
                      color={'#A9A9A9'}
                    />
                  </TouchableOpacity>
                </View>
              </View> */}
          </>
        )}
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ECECF3',
    flexGrow: 1,
    height: '100%',
    paddingHorizontal: 16,
  },
  profileImage: {width: 42, height: 42, marginHorizontal: 10, borderRadius: 21},
  profileLabel: {
    fontSize: 25,
    color: '#000',
    fontWeight: '500',
    paddingHorizontal: 10,
    width: '68%',
  },
  tagContainer: {
    backgroundColor: '#ECECF3',
    width: '100%',
    paddingVertical: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
    paddingTop: 30,
    backgroundColor: '#fff',
  },
  toggleLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'center',
    color: '#000000',
  },
  filterLabel: {
    fontFamily: 'SFPro',
    fontSize: 15,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    marginEnd: 10,
    paddingVertical: 5,
    overflow: 'hidden',
    borderRadius: 8,
  },
  cardContainer: {
    flexDirection: 'row',
    width: '51%',
    marginTop: 12,
  },
  card: {
    backgroundColor: '#fff',
    width: '95%',
    height: 75,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  questionCard: {
    backgroundColor: '#fff',
    width: '100%',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 18,
    overflow: 'hidden',
    marginTop: 12,
  },
  questionSubCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questionLabel: {
    color: '#000',
    fontWeight: '600',
    fontSize: 18,
    width: '95%',
  },
  listItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 5,
    borderRadius: 21,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    width: 'auto',
  },
  listLabel: {
    fontSize: 16,
    color: '#000',
  },
  answerLabel: {
    fontFamily: 'SFPro',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
    marginTop: 40,
  },
  skippedDescription: {
    fontFamily: 'SFPro',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    color: '#000000',
    marginTop: 5,
  },
  modalBtnTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 27,
    letterSpacing: 0,
    color: '#000000',
    marginTop: 25,
  },
  modalBtnLabel: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 27,
    letterSpacing: 0,
    color: colors.primary,
    marginTop: 25,
  },
  imageOptionButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
    margin: 5,
    borderRadius: 10,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    width: '45%',
    backgroundColor: '#fff',
  },
  optionSelected: {
    backgroundColor: '#77777A',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  optionTextSelected: {
    fontSize: 16,
    color: '#fff',
  },
  colorBox: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 8,
    alignItems: 'center',
    margin: 5,
    borderRadius: 21,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    width: 'auto',
    backgroundColor: '#fff',
  },
  colorBoxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'center',
    paddingHorizontal: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 5,
    borderRadius: 21,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    width: 'auto',
    backgroundColor: '#fff',
  },
});
