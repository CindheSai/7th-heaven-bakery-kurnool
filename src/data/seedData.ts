import type {
  CakeCollection,
  GalleryItem,
  MenuItem,
  SiteSettings,
  StoreData,
} from '../types/bakery.ts';

export const IMAGES = {
  heroCake: '/src/assets/images/hero_patisserie_cake_1795708272826.jpg',
  signatureCakes: '/src/assets/images/exp_signature_cakes_1795708273107.jpg',
  cheesecakes: '/src/assets/images/exp_cheesecakes_1795708273644.jpg',
  browniesDesserts: '/src/assets/images/exp_brownies_desserts_1795708273736.jpg',
  waffles: '/src/assets/images/exp_waffles_1795708274888.jpg',
  savouryBites: '/src/assets/images/exp_savoury_bites_1795708275105.jpg',
  coffeeBeverages: '/src/assets/images/exp_coffee_beverages_1795708275878.jpg',
  cafeInterior: '/src/assets/images/about_cafe_interior_1795708276206.jpg',
  indianFusionCake: '/src/assets/images/cake_indian_fusion_1795708276162.jpg',
  customFondantCake: '/src/assets/images/cake_custom_fondant_1795708277102.jpg',
  originalCakeMenuRef: '/assets/aistudio/cakes__4624f894.jpeg',
} as const;

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: '7th Heaven Bakery & Cafe',
  tagline: 'A Slice of Happiness',
  positioning: '100% PURE VEGETARIAN',
  phone: '8885011611',
  whatsappNumber: '918885011611',
  instagramHandle: '@7thheaven_kurnool',
  instagramUrl: 'https://www.instagram.com/7thheaven_kurnool',
  addressLine1: '40/337, Gandhi Nagar',
  addressLine2: 'Kurnool',
  city: 'Kurnool',
  state: 'Andhra Pradesh',
  postalCode: '518001',
  country: 'India',
  hours: '10:00 AM – 10:00 PM',
  heroHeadline: 'Every Bite Feels Like Heaven.',
  heroSubheadline:
    'Discover delightful creations, handcrafted desserts, irresistible savouries and moments worth celebrating at 7th Heaven Bakery & Cafe.',
  promoBanner: '100% Pure Vegetarian Bakery & Patisserie · Open Daily 10:00 AM – 10:00 PM · Gandhi Nagar, Kurnool',
};

const makeId = (prefix: string, cat: string, name: string) =>
  `${prefix}-${cat}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const simpleItems = (
  section: 'Savouries & Sips' | 'Sweet Side',
  category: string,
  items: Array<[string, number, string?]>,
  image?: string
): MenuItem[] =>
  items.map(([name, price, unitNote]) => ({
    id: makeId(section === 'Savouries & Sips' ? 'sav' : 'swt', category, name),
    name,
    section,
    category,
    price,
    unitNote,
    isVeg: true,
    available: true,
    image,
  }));

export const SEED_MENU_ITEMS: MenuItem[] = [
  // ================= PAGE 1 — SAVOURIES & SIPS =================
  ...simpleItems('Savouries & Sips', 'Puffs', [
    ['Veg Puff', 35],
    ['Paneer Puff', 45],
  ], IMAGES.savouryBites),

  ...simpleItems('Savouries & Sips', 'Croissants', [
    ['Chocolate', 50],
    ['Butter', 50],
    ['Cheese Garlic', 50],
  ], IMAGES.savouryBites),

  ...simpleItems('Savouries & Sips', 'Burgers', [
    ['Veggie', 140],
    ['Hash Brown', 130],
    ['Potato Cheese Blast', 150],
    ['Paneer', 160],
    ['Spicy', 130],
  ], IMAGES.savouryBites),

  ...simpleItems('Savouries & Sips', 'Snack Bread', [
    ['Focaccia Bread', 70],
    ['Panini Bread', 60],
    ['Quiche', 80],
    ['Stuffed Bun', 60],
    ['Paneer Cheese Plate', 80],
    ['Korean Cheese Bun', 140],
  ], IMAGES.savouryBites),

  ...simpleItems('Savouries & Sips', 'Rolls', [
    ['Pizza Roll', 75],
    ['Paneer Roll', 75],
    ['Paneer Cheese Roll', 80],
    ['Veg Tikka', 60],
  ], IMAGES.savouryBites),

  ...simpleItems('Savouries & Sips', 'Sandwiches', [
    ['Vegetable Cheese', 140],
    ['Paneer Cheese', 150],
    ['Tandoori Paneer', 160],
  ], IMAGES.savouryBites),

  // Pizza with 6" & 8" variants
  {
    id: makeId('sav', 'Pizza', 'Veg Pizza'),
    name: 'Veg Pizza',
    section: 'Savouries & Sips',
    category: 'Pizza',
    variants: [
      { label: '6-inch', price: 135 },
      { label: '8-inch', price: 160 },
    ],
    isVeg: true,
    available: true,
    image: IMAGES.savouryBites,
  },
  {
    id: makeId('sav', 'Pizza', 'Margherita'),
    name: 'Margherita',
    section: 'Savouries & Sips',
    category: 'Pizza',
    variants: [
      { label: '6-inch', price: 120 },
      { label: '8-inch', price: 140 },
    ],
    isVeg: true,
    available: true,
    image: IMAGES.savouryBites,
  },
  {
    id: makeId('sav', 'Pizza', 'Italian'),
    name: 'Italian',
    section: 'Savouries & Sips',
    category: 'Pizza',
    variants: [
      { label: '6-inch', price: 135 },
      { label: '8-inch', price: 160 },
    ],
    isVeg: true,
    available: true,
    image: IMAGES.savouryBites,
  },
  {
    id: makeId('sav', 'Pizza', 'Paneer'),
    name: 'Paneer',
    section: 'Savouries & Sips',
    category: 'Pizza',
    variants: [
      { label: '6-inch', price: 150 },
      { label: '8-inch', price: 200 },
    ],
    isVeg: true,
    available: true,
    image: IMAGES.savouryBites,
  },

  ...simpleItems('Savouries & Sips', "Fried Momo's", [
    ["Veg Momo's", 130],
    ["Paneer Momo's", 140],
    ["Schezwan Momo's", 130],
  ], IMAGES.savouryBites),

  ...simpleItems('Savouries & Sips', 'French Fries & Munchies', [
    ['Salted Fries', 130],
    ['Pizza Fries', 150],
    ['Barbeque Fries', 150],
    ['Magic Masala', 150],
    ['Garlic Potato Bites', 130],
    ['Veg Nuggets', 130],
    ['Potato Wedges', 140],
    ['Cheese Corn Triangles', 140],
    ['Onion Rings', 140],
    ['Cheese Pizza Fingers', 140],
    ['Peri Peri Fries', 150],
  ], IMAGES.savouryBites),

  ...simpleItems('Savouries & Sips', 'Loaf Bread', [
    ['Milk Bread', 50],
    ['Brown Bread', 60],
    ['Multi Grain Bread', 60],
    ['Oats Bread', 60],
  ], IMAGES.savouryBites),

  ...simpleItems('Savouries & Sips', 'Milk Shakes', [
    ['Blueberry', 160],
    ['Strawberry Bubblegum', 160],
    ['Mango', 190],
    ['Butterscotch', 160],
    ['Oreo', 160],
    ['KitKat', 190],
    ['Chocolaty Excess', 190],
  ], IMAGES.coffeeBeverages),

  ...simpleItems('Savouries & Sips', 'Refreshers', [
    ['Mint Mojito', 130],
    ['Lemon Iced Tea', 130],
    ['Peach Iced Tea', 130],
    ['Passion Fruit Iced Tea', 130],
    ['Strawberry Iced Tea', 130],
    ['Blueberry Iced Tea', 130],
  ], IMAGES.coffeeBeverages),

  ...simpleItems('Savouries & Sips', 'Cold Coffee', [
    ['Tiramisu', 170],
    ['Turkish Delight', 170],
    ['Irish Café & Hazelnut', 170],
    ['Coffee with Ice Cream', 170],
    ['Toffee Nut Frappe', 170],
    ['Chocolaty Frappe', 170],
    ['Coffee Frappe', 170],
  ], IMAGES.coffeeBeverages),

  ...simpleItems('Savouries & Sips', 'Hot Coffee', [
    ['Cappuccino', 140],
    ['Café Latte', 140],
    ['Flat White', 140],
    ['Café Mocha', 140],
  ], IMAGES.coffeeBeverages),

  // ================= PAGE 2 — SWEET SIDE =================
  ...simpleItems('Sweet Side', 'Brownies', [
    ['Dark Chocolate', 75],
    ['Milk Chocolate', 75],
    ['Lotus Biscoff', 75],
    ['Nutella', 75],
    ['Choco Chips', 75],
    ['Oreo', 75],
    ['Walnuts', 75],
    ['Caramel', 75],
  ], IMAGES.browniesDesserts),

  ...simpleItems('Sweet Side', 'Donuts', [
    ['Chocolate Ring', 75],
    ['Rainbow Sprinkle', 75],
    ['Oreo', 75],
    ['Chocolate Filled', 75],
    ['Double Chocolate', 75],
  ], IMAGES.browniesDesserts),

  ...simpleItems('Sweet Side', 'Cup Cakes', [
    ['Chocolate', 30],
    ['Vanilla', 30],
    ['Blueberry', 30],
    ['Red Velvet', 30],
  ], IMAGES.signatureCakes),

  ...simpleItems('Sweet Side', 'Macarons', [
    ['Peanut Butter', 50],
    ['Black Forest', 50],
    ['Blueberry', 50],
    ['Strawberry', 50],
    ['Chocolate', 50],
  ], IMAGES.browniesDesserts),

  ...simpleItems('Sweet Side', 'Edible Cup Mousse', [
    ['Chocolate', 75],
    ['Coffee', 75],
    ['Strawberry', 75],
    ['Blueberry', 75],
  ], IMAGES.browniesDesserts),

  ...simpleItems('Sweet Side', 'No Bake Cheesecakes', [
    ['Original New York', 135],
    ['Hazelnut', 135],
    ['Cookies & Cream', 135],
    ['Blueberry', 135],
    ['Strawberry', 135],
    ['Lotus Biscoff', 135],
    ['Mango', 135],
  ], IMAGES.cheesecakes),

  ...simpleItems('Sweet Side', 'Baked Cheesecakes', [
    ['Triple Chocolate', 190],
    ['Lotus Biscoff', 200],
    ['Nutella', 190],
    ['Dark Chocolate', 180],
    ['Blueberry', 180],
    ['Strawberry', 180],
  ], IMAGES.cheesecakes),

  ...simpleItems('Sweet Side', 'Glass Desserts', [
    ['Chocolate Mousse', 75],
    ['Pineapple', 75],
    ['Strawberry Delight', 75],
    ['Blueberry Cheese', 75],
    ['Mango Soufflé', 75],
    ['Lotus Biscoff', 75],
    ['Oreo Crush', 75],
  ], IMAGES.browniesDesserts),

  ...simpleItems('Sweet Side', 'Tub Desserts', [
    ['Tres Leches', 160],
    ['Tiramisu', 160],
    ['Apricot Delight', 180],
    ['Nutty Chocolate', 180],
  ], IMAGES.browniesDesserts),

  ...simpleItems('Sweet Side', 'Cookie Cup', [
    ['Nutella', 50],
    ['Biscoff', 50],
    ['Dark Chocolate', 50],
    ['Coffee Biscoff', 50],
  ], IMAGES.browniesDesserts),

  ...simpleItems('Sweet Side', 'Waffles', [
    ['Honey & Butter', 130],
    ['Cookies & Cream', 150],
    ['Double Trouble', 140],
    ['Vanilla Ice Cream', 150],
    ['Blueberry Cream Cheese', 150],
    ['Strawberry Cream Cheese', 150],
    ['Chocolaty Madness', 150],
    ['Nutella Madness', 150],
  ], IMAGES.waffles),

  ...simpleItems('Sweet Side', 'Cake Bowl', [
    ['Dark Chocolate', 200],
    ['Milk Chocolate', 200],
    ['Triple Chocolate', 200],
    ['Nutella', 200],
    ['Nutty Chocolate', 200],
    ['Tiramisu', 200],
    ['Lotus Biscoff', 200],
  ], IMAGES.signatureCakes),

  ...simpleItems('Sweet Side', 'Brownie Bowl', [
    ['Dark Chocolate', 200],
    ['Milk Chocolate', 200],
    ['Nutella', 200],
    ['Nutty Chocolate', 200],
    ['Lotus Biscoff', 200],
  ], IMAGES.browniesDesserts),

  ...simpleItems('Sweet Side', 'Heavenly Desserts', [
    ['Cake Sicles', 90],
    ['Lava Cake', 75],
    ['Well Cakes', 135],
    ['Cake Pop', 50],
    ['Choco Ball', 30],
    ['Brownie with Ice Cream', 150],
    ['Cookie Dough Chocolate Pizza', 100, 'Also known as Chocolate Pizza'],
  ], IMAGES.browniesDesserts),

  ...simpleItems('Sweet Side', 'Tarts', [
    ['Chocolate', 55],
    ['Blueberry', 55],
    ['Strawberry', 55],
  ], IMAGES.browniesDesserts),

  ...simpleItems('Sweet Side', 'Ice Creams', [
    ['Vanilla', 70, 'per scoop'],
    ['Chocolate', 80, 'per scoop'],
    ['Butterscotch', 80, 'per scoop'],
    ['Mellow Jello', 80, 'per scoop'],
    ['Cookies & Cream', 90, 'per scoop'],
    ['Sitaphal', 95, 'per scoop'],
    ['Alphonso Mango', 95, 'per scoop'],
    ['Kulfi', 95, 'per scoop'],
    ['Pista', 95, 'per scoop'],
  ], IMAGES.waffles),
];

export const SEED_CAKE_COLLECTIONS: CakeCollection[] = [
  {
    id: 'cake-classic',
    name: 'Classic Cakes',
    slug: 'classic-cakes',
    description:
      'Timeless celebration favourites crafted in Half KG, 1 KG, and 100g pastry portions.',
    image: IMAGES.signatureCakes,
    halfKgPrice: 350,
    oneKgPrice: 700,
    pastryPrice: 75,
    pastrySizeLabel: 'Pastry (100g)',
    serveSizeNote: 'Calories shown per 100g serving',
    priceVerificationStatus: 'needs_verification',
    verificationNote:
      'Half KG printed price appears slightly faint in menu photo (read as ₹350 matching 1 KG ₹700); confirm with bakery.',
    flavours: [
      { name: 'Butterscotch', calories: '302 Kcal' },
      { name: 'Black Forest', calories: '285 Kcal' },
      { name: 'Pineapple', calories: '279 Kcal', isSignature: true },
    ],
  },
  {
    id: 'cake-premium',
    name: 'Premium Cakes',
    slug: 'premium-cakes',
    description:
      'Layered sponge and cream creations featuring berries, coffee, and rich cocoa.',
    image: IMAGES.heroCake,
    halfKgPrice: 450,
    oneKgPrice: 900,
    pastryPrice: 85,
    pastrySizeLabel: 'Pastry (100g)',
    serveSizeNote: 'Calories shown per 100g serving',
    priceVerificationStatus: 'needs_verification',
    verificationNote:
      'Pastry price ₹85 has slight print glare in menu photo; Half KG ₹450 and 1 KG ₹900 extracted from print.',
    flavours: [
      { name: 'Café Delight', calories: '301 Kcal' },
      { name: 'Strawberry', calories: '285 Kcal' },
      { name: 'Blueberry Bliss Delight', calories: '285 Kcal', isSignature: true },
      { name: 'Mixed Berries', calories: '285 Kcal' },
      { name: 'Creamy Chocolaty Delight', calories: '316 Kcal' },
      { name: 'Chocolaty Globe', calories: '436 Kcal' },
      { name: 'Dark Overload', calories: '417 Kcal' },
      { name: 'Chocolaty Vanilla', calories: '316 Kcal' },
    ],
  },
  {
    id: 'cake-exotic',
    name: 'Exotic Cakes',
    slug: 'exotic-cakes',
    description:
      'An expansive selection of fruit-infused, caramel, and intense dark chocolate cakes.',
    image: IMAGES.signatureCakes,
    halfKgPrice: 500,
    oneKgPrice: 1000,
    pastryPrice: 95,
    pastrySizeLabel: 'Pastry (100g)',
    serveSizeNote: 'Calories shown per 100g serving',
    priceVerificationStatus: 'verified',
    flavours: [
      { name: 'Mango Tango Delight', calories: '284 Kcal' },
      { name: 'White Forest', calories: '282 Kcal' },
      { name: 'Cherry Mouse', calories: '321 Kcal' },
      { name: 'Fruit Chocolate Flavour', calories: '426 Kcal' },
      { name: 'Mango & Blueberry', calories: '284 Kcal' },
      { name: 'Chocolaty Caramel Indulgence', calories: '298 Kcal' },
      { name: 'Milk Chocolate Flavour', calories: '414 Kcal' },
      { name: 'Fudgy Excess', calories: '436 Kcal' },
      { name: 'Dark Chocolate Flavour', calories: '422 Kcal', isSignature: true },
      { name: 'Dark Knight', calories: '436 Kcal' },
      { name: 'Dark Fantasy', calories: '419 Kcal' },
      { name: 'Chocolaty Strawberry', calories: '427 Kcal' },
      { name: 'Caramel White Choco Flavour', calories: '311 Kcal' },
      { name: 'Tiramisu', calories: '321 Kcal' },
      { name: 'Fresh Fruit', calories: '273 Kcal', isSignature: true },
      { name: 'Dark Mousse', calories: '316 Kcal', isSignature: true },
      { name: 'Lychee' },
    ],
  },
  {
    id: 'cake-premium-exotic',
    name: 'Premium Exotic Cakes',
    slug: 'premium-exotic-cakes',
    description:
      'Gourmet nut, Belgian-style triple chocolate, red velvet cream cheese, and iconic confections.',
    image: IMAGES.heroCake,
    halfKgPrice: 550,
    oneKgPrice: 1100,
    pastryPrice: 105,
    pastrySizeLabel: 'Pastry (100g)',
    serveSizeNote: 'Calories shown per 100g serving (or full cake where printed)',
    priceVerificationStatus: 'needs_verification',
    verificationNote:
      'Half KG ₹550 is slightly low-contrast in print; 1 KG ₹1100 and Pastry ₹105 are visible.',
    flavours: [
      { name: 'Hazelnut Crunch', calories: '459 Kcal' },
      { name: 'Chocolaty Chips', calories: '466 Kcal' },
      { name: 'Triple Chocolate Flavour', calories: '466 Kcal', isSignature: true },
      { name: 'Chocolaty Walnut Bliss', calories: '464 Kcal', isSignature: true },
      { name: 'Chocolaty Bombs', calories: '422 Kcal' },
      { name: 'Red Velvet Dark Fantasy', calories: '422 Kcal' },
      { name: 'R. V. Cream Cheese', calories: '303 Kcal', isSignature: true },
      { name: 'R. V. Raspberry Choco Flavour', calories: '427 Kcal' },
      { name: 'Raspberry Madness', calories: '282 Kcal' },
      { name: 'Coconut Bliss', calories: '300 Kcal' },
      { name: 'Chocolaty Excess', calories: '437 Kcal', isSignature: true },
      { name: 'Roasted Almond', calories: '432 Kcal' },
      { name: 'KitKat® & Gems®', calories: '539 Kcal' },
      { name: 'Nutella® Rocher', calories: '440 Kcal', isSignature: true },
      { name: 'KitKat®', calories: '457 Kcal' },
      { name: 'Oreos', calories: '428 Kcal' },
      { name: 'Cup Cake Drip', calories: '2184 Kcal' },
      { name: 'Snickers®', calories: '2297 Kcal' },
      { name: 'Pinacolada', calories: '1429 Kcal' },
      { name: 'Rainbow', calories: '1517 Kcal' },
      { name: 'Cupid', calories: '2184 Kcal' },
      { name: "L'Opera", calories: '4416 Kcal' },
    ],
  },
  {
    id: 'cake-supreme',
    name: 'Supreme Cakes',
    slug: 'supreme-cakes',
    description:
      'Showstopping patisserie centrepieces including Golden Drip, Lotus Biscoff, and Rose & Pistachio.',
    image: IMAGES.signatureCakes,
    halfKgPrice: 625,
    oneKgPrice: 1250,
    serveSizeNote: 'Calories shown per 500g serving',
    priceVerificationStatus: 'verified',
    flavours: [
      { name: 'Flower Basket', calories: '1473 Kcal' },
      { name: 'Exquisite Fruit', calories: '1366 Kcal' },
      { name: 'Golden Drip', calories: '2098 Kcal' },
      { name: 'Lotus Biscoff®', calories: '1609 Kcal', isSignature: true },
      { name: 'Rose & Pistachio', calories: '1591 Kcal' },
      { name: 'Dark Drip Overload', calories: '2086 Kcal', isSignature: true },
    ],
  },
  {
    id: 'cake-pie',
    name: 'Pie Cakes',
    slug: 'pie-cakes',
    description:
      'Rich pie-style baked cakes including Banoffee, seasonal Mango, and Chocolaty Caramel.',
    image: IMAGES.browniesDesserts,
    halfKgPrice: 650,
    oneKgPrice: 1280,
    serveSizeNote: 'Calories shown per 500g serving',
    priceVerificationStatus: 'needs_verification',
    verificationNote:
      'Pie Cakes Half KG (read as ₹650) and 1 KG (read as ₹1280) have print glare on the menu card — confirm before billing.',
    flavours: [
      { name: 'Banoffee', calories: '1790 Kcal' },
      { name: 'Mango (seasonal)', calories: '1769 Kcal' },
      { name: 'Dark Chocolate Flavour', calories: '2422 Kcal' },
      { name: 'Chocolaty Caramel', calories: '2375 Kcal' },
    ],
  },
  {
    id: 'cake-indian',
    name: 'Indian Cakes',
    slug: 'indian-cakes',
    description:
      'Celebratory fusion cakes inspired by beloved Indian mithai including Rasmalai, Motichoor, and Kaju Katli.',
    image: IMAGES.indianFusionCake,
    halfKgPrice: 670,
    oneKgPrice: 1320,
    serveSizeNote: 'Calories shown per 500g serving',
    priceVerificationStatus: 'verified',
    flavours: [
      { name: 'Rasmalai', calories: '1506 Kcal' },
      { name: 'Gulab Jamun Tart', calories: '1881 Kcal' },
      { name: 'Motichoor', calories: '1898 Kcal', isSignature: true },
      { name: 'Kaju Katli', calories: '1980 Kcal' },
      { name: 'Gulkand', calories: '1299 Kcal' },
      { name: 'Coconut Burfi Chocolaty Mousse', calories: '2010 Kcal' },
    ],
  },
  {
    id: 'cake-ice-cream',
    name: 'Ice Cream Cakes',
    slug: 'ice-cream-cakes',
    description:
      'Chilled 500g serve ice cream cakes priced individually by flavour.',
    image: IMAGES.waffles,
    halfKgPrice: null,
    oneKgPrice: null,
    serveSizeNote: 'Serve size: 500 gms · Per-flavour pricing',
    priceVerificationStatus: 'verified',
    flavours: [
      { name: 'Black Forest', calories: '1238 Kcal', price500g: 350 },
      { name: 'Butterscotch', calories: '1343 Kcal', price500g: 350, isSignature: true },
      { name: 'Chocolaty Chips', calories: '1555 Kcal', price500g: 400 },
      { name: 'Mango', calories: '1257 Kcal', price500g: 400 },
      { name: 'Red Velvet', calories: '1399 Kcal', price500g: 500 },
      { name: 'American Nuts', calories: '933 Kcal', price500g: 500 },
    ],
  },
  {
    id: 'cake-no-bake-cheesecake',
    name: 'No-Bake Cheesecakes',
    slug: 'no-bake-cheesecakes',
    description:
      'Silky chilled cheesecakes available in Half KG, 1 KG, and 120g pastry slices.',
    image: IMAGES.cheesecakes,
    halfKgPrice: 585,
    oneKgPrice: 1170,
    pastryPrice: 95,
    pastrySizeLabel: 'Pastry (120g)',
    serveSizeNote: 'Calories shown per 120g serving (Note: café slice menu lists ₹135)',
    priceVerificationStatus: 'needs_verification',
    verificationNote:
      'Cake menu Half KG (read as ₹585) and Pastry 120g (read as ₹95) have glare on print; 1 KG ₹1170 is clear.',
    flavours: [
      { name: 'Original New York', calories: '203 Kcal' },
      { name: 'Hazelnut', calories: '165 Kcal' },
      { name: 'Cookies & Cream', calories: '285 Kcal', isSignature: true },
      { name: 'Blueberry Bliss Delight', calories: '174 Kcal' },
      { name: 'Strawberry', calories: '174 Kcal' },
      { name: 'Lotus Biscoff®', calories: '167 Kcal' },
      { name: 'Mango Symphony', calories: '174 Kcal' },
    ],
  },
  {
    id: 'cake-baked-cheesecake',
    name: 'Baked Cheesecakes',
    slug: 'baked-cheesecakes',
    description:
      'Rich oven-baked cheesecakes with individual pastry slice prices and serving weights.',
    image: IMAGES.cheesecakes,
    halfKgPrice: 750,
    oneKgPrice: 1450,
    serveSizeNote: 'Half KG ₹750 · 1 KG ₹1450 · Individual pastry prices shown per flavour',
    priceVerificationStatus: 'verified',
    flavours: [
      { name: 'Triple Chocolate Flavour', calories: '440 Kcal', pastryPrice: 155, serveSizeGrams: 144 },
      { name: 'Lotus Biscoff®', calories: '439 Kcal', pastryPrice: 195, serveSizeGrams: 109 },
      { name: 'Nutella®', calories: '435 Kcal', pastryPrice: 165, serveSizeGrams: 108 },
      { name: 'Dark Chocolate Flavour', calories: '443 Kcal', pastryPrice: 155, serveSizeGrams: 114 },
      { name: 'Sea Salt Caramel', calories: '421 Kcal', pastryPrice: 155, serveSizeGrams: 113 },
      { name: 'Blueberry', calories: '402 Kcal', pastryPrice: 170, serveSizeGrams: 114 },
      { name: 'Strawberry Blossom', calories: '402 Kcal', pastryPrice: 165, serveSizeGrams: 114 },
    ],
  },
  {
    id: 'cake-photo',
    name: 'Photo Cake',
    slug: 'photo-cake',
    description:
      'We print the photograph of your choice on an edible paper with edible ink and place it on the cake you prefer. This is the best cake to cherish special memories and moments.',
    image: IMAGES.signatureCakes,
    halfKgPrice: 655,
    oneKgPrice: 1250,
    priceVerificationStatus: 'needs_verification',
    verificationNote:
      'Half KG price (read as ₹655) is softly printed on the cake card; 1 KG ₹1250 is clearly visible.',
    flavours: [
      { name: 'Custom Edible Print on Preferred Base Flavour' },
    ],
    isCustomCategory: true,
  },
  {
    id: 'cake-shape',
    name: 'Shape Cake',
    slug: 'shape-cake',
    description:
      'We create unique cakes of different shapes made using cream frosting. Cake shaped like a car or a doll? We have you covered!',
    image: IMAGES.customFondantCake,
    halfKgPrice: null,
    oneKgPrice: null,
    perKgPrice: 1400,
    priceVerificationStatus: 'verified',
    flavours: [
      { name: 'Car, Doll & Custom Cream-Frosted Shapes' },
    ],
    isCustomCategory: true,
  },
  {
    id: 'cake-3d-customised',
    name: '3D Customised Cake',
    slug: '3d-customised-cake',
    description:
      "We design cakes as per your desire using fondant. Get a specialized multi-tiered wedding cake or a detailed handbag cake, the sky's the limit!",
    image: IMAGES.customFondantCake,
    halfKgPrice: null,
    oneKgPrice: null,
    perKgPrice: 1750,
    priceVerificationStatus: 'verified',
    flavours: [
      { name: 'Multi-Tiered Wedding Cakes' },
      { name: 'Sculpted Fondant Theme Cakes' },
    ],
    isCustomCategory: true,
  },
];

export const SEED_GALLERY: GalleryItem[] = [
  {
    id: 'gal-kurnool-1',
    title: '7th Heaven Bakery & Cafe Storefront',
    category: 'Café Experience',
    image: '/assets/gallery/kurnool_store_0.jpg',
    caption: '40/337, Gandhi Nagar, Kurnool · Storefront exterior',
    isAuthenticBusinessPhoto: true,
  },
  {
    id: 'gal-kurnool-2',
    title: 'Patisserie Counter & Display Lounge',
    category: 'Café Experience',
    image: '/assets/gallery/kurnool_store_4.jpg',
    caption: 'Inside 7th Heaven Bakery & Cafe, Gandhi Nagar, Kurnool',
    isAuthenticBusinessPhoto: true,
  },
  {
    id: 'gal-kurnool-3',
    title: 'Dine-In Seating & Warm Ambience',
    category: 'Café Experience',
    image: '/assets/gallery/kurnool_store_7.jpg',
    caption: 'Café seating area at our Gandhi Nagar outlet',
    isAuthenticBusinessPhoto: true,
  },
  {
    id: 'gal-kurnool-4',
    title: 'Illuminated Cake & Jar Dessert Showcase',
    category: 'Signature Cakes',
    image: '/assets/gallery/kurnool_store_8.jpg',
    caption: 'Chilled glass counter featuring celebration cakes and glass desserts',
    isAuthenticBusinessPhoto: true,
  },
  {
    id: 'gal-kurnool-5',
    title: 'Celebration Cakes Display Counter',
    category: 'Signature Cakes',
    image: '/assets/gallery/kurnool_store_1.jpg',
    caption: 'Freshly displayed butterscotch, chocolate, and fruit celebration cakes',
    isAuthenticBusinessPhoto: true,
  },
  {
    id: 'gal-kurnool-6',
    title: 'Dark Chocolate Rose Celebration Cake',
    category: 'Signature Cakes',
    image: '/assets/gallery/real_kurnool_1.jpg',
    caption: 'Handcrafted chocolate cake with piped dark chocolate roses',
    isAuthenticBusinessPhoto: true,
  },
  {
    id: 'gal-kurnool-7',
    title: 'Chocolate Truffle & Exotic Cake Selection',
    category: 'Signature Cakes',
    image: '/assets/gallery/kurnool_store_11.jpg',
    caption: 'Assorted truffle, white forest, and exotic cakes in our display',
    isAuthenticBusinessPhoto: true,
  },
  {
    id: 'gal-kurnool-8',
    title: 'Classic Pineapple & Butterscotch Cake',
    category: 'Signature Cakes',
    image: '/assets/gallery/kurnool_store_5.jpg',
    caption: 'Glazed yellow celebration cake finished with dark chocolate curls',
    isAuthenticBusinessPhoto: true,
  },
  {
    id: 'gal-kurnool-9',
    title: 'Signature Cookie Dough Chocolate Pizza',
    category: 'Desserts',
    image: '/assets/gallery/kurnool_store_3.jpg',
    caption: 'Topped with chocolate chips, almonds, gems, and crisp wafer pieces',
    isAuthenticBusinessPhoto: true,
  },
  {
    id: 'gal-kurnool-10',
    title: 'Brownies, Donuts, Cupcakes & Loaf Breads',
    category: 'Brownies',
    image: '/assets/gallery/kurnool_store_12.jpg',
    caption: 'Freshly stocked counter of brownies, donuts, cupcakes, and breads',
    isAuthenticBusinessPhoto: true,
  },
  {
    id: 'gal-kurnool-11',
    title: 'Festive Cashew & Dry Fruit Cake',
    category: 'Desserts',
    image: '/assets/gallery/kurnool_store_13.jpg',
    caption: 'Rich plum and cashew dry-fruit cake from 7th Heaven Kurnool',
    isAuthenticBusinessPhoto: true,
  },
];

export const INITIAL_STORE_DATA: StoreData = {
  settings: DEFAULT_SETTINGS,
  menuItems: SEED_MENU_ITEMS,
  cakeCollections: SEED_CAKE_COLLECTIONS,
  gallery: SEED_GALLERY,
  enquiries: [],
};
