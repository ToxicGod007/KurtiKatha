import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Settings } from '../models/Settings.js';
import { Coupon } from '../models/Coupon.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kurtikatha';

export async function runSeed() {
  console.log('[Seed] Connecting to MongoDB at', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('[Seed] Database connected successfully.');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Settings.deleteMany({}),
    Coupon.deleteMany({}),
  ]);
  console.log('[Seed] Existing collections cleaned.');

  // 1. Seed Admin User
  const adminPasswordHash = await User.hashPassword('Admin@KurtiKatha2026');
  const adminUser = await User.create({
    name: 'KurtiKatha Admin',
    email: 'admin@kurtikatha.com',
    phone: '+91 86974 49885',
    passwordHash: adminPasswordHash,
    role: 'admin',
    addresses: [
      {
        name: 'KurtiKatha Boutique',
        phone: '+91 86974 49885',
        pincode: '700001',
        addressLine: '14 Bipin Behari Ganguly St, Bowbazar',
        locality: 'Central Kolkata',
        city: 'Kolkata',
        state: 'West Bengal',
        isDefault: true,
      },
    ],
  });
  console.log('[Seed] Admin user created:', adminUser.email);

  // 2. Seed Default Settings
  const settings = await Settings.create({
    contactPhone: '+91 86974 49885',
    whatsappNumber: '918697449885',
    supportEmail: 'support@kurtikatha.com',
    shippingFee: 69,
    freeShippingThreshold: 999,
    codEnabled: true,
    announcementText: 'Festive Sale: Free Shipping on orders over ₹999 | Cash on Delivery (COD) Available',
  });
  console.log('[Seed] Site settings created with contact:', settings.contactPhone);

  // 3. Seed Categories
  const categories = await Category.insertMany([
    {
      name: 'Kurtis',
      slug: 'kurtis',
      description: 'Daily wear, straight cut, A-line & Anarkali kurtis in breathable cotton.',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80',
      displayOrder: 1,
    },
    {
      name: 'Nighties',
      slug: 'nighties',
      description: 'Ultra-soft 100% cotton nightdresses and daily loungewear.',
      image: 'https://images.unsplash.com/photo-1596783049554-215eed975943?w=600&auto=format&fit=crop&q=80',
      displayOrder: 2,
    },
    {
      name: 'Kurti Sets',
      slug: 'kurti-sets',
      description: 'Complete festive matching kurti, pant & dupatta sets.',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      displayOrder: 3,
    },
    {
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'Latest boutique arrivals direct from artisan makers.',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
      displayOrder: 4,
    },
  ]);
  console.log(`[Seed] ${categories.length} categories created.`);

  const catMap = {};
  categories.forEach((c) => {
    catMap[c.slug] = c._id;
  });

  // 4. Seed 24 Sample Products
  const productsData = [
    // --- 12 Kurtis ---
    {
      title: 'Kolkata Kantha Floral Pure Cotton Kurti',
      slug: 'kolkata-kantha-floral-pure-cotton-kurti',
      category: catMap['kurtis'],
      fabric: '100% Pure Cotton',
      pattern: 'Traditional Kantha Hand Stitch',
      length: '44 Inches (Calf Length)',
      sleeve: '3/4 Sleeves',
      description: 'Authentic Bengal Kantha stitch embroidery on soft summer cotton. Perfect for office and casual daytime gatherings.',
      mrp: 1299,
      price: 699,
      isActive: true,
      isFeatured: true,
      bestseller: true,
      images: [{ url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'S', color: 'Crimson Red', colorHex: '#D62828', sku: 'KK-KUR-01-S', stock: 15 },
        { size: 'M', color: 'Crimson Red', colorHex: '#D62828', sku: 'KK-KUR-01-M', stock: 20 },
        { size: 'L', color: 'Crimson Red', colorHex: '#D62828', sku: 'KK-KUR-01-L', stock: 18 },
        { size: 'XL', color: 'Crimson Red', colorHex: '#D62828', sku: 'KK-KUR-01-XL', stock: 8 },
        { size: 'XXL', color: 'Crimson Red', colorHex: '#D62828', sku: 'KK-KUR-01-XXL', stock: 3 }, // low stock
      ],
    },
    {
      title: 'Jaipuri Bagru Hand Block Straight Kurti',
      slug: 'jaipuri-bagru-hand-block-straight-kurti',
      category: catMap['kurtis'],
      fabric: '100% Cambric Cotton',
      pattern: 'Natural Dye Bagru Block Print',
      length: '43 Inches',
      sleeve: '3/4 Sleeves',
      description: 'Handcrafted vegetable dye block print on lightweight cambric cotton with mandarin collar.',
      mrp: 1199,
      price: 649,
      isActive: true,
      isFeatured: true,
      images: [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'M', color: 'Indigo Blue', colorHex: '#1D3557', sku: 'KK-KUR-02-M', stock: 25 },
        { size: 'L', color: 'Indigo Blue', colorHex: '#1D3557', sku: 'KK-KUR-02-L', stock: 20 },
        { size: 'XL', color: 'Indigo Blue', colorHex: '#1D3557', sku: 'KK-KUR-02-XL', stock: 12 },
      ],
    },
    {
      title: 'Mustard Festive Rayon Anarkali Kurti',
      slug: 'mustard-festive-rayon-anarkali-kurti',
      category: catMap['kurtis'],
      fabric: 'Rayon 140 GSM',
      pattern: 'Gold Foil Border',
      length: '48 Inches (Flared Anarkali)',
      sleeve: 'Full Sleeves',
      description: 'Lustrous festive mustard yellow kurti with rich ghera and potli button detailing on yoke.',
      mrp: 1599,
      price: 849,
      isActive: true,
      bestseller: true,
      images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'S', color: 'Mustard Gold', colorHex: '#E9C46A', sku: 'KK-KUR-03-S', stock: 10 },
        { size: 'M', color: 'Mustard Gold', colorHex: '#E9C46A', sku: 'KK-KUR-03-M', stock: 14 },
        { size: 'L', color: 'Mustard Gold', colorHex: '#E9C46A', sku: 'KK-KUR-03-L', stock: 15 },
        { size: 'XL', color: 'Mustard Gold', colorHex: '#E9C46A', sku: 'KK-KUR-03-XL', stock: 6 },
      ],
    },
    {
      title: 'Mint Pastel Chikankari Embroidered Kurti',
      slug: 'mint-pastel-chikankari-embroidered-kurti',
      category: catMap['kurtis'],
      fabric: 'Mulmul Cotton',
      pattern: 'Lucknowi Chikankari Shadow Work',
      length: '44 Inches',
      sleeve: '3/4 Sleeves',
      description: 'Feather-soft mulmul cotton featuring exquisite white thread shadow embroidery.',
      mrp: 1499,
      price: 799,
      isActive: true,
      isNewArrival: true,
      images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'M', color: 'Pastel Mint', colorHex: '#A8DADC', sku: 'KK-KUR-04-M', stock: 18 },
        { size: 'L', color: 'Pastel Mint', colorHex: '#A8DADC', sku: 'KK-KUR-04-L', stock: 14 },
        { size: 'XL', color: 'Pastel Mint', colorHex: '#A8DADC', sku: 'KK-KUR-04-XL', stock: 10 },
      ],
    },
    {
      title: 'Everyday Khadi Cotton Striped Office Kurti',
      slug: 'everyday-khadi-cotton-striped-office-kurti',
      category: catMap['kurtis'],
      fabric: 'Handloom Khadi Cotton',
      pattern: 'Woven Fine Stripes with Wooden Buttons',
      length: '42 Inches',
      sleeve: '3/4 Sleeves',
      description: 'Crisp handloom texture that softens with each wash. Deep functional side pocket included.',
      mrp: 999,
      price: 549,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'S', color: 'Beige & White', colorHex: '#F4ECE0', sku: 'KK-KUR-05-S', stock: 20 },
        { size: 'M', color: 'Beige & White', colorHex: '#F4ECE0', sku: 'KK-KUR-05-M', stock: 25 },
        { size: 'L', color: 'Beige & White', colorHex: '#F4ECE0', sku: 'KK-KUR-05-L', stock: 22 },
        { size: 'XL', color: 'Beige & White', colorHex: '#F4ECE0', sku: 'KK-KUR-05-XL', stock: 16 },
      ],
    },
    {
      title: 'Ruby Red Bandhani Printed Flared Kurti',
      slug: 'ruby-red-bandhani-printed-flared-kurti',
      category: catMap['kurtis'],
      fabric: 'Soft Viscose Rayon',
      pattern: 'Traditional Gujarati Bandhani Dots',
      length: '46 Inches',
      sleeve: 'Short Sleeves',
      description: 'Classic crimson red festive bandhani with tassels and round neck with keyhole.',
      mrp: 1399,
      price: 699,
      isActive: true,
      bestseller: true,
      images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'M', color: 'Crimson', colorHex: '#D62828', sku: 'KK-KUR-06-M', stock: 30 },
        { size: 'L', color: 'Crimson', colorHex: '#D62828', sku: 'KK-KUR-06-L', stock: 25 },
        { size: 'XL', color: 'Crimson', colorHex: '#D62828', sku: 'KK-KUR-06-XL', stock: 12 },
      ],
    },
    {
      title: 'Olive Floral Tiered Cotton Fusion Kurti',
      slug: 'olive-floral-tiered-cotton-fusion-kurti',
      category: catMap['kurtis'],
      fabric: '100% Cotton',
      pattern: 'English Floral Micro Print',
      length: '45 Inches (3 Tiers)',
      sleeve: 'Sleeveless with attachable sleeves inside',
      description: 'Western-fusion tiered silhouette made with breathable organic cotton.',
      mrp: 1299,
      price: 679,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'S', color: 'Olive Green', colorHex: '#606C38', sku: 'KK-KUR-07-S', stock: 12 },
        { size: 'M', color: 'Olive Green', colorHex: '#606C38', sku: 'KK-KUR-07-M', stock: 15 },
        { size: 'L', color: 'Olive Green', colorHex: '#606C38', sku: 'KK-KUR-07-L', stock: 10 },
      ],
    },
    {
      title: 'Classic Black Kalamkari Print Cotton Kurti',
      slug: 'classic-black-kalamkari-print-cotton-kurti',
      category: catMap['kurtis'],
      fabric: 'South Cotton',
      pattern: 'Andhra Kalamkari Motif Print',
      length: '44 Inches',
      sleeve: '3/4 Sleeves',
      description: 'Elegant jet black background highlighting earthy ochre and terracotta mythical motifs.',
      mrp: 1199,
      price: 599,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'M', color: 'Black & Ochre', colorHex: '#1E1E24', sku: 'KK-KUR-08-M', stock: 18 },
        { size: 'L', color: 'Black & Ochre', colorHex: '#1E1E24', sku: 'KK-KUR-08-L', stock: 14 },
        { size: 'XL', color: 'Black & Ochre', colorHex: '#1E1E24', sku: 'KK-KUR-08-XL', stock: 20 },
      ],
    },
    {
      title: 'Sky Blue Floral Angrakha Overlap Kurti',
      slug: 'sky-blue-floral-angrakha-overlap-kurti',
      category: catMap['kurtis'],
      fabric: '100% Mulmul',
      pattern: 'Mughal Blossom Print with Side Tie-Up',
      length: '46 Inches',
      sleeve: 'Elbow Sleeves',
      description: 'Traditional royal Angrakha overlap with handmade fabric latkans and tassels.',
      mrp: 1499,
      price: 749,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'S', color: 'Sky Blue', colorHex: '#457B9D', sku: 'KK-KUR-09-S', stock: 10 },
        { size: 'M', color: 'Sky Blue', colorHex: '#457B9D', sku: 'KK-KUR-09-M', stock: 16 },
        { size: 'L', color: 'Sky Blue', colorHex: '#457B9D', sku: 'KK-KUR-09-L', stock: 12 },
      ],
    },
    {
      title: 'Lavender Pastel Daily Cotton Straight Kurti',
      slug: 'lavender-pastel-daily-cotton-straight-kurti',
      category: catMap['kurtis'],
      fabric: 'Pure Cotton 60s',
      pattern: 'Subtle Self-Weave Dobby Texture',
      length: '43 Inches',
      sleeve: '3/4 Sleeves',
      description: 'Minimalist soothing lavender kurti tailored for college, teaching, and working women.',
      mrp: 899,
      price: 499,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'M', color: 'Lavender', colorHex: '#B8C0FF', sku: 'KK-KUR-10-M', stock: 20 },
        { size: 'L', color: 'Lavender', colorHex: '#B8C0FF', sku: 'KK-KUR-10-L', stock: 18 },
        { size: 'XL', color: 'Lavender', colorHex: '#B8C0FF', sku: 'KK-KUR-10-XL', stock: 15 },
        { size: 'XXL', color: 'Lavender', colorHex: '#B8C0FF', sku: 'KK-KUR-10-XXL', stock: 8 },
      ],
    },
    {
      title: 'Peach Embroidered Mirror-Work Festive Kurti',
      slug: 'peach-embroidered-mirror-work-festive-kurti',
      category: catMap['kurtis'],
      fabric: 'Chanderi Silk Blend',
      pattern: 'Faux Mirror & Resham Threadwork',
      length: '46 Inches',
      sleeve: '3/4 Sleeves',
      description: 'Luminous peach festive wear with inner cotton lining for itch-free celebration comfort.',
      mrp: 1899,
      price: 949,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'M', color: 'Warm Peach', colorHex: '#F4A261', sku: 'KK-KUR-11-M', stock: 14 },
        { size: 'L', color: 'Warm Peach', colorHex: '#F4A261', sku: 'KK-KUR-11-L', stock: 11 },
        { size: 'XL', color: 'Warm Peach', colorHex: '#F4A261', sku: 'KK-KUR-11-XL', stock: 7 },
      ],
    },
    {
      title: 'Maroon Gold Block Print Kali Kurti',
      slug: 'maroon-gold-block-print-kali-kurti',
      category: catMap['kurtis'],
      fabric: '100% Cotton',
      pattern: 'Gold Khari Print on Kalis',
      length: '47 Inches',
      sleeve: '3/4 Sleeves',
      description: 'Traditional 12-kali flared silhouette inspired by heritage Bengal craftsmanship.',
      mrp: 1399,
      price: 729,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'M', color: 'Maroon', colorHex: '#7F1D1D', sku: 'KK-KUR-12-M', stock: 16 },
        { size: 'L', color: 'Maroon', colorHex: '#7F1D1D', sku: 'KK-KUR-12-L', stock: 15 },
        { size: 'XL', color: 'Maroon', colorHex: '#7F1D1D', sku: 'KK-KUR-12-XL', stock: 9 },
      ],
    },

    // --- 8 Nighties ---
    {
      title: 'Breezy Indigo Block Print Nighty (100% Cotton)',
      slug: 'breezy-indigo-block-print-nighty-100-cotton',
      category: catMap['nighties'],
      fabric: '100% Pure Combed Cotton',
      pattern: 'Traditional Dabu Indigo Print',
      length: '55 Inches (Full Length Maxi)',
      sleeve: 'Short Sleeves',
      description: 'Super-soft summer cotton nightdress with right-side deep pocket. Colorfast and durable.',
      mrp: 899,
      price: 499,
      isActive: true,
      isFeatured: true,
      bestseller: true,
      images: [{ url: 'https://images.unsplash.com/photo-1596783049554-215eed975943?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'Free Size (L/XL)', color: 'Indigo Blue', colorHex: '#1D3557', sku: 'KK-NGH-01-FS', stock: 45 },
        { size: 'XXL', color: 'Indigo Blue', colorHex: '#1D3557', sku: 'KK-NGH-01-XXL', stock: 25 },
        { size: '3XL', color: 'Indigo Blue', colorHex: '#1D3557', sku: 'KK-NGH-01-3XL', stock: 15 },
      ],
    },
    {
      title: 'Traditional Bengali Batik Wax Print Cotton Nighty',
      slug: 'traditional-bengali-batik-wax-print-cotton-nighty',
      category: catMap['nighties'],
      fabric: '100% Cotton',
      pattern: 'Shantiniketan Batik Wax Crackle',
      length: '54 Inches',
      sleeve: 'Short Sleeves',
      description: 'Artisanal wax resist batik print from Shantiniketan. Premium stitching with reinforced armholes.',
      mrp: 849,
      price: 469,
      isActive: true,
      bestseller: true,
      images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'Free Size (L/XL)', color: 'Crimson Batik', colorHex: '#D62828', sku: 'KK-NGH-02-FS', stock: 35 },
        { size: 'XXL', color: 'Crimson Batik', colorHex: '#D62828', sku: 'KK-NGH-02-XXL', stock: 20 },
      ],
    },
    {
      title: 'Summer Alpine Pastel Floral Nighty with Pocket',
      slug: 'summer-alpine-pastel-floral-nighty-with-pocket',
      category: catMap['nighties'],
      fabric: 'Alpine Cotton Flannel (Ultra Soft)',
      pattern: 'English Rose Floral Vines',
      length: '55 Inches',
      sleeve: 'Short Sleeves',
      description: 'Alpine cotton weave that feels cool against the skin. Convenient side pocket for mobile phone.',
      mrp: 999,
      price: 549,
      isActive: true,
      isFeatured: true,
      images: [{ url: 'https://images.unsplash.com/photo-1596783049554-215eed975943?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'Free Size (L/XL)', color: 'Pastel Pink', colorHex: '#FCD5CE', sku: 'KK-NGH-03-FS', stock: 50 },
        { size: 'XXL', color: 'Pastel Pink', colorHex: '#FCD5CE', sku: 'KK-NGH-03-XXL', stock: 30 },
      ],
    },
    {
      title: 'Maternity Friendly Front-Zipper Cotton Nighty',
      slug: 'maternity-friendly-front-zipper-cotton-nighty',
      category: catMap['nighties'],
      fabric: '100% Breathable Cotton',
      pattern: 'Micro Polka Dots',
      length: '55 Inches',
      sleeve: 'Half Sleeves',
      description: 'Features two hidden, smooth front zippers for hassle-free nursing & feeding. Generous relaxed cut.',
      mrp: 949,
      price: 529,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'Free Size (L/XL)', color: 'Teal Blue', colorHex: '#2A9D8F', sku: 'KK-NGH-04-FS', stock: 28 },
        { size: 'XXL', color: 'Teal Blue', colorHex: '#2A9D8F', sku: 'KK-NGH-04-XXL', stock: 22 },
        { size: '3XL', color: 'Teal Blue', colorHex: '#2A9D8F', sku: 'KK-NGH-04-3XL', stock: 12 },
      ],
    },
    {
      title: 'Sunny Yellow Sunflower Print Cotton Nightdress',
      slug: 'sunny-yellow-sunflower-print-cotton-nightdress',
      category: catMap['nighties'],
      fabric: '100% Pure Cotton',
      pattern: 'Sunflower Garden Print',
      length: '54 Inches',
      sleeve: 'Short Sleeves',
      description: 'Bright and cheerful daily loungewear nighty with delicate lace trim on neckline.',
      mrp: 799,
      price: 429,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1596783049554-215eed975943?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'Free Size (L/XL)', color: 'Sunflower Yellow', colorHex: '#E9C46A', sku: 'KK-NGH-05-FS', stock: 40 },
        { size: 'XXL', color: 'Sunflower Yellow', colorHex: '#E9C46A', sku: 'KK-NGH-05-XXL', stock: 18 },
      ],
    },
    {
      title: 'Navy Blue Embroidered Yoke Cotton Nighty',
      slug: 'navy-blue-embroidered-yoke-cotton-nighty',
      category: catMap['nighties'],
      fabric: 'Thick Cotton 40s (Non-transparent)',
      pattern: 'Embroidered Kashmiri Floral Yoke',
      length: '55 Inches',
      sleeve: 'Half Sleeves',
      description: 'Opaque high-density weave suitable for living with joint family. Intricate chest embroidery.',
      mrp: 899,
      price: 489,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'Free Size (L/XL)', color: 'Navy Blue', colorHex: '#1D3557', sku: 'KK-NGH-06-FS', stock: 32 },
        { size: 'XXL', color: 'Navy Blue', colorHex: '#1D3557', sku: 'KK-NGH-06-XXL', stock: 24 },
      ],
    },
    {
      title: 'Lavender Breeze Tie-Dye Cotton Nighty',
      slug: 'lavender-breeze-tie-dye-cotton-nighty',
      category: catMap['nighties'],
      fabric: '100% Cotton',
      pattern: 'Soft Pastel Tie-Dye Clouds',
      length: '54 Inches',
      sleeve: 'Sleeveless / Cap Sleeve',
      description: 'Featherweight airy sleepwear for sweltering summer nights. Pre-washed for maximum softness.',
      mrp: 849,
      price: 449,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1596783049554-215eed975943?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'Free Size (L/XL)', color: 'Lavender Tie-Dye', colorHex: '#CDB4DB', sku: 'KK-NGH-07-FS', stock: 25 },
        { size: 'XXL', color: 'Lavender Tie-Dye', colorHex: '#CDB4DB', sku: 'KK-NGH-07-XXL', stock: 15 },
      ],
    },
    {
      title: 'Crimson Paisley Jaipuri Alpine Nighty',
      slug: 'crimson-paisley-jaipuri-alpine-nighty',
      category: catMap['nighties'],
      fabric: 'Alpine Cotton',
      pattern: 'Traditional Paisley Boota',
      length: '56 Inches',
      sleeve: 'Short Sleeves',
      description: 'Deep crimson red with contrast gold border detailing. Soft neck piping avoids collar irritation.',
      mrp: 949,
      price: 519,
      isActive: true,
      bestseller: true,
      images: [{ url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'Free Size (L/XL)', color: 'Crimson Paisley', colorHex: '#D62828', sku: 'KK-NGH-08-FS', stock: 38 },
        { size: 'XXL', color: 'Crimson Paisley', colorHex: '#D62828', sku: 'KK-NGH-08-XXL', stock: 20 },
      ],
    },

    // --- 4 Kurti Sets ---
    {
      title: 'Crimson Red Kurti with Cotton Pant & Organza Dupatta Set',
      slug: 'crimson-red-kurti-cotton-pant-organza-dupatta-set',
      category: catMap['kurti-sets'],
      fabric: 'Rayon Slub & Pure Organza Dupatta',
      pattern: 'Gota Patti Work on Neckline & Hem',
      length: 'Kurti 46 Inches, Pant 38 Inches',
      sleeve: '3/4 Sleeves',
      description: 'Complete 3-piece festive ensemble ready to wear for Durga Puja, Diwali, and family events.',
      mrp: 2699,
      price: 1399,
      isActive: true,
      isFeatured: true,
      bestseller: true,
      images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'S', color: 'Crimson Red', colorHex: '#D62828', sku: 'KK-SET-01-S', stock: 12 },
        { size: 'M', color: 'Crimson Red', colorHex: '#D62828', sku: 'KK-SET-01-M', stock: 18 },
        { size: 'L', color: 'Crimson Red', colorHex: '#D62828', sku: 'KK-SET-01-L', stock: 15 },
        { size: 'XL', color: 'Crimson Red', colorHex: '#D62828', sku: 'KK-SET-01-XL', stock: 8 },
      ],
    },
    {
      title: 'Indigo Blue Hand-Block Kurti with Cigarette Pant Set',
      slug: 'indigo-blue-hand-block-kurti-cigarette-pant-set',
      category: catMap['kurti-sets'],
      fabric: '100% Cotton 60-60',
      pattern: 'Ajrakh Geometric Block Motif',
      length: 'Kurti 44 Inches, Pant 37 Inches',
      sleeve: '3/4 Sleeves',
      description: 'Chic formal 2-piece set. Pant features half elastic waistband with side pockets.',
      mrp: 2199,
      price: 1099,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'M', color: 'Indigo Blue', colorHex: '#1D3557', sku: 'KK-SET-02-M', stock: 14 },
        { size: 'L', color: 'Indigo Blue', colorHex: '#1D3557', sku: 'KK-SET-02-L', stock: 12 },
        { size: 'XL', color: 'Indigo Blue', colorHex: '#1D3557', sku: 'KK-SET-02-XL', stock: 9 },
      ],
    },
    {
      title: 'Pastel Sage Green Anarkali Kurti & Sharara Set',
      slug: 'pastel-sage-green-anarkali-kurti-sharara-set',
      category: catMap['kurti-sets'],
      fabric: 'Mulmul Cotton & Voile',
      pattern: 'Lace Border & Delicate Thread Embroidered Yoke',
      length: 'Kurti 46 Inches, Sharara 39 Inches',
      sleeve: 'Full Sleeves',
      description: 'Flowy fairy-like silhouette with gathered flared sharara and sheer printed dupatta.',
      mrp: 2999,
      price: 1499,
      isActive: true,
      isNewArrival: true,
      images: [{ url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'S', color: 'Sage Green', colorHex: '#CCD5AE', sku: 'KK-SET-03-S', stock: 8 },
        { size: 'M', color: 'Sage Green', colorHex: '#CCD5AE', sku: 'KK-SET-03-M', stock: 12 },
        { size: 'L', color: 'Sage Green', colorHex: '#CCD5AE', sku: 'KK-SET-03-L', stock: 10 },
      ],
    },
    {
      title: 'Turmeric Yellow Haldi Ceremony Kurti, Pant & Chiffon Dupatta Set',
      slug: 'turmeric-yellow-haldi-ceremony-kurti-pant-chiffon-dupatta-set',
      category: catMap['kurti-sets'],
      fabric: 'Chanderi Weave Cotton',
      pattern: 'Mirror Foil Work on Yoke',
      length: 'Kurti 45 Inches, Pant 38 Inches',
      sleeve: '3/4 Sleeves',
      description: 'Vibrant Haldi bridal or guest special set. Radiates joyous festive warmth.',
      mrp: 2499,
      price: 1249,
      isActive: true,
      images: [{ url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80', isPrimary: true }],
      variants: [
        { size: 'M', color: 'Haldi Yellow', colorHex: '#E9C46A', sku: 'KK-SET-04-M', stock: 15 },
        { size: 'L', color: 'Haldi Yellow', colorHex: '#E9C46A', sku: 'KK-SET-04-L', stock: 16 },
        { size: 'XL', color: 'Haldi Yellow', colorHex: '#E9C46A', sku: 'KK-SET-04-XL', stock: 7 },
      ],
    },
  ];

  const createdProducts = await Product.insertMany(productsData);
  console.log(`[Seed] ${createdProducts.length} curated products inserted successfully.`);

  // 5. Seed Promotional Coupons
  const coupons = await Coupon.insertMany([
    {
      code: 'FESTIVE10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 799,
      maxDiscount: 200,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // 90 days
      usageLimit: 500,
      isActive: true,
    },
    {
      code: 'WELCOME100',
      discountType: 'flat',
      discountValue: 100,
      minOrderValue: 999,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), // 180 days
      usageLimit: 1000,
      isActive: true,
    },
    {
      code: 'FREESHIP',
      discountType: 'flat',
      discountValue: 69,
      minOrderValue: 499,
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      usageLimit: 2000,
      isActive: true,
    },
  ]);
  console.log(`[Seed] ${coupons.length} coupons inserted successfully.`);

  console.log('[Seed] Database seeding completed cleanly!');
  await mongoose.disconnect();
}

if (process.argv[1]?.endsWith('seed.js')) {
  runSeed().catch((err) => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
}

