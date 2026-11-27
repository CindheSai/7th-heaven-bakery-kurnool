export type MenuSection = 'Savouries & Sips' | 'Sweet Side';

export interface MenuVariant {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  section: MenuSection;
  category: string;
  price?: number;
  variants?: MenuVariant[];
  unitNote?: string;
  isVeg: boolean;
  available: boolean;
  image?: string;
  description?: string;
}

export interface CakeFlavour {
  name: string;
  calories?: string;
  pastryPrice?: number;
  serveSizeGrams?: number;
  price500g?: number;
  isSignature?: boolean;
}

export interface CakeCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  halfKgPrice: number | null;
  oneKgPrice: number | null;
  pastryPrice?: number | null;
  pastrySizeLabel?: string;
  perKgPrice?: number | null;
  serveSizeNote?: string;
  priceVerificationStatus: 'verified' | 'needs_verification' | 'custom_quote';
  verificationNote?: string;
  flavours: CakeFlavour[];
  isCustomCategory?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category:
    | 'Signature Cakes'
    | 'Cheesecakes'
    | 'Brownies'
    | 'Waffles'
    | 'Desserts'
    | 'Savouries'
    | 'Beverages'
    | 'Café Experience';
  image: string;
  caption: string;
  isAuthenticBusinessPhoto: boolean;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  positioning: string;
  phone: string;
  whatsappNumber: string;
  instagramHandle: string;
  instagramUrl: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  hours: string;
  heroHeadline: string;
  heroSubheadline: string;
  promoBanner: string;
}

export interface CakeEnquiry {
  id: string;
  customerName: string;
  mobileNumber: string;
  cakeCategory: string;
  preferredFlavour: string;
  cakeWeight: string;
  shapeOrDesign: string;
  requiredDate: string;
  referenceImageUrl?: string;
  instructions?: string;
  status: 'New' | 'Reviewed' | 'Confirmed' | 'Completed';
  createdAt: string;
}

export interface CartItem {
  cartKey: string;
  itemId: string;
  name: string;
  category: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderRequestItem {
  itemId: string;
  name: string;
  category: string;
  variantLabel?: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderRequest {
  id: string;
  customerName: string;
  mobileNumber: string;
  fulfillment: 'Store Pickup' | 'Local Delivery Enquiry';
  items: OrderRequestItem[];
  estimatedSubtotal: number;
  notes?: string;
  status: 'New' | 'Confirmed' | 'Ready' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  status: 'New' | 'Replied' | 'Resolved';
  createdAt: string;
}

export interface StoreData {
  settings: SiteSettings;
  menuItems: MenuItem[];
  cakeCollections: CakeCollection[];
  gallery: GalleryItem[];
  enquiries: CakeEnquiry[];
  orders: OrderRequest[];
  contacts: ContactMessage[];
}
