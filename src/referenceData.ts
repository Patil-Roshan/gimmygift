const websiteLink = 'https://gimmegift.com';
const termsLink = 'https://gimmegift.com/terms-and-conditions';
const privacyPolicyLink = 'https://gimmegift.com/privacy-policy';

const gendersData = [{name: 'Male'}, {name: 'Female'}, {name: 'Other'}];

const occasionsData = [
  {name: 'NO_OCCASION'},
  {name: 'BIRTHDAY'},
  {name: 'VALENTINES_DAY'},
  {name: 'CHRISTMAS'},
  {name: 'MOTHERS_DAY'},
  {name: 'FATHERS_DAY'},
  {name: 'WEDDING'},
  {name: 'JOB_CELEBRATION'},
  {name: 'GRADUATION'},
  {name: 'ANNIVERSARY'},
  {name: 'BABY_SHOWER'},
  {name: 'EASTER'},
  {name: 'NEW_YEAR'},
];

const relationships = [
  {name: 'FRIEND'},
  {name: 'MOTHER'},
  {name: 'FATHER'},
  {name: 'BROTHER'},
  {name: 'SISTER'},
  {name: 'SIBLING'},
  {name: 'FAMILY'},
  {name: 'BLOCKED'},
];
const relationshipsTags = [
  {
    id: 1,
    title: 'All',
  },
  {
    id: 2,
    title: 'Friend',
  },
  {
    id: 3,
    title: 'Collegue',
  },
  {
    id: 4,
    title: 'Cousin',
  },
  {
    id: 5,
    title: 'Neighbour',
  },
  {
    id: 6,
    title: 'Partner',
  },
];

const recipientSample = [
  {name: 'John Doe', image: 'https://i.pravatar.cc/400'},
  {name: 'Anne Johnson', image: 'https://i.pravatar.cc/300'},
  {name: 'Anne Doe', image: 'https://i.pravatar.cc/500'},
  {name: 'John Anne', image: 'https://i.pravatar.cc/600'},
];

const notificationTimingPreference = [
  {name: 'In the occasion date'},
  {name: '1 day before the occasion date'},
  {name: '2 days before the occasion date'},
  {name: '3 days before the occasion date'},
  {name: '4 days before the occasion date'},
  {name: '5 days before the occasion date'},
  {name: '1 week before the occasion date'},
  {name: '2 weeks before the occasion date'},
  {name: '3 weeks before the occasion date'},
];

const repetitionData = [{name: 'Only this year'}, {name: 'Every years'}];

const quizQuestions = [
  [
    {
      id: '1',
      question: 'What are the gift categories you prefer?',
      category: 'style',
      type: 'text',
      response:
        'Clothings, Shoes, Jewelry, Bags and accessories, Food and drinks, Consumer electronics, Home goods, Cosmetics, Sports, Equipments, Books, Toys & Games, Automotive, Health & Wellness, Pet supplies, Art & Crafts, Stationery, Furniture, Music & Instruments, Travel accessories, Appliances, Baby products, Outdoor gear, DIY tools, Collectibles, Party supplies, Antiques, Vintage, Handmade, Subscriptions, Tickets',
    },
    {
      id: '2',
      question: 'What are your hobbies?',
      category: 'style',
      type: 'text',
      response:
        'Painting, Photography, Hiking, Cooking, Reading, Gardening, Playing musical instruments, Bird watching, Writing, Knitting, Fashion, Sport, Meditation, Playing games, Sewing, Woodworking, Pottery, Fishing, Camping, Collecting, Astronomy, Model building, Scuba diving, Surfing, Rock climbing, Cycling, Running, Swimming, Martial arts, Dancing, Acting, DIY projects, Origami, Calligraphy, Learning, Volunteering, Beekeeping, Skateboarding, Skiing, Crocheting, Playing chess, Playing card games, Geocaching, Metal detecting, Baking, Wine tasting, Home brewing',
    },
    {
      id: '3',
      question: 'Do you collect anything?',
      category: 'style',
      type: 'text',
      response:
        'Stamps, Coins, Comic books, Vintage items, Antiques, Postcards, Books, Artwork, Rocks and minerals, Seashells, Action figures, Dolls, Vinyl records, Sports memorabilia, Trading cards, Toy cars, Watches, Jewelry, Keychains, Bottle caps, Pins and badges, Matchboxes, Teapots, Perfume bottles, Jewels, Bags, Souvenir spoons, Model trains, Cosmetics, Clothings, Maps, Military memorabilia, Cameras, Fountain pens, Buttons',
    },
    {
      id: '4',
      question: 'What kind of clothings would you like to receive as gift?',
      category: 'style',
      type: 'image',
      response:
        '/assets/QUESTIONS/bathrobe.png, /assets/QUESTIONS/blazer.png, /assets/QUESTIONS/cardigan.png, /assets/QUESTIONS/cloak.png, /assets/QUESTIONS/coat.png ,/assets/QUESTIONS/costume.png ,/assets/QUESTIONS/dress.png, /assets/QUESTIONS/hoodie.png, /assets/QUESTIONS/jacket.png, /assets/QUESTIONS/maternity_wear.png, /assets/QUESTIONS/pajamas.png, /assets/QUESTIONS/pants.png, /assets/QUESTIONS/pullover.png, /assets/QUESTIONS/shirt.png, /assets/QUESTIONS/skirt.png, /assets/QUESTIONS/sportswear.png, /assets/QUESTIONS/suit.png, /assets/QUESTIONS/sweatshirt.png, /assets/QUESTIONS/swimsuit.png, /assets/QUESTIONS/t-shirt.png, /assets/QUESTIONS/tailleur.png, /assets/QUESTIONS/traditional_wear.png, /assets/QUESTIONS/underwear.png, /assets/QUESTIONS/waistcoat.png',
    },
    {
      id: '5',
      question: 'Which dress brands do you prefer?',
      category: 'brand',
      type: 'text',
      response:
        'Alberta Ferretti, Adidas, Armani, Alexander McQueen, Acanfora, Balmain, Burberry, Banana Republic, Baldinini, Bottega Veneta, Converse, Crocs, Chanel, Calvin Klein, Christian Dior',
    },
  ],
];

export {
  websiteLink,
  termsLink,
  privacyPolicyLink,
  gendersData,
  occasionsData,
  recipientSample,
  notificationTimingPreference,
  repetitionData,
  quizQuestions,
  relationships,
  relationshipsTags,
};
