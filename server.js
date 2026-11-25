
const express = require("express");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
// ---------------- BASIC SETUP ----------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
  secret: process.env.SESSION_SECRET || require("crypto").randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

// ---------------- USER DATABASE ----------------

const usersFile = process.env.USERS_FILE || path.join(__dirname, "users.json");

function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, "[]");
    }

    return JSON.parse(fs.readFileSync(usersFile, "utf8"));
  } catch (error) {
    console.error("User database error:", error);
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// ---------------- REGISTER API ----------------

app.post("/api/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const mobile = String(req.body.mobile || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields."
      });
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit mobile number."
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters."
      });
    }

    const users = readUsers();

    const existingUser = users.find(
      user => user.email === email || user.mobile === mobile
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile number is already registered."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      id: Date.now().toString(),
      name,
      mobile,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      mobile: newUser.mobile,
      email: newUser.email
    };

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      user: req.session.user
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again."
    });
  }
});

// ---------------- LOGIN API ----------------

app.post("/api/login", async (req, res) => {
  try {
    const identifier = String(req.body.identifier || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter your email or mobile number and password."
      });
    }

    const users = readUsers();

    const user = users.find(
      item =>
        item.email === identifier ||
        item.mobile === identifier
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found. Please register first."
      });
    }

    const passwordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password."
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      email: user.email
    };

    res.json({
      success: true,
      message: "Login successful!",
      user: req.session.user
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again."
    });
  }
});

// ---------------- CHECK LOGIN STATUS ----------------

app.get("/api/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Please login first."
    });
  }

  res.json({
    success: true,
    user: req.session.user
  });
});

// ---------------- LOGOUT API ----------------

app.post("/api/logout", (req, res) => {
  req.session.destroy(error => {
    if (error) {
      return res.status(500).json({
        success: false,
        message: "Logout failed."
      });
    }

    res.clearCookie("connect.sid");

    res.json({
      success: true,
      message: "Logged out successfully."
    });
  });
});

// ---------------- PROTECTED ROUTE EXAMPLE ----------------

app.get("/api/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Please login first."
    });
  }

  res.json({
    success: true,
    message: "Welcome to SmartCrop Dashboard!",
    user: req.session.user
  });
});

// ---------------- CROP DATABASE ----------------
const recommendationData = require("./data/cropRecommendations.json");

const recommendationCatalogue = require("./data/crops.json");

const allRecommendationCrops = recommendationData.map(crop => ({
  ...crop,
  names: recommendationCatalogue.find(item => item.id === crop.id).names
}));

console.log("Recommendation database loaded:", allRecommendationCrops.length);
const crops = [
  {
    id: "maize",
    names: { en: "Maize", kn: "ಮೆಕ್ಕೆಜೋಳ", hi: "मक्का" },
    soils: ["red", "black", "alluvial"],
    seasons: ["kharif", "rabi", "summer"],
    water: ["low", "medium"],
    minRain: 300,
    maxRain: 1200,
    income: 42000,
    cost: 22000
  },
  {
    id: "groundnut",
    names: { en: "Groundnut", kn: "ನೆಲಗಡಲೆ", hi: "मूंगफली" },
    soils: ["red", "sandy", "laterite"],
    seasons: ["kharif", "rabi", "summer"],
    water: ["low", "medium"],
    minRain: 300,
    maxRain: 1000,
    income: 38000,
    cost: 20000
  },
  {
    id: "ragi",
    names: { en: "Ragi", kn: "ರಾಗಿ", hi: "रागी" },
    soils: ["red", "laterite", "sandy"],
    seasons: ["kharif", "rabi", "summer"],
    water: ["low", "medium"],
    minRain: 300,
    maxRain: 1000,
    income: 35000,
    cost: 16000
  },
  {
    id: "paddy",
    names: { en: "Paddy", kn: "ಭತ್ತ", hi: "धान" },
    soils: ["clay", "alluvial"],
    seasons: ["kharif", "rabi"],
    water: ["high", "medium"],
    minRain: 500,
    maxRain: 3000,
    income: 55000,
    cost: 30000
  },
  {
    id: "greenGram",
    names: { en: "Green Gram", kn: "ಹೆಸರುಕಾಳು", hi: "मूंग" },
    soils: ["red", "sandy", "black"],
    seasons: ["kharif", "rabi", "summer"],
    water: ["low", "medium"],
    minRain: 200,
    maxRain: 800,
    income: 30000,
    cost: 14000
  },
  {
    id: "cotton",
    names: { en: "Cotton", kn: "ಹತ್ತಿ", hi: "कपास" },
    soils: ["black", "red"],
    seasons: ["kharif"],
    water: ["low", "medium"],
    minRain: 500,
    maxRain: 1200,
    income: 50000,
    cost: 28000
  }
];

const languages = ["en", "kn", "hi"];
// ---------------- 200 CROP DATABASE ----------------

const cropCatalogue = require("./data/crops.json");
// DETAILED CROP INFORMATION API

const cropDetails = require("./data/cropDetails.json");
const cropDurations = require("./data/cropDurations.json");
const karnatakaCrops = require("./data/karnatakaCrops.json");
app.get("/api/crop-details/:id", (req, res) => {

  const crop = cropCatalogue.find(
    item => item.id === req.params.id
  );

  if (!crop) {
    return res.status(404).json({
      success: false,
      message: "Crop not found"
    });
  }

  const details = cropDetails[crop.id];

  res.json({
    success: true,
    crop: crop,
    available: Boolean(details),
    details: details || null
  });

});

console.log(
  "Detailed crops loaded:",
  Object.keys(cropDetails).length
);
// ---------------- CROP CATALOGUE API ----------------

app.get("/api/crops", (req, res) => {
  res.json({
    success: true,
    total: cropCatalogue.length,
    crops: cropCatalogue
  });
});

console.log("Crop catalogue loaded:", cropCatalogue.length);
// ---------------- CROP RECOMMENDATION ----------------
function getRecommendations(details, language) {

    const acres = details.landUnit === "gunta"
        ? details.landSize / 40
        : details.landSize;
const durationChoice = details.durationChoice || "all";
const district = details.district || "";

const districtCropIds = karnatakaCrops[district] || [];
const cropCategory = details.cropCategory || "all";

const categoryGroups = {
    food: ["cereals", "millets", "pulses"],

    commercial: [
        "commercial", "plantation", "oilseeds",
        "spices", "flowers", "medicinal"
    ],

    vegetables: ["vegetables"],

    fruits: ["fruits"],

    fodder: ["fodder"]
};

function matchesCategory(crop) {

    if (cropCategory === "all") return true;

    const cropInfo = recommendationCatalogue.find(
        item => item.id === crop.id
    );

    return (categoryGroups[cropCategory] || [])
        .includes(cropInfo?.category);
}// CHECK CROP MATCHING CONDITIONS
console.log("Selected farm details:", details);

console.table({
    totalCrops: allRecommendationCrops.length,

    soilMatch: allRecommendationCrops.filter(crop =>
        crop.soils.includes(details.soil)
    ).length,

    seasonMatch: allRecommendationCrops.filter(crop =>
        crop.seasons.includes(details.season)
    ).length,

    waterMatch: allRecommendationCrops.filter(crop =>
        crop.water.includes(details.water)
    ).length,

    rainfallMatch: allRecommendationCrops.filter(crop =>
        details.rainfall >= crop.minRain &&
        details.rainfall <= crop.maxRain
    ).length,

    categoryMatch: allRecommendationCrops.filter(crop =>
        matchesCategory(crop)
    ).length,

    durationMatch: allRecommendationCrops.filter(crop =>
        durationChoice === "all" ||
        (cropDurations[durationChoice] || []).includes(crop.id)
    ).length
});
// END MATCHING CHECK
   const suitable = allRecommendationCrops
    .filter(crop =>
        matchesCategory(crop) &&
        crop.soils.includes(details.soil) &&
        crop.seasons.includes(details.season) &&
        crop.water.includes(details.water) &&
        details.rainfall >= crop.minRain &&
        details.rainfall <= crop.maxRain &&
        (
            durationChoice === "all" ||
            (cropDurations[durationChoice] || []).includes(crop.id)
        )
    )
          
        .map(crop => {

            const idealRain =
                (crop.minRain + crop.maxRain) / 2;

            const rainRange =
                (crop.maxRain - crop.minRain) / 2;

            const difference =
                Math.abs(details.rainfall - idealRain);

            const rainMatch = rainRange > 0
                ? Math.max(0, 1 - difference / rainRange)
                : 1;

            const score = Math.round(90 + rainMatch * 10);

            const hasFinancialData =
                Number.isFinite(crop.income) &&
                Number.isFinite(crop.cost);

            const income = hasFinancialData
                ? Math.round(crop.income * acres)
                : null;

            const cost = hasFinancialData
                ? Math.round(crop.cost * acres)
                : null;

            return {
                id: crop.id,
                name: crop.names[language] || crop.names.en,
                names: crop.names,
                duration: cropDetails[crop.id]?.[language]?.duration || null,
durations: {
    en: cropDetails[crop.id]?.en?.duration || null,
    kn: cropDetails[crop.id]?.kn?.duration || null,
    hi: cropDetails[crop.id]?.hi?.duration || null
},
                score: score,
                localPriority: districtCropIds.includes(crop.id),
                income: income,
                cost: cost,
                profit: hasFinancialData
                    ? income - cost
                    : null,
                hasFinancialData: hasFinancialData,
                acres: Number(acres.toFixed(4))
            };
        })
        .sort((a, b) =>
    Number(b.localPriority) - Number(a.localPriority) ||
    b.score - a.score ||
    (b.profit ?? 0) - (a.profit ?? 0)
);
    console.log("SUITABLE CROPS:", suitable.map(crop => ({
        name: crop.name,
        score: crop.score
    })));

   // SMART ALTERNATIVE CROP RECOMMENDATIONS

const alternatives = suitable.length === 0
    ? allRecommendationCrops.map(crop => {

        const checks = {
            soil: crop.soils.includes(details.soil),

            season: crop.seasons.includes(details.season),

            water: crop.water.includes(details.water),

            rainfall:
                details.rainfall >= crop.minRain &&
                details.rainfall <= crop.maxRain,

            category: matchesCategory(crop),

            duration:
                durationChoice === "all" ||
                (cropDurations[durationChoice] || [])
                    .includes(crop.id)
        };

        const score =
            (checks.soil ? 25 : 0) +
            (checks.season ? 25 : 0) +
            (checks.rainfall ? 20 : 0) +
            (checks.water ? 20 : 0) +
            (districtCropIds.includes(crop.id) ? 10 : 0);

        const mismatches = Object.keys(checks)
            .filter(key => !checks[key]);

        return {
            id: crop.id,
            name: crop.names[language] || crop.names.en,
            names: crop.names,
            score: score,
            checks: checks,
            mismatches: mismatches,
            localPriority: districtCropIds.includes(crop.id),
            conditional: true
        };

    })
    .filter(crop =>
        crop.mismatches.length >= 1 &&
crop.mismatches.length <= 2
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

    : [];

console.log("ALTERNATIVE CROPS:", alternatives);

return {
    landInAcres: Number(acres.toFixed(4)),
    bestCrop: suitable.length ? suitable[0] : null,
    recommendations: suitable,
    alternatives: alternatives
};

// END SMART ALTERNATIVE RECOMMENDATIONS
}
// ---------------- SERVER HEALTH ----------------

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SmartCrop server is working"
  });
});

 // ---------------- CROP RECOMMENDATION API ----------------

app.post("/api/recommend", (req, res) => {

    const {
        soil,
        season,
        rainfall,
        water,
        landSize,
        landUnit,
        language
    } = req.body;

    const rain = Number(rainfall);
    const size = Number(landSize);

    if (
        !["red", "black", "clay", "sandy", "laterite", "alluvial"].includes(soil) ||
        !["kharif", "rabi", "summer"].includes(season) ||
        !["low", "medium", "high"].includes(water) ||
        !Number.isFinite(rain) ||
        rain < 0 ||
        !Number.isFinite(size) ||
        size <= 0 ||
        !["gunta", "acre"].includes(landUnit)
    ) {
        return res.status(400).json({
            success: false,
            message: "Please enter all farm details correctly."
        });
    }

    const lang = languages.includes(language)
        ? language
        : "en";

    const result = getRecommendations({
        soil,
        season,
        rainfall: rain,
        water,
        landSize: size,
        landUnit,
        district: req.body.district || "",
        cropCategory: req.body.cropCategory || "all",
        durationChoice: ["all", "short", "medium", "long"]
            .includes(req.body.durationChoice)
            ? req.body.durationChoice
            : "all"
    }, lang);

    res.json({
        success: true,
        ...result
    });

});


app.post("/api/ask", (req, res) => {
  const message = String(req.body.message || "").toLowerCase();

  const language = /[\u0C80-\u0CFF]/.test(message)
  ? "kn"
  : /[\u0900-\u097F]/.test(message)
    ? "hi"
    : languages.includes(req.body.language)
      ? req.body.language
      : "en";
    // -------- 200 CROPS SMART CHATBOT --------
    // -------- ADVANCED FARM QUESTION HANDLER --------

const farmText = message.normalize("NFC");

const farmSoils = {
  red: /red soil|ಕೆಂಪು\s*ಮಣ್ಣ|लाल\s*मिट्टी/i,
  black: /black soil|ಕಪ್ಪು\s*ಮಣ್ಣ|काली\s*मिट्टी/i,
  clay: /clay soil|ಜೇಡಿ|चिकनी\s*मिट्टी/i,
  sandy: /sandy soil|ಮರಳು\s*ಮಣ್ಣ|रेतीली\s*मिट्टी/i,
  laterite: /laterite|ಜಂಬಿಟ್ಟಿಗೆ|लेटराइट/i,
  alluvial: /alluvial|ಮೆಕ್ಕಲು|जलोढ़/i
};

const farmSeasons = {
  kharif: /kharif|ಮುಂಗಾರು|ಮಳೆಗಾಲ|खरीफ/i,
  rabi: /rabi|ಹಿಂಗಾರು|ಚಳಿಗಾಲ|रबी/i,
  summer: /summer|ಬೇಸಿಗೆ|गर्मी/i
};

const farmWater = {
  low: /low water|water.{0,35}low|ಕಡಿಮೆ\s*ನೀರ|ನೀರ.{0,40}ಕಡಿಮೆ|कम पानी|पानी.{0,25}कम/i,
  medium: /medium water|water.{0,35}medium|ಮಧ್ಯಮ\s*ನೀರ|ನೀರ.{0,40}ಮಧ್ಯಮ|मध्यम पानी/i,
  high: /high water|water.{0,35}high|ಹೆಚ್ಚು\s*ನೀರ|ನೀರ.{0,40}ಹೆಚ್ಚು|अधिक पानी/i
};

const farmRain = {
  low: /low rain|rain.{0,25}low|ಕಡಿಮೆ\s*ಮಳೆ|ಮಳೆ.{0,25}ಕಡಿಮೆ|कम बारिश|बारिश.{0,25}कम/i,
  medium: /medium rain|rain.{0,25}medium|ಮಧ್ಯಮ\s*ಮಳೆ|ಮಳೆ.{0,25}ಮಧ್ಯಮ|मध्यम बारिश/i,
  high: /heavy rain|high rain|rain.{0,25}high|ಹೆಚ್ಚಿನ\s*ಮಳೆ|ಮಳೆ.{0,25}ಹೆಚ್ಚು|भारी बारिश/i
};

const findFarmValue = (patterns) =>
  Object.keys(patterns).find(
    key => patterns[key].test(farmText)
  );

const farmLand = farmText.match(
  /(\d+(?:\.\d+)?)\s*(acres?|guntas?|ಎಕರೆ|ಗುಂಟೆ|एकड़|एकड़|गुंटा)/i
);

const farmIntent =
  /which crop|what crop|recommend|best crop|ಯಾವ ಬೆಳೆ|ಯಾವುದು ಉತ್ತಮ|कौन सी फसल|कौनसी फसल/i
    .test(farmText);

const newFarm = {};

const detectedSoil = findFarmValue(farmSoils);
const detectedSeason = findFarmValue(farmSeasons);
const detectedWater = findFarmValue(farmWater);
const detectedRain = findFarmValue(farmRain);

if (detectedSoil) newFarm.soil = detectedSoil;
if (detectedSeason) newFarm.season = detectedSeason;
if (detectedWater) newFarm.water = detectedWater;
if (detectedRain) newFarm.rainLevel = detectedRain;

if (farmLand && Number(farmLand[1]) > 0) {
  newFarm.landSize = Number(farmLand[1]);

  newFarm.landUnit =
    /gunta|ಗುಂಟೆ|गुंटा/i.test(farmLand[2])
      ? "gunta"
      : "acre";
}

const resetFarm =
  /reset farm|new farm|ಹೊಸ ಜಮೀನು|ಮರುಹೊಂದಿಸಿ|नई जमीन/i
    .test(farmText);

if (resetFarm) {
  delete req.session.pendingFarm;

  const resetMessages = {
    en: "Farm details cleared. Please enter your new farm details.",
    kn: "ಹಳೆಯ ಜಮೀನಿನ ವಿವರಗಳನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ. ಹೊಸ ವಿವರಗಳನ್ನು ನೀಡಿ.",
    hi: "पुरानी जानकारी हटा दी गई है। नई जमीन की जानकारी दें।"
  };

  return res.json({
    success: true,
    answer: resetMessages[language]
  });
}

const pendingFarm = req.session.pendingFarm;

if (
  farmIntent ||
  (detectedSoil && farmLand) ||
  (pendingFarm && Object.keys(newFarm).length > 0)
) {

  const farm = {
    ...(pendingFarm || {}),
    ...newFarm
  };

  req.session.pendingFarm = farm;

  const farmLabels = {
    en: {
      title: "Your farm details",
      soil: "Soil type",
      season: "Growing season",
      water: "Water availability",
      rainLevel: "Rainfall",
      landSize: "Land size",
      ask: "Please provide the missing details:",
      best: "Highest estimated profit among suitable crops",
      cost: "Estimated investment",
      income: "Estimated income",
      profit: "Estimated profit",
      comparison: "Crop comparison",
      noCrops: "No suitable crops found for these conditions.",
      note: "Financial values are sample estimates, not guaranteed returns.",
      acre: "Acres",
      gunta: "Gunta"
    },

    kn: {
      title: "ನಿಮ್ಮ ಜಮೀನಿನ ವಿವರಗಳು",
      soil: "ಮಣ್ಣಿನ ವಿಧ",
      season: "ಬೆಳೆಯುವ ಋತು (ಮುಂಗಾರು, ಹಿಂಗಾರು ಅಥವಾ ಬೇಸಿಗೆ)",
      water: "ನೀರಿನ ಲಭ್ಯತೆ",
      rainLevel: "ಮಳೆ",
      landSize: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ",
      ask: "ದಯವಿಟ್ಟು ಉಳಿದ ವಿವರಗಳನ್ನು ನೀಡಿ:",
      best: "ಸೂಕ್ತ ಬೆಳೆಗಳಲ್ಲಿ ಹೆಚ್ಚು ಅಂದಾಜು ಲಾಭ ನೀಡುವ ಬೆಳೆ",
      cost: "ಅಂದಾಜು ವೆಚ್ಚ",
      income: "ಅಂದಾಜು ಆದಾಯ",
      profit: "ಅಂದಾಜು ಲಾಭ",
      comparison: "ಬೆಳೆಗಳ ಹೋಲಿಕೆ",
      noCrops: "ಈ ಪರಿಸ್ಥಿತಿಗೆ ಸೂಕ್ತ ಬೆಳೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      note: "ಇವು ಮಾದರಿ ಅಂದಾಜುಗಳು. ನಿಜವಾದ ಲಾಭ ಬದಲಾಗಬಹುದು.",
      acre: "ಎಕರೆ",
      gunta: "ಗುಂಟೆ"
    },

    hi: {
      title: "आपकी जमीन की जानकारी",
      soil: "मिट्टी का प्रकार",
      season: "खेती का मौसम (खरीफ, रबी या गर्मी)",
      water: "पानी की उपलब्धता",
      rainLevel: "वर्षा",
      landSize: "जमीन का आकार",
      ask: "कृपया बाकी जानकारी दें:",
      best: "उपयुक्त फसलों में सबसे अधिक अनुमानित लाभ वाली फसल",
      cost: "अनुमानित लागत",
      income: "अनुमानित आय",
      profit: "अनुमानित लाभ",
      comparison: "फसलों की तुलना",
      noCrops: "इन परिस्थितियों में उपयुक्त फसल नहीं मिली।",
      note: "ये उदाहरण आधारित अनुमान हैं। वास्तविक लाभ बदल सकता है।",
      acre: "एकड़",
      gunta: "गुंटा"
    }
  };

  const fl = farmLabels[language];

  const valueNames = {
    en: {
      red: "Red soil",
      black: "Black soil",
      clay: "Clay soil",
      sandy: "Sandy soil",
      laterite: "Laterite soil",
      alluvial: "Alluvial soil",
      kharif: "Kharif",
      rabi: "Rabi",
      summer: "Summer",
      low: "Low",
      medium: "Medium",
      high: "High"
    },

    kn: {
      red: "ಕೆಂಪು ಮಣ್ಣು",
      black: "ಕಪ್ಪು ಮಣ್ಣು",
      clay: "ಜೇಡಿಮಣ್ಣು",
      sandy: "ಮರಳು ಮಣ್ಣು",
      laterite: "ಜಂಬಿಟ್ಟಿಗೆ ಮಣ್ಣು",
      alluvial: "ಮೆಕ್ಕಲು ಮಣ್ಣು",
      kharif: "ಮುಂಗಾರು",
      rabi: "ಹಿಂಗಾರು",
      summer: "ಬೇಸಿಗೆ",
      low: "ಕಡಿಮೆ",
      medium: "ಮಧ್ಯಮ",
      high: "ಹೆಚ್ಚು"
    },

    hi: {
      red: "लाल मिट्टी",
      black: "काली मिट्टी",
      clay: "चिकनी मिट्टी",
      sandy: "रेतीली मिट्टी",
      laterite: "लेटराइट मिट्टी",
      alluvial: "जलोढ़ मिट्टी",
      kharif: "खरीफ",
      rabi: "रबी",
      summer: "गर्मी",
      low: "कम",
      medium: "मध्यम",
      high: "अधिक"
    }
  };

  const vn = valueNames[language];

  const required = [
    "soil",
    "season",
    "water",
    "rainLevel",
    "landSize"
  ];

  const missing = required.filter(
    key => !farm[key]
  );

  const summary = required
    .filter(key => farm[key])
    .map(key => {
      const value = key === "landSize"
        ? farm.landSize + " " + fl[farm.landUnit]
        : vn[farm[key]];

      return fl[key] + ": " + value;
    }).join("\n");

  if (missing.length > 0) {

    return res.json({
      success: true,
      answer:
        fl.title + "\n\n" +
        summary + "\n\n" +
        fl.ask + "\n" +
        missing.map(key => fl[key]).join("\n")
    });
  }

  const rainfallValues = {
    low: 400,
    medium: 800,
    high: 1400
  };

  const result = getRecommendations({
    soil: farm.soil,
    season: farm.season,
    water: farm.water,
    rainfall: rainfallValues[farm.rainLevel],
    landSize: farm.landSize,
    landUnit: farm.landUnit
  }, language);

  delete req.session.pendingFarm;

  if (!result.bestCrop) {
    return res.json({
      success: true,
      answer: fl.noCrops
    });
  }

  const best = result.bestCrop;
const unavailableMoney = {
  en: "Data not available",
  kn: "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
  hi: "जानकारी उपलब्ध नहीं है"
};

const money = value =>
  Number.isFinite(value)
    ? "₹" + value.toLocaleString("en-IN")
    : unavailableMoney[language];

const comparison = result.recommendations
    .slice(0, 3)
    .map((crop, index) =>
      (index + 1) + ". " + crop.name + "\n" +
      ({
        en: "Suitability score",
        kn: "ಸೂಕ್ತತೆಯ ಅಂಕ",
        hi: "उपयुक्तता स्कोर"
      }[language]) + ": " + crop.score + "%\n" +
      fl.cost + ": " + money(crop.cost) + "\n" +
      ({
    en: "Growing duration",
    kn: "ಬೆಳೆ ಬೆಳೆಯುವ ಅವಧಿ",
    hi: "फसल उगाने की अवधि"
}[language]) + ": " +
(crop.duration || unavailableMoney[language]) + "\n" +
      fl.income + ": " + money(crop.income) + "\n" +
      fl.profit + ": " + money(crop.profit)
    ).join("\n\n");
  const farmAnswer =
    fl.title + "\n\n" +
    summary + "\n\n" +
    ({
  en: "Highest suitability crop",
  kn: "ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ಬೆಳೆ",
  hi: "सबसे उपयुक्त फसल"
}[language]) + ": " + best.name + "\n\n" +
({
  en: "Suitability score",
  kn: "ಸೂಕ್ತತೆಯ ಅಂಕ",
  hi: "उपयुक्तता स्कोर"
}[language]) + ": " + best.score + "%\n\n" +
    fl.cost + ": " + money(best.cost) + "\n" +
    ({
    en: "Growing duration",
    kn: "ಬೆಳೆ ಬೆಳೆಯುವ ಅವಧಿ",
    hi: "फसल उगाने की अवधि"
}[language]) + ": " +
(best.duration || unavailableMoney[language]) + "\n" +
    fl.income + ": " + money(best.income) + "\n" +
    fl.profit + ": " + money(best.profit) + "\n\n" +
    fl.comparison + "\n\n" +
    comparison + "\n\n" +
    fl.note;

  return res.json({
    success: true,
    answer: farmAnswer
  });
}

// -------- END ADVANCED FARM QUESTION HANDLER --------

const cropQuestion = message.normalize("NFC");

const cropAliases = {
  paddy: ["rice", "paddy", "ಭತ್ತ", "ಅಕ್ಕಿ", "धान", "चावल"],
  maize: ["maize", "corn", "ಮೆಕ್ಕೆಜೋಳ", "मक्का"],
  arecanut: ["areca nut", "arecanut", "ಅಡಿಕೆ", "सुपारी"],
  coconut: ["coconut", "ತೆಂಗು", "ತೆಂಗಿನಕಾಯಿ", "नारियल"],
  groundnut: ["groundnut", "peanut", "ಕಡಲೆಕಾಯಿ", "मूंगफली"],
  ragi: ["ragi", "finger millet", "ರಾಗಿ", "रागी"],
  mango: ["mango", "ಮಾವು", "ಮಾವಿನ", "आम"],
  banana: ["banana", "ಬಾಳೆ", "केला"],
  wheat: ["wheat", "ಗೋಧಿ", "गेहूं", "गेहूँ"]
};

const cropMatches = cropCatalogue.flatMap(crop => {

  const names = [
    ...Object.values(crop.names),
    ...(cropAliases[crop.id] || [])
  ];

  return names
    .filter(name => typeof name === "string")
    .map(name => ({
      crop,
      name: name.toLowerCase().normalize("NFC").trim()
    }));

}).filter(item => item.name.length > 0)
  .sort((a, b) => b.name.length - a.name.length);

const matchedCrop = cropMatches.find(item => {

  if (/^[a-z0-9 -]+$/i.test(item.name)) {
    const safeName = item.name.replace(
      /[.*+?^${}()|[\]\\]/g, "\\$&"
    );

    return new RegExp(
      "\\b" + safeName + "s?\\b", "i"
    ).test(cropQuestion);
  }

  return cropQuestion.includes(item.name);

})?.crop;

const cropTopics = [
  {
    key: "soil",
    pattern: /soil|ಮಣ್ಣು|ಮಣ್ಣ|ಮಣ್ಣಿನ|मिट्टी|भूमि/i
  },
  {
    key: "season",
    pattern: /season|kharif|rabi|ಋತು|ಕಾಲ|ಮುಂಗಾರು|ಹಿಂಗಾರು|मौसम|खरीफ|रबी/i
  },
  {
    key: "temperature",
    pattern: /temperature|climate|ತಾಪಮಾನ|ಹವಾಮಾನ|तापमान|जलवायु/i
  },
  {
    key: "water",
    pattern: /water|irrigation|ನೀರು|ನೀರ|ನೀರಾವರಿ|पानी|सिंचाई/i
  },
  {
    key: "duration",
    pattern: /duration|how long|days|months|years|ದಿನ|ತಿಂಗಳು|ವರ್ಷ|ಅವಧಿ|दिन|महीने|समय|साल/i
  },
  {
    key: "planting",
    pattern: /planting|how to grow|cultivation|sowing|ಬಿತ್ತನೆ|ನಾಟಿ|ಬೆಳೆಯುವುದು|ಬೆಳೆಯಲು|ಕೃಷಿ|खेती|बुवाई|रोपण|उगाएं/i
  },
  {
    key: "fertilizer",
    pattern: /fertilizer|fertiliser|manure|npk|ಗೊಬ್ಬರ|ಪೋಷಕಾಂಶ|खाद|उर्वरक/i
  },
  {
    key: "pests",
    pattern: /pest|insect|ಕೀಟ|ಹುಳು|कीट|कीड़ा/i
  },
  {
    key: "diseases",
    pattern: /disease|infection|ರೋಗ|ಕೊಳೆ|बीमारी|रोग/i
  },
  {
    key: "harvesting",
    pattern: /harvest|ಕೊಯ್ಲು|ಕೊಯ್ಯ|कटाई|तुड़ाई/i
  },
  {
    key: "scientificName",
    pattern: /scientific name|ವೈಜ್ಞಾನಿಕ ಹೆಸರು|वैज्ञानिक नाम/i
  }
];

const cropLabels = {
  en: {
    soil: "Suitable soil",
    season: "Growing season",
    temperature: "Temperature",
    water: "Water requirement",
    duration: "Crop duration",
    planting: "Planting method",
    fertilizer: "Fertilizer",
    pests: "Common pests",
    diseases: "Common diseases",
    harvesting: "Harvesting",
    scientificName: "Scientific name",
    note: "General guidance. Consult a local agricultural expert.",
    unavailable: "This information is not yet available in our crop database."
  },

  kn: {
    soil: "ಸೂಕ್ತ ಮಣ್ಣು",
    season: "ಬೆಳೆಯುವ ಕಾಲ",
    temperature: "ತಾಪಮಾನ",
    water: "ನೀರಿನ ಅಗತ್ಯ",
    duration: "ಬೆಳೆ ಅವಧಿ",
    planting: "ನಾಟಿ ವಿಧಾನ",
    fertilizer: "ಗೊಬ್ಬರ",
    pests: "ಸಾಮಾನ್ಯ ಕೀಟಗಳು",
    diseases: "ಸಾಮಾನ್ಯ ರೋಗಗಳು",
    harvesting: "ಕೊಯ್ಲು",
    scientificName: "ವೈಜ್ಞಾನಿಕ ಹೆಸರು",
    note: "ಇದು ಸಾಮಾನ್ಯ ಮಾಹಿತಿ. ಸ್ಥಳೀಯ ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ ಪಡೆಯಿರಿ.",
    unavailable: "ಈ ಮಾಹಿತಿ ಇನ್ನೂ ನಮ್ಮ ಬೆಳೆ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ."
  },

  hi: {
    soil: "उपयुक्त मिट्टी",
    season: "खेती का मौसम",
    temperature: "तापमान",
    water: "पानी की आवश्यकता",
    duration: "फसल की अवधि",
    planting: "बुवाई का तरीका",
    fertilizer: "उर्वरक",
    pests: "सामान्य कीट",
    diseases: "सामान्य रोग",
    harvesting: "कटाई",
    scientificName: "वैज्ञानिक नाम",
    note: "सामान्य जानकारी। स्थानीय कृषि विशेषज्ञ से सलाह लें।",
    unavailable: "यह जानकारी अभी हमारे फसल डेटाबेस में उपलब्ध नहीं है।"
  }
};

const recommendationQuestion =
  /which crop|what crop|recommend crops?|ಯಾವ ಬೆಳೆ|कौन सी फसल|कौनसी फसल/i
    .test(cropQuestion);

const financialQuestion =
  /profit|income|investment|cost|price|yield|loss|expense|budget|earn|ಲಾಭ|ನಷ್ಟ|ಆದಾಯ|ವೆಚ್ಚ|ಬೆಲೆ|ಇಳುವರಿ|ಖರ್ಚು|ಖರ್ಚಾ|ಹೂಡಿಕೆ|ಗಳಿಕೆ|ಲಾಭಾಂಶ|लाभ|मुनाफा|नुकसान|आमदनी|लागत|कीमत|उपज|खर्च|कमाई/i
    .test(cropQuestion);
if (
  matchedCrop &&
  cropDetails[matchedCrop.id] &&
  !recommendationQuestion
) {

  const record = cropDetails[matchedCrop.id];

  const information =
    record[language] || record.en;

  const labels =
    cropLabels[language] || cropLabels.en;

  const cropName =
    matchedCrop.names[language] ||
    matchedCrop.names.en;

  if (financialQuestion) {

  const finance = allRecommendationCrops.find(
    crop => crop.id === matchedCrop.id
  );

  if (
    !finance ||
    !Number.isFinite(finance.cost) ||
    !Number.isFinite(finance.income)
  ) {
    return res.json({
      success: true,
      answer: cropName + ": " + labels.unavailable
    });
  }

  const acres = farmLand
    ? Number(farmLand[1]) /
      (/gunta|ಗುಂಟೆ|गुंटा/i.test(farmLand[2]) ? 40 : 1)
    : 1;

  const cost = Math.round(finance.cost * acres);
  const income = Math.round(finance.income * acres);
  const profit = income - cost;

  const money = value =>
    "₹" + value.toLocaleString("en-IN");

  const financeLabels = {
    en: {
      land: "Land size (acres)",
      cost: "Estimated investment",
      income: "Estimated income",
      profit: "Estimated profit",
      note: "Sample financial estimates. Actual returns may vary. Live market prices and yield data are not available."
    },
    kn: {
      land: "ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ (ಎಕರೆ)",
      cost: "ಅಂದಾಜು ವೆಚ್ಚ",
      income: "ಅಂದಾಜು ಆದಾಯ",
      profit: "ಅಂದಾಜು ಲಾಭ",
      note: "ಇವು ಮಾದರಿ ಅಂದಾಜುಗಳು. ನಿಜವಾದ ಲಾಭ ಬದಲಾಗಬಹುದು. ಪ್ರಸ್ತುತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಮತ್ತು ಇಳುವರಿ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ."
    },
    hi: {
      land: "जमीन का आकार (एकड़)",
      cost: "अनुमानित लागत",
      income: "अनुमानित आय",
      profit: "अनुमानित लाभ",
      note: "ये नमूना अनुमान हैं। वास्तविक लाभ बदल सकता है। वर्तमान बाजार मूल्य और उपज की जानकारी उपलब्ध नहीं है।"
    }
  }[language];

  return res.json({
    success: true,
    answer:
      "🌱 " + cropName + "\n\n" +
      financeLabels.land + ": " + acres + "\n\n" +
      financeLabels.cost + ": " + money(cost) + "\n" +
      financeLabels.income + ": " + money(income) + "\n" +
      financeLabels.profit + ": " + money(profit) + "\n\n" +
      financeLabels.note
  });
}
  const selectedTopics = cropTopics.filter(
    topic => topic.pattern.test(cropQuestion)
  );

 const fullDetailsQuestion =
  /full details|all information|complete information|tell me about|everything about|ಸಂಪೂರ್ಣ ಮಾಹಿತಿ|ಎಲ್ಲಾ ಮಾಹಿತಿ|ಪೂರ್ಣ ಮಾಹಿತಿ|पूरी जानकारी|संपूर्ण जानकारी/i
    .test(cropQuestion);

const selectedKeys = fullDetailsQuestion
  ? [
      "scientificName",
      "soil",
      "season",
      "temperature",
      "water",
      "duration",
      "planting",
      "fertilizer",
      "pests",
      "diseases",
      "harvesting"
    ]
  : selectedTopics.length
    ? selectedTopics.map(topic => topic.key)
    : ["soil", "season", "water", "duration", "planting"];
  const answerParts = selectedKeys.map(key => {

    const value = key === "scientificName"
      ? record.scientificName
      : information[key];

    return value
      ? labels[key] + ": " + value
      : labels[key] + ": " + labels.unavailable;

  });

  const answer =
    cropName + "\n\n" +
    answerParts.join("\n\n") +
    "\n\n" + labels.note;

  return res.json({
    success: true,
    answer: answer
  });
}

// -------- END 200 CROPS SMART CHATBOT --------
    // SMARTCROP IMPROVED SOIL ASSISTANT

const soilAnswers = [
  {
    pattern: /red soil|ಕೆಂಪು\s*ಮಣ್ಣ|लाल\s*मिट्टी/i,
    en: "Red soil is suitable for crops such as ragi, groundnut and maize, depending on rainfall.",
    kn: "ಕೆಂಪು ಮಣ್ಣಿನಲ್ಲಿ ರಾಗಿ, ನೆಲಗಡಲೆ ಮತ್ತು ಮೆಕ್ಕೆಜೋಳ ಬೆಳೆಯಬಹುದು. ಮಳೆ ಮತ್ತು ನೀರಿನ ಲಭ್ಯತೆಯನ್ನು ಪರಿಗಣಿಸಿ.",
    hi: "लाल मिट्टी में रागी, मूंगफली और मक्का उगा सकते हैं।"
  },
  {
    pattern: /black soil|ಕಪ್ಪು\s*ಮಣ್ಣ|काली\s*मिट्टी/i,
    en: "Black soil can support cotton, sorghum and pulses.",
    kn: "ಕಪ್ಪು ಮಣ್ಣಿನಲ್ಲಿ ಹತ್ತಿ, ಜೋಳ ಮತ್ತು ಬೇಳೆಕಾಳುಗಳನ್ನು ಬೆಳೆಯಬಹುದು.",
    hi: "काली मिट्टी में कपास, ज्वार और दालें उगा सकते हैं।"
  },
  {
    pattern: /clay soil|ಜೇಡಿ|ಜೇಡಿಮಣ್ಣ|चिकनी\s*मिट्टी/i,
    en: "Clay soil retains water. Paddy can be suitable when sufficient water is available.",
    kn: "ಜೇಡಿಮಣ್ಣು ನೀರನ್ನು ಹೆಚ್ಚು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುತ್ತದೆ. ಸಾಕಷ್ಟು ನೀರು ಲಭ್ಯವಿದ್ದರೆ ಭತ್ತ ಬೆಳೆಯಬಹುದು.",
    hi: "चिकनी मिट्टी पानी रोककर रखती है। पर्याप्त पानी होने पर धान उगा सकते हैं।"
  },
  {
    pattern: /sandy soil|ಮರಳು\s*ಮಣ್ಣ|रेतीली\s*मिट्टी/i,
    en: "Sandy soil can support groundnut, watermelon and green gram with suitable irrigation.",
    kn: "ಮರಳು ಮಣ್ಣಿನಲ್ಲಿ ಸೂಕ್ತ ನೀರಾವರಿಯೊಂದಿಗೆ ನೆಲಗಡಲೆ, ಕಲ್ಲಂಗಡಿ ಮತ್ತು ಹೆಸರುಕಾಳು ಬೆಳೆಯಬಹುದು.",
    hi: "रेतीली मिट्टी में उचित सिंचाई के साथ मूंगफली, तरबूज और मूंग उगा सकते हैं।"
  },
  {
    pattern: /laterite|ಲ್ಯಾಟರೈಟ್|ಜಂಬಿಟ್ಟಿಗೆ|लेटराइट/i,
    en: "Laterite soil can support cashew and suitable varieties of ragi with proper soil management.",
    kn: "ಜಂಬಿಟ್ಟಿಗೆ ಮಣ್ಣಿನಲ್ಲಿ ಸೂಕ್ತ ಮಣ್ಣಿನ ನಿರ್ವಹಣೆಯೊಂದಿಗೆ ಗೋಡಂಬಿ ಮತ್ತು ರಾಗಿ ಬೆಳೆಯಬಹುದು.",
    hi: "लेटराइट मिट्टी में उचित प्रबंधन के साथ काजू और रागी उगा सकते हैं।"
  },
  {
    pattern: /alluvial|ಮೆಕ್ಕಲು|जलोढ़/i,
    en: "Alluvial soil can support paddy, maize and vegetables depending on season and irrigation.",
    kn: "ಮೆಕ್ಕಲು ಮಣ್ಣಿನಲ್ಲಿ ಹಂಗಾಮು ಮತ್ತು ನೀರಾವರಿಗೆ ಅನುಗುಣವಾಗಿ ಭತ್ತ, ಮೆಕ್ಕೆಜೋಳ ಮತ್ತು ತರಕಾರಿಗಳನ್ನು ಬೆಳೆಯಬಹುದು.",
    hi: "जलोढ़ मिट्टी में मौसम और सिंचाई के अनुसार धान, मक्का और सब्जियां उगा सकते हैं।"
  }
];

const matchedSoils = soilAnswers.filter(
  item => item.pattern.test(message.normalize("NFC"))
);

const otherTopic =
  /profit|cost|fertilizer|pest|ಲಾಭ|ನಷ್ಟ|ಖರ್ಚು|ಗೊಬ್ಬರ|ಕೀಟ|मुनाफा|खाद|कीट/i.test(message);

if (matchedSoils.length === 1 && !otherTopic) {
  return res.json({
    success: true,
    answer: matchedSoils[0][language]
  });
}

  const answers = {
    en: {
      greeting: "Hello! I am your SmartCrop farming assistant. Ask me about crops, soil, water, fertilizer or farming.",
      soil: "Red soil can support crops such as groundnut and ragi. Choose crops according to rainfall and water availability.",
      water: "Use water-saving methods such as drip irrigation and mulching.",
      fertilizer: "Use soil-test results to choose the correct fertilizer.",
      pest: "Identify the pest first and ask a local agricultural expert about suitable treatment.",
      weather: "Check your local weather forecast before irrigation, spraying or harvesting.",
      askDetails: "Please tell me your soil type, season, rainfall, water availability and land size.",
      noCrops: "No suitable crops were found. Please check your farm details or consult an agricultural expert.",
      result: (best, list, acres) =>
        `For ${acres} acre(s), the highest estimated profit crop is ${best.name}.\nEstimated investment: ₹${best.cost.toLocaleString("en-IN")}.\nEstimated income: ₹${best.income.toLocaleString("en-IN")}.\nEstimated profit: ₹${best.profit.toLocaleString("en-IN")}.\n\nCrop comparison:\n${list}`
    },
    kn: {
      greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ SmartCrop ಕೃಷಿ ಸಹಾಯಕ.",
      soil: "ಕೆಂಪು ಮಣ್ಣಿನಲ್ಲಿ ನೆಲಗಡಲೆ ಮತ್ತು ರಾಗಿ ಮುಂತಾದ ಬೆಳೆಗಳನ್ನು ಬೆಳೆಯಬಹುದು.",
      water: "ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಮಲ್ಚಿಂಗ್ ವಿಧಾನಗಳನ್ನು ಬಳಸಿ ನೀರನ್ನು ಉಳಿಸಬಹುದು.",
      fertilizer: "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆಯ ಆಧಾರದ ಮೇಲೆ ಸರಿಯಾದ ಗೊಬ್ಬರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
      pest: "ಕೀಟವನ್ನು ಗುರುತಿಸಿ ಸ್ಥಳೀಯ ಕೃಷಿ ಅಧಿಕಾರಿಗಳ ಸಲಹೆ ಪಡೆಯಿರಿ.",
      weather: "ನೀರಾವರಿ ಮತ್ತು ಕೊಯ್ಲಿಗೆ ಮೊದಲು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಪರಿಶೀಲಿಸಿ.",
      askDetails: "ದಯವಿಟ್ಟು ಮಣ್ಣಿನ ವಿಧ, ಋತು, ಮಳೆ, ನೀರಿನ ಲಭ್ಯತೆ ಮತ್ತು ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ ತಿಳಿಸಿ.",
      noCrops: "ಈ ವಿವರಗಳಿಗೆ ಸೂಕ್ತ ಬೆಳೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      result: (best, list, acres) =>
        `${acres} ಎಕರೆಗೆ ಹೆಚ್ಚು ಅಂದಾಜು ಲಾಭ ನೀಡುವ ಬೆಳೆ: ${best.name}.\nಅಂದಾಜು ಹೂಡಿಕೆ: ₹${best.cost}.\nಅಂದಾಜು ಆದಾಯ: ₹${best.income}.\nಅಂದಾಜು ಲಾಭ: ₹${best.profit}.\n\nಬೆಳೆಗಳ ಹೋಲಿಕೆ:\n${list}`
    },
    hi: {
      greeting: "नमस्ते! मैं आपका SmartCrop कृषि सहायक हूँ।",
      soil: "लाल मिट्टी में मूंगफली और रागी जैसी फसलें उगाई जा सकती हैं।",
      water: "ड्रिप सिंचाई और मल्चिंग से पानी बचाया जा सकता है।",
      fertilizer: "मिट्टी की जाँच के आधार पर सही खाद चुनें।",
      pest: "कीट की पहचान करके स्थानीय कृषि अधिकारी से सलाह लें।",
      weather: "सिंचाई और कटाई से पहले स्थानीय मौसम पूर्वानुमान देखें।",
      askDetails: "मिट्टी, मौसम, वर्षा, पानी और जमीन का आकार बताएं।",
      noCrops: "इन जानकारियों के लिए उपयुक्त फसल नहीं मिली।",
      result: (best, list, acres) =>
        `${acres} एकड़ के लिए सबसे अधिक अनुमानित लाभ वाली फसल ${best.name} है।\nअनुमानित लागत: ₹${best.cost}.\nअनुमानित आय: ₹${best.income}.\nअनुमानित लाभ: ₹${best.profit}.\n\nफसल तुलना:\n${list}`
    }
  };

  const a = answers[language];

  let soil = null;

  if (/red soil|ಕೆಂಪು ಮಣ್ಣು|ಕೆಂಪುಮಣ್ಣು|लाल मिट्टी/.test(message)) soil = "red";
  else if (/black soil|ಕಪ್ಪು ಮಣ್ಣು|काली मिट्टी/.test(message)) soil = "black";
  else if (/clay soil|ಜೇಡಿ ಮಣ್ಣು|चिकनी मिट्टी/.test(message)) soil = "clay";
  else if (/sandy soil|ಮರಳು ಮಣ್ಣು|रेतीली मिट्टी/.test(message)) soil = "sandy";
  else if (/laterite soil|ಕೆಂಪು ಜಂಬಿಟ್ಟಿಗೆ|लेटराइट मिट्टी/.test(message)) soil = "laterite";
  else if (/alluvial soil|ಮೆಕ್ಕಲು ಮಣ್ಣು|जलोढ़ मिट्टी/.test(message)) soil = "alluvial";

  let season = null;

  if (/kharif|ಖರೀಫ್|ಮುಂಗಾರು|ಮಳೆಗಾಲ|खरीफ/.test(message)) season = "kharif";
  else if (/rabi|ರಬಿ|ಚಳಿಗಾಲ|रबी/.test(message)) season = "rabi";
  else if (/summer|ಬೇಸಿಗೆ|गर्मी|ग्रीष्म/.test(message)) season = "summer";

  let water = null;

  if (/low water|ಕಡಿಮೆ ನೀರು|ಕಡಿಮೆ ನೀರಿನ|कम पानी/.test(message)) water = "low";
  else if (/medium water|ಮಧ್ಯಮ ನೀರು|ಮಧ್ಯಮ ನೀರಿನ|ಸಾಧಾರಣ ನೀರು|मध्यम पानी/.test(message)) water = "medium";
  else if (/high water|ಹೆಚ್ಚು ನೀರು|ಹೆಚ್ಚಿನ ನೀರಿನ|ज्यादा पानी|अधिक पानी/.test(message)) water = "high";

  let rainfall = null;

  if (/heavy rain|ಹೆಚ್ಚಿನ ಮಳೆ|ಭಾರಿ ಮಳೆ|भारी बारिश/.test(message)) rainfall = 1400;
  else if (/medium rain|ಮಧ್ಯಮ ಮಳೆ|ಸಾಧಾರಣ ಮಳೆ|मध्यम बारिश/.test(message)) rainfall = 800;
  else if (/low rain|ಕಡಿಮೆ ಮಳೆ|ಅಲ್ಪ ಮಳೆ|कम बारिश/.test(message)) rainfall = 400;

  const landMatch = message.match(
    /(\d+(?:\.\d+)?)\s*(acres?|acre|ಎಕರೆ|ಎಕರೆಗಳು|ಗುಂಟೆ|ಗುಂಟೆಗಳು|gunta|guntas|एकड़|एकड़)/i
  );

  if (soil && season && water && rainfall !== null && landMatch) {
    const landSize = Number(landMatch[1]);
    const unitText = landMatch[2].toLowerCase();
    const landUnit = /gunta|ಗುಂಟೆ/.test(unitText) ? "gunta" : "acre";

    const result = getRecommendations({
      soil,
      season,
      water,
      rainfall,
      landSize,
      landUnit
    }, language);

    if (!result.bestCrop) {
      return res.json({
        success: true,
        answer: a.noCrops
      });
    }

  const safeMoney = value =>
  Number.isFinite(value)
    ? "₹" + value.toLocaleString("en-IN")
    : {
        en: "Data not available",
        kn: "ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ",
        hi: "जानकारी उपलब्ध नहीं है"
      }[language];

const financialLabels = {
  en: ["Investment", "Income", "Profit"],
  kn: ["ಹೂಡಿಕೆ", "ಆದಾಯ", "ಲಾಭ"],
  hi: ["लागत", "आय", "लाभ"]
}[language];

const list = result.recommendations.map((crop, index) =>
  `${index + 1}. ${crop.name}\n` +
  `${financialLabels[0]}: ${safeMoney(crop.cost)}\n` +
  `${financialLabels[1]}: ${safeMoney(crop.income)}\n` +
  `${financialLabels[2]}: ${safeMoney(crop.profit)}`
).join("\n\n");

    return res.json({
      success: true,
     answer: {
  en: "Potential crop matches",
  kn: "ಸಂಭಾವ್ಯ ಸೂಕ್ತ ಬೆಳೆಗಳು",
  hi: "संभावित उपयुक्त फसलें"
}[language] + "\n\n" +
list + "\n\n" +
{
  en: "Financial values are sample estimates. Actual profit may vary.",
  kn: "ಇವು ಮಾದರಿ ಅಂದಾಜುಗಳು. ನಿಜವಾದ ಲಾಭ ಬದಲಾಗಬಹುದು.",
  hi: "ये उदाहरण आधारित अनुमान हैं। वास्तविक लाभ बदल सकता है।"
}[language]
    });
  }
const farmingQuestion =
  /crop|farm|agriculture|rain|soil|water|season|acre|gunta|ಬೆಳೆ|ಕೃಷಿ|ಮಣ್ಣು|ಮಳೆ|ನೀರು|ಎಕರೆ|ಗುಂಟೆ|ಫಸಲು|फसल|खेती|कृषि|मिट्टी|बारिश|पानी|एकड़/i.test(message);

const unrelatedAnswers = {
  en: "Sorry! I am SmartCrop, your farming assistant. Please ask questions related to agriculture.",

  kn: "ಕ್ಷಮಿಸಿ! ನಾನು SmartCrop ಕೃಷಿ ಸಹಾಯಕ. ದಯವಿಟ್ಟು ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದ ಪ್ರಶ್ನೆಗಳನ್ನು ಮಾತ್ರ ಕೇಳಿ.",

  hi: "क्षमा करें! मैं SmartCrop कृषि सहायक हूँ। कृपया कृषि से संबंधित प्रश्न पूछें।"
};

let answer = farmingQuestion
  ? a.askDetails
  : unrelatedAnswers[language];

  if (/hello|ನಮಸ್ಕಾರ|ಹಾಯ್|नमस्ते|हाय/.test(message)) {
    answer = a.greeting;
  } else if (/soil|ಮಣ್ಣು|ಮಣ್ಣಿನ|मिट्टी/.test(message)) {
    answer = a.soil;
  } else if (/water|ನೀರು|ನೀರಾವರಿ|पानी|सिंचाई/.test(message)) {
    answer = a.water;
  } else if (/fertilizer|manure|ಗೊಬ್ಬರ|खाद|उर्वरक/.test(message)) {
    answer = a.fertilizer;
  } else if (/pest|insect|ಕೀಟ|ಹುಳು|कीट|कीड़ा/.test(message)) {
    answer = a.pest;
  } else if (/weather|ಹವಾಮಾನ|मौसम/.test(message)) {
    answer = a.weather;
  }

  res.json({
    success: true,
    answer
  });
});

// ---------------- START SERVER ----------------
// ---------------- KANNADA VOICE API ----------------

app.post("/api/kannada-voice", (req, res) => {

    if (!req.session.user) {
        return res.status(401).json({
            error: "Please login first"
        });
    }

    const text = req.body?.text;

    if (
        typeof text !== "string" ||
        !text.trim() ||
        text.length > 5000
    ) {
        return res.status(400).json({
            error: "Invalid text"
        });
    }

    const { spawn } = require("child_process");

    const python = spawn("python", [
        path.join(__dirname, "kannada_voice.py")
    ]);

    const audio = [];
    let errorMessage = "";

    const timer = setTimeout(() => {
        python.kill();

        if (!res.headersSent) {
            res.status(504).json({
                error: "Voice generation timed out"
            });
        }
    }, 60000);

    python.stdout.on("data", data => {
        audio.push(data);
    });

    python.stderr.on("data", data => {
        errorMessage += data.toString();
    });

    python.stdin.on("error", error => {
        console.error(error.message);
    });

    python.on("error", error => {
        clearTimeout(timer);
        console.error(error.message);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Python could not start"
            });
        }
    });

    python.on("close", code => {

        clearTimeout(timer);

        if (res.headersSent) return;

        if (code !== 0 || audio.length === 0) {
            console.error(errorMessage);

            return res.status(500).json({
                error: "Kannada voice generation failed"
            });
        }

        res.setHeader("Content-Type", "audio/mpeg");
        res.send(Buffer.concat(audio));

    });

    python.stdin.end(text, "utf8");

});

console.log("Kannada Voice API Enabled!");
app.listen(PORT, () => {
  console.log(`SmartCrop running at http://localhost:${PORT}`);
});
