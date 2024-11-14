import {supabase} from './supabase';
import {fetchUsersFromUserID} from './supabaseQueries';

export const fetchSuggestedProfiles = async (userID: string) => {
  const {data: response, error} = await supabase.functions.invoke(
    'recommended-profiles',
    {
      body: {
        requestorId: userID,
      },
    },
  );

  if (!error && response?.userIds) {
    const users = await fetchUsersFromUserID(response.userIds);
    return users || [];
  }
  return [];
};

export const fetchQuickChoiceRecipients = async () => {
  const token = (await supabase.auth.getSession()).data?.session?.access_token;
  const {data, error} = await supabase.functions.invoke(
    'get-most-common-profiles-share',
    {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      body: {
        requestorId: '',
        pageSize: 5,
        lastSeenUserId: '',
      },
    },
  );
  if (!error && data) {
    const recipients = await fetchUsersFromUserID(data?.userIds || []);
    return recipients;
  }
  return [];
};

export const fetchGimmePickGifts = async (userID: string) => {
  const {data: response, error} = await supabase.functions.invoke(
    'get-gift-gimme-pick',
    {
      body: {
        sendee: {
          id: userID,
        },
        priceRange: {
          minPrice: 1,
          maxPrice: 10000,
        },
        numRecommendations: 15,
      },
    },
  );

  if (!error && response?.products) {
    return response?.products;
  }
  return [];
};

export const fetchProductDetailsFromURL = async (productLink: string) => {
  const {data: response, error} = await supabase.functions.invoke(
    'get-product-details-from-url',
    {
      body: {
        url: productLink,
      },
    },
  );

  if (!error && response) {
    return response;
  }
  return [];
};
