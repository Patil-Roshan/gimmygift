import React, {useEffect, useRef} from 'react';
import AppNavigator from './src/navigator/appNavigator';
import {LogBox, StyleSheet} from 'react-native';
import Toast from 'react-native-toast-message';

import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import {navigate} from './src/navigator/navigationService';
import {supabase} from './src/lib/supabase';
import branch from 'react-native-branch';
import {SafeAreaView} from 'react-native-safe-area-context';

// import GiftConfettiGIF from './src/components/GiftGIF';

LogBox.ignoreAllLogs();

function App(): React.JSX.Element {
  const splashTimeoutRef = useRef<any>(null);
  const notificationDataRef = useRef<string>('');

  useEffect(() => {
    const createChannel = async () => {
      try {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });
        await requestUserPermission();
      } catch (error) {
        console.error('Failed to create notification channel:', error);
      }
    };

    const requestUserPermission = async () => {
      try {
        await messaging().requestPermission();
      } catch (error) {
        console.error('Failed to request user permission:', error);
      }
    };

    createChannel();

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      await handleNotification(remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      await handleNotification(remoteMessage);
    });

    // Notification Handler
    notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        handleNotificationEvent(notificationDataRef.current, 'foreground');
      }
    });

    // Handle notification when the app is opened from a background or quit state
    messaging().onNotificationOpenedApp(remoteMessage => {
      handleNotificationEvent(
        remoteMessage?.notification?.body ?? '',
        'background',
      );
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          handleNotificationEvent(
            remoteMessage?.notification?.body ?? '',
            'quit',
          );
        }
      });

    async function handleNotification(notification: any) {
      if (notification) {
        try {
          notificationDataRef.current = notification?.notification?.body || '';
          const parsedData = await JSON.parse(notificationDataRef.current);
          const body = parsedData?.body;
          await notifee.displayNotification({
            title: 'Notification From GimmeGift',
            body: body ?? 'You have received a new gift.',
            android: {
              channelId: 'default',
              importance: AndroidImportance.HIGH,
            },
          });
        } catch (error) {
          console.error(
            'Failed to parse notification data: handleNotification',
            error,
          );
        }
      }
    }

    async function handleNotificationEvent(notification: any, origin: any) {
      if (notification) {
        try {
          const parsedData = JSON.parse(notification);
          const notificationMetadata = parsedData.notification_metadata;
          navigate('LinkMessagePreview', {
            eventID: notificationMetadata?.id || {},
          });
        } catch (error) {
          navigate('landing');
          console.error('Failed to parse notification data:', error);
        }
      }
    }

    // Branch Implementation
    branchInit();

    return () => {
      unsubscribe();
    };
  }, []);

  const branchInit = async () => {
    try {
      branch.initSessionTtl = 10000;
      branch.subscribe({
        onOpenStart: ({uri, cachedInitialEvent}) => {},
        onOpenComplete: ({error, params, uri}) => {
          if (error) {
            navigate('landing');
            return;
          } else if (params) {
            handleDeepLink(params);
          }
        },
      });
    } catch (error) {
      navigate('landing');
      console.error('Failed to initialize branch:', error);
    }
  };

  const handleDeepLink = async (deepLink: any) => {
    try {
      const {data: currentSession} = await supabase.auth.getSession();
      if (currentSession?.session) {
        if (splashTimeoutRef.current) {
          clearTimeout(splashTimeoutRef.current);
        }
        if (deepLink?.deepLinkId) {
          if (deepLink?.type === 'giftfunds') {
            navigate('giftfundinfo', {
              fundDetails: {gift_fund_id: deepLink?.deepLinkId} || {},
            });
          } else if (deepLink?.type === 'events') {
            navigate('LinkMessagePreview', {
              eventID: deepLink?.deepLinkId || {},
            });
          } else if (deepLink?.type === 'referral') {
            navigate('recipientgiftprofilelink', {
              id: deepLink?.deepLinkId || {},
            });
          } else {
            navigate(currentSession?.session ? 'tabnavigator' : 'landing');
          }
        } else {
          // No deep link found
          console.log('No deep link found-->');
          navigate(currentSession?.session ? 'tabnavigator' : 'landing');
        }
      } else {
        // if user is not logged in
        navigate('landing');
      }
    } catch (error) {
      navigate('landing');
      console.error('Failed to handle deep link:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppNavigator splashTimeoutRef={splashTimeoutRef} />
      <Toast bottomOffset={110} />
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
