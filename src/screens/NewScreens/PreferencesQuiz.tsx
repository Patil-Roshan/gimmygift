import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet, Image} from 'react-native';
import CustomModal from '../../components/Modal';
import colors from '../../theme/colors';
const PreferencesQuiz = () => {
  const [isModalVisible, setIsModalVisible] = useState(true);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const styles = StyleSheet.create({
    footer: {
      color: colors.black,
      textAlign: 'center',
      width: '100%',
    },
  });

  const footerTxt = (
    <View
      style={{
        marginVertical: 5,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={styles.footer}>
        Train the{' '}
        <Image
          resizeMode="center"
          source={require('../../assets/images/app_logo_red.png')}
          style={{width: 20, height: 20}}
        />{' '}
        Gift Assistant on the user preferences.
      </Text>
      <Text style={styles.footer}>
        By continuing you accept our
        <Text style={[styles.footer, {color: colors.primary}]}>
          {' '}
          Conditions.
        </Text>
      </Text>
    </View>
  );
  return (
    <View>
      <TouchableOpacity onPress={toggleModal}>
        <Text>Open Modal</Text>
      </TouchableOpacity>
      <CustomModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        icon={require('../../assets/icons/ic_quiz_2.png')}
        title="Prefered Quiz"
        content="Start to answer questions about Salma preferences and find the perfect gifts."
        actions={[
          {
            label: 'Start to answer',
            onPress: () => setIsModalVisible(false),
          },
          {
            label: 'Start to answer',
            onPress: () => setIsModalVisible(false),
            buttonColor: colors.black, // Set button text color
            backgroundColor: colors.lineColor,
          },
        ]}
        footer={footerTxt}
      />
    </View>
  );
};

export default PreferencesQuiz;
