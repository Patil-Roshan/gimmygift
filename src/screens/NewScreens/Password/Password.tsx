import {
  Modal,
  StyleSheet,
  Text,
  View,
  Button,
  StatusBar,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import colors from '../../../theme/colors';

const Password = () => {
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.gray.medium} />
      <TouchableOpacity onPress={toggleModal}>
        <Text style={styles.txt}> Change Password</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.headerView}>
              <Text style={styles.header}> Password</Text>
              <TouchableOpacity onPress={toggleModal}>
                <Text style={styles.modalText}>Done</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={require('../../../assets/images/password.png')}
              style={{width: 54, height: 54}}
            />
            <View style={styles.contentcontainer}>
              <Text style={styles.content}>
                Manage your password to access GiftClub.{'\n\n'}Your password
                must contain a minimum of 8 alphanumeric characters and at least
                one special character (!?%$)
              </Text>
            </View>

            <View style={styles.passwordFields}>
              <TextInput
                style={styles.inputField}
                onChangeText={setOldPass}
                value={oldPass}
                placeholder="Actual Password"
                placeholderTextColor={colors.fontSubColor}
                keyboardType="default"
                secureTextEntry={true}
              />
              <TextInput
                style={styles.inputField}
                onChangeText={setNewPass}
                value={newPass}
                placeholder="New Password"
                placeholderTextColor={colors.fontSubColor}
                keyboardType="default"
                secureTextEntry={true}
              />
              <TextInput
                style={[styles.inputField, {borderBottomWidth: 0}]}
                onChangeText={setConfPass}
                value={confPass}
                placeholder="Repeat new Password"
                placeholderTextColor={colors.fontSubColor}
                keyboardType="default"
                secureTextEntry={true}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                console.log('Reover Password!');
              }}>
              <Text style={styles.recoverPassword}>Recover password</Text>
            </TouchableOpacity>

            <View style={styles.editView}>
              {/* <Button
                                title='Edit password'
                                color={colors.gray.medium}
                                onPress={() => {
                                    console.log("Edit Password Clicked!");
                                    toggleModal()
                                }} /> */}
              <Text style={styles.btn}>Edit password</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Password;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pageBg,
  },
  centeredView: {
    flex: 1,
    marginTop: 10,
  },
  txt: {
    padding: 50,
    fontSize: 30,
    color: colors.black,
  },
  modalView: {
    position: 'absolute', // Use absolute positioning
    bottom: 0, // Start from the bottom
    left: 0, // Extend to the full width
    right: 0, // Extend to the full width
    backgroundColor: colors.pageBg,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    paddingTop: 50,
    paddingHorizontal: 14,
    paddingBottom: 20,
    // alignItems: "center",
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: '100%', // Set the height to 80%1
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
  },
  header: {
    fontSize: 24,
    color: colors.black,
    lineHeight: 24,
    fontWeight: '600',
  },
  modalText: {
    fontSize: 18,
    color: colors.primary,
  },
  contentcontainer: {
    paddingRight: 60,
  },
  content: {
    marginTop: 20,
    color: colors.fontSubColor,
    fontSize: 16,
    lineHeight: 20,
  },
  passwordFields: {
    backgroundColor: colors.white,
    marginTop: 52,
    marginBottom: 16,
    padding: 10,
    borderWidth: 0,
    borderRadius: 8,
  },
  inputField: {
    color: colors.fontSubColor,
    borderBottomWidth: 0.2,
    paddingHorizontal: 10,
    fontSize: 18,
    lineHeight: 22,
  },
  recoverPassword: {
    color: colors.black,
    fontSize: 16,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  editView: {
    marginTop: 39,
    borderWidth: 0,
    borderRadius: 8,
    backgroundColor: colors.gray.medium,
    padding: 10,
  },
  btn: {
    textAlign: 'center',
    color: colors.black,
    fontSize: 16,
    fontWeight: '600',
  },
});
