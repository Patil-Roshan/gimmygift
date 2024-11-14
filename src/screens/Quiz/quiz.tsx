/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {quizQuestions} from '../../referenceData';
import Icon from '../../components/Icon';
import {
  answers_black,
  back_black,
  ic_answers,
  ic_back,
  ic_pick_profile,
  ic_quiz,
  ic_quiz_profile,
  ic_small_profile,
  quiz_order,
} from '../../assets/icons/icons';
import Button from '../../components/Button';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import colors from '../../theme/colors';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {RootStackParamList} from '../../types';
import Modal from 'react-native-modal';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import {getUserId} from '../../lib/session';
import {supabase} from '../../lib/supabase';
import Feather from 'react-native-vector-icons/Feather';
import {config} from '../../config';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import scaledSize from '../../scaleSize';
const Quiz = () => {
  const [questions, setQuestions] = useState<any>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [originalQuestions, setOriginalQuestions] = useState<any>([]);
  const [answers, setAnswers] = useState<any>([]);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showOuterReorderModal, setOuterShowReorderModal] = useState(false);

  const [reorderData, setReorderData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const [showFirstAccessModal, setShowFirstAccessModal] = useState(false);

  let currentQuestion: any = questions[currentQuestionIndex];
  const selectedAnswers = answers[currentQuestionIndex]?.answers || [];

  const handleSearch = (query: string) => {
    if (query) {
      const filtered = [
        ...originalQuestions[currentQuestionIndex].response?.split(', '),
      ].filter((name: string) =>
        name.toLowerCase().includes(query.toLowerCase()),
      );
      const updatedQuestion = {
        ...questions[currentQuestionIndex],
        response: filtered.join(', '),
      };
      setQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions];
        newQuestions[currentQuestionIndex] = updatedQuestion;
        return newQuestions;
      });
    } else {
      setQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions];
        newQuestions[currentQuestionIndex] = {
          ...originalQuestions[currentQuestionIndex],
        };
        return newQuestions;
      });
    }
  };

  const navigation: NavigationProp<RootStackParamList> = useNavigation();

  const handleOptionSelect = (option: string) => {
    setAnswers((prev: any) => {
      const updatedAnswers = [...prev];
      const currentQuestion = questions[currentQuestionIndex];

      updatedAnswers[currentQuestionIndex] = updatedAnswers[
        currentQuestionIndex
      ] || {
        id: currentQuestion.id,
        question: currentQuestion.question,
        category: currentQuestion.category,
        type: currentQuestion.type,
        response: currentQuestion.response,
        timestamp: new Date().toISOString(), // Adding timestamp
        answers: [],
      };

      const answer: any = updatedAnswers[currentQuestionIndex];

      if (answer.answers.includes(option)) {
        answer.answers = answer.answers.filter((item: any) => item !== option);
      } else {
        answer.answers.push(option);
      }

      return updatedAnswers;
    });
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = async () => {
    try {
      if (selectedAnswers.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'Please select at least one option',
          position: 'bottom',
        });
        return;
      }
      setIsLoading(true);
      const userID = await getUserId();
      console.log('userID', userID);

      // Fetch the existing data from the Supabase table
      const {data, error: fetchError} = await supabase
        .from('profiles')
        .select('questions')
        .eq('auth_id', userID)
        .single();

      if (fetchError) {
        console.log('Fetch error', fetchError);
        setIsLoading(false);
        return;
      }

      // Initialize questions array if it doesn't exist
      const existingQuestions: any = data?.questions || [];

      // Check if the current question already exists in the existingQuestions array
      const currentQuestionId = answers[currentQuestionIndex].id;
      const questionIndex = existingQuestions.findIndex(
        (question: any) => question.id === currentQuestionId,
      );

      if (questionIndex !== -1) {
        // Update the existing question
        existingQuestions[questionIndex] = {
          ...existingQuestions[questionIndex],
          ...answers[currentQuestionIndex],
        };
      } else {
        // Append the new answer to the existing data
        existingQuestions.push(answers[currentQuestionIndex]);
      }

      // Update the Supabase table with the modified data
      const {error: updateError} = await supabase
        .from('profiles')
        .update({questions: existingQuestions})
        .eq('auth_id', userID);

      if (updateError) {
        console.log('Update error', updateError);
        setIsLoading(false);
        return;
      }

      // Move to the next question or navigate to tabnavigator
      if (currentQuestionIndex < questions.length - 1) {
        setIsLoading(false);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setIsLoading(false);
        navigation.replace('tabnavigator');
      }
    } catch (error) {
      setIsLoading(false);
      console.log('Error', error);
    }
  };

  const handleEditQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowAnswerModal(false);
  };

  useEffect(() => {
    checkFirstAccess();
    fetchQuestions();
    if (currentQuestion) {
      console.log('Called');

      currentQuestion.searchHolder = questions[currentQuestionIndex].response;
    }
  }, []);

  const checkFirstAccess = async () => {
    const response = await AsyncStorage.getItem('quiz_first_access');
    if (!response || response === 'false') {
      setShowFirstAccessModal(true);
    }
  };

  const fetchQuestions = async () => {
    const {data: questionResponse, error} = await supabase.functions.invoke(
      'get-questions',
      {
        method: 'GET',
      },
    );

    if (!error && questionResponse) {
      setQuestions(questionResponse);
      setOriginalQuestions(questionResponse);
    } else {
      setQuestions(quizQuestions);
      setOriginalQuestions(quizQuestions);
    }
  };

  const renderAnswersModal = () => {
    return (
      <Modal
        isVisible={showAnswerModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowAnswerModal(false)}
        onBackdropPress={() => setShowAnswerModal(false)}>
        <View style={styles.modalContainer}>
          {renderReorderModal()}
          <View style={styles.headerDragButton} />

          <View style={styles.headerModalContainer}>
            <Text style={styles.answerLabel}>List answered questions</Text>
            <Text
              onPress={() => setShowAnswerModal(false)}
              style={styles.doneLabel}>
              Done
            </Text>
          </View>
          <ScrollView>
            {answers &&
              answers?.map((item: any, index: number) => (
                <View key={item?.question} style={styles.questionCard}>
                  <View style={styles.questionSubCard}>
                    <Text style={styles.questionLabel}>{item?.question}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowReorderModal(true);
                        setReorderData({index, ...item});
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
                    {item?.answers?.map((option: string) => (
                      <TouchableOpacity
                        key={option}
                        style={[styles.listItem]}
                        onPress={() => handleEditQuestion(index)}>
                        {item?.type === 'image' ? (
                          <Image
                            source={{
                              uri: `${
                                config.SUPABASE_URL
                              }/storage/v1/object/public${option?.trim()}`,
                            }}
                            style={{width: 50, height: 50}}
                          />
                        ) : (
                          <Text style={[styles.listLabel]}>{option}</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderReorderModal = () => {
    return (
      <Modal
        isVisible={showReorderModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowReorderModal(false)}
        onBackdropPress={() => setShowReorderModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.headerDragButton} />
          <View style={styles.headerModalContainer}>
            <Text style={styles.answerLabel}>{reorderData.question}</Text>
            <Text
              onPress={() => setShowReorderModal(false)}
              style={styles.doneLabel}>
              Done
            </Text>
          </View>
          <Text style={styles.dragLabel}>
            Drag the chosen options in order of preference.
          </Text>

          <GestureHandlerRootView style={{flex: 1}}>
            <DraggableFlatList
              data={reorderData.answers}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#fff',
                width: '92%',
                alignSelf: 'center',
              }}
              renderItem={({item, drag, isActive}) => (
                <TouchableOpacity
                  style={[
                    styles.reorderItem,
                    {
                      backgroundColor: isActive ? '#f0f0f0' : '#ffffff',
                    },
                  ]}
                  onLongPress={drag}>
                  {reorderData.type === 'image' ? (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image
                        source={{
                          uri: `${
                            config.SUPABASE_URL
                          }/storage/v1/object/public${item?.trim()}`,
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          borderWidth: 1,
                          borderRadius: 5,
                          borderColor: '#d6d6d6',
                          marginHorizontal: 10,
                        }}
                      />
                      <Text style={[styles.listLabel]}>
                        {item?.split('/')?.pop()?.split('.')[0]}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.listLabel}>{item}</Text>
                  )}
                  <Entypo name="menu" size={24} color="#000" />
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `draggable-item-${item}-${index}`}
              onDragEnd={({data}) => {
                const updatedAnswers = [...answers];
                updatedAnswers[reorderData.index].answers = data;
                setAnswers(updatedAnswers);
                setReorderData({...reorderData, answers: data});
              }}
            />
          </GestureHandlerRootView>
        </View>
      </Modal>
    );
  };

  const renderOuterReorderModal = () => {
    return (
      <Modal
        isVisible={showOuterReorderModal}
        style={{margin: 0}}
        onBackButtonPress={() => setOuterShowReorderModal(false)}
        onBackdropPress={() => setOuterShowReorderModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.headerDragButton} />
          <View style={styles.headerModalContainer}>
            <Text style={styles.answerLabel}>{reorderData.question}</Text>
            <Text
              onPress={() => setOuterShowReorderModal(false)}
              style={styles.doneLabel}>
              Done
            </Text>
          </View>
          <Text style={styles.dragLabel}>
            Drag the chosen options in order of preference.
          </Text>

          <GestureHandlerRootView style={{flex: 1}}>
            <DraggableFlatList
              data={reorderData.answers}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: '#fff',
                width: '90%',
                alignSelf: 'center',
              }}
              renderItem={({item, drag, isActive}) => (
                <TouchableOpacity
                  style={[
                    styles.reorderItem,
                    {backgroundColor: isActive ? '#f0f0f0' : '#ffffff'},
                  ]}
                  onLongPress={drag}>
                  {reorderData.type === 'image' ? (
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image
                        source={{
                          uri: `${
                            config.SUPABASE_URL
                          }/storage/v1/object/public${item?.trim()}`,
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          borderWidth: 1,
                          borderRadius: 5,
                          borderColor: '#d6d6d6',
                          marginHorizontal: 10,
                        }}
                      />
                      <Text style={[styles.listLabel]}>
                        {item?.split('/')?.pop()?.split('.')[0]}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.listLabel}>{item}</Text>
                  )}
                  <Entypo name="menu" size={24} color="#000" />
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => `draggable-item-${item}-${index}`}
              onDragEnd={({data}) => {
                const updatedAnswers = [...answers];
                updatedAnswers[reorderData.index].answers = data;
                setAnswers(updatedAnswers);
                setReorderData({...reorderData, answers: data});
              }}
            />
          </GestureHandlerRootView>
        </View>
      </Modal>
    );
  };

  const firstAccessModal = () => {
    return (
      <Modal style={{margin: 0}} isVisible={showFirstAccessModal}>
        <ScrollView contentContainerStyle={styles.accessContainer}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon icon={ic_quiz_profile} size={40} tintColor="#812fff" />
          </View>

          {/* Heading */}
          <Text style={styles.title}>Preferences Quiz</Text>

          {/* Subheading */}
          <Text style={styles.subtitle}>
            Start to answer questions about your personal preferences and
            receive gifts perfect for you.
          </Text>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={async () => {
              await AsyncStorage.setItem('quiz_first_access', 'true');
              setShowFirstAccessModal(false);
            }}>
            <Text style={styles.buttonText}>Start to answer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.laterButton}
            onPress={() => {
              setShowFirstAccessModal(false);
              setTimeout(() => {
                navigation.replace('tabnavigator');
              }, 800);
            }}>
            <Text style={styles.buttonLaterText}>No, continue later</Text>
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            This process involves the use of{' '}
            <Icon icon={ic_small_profile} size={20} /> GiftProfile.{'\n'} You
            will be able to edit or delete your answers in settings.{'\n'} By
            continuing you accept our{' '}
            <Text style={styles.linkText}>Conditions</Text>.
          </Text>
        </ScrollView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{backgroundColor: 'rgba(249, 249, 249, 0.8)'}} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignContent: 'center',
        }}>
        {renderAnswersModal()}
        {firstAccessModal()}
        <View style={styles.headerContainer}>
          <View style={styles.headerLView}>
            <AntDesign
              name="close"
              color={colors.black}
              style={{paddingHorizontal: 10}}
              size={25}
              onPress={() => navigation.replace('tabnavigator')}
            />
            <Icon size={38} icon={ic_quiz} />
            <Text style={styles.label}>Preferences Quiz</Text>
          </View>

          <TouchableOpacity
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => navigation.navigate('gimmepick')}>
            <Icon icon={ic_pick_profile} size={28} tintColor="#000" />
          </TouchableOpacity>
        </View>
        <Text style={styles.questionTitle}>{currentQuestion?.question}</Text>
        <Text style={styles.questionSubTitle}>
          {currentQuestion?.description}
        </Text>
        <View style={styles.searchContainer}>
          <Feather name="search" color={'#717174'} size={18} />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor={'#717174'}
            onChangeText={text => handleSearch(text)}
            // value={searchQuery}
          />
        </View>
        <View style={styles.optionsContainer}>
          {currentQuestion?.type === 'image' &&
            currentQuestion?.response &&
            currentQuestion?.response?.split(',').map((option: any) => {
              const imageTitle = option?.split('/').pop().split('.')[0];

              return (
                <TouchableOpacity
                  key={imageTitle}
                  style={[
                    styles.imageOptionButton,
                    selectedAnswers.includes(option) && styles.optionSelected,
                  ]}
                  onPress={() => handleOptionSelect(option)}>
                  <Image
                    source={{
                      uri: `${
                        config.SUPABASE_URL
                      }/storage/v1/object/public${option?.trim()}`,
                    }}
                    style={styles.image}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      selectedAnswers.includes(option) &&
                        styles.optionTextSelected,
                    ]}>
                    {imageTitle?.charAt(0).toUpperCase() + imageTitle?.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          {currentQuestion?.type === 'color' &&
            currentQuestion?.response &&
            currentQuestion?.response?.split(', ').map((option: any) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.colorBox,
                  selectedAnswers.includes(option) && styles.optionSelected,
                ]}
                onPress={() => handleOptionSelect(option)}>
                <View
                  style={[styles.colorBoxInner, {backgroundColor: option}]}
                />
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
          {currentQuestion?.type === 'text' &&
            currentQuestion?.response &&
            currentQuestion?.response?.split(', ').map((option: any) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  selectedAnswers.includes(option) && styles.optionSelected,
                ]}
                onPress={() => handleOptionSelect(option)}>
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

      {renderOuterReorderModal()}
      {selectedAnswers?.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            setReorderData({
              index: currentQuestionIndex,
              ...answers[currentQuestionIndex],
            });
            setOuterShowReorderModal(true);
          }}
          style={{
            height: 50,
            backgroundColor: '#fff',
            width: '100%',
            position: 'absolute',
            alignItems: 'center',
            bottom: 90,
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 10,
          }}>
          <Icon icon={quiz_order} size={28} />
          <Text
            style={{
              fontFamily: 'Inter-Regular_',
              fontSize: 16,
              fontWeight: '500',
              fontStyle: 'normal',
              alignSelf: 'center',
              lineHeight: 16,
              color: '#000000',
              paddingHorizontal: 10,
            }}>
            {selectedAnswers?.length} selected • Manage order of preference
          </Text>
        </TouchableOpacity>
      )}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bottomBtnContainer]}
          disabled={selectedAnswers.length === 0}
          onPress={() => setShowAnswerModal(true)}>
          <Icon
            size={26}
            icon={selectedAnswers.length === 0 ? ic_answers : answers_black}
            tintColor="#000"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomBtnContainer}
          disabled={selectedAnswers.length === 0}
          onPress={handleBack}>
          <Icon
            size={26}
            icon={selectedAnswers.length === 0 ? ic_back : back_black}
            tintColor="#000"
          />
        </TouchableOpacity>
        <View style={{width: '70%'}}>
          <Button
            isLoading={isLoading}
            fontSize={18}
            disabled={selectedAnswers.length === 0}
            height={44}
            width={'98%'}
            label={
              currentQuestionIndex < questions.length - 1
                ? 'Continue'
                : 'Submit'
            }
            onPress={handleNext}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEDF3',
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'rgba(249, 249, 249, 0.8)',
    height: 60,
    borderBottomWidth: 0.3,
    borderBottomColor: '#969297',
  },
  headerLView: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRView: {
    width: '20%',
    justifyContent: 'center',
  },
  label: {
    color: '#000',
    fontSize: 18,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  question: {
    fontSize: 18,
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 25,
    fontWeight: '600',
    lineHeight: 28,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
    marginTop: 50,
    paddingHorizontal: 10,
  },

  questionSubTitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#414041',
    alignSelf: 'center',
    fontWeight: '400',
    marginVertical: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    alignContent: 'center',
    paddingBottom: '30%',
  },
  optionButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    margin: 4,
    // marginVertical: 5,
    borderRadius: 21,
    borderColor: '#E5E5E5',
    borderWidth: 1,
    // width: 'auto',
    minWidth: 'auto',
    backgroundColor: '#fff',
  },
  optionSelected: {
    backgroundColor: '#77777A',
    borderWidth: 0,
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
  optionText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
  optionTextSelected: {
    fontSize: 16,
    color: '#fff',
  },
  image: {
    width: '100%',
    height: 150,
    marginBottom: 5,
    borderRadius: 10,
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
  bottomBar: {
    width: '100%',
    paddingHorizontal: scaledSize(20),
    backgroundColor: 'rgba(249, 249, 249, 1)',
    borderTopColor: '#969297',
    borderTopWidth: 0.3,
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
    bottom: 0,
    zIndex: 1,
    paddingBottom: 10,
  },
  bottomBtnContainer: {
    backgroundColor: '#F1F1F2',
    height: 44,
    width: 44,
    marginRight: 10,
    borderRadius: 8,
    padding: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: '#EDEDF3',
    height: '90%',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: {
    backgroundColor: '#EDEDF3',
    height: '90%',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerDragButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 3,
    alignSelf: 'center',
    backgroundColor: '#C4C4CA',
    width: 40,
    height: 5,
    margin: 10,
  },
  headerModalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  answerLabel: {
    color: '#000',
    fontWeight: '500',
    fontSize: 22,
    width: '80%',
  },
  doneLabel: {
    color: '#ff0000',
    fontWeight: '400',
    fontSize: 18,
  },
  questionCard: {
    backgroundColor: '#fff',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    padding: 18,
    overflow: 'hidden',
    marginVertical: 5,
  },
  questionSubCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  questionLabel: {
    color: '#000',
    width: '80%',
    fontWeight: '600',
    fontSize: 18,
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
  reorderItem: {
    width: '98%',
    alignSelf: 'center',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  dragLabel: {
    marginHorizontal: 20,
    marginBottom: 25,
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    color: '#848484',
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3E3E8',
    width: '85%',
    alignSelf: 'center',
    height: 42,
    borderRadius: 22,
    marginBottom: 18,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  searchInput: {
    fontSize: 18,
    marginLeft: 5,
  },

  accessContainer: {
    width: '100%',
    flexGrow: 1,
    justifyContent: 'center',
    bottom: 0,
    position: 'absolute',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#fff',
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontFamily: 'SFPro',
    fontSize: 26,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  subtitle: {
    fontFamily: 'SFPro',
    fontSize: 17,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.7)',
    marginTop: 15,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: colors.primary,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontFamily: 'Inter-Regular_',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',

    letterSpacing: 0,
    textAlign: 'center',
    color: '#ffffff',
  },
  laterButton: {
    backgroundColor: '#f0f0f0',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 10,
    marginBottom: 30,
  },
  buttonLaterText: {
    fontFamily: 'Inter-Regular_',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  footerText: {
    fontSize: 13,
    color: '#8a8a8a',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 18,
  },
  highlight: {
    fontSize: 13,
    color: '#FF4D4F',
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 13,
    color: '#FF4D4F',
    paddingBottom: 10,
  },
});

export default Quiz;
