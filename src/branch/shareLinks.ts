import branch from 'react-native-branch';
import {Share} from 'react-native';

async function shareEventLink(label: string, type: string, deepLinkId: string) {
  const branchParams = {
    title: label,
    contentDescription: label,
    contentMetadata: {
      customMetadata: {
        type: type,
        deepLinkId: deepLinkId,
      },
    },
  };
  try {
    let linkProperties = {
      feature: 'share',
      channel: 'user_share',
    };
    const {url} = await branch
      .createBranchUniversalObject(type, branchParams)
      .then(branchUniversalObject =>
        branchUniversalObject.generateShortUrl(linkProperties),
      );

    const message =
      type === 'referral'
        ? `Join me on GimmeGift, Send and receive the perfect gift. : ${url}`
        : type === 'profile'
        ? `Check out this profile on GimmeGift: ${url}`
        : type === 'events'
        ? `Check out this profile on GimmeGift: ${url}`
        : `${label} ${url}`;
    await Share.share({
      message: message,
      // url: url,
    });
  } catch (error) {
    console.error('Error sharing event:', error);
  }
}

export default shareEventLink;
