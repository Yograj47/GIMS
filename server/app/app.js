// Import Packages and Configurations
import express from "express"
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js"
import cors from "cors"

// Import Routes
import settingRoutes from "./routes/Setting.Route.js"
import userRoutes from "./routes/User.Route.js"
import authRoutes from "./routes/Auth.Route.js"
import categoryRoutes from "./routes/Category.Route.js"
import unitRoutes from "./routes/Unit.Route.js"
import productRoutes from "./routes/Product.Route.js"
import supplierRoutes from "./routes/Supplier.Route.js"
import MovementTransactionRoutes from "./routes/MovementTransaction.Route.js"
import activityLogRoutes from "./routes/ActivityLog.Route.js"
import alertRoutes from "./routes/Alert.Route.js"

const app = express();

// Body parser middleware and Cookie parser
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// Test Route
app.get("/", (req, res) => {
    res.send("Hello World!!")
})

const API = "/api/v1"

const categoriesData = [
  // Essential Food & Grains
  { name: "Rice & Cereals", description: "Bulk and branded rice, beaten rice (chiura), and corn products." },
  { name: "Lentils & Pulses", description: "All types of Dal (Musuro, Rahar, Mungi) and whole beans." },
  { name: "Flour & Atta", description: "Wheat flour, Maida, Besan, and specialized local flours." },
  { name: "Oil & Ghee", description: "Mustard, Sunflower, and Soybean oils plus vegetable/dairy Ghee." },
  { name: "Sugar & Salts", description: "White/brown sugar, crushed salt, and iodized table salt." },

  // Beverages & Snacks
  { name: "Soft Drinks", description: "Carbonated beverages, sodas, and cold drink bottles." },
  { name: "Tea & Coffee", description: "Local CTC tea, dust tea, and instant coffee powders." },
  { name: "Noodles & Pasta", description: "Instant noodles, macaroni, pasta, and spaghetti." },
  { name: "Biscuits & Snacks", description: "Sweet/salty biscuits, chips, Dalmoth, and bhujia." },
  { name: "Chocolates & Candy", description: "Branded chocolates, local candies, and chewing gums." },

  // Household & Personal Care
  { name: "Detergent & Soap", description: "Washing powders, laundry soaps, and dishwashing bars." },
  { name: "Toiletries", description: "Bathing soaps, shampoos, toothpaste, and brushes." },
  { name: "Cleaning Supplies", description: "Floor cleaners, toilet cleaners, and disinfectants." },
  { name: "Paper & Plastic", description: "Toilet paper, napkins, tissues, and garbage bags." },

  // Miscellaneous & Dairy
  { name: "Dairy & Eggs", description: "Fresh milk, curd, paneer, butter, and farm eggs." },
  { name: "Spices & Masala", description: "Turmeric, cumin, chili powder, and mixed meat/veg masalas." },
  { name: "Pooja Samagri", description: "Incense sticks (agarbatti), camphor, oil, and cotton wicks." },
  { name: "Kitchenware", description: "Matchboxes, lighters, scrubbers, and sponges." }
];

const unitsData = [
  // Weight Units
  { name: "Gram", shortForm: "gm", unitType: "weight", baseUnit: true, isFractional: true, multiplierToBase: 1, isActive: true },
  { name: "Kilogram", shortForm: "kg", unitType: "weight", baseUnit: false, isFractional: true, multiplierToBase: 1000, isActive: true },
  { name: "Dharni", shortForm: "dhr", unitType: "weight", baseUnit: false, isFractional: true, multiplierToBase: 2390, isActive: true },

  // Volume Units
  { name: "Milliliter", shortForm: "ml", unitType: "volume", baseUnit: true, isFractional: true, multiplierToBase: 1, isActive: true },
  { name: "Liter", shortForm: "ltr", unitType: "volume", baseUnit: false, isFractional: true, multiplierToBase: 1000, isActive: true },

  // Count Units
  { name: "Piece", shortForm: "pc", unitType: "count", baseUnit: true, isFractional: false, multiplierToBase: 1, isActive: true },
  { name: "Packet", shortForm: "pkt", unitType: "count", baseUnit: true, isFractional: true, multiplierToBase: 1, isActive: true },
  { name: "Bottle", shortForm: "btl", unitType: "count", baseUnit: true, isFractional: false, multiplierToBase: 1, isActive: true },
  { name: "Jar", shortForm: "jar", unitType: "count", baseUnit: true, isFractional: false, multiplierToBase: 1, isActive: true },
  { name: "Dozen", shortForm: "dz", unitType: "count", baseUnit: false, isFractional: false, multiplierToBase: 12, isActive: true },

  // Bulk / Pack Units
  { name: "Case / Box", shortForm: "box", unitType: "pack", baseUnit: false, isFractional: false, multiplierToBase: 20, isActive: true },
  { name: "Crate", shortForm: "crate", unitType: "pack", baseUnit: false, isFractional: false, multiplierToBase: 30, isActive: true },
  { name: "Sack (Bora)", shortForm: "sk", unitType: "pack", baseUnit: false, isFractional: false, multiplierToBase: 25, isActive: true }, // Defaulted to 25
  { name: "Carton", shortForm: "crt", unitType: "pack", baseUnit: false, isFractional: false, multiplierToBase: 12, isActive: true }  // Defaulted to 12
];

import Category from "./models/Category.Model.js";
import Unit from "./models/Unit.Model.js";

export const seedDatabase = async () => {
  try {
    // 1. Check if Categories already exist
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log("🌱 Seeding Categories...");
      await Category.insertMany(categoriesData);
      console.log("✅ Categories Seeded!");
    }

    // 2. Check if Units already exist
    const unitCount = await Unit.countDocuments();
    if (unitCount === 0) {
      console.log("🌱 Seeding Units...");
      await Unit.insertMany(unitsData);
      console.log("✅ Units Seeded!");
    }
  } catch (error) {
    console.error("❌ Seed Error:", error);
  }
};

seedDatabase();


// Routes
app.use(`${API}/auths`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/units`, unitRoutes);
app.use(`${API}/products`, productRoutes)
app.use(`${API}/suppliers`, supplierRoutes);
app.use(`${API}/transactions`, MovementTransactionRoutes);
app.use(`${API}/activity-logs`, activityLogRoutes);
app.use(`${API}/alerts`, alertRoutes);
app.use(`${API}/settings`, settingRoutes);

// Error Middleware
app.use(errorHandler);

export default app;