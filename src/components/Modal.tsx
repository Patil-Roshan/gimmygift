// CustomModal.tsx
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import colors from '../theme/colors';

interface CustomModalProps {
  isVisible: boolean;
  onClose: () => void;
  icon?: any;
  title: string;
  content: JSX.Element | string;
  actions: Action[];
  footer?: any;
}

interface Action {
  label: string;
  onPress: () => void;
  buttonColor?: string; // Optional prop for button color
  backgroundColor?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isVisible,
  onClose,
  icon,
  title,
  content,
  actions,
  footer,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.headerView}>
            <Image source={icon} style={styles.headerImage} />
            <Text style={styles.header}>{title}</Text>
          </View>

          <View style={styles.contentContainer}>
            <Text style={styles.content}>{content}</Text>
          </View>

          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.onPress}
              style={[
                styles.actionButton,
                {backgroundColor: action.backgroundColor || colors.primary},
              ]}>
              <Text
                style={[
                  styles.actionLabel,
                  {color: action.buttonColor || colors.secondary},
                ]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
          <View>{footer}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 50,
    paddingHorizontal: 14,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  header: {
    fontSize: 26,
    color: colors.black,
    lineHeight: 26,
    fontWeight: '600',
  },
  headerImage: {
    width: 44,
    height: 44,
  },
  modalText: {
    color: colors.fontSubColor,
  },
  contentContainer: {
    paddingHorizontal: 30,
  },
  content: {
    marginVertical: 20,
    color: '#888',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 22,
  },

  actionButton: {
    flex: 1,
    width: '85%',
    marginHorizontal: 28,
    padding: 16,
    borderRadius: 8,
    marginVertical: 5,
  },
  actionLabel: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default CustomModal;
