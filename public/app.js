const $ = id => document.getElementById(id);

let lastResults = null;
let lastBestCrop = null;
let lastAlternatives = [];
let currentUser = null;
let recognition = null;
let answerLanguage = "en";

const words = {
  // LOGIN AND REGISTRATION
  tagline: [
    "Smart Farming, Better Future",
    "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ, ಉತ್ತಮ ಭವಿಷ್ಯ",
    "स्मार्ट खेती, बेहतर भविष्य"
  ],
  loginTitle: [
    "Welcome Back!",
    "ಮರಳಿ ಸ್ವಾಗತ!",
    "आपका स्वागत है!"
  ],
  loginDesc: [
    "Login to your farmer account",
    "ನಿಮ್ಮ ರೈತ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ",
    "अपने किसान खाते में लॉगिन करें"
  ],
  identifier: [
    "Email or Mobile Number",
    "ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    "ईमेल या मोबाइल नंबर"
  ],
  identifierHint: [
    "Enter email or mobile number",
    "ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    "ईमेल या मोबाइल नंबर दर्ज करें"
  ],
  password: [
    "Password",
    "ಗುಪ್ತಪದ",
    "पासवर्ड"
  ],
  passwordHint: [
    "Enter your password",
    "ನಿಮ್ಮ ಗುಪ್ತಪದ ನಮೂದಿಸಿ",
    "अपना पासवर्ड दर्ज करें"
  ],
  login: ["LOGIN", "ಲಾಗಿನ್ ಮಾಡಿ", "लॉगिन करें"],
  newFarmer: [
    "New farmer?",
    "ಹೊಸ ರೈತರೇ?",
    "नए किसान हैं?"
  ],
  create: [
    "Create Account",
    "ಖಾತೆ ತೆರೆಯಿರಿ",
    "खाता बनाएं"
  ],
  registerDesc: [
    "Register as a SmartCrop farmer",
    "SmartCrop ರೈತರಾಗಿ ನೋಂದಾಯಿಸಿ",
    "SmartCrop किसान के रूप में पंजीकरण करें"
  ],
  name: ["Farmer Name", "ರೈತರ ಹೆಸರು", "किसान का नाम"],
  nameHint: [
    "Enter your full name",
    "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ನಮೂದಿಸಿ",
    "अपना पूरा नाम दर्ज करें"
  ],
  mobile: ["Mobile Number", "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ", "मोबाइल नंबर"],
  mobileHint: [
    "Enter 10-digit mobile number",
    "10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    "10 अंकों का मोबाइल नंबर दर्ज करें"
  ],
  email: ["Email Address", "ಇಮೇಲ್ ವಿಳಾಸ", "ईमेल पता"],
  emailHint: [
    "Enter your email",
    "ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ",
    "अपना ईमेल दर्ज करें"
  ],
  minimum: [
    "Minimum 8 characters",
    "ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳು",
    "कम से कम 8 अक्षर"
  ],
  existing: [
    "Already have an account?",
    "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
    "पहले से खाता है?"
  ],
  loginHere: [
    "Login Here",
    "ಇಲ್ಲಿ ಲಾಗಿನ್ ಮಾಡಿ",
    "यहाँ लॉगिन करें"
  ],
  logging: [
    "Logging in...",
    "ಲಾಗಿನ್ ಆಗುತ್ತಿದೆ...",
    "लॉगिन हो रहा है..."
  ],
  creating: [
    "Creating account...",
    "ಖಾತೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ...",
    "खाता बनाया जा रहा है..."
  ],
  registered: [
    "Account created successfully!",
    "ಖಾತೆ ಯಶಸ್ವಿಯಾಗಿ ತೆರೆಯಲಾಗಿದೆ!",
    "खाता सफलतापूर्वक बन गया!"
  ],
  loginFailed: [
    "Login failed. Check your details.",
    "ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    "लॉगिन विफल। अपना विवरण जांचें।"
  ],
  registerFailed: [
    "Registration failed. Check your details.",
    "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ. ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    "पंजीकरण विफल। अपना विवरण जांचें।"
  ],
  fill: [
    "Please fill in all fields.",
    "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ.",
    "कृपया सभी विवरण भरें।"
  ],
  show: ["Show", "ತೋರಿಸಿ", "दिखाएं"],
  hide: ["Hide", "ಮರೆಮಾಡಿ", "छिपाएं"],
  language: ["Language", "ಭಾಷೆ", "भाषा"],
  logout: ["Logout", "ಲಾಗ್ ಔಟ್", "लॉगआउट"],
  farmer: ["Farmer", "ರೈತ", "किसान"],
  welcome: ["Welcome", "ಸ್ವಾಗತ", "स्वागत है"],

  // DASHBOARD
  heroTag: [
    "SMART AGRICULTURE",
    "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ",
    "स्मार्ट कृषि"
  ],
  heroTitle: [
    "Grow Smart, Earn More",
    "ಜಾಣ್ಮೆಯಿಂದ ಬೆಳೆಸಿ, ಹೆಚ್ಚು ಗಳಿಸಿ",
    "स्मार्ट खेती करें, अधिक कमाएं"
  ],
  hero: [
    "Find the best crops for your farmland.",
    "ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತ ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ.",
    "अपने खेत के लिए उपयुक्त फसलें खोजें।"
  ],
  explore: [
    "Explore Crop Recommendations →",
    "ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ನೋಡಿ →",
    "फसल सुझाव देखें →"
  ],
  form: [
    "🌾 Crop Recommendation",
    "🌾 ಬೆಳೆ ಶಿಫಾರಸು",
    "🌾 फसल सिफारिश"
  ],
  formDesc: [
    "Enter your farm details to find suitable crops.",
    "ಸೂಕ್ತ ಬೆಳೆಗಳನ್ನು ಹುಡುಕಲು ಜಮೀನಿನ ವಿವರ ನೀಡಿ.",
    "उपयुक्त फसल खोजने के लिए खेत का विवरण दें।"
  ],

  // SOIL
  soil: [
    "1. Select Soil Type",
    "1. ಮಣ್ಣಿನ ವಿಧ ಆಯ್ಕೆಮಾಡಿ",
    "1. मिट्टी का प्रकार चुनें"
  ],
  soilDesc: [
    "Select the soil found in your farmland.",
    "ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣಿನ ವಿಧ ಆಯ್ಕೆಮಾಡಿ.",
    "अपने खेत की मिट्टी का प्रकार चुनें।"
  ],
  chooseSoil: [
    "Select soil type",
    "ಮಣ್ಣಿನ ವಿಧ ಆಯ್ಕೆಮಾಡಿ",
    "मिट्टी चुनें"
  ],
  red: ["🔴 Red Soil", "🔴 ಕೆಂಪು ಮಣ್ಣು", "🔴 लाल मिट्टी"],
  black: ["⚫ Black Soil", "⚫ ಕಪ್ಪು ಮಣ್ಣು", "⚫ काली मिट्टी"],
  clay: ["🟤 Clay Soil", "🟤 ಜೇಡಿ ಮಣ್ಣು", "🟤 चिकनी मिट्टी"],
  sandy: ["🟡 Sandy Soil", "🟡 ಮರಳು ಮಣ್ಣು", "🟡 रेतीली मिट्टी"],
  laterite: ["🟠 Laterite Soil", "🟠 ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು", "🟠 लैटेराइट मिट्टी"],
  alluvial: ["🌱 Alluvial Soil", "🌱 ಮೆಕ್ಕಲು ಮಣ್ಣು", "🌱 जलोढ़ मिट्टी"],

  // SEASON
  season: [
    "2. Select Growing Season",
    "2. ಬೆಳೆಯುವ ಕಾಲ ಆಯ್ಕೆಮಾಡಿ",
    "2. फसल का मौसम चुनें"
  ],
  seasonDesc: [
    "Choose the current growing season.",
    "ಪ್ರಸ್ತುತ ಬೆಳೆಯುವ ಕಾಲವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    "वर्तमान फसल का मौसम चुनें।"
  ],
  kharif: ["🌧️ Rainy Season", "🌧️ ಮಳೆಗಾಲ", "🌧️ वर्षा ऋतु"],
  kharifDesc: ["Monsoon / Kharif", "ಮುಂಗಾರು / ಖಾರಿಫ್", "मानसून / खरीफ"],
  rabi: ["🌤️ Winter Season", "🌤️ ಚಳಿಗಾಲ", "🌤️ सर्दी का मौसम"],
  rabiDesc: ["Rabi", "ಹಿಂಗಾರು / ರಬಿ", "रबी"],
  summer: ["☀️ Summer", "☀️ ಬೇಸಿಗೆ", "☀️ गर्मी"],
  summerDesc: ["Hot season", "ಬೇಸಿಗೆ ಕಾಲ", "ग्रीष्म ऋतु"],

  // RAINFALL
  rain: [
    "3. Select Rainfall",
    "3. ಮಳೆಯ ಪ್ರಮಾಣ ಆಯ್ಕೆಮಾಡಿ",
    "3. वर्षा की मात्रा चुनें"
  ],
  rainDesc: [
    "Choose the rainfall in your area.",
    "ನಿಮ್ಮ ಪ್ರದೇಶದ ಮಳೆಯ ಪ್ರಮಾಣ ಆಯ್ಕೆಮಾಡಿ.",
    "अपने क्षेत्र में बारिश की मात्रा चुनें।"
  ],
  lowRain: ["☀️ Low Rain", "☀️ ಕಡಿಮೆ ಮಳೆ", "☀️ कम बारिश"],
  lowRainDesc: ["Very little rain", "ಬಹಳ ಕಡಿಮೆ ಮಳೆ", "बहुत कम बारिश"],
  mediumRain: ["🌦️ Medium Rain", "🌦️ ಮಧ್ಯಮ ಮಳೆ", "🌦️ मध्यम बारिश"],
  mediumRainDesc: ["Normal rainfall", "ಸಾಮಾನ್ಯ ಮಳೆ", "सामान्य बारिश"],
  highRain: ["🌧️ Heavy Rain", "🌧️ ಹೆಚ್ಚು ಮಳೆ", "🌧️ भारी बारिश"],
  highRainDesc: ["Lots of rain", "ಅಧಿಕ ಮಳೆ", "बहुत अधिक बारिश"],

  // WATER
  water: [
    "4. Water Availability",
    "4. ನೀರಿನ ಲಭ್ಯತೆ",
    "4. पानी की उपलब्धता"
  ],
  waterDesc: [
    "Select water availability on your farm.",
    "ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ನೀರಿನ ಲಭ್ಯತೆ ಆಯ್ಕೆಮಾಡಿ.",
    "अपने खेत में पानी की उपलब्धता चुनें।"
  ],
  lowWater: ["💧 Low", "💧 ಕಡಿಮೆ", "💧 कम"],
  lowWaterDesc: ["Very little water", "ಬಹಳ ಕಡಿಮೆ ನೀರು", "बहुत कम पानी"],
  mediumWater: ["🚿 Medium", "🚿 ಮಧ್ಯಮ", "🚿 मध्यम"],
  mediumWaterDesc: ["Some water", "ಸ್ವಲ್ಪ ನೀರು", "कुछ पानी"],
  highWater: ["🌊 High", "🌊 ಹೆಚ್ಚು", "🌊 अधिक"],
  highWaterDesc: ["Plenty of water", "ಸಾಕಷ್ಟು ನೀರು", "पर्याप्त पानी"],

  // LAND SIZE
  land: [
    "5. Land Size",
    "5. ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ",
    "5. जमीन का आकार"
  ],
  landDesc: [
    "Enter your farmland size.",
    "ನಿಮ್ಮ ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ನಮೂದಿಸಿ.",
    "अपने खेत का आकार दर्ज करें।"
  ],
  landHint: [
    "Enter land size",
    "ಜಮೀನಿನ ಅಳತೆ ನಮೂದಿಸಿ",
    "जमीन का आकार दर्ज करें"
  ],
  acre: ["Acre", "ಎಕರೆ", "एकड़"],
  gunta: ["Gunta", "ಗುಂಟೆ", "गुंटा"],
  conversion: [
    "1 Acre = 40 Gunta",
    "1 ಎಕರೆ = 40 ಗುಂಟೆ",
    "1 एकड़ = 40 गुंटा"
  ],
  submit: [
    "🌱 GET CROP RECOMMENDATIONS",
    "🌱 ಬೆಳೆ ಶಿಫಾರಸುಗಳನ್ನು ಪಡೆಯಿರಿ",
    "🌱 फसल सिफारिशें प्राप्त करें"
  ],
  loading: [
    "Finding crops...",
    "ಬೆಳೆಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
    "फसलें खोजी जा रही हैं..."
  ],

  // RESULTS
  results: [
    "Crop Comparison & Recommendations",
    "ಬೆಳೆ ಹೋಲಿಕೆ ಮತ್ತು ಶಿಫಾರಸುಗಳು",
    "फसल तुलना और सिफारिशें"
  ],
  description: [
    "Compare suitable crops and estimated profits.",
    "ಸೂಕ್ತ ಬೆಳೆಗಳು ಮತ್ತು ಅಂದಾಜು ಲಾಭವನ್ನು ಹೋಲಿಸಿ.",
    "उपयुक्त फसलों और अनुमानित लाभ की तुलना करें।"
  ],
 best: [
    "🏆 MOST SUITABLE CROP",
    "🏆 ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ಬೆಳೆ",
    "🏆 सबसे उपयुक्त फसल"
],
  investment: ["Investment", "ಹೂಡಿಕೆ", "निवेश"],
  income: ["Income", "ಆದಾಯ", "आय"],
  profit: ["Profit", "ಲಾಭ", "लाभ"],
  loss: ["Loss", "ನಷ್ಟ", "नुकसान"],
  profitLoss: ["Profit / Loss", "ಲಾಭ / ನಷ್ಟ", "लाभ / नुकसान"],
  suitability: ["Suitability", "ಹೊಂದಾಣಿಕೆ", "अनुकूलता"],
  duration: [
    "Growing Duration",
    "ಬೆಳೆ ಬೆಳೆಯುವ ಅವಧಿ",
    "फसल उगाने की अवधि"
],
notAvailable: [
    "Not available",
    "ಲಭ್ಯವಿಲ್ಲ",
    "उपलब्ध नहीं"
],
  crop: ["Crop", "ಬೆಳೆ", "फसल"],
  noResults: [
    "No suitable crops found. Try different farm details.",
    "ಸೂಕ್ತ ಬೆಳೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಬೇರೆ ವಿವರಗಳನ್ನು ಪ್ರಯತ್ನಿಸಿ.",
    "कोई उपयुक्त फसल नहीं मिली। अन्य विवरण आजमाएं।"
  ],
  disclaimer: [
    "Note: These are approximate estimates, not guaranteed results. Consult local agricultural experts.",
    "ಸೂಚನೆ: ಇವು ಅಂದಾಜು ಲೆಕ್ಕಾಚಾರಗಳು ಮಾತ್ರ. ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    "नोट: ये केवल अनुमान हैं, गारंटी नहीं। स्थानीय कृषि विशेषज्ञ से सलाह लें।"
  ],

  // CROP NAMES
  maize: ["Maize", "ಮೆಕ್ಕೆಜೋಳ", "मक्का"],
  groundnut: ["Groundnut", "ನೆಲಗಡಲೆ", "मूंगफली"],
  ragi: ["Ragi", "ರಾಗಿ", "रागी"],
  paddy: ["Paddy", "ಭತ್ತ", "धान"],
  greenGram: ["Green Gram", "ಹೆಸರುಕಾಳು", "मूंग"],
  cotton: ["Cotton", "ಹತ್ತಿ", "कपास"],

  // VOICE ASSISTANT
  voice: [
    "🎙️ SmartCrop Voice Assistant",
    "🎙️ SmartCrop ಧ್ವನಿ ಸಹಾಯಕ",
    "🎙️ SmartCrop आवाज सहायक"
  ],
  voiceLanguage: [
    "Choose voice language",
    "ಧ್ವನಿಯ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ",
    "आवाज की भाषा चुनें"
  ],
  voiceButton: [
    "🎤 Speak Your Question",
    "🎤 ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ",
    "🎤 अपना प्रश्न बोलें"
  ],
  listen: [
    "🔊 Listen to Answer",
    "🔊 ಉತ್ತರವನ್ನು ಆಲಿಸಿ",
    "🔊 उत्तर सुनें"
  ],
  ready: [
    "Ready to help you.",
    "ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧವಾಗಿದೆ.",
    "मदद के लिए तैयार है।"
  ],
  listening: [
    "Listening...",
    "ನಿಮ್ಮ ಮಾತನ್ನು ಕೇಳುತ್ತಿದೆ...",
    "सुन रहा है..."
  ],
  voiceError: [
    "Voice recognition failed. Try again.",
    "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    "आवाज पहचानने में समस्या हुई। फिर प्रयास करें।"
  ],
  unsupported: [
    "Voice recognition is not supported in this browser.",
    "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ.",
    "इस ब्राउज़र में आवाज पहचान उपलब्ध नहीं है।"
  ],
  speechError: [
    "Speech playback is not available.",
    "ಧ್ವನಿ ಪ್ಲೇಬ್ಯಾಕ್ ಲಭ್ಯವಿಲ್ಲ.",
    "आवाज में उत्तर सुनने की सुविधा उपलब्ध नहीं है।"
  ],

  // CHATBOT
  chat: [
    "🤖 SmartCrop Farming Assistant",
    "🤖 SmartCrop ಕೃಷಿ ಸಹಾಯಕ",
    "🤖 SmartCrop कृषि सहायक"
  ],
  greeting: [
    "👋 Hello! Ask me your farming questions.",
    "👋 ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.",
    "👋 नमस्ते! खेती के बारे में प्रश्न पूछें।"
  ],
  placeholder: [
    "Ask a farming question...",
    "ಕೃಷಿಯ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ...",
    "खेती के बारे में प्रश्न पूछें..."
  ],
  send: ["Send ➤", "ಕಳುಹಿಸಿ ➤", "भेजें ➤"],
  you: ["You", "ನೀವು", "आप"],
  error: [
    "Something went wrong. Please try again.",
    "ತೊಂದರೆ ಉಂಟಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    "कुछ समस्या हुई। फिर से प्रयास करें।"
  ],
  serverError: [
    "Server returned an invalid response. Check the Node.js server.",
    "ಸರ್ವರ್‌ನಿಂದ ತಪ್ಪಾದ ಪ್ರತಿಕ್ರಿಯೆ ಬಂದಿದೆ. Node.js ಸರ್ವರ್ ಪರಿಶೀಲಿಸಿ.",
    "सर्वर से गलत उत्तर मिला। Node.js सर्वर जांचें।"
  ],
  invalid: [
    "Please enter all farm details correctly.",
    "ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಸರಿಯಾಗಿ ನಮೂದಿಸಿ.",
    "कृपया खेत का पूरा विवरण सही से भरें।"
  ],
  footer: [
    "© 2026 SmartCrop | Smart Farming for Better Future",
    "© 2026 SmartCrop | ಉತ್ತಮ ಭವಿಷ್ಯಕ್ಕಾಗಿ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ",
    "© 2026 SmartCrop | बेहतर भविष्य के लिए स्मार्ट खेती"
  ]
};

// ==========================================
// LANGUAGE MANAGEMENT
// ==========================================

const languages = ["en", "kn", "hi"];

let selectedLanguage = "en";

try {
  const saved = localStorage.getItem("smartcropLanguage");
  if (languages.includes(saved)) {
    selectedLanguage = saved;
  }
} catch (error) {
  console.log("Language storage unavailable");
}

function lang() {
  return selectedLanguage;
}

function tr(key, language = lang()) {
  const index = languages.indexOf(language);
  return words[key]?.[index < 0 ? 0 : index] || key;
}

function setText(id, value) {
  if ($(id)) $(id).textContent = value;
}

function setSelector(selector, key) {
  const element = document.querySelector(selector);
  if (element) element.textContent = tr(key);
}

function setPlaceholder(id, key) {
  if ($(id)) $(id).placeholder = tr(key);
}

function createElement(tag, text, className) {
  const element = document.createElement(tag);

  if (text !== undefined) {
    element.textContent = text;
  }

  if (className) {
    element.className = className;
  }

  return element;
}

// ==========================================
// LOGIN LANGUAGE SELECTOR
// ==========================================

function addLoginLanguageSelector() {
  const card = document.querySelector(".auth-card");

  if (!card || $("authLanguage")) return;

  const wrapper = document.createElement("div");

  wrapper.style.cssText = `
    display:flex;
    justify-content:flex-end;
    margin-bottom:18px;
  `;

  const select = document.createElement("select");
  select.id = "authLanguage";
  select.setAttribute("aria-label", "Language");

  select.style.cssText = `
    width:145px;
    padding:9px 12px;
    font-size:14px;
    color:#14532d;
    font-weight:600;
    background:#f0f8f2;
    border:1px solid #d5e2d9;
    border-radius:8px;
  `;

  select.innerHTML = `
    <option value="en">English</option>
    <option value="kn">ಕನ್ನಡ</option>
    <option value="hi">हिन्दी</option>
  `;

  select.value = lang();

  select.addEventListener("change", () => {
    changeLanguage(select.value);
  });

  wrapper.appendChild(select);
  card.prepend(wrapper);
}

// ==========================================
// SHOW / HIDE PASSWORD
// ==========================================

function addPasswordToggle(inputId) {
  const input = $(inputId);

  if (!input || $(inputId + "Toggle")) return;

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";

  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);

  input.style.paddingRight = "85px";

  const button = document.createElement("button");

  button.type = "button";
  button.id = inputId + "Toggle";
  button.textContent = tr("show");

  button.style.cssText = `
    position:absolute;
    right:8px;
    top:50%;
    transform:translateY(-50%);
    background:transparent;
    color:#198754;
    font-size:12px;
    padding:8px;
    box-shadow:none;
  `;

  button.addEventListener("click", () => {
    input.type =
      input.type === "password" ? "text" : "password";

    button.textContent =
      input.type === "password" ? tr("show") : tr("hide");
  });

  wrapper.appendChild(button);
}

// ==========================================
// TRANSLATE LOGIN AND REGISTRATION
// ==========================================

function translateAuth() {
  setSelector(".auth-subtitle", "tagline");
  setSelector("#loginForm h2", "loginTitle");
  setSelector("#loginForm h2 + p", "loginDesc");
  setSelector("#registerForm h2", "create");
  setSelector("#registerForm h2 + p", "registerDesc");

  const loginLabels =
    document.querySelectorAll("#loginForm label");

  ["identifier", "password"].forEach((key, i) => {
    if (loginLabels[i]) {
      loginLabels[i].textContent = tr(key);
    }
  });

  const registerLabels =
    document.querySelectorAll("#registerForm label");

  ["name", "mobile", "email", "password"].forEach((key, i) => {
    if (registerLabels[i]) {
      registerLabels[i].textContent = tr(key);
    }
  });

  setPlaceholder("loginIdentifier", "identifierHint");
  setPlaceholder("loginPassword", "passwordHint");
  setPlaceholder("registerName", "nameHint");
  setPlaceholder("registerMobile", "mobileHint");
  setPlaceholder("registerEmail", "emailHint");
  setPlaceholder("registerPassword", "minimum");

  setText("loginBtn", tr($("loginBtn")?.disabled ? "logging" : "login"));
  setText("registerBtn", tr($("registerBtn")?.disabled ? "creating" : "create"));

  const loginSwitch =
    document.querySelector("#loginForm .auth-switch");

  if (loginSwitch && $("showRegister")) {
    const link = $("showRegister");
    link.textContent = tr("create");

    loginSwitch.replaceChildren(
      document.createTextNode(tr("newFarmer") + " "),
      link
    );
  }

  const registerSwitch =
    document.querySelector("#registerForm .auth-switch");

  if (registerSwitch && $("showLogin")) {
    const link = $("showLogin");
    link.textContent = tr("loginHere");

    registerSwitch.replaceChildren(
      document.createTextNode(tr("existing") + " "),
      link
    );
  }

  ["loginPassword", "registerPassword"].forEach(id => {
    setText(
      id + "Toggle",
      tr($(id)?.type === "text" ? "hide" : "show")
    );
  });

  if ($("authLanguage")) {
    $("authLanguage").setAttribute("aria-label", tr("language"));
  }

  // Translate the login card footer
  let style = $("translatedAuthFooter");

  if (!style) {
    style = document.createElement("style");
    style.id = "translatedAuthFooter";
    document.head.appendChild(style);
  }

  style.textContent =
    `.auth-card::after { content: ${JSON.stringify("SmartCrop • " + tr("tagline"))}; }`;
}

// ==========================================
// TRANSLATE FARM DASHBOARD
// ==========================================

function translateDashboard() {
  setText(
    "farmerWelcome",
    tr("welcome") + ", " +
    (currentUser?.name || tr("farmer")) + " 👨‍🌾"
  );

  setText("logoutBtn", tr("logout"));
  setText("welcomeTitle", tr("heroTitle"));
  setText("welcomeText", tr("hero"));

  setSelector(".hero-tag", "heroTag");
  setSelector(".hero-button", "explore");
  setSelector(".farm-panel .section-heading h2", "form");
  setSelector(".farm-panel .section-heading p", "formDesc");

  const sections = document.querySelectorAll(
    "#cropForm .form-section"
  );

  const keys = [
    ["soil", "soilDesc"],
    ["season", "seasonDesc"],
    ["rain", "rainDesc"],
    ["water", "waterDesc"],
    ["land", "landDesc"]
  ];

 const originalSections = Array.from(sections).filter(
    section =>
        !section.querySelector("#district") &&
        !section.querySelector("#durationTitle") &&
        !section.querySelector("#cropCategoryTitle")
);

originalSections.forEach((section, i) => {
    if (!keys[i]) return;

    const heading = section.querySelector(".step-heading h3");
    const description = section.querySelector(".step-heading p");

    if (heading) heading.textContent = tr(keys[i][0]);
    if (description) description.textContent = tr(keys[i][1]);
});;

  // Translate soil options
  if ($("soil")) {
    Array.from($("soil").options).forEach(option => {
      option.textContent = tr(option.value || "chooseSoil");
    });
  }

  // Translate season, rainfall and water cards
  const choices = [
    ["seasonChoice", "kharif", "kharif", "kharifDesc"],
    ["seasonChoice", "rabi", "rabi", "rabiDesc"],
    ["seasonChoice", "summer", "summer", "summerDesc"],

    ["rainChoice", "400", "lowRain", "lowRainDesc"],
    ["rainChoice", "800", "mediumRain", "mediumRainDesc"],
    ["rainChoice", "1400", "highRain", "highRainDesc"],

    ["waterChoice", "low", "lowWater", "lowWaterDesc"],
    ["waterChoice", "medium", "mediumWater", "mediumWaterDesc"],
    ["waterChoice", "high", "highWater", "highWaterDesc"]
  ];

  choices.forEach(([name, value, title, desc]) => {
    const input = document.querySelector(
      `input[name="${name}"][value="${value}"]`
    );

    const card = input?.closest(".choice-card");

    if (!card) return;

    const strong = card.querySelector("strong");
    const small = card.querySelector("small");

    if (strong) strong.textContent = tr(title);
    if (small) small.textContent = tr(desc);
  });

  // Land size
  setPlaceholder("landSize", "landHint");

  if ($("landUnit")) {
    Array.from($("landUnit").options).forEach(option => {
      option.textContent = tr(option.value);
    });
  }

  setSelector(".land-hint", "conversion");

  setText(
    "submitBtn",
    tr($("submitBtn")?.disabled ? "loading" : "submit")
  );

  // Voice assistant
  setSelector(".assistant-panel h2", "voice");
  setSelector('label[for="voiceLanguage"]', "voiceLanguage");

  setText("micBtn", tr("voiceButton"));
  setText("speakAnswerBtn", tr("listen"));
  setText("voiceStatus", tr("ready"));

  if ($("voiceLanguage")) {
    $("voiceLanguage").value = lang() + "-IN";

    const voiceNames = {
      "en-IN": "English",
      "kn-IN": "ಕನ್ನಡ",
      "hi-IN": "हिन्दी"
    };

    Array.from($("voiceLanguage").options).forEach(option => {
      option.textContent =
        voiceNames[option.value] || option.textContent;
    });
  }

  // Chatbot
  setSelector(".chatbot-panel h2", "chat");
  setPlaceholder("chatInput", "placeholder");
  setText("sendBtn", tr("send"));

  if ($("chatMessages")) {
    if ($("chatMessages").children.length === 0) {
      addChatMessage("assistant", tr("greeting"), true);
    }

    $("chatMessages").querySelectorAll("[data-sender]")
      .forEach(message => {
        const label = message.querySelector("strong");
        const body = message.querySelector("span");

        if (label) {
          label.textContent =
            message.dataset.sender === "user"
              ? tr("you") + ": "
              : "SmartCrop: ";
        }

        if (message.dataset.greeting === "true" && body) {
          body.textContent = tr("greeting");
        }
      });
  }

  setSelector("footer p", "footer");
  setSelector("footer small", "disclaimer");

  if (lastResults !== null) {
   displayResults(lastResults, lastBestCrop, lastAlternatives);
  }
}

// ==========================================
// CHANGE LANGUAGE
// ==========================================

function changeLanguage(language = selectedLanguage) {
  selectedLanguage =
    languages.includes(language) ? language : "en";

  document.documentElement.lang = selectedLanguage;

  try {
    localStorage.setItem(
      "smartcropLanguage",
      selectedLanguage
    );
  } catch (error) {
    console.log("Language could not be saved");
  }

  if ($("language")) {
    $("language").value = selectedLanguage;
  }

  if ($("authLanguage")) {
    $("authLanguage").value = selectedLanguage;
  }
translateAuth();
translateDashboard();
updateDistrictLanguage();
updateCropCategoryLanguage();
updateDurationLanguage();
updateGPSLanguage();
}

// ==========================================
// SAFE SERVER REQUEST
// ==========================================

async function api(url, data, fallback = "error") {
  const options = {
    credentials: "same-origin"
  };

  if (data !== undefined) {
    options.method = "POST";
    options.headers = {
      "Content-Type": "application/json"
    };
    options.body = JSON.stringify(data);
  }

  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    console.error(error);
    throw new Error(tr("serverError"));
  }

  const type = response.headers.get("content-type") || "";

  if (!type.includes("application/json")) {
    console.error("Invalid server response:", url, response.status);
    throw new Error(tr("serverError"));
  }

  const result = await response.json();

  if (!response.ok || !result.success) {
    console.error("API error:", url, result.message);

    throw new Error(
      lang() === "en"
        ? result.message || tr(fallback)
        : tr(fallback)
    );
  }

  return result;
}

// ==========================================
// LOGIN AND REGISTRATION
// ==========================================

function showAuthMessage(id, message, success = false) {
  if (!$(id)) return;

  $(id).textContent = message;
  $(id).style.color = success ? "#198754" : "#d62828";
}

function showLoginScreen() {
  currentUser = null;

  $("authSection").hidden = false;
  $("appSection").hidden = true;
  $("loginForm").hidden = false;
  $("registerForm").hidden = true;

  showAuthMessage("loginMessage", "");

  changeLanguage();
}

function showRegisterScreen() {
  $("loginForm").hidden = true;
  $("registerForm").hidden = false;

  showAuthMessage("registerMessage", "");

  changeLanguage();
}

function showAppScreen(user) {
  currentUser = user || {};

  $("authSection").hidden = true;
  $("appSection").hidden = false;

  $("loginPassword").value = "";
  $("registerPassword").value = "";

  changeLanguage();
}

async function checkLogin() {
  try {
    const result = await api("/api/me");

    if (result.user) {
      showAppScreen(result.user);
    } else {
      showLoginScreen();
    }
  } catch (error) {
    showLoginScreen();
  }
}

$("showRegister")?.addEventListener("click", event => {
  event.preventDefault();
  showRegisterScreen();
});

$("showLogin")?.addEventListener("click", event => {
  event.preventDefault();
  showLoginScreen();
});

// REGISTER

$("registerForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const name = $("registerName").value.trim();
  const mobile = $("registerMobile").value.trim();
  const email = $("registerEmail").value.trim();
  const password = $("registerPassword").value;

  if (!name || !mobile || !email || !password) {
    showAuthMessage("registerMessage", tr("fill"));
    return;
  }

  const button = $("registerBtn");

  button.disabled = true;
  button.textContent = tr("creating");

  showAuthMessage("registerMessage", "");

  try {
    const result = await api(
      "/api/register",
      {
        name,
        mobile,
        email,
        password,
        language: lang()
      },
      "registerFailed"
    );

    $("registerForm").reset();

    if (result.user) {
      showAppScreen(result.user);
    } else {
      showLoginScreen();

      showAuthMessage(
        "loginMessage",
        tr("registered"),
        true
      );
    }

  } catch (error) {
    showAuthMessage("registerMessage", error.message);
  } finally {
    button.disabled = false;
    button.textContent = tr("create");
  }
});

// LOGIN

$("loginForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const identifier = $("loginIdentifier").value.trim();
  const password = $("loginPassword").value;

  if (!identifier || !password) {
    showAuthMessage("loginMessage", tr("fill"));
    return;
  }

  const button = $("loginBtn");

  button.disabled = true;
  button.textContent = tr("logging");

  showAuthMessage("loginMessage", "");

  try {
    const result = await api(
      "/api/login",
      {
        identifier,
        password,
        language: lang()
      },
      "loginFailed"
    );

    showAppScreen(result.user);

  } catch (error) {
    showAuthMessage("loginMessage", error.message);
  } finally {
    button.disabled = false;
    button.textContent = tr("login");
  }
});

// LOGOUT

$("logoutBtn")?.addEventListener("click", async () => {
  try {
    await api("/api/logout", {});

    lastResults = null;
    lastBestCrop = null;

    $("results").replaceChildren();
    $("chatMessages").replaceChildren();
    $("voiceAnswer").textContent = "";
    $("voiceTranscript").textContent = "";

    $("cropForm").reset();
    $("season").value = "";
    $("rainfall").value = "";
    $("water").value = "";

    $("loginPassword").value = "";

    window.speechSynthesis?.cancel();

    showLoginScreen();

  } catch (error) {
    alert(error.message);
  }
});

// ==========================================
// FARM SELECTION BUTTONS
// ==========================================

const inputGroups = {
  seasonChoice: "season",
  rainChoice: "rainfall",
  waterChoice: "water"
};

Object.entries(inputGroups).forEach(([name, target]) => {
  document.querySelectorAll(`input[name="${name}"]`)
    .forEach(input => {
      input.addEventListener("change", () => {
        $(target).value = input.value;
      });
    });
});

// ==========================================
// CROP NAME AND MONEY FORMAT
// ==========================================

function cropName(crop) {
  const id = crop.id || crop.name || "";

  const normalized = id
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  const mapping = {
    maize: "maize",
    groundnut: "groundnut",
    ragi: "ragi",
    paddy: "paddy",
    rice: "paddy",
    greengram: "greenGram",
    cotton: "cotton"
  };

  const key = mapping[normalized];

  return key ? tr(key) : crop.name || id;
}


function money(value) {
  if (!Number.isFinite(value)) {
    const unavailable = {
      en: "Not available",
      kn: "ಲಭ್ಯವಿಲ್ಲ",
      hi: "उपलब्ध नहीं"
    };

    return unavailable[lang()] || unavailable.en;
  }

  return "₹" + value.toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}


// ==========================================
// CROP RECOMMENDATION RESULTS
// ==========================================

function displayResults(data, bestCrop = null, alternatives = []) {
  const results = $("results");

  results.replaceChildren();

  const heading = createElement(
    "div",
    undefined,
    "section-heading"
  );

  heading.append(
    createElement("h2", tr("results")),
    createElement("p", tr("description"))
  );

  results.appendChild(heading);

  if (!Array.isArray(data) || data.length === 0) {

    results.appendChild(
        createElement("p", tr("noResults"))
    );

    const labels = {
        en: {
            title: "⚠️ Conditional Crop Alternatives",
            warning: "These crops require changes to your farming conditions.",
            condition: "Conditions not matched",
            empty: "No close alternatives found. Review your farm requirements."
        },
        kn: {
            title: "⚠️ ಷರತ್ತುಬದ್ಧ ಪರ್ಯಾಯ ಬೆಳೆಗಳು",
            warning: "ಈ ಬೆಳೆಗಳನ್ನು ಬೆಳೆಯಲು ಕೃಷಿ ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಬದಲಾವಣೆ ಅಗತ್ಯವಿದೆ.",
            condition: "ಹೊಂದಿಕೆಯಾಗದ ಪರಿಸ್ಥಿತಿಗಳು",
            empty: "ಪರ್ಯಾಯ ಬೆಳೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಕೃಷಿ ಪರಿಸ್ಥಿತಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."
        },
        hi: {
            title: "⚠️ सशर्त वैकल्पिक फसलें",
            warning: "इन फसलों के लिए खेती की परिस्थितियों में बदलाव आवश्यक है।",
            condition: "मेल न खाने वाली परिस्थितियां",
            empty: "कोई करीबी विकल्प नहीं मिला। खेती की परिस्थितियों की समीक्षा करें।"
        }
    };

    const text = labels[lang()] || labels.en;

    const box = document.createElement("div");

    box.style.cssText = `
        background: #fff8e1;
        border-left: 5px solid #e6a700;
        padding: 20px;
        margin: 20px 0;
        border-radius: 12px;
        line-height: 1.8;
        color: #664d03;
    `;

    box.appendChild(
        createElement("h3", text.title)
    );

    if (Array.isArray(alternatives) &&
        alternatives.length > 0) {

        box.appendChild(
            createElement("p", text.warning)
        );

        alternatives.forEach(crop => {

            const item = document.createElement("div");

            item.style.cssText = `
                background: white;
                padding: 15px;
                margin-top: 15px;
                border-radius: 10px;
                border: 1px solid #e6d6a5;
            `;

            item.appendChild(
                createElement(
                    "h3",
                    "🌱 " + (crop.names?.[lang()] || cropName(crop))
                )
            );

            item.appendChild(
                createElement("strong", text.condition)
            );
            // SMART FARMING SOLUTIONS

const solutionLabels = {
    en: {
        title: "💡 Suggested Solution",
        soil: "Choose a crop suitable for your existing soil. Test the soil before making changes.",
        season: "Consider growing this crop during its suitable planting season.",
        water: "Check the crop's irrigation and drainage requirements before planting.",
        rainfall: "Check rainfall requirements and whether suitable irrigation or drainage is available.",
        category: "Try selecting another crop category or All Crops.",
        duration: "Check the crop's growing period and select a suitable duration."
    },

    kn: {
        title: "💡 ಸೂಚಿಸಿದ ಪರಿಹಾರ",
        soil: "ನಿಮ್ಮ ಮಣ್ಣಿಗೆ ಸೂಕ್ತವಾದ ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಬದಲಾವಣೆ ಮಾಡುವ ಮೊದಲು ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ.",
        season: "ಈ ಬೆಳೆಯನ್ನು ಸೂಕ್ತವಾದ ಕೃಷಿ ಋತುವಿನಲ್ಲಿ ಬೆಳೆಯಲು ಪರಿಗಣಿಸಿ.",
        water: "ಬಿತ್ತನೆ ಮಾಡುವ ಮೊದಲು ನೀರಾವರಿ ಮತ್ತು ನೀರು ಬಸಿದು ಹೋಗುವ ವ್ಯವಸ್ಥೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
        rainfall: "ಬೆಳೆಗೆ ಅಗತ್ಯವಿರುವ ಮಳೆ, ನೀರಾವರಿ ಮತ್ತು ನೀರು ಬಸಿದು ಹೋಗುವ ವ್ಯವಸ್ಥೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
        category: "ಬೇರೆ ಬೆಳೆ ವರ್ಗ ಅಥವಾ ಎಲ್ಲಾ ಬೆಳೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
        duration: "ಬೆಳೆಯ ಅವಧಿಯನ್ನು ಪರಿಶೀಲಿಸಿ ಸೂಕ್ತವಾದ ಅವಧಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ."
    },

    hi: {
        title: "💡 सुझाया गया समाधान",
        soil: "अपनी मिट्टी के अनुकूल फसल चुनें। बदलाव से पहले मिट्टी की जांच कराएं।",
        season: "इस फसल को उपयुक्त कृषि मौसम में उगाने पर विचार करें।",
        water: "बुवाई से पहले सिंचाई और जल निकासी की आवश्यकताओं की जांच करें।",
        rainfall: "वर्षा, सिंचाई और जल निकासी की आवश्यकताओं की जांच करें।",
        category: "दूसरी फसल श्रेणी या सभी फसलें चुनें।",
        duration: "फसल की अवधि जांचें और उपयुक्त अवधि चुनें।"
    }
};

// END SMART FARMING SOLUTIONS
const mismatchLabels = {
    en: {
        soil: "Soil type does not match.",
        season: "Growing season does not match.",
        water: "Water availability does not match.",
        rainfall: "Rainfall requirement does not match.",
        category: "Selected crop category does not match.",
        duration: "Selected growing duration does not match."
    },
    kn: {
        soil: "ಮಣ್ಣಿನ ಪ್ರಕಾರ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.",
        season: "ಕೃಷಿ ಋತು ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.",
        water: "ನೀರಿನ ಲಭ್ಯತೆ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.",
        rainfall: "ಮಳೆಯ ಪ್ರಮಾಣ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.",
        category: "ಆಯ್ಕೆ ಮಾಡಿದ ಬೆಳೆ ವರ್ಗ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.",
        duration: "ಬೆಳೆ ಬೆಳೆಯುವ ಅವಧಿ ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ."
    },
    hi: {
        soil: "मिट्टी का प्रकार मेल नहीं खाता।",
        season: "कृषि मौसम मेल नहीं खाता।",
        water: "पानी की उपलब्धता मेल नहीं खाती।",
        rainfall: "वर्षा की आवश्यकता मेल नहीं खाती।",
        category: "चुनी गई फसल श्रेणी मेल नहीं खाती।",
        duration: "फसल की अवधि मेल नहीं खाती।"
    }
};
            (crop.mismatches || []).forEach(reason => {
                item.appendChild(
                    createElement(
                        "p",
                        "⚠️ " + (
                            typeof reason === "string"
                            ? (mismatchLabels[lang()]?.[reason] || reason)
                            : reason?.[lang()] ||
                              reason?.en ||
                              JSON.stringify(reason)
                        )
                    )
                );
            });
            // CROP CONDITION ANALYSIS

const analysisLabels = {
    en: {
        title: "📊 Crop Condition Analysis",
        matched: "Conditions matched",
        soil: "Soil type",
        season: "Growing season",
        water: "Water availability",
        rainfall: "Rainfall",
        category: "Crop category",
        duration: "Growing duration"
    },
    kn: {
        title: "📊 ಬೆಳೆ ಪರಿಸ್ಥಿತಿ ವಿಶ್ಲೇಷಣೆ",
        matched: "ಹೊಂದಿಕೆಯಾಗುವ ಪರಿಸ್ಥಿತಿಗಳು",
        soil: "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
        season: "ಕೃಷಿ ಋತು",
        water: "ನೀರಿನ ಲಭ್ಯತೆ",
        rainfall: "ಮಳೆಯ ಪ್ರಮಾಣ",
        category: "ಬೆಳೆ ವರ್ಗ",
        duration: "ಬೆಳೆ ಬೆಳೆಯುವ ಅವಧಿ"
    },
    hi: {
        title: "📊 फसल स्थिति विश्लेषण",
        matched: "मेल खाने वाली स्थितियां",
        soil: "मिट्टी का प्रकार",
        season: "खेती का मौसम",
        water: "पानी की उपलब्धता",
        rainfall: "वर्षा",
        category: "फसल श्रेणी",
        duration: "फसल की अवधि"
    }
};

const analysisText =
    analysisLabels[lang()] || analysisLabels.en;

const conditionKeys = [
    "soil",
    "season",
    "water",
    "rainfall",
    "category",
    "duration"
];

if (crop.checks && conditionKeys.every(
    key => typeof crop.checks[key] === "boolean"
)) {

    const matchedCount = conditionKeys.filter(
        key => crop.checks[key] === true
    ).length;

    const matchPercent = Math.round(
        matchedCount / conditionKeys.length * 100
    );

    const analysisBox = document.createElement("div");

    analysisBox.style.cssText = `
        background: #f4f7fb;
        padding: 15px;
        border-radius: 10px;
        margin-top: 15px;
        color: #243447;
    `;

    analysisBox.appendChild(
        createElement("h4", analysisText.title)
    );

    analysisBox.appendChild(
        createElement(
            "p",
            analysisText.matched + ": " +
            matchedCount + "/6 (" +
            matchPercent + "%)"
        )
    );

    const progressTrack = document.createElement("div");

    progressTrack.style.cssText = `
        background: #e5e7eb;
        height: 14px;
        border-radius: 10px;
        overflow: hidden;
        margin: 12px 0;
    `;

    const progressFill = document.createElement("div");

    progressFill.style.width = matchPercent + "%";
    progressFill.style.height = "100%";

    progressFill.style.background =
        matchedCount === 6 ? "#198754" :
        matchedCount === 5 ? "#eab308" :
        "#ea580c";

    progressTrack.appendChild(progressFill);
    analysisBox.appendChild(progressTrack);

    conditionKeys.forEach(key => {

        const isMatched = crop.checks[key];

        const conditionLine = createElement(
            "p",
            (isMatched ? "✅ " : "❌ ") +
            analysisText[key]
        );

        conditionLine.style.color =
            isMatched ? "#198754" : "#b91c1c";

        analysisBox.appendChild(conditionLine);
    });

    item.appendChild(analysisBox);
}

// END CROP CONDITION ANALYSIS
// DISPLAY SUGGESTED SOLUTIONS

const solutionText =
    solutionLabels[lang()] || solutionLabels.en;

const solutionBox = document.createElement("div");

solutionBox.style.cssText = `
    background: #edf7ee;
    border-left: 4px solid #198754;
    padding: 12px;
    margin-top: 12px;
    border-radius: 8px;
    color: #14532d;
`;

const solutions = (crop.mismatches || [])
    .map(reason => solutionText[reason])
    .filter(Boolean);

if (solutions.length > 0) {

    solutionBox.appendChild(
        createElement("strong", solutionText.title)
    );

    solutions.forEach(solution => {
        solutionBox.appendChild(
            createElement("p", "👉 " + solution)
        );
    });

    item.appendChild(solutionBox);
}

// END SUGGESTED SOLUTIONS
            box.appendChild(item);
        });

    } else {
        box.appendChild(
            createElement("p", text.empty)
        );
    }

    results.appendChild(box);

    return;
}

const sorted = [...data].sort((a, b) => {
  const localDifference =
    Number(Boolean(b.localPriority)) -
    Number(Boolean(a.localPriority));

if (localDifference !== 0) {
    return localDifference;
}

    const scoreDifference =
        Number(b.score) - Number(a.score);

    if (scoreDifference !== 0) {
        return scoreDifference;
    }

    const aHasProfit = Number.isFinite(a.profit);
    const bHasProfit = Number.isFinite(b.profit);

    if (aHasProfit !== bHasProfit) {
        return aHasProfit ? -1 : 1;
    }

    return (b.profit ?? 0) - (a.profit ?? 0);
});

 
const best = sorted[0];

const card = createElement(
  "div",
  undefined,
  "crop-card best-crop-card"
);

const profit = best.profit;
const hasProfit = Number.isFinite(profit);

const cardTitle = {
    en: "🏆 Most Suitable Crop",
    kn: "🏆 ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ಬೆಳೆ",
    hi: "🏆 सबसे उपयुक्त फसल"
}[lang()];
card.append(
  createElement("h2", cardTitle),
  createElement("h3", cropName(best)),
  createElement(
    "p",
    ({
        en: "⏳ Growing duration",
        kn: "⏳ ಬೆಳೆ ಬೆಳೆಯುವ ಅವಧಿ",
        hi: "⏳ फसल उगाने की अवधि"
    }[lang()]) + ": " +
    (best.durations?.[lang()] || best.duration || tr("notAvailable"))
),
  createElement(
    "p",
    tr("investment") + ": " + money(best.cost)
  ),
  createElement(
    "p",
    tr("income") + ": " + money(best.income)
  ),
  createElement(
    "p",
    tr(hasProfit
      ? (profit >= 0 ? "profit" : "loss")
      : "profitLoss") +
    ": " +
    (hasProfit ? money(Math.abs(profit)) : money(null)),
    hasProfit
      ? (profit >= 0 ? "profit-value" : "loss-value")
      : ""
  ),
  createElement(
    "p",
    tr("suitability") + ": " +
    (Number(best.score) || 0) + "%"
  )
);

results.appendChild(card);
// WHY THIS CROP IS RECOMMENDED
const reasonLabels = {
    en: {
        title: "Why This Crop Is Recommended",
        soil: "Matches your soil type",
        season: "Matches your growing season",
        rain: "Matches rainfall requirements",
        water: "Matches water availability",
        district: "Preferred crop in your district",
        note: "Based on SmartCrop database rules."
    },
    kn: {
        title: "ಈ ಬೆಳೆಯನ್ನು ಏಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ?",
        soil: "ನಿಮ್ಮ ಮಣ್ಣಿನ ಪ್ರಕಾರಕ್ಕೆ ಸೂಕ್ತವಾಗಿದೆ",
        season: "ನಿಮ್ಮ ಕೃಷಿ ಋತುವಿಗೆ ಸೂಕ್ತವಾಗಿದೆ",
        rain: "ಮಳೆಯ ಪ್ರಮಾಣಕ್ಕೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ",
        water: "ನೀರಿನ ಲಭ್ಯತೆಗೆ ಸೂಕ್ತವಾಗಿದೆ",
        district: "ನಿಮ್ಮ ಜಿಲ್ಲೆಯಲ್ಲಿ ಆದ್ಯತೆಯ ಬೆಳೆ",
        note: "ಸ್ಮಾರ್ಟ್‌ಕ್ರಾಪ್ ದತ್ತಾಂಶದ ನಿಯಮಗಳ ಆಧಾರದಲ್ಲಿ."
    },
    hi: {
        title: "इस फसल की सिफारिश क्यों की गई?",
        soil: "आपकी मिट्टी के लिए उपयुक्त",
        season: "आपके कृषि मौसम के लिए उपयुक्त",
        rain: "वर्षा की आवश्यकता से मेल खाती है",
        water: "पानी की उपलब्धता के लिए उपयुक्त",
        district: "आपके जिले की प्राथमिकता वाली फसल",
        note: "स्मार्टक्रॉप डेटाबेस के नियमों पर आधारित।"
    }
};

const reasonText = reasonLabels[lang()] || reasonLabels.en;

const reasonBox = document.createElement("div");

reasonBox.style.cssText = `
    background: #edf7ee;
    border-left: 5px solid #198754;
    padding: 20px;
    margin: 20px 0;
    border-radius: 12px;
    line-height: 1.8;
    color: #14532d;
`;

const reasonTitle = document.createElement("h3");
reasonTitle.textContent = "🌱 " + reasonText.title;
reasonBox.appendChild(reasonTitle);

const reasonItems = [
    reasonText.soil,
    reasonText.season,
    reasonText.rain,
    reasonText.water
];

if (best.localPriority === true) {
    reasonItems.push(reasonText.district);
}

reasonItems.forEach(item => {
    const paragraph = document.createElement("p");
    paragraph.textContent = "✅ " + item;
    reasonBox.appendChild(paragraph);
});

const reasonNote = document.createElement("small");
reasonNote.textContent = reasonText.note;
reasonBox.appendChild(reasonNote);

results.appendChild(reasonBox);

// END RECOMMENDATION EXPLANATION

  const wrapper = createElement(
    "div",
    undefined,
    "comparison-table-wrapper"
  );

  const table = createElement(
    "table",
    undefined,
    "comparison-table"
  );

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  [
    "crop",
    "investment",
    "income",
    "profitLoss",
    "suitability",
    "duration"
].forEach(key => {
    headerRow.appendChild(
      createElement("th", tr(key))
    );
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  sorted.forEach((crop, index) => {
    const row = document.createElement("tr");

    if (index === 0) {
      row.className = "comparison-best-row";
    }

   
const cropProfit = crop.profit;
const hasProfit = Number.isFinite(cropProfit);

const values = [
  (index === 0 && hasProfit ? "🏆 " : "") +
    cropName(crop),
  money(crop.cost),
  money(crop.income),
  hasProfit
    ? (cropProfit < 0 ? "-" : "") +
      money(Math.abs(cropProfit))
    : money(null),
 (Number(crop.score) || 0) + "%",
crop.durations?.[lang()] ||
crop.duration ||
tr("notAvailable")
];

    values.forEach((value, i) => {
      const cell = createElement("td", value);
if (i === 3 && hasProfit) {
  cell.className =
    cropProfit >= 0
      ? "profit-value"
      : "loss-value";
}

      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
  results.appendChild(wrapper);

  results.appendChild(
    createElement("p", tr("disclaimer"), "disclaimer")
  );
}

// ==========================================
// SUBMIT FARM DETAILS
// ==========================================

$("cropForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const soil = $("soil").value;
  const season = $("season").value;
  const rainfall = $("rainfall").value;
  const water = $("water").value;
  const landSize = $("landSize").value;
  const landUnit = $("landUnit").value;

  if (
    !soil ||
    !season ||
    !rainfall ||
    !water ||
    !landSize ||
    !Number.isFinite(Number(landSize)) ||
    Number(landSize) <= 0
  ) {
    alert(tr("invalid"));
    return;
  }

  const button = $("submitBtn");

  button.disabled = true;
  button.textContent = tr("loading");

  try {
   const result = await api("/api/recommend", {
    soil,
    season,
    rainfall,
    water,
    landSize,
    landUnit,
    district: document.getElementById("district").value,
    cropCategory: document.querySelector(
    'input[name="cropCategoryChoice"]:checked'
)?.value || "food",
    durationChoice: document.querySelector(
        'input[name="durationChoice"]:checked'
    )?.value || "all",
    language: lang()
});

    lastResults = result.recommendations || [];
    lastBestCrop = result.bestCrop || null;
    lastAlternatives = result.alternatives || [];
    console.log("Full API response:", result);
console.log("Received alternatives:", lastAlternatives);

    displayResults(lastResults, lastBestCrop, lastAlternatives);

    $("results").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
    button.textContent = tr("submit");
  }
});

// ==========================================
// CHATBOT MESSAGES
// ==========================================

function addChatMessage(sender, message, greeting = false) {
  const chat = $("chatMessages");

  if (!chat) return;

  const p = createElement(
    "p",
    undefined,
    sender === "user"
      ? "user-message"
      : "assistant-message"
  );

  p.dataset.sender = sender;
  p.dataset.greeting = String(greeting);

  const label = createElement(
    "strong",
    sender === "user"
      ? tr("you") + ": "
      : "SmartCrop: "
  );

  const body = createElement("span", message);

  p.append(label, body);
  chat.appendChild(p);

  chat.scrollTop = chat.scrollHeight;
}

async function askQuestion(message, language = lang()) {
  if (!message || $("sendBtn").disabled) return;

  addChatMessage("user", message);

  $("sendBtn").disabled = true;

  try {
    const result = await api("/api/ask", {
      message,
      language
    });

    const answer = result.answer || tr("error", language);

    addChatMessage("assistant", answer);

    $("voiceAnswer").textContent = answer;
    $("voiceAnswer").dataset.speech = answer
    .split(/\n\s*\n/)
    .slice(0, 4)
    .join("\n\n");
    answerLanguage = language;

  } catch (error) {
    addChatMessage("assistant", error.message);
  } finally {
    $("sendBtn").disabled = false;
  }
}

$("chatForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const message = $("chatInput").value.trim();

  if (!message || $("sendBtn").disabled) return;

  $("chatInput").value = "";

  await askQuestion(message);
});

// ==========================================
// VOICE ASSISTANT
// ==========================================

const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

let voiceFailed = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = event => {
    const message = event.results[0][0].transcript;

    $("voiceTranscript").textContent = message;

    const voiceLang = recognition.lang.split("-")[0];

    askQuestion(message, voiceLang);
  };

  recognition.onerror = event => {
    voiceFailed = true;
    setText("voiceStatus", tr("voiceError"));

    console.error("Voice error:", event.error);
  };

  recognition.onend = () => {
    $("micBtn").disabled = false;

    if (!voiceFailed) {
      setText("voiceStatus", tr("ready"));
    }
  };
}

$("micBtn")?.addEventListener("click", () => {
  if (!recognition) {
    setText("voiceStatus", tr("unsupported"));
    return;
  }

  voiceFailed = false;

  recognition.lang =
    $("voiceLanguage").value || lang() + "-IN";

  setText("voiceStatus", tr("listening"));

  try {
    recognition.start();
    $("micBtn").disabled = true;

  } catch (error) {
    $("micBtn").disabled = false;
    setText("voiceStatus", tr("voiceError"));
  }
});

// ==========================================
// SPEAK ANSWER
// ==========================================

$("speakAnswerBtn")?.addEventListener("click", () => {
 const message = (
    $("voiceAnswer").dataset.speech ||
    $("voiceAnswer").textContent
).trim();

  if (!message) return;

  if (!window.speechSynthesis) {
    alert(tr("speechError"));
    return;
  }

  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(message);

  speech.lang = answerLanguage + "-IN";
  speech.rate = 0.9;

  const voices = window.speechSynthesis.getVoices();

  const matchingVoice = voices.find(voice =>
    voice.lang.toLowerCase().startsWith(answerLanguage)
  );

  if (matchingVoice) {
    speech.voice = matchingVoice;
  }

  speech.onerror = () => {
    setText("voiceStatus", tr("speechError"));
  };

  window.speechSynthesis.speak(speech);
});

// ==========================================
// DASHBOARD LANGUAGE SELECTOR
// ==========================================

$("language")?.addEventListener("change", event => {
  changeLanguage(event.target.value);
});

// ==========================================
// START SMARTCROP APPLICATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    addLoginLanguageSelector();

    addPasswordToggle("loginPassword");
    addPasswordToggle("registerPassword");

    changeLanguage();

    checkLogin();

    console.log("SmartCrop loaded successfully!");
    console.log("English, Kannada and Hindi enabled.");

});
/* ==========================================
   SMARTCROP LIVE WEATHER FORECAST
========================================== */

(() => {

  const weatherWords = {
    weatherTitle: [
      "🌦️ Live Weather Forecast",
      "🌦️ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
      "🌦️ मौसम पूर्वानुमान"
    ],
    weatherDescription: [
      "Know your weather. Plan your farming.",
      "ಹವಾಮಾನ ತಿಳಿದು ಕೃಷಿ ಯೋಜಿಸಿ.",
      "मौसम जानें, खेती की योजना बनाएं।"
    ],
    weatherBadge: [
      "🌐 Online Weather",
      "🌐 ಆನ್‌ಲೈನ್ ಹವಾಮಾನ",
      "🌐 ऑनलाइन मौसम"
    ],
    detectLocationBtn: [
      "📍 Detect My Location",
      "📍 ನನ್ನ ಸ್ಥಳ ಪತ್ತೆಮಾಡಿ",
      "📍 मेरा स्थान खोजें"
    ],
    weatherCityLabel: [
      "Enter your village or city",
      "ನಿಮ್ಮ ಊರು ಅಥವಾ ನಗರ ನಮೂದಿಸಿ",
      "अपना गांव या शहर दर्ज करें"
    ],
    weatherSearchBtn: [
      "🔍 Search",
      "🔍 ಹುಡುಕಿ",
      "🔍 खोजें"
    ],
    temperatureLabel: [
      "Temperature", "ತಾಪಮಾನ", "तापमान"
    ],
    humidityLabel: [
      "Humidity", "ತೇವಾಂಶ", "आर्द्रता"
    ],
    rainProbabilityLabel: [
      "Today's Rain Probability",
      "ಇಂದಿನ ಮಳೆಯ ಸಾಧ್ಯತೆ",
      "आज बारिश की संभावना"
    ],
    windLabel: [
      "Wind Speed", "ಗಾಳಿಯ ವೇಗ", "हवा की गति"
    ],
    forecastTitle: [
      "📅 7-Day Weather Forecast",
      "📅 7 ದಿನಗಳ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
      "📅 7 दिन का मौसम पूर्वानुमान"
    ],
    totalRainfallLabel: [
      "Expected Rainfall in 7 Days",
      "7 ದಿನಗಳ ನಿರೀಕ್ಷಿತ ಮಳೆ",
      "7 दिनों की अनुमानित वर्षा"
    ],
    weatherAdviceTitle: [
      "🌱 Farming Advice",
      "🌱 ಕೃಷಿ ಸಲಹೆ",
      "🌱 खेती की सलाह"
    ],
    weatherDisclaimer: [
      "Forecasts are estimates. Check local conditions before farming.",
      "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಅಂದಾಜು ಮಾತ್ರ. ಸ್ಥಳೀಯ ಪರಿಸ್ಥಿತಿಯನ್ನು ಪರಿಶೀಲಿಸಿ.",
      "पूर्वानुमान केवल अनुमान हैं। स्थानीय स्थिति जांचें।"
    ],
    locationHint: [
      "Select your farm location.",
      "ನಿಮ್ಮ ಜಮೀನಿನ ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ.",
      "अपने खेत का स्थान चुनें।"
    ],
    loading: [
      "Loading weather information...",
      "ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
      "मौसम की जानकारी प्राप्त हो रही है..."
    ],
    locating: [
      "Detecting your location...",
      "ನಿಮ್ಮ ಸ್ಥಳ ಪತ್ತೆಮಾಡಲಾಗುತ್ತಿದೆ...",
      "आपका स्थान खोजा जा रहा है..."
    ],
    locationError: [
      "Location unavailable. Search your city manually.",
      "ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ. ನಿಮ್ಮ ನಗರವನ್ನು ಹುಡುಕಿ.",
      "स्थान उपलब्ध नहीं है। अपना शहर खोजें।"
    ],
    error: [
      "Unable to load weather. Check your internet connection.",
      "ಹವಾಮಾನ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ.",
      "मौसम की जानकारी उपलब्ध नहीं है। इंटरनेट जांचें।"
    ],
    noCity: [
      "Location not found. Try a nearby town.",
      "ಸ್ಥಳ ಸಿಗಲಿಲ್ಲ. ಹತ್ತಿರದ ನಗರವನ್ನು ಹುಡುಕಿ.",
      "स्थान नहीं मिला। नजदीकी शहर खोजें।"
    ],
    chooseCity: [
      "Select your location below.",
      "ಕೆಳಗೆ ನಿಮ್ಮ ಸ್ಥಳ ಆಯ್ಕೆಮಾಡಿ.",
      "नीचे अपना स्थान चुनें।"
    ],
    currentLocation: [
      "Current location",
      "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
      "वर्तमान स्थान"
    ],
    sunny: [
      "Clear sky", "ಸ್ವಚ್ಛ ಆಕಾಶ", "साफ आसमान"
    ],
    cloudy: [
      "Cloudy", "ಮೋಡ ಕವಿದ ವಾತಾವರಣ", "बादल छाए हैं"
    ],
    fog: [
      "Foggy", "ಮಂಜು", "कोहरा"
    ],
    rainy: [
      "Rainy", "ಮಳೆ", "बारिश"
    ],
    snow: [
      "Snow", "ಹಿಮಪಾತ", "बर्फबारी"
    ],
    storm: [
      "Thunderstorm", "ಗುಡುಗು ಸಹಿತ ಮಳೆ", "आंधी और बारिश"
    ],
    unknown: [
      "Unavailable", "ಲಭ್ಯವಿಲ್ಲ", "उपलब्ध नहीं"
    ],
    rainAdvice: [
      "Rain is expected. Check soil moisture before irrigation and keep drainage channels clear.",
      "ಮಳೆಯ ಸಾಧ್ಯತೆ ಇದೆ. ನೀರುಣಿಸುವ ಮೊದಲು ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ನೀರು ಹರಿಯುವ ಕಾಲುವೆಗಳನ್ನು ಸ್ವಚ್ಛವಾಗಿಡಿ.",
      "बारिश की संभावना है। सिंचाई से पहले मिट्टी की नमी जांचें और जल निकासी साफ रखें।"
    ],
    hotAdvice: [
      "Hot weather is expected. Check crop water needs and irrigate during cooler hours if required.",
      "ಬಿಸಿ ವಾತಾವರಣದ ಸಾಧ್ಯತೆ ಇದೆ. ಬೆಳೆಗಳಿಗೆ ನೀರಿನ ಅಗತ್ಯ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಅಗತ್ಯವಿದ್ದರೆ ತಂಪಾದ ಸಮಯದಲ್ಲಿ ನೀರುಣಿಸಿ.",
      "गर्म मौसम की संभावना है। फसल की पानी की जरूरत जांचें और आवश्यकता होने पर ठंडे समय में सिंचाई करें।"
    ],
    normalAdvice: [
      "Monitor soil moisture and plan irrigation according to crop requirements.",
      "ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಬೆಳೆಯ ಅಗತ್ಯಕ್ಕೆ ಅನುಗುಣವಾಗಿ ನೀರುಣಿಸಿ.",
      "मिट्टी की नमी जांचें और फसल की जरूरत के अनुसार सिंचाई करें।"
    ],
    stormAdvice: [
      "Thunderstorms are possible. Avoid working in open fields during lightning.",
      "ಗುಡುಗು ಮಿಂಚಿನ ಸಾಧ್ಯತೆ ಇದೆ. ಮಿಂಚಿನ ಸಮಯದಲ್ಲಿ ತೆರೆದ ಜಮೀನಿನಲ್ಲಿ ಕೆಲಸ ಮಾಡಬೇಡಿ.",
      "आंधी और बिजली की संभावना है। बिजली चमकने के दौरान खुले खेत में काम न करें।"
    ],
    updated: [
      "Weather time", "ಹವಾಮಾನ ಸಮಯ", "मौसम का समय"
    ],
    source: [
      "Weather data: ", "ಹವಾಮಾನ ಮಾಹಿತಿ: ", "मौसम डेटा: "
    ],
    cityHint: [
      "Example: Udupi",
      "ಉದಾಹರಣೆ: ಉಡುಪಿ",
      "उदाहरण: उडुपी"
    ]
  };

  let savedWeather = null;
  let savedLocation = "";
  let statusKey = "";
  let requestNumber = 0;

  const el = id => document.getElementById(id);

  function weatherLanguage() {
    return el("language")?.value || "en";
  }

  function wt(key) {
    const index = {
      en: 0,
      kn: 1,
      hi: 2
    }[weatherLanguage()] ?? 0;

    return weatherWords[key]?.[index] || key;
  }

  function put(id, text) {
    if (el(id)) {
      el(id).textContent = text;
    }
  }

  function status(key = "") {
    statusKey = key;
    put("weatherStatus", key ? wt(key) : "");
  }

  function formatValue(value, unit = "") {
    if (value === null || value === undefined) {
      return "--";
    }

    const number = Number(value);

    return Number.isFinite(number)
      ? Math.round(number * 10) / 10 + unit
      : "--";
  }

  function weatherType(code) {

    if (code === null || code === undefined) {
      return ["❔", "unknown"];
    }

    if (code === 0) {
      return ["☀️", "sunny"];
    }

    if (code >= 1 && code <= 3) {
      return ["🌤️", "cloudy"];
    }

    if (code === 45 || code === 48) {
      return ["🌫️", "fog"];
    }

    if (code >= 95) {
      return ["⛈️", "storm"];
    }

    if (
      (code >= 71 && code <= 77) ||
      code === 85 || code === 86
    ) {
      return ["❄️", "snow"];
    }

    if (code >= 51 && code <= 82) {
      return ["🌧️", "rainy"];
    }

    return ["❔", "unknown"];
  }

  function translateWeather() {

    const ids = [
      "weatherTitle",
      "weatherDescription",
      "weatherBadge",
      "detectLocationBtn",
      "weatherCityLabel",
      "weatherSearchBtn",
      "temperatureLabel",
      "humidityLabel",
      "rainProbabilityLabel",
      "windLabel",
      "forecastTitle",
      "totalRainfallLabel",
      "weatherAdviceTitle",
      "weatherDisclaimer"
    ];

    ids.forEach(id => put(id, wt(id)));

    el("weatherCity").placeholder = wt("cityHint");

    const source = document.querySelector(".weather-source");

    if (source) {
      const link = source.querySelector("a");

      if (link) {
        source.replaceChildren(
          document.createTextNode(wt("source")),
          link
        );
      }
    }

    put(
      "weatherStatus",
      statusKey ? wt(statusKey) : ""
    );

    if (savedWeather) {
      displayWeather(savedWeather);
    } else {
      put("weatherLocation", wt("locationHint"));
    }
  }

  function displayWeather(data) {

    const current = data.current;
    const daily = data.daily;

    const [icon, condition] =
      weatherType(current.weather_code);

    put(
      "weatherLocation",
      "📍 " + (
        savedLocation === "__current__"
          ? wt("currentLocation")
          : savedLocation
      )
    );

    put("weatherIcon", icon);
    put("weatherCondition", wt(condition));

    put(
      "weatherTemperature",
      formatValue(current.temperature_2m, "°C")
    );

    put(
      "temperatureValue",
      formatValue(current.temperature_2m, "°C")
    );

    put(
      "humidityValue",
      formatValue(current.relative_humidity_2m, "%")
    );

    put(
      "windValue",
      formatValue(current.wind_speed_10m, " km/h")
    );

    put(
      "rainProbabilityValue",
      formatValue(
        daily.precipitation_probability_max[0],
        "%"
      )
    );

    put(
      "weatherUpdated",
      wt("updated") + ": " +
      current.time.replace("T", " ")
    );

    const forecast = el("forecastCards");

    forecast.replaceChildren();

    daily.time.forEach((date, i) => {

      const card = document.createElement("div");

      card.className = "forecast-card";

      const day = new Date(
        date + "T12:00:00"
      ).toLocaleDateString(
        weatherLanguage() + "-IN",
        {
          weekday: "short",
          day: "numeric",
          month: "short"
        }
      );

      const [dayIcon, dayCondition] =
        weatherType(daily.weather_code[i]);

      const values = [
        ["h4", day, ""],
        ["span", dayIcon, "forecast-icon"],
        ["strong",
          formatValue(daily.temperature_2m_max[i], "°") +
          " / " +
          formatValue(daily.temperature_2m_min[i], "°"),
          ""
        ],
        ["p", wt(dayCondition), ""],
        ["small",
          "🌧️ " +
          formatValue(daily.precipitation_sum[i], " mm"),
          ""
        ],
        ["small",
          "💧 " +
          formatValue(
            daily.precipitation_probability_max[i],
            "%"
          ),
          ""
        ]
      ];

      values.forEach(([tag, text, className]) => {

        const element = document.createElement(tag);

        element.textContent = text;
        element.className = className;

        card.appendChild(element);
      });

      forecast.appendChild(card);
    });

    const rainfall = daily.precipitation_sum;

    const completeRainfall = rainfall.every(
      value => typeof value === "number" &&
        Number.isFinite(value)
    );

    const totalRain = completeRainfall
      ? rainfall.reduce((sum, value) => sum + value, 0)
      : null;

    put(
      "totalRainfallValue",
      formatValue(totalRain, " mm")
    );

    let advice = "normalAdvice";

    if (daily.weather_code.some(code => code >= 95)) {
      advice = "stormAdvice";
    } else if (
      daily.precipitation_probability_max
        .some(value => value >= 60)
    ) {
      advice = "rainAdvice";
    } else if (
      daily.temperature_2m_max.some(value => value >= 35)
    ) {
      advice = "hotAdvice";
    }

    put("weatherAdvice", wt(advice));

    el("weatherData").hidden = false;
  }

  /* FETCH LIVE WEATHER */

  async function loadWeather(latitude, longitude, location) {

    const request = ++requestNumber;

    status("loading");

    savedWeather = null;
    el("weatherData").hidden = true;

    try {

      const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,

        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "weather_code",
          "wind_speed_10m"
        ].join(","),

        daily: [
          "weather_code",
          "temperature_2m_max",
          "temperature_2m_min",
          "precipitation_sum",
          "precipitation_probability_max"
        ].join(","),

        timezone: "auto",
        forecast_days: "7"
      });

      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?" +
        params.toString()
      );

      if (!response.ok) {
        throw new Error("Weather API error");
      }

      const data = await response.json();
      console.log("GPS District:", {
    city: data.city,
    locality: data.locality,
    state: data.principalSubdivision,
    districts: data.localityInfo?.administrative
        ?.map(item => item.name)
});

      if (request !== requestNumber) return;

      if (!data.current || !data.daily) {
        throw new Error("Invalid weather data");
      }

      savedWeather = data;
      savedLocation = location;

      displayWeather(data);

      status();

    } catch (error) {

      if (request !== requestNumber) return;

      console.error(error);
      status("error");
    }
  }

  /* AUTOMATIC LOCATION DETECTION */

  el("detectLocationBtn").addEventListener("click", () => {

    const request = ++requestNumber;

    el("weatherSearchResults").replaceChildren();

    if (!navigator.geolocation) {
      status("locationError");
      return;
    }

    status("locating");

    navigator.geolocation.getCurrentPosition(

      position => {

        if (request !== requestNumber) return;

        loadWeather(
          position.coords.latitude,
          position.coords.longitude,
          "__current__"
        );
      },

      error => {

        if (request !== requestNumber) return;

        console.error(error);
        status("locationError");
      },

      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000
      }

    );
  });

  /* MANUAL CITY SEARCH */

  el("weatherSearchForm").addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      const city = el("weatherCity").value.trim();

      if (!city) return;

      const request = ++requestNumber;

      status("loading");

      const results = el("weatherSearchResults");

      results.replaceChildren();

      try {

        const params = new URLSearchParams({
          name: city,
          count: "5",
          language: weatherLanguage(),
          countryCode: "IN",
          format: "json"
        });

        const response = await fetch(
          "https://geocoding-api.open-meteo.com/v1/search?" +
          params.toString()
        );

        if (!response.ok) {
          throw new Error("Location search failed");
        }

        const data = await response.json();

        if (request !== requestNumber) return;

        if (!data.results?.length) {
          status("noCity");
          return;
        }

        status("chooseCity");

        data.results.forEach(place => {

          const button = document.createElement("button");

          button.type = "button";

          const location = [
            place.name,
            place.admin1,
            place.country
          ].filter(Boolean).join(", ");

          button.textContent = "📍 " + location;

          button.addEventListener("click", () => {

            results.replaceChildren();

            loadWeather(
              place.latitude,
              place.longitude,
              location
            );
          });

          results.appendChild(button);
        });

      } catch (error) {

        if (request !== requestNumber) return;

        console.error(error);
        status("error");
      }
    }
  );

  /* LANGUAGE SUPPORT */

  el("language").addEventListener(
    "change",
    translateWeather
  );

  el("authLanguage")?.addEventListener(
    "change",
    translateWeather
  );

  /* CLEAR WEATHER AFTER LOGOUT */

  new MutationObserver(() => {

    if (el("appSection").hidden) {

      requestNumber++;
      savedWeather = null;
      savedLocation = "";

      el("weatherData").hidden = true;
      el("weatherCity").value = "";
      el("weatherSearchResults").replaceChildren();
      el("forecastCards").replaceChildren();

      status();

      translateWeather();

    } else {
      translateWeather();
    }

  }).observe(el("appSection"), {
    attributes: true,
    attributeFilter: ["hidden"]
  });

  translateWeather();

  console.log("SmartCrop Weather Forecast Enabled!");

})();
/* ==========================================
   SMARTCROP - CROP CULTIVATION GUIDE
========================================== */

(() => {

  const guide = document.querySelector(".cultivation-panel");

  if (!guide) {
    console.warn("Cultivation section not found");
    return;
  }

  const el = id => document.getElementById(id);

  let selectedCrop = null;

  function translate(values) {
    const index = {
      en: 0,
      kn: 1,
      hi: 2
    }[document.documentElement.lang] ?? 0;

    return values[index];
  }

  const labels = {

    title: [
      "🌱 Crop Cultivation Guide",
      "🌱 ಬೆಳೆ ಬೆಳೆಯುವ ಮಾರ್ಗದರ್ಶಿ",
      "🌱 फसल उगाने की मार्गदर्शिका"
    ],

    description: [
      "Select a crop to learn how to grow it.",
      "ಬೆಳೆಯುವ ವಿಧಾನ ತಿಳಿಯಲು ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ.",
      "खेती की विधि जानने के लिए फसल चुनें।"
    ],

    view: [
      "View Guide →",
      "ಮಾರ್ಗದರ್ಶಿ ನೋಡಿ →",
      "जानकारी देखें →"
    ],

    soil: [
      "Suitable Soil",
      "ಸೂಕ್ತ ಮಣ್ಣು",
      "उपयुक्त मिट्टी"
    ],

    season: [
      "Growing Season",
      "ಬೆಳೆಯುವ ಕಾಲ",
      "फसल का मौसम"
    ],

    sowing: [
      "Land Preparation and Sowing",
      "ಭೂಮಿ ಸಿದ್ಧತೆ ಮತ್ತು ಬಿತ್ತನೆ",
      "भूमि की तैयारी और बुवाई"
    ],

    water: [
      "Water Requirements",
      "ನೀರಿನ ಅಗತ್ಯ",
      "पानी की आवश्यकता"
    ],

    fertilizer: [
      "Fertilizer Guidance",
      "ಗೊಬ್ಬರದ ಸಲಹೆ",
      "उर्वरक की जानकारी"
    ],

    pest: [
      "Pest and Disease Management",
      "ಕೀಟ ಮತ್ತು ರೋಗ ನಿರ್ವಹಣೆ",
      "कीट और रोग प्रबंधन"
    ],

    harvest: [
      "Harvesting",
      "ಕೊಯ್ಲು",
      "कटाई"
    ],

    duration: [
      "Crop Duration",
      "ಬೆಳೆಯ ಅವಧಿ",
      "फसल की अवधि"
    ],

    tips: [
      "Important Farming Tips",
      "ಪ್ರಮುಖ ಕೃಷಿ ಸಲಹೆಗಳು",
      "महत्वपूर्ण कृषि सुझाव"
    ],

    listen: [
      "🔊 Listen to Cultivation Guide",
      "🔊 ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿಯನ್ನು ಆಲಿಸಿ",
      "🔊 खेती की जानकारी सुनें"
    ],

    playing: [
      "Playing cultivation guide...",
      "ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ ಓದಲಾಗುತ್ತಿದೆ...",
      "खेती की जानकारी सुनाई जा रही है..."
    ],

    finished: [
      "Voice guide completed.",
      "ಧ್ವನಿ ಮಾರ್ಗದರ್ಶಿ ಪೂರ್ಣಗೊಂಡಿದೆ.",
      "आवाज मार्गदर्शिका पूरी हुई।"
    ],

    voiceError: [
      "Voice unavailable for this language.",
      "ಈ ಭಾಷೆಗೆ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ.",
      "इस भाषा में आवाज उपलब्ध नहीं है।"
    ],

    disclaimer: [
      "General farming guidance only. Consult local agricultural experts for variety, fertilizer and pest management recommendations.",
      "ಇದು ಸಾಮಾನ್ಯ ಕೃಷಿ ಮಾಹಿತಿ ಮಾತ್ರ. ತಳಿ, ಗೊಬ್ಬರ ಮತ್ತು ಕೀಟ ನಿರ್ವಹಣೆಗೆ ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
      "यह सामान्य कृषि जानकारी है। किस्म, उर्वरक और कीट प्रबंधन के लिए स्थानीय कृषि विशेषज्ञ से सलाह लें।"
    ]

  };


  /* ======================================
     CROP CULTIVATION DATABASE
  ====================================== */

  const crops = {

    paddy: {

      icon: "🌾",

      name: ["Paddy", "ಭತ್ತ", "धान"],

      description: [
        "Rice is an important food crop.",
        "ಭತ್ತ ಪ್ರಮುಖ ಆಹಾರ ಬೆಳೆಯಾಗಿದೆ.",
        "धान एक महत्वपूर्ण खाद्य फसल है।"
      ],

      soil: [
        "Clay and alluvial soil with good water retention.",
        "ನೀರು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವ ಜೇಡಿ ಮತ್ತು ಮೆಕ್ಕಲು ಮಣ್ಣು.",
        "पानी रोकने वाली चिकनी और जलोढ़ मिट्टी।"
      ],

      season: [
        "Mainly Kharif. Other seasons with suitable irrigation.",
        "ಮುಖ್ಯವಾಗಿ ಮುಂಗಾರು. ನೀರಾವರಿ ಇದ್ದರೆ ಇತರ ಕಾಲದಲ್ಲೂ ಬೆಳೆಯಬಹುದು.",
        "मुख्य रूप से खरीफ। सिंचाई होने पर अन्य मौसम में भी।"
      ],

      sowing: [
        "Level the field and use healthy seeds. Direct sowing or transplanting can be used.",
        "ಜಮೀನನ್ನು ಸಮತಟ್ಟು ಮಾಡಿ ಆರೋಗ್ಯಕರ ಬೀಜ ಬಳಸಿ. ನೇರ ಬಿತ್ತನೆ ಅಥವಾ ನಾಟಿ ಮಾಡಬಹುದು.",
        "खेत समतल करें और स्वस्थ बीज इस्तेमाल करें। सीधी बुवाई या रोपाई करें।"
      ],

      water: [
        "Requires reliable water. Manage irrigation according to soil and growth stage.",
        "ನಿರಂತರ ನೀರಿನ ಲಭ್ಯತೆ ಅಗತ್ಯ. ಮಣ್ಣು ಮತ್ತು ಬೆಳವಣಿಗೆಗೆ ಅನುಗುಣವಾಗಿ ನೀರುಣಿಸಿ.",
        "पर्याप्त पानी जरूरी है। मिट्टी और वृद्धि के अनुसार सिंचाई करें।"
      ],

      fertilizer: [
        "Apply compost and nutrients according to soil test recommendations.",
        "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯ ಸಲಹೆಯಂತೆ ಸಾವಯವ ಗೊಬ್ಬರ ಮತ್ತು ಪೋಷಕಾಂಶ ನೀಡಿ.",
        "मिट्टी परीक्षण के अनुसार खाद और पोषक तत्व दें।"
      ],

      pest: [
        "Monitor for stem borer, leaf folder and blast disease.",
        "ಕಾಂಡ ಕೊರಕ, ಎಲೆ ಮಡಚುವ ಕೀಟ ಮತ್ತು ಬೆಂಕಿ ರೋಗವನ್ನು ಗಮನಿಸಿ.",
        "तना छेदक, पत्ती लपेटक और ब्लास्ट रोग की निगरानी करें।"
      ],

      harvest: [
        "Harvest when most grains are mature and golden.",
        "ಹೆಚ್ಚಿನ ಕಾಳುಗಳು ಬಲಿತು ಚಿನ್ನದ ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ಕೊಯ್ಲು ಮಾಡಿ.",
        "अधिकांश दाने पककर सुनहरे होने पर कटाई करें।"
      ],

      duration: [
        "Approximately 100–150 days, depending on variety.",
        "ತಳಿಗೆ ಅನುಗುಣವಾಗಿ ಸುಮಾರು 100–150 ದಿನಗಳು.",
        "किस्म के अनुसार लगभग 100–150 दिन।"
      ],

      tips: [
        "Use suitable local varieties and maintain proper drainage.",
        "ಸ್ಥಳೀಯ ಸೂಕ್ತ ತಳಿಗಳನ್ನು ಬಳಸಿ ಮತ್ತು ನೀರು ಹರಿಯುವ ವ್ಯವಸ್ಥೆ ಮಾಡಿ.",
        "उपयुक्त स्थानीय किस्म चुनें और जल निकासी बनाए रखें।"
      ]

    },


    maize: {

      icon: "🌽",

      name: ["Maize", "ಮೆಕ್ಕೆಜೋಳ", "मक्का"],

      description: [
        "Maize is grown for food, animal feed and industry.",
        "ಮೆಕ್ಕೆಜೋಳವನ್ನು ಆಹಾರ ಮತ್ತು ಪಶು ಆಹಾರಕ್ಕಾಗಿ ಬೆಳೆಯಲಾಗುತ್ತದೆ.",
        "मक्का भोजन, पशु आहार और उद्योग के लिए उगाया जाता है।"
      ],

      soil: [
        "Well-drained red, black or loamy soil.",
        "ನೀರು ಸರಿಯಾಗಿ ಹರಿಯುವ ಕೆಂಪು, ಕಪ್ಪು ಅಥವಾ ಗೋಡು ಮಣ್ಣು.",
        "अच्छी जल निकासी वाली लाल, काली या दोमट मिट्टी।"
      ],

      season: [
        "Kharif, Rabi or summer with suitable irrigation.",
        "ಸೂಕ್ತ ನೀರಾವರಿಯೊಂದಿಗೆ ಮುಂಗಾರು, ಹಿಂಗಾರು ಅಥವಾ ಬೇಸಿಗೆ.",
        "उपयुक्त सिंचाई के साथ खरीफ, रबी या गर्मी।"
      ],

      sowing: [
        "Prepare a fine seedbed and sow healthy seeds in rows.",
        "ಮಣ್ಣನ್ನು ಹದಗೊಳಿಸಿ ಆರೋಗ್ಯಕರ ಬೀಜಗಳನ್ನು ಸಾಲುಗಳಲ್ಲಿ ಬಿತ್ತಿ.",
        "खेत तैयार करके स्वस्थ बीज कतारों में बोएं।"
      ],

      water: [
        "Avoid waterlogging. Maintain moisture during flowering and grain formation.",
        "ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿ. ಹೂವು ಮತ್ತು ಕಾಳು ಬೆಳವಣಿಗೆಯ ಸಮಯದಲ್ಲಿ ತೇವಾಂಶ ಕಾಪಾಡಿ.",
        "जलभराव से बचें। फूल और दाने बनने के समय नमी बनाए रखें।"
      ],

      fertilizer: [
        "Use compost and balanced nutrients based on soil testing.",
        "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯಂತೆ ಸಾವಯವ ಗೊಬ್ಬರ ಮತ್ತು ಸಮತೋಲಿತ ಪೋಷಕಾಂಶ ನೀಡಿ.",
        "मिट्टी परीक्षण के अनुसार खाद और संतुलित पोषक तत्व दें।"
      ],

      pest: [
        "Regularly inspect plants for fall armyworm and stem borer.",
        "ಸೈನಿಕ ಹುಳು ಮತ್ತು ಕಾಂಡ ಕೊರಕ ಕೀಟಗಳಿಗಾಗಿ ಬೆಳೆ ಪರಿಶೀಲಿಸಿ.",
        "फॉल आर्मीवर्म और तना छेदक की नियमित जांच करें।"
      ],

      harvest: [
        "For dry grain, harvest after the cobs and grains mature.",
        "ಒಣ ಕಾಳಿಗಾಗಿ ತೆನೆ ಮತ್ತು ಕಾಳುಗಳು ಬಲಿತ ನಂತರ ಕೊಯ್ಲು ಮಾಡಿ.",
        "सूखे अनाज के लिए भुट्टे और दाने पकने पर कटाई करें।"
      ],

      duration: [
        "Approximately 90–120 days for many grain varieties.",
        "ಅನೇಕ ಕಾಳಿನ ತಳಿಗಳಿಗೆ ಸುಮಾರು 90–120 ದಿನಗಳು.",
        "कई अनाज वाली किस्मों के लिए लगभग 90–120 दिन।"
      ],

      tips: [
        "Use healthy seeds and control weeds during early growth.",
        "ಆರೋಗ್ಯಕರ ಬೀಜ ಬಳಸಿ ಆರಂಭಿಕ ಬೆಳವಣಿಗೆಯಲ್ಲಿ ಕಳೆ ನಿಯಂತ್ರಿಸಿ.",
        "स्वस्थ बीज इस्तेमाल करें और शुरुआती वृद्धि में खरपतवार नियंत्रित करें।"
      ]

    },


    groundnut: {

      icon: "🥜",

      name: ["Groundnut", "ನೆಲಗಡಲೆ", "मूंगफली"],

      description: [
        "Groundnut is an important oilseed crop.",
        "ನೆಲಗಡಲೆ ಪ್ರಮುಖ ಎಣ್ಣೆಕಾಳು ಬೆಳೆಯಾಗಿದೆ.",
        "मूंगफली एक महत्वपूर्ण तिलहन फसल है।"
      ],

      soil: [
        "Loose, well-drained sandy loam or red soil.",
        "ಸಡಿಲವಾದ ಮರಳು ಮಿಶ್ರಿತ ಅಥವಾ ಕೆಂಪು ಮಣ್ಣು.",
        "भुरभुरी और अच्छी जल निकासी वाली रेतीली दोमट या लाल मिट्टी।"
      ],

      season: [
        "Kharif or irrigated Rabi and summer seasons.",
        "ಮುಂಗಾರು ಅಥವಾ ನೀರಾವರಿ ಇರುವ ಹಿಂಗಾರು ಮತ್ತು ಬೇಸಿಗೆ.",
        "खरीफ या सिंचित रबी और गर्मी।"
      ],

      sowing: [
        "Prepare loose soil and sow healthy kernels in rows.",
        "ಮಣ್ಣನ್ನು ಸಡಿಲಗೊಳಿಸಿ ಆರೋಗ್ಯಕರ ಬೀಜಗಳನ್ನು ಸಾಲುಗಳಲ್ಲಿ ಬಿತ್ತಿ.",
        "भुरभुरी मिट्टी तैयार करें और स्वस्थ बीज कतारों में बोएं।"
      ],

      water: [
        "Maintain moisture during flowering and pod development. Avoid standing water.",
        "ಹೂವು ಮತ್ತು ಕಾಯಿ ಬೆಳವಣಿಗೆಯಲ್ಲಿ ತೇವಾಂಶ ಕಾಪಾಡಿ. ನೀರು ನಿಲ್ಲದಂತೆ ನೋಡಿ.",
        "फूल और फलियां बनने के समय नमी रखें। जलभराव से बचें।"
      ],

      fertilizer: [
        "Use compost and soil-test-based nutrients, including calcium where needed.",
        "ಸಾವಯವ ಗೊಬ್ಬರ ಮತ್ತು ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯಂತೆ ಅಗತ್ಯವಿದ್ದರೆ ಕ್ಯಾಲ್ಸಿಯಂ ನೀಡಿ.",
        "खाद और मिट्टी परीक्षण के अनुसार जरूरत होने पर कैल्शियम दें।"
      ],

      pest: [
        "Monitor leaf miner, leaf spot and rust disease.",
        "ಎಲೆ ಸುರಂಗ ಕೀಟ, ಎಲೆ ಚುಕ್ಕೆ ಮತ್ತು ತುಕ್ಕು ರೋಗ ಗಮನಿಸಿ.",
        "पत्ती सुरंगक, पत्ती धब्बा और रतुआ रोग की निगरानी करें।"
      ],

      harvest: [
        "Check sample pods for maturity before lifting the plants.",
        "ಗಿಡಗಳನ್ನು ಕೀಳುವ ಮೊದಲು ಮಾದರಿ ಕಾಯಿಗಳ ಪಕ್ವತೆ ಪರಿಶೀಲಿಸಿ.",
        "पौधे उखाड़ने से पहले कुछ फलियों की परिपक्वता जांचें।"
      ],

      duration: [
        "Approximately 100–140 days, depending on variety.",
        "ತಳಿಗೆ ಅನುಗುಣವಾಗಿ ಸುಮಾರು 100–140 ದಿನಗಳು.",
        "किस्म के अनुसार लगभग 100–140 दिन।"
      ],

      tips: [
        "Dry harvested pods properly before storage.",
        "ಸಂಗ್ರಹಿಸುವ ಮೊದಲು ಕೊಯ್ಲು ಮಾಡಿದ ಕಾಯಿಗಳನ್ನು ಚೆನ್ನಾಗಿ ಒಣಗಿಸಿ.",
        "भंडारण से पहले फलियों को अच्छी तरह सुखाएं।"
      ]

    },


    ragi: {

      icon: "🌾",

      name: ["Ragi", "ರಾಗಿ", "रागी"],

      description: [
        "Ragi is a nutritious millet that tolerates relatively dry conditions.",
        "ರಾಗಿ ಕಡಿಮೆ ಮಳೆಯ ಪರಿಸ್ಥಿತಿಯನ್ನು ಸಹಿಸುವ ಪೌಷ್ಟಿಕ ಸಿರಿಧಾನ್ಯ.",
        "रागी कम वर्षा सहन करने वाला पौष्टिक मोटा अनाज है।"
      ],

      soil: [
        "Well-drained red or loamy soil.",
        "ನೀರು ಸರಿಯಾಗಿ ಹರಿಯುವ ಕೆಂಪು ಅಥವಾ ಗೋಡು ಮಣ್ಣು.",
        "अच्छी जल निकासी वाली लाल या दोमट मिट्टी।"
      ],

      season: [
        "Mainly Kharif, with other seasons depending on irrigation.",
        "ಮುಖ್ಯವಾಗಿ ಮುಂಗಾರು. ನೀರಾವರಿಯಂತೆ ಇತರ ಕಾಲದಲ್ಲೂ ಬೆಳೆಯಬಹುದು.",
        "मुख्य रूप से खरीफ। सिंचाई के अनुसार अन्य मौसम में भी।"
      ],

      sowing: [
        "Prepare a fine seedbed and use suitable line sowing or transplanting.",
        "ಮಣ್ಣನ್ನು ಹದಗೊಳಿಸಿ ಸಾಲು ಬಿತ್ತನೆ ಅಥವಾ ನಾಟಿ ಮಾಡಿ.",
        "खेत तैयार करें और कतारों में बुवाई या रोपाई करें।"
      ],

      water: [
        "Relatively low water requirement, but moisture is important during establishment and flowering.",
        "ತುಲನಾತ್ಮಕವಾಗಿ ಕಡಿಮೆ ನೀರು ಬೇಕು. ಆರಂಭಿಕ ಬೆಳವಣಿಗೆ ಮತ್ತು ಹೂವಿನ ಸಮಯದಲ್ಲಿ ತೇವಾಂಶ ಅಗತ್ಯ.",
        "पानी की जरूरत कम होती है, लेकिन शुरुआती वृद्धि और फूल के समय नमी जरूरी है।"
      ],

      fertilizer: [
        "Apply organic manure and nutrients based on soil testing.",
        "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯಂತೆ ಸಾವಯವ ಗೊಬ್ಬರ ಮತ್ತು ಪೋಷಕಾಂಶ ನೀಡಿ.",
        "मिट्टी परीक्षण के अनुसार जैविक खाद और पोषक तत्व दें।"
      ],

      pest: [
        "Inspect the crop for blast disease and insect damage.",
        "ಬೆಂಕಿ ರೋಗ ಮತ್ತು ಕೀಟ ಹಾನಿಗಾಗಿ ಬೆಳೆ ಪರಿಶೀಲಿಸಿ.",
        "ब्लास्ट रोग और कीटों से होने वाले नुकसान की जांच करें।"
      ],

      harvest: [
        "Harvest when the earheads mature and turn brown.",
        "ತೆನೆಗಳು ಬಲಿತು ಕಂದು ಬಣ್ಣಕ್ಕೆ ಬಂದಾಗ ಕೊಯ್ಲು ಮಾಡಿ.",
        "बालियां पककर भूरी होने पर कटाई करें।"
      ],

      duration: [
        "Approximately 100–130 days, depending on variety.",
        "ತಳಿಗೆ ಅನುಗುಣವಾಗಿ ಸುಮಾರು 100–130 ದಿನಗಳು.",
        "किस्म के अनुसार लगभग 100–130 दिन।"
      ],

      tips: [
        "Choose locally recommended varieties and control weeds early.",
        "ಸ್ಥಳೀಯ ಶಿಫಾರಸು ಮಾಡಿದ ತಳಿಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಕಳೆ ನಿಯಂತ್ರಿಸಿ.",
        "स्थानीय अनुशंसित किस्म चुनें और समय पर खरपतवार नियंत्रित करें।"
      ]

    },


    greenGram: {

      icon: "🌱",

      name: ["Green Gram", "ಹೆಸರುಕಾಳು", "मूंग"],

      description: [
        "Green gram is a short-duration pulse crop.",
        "ಹೆಸರುಕಾಳು ಕಡಿಮೆ ಅವಧಿಯ ದ್ವಿದಳ ಧಾನ್ಯ ಬೆಳೆಯಾಗಿದೆ.",
        "मूंग कम अवधि वाली दलहनी फसल है।"
      ],

      soil: [
        "Well-drained sandy loam or loamy soil.",
        "ನೀರು ಸರಿಯಾಗಿ ಹರಿಯುವ ಮರಳು ಮಿಶ್ರಿತ ಮಣ್ಣು.",
        "अच्छी जल निकासी वाली रेतीली दोमट मिट्टी।"
      ],

      season: [
        "Kharif or summer, and suitable regional Rabi conditions.",
        "ಮುಂಗಾರು ಅಥವಾ ಬೇಸಿಗೆ ಮತ್ತು ಸೂಕ್ತ ಪ್ರದೇಶಗಳಲ್ಲಿ ಹಿಂಗಾರು.",
        "खरीफ या गर्मी और उपयुक्त क्षेत्रों में रबी।"
      ],

      sowing: [
        "Use healthy seeds and sow in rows in a prepared field.",
        "ಸಿದ್ಧಪಡಿಸಿದ ಜಮೀನಿನಲ್ಲಿ ಆರೋಗ್ಯಕರ ಬೀಜಗಳನ್ನು ಸಾಲುಗಳಲ್ಲಿ ಬಿತ್ತಿ.",
        "तैयार खेत में स्वस्थ बीज कतारों में बोएं।"
      ],

      water: [
        "Avoid excess irrigation and waterlogging.",
        "ಅತಿಯಾದ ನೀರಾವರಿ ಮತ್ತು ನೀರು ನಿಲ್ಲುವುದನ್ನು ತಪ್ಪಿಸಿ.",
        "अधिक सिंचाई और जलभराव से बचें।"
      ],

      fertilizer: [
        "Use suitable Rhizobium inoculation and soil-test-based nutrients.",
        "ಸೂಕ್ತ ರೈಜೋಬಿಯಂ ಬೀಜೋಪಚಾರ ಮತ್ತು ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯಂತೆ ಪೋಷಕಾಂಶ ನೀಡಿ.",
        "उपयुक्त राइजोबियम बीज उपचार और मिट्टी परीक्षण के अनुसार पोषक तत्व दें।"
      ],

      pest: [
        "Monitor whiteflies, pod borers and yellow mosaic disease.",
        "ಬಿಳಿ ನೊಣ, ಕಾಯಿ ಕೊರಕ ಮತ್ತು ಹಳದಿ ಮೊಸಾಯಿಕ್ ರೋಗ ಗಮನಿಸಿ.",
        "सफेद मक्खी, फली छेदक और पीला मोजेक रोग की निगरानी करें।"
      ],

      harvest: [
        "Pick mature dry pods before excessive splitting.",
        "ಕಾಯಿಗಳು ಹೆಚ್ಚು ಸಿಡಿಯುವ ಮೊದಲು ಬಲಿತ ಒಣ ಕಾಯಿಗಳನ್ನು ಕೊಯ್ಯಿರಿ.",
        "फलियां ज्यादा फटने से पहले पकी सूखी फलियां तोड़ें।"
      ],

      duration: [
        "Approximately 60–90 days, depending on variety.",
        "ತಳಿಗೆ ಅನುಗುಣವಾಗಿ ಸುಮಾರು 60–90 ದಿನಗಳು.",
        "किस्म के अनुसार लगभग 60–90 दिन।"
      ],

      tips: [
        "Include pulses in crop rotation to support soil fertility.",
        "ಮಣ್ಣಿನ ಫಲವತ್ತತೆಗಾಗಿ ಬೆಳೆ ಪರಿವರ್ತನೆಯಲ್ಲಿ ದ್ವಿದಳ ಧಾನ್ಯ ಸೇರಿಸಿ.",
        "मिट्टी की उर्वरता के लिए फसल चक्र में दलहन शामिल करें।"
      ]

    },


    cotton: {

      icon: "☁️",

      name: ["Cotton", "ಹತ್ತಿ", "कपास"],

      description: [
        "Cotton is an important commercial fibre crop.",
        "ಹತ್ತಿ ಪ್ರಮುಖ ವಾಣಿಜ್ಯ ನಾರಿನ ಬೆಳೆಯಾಗಿದೆ.",
        "कपास एक महत्वपूर्ण व्यावसायिक रेशा फसल है।"
      ],

      soil: [
        "Deep, well-drained black or suitable loamy soil.",
        "ಆಳವಾದ ಮತ್ತು ನೀರು ಸರಿಯಾಗಿ ಹರಿಯುವ ಕಪ್ಪು ಅಥವಾ ಗೋಡು ಮಣ್ಣು.",
        "गहरी और अच्छी जल निकासी वाली काली या दोमट मिट्टी।"
      ],

      season: [
        "Mainly Kharif, depending on regional conditions.",
        "ಪ್ರಾದೇಶಿಕ ಪರಿಸ್ಥಿತಿಗೆ ಅನುಗುಣವಾಗಿ ಮುಖ್ಯವಾಗಿ ಮುಂಗಾರು.",
        "क्षेत्रीय परिस्थितियों के अनुसार मुख्य रूप से खरीफ।"
      ],

      sowing: [
        "Prepare the field and sow recommended varieties at suitable spacing.",
        "ಜಮೀನನ್ನು ಸಿದ್ಧಪಡಿಸಿ ಶಿಫಾರಸು ಮಾಡಿದ ತಳಿಗಳನ್ನು ಸೂಕ್ತ ಅಂತರದಲ್ಲಿ ಬಿತ್ತಿ.",
        "खेत तैयार करें और अनुशंसित किस्मों को उचित दूरी पर बोएं।"
      ],

      water: [
        "Maintain suitable moisture during flowering and boll formation.",
        "ಹೂವು ಮತ್ತು ಹತ್ತಿ ಕಾಯಿ ಬೆಳವಣಿಗೆಯ ಸಮಯದಲ್ಲಿ ತೇವಾಂಶ ಕಾಪಾಡಿ.",
        "फूल और कपास के गोले बनने के समय उचित नमी रखें।"
      ],

      fertilizer: [
        "Apply balanced nutrients according to soil testing and local recommendations.",
        "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಮತ್ತು ಸ್ಥಳೀಯ ಸಲಹೆಯಂತೆ ಸಮತೋಲಿತ ಪೋಷಕಾಂಶ ನೀಡಿ.",
        "मिट्टी परीक्षण और स्थानीय सलाह के अनुसार संतुलित पोषक तत्व दें।"
      ],

      pest: [
        "Monitor bollworms, whiteflies and sucking pests. Follow integrated pest management.",
        "ಕಾಯಿ ಕೊರಕ, ಬಿಳಿ ನೊಣ ಮತ್ತು ರಸ ಹೀರುವ ಕೀಟ ಗಮನಿಸಿ. ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ ಅನುಸರಿಸಿ.",
        "बॉलवर्म, सफेद मक्खी और रस चूसने वाले कीटों की निगरानी करें। समेकित कीट प्रबंधन अपनाएं।"
      ],

      harvest: [
        "Pick fully opened dry cotton bolls in dry weather.",
        "ಒಣ ವಾತಾವರಣದಲ್ಲಿ ಸಂಪೂರ್ಣ ತೆರೆದ ಹತ್ತಿ ಕಾಯಿಗಳಿಂದ ಹತ್ತಿ ಬಿಡಿಸಿ.",
        "सूखे मौसम में पूरी तरह खुले कपास के गोलों से कपास चुनें।"
      ],

      duration: [
        "Approximately 150–210 days, depending on variety.",
        "ತಳಿಗೆ ಅನುಗುಣವಾಗಿ ಸುಮಾರು 150–210 ದಿನಗಳು.",
        "किस्म के अनुसार लगभग 150–210 दिन।"
      ],

      tips: [
        "Inspect the crop regularly and seek expert advice before pesticide use.",
        "ಬೆಳೆಯನ್ನು ನಿಯಮಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ. ಕೀಟನಾಶಕ ಬಳಕೆಗೆ ಮೊದಲು ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
        "फसल की नियमित जांच करें और कीटनाशक इस्तेमाल से पहले विशेषज्ञ की सलाह लें।"
      ]

    }

  };


  /* ======================================
     HELPER FUNCTIONS
  ====================================== */

  function put(id, value) {

    const element = el(id);

    if (element) {
      element.textContent = value;
    }

  }


  const cards = Array.from(
    guide.querySelectorAll(".cultivation-card")
  );


  function getCropKey(card) {

    const raw = (
      card.dataset.crop ||
      card.dataset.cropId ||
      card.value ||
      card.querySelector("h3")?.textContent ||
      ""
    ).toLowerCase().replace(/[^a-z]/g, "");

    const mapping = {
      paddy: "paddy",
      rice: "paddy",
      maize: "maize",
      corn: "maize",
      groundnut: "groundnut",
      ragi: "ragi",
      fingermillet: "ragi",
      greengram: "greenGram",
      mung: "greenGram",
      cotton: "cotton"
    };

    return mapping[raw];

  }


  cards.forEach(card => {

    const key = getCropKey(card);

    if (key) {
      card.dataset.crop = key;
    }

  });


  /* ======================================
     DISPLAY CULTIVATION DETAILS
  ====================================== */

  function showCultivation(key, scroll = true) {

    const crop = crops[key];

    if (!crop) return;

    selectedCrop = key;

    const details = el("cultivationDetails");

    if (!details) return;

    details.hidden = false;

    put("selectedCropIcon", crop.icon);

    put(
      "selectedCropName",
      translate(crop.name)
    );

    put(
      "selectedCropDescription",
      translate(crop.description)
    );

    const image = el("cultivationImage");

    if (image) {
      image.hidden = true;
    }

    const infoGrid = guide.querySelector(
      ".cultivation-info-grid"
    );

    const fields = [

      ["🌱", "soil"],
      ["📅", "season"],
      ["🚜", "sowing"],
      ["💧", "water"],
      ["🪴", "fertilizer"],
      ["🐛", "pest"],
      ["🌾", "harvest"],
      ["⏳", "duration"]

    ];

    if (infoGrid) {

      infoGrid.replaceChildren();

      fields.forEach(([icon, field]) => {

        const card = document.createElement("div");

        card.className = "cultivation-info-card";

        const symbol = document.createElement("span");
        symbol.textContent = icon;

        const heading = document.createElement("h3");
        heading.textContent = translate(labels[field]);

        const text = document.createElement("p");
        text.textContent = translate(crop[field]);

        card.append(symbol, heading, text);

        infoGrid.appendChild(card);

      });

    }

    const tips = guide.querySelector(
      ".cultivation-tips"
    );

    if (tips) {

      const heading = document.createElement("h3");

      heading.textContent =
        "💡 " + translate(labels.tips);

      const paragraph = document.createElement("p");

      paragraph.textContent = translate(crop.tips);

      tips.replaceChildren(heading, paragraph);

    }

    cards.forEach(card => {

      const active = card.dataset.crop === key;

      card.classList.toggle("active", active);

      card.setAttribute(
        "aria-pressed",
        String(active)
      );

    });

    put("guideVoiceStatus", "");

    if (scroll) {

      details.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    }

  }


  /* ======================================
     CROP SELECTION BUTTONS
  ====================================== */

  cards.forEach(card => {

    card.addEventListener("click", event => {

      event.preventDefault();

      window.speechSynthesis?.cancel();

      showCultivation(card.dataset.crop);

    });

  });


  /* ======================================
     CLOSE CULTIVATION GUIDE
  ====================================== */

  function closeGuide() {

    selectedCrop = null;

    if (el("cultivationDetails")) {
      el("cultivationDetails").hidden = true;
    }

    cards.forEach(card => {

      card.classList.remove("active");

      card.setAttribute(
        "aria-pressed",
        "false"
      );

    });

    window.speechSynthesis?.cancel();

    put("guideVoiceStatus", "");

  }


  el("closeCultivationBtn")?.addEventListener(
    "click",
    closeGuide
  );


  /* ======================================
     THREE LANGUAGE SUPPORT
  ====================================== */

  function translateGuide() {

    const heading = guide.querySelector(
      ".cultivation-header h2"
    );

    const description = guide.querySelector(
      ".cultivation-header p"
    );

    if (heading) {
      heading.textContent =
        translate(labels.title);
    }

    if (description) {
      description.textContent =
        translate(labels.description);
    }

    cards.forEach(card => {

      const crop = crops[card.dataset.crop];

      if (!crop) return;

      const title = card.querySelector("h3");

      const text = card.querySelector("p");

      const view = card.querySelector(".guide-view");

      if (title) {
        title.textContent = translate(crop.name);
      }

      if (text) {
        text.textContent =
          translate(crop.description);
      }

      if (view) {
        view.textContent =
          translate(labels.view);
      }

    });

    put(
      "listenCultivationBtn",
      translate(labels.listen)
    );

    const disclaimer = guide.querySelector(
      ".cultivation-disclaimer"
    );

    if (disclaimer) {

      disclaimer.textContent =
        translate(labels.disclaimer);

    }

    if (selectedCrop) {
      showCultivation(selectedCrop, false);
    }

  }


  /* ======================================
     CULTIVATION VOICE ASSISTANT
  ====================================== */

  el("listenCultivationBtn")?.addEventListener(
    "click",
    () => {

      if (!selectedCrop) return;

      if (
        !window.speechSynthesis ||
        !window.SpeechSynthesisUtterance
      ) {

        put(
          "guideVoiceStatus",
          translate(labels.voiceError)
        );

        return;

      }

      const crop = crops[selectedCrop];

      const language =
        document.documentElement.lang || "en";

      const voice = window.speechSynthesis
        .getVoices()
        .find(item =>
          item.lang.toLowerCase()
            .startsWith(language)
        );

      if (!voice) {

        put(
          "guideVoiceStatus",
          translate(labels.voiceError)
        );

        return;

      }

      const fields = [
        "soil",
        "season",
        "sowing",
        "water",
        "fertilizer",
        "pest",
        "harvest",
        "duration",
        "tips"
      ];

      const message = [

        translate(crop.name),

        translate(crop.description),

        ...fields.map(field =>
          translate(labels[field]) +
          ". " +
          translate(crop[field])
        ),

        translate(labels.disclaimer)

      ].join(". ");

      window.speechSynthesis.cancel();

      const speech =
        new SpeechSynthesisUtterance(message);

      speech.lang = language + "-IN";

      speech.voice = voice;

      speech.rate = 0.85;

      speech.pitch = 1;

      speech.onstart = () => {

        put(
          "guideVoiceStatus",
          translate(labels.playing)
        );

      };

      speech.onend = () => {

        put(
          "guideVoiceStatus",
          translate(labels.finished)
        );

      };

      speech.onerror = event => {

        if (
          event.error === "canceled" ||
          event.error === "interrupted"
        ) return;

        put(
          "guideVoiceStatus",
          translate(labels.voiceError)
        );

      };

      window.speechSynthesis.speak(speech);

    }
  );


  /* ======================================
     AUTOMATIC LANGUAGE UPDATE
  ====================================== */

  new MutationObserver(() => {

    window.speechSynthesis?.cancel();

    translateGuide();

  }).observe(document.documentElement, {

    attributes: true,

    attributeFilter: ["lang"]

  });


  /* ======================================
     RESET AFTER LOGOUT
  ====================================== */

  if (el("appSection")) {

    new MutationObserver(() => {

      if (el("appSection").hidden) {
        closeGuide();
      }

    }).observe(el("appSection"), {

      attributes: true,

      attributeFilter: ["hidden"]

    });

  }


  translateGuide();

  console.log(
    "SmartCrop Cultivation Guide Enabled!"
  );

})();
/* ==========================================
   SMARTCROP KANNADA VOICE SYSTEM
========================================== */

(() => {

  let currentAudio = null;
  let audioURL = null;
  let controller = null;

  function stopKannadaVoice() {

    if (controller) {
      controller.abort();
      controller = null;
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      audioURL = null;
    }

  }

  async function playKannada(text, statusId) {

    stopKannadaVoice();

    window.speechSynthesis?.cancel();

    const status = document.getElementById(statusId);

    if (!text.trim()) {

      if (status) {
        status.textContent = "ಓದಲು ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.";
      }

      return;
    }

    const request = new AbortController();
    controller = request;

    if (status) {
      status.textContent = "ಧ್ವನಿ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...";
    }

    try {

      const response = await fetch("/api/kannada-voice", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          text: text
        }),

        signal: request.signal

      });

      if (!response.ok) {
        throw new Error("Server error: " + response.status);
      }

      const type = response.headers.get("content-type") || "";

      if (!type.includes("audio/")) {
        throw new Error("Invalid audio response");
      }

      const blob = await response.blob();

      if (request.signal.aborted) return;

      audioURL = URL.createObjectURL(blob);

      currentAudio = new Audio(audioURL);

      currentAudio.onended = () => {

        stopKannadaVoice();

        if (status) {
          status.textContent = "ಧ್ವನಿ ಪೂರ್ಣಗೊಂಡಿದೆ.";
        }

      };

      currentAudio.onerror = () => {

        stopKannadaVoice();

        if (status) {
          status.textContent = "ಧ್ವನಿ ಪ್ಲೇ ಆಗಲಿಲ್ಲ.";
        }

      };

      await currentAudio.play();

      if (status && !request.signal.aborted) {
        status.textContent = "🔊 ಧ್ವನಿ ಕೇಳಿಸುತ್ತಿದೆ...";
      }

    } catch (error) {

      if (request.signal.aborted) return;

      stopKannadaVoice();

      console.error("Kannada voice error:", error);

      if (status) {
        status.textContent =
          "ಧ್ವನಿ ದೋಷ: " + error.message;
      }

    }

  }

  // CROP CULTIVATION GUIDE VOICE

  document.getElementById("listenCultivationBtn")
    ?.addEventListener("click", event => {

      if (document.documentElement.lang !== "kn") {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      const details =
        document.getElementById("cultivationDetails");

      if (!details || details.hidden) return;

      const fields = details.querySelectorAll(
        "h2, h3, p"
      );

      const text = Array.from(fields)
        .filter(element =>
          element.id !== "guideVoiceStatus"
        )
        .map(element => element.textContent.trim())
        .filter(Boolean)
        .join(". ");

      playKannada(text, "guideVoiceStatus");

    }, true);


  // SMARTCROP VOICE ASSISTANT ANSWER

  document.getElementById("speakAnswerBtn")
    ?.addEventListener("click", event => {

      if (answerLanguage !== "kn") return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const text =
        document.getElementById("voiceAnswer")
          ?.textContent || "";

     playKannada(
    $("voiceAnswer").dataset.speech || text,
    "voiceStatus"
);

    }, true);


  // STOP AUDIO WHEN CHANGING CROPS

  document.querySelectorAll(".cultivation-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        stopKannadaVoice
      );

    });


  // STOP AUDIO WHEN CLOSING GUIDE

  document.getElementById("closeCultivationBtn")
    ?.addEventListener("click", stopKannadaVoice);


  // STOP AUDIO WHEN CHANGING LANGUAGE

  document.getElementById("language")
    ?.addEventListener("change", stopKannadaVoice);


  // STOP AUDIO WHEN LOGGING OUT

  document.getElementById("logoutBtn")
    ?.addEventListener("click", stopKannadaVoice);


  console.log("Kannada Voice System Connected!");

})();
// ======================================
// SMARTCROP 200 CROP KNOWLEDGE CENTRE
// ======================================

(() => {

  let catalogueData = [];
  let loadFailed = false;

  const search = document.getElementById("catalogueSearch");
  const category = document.getElementById("catalogueCategory");
  const grid = document.getElementById("catalogueGrid");
  const count = document.getElementById("catalogueCount");
  const language = document.getElementById("language");

  const translations = {
    en: {
      title: "🌱 Crop Knowledge Centre",
      description: "Explore 200 different crops",
      search: "🔍 Search crop name...",
      showing: "Showing crops:",
      empty: "No crops found",
      error: "Unable to load crops. Please refresh.",
      categories: [
        "All Crops", "Cereals", "Millets",
        "Pulses", "Oilseeds", "Vegetables",
        "Fruits", "Spices", "Plantation Crops",
        "Commercial Crops", "Flowers",
        "Medicinal Plants", "Fodder Crops"
      ]
    },

    kn: {
      title: "🌱 ಬೆಳೆ ಮಾಹಿತಿ ಕೇಂದ್ರ",
      description: "200 ವಿವಿಧ ಬೆಳೆಗಳ ಮಾಹಿತಿ",
      search: "🔍 ಬೆಳೆ ಹುಡುಕಿ...",
      showing: "ಬೆಳೆಗಳ ಸಂಖ್ಯೆ:",
      empty: "ಯಾವುದೇ ಬೆಳೆ ಕಂಡುಬಂದಿಲ್ಲ",
      error: "ಬೆಳೆಗಳ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ. ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ.",
      categories: [
        "ಎಲ್ಲಾ ಬೆಳೆಗಳು", "ಧಾನ್ಯಗಳು", "ಸಿರಿಧಾನ್ಯಗಳು",
        "ಬೇಳೆಕಾಳುಗಳು", "ಎಣ್ಣೆಕಾಳುಗಳು", "ತರಕಾರಿಗಳು",
        "ಹಣ್ಣುಗಳು", "ಮಸಾಲೆ ಬೆಳೆಗಳು", "ತೋಟದ ಬೆಳೆಗಳು",
        "ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು", "ಹೂವುಗಳು",
        "ಔಷಧೀಯ ಸಸ್ಯಗಳು", "ಮೇವಿನ ಬೆಳೆಗಳು"
      ]
    },

    hi: {
      title: "🌱 फसल ज्ञान केंद्र",
      description: "200 विभिन्न फसलों की जानकारी",
      search: "🔍 फसल खोजें...",
      showing: "फसलों की संख्या:",
      empty: "कोई फसल नहीं मिली",
      error: "फसलें लोड नहीं हुईं। पेज रीफ्रेश करें।",
      categories: [
        "सभी फसलें", "अनाज", "मोटे अनाज",
        "दलहन", "तिलहन", "सब्जियां",
        "फल", "मसाले", "बागान फसलें",
        "व्यावसायिक फसलें", "फूल",
        "औषधीय पौधे", "चारा फसलें"
      ]
    }
  };
function renderCatalogue() {

    const lang = selectedLanguage;
    const t = translations[lang] || translations.en;

    document.getElementById("catalogueTitle")
      .textContent = t.title;

    document.getElementById("catalogueDescription")
      .textContent = t.description;

    search.placeholder = t.search;

    Array.from(category.options).forEach((option, i) => {
      option.textContent = t.categories[i];
    });

    const keyword = search.value.trim().toLowerCase();
    const selectedCategory = category.value;

    grid.replaceChildren();

    if (loadFailed) {
      count.textContent = t.error;
      return;
    }

    const filtered = catalogueData.filter(crop => {

      const matchesSearch = Object.values(crop.names)
        .some(name => name.toLowerCase().includes(keyword));

      const matchesCategory =
        selectedCategory === "all" ||
        crop.category === selectedCategory;

      return matchesSearch && matchesCategory;

    });

    count.textContent =
      `${t.showing} ${filtered.length} / ${catalogueData.length}`;

    if (filtered.length === 0) {
      grid.textContent = t.empty;
      return;
    }

    filtered.forEach(crop => {

      const card = document.createElement("article");
      card.className = "catalogue-card";
      card.style.cursor = "pointer";
card.tabIndex = 0;
card.setAttribute("role", "button");

card.addEventListener("click", async () => {

  const lang =
    document.getElementById("language").value || "en";

  const labels = {
    en: {
      soil: "Suitable Soil",
      season: "Growing Season",
      temperature: "Temperature",
      water: "Water Requirement",
      duration: "Crop Duration",
      planting: "Planting Method",
      fertilizer: "Fertilizer",
      pests: "Common Pests",
      diseases: "Diseases",
      harvesting: "Harvesting",
      close: "Close",
      missing: "Detailed information coming soon.",
      error: "Unable to load crop information."
    },

    kn: {
      soil: "ಮಣ್ಣಿನ ವಿಧ",
      season: "ಬೆಳೆಯುವ ಕಾಲ",
      temperature: "ತಾಪಮಾನ",
      water: "ನೀರಿನ ಅಗತ್ಯ",
      duration: "ಬೆಳೆ ಅವಧಿ",
      planting: "ಬಿತ್ತನೆ ವಿಧಾನ",
      fertilizer: "ಗೊಬ್ಬರ",
      pests: "ಕೀಟಗಳು",
      diseases: "ರೋಗಗಳು",
      harvesting: "ಕೊಯ್ಲು",
      close: "ಮುಚ್ಚಿ",
      missing: "ವಿವರವಾದ ಮಾಹಿತಿ ಶೀಘ್ರದಲ್ಲೇ ಲಭ್ಯವಾಗಲಿದೆ.",
      error: "ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ."
    },

    hi: {
      soil: "उपयुक्त मिट्टी",
      season: "फसल का मौसम",
      temperature: "तापमान",
      water: "पानी की आवश्यकता",
      duration: "फसल अवधि",
      planting: "बुवाई विधि",
      fertilizer: "उर्वरक",
      pests: "प्रमुख कीट",
      diseases: "रोग",
      harvesting: "कटाई",
      close: "बंद करें",
      missing: "विस्तृत जानकारी जल्द उपलब्ध होगी।",
      error: "जानकारी प्राप्त नहीं हो सकी।"
    }
  };

  const t = labels[lang] || labels.en;

  try {

    const response = await fetch(
      "/api/crop-details/" + encodeURIComponent(crop.id)
    );

    if (!response.ok) {
      throw new Error("API error");
    }

    const data = await response.json();

    const popup = document.createElement("dialog");

    popup.style.cssText = `
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  width: 90%;
  max-width: 650px;
  max-height: 85vh;
  overflow-y: auto;
  padding: 25px;
  border: 2px solid #16a34a;
  border-radius: 20px;
  background: #f0fdf4;
  color: #14532d;
  box-sizing: border-box;
`;

    const heading = document.createElement("h2");

    heading.textContent =
      crop.icon + " " +
      (crop.names[lang] || crop.names.en);

    popup.appendChild(heading);

    if (data.available && data.details) {

      const scientific = document.createElement("p");

      scientific.textContent =
        data.details.scientificName || "";

      popup.appendChild(scientific);

      const details =
        data.details[lang] || data.details.en;

      for (const key of Object.keys(details)) {

        const section = document.createElement("div");

        section.style.cssText = `
          background: white;
          padding: 15px;
          margin: 10px 0;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        `;

        const title = document.createElement("strong");
        title.textContent = t[key] || key;

        const value = document.createElement("p");
        value.textContent = details[key];

        section.append(title, value);
        popup.appendChild(section);

      }

    } else {

      const message = document.createElement("p");
      message.textContent = t.missing;
      popup.appendChild(message);

    }

    const close = document.createElement("button");

    close.textContent = t.close;

    close.style.cssText = `
      background: #15803d;
      color: white;
      width: 100%;
      padding: 15px;
      border: none;
      border-radius: 10px;
      font-size: 18px;
      cursor: pointer;
    `;

    close.onclick = () => popup.close();

    popup.appendChild(close);

    popup.addEventListener("close", () => popup.remove());

    document.body.appendChild(popup);

    popup.showModal();

  } catch (error) {

    console.error(error);
    alert(t.error);

  }

});

card.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    card.click();
  }
});

      const icon = document.createElement("span");
      icon.className = "catalogue-icon";
      icon.textContent = crop.icon || "🌱";

      const name = document.createElement("h3");
      name.textContent = crop.names[lang] || crop.names.en;

      const otherName = document.createElement("p");
      otherName.textContent =
        lang === "en" ? crop.names.kn : crop.names.en;

      const tag = document.createElement("span");
      tag.className = "catalogue-tag";

      const option = Array.from(category.options)
        .find(item => item.value === crop.category);

      tag.textContent = option
        ? option.textContent
        : crop.category;

      card.append(icon, name, otherName, tag);
      grid.appendChild(card);

    });

  }

  async function loadCatalogue() {

    try {

      const response = await fetch("/api/crops");

      if (!response.ok) {
        throw new Error("Crop API failed");
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.crops)) {
        throw new Error("Invalid crop data");
      }

      catalogueData = data.crops;
      loadFailed = false;
      renderCatalogue();

    } catch (error) {

      console.error("Crop catalogue error:", error);
      loadFailed = true;
      renderCatalogue();

    }

  }

  search.addEventListener("input", renderCatalogue);

  category.addEventListener("change", renderCatalogue);

  language.addEventListener("change", renderCatalogue);

  loadCatalogue();

})();
// GROWING DURATION LANGUAGE SUPPORT

function updateDurationLanguage() {

    const translations = {

        en: {
            durationTitle: "6. Select Growing Duration",
            durationDescription: "Choose your preferred harvest time.",
            durationAll: "🌾 All Crops",
            durationAllDesc: "Any duration",
            durationShort: "🌱 Short-term Crops",
            durationShortDesc: "Up to 4 months",
            durationMedium: "🌿 Medium-term Crops",
            durationMediumDesc: "Over 4 to 12 months",
            durationLong: "🌳 Long-term Crops",
            durationLongDesc: "Over 1 year"
        },

        kn: {
            durationTitle: "6. ಬೆಳೆ ಬೆಳೆಯುವ ಅವಧಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
            durationDescription: "ನಿಮಗೆ ಬೇಕಾದ ಕೊಯ್ಲಿನ ಅವಧಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
            durationAll: "🌾 ಎಲ್ಲಾ ಬೆಳೆಗಳು",
            durationAllDesc: "ಯಾವುದೇ ಅವಧಿ",
            durationShort: "🌱 ಅಲ್ಪಾವಧಿ ಬೆಳೆಗಳು",
            durationShortDesc: "4 ತಿಂಗಳವರೆಗೆ",
            durationMedium: "🌿 ಮಧ್ಯಮಾವಧಿ ಬೆಳೆಗಳು",
            durationMediumDesc: "4 ತಿಂಗಳಿಗಿಂತ ಹೆಚ್ಚು, 12 ತಿಂಗಳವರೆಗೆ",
            durationLong: "🌳 ದೀರ್ಘಾವಧಿ ಬೆಳೆಗಳು",
            durationLongDesc: "1 ವರ್ಷಕ್ಕಿಂತ ಹೆಚ್ಚು"
        },

        hi: {
            durationTitle: "6. फसल की अवधि चुनें",
            durationDescription: "अपनी पसंद की कटाई अवधि चुनें।",
            durationAll: "🌾 सभी फसलें",
            durationAllDesc: "कोई भी अवधि",
            durationShort: "🌱 अल्पकालीन फसलें",
            durationShortDesc: "4 महीने तक",
            durationMedium: "🌿 मध्यम अवधि की फसलें",
            durationMediumDesc: "4 महीने से अधिक, 12 महीने तक",
            durationLong: "🌳 दीर्घकालीन फसलें",
            durationLongDesc: "1 वर्ष से अधिक"
        }
    };

    const selectedLanguage =
        document.getElementById("language")?.value || "en";

    const selected =
        translations[selectedLanguage] || translations.en;

    Object.entries(selected).forEach(([id, value]) => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    });
}

document.getElementById("language")
    ?.addEventListener("change", updateDurationLanguage);

updateDurationLanguage();
// KARNATAKA DISTRICT LANGUAGE SUPPORT

const districtTranslations = {
    "Bagalkot": ["ಬಾಗಲಕೋಟೆ", "बागलकोट"],
    "Ballari": ["ಬಳ್ಳಾರಿ", "बल्लारी"],
    "Belagavi": ["ಬೆಳಗಾವಿ", "बेलगावी"],
    "Bengaluru Rural": ["ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ", "बेंगलुरु ग्रामीण"],
    "Bengaluru Urban": ["ಬೆಂಗಳೂರು ನಗರ", "बेंगलुरु शहरी"],
    "Bidar": ["ಬೀದರ್", "बीदर"],
    "Chamarajanagar": ["ಚಾಮರಾಜನಗರ", "चामराजनगर"],
    "Chikkaballapur": ["ಚಿಕ್ಕಬಳ್ಳಾಪುರ", "चिक्कबल्लापुर"],
    "Chikkamagaluru": ["ಚಿಕ್ಕಮಗಳೂರು", "चिक्कमगलूरु"],
    "Chitradurga": ["ಚಿತ್ರದುರ್ಗ", "चित्रदुर्ग"],
    "Dakshina Kannada": ["ದಕ್ಷಿಣ ಕನ್ನಡ", "दक्षिण कन्नड़"],
    "Davanagere": ["ದಾವಣಗೆರೆ", "दावणगेरे"],
    "Dharwad": ["ಧಾರವಾಡ", "धारवाड़"],
    "Gadag": ["ಗದಗ", "गदग"],
    "Hassan": ["ಹಾಸನ", "हासन"],
    "Haveri": ["ಹಾವೇರಿ", "हावेरी"],
    "Kalaburagi": ["ಕಲಬುರಗಿ", "कलबुर्गी"],
    "Kodagu": ["ಕೊಡಗು", "कोडगु"],
    "Kolar": ["ಕೋಲಾರ", "कोलार"],
    "Koppal": ["ಕೊಪ್ಪಳ", "कोप्पल"],
    "Mandya": ["ಮಂಡ್ಯ", "मांड्या"],
    "Mysuru": ["ಮೈಸೂರು", "मैसूरु"],
    "Raichur": ["ರಾಯಚೂರು", "रायचूर"],
    "Ramanagara": ["ರಾಮನಗರ", "रामनगर"],
    "Shivamogga": ["ಶಿವಮೊಗ್ಗ", "शिवमोग्गा"],
    "Tumakuru": ["ತುಮಕೂರು", "तुमकूरु"],
    "Udupi": ["ಉಡುಪಿ", "उडुपी"],
    "Uttara Kannada": ["ಉತ್ತರ ಕನ್ನಡ", "उत्तर कन्नड़"],
    "Vijayapura": ["ವಿಜಯಪುರ", "विजयपुरा"],
    "Vijayanagara": ["ವಿಜಯನಗರ", "विजयनगर"],
    "Yadgir": ["ಯಾದಗಿರಿ", "यादगीर"]
};

function updateDistrictLanguage() {

    const language = lang();

    const labels = {
        en: {
            title: "📍 Select Your District",
            description: "Select your district in Karnataka.",
            placeholder: "Select District"
        },
        kn: {
            title: "📍 ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
            description: "ಕರ್ನಾಟಕದ ನಿಮ್ಮ ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
            placeholder: "ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ"
        },
        hi: {
            title: "📍 अपना जिला चुनें",
            description: "कर्नाटक में अपना जिला चुनें।",
            placeholder: "जिला चुनें"
        }
    };

    const selected = labels[language] || labels.en;

    const title = document.getElementById("districtTitle");
    const description = document.getElementById("districtDescription");
    const placeholder = document.getElementById("districtPlaceholder");

    if (title) title.textContent = selected.title;

    if (description) {
        description.textContent = selected.description;
    }

    if (placeholder) {
        placeholder.textContent = selected.placeholder;
    }

    document.querySelectorAll("#district option").forEach(option => {

        if (!option.value) return;

        const names = districtTranslations[option.value];

        if (!names) return;

        option.textContent =
            language === "kn" ? names[0] :
            language === "hi" ? names[1] :
            option.value;
    });
}

document.getElementById("language")?.addEventListener(
    "change",
    updateDistrictLanguage
);

updateDistrictLanguage();

// END DISTRICT LANGUAGE SUPPORT
// CROP CATEGORY LANGUAGE SUPPORT

function updateCropCategoryLanguage() {

   const language = lang();
    const labels = {
        en: {
            cropCategoryTitle: "🌱 Select Crop Category",
            cropCategoryDescription: "Choose the type of crop you want to grow.",
            categoryFood: "🌾 Food Crops",
            categoryCommercial: "💰 Commercial Crops",
            categoryVegetables: "🥕 Vegetables",
            categoryFruits: "🥭 Fruits",
            categoryFodder: "🌿 Fodder Crops",
            categoryAll: "🌱 All Crops"
        },

        kn: {
            cropCategoryTitle: "🌱 ಬೆಳೆಯ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
            cropCategoryDescription: "ನೀವು ಬೆಳೆಯಲು ಬಯಸುವ ಬೆಳೆಯ ವಿಧವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
            categoryFood: "🌾 ಆಹಾರ ಬೆಳೆಗಳು",
            categoryCommercial: "💰 ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು",
            categoryVegetables: "🥕 ತರಕಾರಿ ಬೆಳೆಗಳು",
            categoryFruits: "🥭 ಹಣ್ಣಿನ ಬೆಳೆಗಳು",
            categoryFodder: "🌿 ಮೇವಿನ ಬೆಳೆಗಳು",
            categoryAll: "🌱 ಎಲ್ಲಾ ಬೆಳೆಗಳು"
        },

        hi: {
            cropCategoryTitle: "🌱 फसल की श्रेणी चुनें",
            cropCategoryDescription: "आप जिस प्रकार की फसल उगाना चाहते हैं उसे चुनें।",
            categoryFood: "🌾 खाद्य फसलें",
            categoryCommercial: "💰 व्यावसायिक फसलें",
            categoryVegetables: "🥕 सब्जियां",
            categoryFruits: "🥭 फल",
            categoryFodder: "🌿 चारा फसलें",
            categoryAll: "🌱 सभी फसलें"
        }
    };

    const selected = labels[language] || labels.en;

    Object.entries(selected).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = value;
        }
    });
}

document.getElementById("language")
    ?.addEventListener("change", updateCropCategoryLanguage);

updateCropCategoryLanguage();

// END CROP CATEGORY LANGUAGE SUPPORT
// ==========================================
// AUTOMATIC DISTRICT DETECTION
// ==========================================

function updateGPSLanguage() {
    const labels = {
        en: "📍 Detect My District",
        kn: "📍 ನನ್ನ ಜಿಲ್ಲೆಯನ್ನು ಪತ್ತೆಮಾಡಿ",
        hi: "📍 मेरा जिला खोजें"
    };

    const button = document.getElementById("detectDistrictBtn");

    if (button) {
        button.textContent = labels[lang()] || labels.en;
    }
}

document.getElementById("detectDistrictBtn")
    ?.addEventListener("click", async () => {

    const button = document.getElementById("detectDistrictBtn");
    const status = document.getElementById("districtLocationStatus");
    const districtSelect = document.getElementById("district");

    const messages = {
        en: {
            loading: "Detecting your location...",
            success: "District detected successfully",
            failed: "Unable to detect district. Please select manually.",
            permission: "Please allow location access."
        },
        kn: {
            loading: "ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಪತ್ತೆಮಾಡಲಾಗುತ್ತಿದೆ...",
            success: "ಜಿಲ್ಲೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪತ್ತೆಮಾಡಲಾಗಿದೆ",
            failed: "ಜಿಲ್ಲೆಯನ್ನು ಪತ್ತೆಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಜಿಲ್ಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
            permission: "ದಯವಿಟ್ಟು ಸ್ಥಳದ ಅನುಮತಿ ನೀಡಿ."
        },
        hi: {
            loading: "आपका स्थान खोजा जा रहा है...",
            success: "जिला सफलतापूर्वक मिल गया",
            failed: "जिला नहीं मिला। कृपया स्वयं चुनें।",
            permission: "कृपया स्थान की अनुमति दें।"
        }
    };

    const msg = messages[lang()] || messages.en;

    if (!navigator.geolocation) {
        status.textContent = msg.failed;
        return;
    }

    button.disabled = true;
    status.textContent = msg.loading;

    try {

        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 0
                }
            );
        });

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
        );

        if (!response.ok) {
            throw new Error("Location service unavailable");
        }

        const data = await response.json();

        const normalize = value =>
            String(value || "")
                .toLowerCase()
                .replace(/\bdistrict\b/g, "")
                .replace(/[^a-z]/g, "");

        const aliases = {
            bangaloreurban: "bengaluruurban",
            bangalorerural: "bengalururural",
            mysore: "mysuru",
            shimoga: "shivamogga",
            belgaum: "belagavi",
            bellary: "ballari",
            bijapur: "vijayapura",
            gulbarga: "kalaburagi",
            chikmagalur: "chikkamagaluru",
            tumkur: "tumakuru",
            chamarajanagara: "chamarajanagar",
            bengalurusouth: "ramanagara"
        };

        const candidates = [
            data.locality,
            data.city,
            ...(data.localityInfo?.administrative || [])
                .map(item => item.name)
        ].map(value => {
            const key = normalize(value);
            return aliases[key] || key;
        });

        const matched = Array.from(districtSelect.options)
        .find(option => {
        if (!option.value) return false;

        const districtName = normalize(option.value);

        return candidates.some(candidate =>
            candidate === districtName ||
            candidate === districtName + "district" ||
            candidate === districtName + "zilla"
        );
    });

console.log("District candidates:", JSON.stringify(candidates));
console.log("Matched district:", matched?.value);
        if (matched) {
            districtSelect.value = matched.value;

            districtSelect.dispatchEvent(
                new Event("change", { bubbles: true })
            );

            status.textContent =
                "✅ " + msg.success + ": " + matched.textContent;

        } else {
            status.textContent = msg.failed;
        }

    } catch (error) {

        console.error("District detection:", error);

        status.textContent =
            error.code === 1 ? msg.permission : msg.failed;

    } finally {
        button.disabled = false;
    }
});

document.getElementById("language")
    ?.addEventListener("change", updateGPSLanguage);

updateGPSLanguage();

// END AUTOMATIC DISTRICT DETECTION