import {Platform, Alert, Linking} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import Contacts from 'react-native-contacts';
import Toast from 'react-native-toast-message';

const checkMediaPermission = async () => {
  try {
    let permission;

    // Define platform-specific permissions
    if (Platform.OS === 'ios') {
      const iosVersion = parseInt(Platform.Version, 10);
      permission =
        iosVersion >= 14
          ? PERMISSIONS.IOS.PHOTO_LIBRARY
          : PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY;
    } else if (Platform.OS === 'android') {
      if (parseInt(Platform.Version, 10) >= 33) {
        // Android 13 and above: separate permissions for photos and videos
        permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      } else {
        // Below Android 13: storage permission
        permission = PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      }
    } else {
      throw new Error('Unsupported platform');
    }

    // Check current permission status
    const status = await check(permission);

    switch (status) {
      case RESULTS.GRANTED:
        return true;

      case RESULTS.DENIED:
        // Request permission
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;

      case RESULTS.BLOCKED:
        // Show alert to open settings
        Alert.alert(
          'Permission Required',
          'Please enable photo access in your device settings to use this feature.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
        return false;

      case RESULTS.UNAVAILABLE:
        Alert.alert(
          'Feature Unavailable',
          'Photo access is not available on this device.',
        );
        return false;

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking media permission:', error);
    return false;
  }
};

const checkAllMediaPermissions = async () => {
  if (Platform.OS === 'android' && parseInt(Platform.Version, 10) >= 33) {
    try {
      const imagePermission = await checkMediaPermission();
      const videoPermission = await check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);

      return imagePermission && videoPermission === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking all media permissions:', error);
      return false;
    }
  }

  // For other cases, just return the regular check
  return checkMediaPermission();
};

const checkContactsPermission = async () => {
  try {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CONTACTS
        : PERMISSIONS.ANDROID.READ_CONTACTS;

    const status = await check(permission);
    console.log('status--->', status);

    switch (status) {
      case RESULTS.UNAVAILABLE:
        Alert.alert(
          'Contacts Feature Unavailable',
          'Contacts access is not available on this device.',
          [{text: 'OK'}],
        );
        return false;
      case RESULTS.DENIED:
        return new Promise(resolve => {
          Alert.alert(
            'Contacts Permission Required',
            'Please enable contacts access to use this feature.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => resolve(false),
              },
              {
                text: 'Continue',
                onPress: async () => {
                  const newResult = await request(permission);
                  resolve(newResult === RESULTS.GRANTED);
                },
              },
            ],
            {cancelable: false},
          );
        });
      case RESULTS.BLOCKED:
        return false;
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error('Contacts permission check failed:', error);
    return false;
  }
};
const getContacts = async () => {
  try {
    const hasPermission = await checkContactsPermission();

    if (hasPermission) {
      const contacts = await Contacts.getAll();

      return contacts;
    } else {
      Toast.show({
        type: 'error',
        text1: 'Contacts Permission Required',
        text2: 'Please enable contacts access in your device settings.',
        position: 'bottom',
      });
      return [];
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error,
    };
  }
};

export {
  checkMediaPermission,
  checkAllMediaPermissions,
  checkContactsPermission,
  getContacts,
};
