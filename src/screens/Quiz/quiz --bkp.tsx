/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {styles} from './quiz.styles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import colors from '../../theme/colors';
import Icon from '../../components/Icon';
import Button from '../../components/Button';
import Toast from 'react-native-toast-message';
import Modal from 'react-native-modal';
import {useNavigation} from '@react-navigation/native';
import {ic_answers, ic_back, ic_quiz} from '../../assets/icons/icons';
import FastImage from 'react-native-fast-image';
//@ts-ignore
import SortableList from 'react-native-sortable-list';
function Row({active, data}: any) {
  const activeAnim = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(activeAnim.current, {
      duration: 300,
      easing: Easing.bounce,
      toValue: Number(active),
      useNativeDriver: true,
    }).start();
  }, [active]);

  return (
    <Animated.View style={styles.draggableRow}>
      <View style={styles.questionSubCard}>
        <Text style={styles.questionLabel}>{data.name}</Text>
        <Entypo name="menu" color={'#A9A9A9'} size={25} />
      </View>
    </Animated.View>
  );
}

const Quiz = () => {
  const navigation = useNavigation();
  const totalSteps = 3;
  const [currentStep, setCurrentStep] = useState(1);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [showHobbbiesModal, setShowHobbbiesModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  const giftCategories = [
    {id: 1, name: 'Clothings', selected: false},
    {id: 2, name: 'Shoes', selected: false},
    {id: 4, name: 'Jewelary', selected: false},
    {id: 5, name: 'Sports', selected: false},
    {id: 6, name: 'Books', selected: false},
    {id: 7, name: 'Collectibles', selected: false},
    {id: 8, name: 'Health & Wellness', selected: false},
    {id: 9, name: 'Furniture', selected: false},
    {id: 10, name: 'Toys & Games', selected: false},
    {id: 11, name: 'Automotives', selected: false},
    {id: 12, name: 'Appliances', selected: false},
    {id: 13, name: 'Tickets', selected: false},
    {id: 14, name: 'Books', selected: false},
    {id: 15, name: 'Clothings', selected: false},
    {id: 16, name: 'Shoes', selected: false},
    {id: 17, name: 'Jewelary', selected: false},
    {id: 18, name: 'Sports', selected: false},
    {id: 19, name: 'Books', selected: false},
    {id: 21, name: 'Health & Wellness', selected: false},
    {id: 22, name: 'Furniture', selected: false},
    {id: 23, name: 'Toys & Games', selected: false},
    {id: 24, name: 'Automotives', selected: false},
    {id: 25, name: 'Appliances', selected: false},
  ];

  const hobbiesData = [
    {id: 1, name: 'Painting', selected: false},
    {id: 2, name: 'Photography', selected: false},
    {id: 4, name: 'Hiking', selected: false},
    {id: 5, name: 'Cooking', selected: false},
    {id: 6, name: 'Reading', selected: false},
    {id: 7, name: 'Gardening', selected: false},
    {id: 8, name: 'Fashion', selected: false},
    {id: 9, name: 'Writing', selected: false},
    {id: 10, name: 'Fishing', selected: false},
    {id: 11, name: 'Running', selected: false},
    {id: 12, name: 'Dancing', selected: false},
    {id: 13, name: 'Acting', selected: false},
    {id: 14, name: 'Swimming', selected: false},
    {id: 15, name: 'Cycling', selected: false},
    {id: 16, name: 'Camping', selected: false},
    {id: 17, name: 'Running', selected: false},
    {id: 18, name: 'Dancing', selected: false},
    {id: 19, name: 'Acting', selected: false},
    {id: 20, name: 'Swimming', selected: false},
    {id: 21, name: 'Cycling', selected: false},
    {id: 22, name: 'Camping', selected: false},
  ];

  const collectionsData = [
    {id: 1, name: 'Stamps', selected: false},
    {id: 2, name: 'Coins', selected: false},
    {id: 4, name: 'Books', selected: false},
    {id: 5, name: 'Postcard', selected: false},
    {id: 6, name: 'Artwork', selected: false},
    {id: 7, name: 'Keychains', selected: false},
    {id: 8, name: 'Bags', selected: false},
    {id: 9, name: 'Cosmetics', selected: false},
    {id: 10, name: 'BottleCaps', selected: false},
    {id: 11, name: 'Vintage Items', selected: false},
    {id: 12, name: 'Artwork', selected: false},
    {id: 13, name: 'Keychains', selected: false},
    {id: 14, name: 'Bags', selected: false},
    {id: 15, name: 'Cosmetics', selected: false},
    {id: 16, name: 'BottleCaps', selected: false},
  ];

  const [categories, setCategories] = useState(giftCategories);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [hobbies, setHobbies] = useState(hobbiesData);
  const [selectedHobbies, setSelectedHobbies] = useState([]);
  const [searchHobby, setSearchHobby] = useState('');

  const [collections, setCollections] = useState(collectionsData);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [searchCollection, setSearchCollection] = useState('');

  const handleSelection = (item: {id: string; selected: boolean}) => {
    const updateSelectedItems = (selectedItems: any, setSelectedItems: any) => {
      const itemIndex = selectedItems.findIndex(
        (selectedItem: {id: string; selected: boolean}) =>
          selectedItem.id === item.id,
      );
      const newSelectedItems = [...selectedItems];

      if (itemIndex !== -1) {
        newSelectedItems.splice(itemIndex, 1);
      } else {
        newSelectedItems.push(item);
      }

      setSelectedItems(newSelectedItems);
    };

    const updateCategories = () => {
      const updatedCategories = categories.map(category =>
        category.id.toString() === item.id
          ? {...category, selected: !category.selected}
          : category,
      );
      setCategories(updatedCategories);
    };

    switch (currentStep) {
      case 1:
        updateSelectedItems(selectedCategories, setSelectedCategories);
        updateCategories();
        break;
      case 2:
        updateSelectedItems(selectedHobbies, setSelectedHobbies);
        setHobbies(
          hobbies.map(hobby =>
            hobby.id.toString() === item.id
              ? {...hobby, selected: !hobby.selected}
              : hobby,
          ),
        );
        break;
      case 3:
        updateSelectedItems(selectedCollections, setSelectedCollections);
        setCollections(
          collections.map(collection =>
            collection.id.toString() === item.id
              ? {...collection, selected: !collection.selected}
              : collection,
          ),
        );
        break;
      default:
        break;
    }
  };

  const filteredCategories = categories.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredHobbies = hobbies.filter(item =>
    item.name.toLowerCase().includes(searchHobby.toLowerCase()),
  );

  const filteredCollections = collections.filter(item =>
    item.name.toLowerCase().includes(searchCollection.toLowerCase()),
  );

  const handleContinue = () => {
    if (currentStep === 1) {
      if (selectedCategories.length < 3) {
        Toast.show({
          type: 'error',
          text1: 'Please select at least 3 categories',
          position: 'bottom',
        });
        return;
      }
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
    if (currentStep === 2) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
    if (currentStep === 3) {
      if (selectedCollections.length > 0) {
        setShowAnswerModal(true);
      } else {
        setShowSkipModal(true);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderRow = useCallback(({data, active}: any) => {
    return <Row data={data} active={active} />;
  }, []);

  const renderCategoriesModal = () => {
    return (
      <Modal
        isVisible={showCategoriesModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowCategoriesModal(false)}
        onBackdropPress={() => setShowCategoriesModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.headerDragButton} />

          <View style={styles.headerModalContainer}>
            <Text style={styles.answerLabel}>
              What are the gift categories you prefer?
            </Text>
            <Text
              onPress={() => {
                setShowCategoriesModal(false);
              }}
              style={styles.doneLabel}>
              Done
            </Text>
          </View>

          <SortableList
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            data={selectedCategories}
            renderRow={renderRow}
            onChangeOrder={order => console.log(order)}
          />
        </View>
      </Modal>
    );
  };

  const renderHobbiesModal = () => {
    return (
      <Modal
        isVisible={showHobbbiesModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowHobbbiesModal(false)}
        onBackdropPress={() => setShowHobbbiesModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.headerDragButton} />

          <View style={styles.headerModalContainer}>
            <Text style={styles.answerLabel}>What are your hobbies?</Text>
            <Text
              onPress={() => {
                setShowHobbbiesModal(false);
              }}
              style={styles.doneLabel}>
              Done
            </Text>
          </View>

          <SortableList
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            data={selectedHobbies}
            renderRow={renderRow}
          />
        </View>
      </Modal>
    );
  };

  const renderCollectionsModal = () => {
    return (
      <Modal
        isVisible={showCollectionModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowCollectionModal(false)}
        onBackdropPress={() => setShowCollectionModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.headerDragButton} />

          <View style={styles.headerModalContainer}>
            <Text style={styles.answerLabel}>Do you collect anything?</Text>
            <Text
              onPress={() => {
                setShowCollectionModal(false);
              }}
              style={styles.doneLabel}>
              Done
            </Text>
          </View>

          <SortableList
            style={styles.list}
            contentContainerStyle={styles.contentContainer}
            data={selectedCollections}
            renderRow={renderRow}
          />
        </View>
      </Modal>
    );
  };

  // const buttonLabel = currentStep === totalSteps ? selectedCollections.length > 0 ? 'Continue' : 'Skip' : 'Continue';

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />

      <Modal
        isVisible={showSkipModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowSkipModal(false)}
        onBackdropPress={() => setShowSkipModal(false)}>
        <View
          style={{
            backgroundColor: colors.primary,
            flex: 1,
          }}>
          <FastImage
            source={require('../../assets/images/quiz_vector.png')}
            style={styles.quizModalImage}
          />

          <Text style={styles.quizModalTitle}>
            Do you want to continue the Preferences Quiz?
          </Text>
          <Text style={styles.quizModalLabel}>
            You can also answer the questions later by accessing your
            GiftProfile. Remember that the more questions you answer, the more
            the gifts you receive will be perfect for you.
          </Text>

          <View style={{position: 'absolute', width: '100%', bottom: 30}}>
            <Button
              onPress={() => setShowSkipModal(false)}
              width={'90%'}
              bg={colors.white}
              fontColor={colors.black}
              label={'Continue'}
            />
            <View style={{marginTop: -30}}>
              <Button
                onPress={() => {
                  setShowSkipModal(false);
                  setTimeout(() => {
                    navigation.replace('tabnavigator');
                  }, 1000);
                }}
                width={'90%'}
                bg={'#FF7E89'}
                fontColor={colors.white}
                label={'Skip'}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        isVisible={showAnswerModal}
        style={{margin: 0}}
        onBackButtonPress={() => setShowAnswerModal(false)}
        onBackdropPress={() => setShowAnswerModal(false)}>
        <View style={styles.modalContainer}>
          {renderCategoriesModal()}
          {renderHobbiesModal()}
          {renderCollectionsModal()}
          <View style={styles.headerDragButton} />

          <View style={styles.headerModalContainer}>
            <Text style={styles.answerLabel}>List answered questions</Text>
            <Text
              onPress={() => {
                setShowAnswerModal(false);
                //workaround for iOS modal crash
                setTimeout(() => {
                  navigation.replace('tabnavigator');
                }, 1000);
              }}
              style={styles.doneLabel}>
              Done
            </Text>
          </View>

          <View style={styles.questionCard}>
            <View style={styles.questionSubCard}>
              <Text style={styles.questionLabel}>
                What are the gift categories…prefer?
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCategoriesModal(true);
                }}>
                <Entypo
                  name="dots-three-horizontal"
                  color={'#A9A9A9'}
                  size={25}
                />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal style={{flexDirection: 'row'}}>
              {selectedCategories.map((item: any) => {
                return (
                  <View key={item.id} style={[styles.listItem]}>
                    <Text style={[styles.listLabel]}>{item.name}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.questionCard}>
            <View style={styles.questionSubCard}>
              <Text style={styles.questionLabel}>What are your hobbies?</Text>
              <Entypo
                onPress={() => setShowHobbbiesModal(true)}
                name="dots-three-horizontal"
                color={'#A9A9A9'}
                size={25}
              />
            </View>
            <ScrollView horizontal style={{flexDirection: 'row'}}>
              {selectedHobbies.map((item: any) => {
                return (
                  <View key={item.id} style={[styles.listItem]}>
                    <Text style={[styles.listLabel]}>{item.name}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.questionCard}>
            <View style={styles.questionSubCard}>
              <Text style={styles.questionLabel}>Do you collect anything?</Text>
              <Entypo
                onPress={() => setShowCollectionModal(true)}
                name="dots-three-horizontal"
                color={'#A9A9A9'}
                size={25}
              />
            </View>
            <ScrollView horizontal style={{flexDirection: 'row'}}>
              {selectedCollections.map((item: any) => {
                return (
                  <View key={item.id} style={[styles.listItem]}>
                    <Text style={[styles.listLabel]}>{item.name}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
        <View style={styles.headerRView}>
          <Entypo name="dots-three-horizontal" color={colors.black} size={25} />
        </View>
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomBtnContainer}
          onPress={() => setShowAnswerModal(true)}>
          <Icon size={44} icon={ic_answers} />
        </TouchableOpacity>
        <TouchableOpacity
          disabled={currentStep === 1}
          style={styles.bottomBtnContainer}
          onPress={handleBack}>
          <Icon size={44} icon={ic_back} />
        </TouchableOpacity>
        <View style={{width: '75%'}}>
          <Button label={'Continue'} onPress={handleContinue} />
        </View>
      </View>

      {currentStep === 1 && (
        <View style={styles.formContainer}>
          <Text style={styles.quizTitle}>
            What are the gift categories you prefer?
          </Text>
          <Text style={styles.quizSubTitle}>
            Select at least 3 or more options.
          </Text>

          <View style={styles.searchContainer}>
            <Feather name="search" color={'#717174'} size={18} />
            <TextInput
              placeholder="Search"
              style={styles.searchInput}
              placeholderTextColor={'#717174'}
              onChangeText={text => setSearchQuery(text)}
              value={searchQuery}
            />
          </View>

          <View style={{height: '60%'}}>
            <ScrollView contentContainerStyle={styles.listContainer}>
              {filteredCategories.map(item => {
                const isSelected = selectedCategories.some(
                  category => category.id === item.id,
                );

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelection(item)}
                    style={[
                      styles.listItem,
                      {backgroundColor: isSelected ? '#77777A' : '#fff'},
                    ]}>
                    <Text
                      style={[
                        styles.listLabel,
                        {color: isSelected ? '#fff' : '#000'},
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {currentStep === 2 && (
        <View style={styles.formContainer}>
          <Text style={styles.quizTitle}>What are your hobbies?</Text>
          <Text style={styles.quizSubTitle}>
            Select one or multiple options.
          </Text>

          <View style={styles.searchContainer}>
            <Feather name="search" color={'#717174'} size={18} />
            <TextInput
              placeholder="Search"
              style={styles.searchInput}
              placeholderTextColor={'#717174'}
              onChangeText={text => setSearchHobby(text)}
              value={searchHobby}
            />
          </View>

          <View style={{height: '67%'}}>
            <ScrollView contentContainerStyle={styles.listContainer}>
              {filteredHobbies.map(item => {
                const isSelected = selectedHobbies.some(
                  category => category.id === item.id,
                );
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelection(item)}
                    style={[
                      styles.listItem,
                      {backgroundColor: isSelected ? '#77777A' : '#fff'},
                    ]}>
                    <Text
                      style={[
                        styles.listLabel,
                        {color: isSelected ? '#fff' : '#000'},
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {currentStep === 3 && (
        <View style={styles.formContainer}>
          <Text style={styles.quizTitle}>Do you collect anything?</Text>
          <Text style={styles.quizSubTitle}>
            Select one or multiple options.
          </Text>

          <View style={styles.searchContainer}>
            <Feather name="search" color={'#717174'} size={18} />
            <TextInput
              placeholder="Search"
              style={styles.searchInput}
              placeholderTextColor={'#717174'}
              onChangeText={text => setSearchCollection(text)}
              value={searchCollection}
            />
          </View>

          <View style={{height: '67%'}}>
            <ScrollView contentContainerStyle={styles.listContainer}>
              {filteredCollections.map(item => {
                const isSelected = selectedCollections.some(
                  category => category.id === item.id,
                );
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleSelection(item)}
                    style={[
                      styles.listItem,
                      {backgroundColor: isSelected ? '#77777A' : '#fff'},
                    ]}>
                    <Text
                      style={[
                        styles.listLabel,
                        {color: isSelected ? '#fff' : '#000'},
                      ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default Quiz;
