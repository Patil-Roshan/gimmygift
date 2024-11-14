export interface UserInterface {
  auth_id: string | null;
  birthday: string | null;
  country_code: number | null;
  created_at: string | null;
  fcm_token: string | null;
  fts: unknown;
  full_name: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  id: number | undefined;
  user_id: string | null | undefined;
  profile_image: string | undefined;
  has_newsletter: boolean;
  user_type: 'NORMAL' | 'ADMIN' | null;
}

export interface GiftFundsInterface {
  id: number;
  gift_fund_id: number;
  user: string;
  image: string | undefined;
  current_amount: number;
  gift_name: string;
  target_amount: number;
  image_url: string | undefined;
  profile_image_url: string | undefined;
}

export type RootStackParamList = {
  Home: undefined;
  Profile: {userId: string};
  Settings: undefined;
  giftfundinfo: {giftFundDetails: any};
  quiz: undefined;
  gimmepick: undefined;
  settings: undefined;
  messageconfirmation: {message: string};
  wishlistcategory: {title: string; items: any};
  recipientgiftprofile: {profile: any};
  VirtualGiftList: undefined;
  preferencesmanager: undefined;
  favcategories: undefined;
  publicprofile: undefined;
  giftprofile: undefined;
  cardquiz: undefined;
  messagequiz: undefined;
  giftquiz: undefined;
  MessageConfirmation: {name: string};
};
