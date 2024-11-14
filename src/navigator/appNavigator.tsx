import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';

import Login from '../screens/Login/login';
import Splash from '../screens/Splash/splash';
import Landing from '../screens/Landing/landing';
import Registration from '../screens/Registration/registration';
import RegistrationKids from '../screens/Registration/registrationKids';
import Dashboard from '../screens/Dashboard/dashboard';
import Quiz from '../screens/Quiz/quiz';
import TabNavigator from './tabNavigator';
import Menu from '../screens/Menu/menu';
import GiftAssistant from '../screens/GiftAssistant/giftassistant';
import GiftProfile from '../screens/GiftProfile/giftprofile';
import Settings from '../screens/GiftProfile/settings';
import NotificationSettings from '../screens/GiftProfile/notificationsettings';
import PreferencesManager from '../screens/GiftProfile/preferencesmanager';
import DirectPickManager from '../screens/GiftProfile/directpickmanager';
import FavoriteCategories from '../screens/GiftProfile/favcategories';
import Occasions from '../screens/Occasions/occasions';
import Recipients from '../screens/Recipients/recipients';
import colors from '../theme/colors';
import GiftFund from '../screens/GiftFund/giftfundinfo';
import Giftfundpayment from '../screens/GiftFund/giftfundpayment';
import Gimmepick from '../screens/GimmePick/gimmepick';
import AssistantQuiz from '../screens/GiftAssistant/assistantquiz';
import GreetingCards from '../screens/GreetingCards/greetingcards';
import CardCategory from '../screens/GreetingCards/cardcategory';
import NewGreetingCard from '../screens/GreetingCards/newgreetingcard';
import Search from '../screens/Search/search';
import RecipientGiftProfile from '../screens/GiftProfile/recipientgiftprofile';
import RecipientGiftProfileLink from '../screens/GiftProfile/recipientgiftprofilelink';
import MessageConfirmation from '../screens/Dashboard/messageconfirmation';
import Webview from '../screens/Support/webview';
import Wishlistcategory from '../screens/GiftProfile/wishlistcategory';
import PublicProfile from '../screens/GiftProfile/publicprofile';
import GiftQuiz from '../screens/GiftAssistant/giftquiz';
import CardQuiz from '../screens/GiftAssistant/cardquiz';
import MessageQuiz from '../screens/GiftAssistant/messageQuiz';
import VirtualGiftList from '../screens/VirtualGift/VirtualGiftList';
import Password from '../screens/NewScreens/Password/Password';
import Address from '../screens/NewScreens/Address/Address';
import GAssistant from '../screens/NewScreens/GAssistant/GAssistant';
import PreferencesQuiz from '../screens/NewScreens/PreferencesQuiz';
import GimmePick from '../screens/NewScreens/GimmePick';
import SharingOptions from '../screens/NewScreens/SharingOptions';
import NewOccasions from '../screens/NewScreens/NewOccasions';
import ContactOccasion from '../screens/NewScreens/ContactOccasion';
import MessagePreview from '../screens/GiftPreview/messagepreview';
import GiftPreview from '../screens/GiftPreview/giftpreview';
import CardPreview from '../screens/GiftPreview/cardpreview';
import {navigationRef} from './navigationService';
import LinkMessagePreview from '../screens/DeepLinks/linkmessagepreview';
import GiftAssistantRecipient from '../screens/GiftAssistant/giftassistantrecipient';
const Stack = createNativeStackNavigator();
interface AppNavigatorProps {
  splashTimeoutRef: React.RefObject<NodeJS.Timeout>;
}
const AppNavigator: React.FC<AppNavigatorProps> = ({splashTimeoutRef}) => {
  const headerOptions = {
    headerShown: true,
    headerBackTitleVisible: false,
    headerTintColor: colors.primary,
    headerTitleStyle: {
      color: '#000',
    },
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName={'splash'}>
        {/* PUBLIC ROUTES */}

        {/* <Stack.Screen name="splash" component={Splash} /> */}
        <Stack.Screen name="splash">
          {props => <Splash {...props} splashTimeoutRef={splashTimeoutRef} />}
        </Stack.Screen>
        <Stack.Screen name="landing" component={Landing} />
        <Stack.Screen name="login" component={Login} />
        <Stack.Screen name="registration" component={Registration} />
        <Stack.Screen name="registrationkids" component={RegistrationKids} />

        {/* PRIVATE ROUTES */}

        <Stack.Screen name="tabnavigator" component={TabNavigator} />
        <Stack.Screen name="dashboard" component={Dashboard} />
        <Stack.Screen name="quiz" component={Quiz} />
        <Stack.Screen name="menu" component={Menu} />
        <Stack.Screen name="assistantquiz" component={AssistantQuiz} />
        <Stack.Screen name="giftassistant" component={GiftAssistant} />
        <Stack.Screen
          name="giftassistantrecipient"
          component={GiftAssistantRecipient}
        />
        <Stack.Screen name="giftprofile" component={GiftProfile} />
        <Stack.Screen name="directpickmanager" component={DirectPickManager} />
        <Stack.Screen name="favcategories" component={FavoriteCategories} />
        <Stack.Screen name="occasions" component={Occasions} />
        <Stack.Screen name="recipients" component={Recipients} />
        <Stack.Screen name="giftfundinfo" component={GiftFund} />
        <Stack.Screen name="gimmepick" component={Gimmepick} />
        <Stack.Screen
          name="giftfundpayment"
          options={{...headerOptions, headerTitle: 'Gift an amount'}}
          component={Giftfundpayment}
        />
        <Stack.Screen
          name="settings"
          options={{...headerOptions, headerTitle: 'Settings'}}
          component={Settings}
        />
        <Stack.Screen
          name="notificationsettings"
          options={{...headerOptions, headerTitle: 'Notifications'}}
          component={NotificationSettings}
        />
        <Stack.Screen
          name="preferencesmanager"
          component={PreferencesManager}
        />

        <Stack.Screen name="greetingcards" component={GreetingCards} />
        <Stack.Screen name="cardcategory" component={CardCategory} />
        <Stack.Screen name="newgreetingcard" component={NewGreetingCard} />
        <Stack.Screen name="search" component={Search} />
        <Stack.Screen
          name="messageconfirmation"
          component={MessageConfirmation}
        />

        <Stack.Screen
          name="recipientgiftprofile"
          component={RecipientGiftProfile}
        />
        <Stack.Screen
          name="recipientgiftprofilelink"
          component={RecipientGiftProfileLink}
        />
        <Stack.Screen
          name="webview"
          options={{...headerOptions, headerTitle: 'Support'}}
          component={Webview}
        />

        <Stack.Screen
          name="wishlistcategory"
          options={{...headerOptions, headerTitle: 'wishlistcategory'}}
          component={Wishlistcategory}
        />
        <Stack.Screen name="publicprofile" component={PublicProfile} />

        <Stack.Screen name="giftquiz" component={GiftQuiz} />
        <Stack.Screen name="cardquiz" component={CardQuiz} />
        <Stack.Screen name="messagequiz" component={MessageQuiz} />
        <Stack.Screen name="VirtualGiftList" component={VirtualGiftList} />

        {/*  Need to implement        */}
        <Stack.Screen name="Password" component={Password} />
        <Stack.Screen name="Address" component={Address} />
        <Stack.Screen name="GAssistant" component={GAssistant} />

        {/* modals demo screens */}
        <Stack.Screen name="PreferencesQuiz" component={PreferencesQuiz} />
        <Stack.Screen name="GimmePick" component={GimmePick} />
        <Stack.Screen name="sharingOptions" component={SharingOptions} />
        <Stack.Screen name="NewOccasions" component={NewOccasions} />
        <Stack.Screen name="ContactOccasion" component={ContactOccasion} />

        <Stack.Screen name="MessagePreview" component={MessagePreview} />
        <Stack.Screen name="GiftPreview" component={GiftPreview} />
        <Stack.Screen name="CardPreview" component={CardPreview} />

        <Stack.Screen
          name="LinkMessagePreview"
          component={LinkMessagePreview}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
