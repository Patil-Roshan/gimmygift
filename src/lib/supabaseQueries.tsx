import {UserInterface} from '../types';
import {supabase} from './supabase';

export const fetchUsersFromUserID = async (userId: any) => {
  const {data: userDetails, error: userDetailsError} = await supabase
    .from('profiles')
    .select(
      `
      full_name,
      birthday,
      user_type,
      user_id,
      gender,
      auth_id,
      profile_address:profile_address!inner(*)
  `,
    )
    .in('user_id', userId);

  if (!userDetailsError && userDetails) {
    const usersWithImages = await fetchImagesFromUserID(userDetails);
    return usersWithImages || [];
  }
  return [];
};

export const fetchImagesFromUserID = async (users: any) => {
  const usersWithImages = await Promise.all(
    users.map(async (user: UserInterface) => {
      const imagePath = `${user.user_id}/${user.user_id}.png`;
      const {data: imageUrlData} = await supabase.storage
        .from('profiles')
        .createSignedUrl(imagePath, 86400);
      return {...user, profile_image: imageUrlData?.signedUrl};
    }),
  );
  return usersWithImages || [];
};

export const fetchUserRecipients = async (userId: string) => {
  try {
    const {data: relationshipDetails, error} = await supabase
      .from('user_relationships')
      .select('relationship_id, relationships')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user IDs:', error);
      throw error;
    }

    // Add null check for relationshipDetails
    if (!relationshipDetails) {
      return [];
    }

    const userIds = relationshipDetails.map(item => item.relationship_id);

    const userDetails = await fetchUsersFromUserID(userIds);

    const combinedDetails = relationshipDetails.map(relationship => {
      const user = userDetails.find(
        user => user.user_id === relationship.relationship_id,
      );

      // Modified this part to handle null relationships
      return {
        ...user,
        relationship: relationship?.relationships
          ? relationship.relationships[0]
          : 'No relationship added',
      };
    });

    return combinedDetails;
  } catch (error) {
    console.error('Error while fetchUserRecipients :', error);
    throw error;
  }
};

export const generateRandomString = () => {
  const timestamp = Date.now().toString(36).slice(-6);
  const randomPart = Math.random().toString(36).substring(2, 4);
  return timestamp + randomPart;
};
