// server.ts
import crypto3 from "crypto";
import "dotenv/config";
import express from "express";
import fs2 from "fs";
import path2 from "path";
import { z } from "zod";

// server/auth.ts
import crypto2 from "crypto";

// server/store.ts
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { Pool } from "pg";

// src/data/seedData.ts
var IMAGES = {
  heroCake: "/src/assets/images/hero_patisserie_cake_1795708272826.jpg",
  signatureCakes: "/src/assets/images/exp_signature_cakes_1795708273107.jpg",
  cheesecakes: "/src/assets/images/exp_cheesecakes_1795708273644.jpg",
  browniesDesserts: "/src/assets/images/exp_brownies_desserts_1795708273736.jpg",
  waffles: "/src/assets/images/exp_waffles_1795708274888.jpg",
  savouryBites: "/src/assets/images/exp_savoury_bites_1795708275105.jpg",
  coffeeBeverages: "/src/assets/images/exp_coffee_beverages_1795708275878.jpg",
  cafeInterior: "/src/assets/images/about_cafe_interior_1795708276206.jpg",
  indianFusionCake: "/src/assets/images/cake_indian_fusion_1795708276162.jpg",
  customFondantCake: "/src/assets/images/cake_custom_fondant_1795708277102.jpg",
  originalCakeMenuRef: "/assets/aistudio/cakes__4624f894.jpeg"
};
var DEFAULT_SETTINGS = {
  brandName: "7th Heaven Bakery & Cafe",
  tagline: "A Slice of Happiness",
  positioning: "100% PURE VEGETARIAN",
  phone: "8885011611",
  whatsappNumber: "918885011611",
  instagramHandle: "@7thheaven_kurnool",
  instagramUrl: "https://www.instagram.com/7thheaven_kurnool",
  addressLine1: "40/337, Gandhi Nagar",
  addressLine2: "Kurnool",
  city: "Kurnool",
  state: "Andhra Pradesh",
  postalCode: "518001",
  country: "India",
  hours: "10:00 AM \u2013 10:00 PM",
  heroHeadline: "Every Bite Feels Like Heaven.",
  heroSubheadline: "Discover delightful creations, handcrafted desserts, irresistible savouries and moments worth celebrating at 7th Heaven Bakery & Cafe.",
  promoBanner: "100% Pure Vegetarian Bakery & Patisserie \xB7 Open Daily 10:00 AM \u2013 10:00 PM \xB7 Gandhi Nagar, Kurnool"
};
var makeId = (prefix, cat, name) => `${prefix}-${cat}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
var simpleItems = (section, category, items, image) => items.map(([name, price, unitNote]) => ({
  id: makeId(section === "Savouries & Sips" ? "sav" : "swt", category, name),
  name,
  section,
  category,
  price,
  unitNote,
  isVeg: true,
  available: true,
  image
}));
var SEED_MENU_ITEMS = [
  // ================= PAGE 1 — SAVOURIES & SIPS =================
  ...simpleItems("Savouries & Sips", "Puffs", [
    ["Veg Puff", 35],
    ["Paneer Puff", 45]
  ], IMAGES.savouryBites),
  ...simpleItems("Savouries & Sips", "Croissants", [
    ["Chocolate", 50],
    ["Butter", 50],
    ["Cheese Garlic", 50]
  ], IMAGES.savouryBites),
  ...simpleItems("Savouries & Sips", "Burgers", [
    ["Veggie", 140],
    ["Hash Brown", 130],
    ["Potato Cheese Blast", 150],
    ["Paneer", 160],
    ["Spicy", 130]
  ], IMAGES.savouryBites),
  ...simpleItems("Savouries & Sips", "Snack Bread", [
    ["Focaccia Bread", 70],
    ["Panini Bread", 60],
    ["Quiche", 80],
    ["Stuffed Bun", 60],
    ["Paneer Cheese Plate", 80],
    ["Korean Cheese Bun", 140]
  ], IMAGES.savouryBites),
  ...simpleItems("Savouries & Sips", "Rolls", [
    ["Pizza Roll", 75],
    ["Paneer Roll", 75],
    ["Paneer Cheese Roll", 80],
    ["Veg Tikka", 60]
  ], IMAGES.savouryBites),
  ...simpleItems("Savouries & Sips", "Sandwiches", [
    ["Vegetable Cheese", 140],
    ["Paneer Cheese", 150],
    ["Tandoori Paneer", 160]
  ], IMAGES.savouryBites),
  // Pizza with 6" & 8" variants
  {
    id: makeId("sav", "Pizza", "Veg Pizza"),
    name: "Veg Pizza",
    section: "Savouries & Sips",
    category: "Pizza",
    variants: [
      { label: "6-inch", price: 135 },
      { label: "8-inch", price: 160 }
    ],
    isVeg: true,
    available: true,
    image: IMAGES.savouryBites
  },
  {
    id: makeId("sav", "Pizza", "Margherita"),
    name: "Margherita",
    section: "Savouries & Sips",
    category: "Pizza",
    variants: [
      { label: "6-inch", price: 120 },
      { label: "8-inch", price: 140 }
    ],
    isVeg: true,
    available: true,
    image: IMAGES.savouryBites
  },
  {
    id: makeId("sav", "Pizza", "Italian"),
    name: "Italian",
    section: "Savouries & Sips",
    category: "Pizza",
    variants: [
      { label: "6-inch", price: 135 },
      { label: "8-inch", price: 160 }
    ],
    isVeg: true,
    available: true,
    image: IMAGES.savouryBites
  },
  {
    id: makeId("sav", "Pizza", "Paneer"),
    name: "Paneer",
    section: "Savouries & Sips",
    category: "Pizza",
    variants: [
      { label: "6-inch", price: 150 },
      { label: "8-inch", price: 200 }
    ],
    isVeg: true,
    available: true,
    image: IMAGES.savouryBites
  },
  ...simpleItems("Savouries & Sips", "Fried Momo's", [
    ["Veg Momo's", 130],
    ["Paneer Momo's", 140],
    ["Schezwan Momo's", 130]
  ], IMAGES.savouryBites),
  ...simpleItems("Savouries & Sips", "French Fries & Munchies", [
    ["Salted Fries", 130],
    ["Pizza Fries", 150],
    ["Barbeque Fries", 150],
    ["Magic Masala", 150],
    ["Garlic Potato Bites", 130],
    ["Veg Nuggets", 130],
    ["Potato Wedges", 140],
    ["Cheese Corn Triangles", 140],
    ["Onion Rings", 140],
    ["Cheese Pizza Fingers", 140],
    ["Peri Peri Fries", 150]
  ], IMAGES.savouryBites),
  ...simpleItems("Savouries & Sips", "Loaf Bread", [
    ["Milk Bread", 50],
    ["Brown Bread", 60],
    ["Multi Grain Bread", 60],
    ["Oats Bread", 60]
  ], IMAGES.savouryBites),
  ...simpleItems("Savouries & Sips", "Milk Shakes", [
    ["Blueberry", 160],
    ["Strawberry Bubblegum", 160],
    ["Mango", 190],
    ["Butterscotch", 160],
    ["Oreo", 160],
    ["KitKat", 190],
    ["Chocolaty Excess", 190]
  ], IMAGES.coffeeBeverages),
  ...simpleItems("Savouries & Sips", "Refreshers", [
    ["Mint Mojito", 130],
    ["Lemon Iced Tea", 130],
    ["Peach Iced Tea", 130],
    ["Passion Fruit Iced Tea", 130],
    ["Strawberry Iced Tea", 130],
    ["Blueberry Iced Tea", 130]
  ], IMAGES.coffeeBeverages),
  ...simpleItems("Savouries & Sips", "Cold Coffee", [
    ["Tiramisu", 170],
    ["Turkish Delight", 170],
    ["Irish Caf\xE9 & Hazelnut", 170],
    ["Coffee with Ice Cream", 170],
    ["Toffee Nut Frappe", 170],
    ["Chocolaty Frappe", 170],
    ["Coffee Frappe", 170]
  ], IMAGES.coffeeBeverages),
  ...simpleItems("Savouries & Sips", "Hot Coffee", [
    ["Cappuccino", 140],
    ["Caf\xE9 Latte", 140],
    ["Flat White", 140],
    ["Caf\xE9 Mocha", 140]
  ], IMAGES.coffeeBeverages),
  // ================= PAGE 2 — SWEET SIDE =================
  ...simpleItems("Sweet Side", "Brownies", [
    ["Dark Chocolate", 75],
    ["Milk Chocolate", 75],
    ["Lotus Biscoff", 75],
    ["Nutella", 75],
    ["Choco Chips", 75],
    ["Oreo", 75],
    ["Walnuts", 75],
    ["Caramel", 75]
  ], IMAGES.browniesDesserts),
  ...simpleItems("Sweet Side", "Donuts", [
    ["Chocolate Ring", 75],
    ["Rainbow Sprinkle", 75],
    ["Oreo", 75],
    ["Chocolate Filled", 75],
    ["Double Chocolate", 75]
  ], IMAGES.browniesDesserts),
  ...simpleItems("Sweet Side", "Cup Cakes", [
    ["Chocolate", 30],
    ["Vanilla", 30],
    ["Blueberry", 30],
    ["Red Velvet", 30]
  ], IMAGES.signatureCakes),
  ...simpleItems("Sweet Side", "Macarons", [
    ["Peanut Butter", 50],
    ["Black Forest", 50],
    ["Blueberry", 50],
    ["Strawberry", 50],
    ["Chocolate", 50]
  ], IMAGES.browniesDesserts),
  ...simpleItems("Sweet Side", "Edible Cup Mousse", [
    ["Chocolate", 75],
    ["Coffee", 75],
    ["Strawberry", 75],
    ["Blueberry", 75]
  ], IMAGES.browniesDesserts),
  ...simpleItems("Sweet Side", "No Bake Cheesecakes", [
    ["Original New York", 135],
    ["Hazelnut", 135],
    ["Cookies & Cream", 135],
    ["Blueberry", 135],
    ["Strawberry", 135],
    ["Lotus Biscoff", 135],
    ["Mango", 135]
  ], IMAGES.cheesecakes),
  ...simpleItems("Sweet Side", "Baked Cheesecakes", [
    ["Triple Chocolate", 190],
    ["Lotus Biscoff", 200],
    ["Nutella", 190],
    ["Dark Chocolate", 180],
    ["Blueberry", 180],
    ["Strawberry", 180]
  ], IMAGES.cheesecakes),
  ...simpleItems("Sweet Side", "Glass Desserts", [
    ["Chocolate Mousse", 75],
    ["Pineapple", 75],
    ["Strawberry Delight", 75],
    ["Blueberry Cheese", 75],
    ["Mango Souffl\xE9", 75],
    ["Lotus Biscoff", 75],
    ["Oreo Crush", 75]
  ], IMAGES.browniesDesserts),
  ...simpleItems("Sweet Side", "Tub Desserts", [
    ["Tres Leches", 160],
    ["Tiramisu", 160],
    ["Apricot Delight", 180],
    ["Nutty Chocolate", 180]
  ], IMAGES.browniesDesserts),
  ...simpleItems("Sweet Side", "Cookie Cup", [
    ["Nutella", 50],
    ["Biscoff", 50],
    ["Dark Chocolate", 50],
    ["Coffee Biscoff", 50]
  ], IMAGES.browniesDesserts),
  ...simpleItems("Sweet Side", "Waffles", [
    ["Honey & Butter", 130],
    ["Cookies & Cream", 150],
    ["Double Trouble", 140],
    ["Vanilla Ice Cream", 150],
    ["Blueberry Cream Cheese", 150],
    ["Strawberry Cream Cheese", 150],
    ["Chocolaty Madness", 150],
    ["Nutella Madness", 150]
  ], IMAGES.waffles),
  ...simpleItems("Sweet Side", "Cake Bowl", [
    ["Dark Chocolate", 200],
    ["Milk Chocolate", 200],
    ["Triple Chocolate", 200],
    ["Nutella", 200],
    ["Nutty Chocolate", 200],
    ["Tiramisu", 200],
    ["Lotus Biscoff", 200]
  ], IMAGES.signatureCakes),
  ...simpleItems("Sweet Side", "Brownie Bowl", [
    ["Dark Chocolate", 200],
    ["Milk Chocolate", 200],
    ["Nutella", 200],
    ["Nutty Chocolate", 200],
    ["Lotus Biscoff", 200]
  ], IMAGES.browniesDesserts),
  ...simpleItems("Sweet Side", "Heavenly Desserts", [
    ["Cake Sicles", 90],
    ["Lava Cake", 75],
    ["Well Cakes", 135],
    ["Cake Pop", 50],
    ["Choco Ball", 30],
    ["Brownie with Ice Cream", 150],
    ["Cookie Dough Chocolate Pizza", 100, "Also known as Chocolate Pizza"]
  ], IMAGES.browniesDesserts),
  ...simpleItems("Sweet Side", "Tarts", [
    ["Chocolate", 55],
    ["Blueberry", 55],
    ["Strawberry", 55]
  ], IMAGES.browniesDesserts),
  ...simpleItems("Sweet Side", "Ice Creams", [
    ["Vanilla", 70, "per scoop"],
    ["Chocolate", 80, "per scoop"],
    ["Butterscotch", 80, "per scoop"],
    ["Mellow Jello", 80, "per scoop"],
    ["Cookies & Cream", 90, "per scoop"],
    ["Sitaphal", 95, "per scoop"],
    ["Alphonso Mango", 95, "per scoop"],
    ["Kulfi", 95, "per scoop"],
    ["Pista", 95, "per scoop"]
  ], IMAGES.waffles)
];
var SEED_CAKE_COLLECTIONS = [
  {
    id: "cake-classic",
    name: "Classic Cakes",
    slug: "classic-cakes",
    description: "Timeless celebration favourites crafted in Half KG, 1 KG, and 100g pastry portions.",
    image: IMAGES.signatureCakes,
    halfKgPrice: 350,
    oneKgPrice: 700,
    pastryPrice: 75,
    pastrySizeLabel: "Pastry (100g)",
    serveSizeNote: "Calories shown per 100g serving",
    priceVerificationStatus: "needs_verification",
    verificationNote: "Half KG printed price appears slightly faint in menu photo (read as \u20B9350 matching 1 KG \u20B9700); confirm with bakery.",
    flavours: [
      { name: "Butterscotch", calories: "302 Kcal" },
      { name: "Black Forest", calories: "285 Kcal" },
      { name: "Pineapple", calories: "279 Kcal", isSignature: true }
    ]
  },
  {
    id: "cake-premium",
    name: "Premium Cakes",
    slug: "premium-cakes",
    description: "Layered sponge and cream creations featuring berries, coffee, and rich cocoa.",
    image: IMAGES.heroCake,
    halfKgPrice: 450,
    oneKgPrice: 900,
    pastryPrice: 85,
    pastrySizeLabel: "Pastry (100g)",
    serveSizeNote: "Calories shown per 100g serving",
    priceVerificationStatus: "needs_verification",
    verificationNote: "Pastry price \u20B985 has slight print glare in menu photo; Half KG \u20B9450 and 1 KG \u20B9900 extracted from print.",
    flavours: [
      { name: "Caf\xE9 Delight", calories: "301 Kcal" },
      { name: "Strawberry", calories: "285 Kcal" },
      { name: "Blueberry Bliss Delight", calories: "285 Kcal", isSignature: true },
      { name: "Mixed Berries", calories: "285 Kcal" },
      { name: "Creamy Chocolaty Delight", calories: "316 Kcal" },
      { name: "Chocolaty Globe", calories: "436 Kcal" },
      { name: "Dark Overload", calories: "417 Kcal" },
      { name: "Chocolaty Vanilla", calories: "316 Kcal" }
    ]
  },
  {
    id: "cake-exotic",
    name: "Exotic Cakes",
    slug: "exotic-cakes",
    description: "An expansive selection of fruit-infused, caramel, and intense dark chocolate cakes.",
    image: IMAGES.signatureCakes,
    halfKgPrice: 500,
    oneKgPrice: 1e3,
    pastryPrice: 95,
    pastrySizeLabel: "Pastry (100g)",
    serveSizeNote: "Calories shown per 100g serving",
    priceVerificationStatus: "verified",
    flavours: [
      { name: "Mango Tango Delight", calories: "284 Kcal" },
      { name: "White Forest", calories: "282 Kcal" },
      { name: "Cherry Mouse", calories: "321 Kcal" },
      { name: "Fruit Chocolate Flavour", calories: "426 Kcal" },
      { name: "Mango & Blueberry", calories: "284 Kcal" },
      { name: "Chocolaty Caramel Indulgence", calories: "298 Kcal" },
      { name: "Milk Chocolate Flavour", calories: "414 Kcal" },
      { name: "Fudgy Excess", calories: "436 Kcal" },
      { name: "Dark Chocolate Flavour", calories: "422 Kcal", isSignature: true },
      { name: "Dark Knight", calories: "436 Kcal" },
      { name: "Dark Fantasy", calories: "419 Kcal" },
      { name: "Chocolaty Strawberry", calories: "427 Kcal" },
      { name: "Caramel White Choco Flavour", calories: "311 Kcal" },
      { name: "Tiramisu", calories: "321 Kcal" },
      { name: "Fresh Fruit", calories: "273 Kcal", isSignature: true },
      { name: "Dark Mousse", calories: "316 Kcal", isSignature: true },
      { name: "Lychee" }
    ]
  },
  {
    id: "cake-premium-exotic",
    name: "Premium Exotic Cakes",
    slug: "premium-exotic-cakes",
    description: "Gourmet nut, Belgian-style triple chocolate, red velvet cream cheese, and iconic confections.",
    image: IMAGES.heroCake,
    halfKgPrice: 550,
    oneKgPrice: 1100,
    pastryPrice: 105,
    pastrySizeLabel: "Pastry (100g)",
    serveSizeNote: "Calories shown per 100g serving (or full cake where printed)",
    priceVerificationStatus: "needs_verification",
    verificationNote: "Half KG \u20B9550 is slightly low-contrast in print; 1 KG \u20B91100 and Pastry \u20B9105 are visible.",
    flavours: [
      { name: "Hazelnut Crunch", calories: "459 Kcal" },
      { name: "Chocolaty Chips", calories: "466 Kcal" },
      { name: "Triple Chocolate Flavour", calories: "466 Kcal", isSignature: true },
      { name: "Chocolaty Walnut Bliss", calories: "464 Kcal", isSignature: true },
      { name: "Chocolaty Bombs", calories: "422 Kcal" },
      { name: "Red Velvet Dark Fantasy", calories: "422 Kcal" },
      { name: "R. V. Cream Cheese", calories: "303 Kcal", isSignature: true },
      { name: "R. V. Raspberry Choco Flavour", calories: "427 Kcal" },
      { name: "Raspberry Madness", calories: "282 Kcal" },
      { name: "Coconut Bliss", calories: "300 Kcal" },
      { name: "Chocolaty Excess", calories: "437 Kcal", isSignature: true },
      { name: "Roasted Almond", calories: "432 Kcal" },
      { name: "KitKat\xAE & Gems\xAE", calories: "539 Kcal" },
      { name: "Nutella\xAE Rocher", calories: "440 Kcal", isSignature: true },
      { name: "KitKat\xAE", calories: "457 Kcal" },
      { name: "Oreos", calories: "428 Kcal" },
      { name: "Cup Cake Drip", calories: "2184 Kcal" },
      { name: "Snickers\xAE", calories: "2297 Kcal" },
      { name: "Pinacolada", calories: "1429 Kcal" },
      { name: "Rainbow", calories: "1517 Kcal" },
      { name: "Cupid", calories: "2184 Kcal" },
      { name: "L'Opera", calories: "4416 Kcal" }
    ]
  },
  {
    id: "cake-supreme",
    name: "Supreme Cakes",
    slug: "supreme-cakes",
    description: "Showstopping patisserie centrepieces including Golden Drip, Lotus Biscoff, and Rose & Pistachio.",
    image: IMAGES.signatureCakes,
    halfKgPrice: 625,
    oneKgPrice: 1250,
    serveSizeNote: "Calories shown per 500g serving",
    priceVerificationStatus: "verified",
    flavours: [
      { name: "Flower Basket", calories: "1473 Kcal" },
      { name: "Exquisite Fruit", calories: "1366 Kcal" },
      { name: "Golden Drip", calories: "2098 Kcal" },
      { name: "Lotus Biscoff\xAE", calories: "1609 Kcal", isSignature: true },
      { name: "Rose & Pistachio", calories: "1591 Kcal" },
      { name: "Dark Drip Overload", calories: "2086 Kcal", isSignature: true }
    ]
  },
  {
    id: "cake-pie",
    name: "Pie Cakes",
    slug: "pie-cakes",
    description: "Rich pie-style baked cakes including Banoffee, seasonal Mango, and Chocolaty Caramel.",
    image: IMAGES.browniesDesserts,
    halfKgPrice: 650,
    oneKgPrice: 1280,
    serveSizeNote: "Calories shown per 500g serving",
    priceVerificationStatus: "needs_verification",
    verificationNote: "Pie Cakes Half KG (read as \u20B9650) and 1 KG (read as \u20B91280) have print glare on the menu card \u2014 confirm before billing.",
    flavours: [
      { name: "Banoffee", calories: "1790 Kcal" },
      { name: "Mango (seasonal)", calories: "1769 Kcal" },
      { name: "Dark Chocolate Flavour", calories: "2422 Kcal" },
      { name: "Chocolaty Caramel", calories: "2375 Kcal" }
    ]
  },
  {
    id: "cake-indian",
    name: "Indian Cakes",
    slug: "indian-cakes",
    description: "Celebratory fusion cakes inspired by beloved Indian mithai including Rasmalai, Motichoor, and Kaju Katli.",
    image: IMAGES.indianFusionCake,
    halfKgPrice: 670,
    oneKgPrice: 1320,
    serveSizeNote: "Calories shown per 500g serving",
    priceVerificationStatus: "verified",
    flavours: [
      { name: "Rasmalai", calories: "1506 Kcal" },
      { name: "Gulab Jamun Tart", calories: "1881 Kcal" },
      { name: "Motichoor", calories: "1898 Kcal", isSignature: true },
      { name: "Kaju Katli", calories: "1980 Kcal" },
      { name: "Gulkand", calories: "1299 Kcal" },
      { name: "Coconut Burfi Chocolaty Mousse", calories: "2010 Kcal" }
    ]
  },
  {
    id: "cake-ice-cream",
    name: "Ice Cream Cakes",
    slug: "ice-cream-cakes",
    description: "Chilled 500g serve ice cream cakes priced individually by flavour.",
    image: IMAGES.waffles,
    halfKgPrice: null,
    oneKgPrice: null,
    serveSizeNote: "Serve size: 500 gms \xB7 Per-flavour pricing",
    priceVerificationStatus: "verified",
    flavours: [
      { name: "Black Forest", calories: "1238 Kcal", price500g: 350 },
      { name: "Butterscotch", calories: "1343 Kcal", price500g: 350, isSignature: true },
      { name: "Chocolaty Chips", calories: "1555 Kcal", price500g: 400 },
      { name: "Mango", calories: "1257 Kcal", price500g: 400 },
      { name: "Red Velvet", calories: "1399 Kcal", price500g: 500 },
      { name: "American Nuts", calories: "933 Kcal", price500g: 500 }
    ]
  },
  {
    id: "cake-no-bake-cheesecake",
    name: "No-Bake Cheesecakes",
    slug: "no-bake-cheesecakes",
    description: "Silky chilled cheesecakes available in Half KG, 1 KG, and 120g pastry slices.",
    image: IMAGES.cheesecakes,
    halfKgPrice: 585,
    oneKgPrice: 1170,
    pastryPrice: 95,
    pastrySizeLabel: "Pastry (120g)",
    serveSizeNote: "Calories shown per 120g serving (Note: caf\xE9 slice menu lists \u20B9135)",
    priceVerificationStatus: "needs_verification",
    verificationNote: "Cake menu Half KG (read as \u20B9585) and Pastry 120g (read as \u20B995) have glare on print; 1 KG \u20B91170 is clear.",
    flavours: [
      { name: "Original New York", calories: "203 Kcal" },
      { name: "Hazelnut", calories: "165 Kcal" },
      { name: "Cookies & Cream", calories: "285 Kcal", isSignature: true },
      { name: "Blueberry Bliss Delight", calories: "174 Kcal" },
      { name: "Strawberry", calories: "174 Kcal" },
      { name: "Lotus Biscoff\xAE", calories: "167 Kcal" },
      { name: "Mango Symphony", calories: "174 Kcal" }
    ]
  },
  {
    id: "cake-baked-cheesecake",
    name: "Baked Cheesecakes",
    slug: "baked-cheesecakes",
    description: "Rich oven-baked cheesecakes with individual pastry slice prices and serving weights.",
    image: IMAGES.cheesecakes,
    halfKgPrice: 750,
    oneKgPrice: 1450,
    serveSizeNote: "Half KG \u20B9750 \xB7 1 KG \u20B91450 \xB7 Individual pastry prices shown per flavour",
    priceVerificationStatus: "verified",
    flavours: [
      { name: "Triple Chocolate Flavour", calories: "440 Kcal", pastryPrice: 155, serveSizeGrams: 144 },
      { name: "Lotus Biscoff\xAE", calories: "439 Kcal", pastryPrice: 195, serveSizeGrams: 109 },
      { name: "Nutella\xAE", calories: "435 Kcal", pastryPrice: 165, serveSizeGrams: 108 },
      { name: "Dark Chocolate Flavour", calories: "443 Kcal", pastryPrice: 155, serveSizeGrams: 114 },
      { name: "Sea Salt Caramel", calories: "421 Kcal", pastryPrice: 155, serveSizeGrams: 113 },
      { name: "Blueberry", calories: "402 Kcal", pastryPrice: 170, serveSizeGrams: 114 },
      { name: "Strawberry Blossom", calories: "402 Kcal", pastryPrice: 165, serveSizeGrams: 114 }
    ]
  },
  {
    id: "cake-photo",
    name: "Photo Cake",
    slug: "photo-cake",
    description: "We print the photograph of your choice on an edible paper with edible ink and place it on the cake you prefer. This is the best cake to cherish special memories and moments.",
    image: IMAGES.signatureCakes,
    halfKgPrice: 655,
    oneKgPrice: 1250,
    priceVerificationStatus: "needs_verification",
    verificationNote: "Half KG price (read as \u20B9655) is softly printed on the cake card; 1 KG \u20B91250 is clearly visible.",
    flavours: [
      { name: "Custom Edible Print on Preferred Base Flavour" }
    ],
    isCustomCategory: true
  },
  {
    id: "cake-shape",
    name: "Shape Cake",
    slug: "shape-cake",
    description: "We create unique cakes of different shapes made using cream frosting. Cake shaped like a car or a doll? We have you covered!",
    image: IMAGES.customFondantCake,
    halfKgPrice: null,
    oneKgPrice: null,
    perKgPrice: 1400,
    priceVerificationStatus: "verified",
    flavours: [
      { name: "Car, Doll & Custom Cream-Frosted Shapes" }
    ],
    isCustomCategory: true
  },
  {
    id: "cake-3d-customised",
    name: "3D Customised Cake",
    slug: "3d-customised-cake",
    description: "We design cakes as per your desire using fondant. Get a specialized multi-tiered wedding cake or a detailed handbag cake, the sky's the limit!",
    image: IMAGES.customFondantCake,
    halfKgPrice: null,
    oneKgPrice: null,
    perKgPrice: 1750,
    priceVerificationStatus: "verified",
    flavours: [
      { name: "Multi-Tiered Wedding Cakes" },
      { name: "Sculpted Fondant Theme Cakes" }
    ],
    isCustomCategory: true
  }
];
var SEED_GALLERY = [
  {
    id: "gal-kurnool-1",
    title: "7th Heaven Bakery & Cafe Storefront",
    category: "Caf\xE9 Experience",
    image: "/assets/gallery/kurnool_store_0.jpg",
    caption: "40/337, Gandhi Nagar, Kurnool \xB7 Storefront exterior",
    isAuthenticBusinessPhoto: true
  },
  {
    id: "gal-kurnool-2",
    title: "Patisserie Counter & Display Lounge",
    category: "Caf\xE9 Experience",
    image: "/assets/gallery/kurnool_store_4.jpg",
    caption: "Inside 7th Heaven Bakery & Cafe, Gandhi Nagar, Kurnool",
    isAuthenticBusinessPhoto: true
  },
  {
    id: "gal-kurnool-3",
    title: "Dine-In Seating & Warm Ambience",
    category: "Caf\xE9 Experience",
    image: "/assets/gallery/kurnool_store_7.jpg",
    caption: "Caf\xE9 seating area at our Gandhi Nagar outlet",
    isAuthenticBusinessPhoto: true
  },
  {
    id: "gal-kurnool-4",
    title: "Illuminated Cake & Jar Dessert Showcase",
    category: "Signature Cakes",
    image: "/assets/gallery/kurnool_store_8.jpg",
    caption: "Chilled glass counter featuring celebration cakes and glass desserts",
    isAuthenticBusinessPhoto: true
  },
  {
    id: "gal-kurnool-5",
    title: "Celebration Cakes Display Counter",
    category: "Signature Cakes",
    image: "/assets/gallery/kurnool_store_1.jpg",
    caption: "Freshly displayed butterscotch, chocolate, and fruit celebration cakes",
    isAuthenticBusinessPhoto: true
  },
  {
    id: "gal-kurnool-6",
    title: "Dark Chocolate Rose Celebration Cake",
    category: "Signature Cakes",
    image: "/assets/gallery/real_kurnool_1.jpg",
    caption: "Handcrafted chocolate cake with piped dark chocolate roses",
    isAuthenticBusinessPhoto: true
  },
  {
    id: "gal-kurnool-7",
    title: "Chocolate Truffle & Exotic Cake Selection",
    category: "Signature Cakes",
    image: "/assets/gallery/kurnool_store_11.jpg",
    caption: "Assorted truffle, white forest, and exotic cakes in our display",
    isAuthenticBusinessPhoto: true
  },
  {
    id: "gal-kurnool-8",
    title: "Classic Pineapple & Butterscotch Cake",
    category: "Signature Cakes",
    image: "/assets/gallery/kurnool_store_5.jpg",
    caption: "Glazed yellow celebration cake finished with dark chocolate curls",
    isAuthenticBusinessPhoto: true
  },
  {
    id: "gal-kurnool-9",
    title: "Signature Cookie Dough Chocolate Pizza",
    category: "Desserts",
    image: "/assets/gallery/kurnool_store_3.jpg",
    caption: "Topped with chocolate chips, almonds, gems, and crisp wafer pieces",
    isAuthenticBusinessPhoto: true
  },
  {
    id: "gal-kurnool-10",
    title: "Brownies, Donuts, Cupcakes & Loaf Breads",
    category: "Brownies",
    image: "/assets/gallery/kurnool_store_12.jpg",
    caption: "Freshly stocked counter of brownies, donuts, cupcakes, and breads",
    isAuthenticBusinessPhoto: true
  },
  {
    id: "gal-kurnool-11",
    title: "Festive Cashew & Dry Fruit Cake",
    category: "Desserts",
    image: "/assets/gallery/kurnool_store_13.jpg",
    caption: "Rich plum and cashew dry-fruit cake from 7th Heaven Kurnool",
    isAuthenticBusinessPhoto: true
  }
];
var INITIAL_STORE_DATA = {
  settings: DEFAULT_SETTINGS,
  menuItems: SEED_MENU_ITEMS,
  cakeCollections: SEED_CAKE_COLLECTIONS,
  gallery: SEED_GALLERY,
  enquiries: [],
  orders: [],
  contacts: []
};

// server/store.ts
var DATA_DIR = process.env.DATA_DIR?.trim() ? path.resolve(process.env.DATA_DIR.trim()) : path.resolve(process.cwd(), "server", "data");
var STORE_PATH = path.join(DATA_DIR, "store.json");
var UPLOADS_DIR = process.env.UPLOADS_DIR?.trim() ? path.resolve(process.env.UPLOADS_DIR.trim()) : process.env.DATA_DIR?.trim() ? path.join(DATA_DIR, "uploads") : path.resolve(process.cwd(), "server", "uploads");
var DATABASE_URL = process.env.DATABASE_URL?.trim() || "";
var pool = null;
var jsonLock = Promise.resolve();
function getSslConfig(connectionString) {
  const flag = process.env.DATABASE_SSL?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  if (flag === "true" || flag === "1") return { rejectUnauthorized: false };
  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  return isLocal ? false : { rejectUnauthorized: false };
}
function getStorageMode() {
  return DATABASE_URL ? "postgres" : "json";
}
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: getSslConfig(DATABASE_URL),
      max: 10,
      idleTimeoutMillis: 3e4
    });
  }
  return pool;
}
function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}
function normalizeStore(parsed) {
  return {
    settings: parsed.settings ? { ...structuredClone(INITIAL_STORE_DATA.settings), ...parsed.settings } : structuredClone(INITIAL_STORE_DATA.settings),
    menuItems: Array.isArray(parsed.menuItems) ? parsed.menuItems : structuredClone(INITIAL_STORE_DATA.menuItems),
    cakeCollections: Array.isArray(parsed.cakeCollections) ? parsed.cakeCollections : structuredClone(INITIAL_STORE_DATA.cakeCollections),
    gallery: Array.isArray(parsed.gallery) ? parsed.gallery : structuredClone(INITIAL_STORE_DATA.gallery),
    enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
    orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
    adminCredential: parsed.adminCredential,
    sessionSecret: parsed.sessionSecret
  };
}
function readJsonStoreSync() {
  ensureDirs();
  if (!fs.existsSync(STORE_PATH)) {
    const initial = normalizeStore({
      ...structuredClone(INITIAL_STORE_DATA),
      sessionSecret: crypto.randomBytes(32).toString("hex")
    });
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), "utf8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    const fallback = normalizeStore(structuredClone(INITIAL_STORE_DATA));
    fs.writeFileSync(STORE_PATH, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}
function writeJsonStoreSync(nextStore) {
  ensureDirs();
  const tempPath = `${STORE_PATH}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(nextStore, null, 2), "utf8");
  fs.renameSync(tempPath, STORE_PATH);
}
function withJsonLock(fn) {
  const next = jsonLock.then(() => {
    const current = readJsonStoreSync();
    const { store: updated, result } = fn(current);
    if (updated) {
      writeJsonStoreSync(updated);
    }
    return result;
  });
  jsonLock = next.catch(() => void 0);
  return next;
}
function mapSettingsRow(row) {
  return {
    brandName: String(row.brand_name),
    tagline: String(row.tagline),
    positioning: String(row.positioning),
    phone: String(row.phone),
    whatsappNumber: String(row.whatsapp_number),
    instagramHandle: String(row.instagram_handle),
    instagramUrl: String(row.instagram_url),
    addressLine1: String(row.address_line1),
    addressLine2: String(row.address_line2 ?? ""),
    city: String(row.city),
    state: String(row.state),
    postalCode: String(row.postal_code),
    country: String(row.country),
    hours: String(row.hours),
    heroHeadline: String(row.hero_headline),
    heroSubheadline: String(row.hero_subheadline),
    promoBanner: String(row.promo_banner)
  };
}
function mapMenuRow(row) {
  return {
    id: String(row.id),
    name: String(row.name),
    section: row.section,
    category: String(row.category),
    price: row.price !== null && row.price !== void 0 ? Number(row.price) : void 0,
    variants: Array.isArray(row.variants) ? row.variants : void 0,
    unitNote: row.unit_note ? String(row.unit_note) : void 0,
    isVeg: Boolean(row.is_veg),
    available: Boolean(row.available),
    image: row.image ? String(row.image) : void 0,
    description: row.description ? String(row.description) : void 0
  };
}
function mapCakeRow(row) {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description),
    image: String(row.image),
    halfKgPrice: row.half_kg_price !== null && row.half_kg_price !== void 0 ? Number(row.half_kg_price) : null,
    oneKgPrice: row.one_kg_price !== null && row.one_kg_price !== void 0 ? Number(row.one_kg_price) : null,
    pastryPrice: row.pastry_price !== null && row.pastry_price !== void 0 ? Number(row.pastry_price) : null,
    pastrySizeLabel: row.pastry_size_label ? String(row.pastry_size_label) : void 0,
    perKgPrice: row.per_kg_price !== null && row.per_kg_price !== void 0 ? Number(row.per_kg_price) : null,
    serveSizeNote: row.serve_size_note ? String(row.serve_size_note) : void 0,
    priceVerificationStatus: row.price_verification_status,
    verificationNote: row.verification_note ? String(row.verification_note) : void 0,
    flavours: Array.isArray(row.flavours) ? row.flavours : [],
    isCustomCategory: Boolean(row.is_custom_category)
  };
}
function mapGalleryRow(row) {
  return {
    id: String(row.id),
    title: String(row.title),
    category: row.category,
    image: String(row.image),
    caption: String(row.caption),
    isAuthenticBusinessPhoto: Boolean(row.is_authentic_business_photo)
  };
}
function mapEnquiryRow(row) {
  return {
    id: String(row.id),
    customerName: String(row.customer_name),
    mobileNumber: String(row.mobile_number),
    cakeCategory: String(row.cake_category),
    preferredFlavour: String(row.preferred_flavour),
    cakeWeight: String(row.cake_weight),
    shapeOrDesign: String(row.shape_or_design),
    requiredDate: String(row.required_date),
    referenceImageUrl: row.reference_image_url ? String(row.reference_image_url) : void 0,
    instructions: row.instructions ? String(row.instructions) : void 0,
    status: row.status,
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}
function mapOrderRow(row) {
  return {
    id: String(row.id),
    customerName: String(row.customer_name),
    mobileNumber: String(row.mobile_number),
    fulfillment: row.fulfillment,
    items: Array.isArray(row.items) ? row.items : [],
    estimatedSubtotal: Number(row.estimated_subtotal),
    notes: row.notes ? String(row.notes) : void 0,
    status: row.status,
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}
function mapContactRow(row) {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : void 0,
    subject: String(row.subject),
    message: String(row.message),
    status: row.status,
    createdAt: new Date(String(row.created_at)).toISOString()
  };
}
async function initStorage() {
  if (getStorageMode() === "json") {
    const store = readJsonStoreSync();
    if (!store.sessionSecret) {
      store.sessionSecret = crypto.randomBytes(32).toString("hex");
      writeJsonStoreSync(store);
    }
    return;
  }
  const db = getPool();
  const schemaPath = path.resolve(process.cwd(), "database", "schema.sql");
  const ddl = fs.readFileSync(schemaPath, "utf8");
  await db.query(ddl);
  await db.query(`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;`);
  await db.query(`ALTER TABLE cake_collections ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;`);
  await db.query(`ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;`);
  await db.query(`ALTER TABLE cake_enquiries ALTER COLUMN required_date TYPE TEXT USING required_date::TEXT;`);
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const settingsCount = await client.query(
      "SELECT COUNT(*)::text AS count FROM site_settings"
    );
    if (Number(settingsCount.rows[0]?.count ?? 0) === 0) {
      const s = INITIAL_STORE_DATA.settings;
      await client.query(
        `INSERT INTO site_settings (
          id, brand_name, tagline, positioning, phone, whatsapp_number,
          instagram_handle, instagram_url, address_line1, address_line2,
          city, state, postal_code, country, hours,
          hero_headline, hero_subheadline, promo_banner
        ) VALUES (1, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
        [
          s.brandName,
          s.tagline,
          s.positioning,
          s.phone,
          s.whatsappNumber,
          s.instagramHandle,
          s.instagramUrl,
          s.addressLine1,
          s.addressLine2,
          s.city,
          s.state,
          s.postalCode,
          s.country,
          s.hours,
          s.heroHeadline,
          s.heroSubheadline,
          s.promoBanner
        ]
      );
    }
    const menuCount = await client.query(
      "SELECT COUNT(*)::text AS count FROM menu_items"
    );
    if (Number(menuCount.rows[0]?.count ?? 0) === 0) {
      for (let i = 0; i < INITIAL_STORE_DATA.menuItems.length; i++) {
        const m = INITIAL_STORE_DATA.menuItems[i];
        await client.query(
          `INSERT INTO menu_items (
            id, name, section, category, price, variants, unit_note,
            is_veg, available, image, description, sort_order
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            m.id,
            m.name,
            m.section,
            m.category,
            m.price ?? null,
            m.variants ? JSON.stringify(m.variants) : null,
            m.unitNote ?? null,
            m.isVeg,
            m.available,
            m.image ?? null,
            m.description ?? null,
            i
          ]
        );
      }
    }
    const cakeCount = await client.query(
      "SELECT COUNT(*)::text AS count FROM cake_collections"
    );
    if (Number(cakeCount.rows[0]?.count ?? 0) === 0) {
      for (let i = 0; i < INITIAL_STORE_DATA.cakeCollections.length; i++) {
        const c = INITIAL_STORE_DATA.cakeCollections[i];
        await client.query(
          `INSERT INTO cake_collections (
            id, name, slug, description, image, half_kg_price, one_kg_price,
            pastry_price, pastry_size_label, per_kg_price, serve_size_note,
            price_verification_status, verification_note, flavours, is_custom_category, sort_order
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
          [
            c.id,
            c.name,
            c.slug,
            c.description,
            c.image,
            c.halfKgPrice ?? null,
            c.oneKgPrice ?? null,
            c.pastryPrice ?? null,
            c.pastrySizeLabel ?? null,
            c.perKgPrice ?? null,
            c.serveSizeNote ?? null,
            c.priceVerificationStatus,
            c.verificationNote ?? null,
            JSON.stringify(c.flavours),
            Boolean(c.isCustomCategory),
            i
          ]
        );
      }
    }
    const galCount = await client.query(
      "SELECT COUNT(*)::text AS count FROM gallery_items"
    );
    if (Number(galCount.rows[0]?.count ?? 0) === 0) {
      for (let i = 0; i < INITIAL_STORE_DATA.gallery.length; i++) {
        const g = INITIAL_STORE_DATA.gallery[i];
        await client.query(
          `INSERT INTO gallery_items (
            id, title, category, image, caption, is_authentic_business_photo, sort_order
          ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [g.id, g.title, g.category, g.image, g.caption, g.isAuthenticBusinessPhoto, i]
        );
      }
    }
    const secretRow = await client.query(
      "SELECT value FROM app_secrets WHERE key = 'session_secret'"
    );
    if (secretRow.rowCount === 0) {
      await client.query(
        "INSERT INTO app_secrets (key, value) VALUES ('session_secret', $1)",
        [crypto.randomBytes(32).toString("hex")]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
async function checkStorageHealth() {
  if (getStorageMode() === "json") {
    ensureDirs();
    return fs.existsSync(STORE_PATH);
  }
  try {
    await getPool().query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
async function getSessionSecretFromStore() {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      if (!store.sessionSecret) {
        const secret2 = crypto.randomBytes(32).toString("hex");
        return { store: { ...store, sessionSecret: secret2 }, result: secret2 };
      }
      return { result: store.sessionSecret };
    });
  }
  const res = await getPool().query(
    "SELECT value FROM app_secrets WHERE key = 'session_secret'"
  );
  if (res.rows[0]?.value) return res.rows[0].value;
  const secret = crypto.randomBytes(32).toString("hex");
  await getPool().query(
    "INSERT INTO app_secrets (key, value) VALUES ('session_secret', $1) ON CONFLICT (key) DO NOTHING",
    [secret]
  );
  return secret;
}
async function getAdminCredential() {
  if (getStorageMode() === "json") {
    const store = readJsonStoreSync();
    return store.adminCredential ?? null;
  }
  const res = await getPool().query("SELECT password_hash, salt, claimed_at FROM admin_credentials WHERE id = 1");
  if (res.rowCount === 0) return null;
  const row = res.rows[0];
  return {
    hash: row.password_hash,
    salt: row.salt,
    claimedAt: new Date(row.claimed_at).toISOString()
  };
}
async function saveAdminCredential(cred) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      if (store.adminCredential?.hash) {
        return { result: false };
      }
      return { store: { ...store, adminCredential: cred }, result: true };
    });
  }
  const res = await getPool().query(
    `INSERT INTO admin_credentials (id, password_hash, salt, claimed_at)
     VALUES (1, $1, $2, $3)
     ON CONFLICT (id) DO NOTHING`,
    [cred.hash, cred.salt, cred.claimedAt]
  );
  return (res.rowCount ?? 0) > 0;
}
async function getPublicStore() {
  if (getStorageMode() === "json") {
    const store = readJsonStoreSync();
    return {
      settings: store.settings,
      menuItems: store.menuItems,
      cakeCollections: store.cakeCollections,
      gallery: store.gallery
    };
  }
  const db = getPool();
  const [settingsRes, menuRes, cakesRes, galleryRes] = await Promise.all([
    db.query("SELECT * FROM site_settings WHERE id = 1"),
    db.query("SELECT * FROM menu_items ORDER BY sort_order ASC, created_at DESC"),
    db.query("SELECT * FROM cake_collections ORDER BY sort_order ASC"),
    db.query("SELECT * FROM gallery_items ORDER BY sort_order ASC, created_at DESC")
  ]);
  return {
    settings: settingsRes.rows[0] ? mapSettingsRow(settingsRes.rows[0]) : structuredClone(INITIAL_STORE_DATA.settings),
    menuItems: menuRes.rows.map(mapMenuRow),
    cakeCollections: cakesRes.rows.map(mapCakeRow),
    gallery: galleryRes.rows.map(mapGalleryRow)
  };
}
async function getAdminDashboardData() {
  if (getStorageMode() === "json") {
    const store = readJsonStoreSync();
    return {
      settings: store.settings,
      menuItems: store.menuItems,
      cakeCollections: store.cakeCollections,
      gallery: store.gallery,
      enquiries: store.enquiries,
      orders: store.orders,
      contacts: store.contacts
    };
  }
  const db = getPool();
  const [pub, enqRes, ordRes, conRes] = await Promise.all([
    getPublicStore(),
    db.query("SELECT * FROM cake_enquiries ORDER BY created_at DESC"),
    db.query("SELECT * FROM order_requests ORDER BY created_at DESC"),
    db.query("SELECT * FROM contact_messages ORDER BY created_at DESC")
  ]);
  return {
    ...pub,
    enquiries: enqRes.rows.map(mapEnquiryRow),
    orders: ordRes.rows.map(mapOrderRow),
    contacts: conRes.rows.map(mapContactRow)
  };
}
async function addMenuItem(item) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      store.menuItems.unshift(item);
      return { store, result: item };
    });
  }
  const res = await getPool().query(
    `INSERT INTO menu_items (
      id, name, section, category, price, variants, unit_note,
      is_veg, available, image, description, sort_order
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,-1)
    RETURNING *`,
    [
      item.id,
      item.name,
      item.section,
      item.category,
      item.price ?? null,
      item.variants ? JSON.stringify(item.variants) : null,
      item.unitNote ?? null,
      item.isVeg,
      item.available,
      item.image ?? null,
      item.description ?? null
    ]
  );
  return mapMenuRow(res.rows[0]);
}
async function updateMenuItem(id, patch) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      const idx = store.menuItems.findIndex((m) => m.id === id);
      if (idx === -1) return { result: null };
      store.menuItems[idx] = { ...store.menuItems[idx], ...patch };
      return { store, result: store.menuItems[idx] };
    });
  }
  const existingRes = await getPool().query("SELECT * FROM menu_items WHERE id = $1", [id]);
  if (existingRes.rowCount === 0) return null;
  const current = mapMenuRow(existingRes.rows[0]);
  const merged = { ...current, ...patch, id };
  const res = await getPool().query(
    `UPDATE menu_items SET
      name = $2,
      section = $3,
      category = $4,
      price = $5,
      variants = $6,
      unit_note = $7,
      is_veg = $8,
      available = $9,
      image = $10,
      description = $11,
      updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      merged.name,
      merged.section,
      merged.category,
      merged.price ?? null,
      merged.variants ? JSON.stringify(merged.variants) : null,
      merged.unitNote ?? null,
      merged.isVeg,
      merged.available,
      merged.image ?? null,
      merged.description ?? null
    ]
  );
  return mapMenuRow(res.rows[0]);
}
async function deleteMenuItem(id) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      const before = store.menuItems.length;
      store.menuItems = store.menuItems.filter((m) => m.id !== id);
      return store.menuItems.length < before ? { store, result: true } : { result: false };
    });
  }
  const res = await getPool().query("DELETE FROM menu_items WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}
async function renameMenuCategory(section, fromCategory, toCategory) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      let count = 0;
      store.menuItems = store.menuItems.map((item) => {
        if (item.section === section && item.category === fromCategory) {
          count++;
          return { ...item, category: toCategory };
        }
        return item;
      });
      return count > 0 ? { store, result: count } : { result: 0 };
    });
  }
  const res = await getPool().query(
    `UPDATE menu_items SET category = $3, updated_at = NOW()
     WHERE section = $1 AND category = $2`,
    [section, fromCategory, toCategory]
  );
  return res.rowCount ?? 0;
}
async function updateCakeCollection(id, patch) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      const idx = store.cakeCollections.findIndex((c) => c.id === id);
      if (idx === -1) return { result: null };
      store.cakeCollections[idx] = { ...store.cakeCollections[idx], ...patch };
      return { store, result: store.cakeCollections[idx] };
    });
  }
  const existingRes = await getPool().query("SELECT * FROM cake_collections WHERE id = $1", [id]);
  if (existingRes.rowCount === 0) return null;
  const current = mapCakeRow(existingRes.rows[0]);
  const merged = { ...current, ...patch, id };
  const res = await getPool().query(
    `UPDATE cake_collections SET
      description = $2,
      image = $3,
      half_kg_price = $4,
      one_kg_price = $5,
      pastry_price = $6,
      per_kg_price = $7,
      price_verification_status = $8,
      verification_note = $9,
      flavours = $10,
      updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      merged.description,
      merged.image,
      merged.halfKgPrice ?? null,
      merged.oneKgPrice ?? null,
      merged.pastryPrice ?? null,
      merged.perKgPrice ?? null,
      merged.priceVerificationStatus,
      merged.verificationNote ?? null,
      JSON.stringify(merged.flavours)
    ]
  );
  return mapCakeRow(res.rows[0]);
}
async function addEnquiry(enquiry) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      store.enquiries.unshift(enquiry);
      return { store, result: enquiry };
    });
  }
  const res = await getPool().query(
    `INSERT INTO cake_enquiries (
      id, customer_name, mobile_number, cake_category, preferred_flavour,
      cake_weight, shape_or_design, required_date, reference_image_url, instructions, status, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING *`,
    [
      enquiry.id,
      enquiry.customerName,
      enquiry.mobileNumber,
      enquiry.cakeCategory,
      enquiry.preferredFlavour,
      enquiry.cakeWeight,
      enquiry.shapeOrDesign,
      enquiry.requiredDate,
      enquiry.referenceImageUrl ?? null,
      enquiry.instructions ?? null,
      enquiry.status,
      enquiry.createdAt
    ]
  );
  return mapEnquiryRow(res.rows[0]);
}
async function updateEnquiryStatus(id, status) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      const idx = store.enquiries.findIndex((e) => e.id === id);
      if (idx === -1) return { result: null };
      store.enquiries[idx].status = status;
      return { store, result: store.enquiries[idx] };
    });
  }
  const res = await getPool().query(
    "UPDATE cake_enquiries SET status = $2 WHERE id = $1 RETURNING *",
    [id, status]
  );
  return res.rowCount ? mapEnquiryRow(res.rows[0]) : null;
}
async function addOrder(order) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      store.orders.unshift(order);
      return { store, result: order };
    });
  }
  const res = await getPool().query(
    `INSERT INTO order_requests (
      id, customer_name, mobile_number, fulfillment, items,
      estimated_subtotal, notes, status, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [
      order.id,
      order.customerName,
      order.mobileNumber,
      order.fulfillment,
      JSON.stringify(order.items),
      order.estimatedSubtotal,
      order.notes ?? null,
      order.status,
      order.createdAt
    ]
  );
  return mapOrderRow(res.rows[0]);
}
async function updateOrderStatus(id, status) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      const idx = store.orders.findIndex((o) => o.id === id);
      if (idx === -1) return { result: null };
      store.orders[idx].status = status;
      return { store, result: store.orders[idx] };
    });
  }
  const res = await getPool().query(
    "UPDATE order_requests SET status = $2 WHERE id = $1 RETURNING *",
    [id, status]
  );
  return res.rowCount ? mapOrderRow(res.rows[0]) : null;
}
async function addContactMessage(msg) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      store.contacts.unshift(msg);
      return { store, result: msg };
    });
  }
  const res = await getPool().query(
    `INSERT INTO contact_messages (
      id, name, phone, email, subject, message, status, created_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      msg.id,
      msg.name,
      msg.phone,
      msg.email ?? null,
      msg.subject,
      msg.message,
      msg.status,
      msg.createdAt
    ]
  );
  return mapContactRow(res.rows[0]);
}
async function updateContactStatus(id, status) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      const idx = store.contacts.findIndex((c) => c.id === id);
      if (idx === -1) return { result: null };
      store.contacts[idx].status = status;
      return { store, result: store.contacts[idx] };
    });
  }
  const res = await getPool().query(
    "UPDATE contact_messages SET status = $2 WHERE id = $1 RETURNING *",
    [id, status]
  );
  return res.rowCount ? mapContactRow(res.rows[0]) : null;
}
async function addGalleryItem(item) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      store.gallery.unshift(item);
      return { store, result: item };
    });
  }
  const res = await getPool().query(
    `INSERT INTO gallery_items (
      id, title, category, image, caption, is_authentic_business_photo, sort_order
    ) VALUES ($1,$2,$3,$4,$5,$6,-1)
    RETURNING *`,
    [item.id, item.title, item.category, item.image, item.caption, item.isAuthenticBusinessPhoto]
  );
  return mapGalleryRow(res.rows[0]);
}
async function deleteGalleryItem(id) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      const before = store.gallery.length;
      store.gallery = store.gallery.filter((g) => g.id !== id);
      return store.gallery.length < before ? { store, result: true } : { result: false };
    });
  }
  const res = await getPool().query("DELETE FROM gallery_items WHERE id = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}
async function updateSettings(nextSettings) {
  if (getStorageMode() === "json") {
    return withJsonLock((store) => {
      store.settings = nextSettings;
      return { store, result: store.settings };
    });
  }
  const res = await getPool().query(
    `UPDATE site_settings SET
      brand_name = $1,
      tagline = $2,
      positioning = $3,
      phone = $4,
      whatsapp_number = $5,
      instagram_handle = $6,
      instagram_url = $7,
      address_line1 = $8,
      address_line2 = $9,
      city = $10,
      state = $11,
      postal_code = $12,
      country = $13,
      hours = $14,
      hero_headline = $15,
      hero_subheadline = $16,
      promo_banner = $17,
      updated_at = NOW()
     WHERE id = 1
     RETURNING *`,
    [
      nextSettings.brandName,
      nextSettings.tagline,
      nextSettings.positioning,
      nextSettings.phone,
      nextSettings.whatsappNumber,
      nextSettings.instagramHandle,
      nextSettings.instagramUrl,
      nextSettings.addressLine1,
      nextSettings.addressLine2,
      nextSettings.city,
      nextSettings.state,
      nextSettings.postalCode,
      nextSettings.country,
      nextSettings.hours,
      nextSettings.heroHeadline,
      nextSettings.heroSubheadline,
      nextSettings.promoBanner
    ]
  );
  return mapSettingsRow(res.rows[0]);
}
async function saveUploadedFile(filename, mimeType, buffer) {
  if (getStorageMode() === "json") {
    ensureDirs();
    const targetPath = path.resolve(UPLOADS_DIR, filename);
    if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
      throw new Error("Invalid upload destination.");
    }
    fs.writeFileSync(targetPath, buffer);
    return;
  }
  await getPool().query(
    `INSERT INTO uploaded_files (filename, mime_type, data)
     VALUES ($1, $2, $3)
     ON CONFLICT (filename) DO UPDATE SET mime_type = EXCLUDED.mime_type, data = EXCLUDED.data`,
    [filename, mimeType, buffer]
  );
}
async function readUploadedFile(filename) {
  if (getStorageMode() === "json") {
    ensureDirs();
    const resolved = path.resolve(UPLOADS_DIR, filename);
    if (!resolved.startsWith(UPLOADS_DIR + path.sep) || !fs.existsSync(resolved)) {
      return null;
    }
    const ext = path.extname(filename).toLowerCase();
    const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return { mimeType, filePath: resolved };
  }
  const res = await getPool().query(
    "SELECT mime_type, data FROM uploaded_files WHERE filename = $1",
    [filename]
  );
  if (res.rowCount === 0) return null;
  return { mimeType: res.rows[0].mime_type, buffer: res.rows[0].data };
}

// server/auth.ts
var ADMIN_COOKIE_NAME = "7h_admin_session";
var TOKEN_TTL_MS = 1e3 * 60 * 60 * 12;
var cachedSecret = null;
async function getSessionSecret() {
  const configured = process.env.SESSION_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return configured;
  }
  if (!cachedSecret) {
    cachedSecret = await getSessionSecretFromStore();
  }
  return cachedSecret;
}
function getEnvAdminPasscode() {
  const val = process.env.ADMIN_PASSCODE?.trim();
  return val && val.length > 0 ? val : null;
}
async function getAuthStatus(req) {
  const authenticated = req ? await isAdminAuthenticated(req) : false;
  if (getEnvAdminPasscode()) {
    return { configured: true, mode: "env_passcode", authenticated };
  }
  const cred = await getAdminCredential();
  if (cred?.hash && cred?.salt) {
    return { configured: true, mode: "claimed_password", authenticated };
  }
  return { configured: false, mode: "claim_required", authenticated };
}
function hashPasswordScrypt(password, salt) {
  return crypto2.scryptSync(password, salt, 64);
}
async function claimAdminPassword(password) {
  if (getEnvAdminPasscode()) {
    return {
      ok: false,
      error: "Admin passcode is already configured via environment secrets."
    };
  }
  const existing = await getAdminCredential();
  if (existing?.hash) {
    return { ok: false, error: "Admin access has already been claimed." };
  }
  const salt = crypto2.randomBytes(16).toString("hex");
  const hash = hashPasswordScrypt(password, salt).toString("hex");
  const saved = await saveAdminCredential({
    salt,
    hash,
    claimedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (!saved) {
    return { ok: false, error: "Admin access has already been claimed." };
  }
  return { ok: true };
}
async function verifyAdminPassword(password) {
  const envPass = getEnvAdminPasscode();
  if (envPass) {
    const a = crypto2.createHash("sha256").update(password).digest();
    const b = crypto2.createHash("sha256").update(envPass).digest();
    return crypto2.timingSafeEqual(a, b);
  }
  const cred = await getAdminCredential();
  if (!cred?.salt || !cred?.hash) {
    return false;
  }
  const derived = hashPasswordScrypt(password, cred.salt);
  const storedBuf = Buffer.from(cred.hash, "hex");
  if (derived.length !== storedBuf.length) {
    return false;
  }
  return crypto2.timingSafeEqual(derived, storedBuf);
}
async function createAdminToken() {
  const now = Date.now();
  const payload = {
    role: "admin",
    iat: now,
    exp: now + TOKEN_TTL_MS
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const secret = await getSessionSecret();
  const sig = crypto2.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${sig}`;
}
async function verifyAdminToken(token) {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return false;
  const secret = await getSessionSecret();
  const expectedSig = crypto2.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  const bufA = Buffer.from(providedSig, "utf8");
  const bufB = Buffer.from(expectedSig, "utf8");
  if (bufA.length !== bufB.length || !crypto2.timingSafeEqual(bufA, bufB)) {
    return false;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    );
    if (payload.role !== "admin") return false;
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}
function extractCookieToken(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    if (key === ADMIN_COOKIE_NAME) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}
function extractTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearer = authHeader.slice("Bearer ".length).trim();
    if (bearer) return bearer;
  }
  return extractCookieToken(req);
}
async function isAdminAuthenticated(req) {
  const token = extractTokenFromRequest(req);
  if (!token) return false;
  return verifyAdminToken(token);
}
function setAdminSessionCookie(req, res, token) {
  const isHttps = req.secure || String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim() === "https";
  res.cookie(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: TOKEN_TTL_MS
  });
}
function clearAdminSessionCookie(res) {
  res.clearCookie(ADMIN_COOKIE_NAME, { path: "/" });
}
async function requireAdmin(req, res, next) {
  try {
    const ok = await isAdminAuthenticated(req);
    if (!ok) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}

// server.ts
var PORT = Number(process.env.PORT) || 3e3;
var IS_PROD = process.env.NODE_ENV === "production" || process.argv.includes("--prod");
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
function createRateLimiter(windowMs, maxHits) {
  const hits = /* @__PURE__ */ new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || "unknown";
    const current = hits.get(key);
    if (!current || now > current.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (current.count >= maxHits) {
      const retrySec = Math.max(1, Math.ceil((current.resetAt - now) / 1e3));
      res.setHeader("Retry-After", String(retrySec));
      res.status(429).json({
        error: `Too many requests. Please try again in ${retrySec} seconds.`
      });
      return;
    }
    current.count += 1;
    next();
  };
}
function isSafeUrl(url) {
  if (!url) return true;
  if (url.startsWith("/")) return !url.startsWith("//");
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
var safeUrlSchema = z.string().trim().max(600).refine(isSafeUrl, {
  message: "Only safe relative paths or http/https URLs are permitted."
});
var menuVariantSchema = z.object({
  label: z.string().trim().min(1).max(40),
  price: z.number().int().min(1).max(1e5)
});
var menuItemCreateSchema = z.object({
  id: z.string().trim().min(1).max(120).optional(),
  name: z.string().trim().min(1).max(120),
  section: z.enum(["Savouries & Sips", "Sweet Side"]),
  category: z.string().trim().min(1).max(80),
  price: z.number().int().min(1).max(1e5).optional(),
  variants: z.array(menuVariantSchema).min(1).max(6).optional(),
  unitNote: z.string().trim().max(120).optional(),
  isVeg: z.boolean().default(true),
  available: z.boolean().default(true),
  image: safeUrlSchema.optional(),
  description: z.string().trim().max(400).optional()
}).refine((v) => typeof v.price === "number" || v.variants && v.variants.length > 0, {
  message: "Provide either a price or at least one size variant."
});
var menuItemUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  section: z.enum(["Savouries & Sips", "Sweet Side"]).optional(),
  category: z.string().trim().min(1).max(80).optional(),
  price: z.number().int().min(1).max(1e5).nullable().optional(),
  variants: z.array(menuVariantSchema).min(1).max(6).nullable().optional(),
  unitNote: z.string().trim().max(120).nullable().optional(),
  isVeg: z.boolean().optional(),
  available: z.boolean().optional(),
  image: safeUrlSchema.nullable().optional(),
  description: z.string().trim().max(400).nullable().optional()
});
var cakeFlavourSchema = z.object({
  name: z.string().trim().min(1).max(120),
  calories: z.string().trim().max(40).optional(),
  pastryPrice: z.number().int().min(1).max(5e4).optional(),
  serveSizeGrams: z.number().int().min(1).max(1e4).optional(),
  price500g: z.number().int().min(1).max(5e4).optional(),
  isSignature: z.boolean().optional()
});
var cakeCollectionUpdateSchema = z.object({
  description: z.string().trim().min(1).max(500).optional(),
  image: safeUrlSchema.optional(),
  halfKgPrice: z.number().int().min(1).max(1e5).nullable().optional(),
  oneKgPrice: z.number().int().min(1).max(1e5).nullable().optional(),
  pastryPrice: z.number().int().min(1).max(1e5).nullable().optional(),
  perKgPrice: z.number().int().min(1).max(1e5).nullable().optional(),
  priceVerificationStatus: z.enum(["verified", "needs_verification", "custom_quote"]).optional(),
  verificationNote: z.string().trim().max(300).optional(),
  flavours: z.array(cakeFlavourSchema).min(1).max(50).optional()
});
var galleryCreateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  category: z.enum([
    "Signature Cakes",
    "Cheesecakes",
    "Brownies",
    "Waffles",
    "Desserts",
    "Savouries",
    "Beverages",
    "Caf\xE9 Experience"
  ]),
  image: safeUrlSchema.refine((v) => v.length > 0, {
    message: "Image URL is required."
  }),
  caption: z.string().trim().min(1).max(200),
  isAuthenticBusinessPhoto: z.boolean().default(false)
});
var settingsSchema = z.object({
  brandName: z.string().trim().min(1).max(100),
  tagline: z.string().trim().min(1).max(120),
  positioning: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(8).max(20),
  whatsappNumber: z.string().trim().min(10).max(20),
  instagramHandle: z.string().trim().min(1).max(80),
  instagramUrl: safeUrlSchema,
  addressLine1: z.string().trim().min(1).max(150),
  addressLine2: z.string().trim().max(150),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  postalCode: z.string().trim().min(4).max(20),
  country: z.string().trim().min(1).max(80),
  hours: z.string().trim().min(1).max(80),
  heroHeadline: z.string().trim().min(1).max(160),
  heroSubheadline: z.string().trim().min(1).max(320),
  promoBanner: z.string().trim().min(1).max(220)
});
var cakeEnquirySchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name").max(100),
  mobileNumber: z.string().trim().regex(/^[0-9+\-\s]{10,15}$/, "Please enter a valid 10-digit mobile number"),
  cakeCategory: z.string().trim().min(1).max(100),
  preferredFlavour: z.string().trim().min(1).max(120),
  cakeWeight: z.string().trim().min(1).max(60),
  shapeOrDesign: z.string().trim().min(1).max(160),
  requiredDate: z.string().trim().min(4).max(30),
  referenceImageUrl: safeUrlSchema.optional(),
  instructions: z.string().trim().max(600).optional()
});
var orderCreateSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name").max(100),
  mobileNumber: z.string().trim().regex(/^[0-9+\-\s]{10,15}$/, "Please enter a valid 10-digit mobile number"),
  fulfillment: z.enum(["Store Pickup", "Local Delivery Enquiry"]),
  items: z.array(
    z.object({
      itemId: z.string().trim().min(1).max(120),
      variantLabel: z.string().trim().max(40).optional(),
      quantity: z.number().int().min(1).max(50)
    })
  ).min(1, "Your order bag is empty.").max(50),
  notes: z.string().trim().max(500).optional()
});
var contactCreateSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().regex(/^[0-9+\-\s]{10,15}$/, "Please enter a valid mobile number"),
  email: z.union([z.string().trim().email("Please enter a valid email address").max(120), z.literal("")]).optional(),
  subject: z.string().trim().min(2, "Please enter a subject").max(120),
  message: z.string().trim().min(10, "Please share a bit more detail (at least 10 characters).").max(1500)
});
var uploadImageSchema = z.object({
  dataUrl: z.string().min(30).max(72e5)
});
async function startServer() {
  await initStorage();
  const app = express();
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "8mb" }));
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  const authRateLimit = createRateLimiter(15 * 60 * 1e3, 25);
  const publicWriteRateLimit = createRateLimiter(10 * 60 * 1e3, 40);
  const healthHandler = asyncHandler(async (_req, res) => {
    const healthy = await checkStorageHealth();
    res.status(healthy ? 200 : 503).json({
      status: healthy ? "ok" : "degraded",
      storage: getStorageMode(),
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.get("/api/health", healthHandler);
  app.get("/healthz", healthHandler);
  app.get(
    "/uploads/:filename",
    asyncHandler(async (req, res) => {
      const rawName = path2.basename(String(req.params.filename || ""));
      if (!/^[a-zA-Z0-9._-]+$/.test(rawName)) {
        res.status(400).json({ error: "Invalid filename." });
        return;
      }
      const file = await readUploadedFile(rawName);
      if (!file) {
        res.status(404).json({ error: "File not found." });
        return;
      }
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("Cache-Control", "public, max-age=86400");
      if (file.filePath) {
        res.sendFile(file.filePath);
        return;
      }
      res.type(file.mimeType).send(file.buffer);
    })
  );
  app.get(
    "/api/bootstrap",
    asyncHandler(async (_req, res) => {
      const data = await getPublicStore();
      res.setHeader("Cache-Control", "no-store");
      res.json(data);
    })
  );
  app.post(
    "/api/enquiries/upload",
    publicWriteRateLimit,
    asyncHandler(async (req, res) => {
      const parsed = uploadImageSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid image payload." });
        return;
      }
      const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(
        parsed.data.dataUrl
      );
      if (!match) {
        res.status(400).json({ error: "Only JPEG, PNG, or WebP images are supported." });
        return;
      }
      const [, mime, b64] = match;
      const buffer = Buffer.from(b64, "base64");
      if (buffer.byteLength > 5 * 1024 * 1024) {
        res.status(400).json({ error: "Image must be smaller than 5 MB." });
        return;
      }
      const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
      const filename = `ref-${crypto3.randomUUID()}.${ext}`;
      await saveUploadedFile(filename, mime, buffer);
      res.status(201).json({ url: `/uploads/${filename}` });
    })
  );
  app.post(
    "/api/enquiries",
    publicWriteRateLimit,
    asyncHandler(async (req, res) => {
      const parsed = cakeEnquirySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || "Invalid enquiry details."
        });
        return;
      }
      const enquiry = {
        id: `ENQ-${Date.now().toString(36).toUpperCase()}`,
        ...parsed.data,
        status: "New",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const saved = await addEnquiry(enquiry);
      res.status(201).json({ enquiry: saved });
    })
  );
  app.post(
    "/api/orders",
    publicWriteRateLimit,
    asyncHandler(async (req, res) => {
      const parsed = orderCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || "Invalid order request."
        });
        return;
      }
      const pubStore = await getPublicStore();
      const menuMap = new Map(pubStore.menuItems.map((m) => [m.id, m]));
      const verifiedItems = [];
      let estimatedSubtotal = 0;
      for (const reqItem of parsed.data.items) {
        const menuEntry = menuMap.get(reqItem.itemId);
        if (!menuEntry) {
          res.status(400).json({
            error: "One or more items in your bag are no longer on the menu. Please refresh."
          });
          return;
        }
        if (!menuEntry.available) {
          res.status(409).json({
            error: `"${menuEntry.name}" is currently marked unavailable. Please remove it from your bag.`
          });
          return;
        }
        let unitPrice = menuEntry.price ?? 0;
        let variantLabel = reqItem.variantLabel;
        if (menuEntry.variants && menuEntry.variants.length > 0) {
          const matchedVariant = menuEntry.variants.find((v) => v.label === reqItem.variantLabel) ?? menuEntry.variants[0];
          unitPrice = matchedVariant.price;
          variantLabel = matchedVariant.label;
        }
        if (unitPrice <= 0) {
          res.status(400).json({
            error: `Unable to determine verified price for "${menuEntry.name}".`
          });
          return;
        }
        estimatedSubtotal += unitPrice * reqItem.quantity;
        verifiedItems.push({
          itemId: menuEntry.id,
          name: menuEntry.name,
          category: menuEntry.category,
          variantLabel,
          unitPrice,
          quantity: reqItem.quantity
        });
      }
      const order = {
        id: `ORD-${Date.now().toString(36).toUpperCase()}`,
        customerName: parsed.data.customerName,
        mobileNumber: parsed.data.mobileNumber,
        fulfillment: parsed.data.fulfillment,
        items: verifiedItems,
        estimatedSubtotal,
        notes: parsed.data.notes || void 0,
        status: "New",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const saved = await addOrder(order);
      res.status(201).json({ order: saved });
    })
  );
  app.post(
    "/api/contact",
    publicWriteRateLimit,
    asyncHandler(async (req, res) => {
      const parsed = contactCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || "Please check your contact form details."
        });
        return;
      }
      const msg = {
        id: `MSG-${Date.now().toString(36).toUpperCase()}`,
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || void 0,
        subject: parsed.data.subject,
        message: parsed.data.message,
        status: "New",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const saved = await addContactMessage(msg);
      res.status(201).json({ contact: saved });
    })
  );
  app.get(
    "/api/admin/auth-status",
    asyncHandler(async (req, res) => {
      const status = await getAuthStatus(req);
      res.json(status);
    })
  );
  app.post(
    "/api/admin/claim",
    authRateLimit,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        password: z.string().min(8, "Admin password must be at least 8 characters.").max(128)
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || "Invalid password."
        });
        return;
      }
      const result = await claimAdminPassword(parsed.data.password);
      if (!result.ok) {
        res.status(409).json({ error: result.error });
        return;
      }
      const token = await createAdminToken();
      setAdminSessionCookie(req, res, token);
      res.status(201).json({ ok: true, token });
    })
  );
  app.post(
    "/api/admin/login",
    authRateLimit,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        password: z.string().min(1).max(128)
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Password is required." });
        return;
      }
      const ok = await verifyAdminPassword(parsed.data.password);
      if (!ok) {
        res.status(401).json({ error: "Incorrect admin passcode." });
        return;
      }
      const token = await createAdminToken();
      setAdminSessionCookie(req, res, token);
      res.json({ ok: true, token });
    })
  );
  app.post("/api/admin/logout", (_req, res) => {
    clearAdminSessionCookie(res);
    res.json({ ok: true });
  });
  app.get(
    "/api/admin/dashboard",
    requireAdmin,
    asyncHandler(async (_req, res) => {
      const data = await getAdminDashboardData();
      res.json({
        ...data,
        storageMode: getStorageMode()
      });
    })
  );
  app.post(
    "/api/admin/menu",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = menuItemCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || "Invalid menu item."
        });
        return;
      }
      const id = parsed.data.id || `custom-${parsed.data.category}-${parsed.data.name}-${Date.now().toString(36)}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newItem = {
        ...parsed.data,
        id
      };
      const saved = await addMenuItem(newItem);
      res.status(201).json({ item: saved });
    })
  );
  app.patch(
    "/api/admin/menu/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = menuItemUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || "Invalid update."
        });
        return;
      }
      const patch = {};
      if (parsed.data.name !== void 0) patch.name = parsed.data.name;
      if (parsed.data.section !== void 0) patch.section = parsed.data.section;
      if (parsed.data.category !== void 0) patch.category = parsed.data.category;
      if (parsed.data.price !== void 0) patch.price = parsed.data.price ?? void 0;
      if (parsed.data.variants !== void 0) patch.variants = parsed.data.variants ?? void 0;
      if (parsed.data.unitNote !== void 0) patch.unitNote = parsed.data.unitNote ?? void 0;
      if (parsed.data.isVeg !== void 0) patch.isVeg = parsed.data.isVeg;
      if (parsed.data.available !== void 0) patch.available = parsed.data.available;
      if (parsed.data.image !== void 0) patch.image = parsed.data.image ?? void 0;
      if (parsed.data.description !== void 0) patch.description = parsed.data.description ?? void 0;
      const updated = await updateMenuItem(String(req.params.id), patch);
      if (!updated) {
        res.status(404).json({ error: "Menu item not found." });
        return;
      }
      res.json({ item: updated });
    })
  );
  app.delete(
    "/api/admin/menu/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const deleted = await deleteMenuItem(String(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: "Menu item not found." });
        return;
      }
      res.json({ ok: true });
    })
  );
  app.post(
    "/api/admin/categories/rename",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        section: z.enum(["Savouries & Sips", "Sweet Side"]),
        fromCategory: z.string().trim().min(1).max(80),
        toCategory: z.string().trim().min(1).max(80)
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid category rename payload." });
        return;
      }
      const updatedCount = await renameMenuCategory(
        parsed.data.section,
        parsed.data.fromCategory,
        parsed.data.toCategory
      );
      if (updatedCount === 0) {
        res.status(404).json({ error: "No items found in that category." });
        return;
      }
      res.json({ ok: true, updatedCount });
    })
  );
  app.patch(
    "/api/admin/cakes/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = cakeCollectionUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || "Invalid cake update."
        });
        return;
      }
      const updated = await updateCakeCollection(String(req.params.id), parsed.data);
      if (!updated) {
        res.status(404).json({ error: "Cake collection not found." });
        return;
      }
      res.json({ collection: updated });
    })
  );
  app.patch(
    "/api/admin/enquiries/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        status: z.enum(["New", "Reviewed", "Confirmed", "Completed"])
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid status." });
        return;
      }
      const updated = await updateEnquiryStatus(String(req.params.id), parsed.data.status);
      if (!updated) {
        res.status(404).json({ error: "Enquiry not found." });
        return;
      }
      res.json({ enquiry: updated });
    })
  );
  app.patch(
    "/api/admin/orders/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        status: z.enum(["New", "Confirmed", "Ready", "Completed", "Cancelled"])
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid order status." });
        return;
      }
      const updated = await updateOrderStatus(String(req.params.id), parsed.data.status);
      if (!updated) {
        res.status(404).json({ error: "Order request not found." });
        return;
      }
      res.json({ order: updated });
    })
  );
  app.patch(
    "/api/admin/contacts/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const schema = z.object({
        status: z.enum(["New", "Replied", "Resolved"])
      });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid contact message status." });
        return;
      }
      const updated = await updateContactStatus(String(req.params.id), parsed.data.status);
      if (!updated) {
        res.status(404).json({ error: "Contact message not found." });
        return;
      }
      res.json({ contact: updated });
    })
  );
  app.post(
    "/api/admin/gallery",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = galleryCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || "Invalid gallery item."
        });
        return;
      }
      const item = {
        id: `gal-${Date.now().toString(36)}`,
        ...parsed.data
      };
      const saved = await addGalleryItem(item);
      res.status(201).json({ item: saved });
    })
  );
  app.delete(
    "/api/admin/gallery/:id",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const deleted = await deleteGalleryItem(String(req.params.id));
      if (!deleted) {
        res.status(404).json({ error: "Gallery item not found." });
        return;
      }
      res.json({ ok: true });
    })
  );
  app.put(
    "/api/admin/settings",
    requireAdmin,
    asyncHandler(async (req, res) => {
      const parsed = settingsSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: parsed.error.issues[0]?.message || "Invalid settings."
        });
        return;
      }
      const saved = await updateSettings(parsed.data);
      res.json({ settings: saved });
    })
  );
  app.get("/sitemap.xml", (req, res) => {
    const envUrl = process.env.APP_URL?.trim();
    const baseUrl = envUrl && !envUrl.includes("MY_APP_URL") && !envUrl.includes("example.com") ? envUrl.replace(/\/$/, "") : `${req.protocol}://${req.get("host")}`;
    const routes = [
      { path: "/", priority: "1.0" },
      { path: "/menu", priority: "0.9" },
      { path: "/cakes", priority: "0.9" },
      { path: "/gallery", priority: "0.7" },
      { path: "/about", priority: "0.7" },
      { path: "/contact", priority: "0.8" },
      { path: "/cart", priority: "0.5" }
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>${baseUrl}${r.path}</loc><priority>${r.priority}</priority></url>`).join("\n")}
</urlset>`;
    res.type("application/xml").send(xml);
  });
  app.all("/api/*", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found." });
  });
  app.all("/uploads/*", (_req, res) => {
    res.status(404).json({ error: "File not found." });
  });
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path2.resolve(process.cwd(), "dist");
    if (!fs2.existsSync(path2.join(distDir, "index.html"))) {
      throw new Error(
        `Production frontend build missing at ${distDir}. Run "npm run build" before starting.`
      );
    }
    app.use(
      "/assets",
      express.static(path2.join(distDir, "assets"), {
        maxAge: "1y",
        immutable: true
      })
    );
    app.use(
      express.static(distDir, {
        maxAge: "1h",
        index: false
      })
    );
    app.all("/assets/*", (_req, res) => {
      res.status(404).type("text/plain").send("Asset not found.");
    });
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path2.join(distDir, "index.html"));
    });
  }
  app.use((err, _req, res, _next) => {
    const status = typeof err === "object" && err !== null && ("statusCode" in err || "status" in err) ? Number(err.statusCode || err.status) : 500;
    if (status >= 500) {
      console.error("[server error]", err);
    }
    if (res.headersSent) return;
    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: status === 400 ? "Malformed request payload." : status === 404 ? "Resource not found." : "An unexpected server error occurred. Please try again."
    });
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `7th Heaven Bakery & Cafe server (${IS_PROD ? "production" : "development"}, storage=${getStorageMode()}) listening on 0.0.0.0:${PORT}`
    );
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
