// Load values such as GEMINI_API_KEY from the .env file.
require("dotenv").config();

// Import Express for the server and the Google Gen AI SDK for Gemini.
const express = require("express");
const http = require("http");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

// Create the application and let it read JSON sent by the browser.
const app = express();

// CORS: lets the Android app (Capacitor) call this server from its own
// origin ("https://localhost" / "capacitor://localhost"). Without this the
// phone's web view blocks every /api request. Written by hand so no extra
// package is needed.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.use(express.json({ limit: "12mb" }));

// Serve the frontend from www/, which is the location used by Capacitor.
app.use(express.static(path.join(__dirname, "www")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "www", "index.html")));

// Connect to Gemini using the API key kept in .env.
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const MODEL = "gemini-flash-latest";

function createFallbackRecipeResponse(ingredients) {
  const ingredientText = typeof ingredients === "string" && ingredients.trim() ? ingredients.trim() : "your ingredients";
  return {
    recipes: [
      { title: `Quick ${ingredientText} Stir-Fry`, time: "20 min", difficulty: "Easy", calories: "430 kcal", match: "88%", description: "A fast, balanced meal you can make with pantry staples.", ingredients: ["2 cups chopped vegetables", "1 tbsp oil", "2 eggs or protein of choice"] },
      { title: `Comforting ${ingredientText} Bowl`, time: "25 min", difficulty: "Easy", calories: "500 kcal", match: "84%", description: "A cozy bowl with warm spices and simple prep.", ingredients: ["1 cup cooked grains", "1 cup chopped vegetables", "1 tbsp seasoning"] },
      { title: `${ingredientText} Wraps`, time: "15 min", difficulty: "Easy", calories: "390 kcal", match: "81%", description: "A light lunch option that comes together in minutes.", ingredients: ["2 tortillas", "1 cup chopped fillings", "2 tbsp sauce"] },
      { title: `${ingredientText} Pasta`, time: "20 min", difficulty: "Medium", calories: "460 kcal", match: "79%", description: "A simple pasta dinner with plenty of flavor.", ingredients: ["8 oz pasta", "1 cup sauce", "1 cup vegetables"] },
    ],
  };
}

function createFallbackMealPlanResponse() {
  return {
    plan: [
      { day: "Monday", meals: { breakfast: { title: "Greek yogurt bowl", calories: "350 kcal", nutrition: "Protein 20g • Carbs 32g • Fat 10g", description: "A quick breakfast with fruit and nuts.", ingredients: ["yogurt", "berries", "granola"], steps: ["Mix and serve."] }, lunch: { title: "Turkey wrap", calories: "420 kcal", nutrition: "Protein 24g • Carbs 38g • Fat 14g", description: "A portable lunch for busy days.", ingredients: ["wrap", "turkey", "lettuce"], steps: ["Assemble and roll."] }, dinner: { title: "Sheet-pan chicken", calories: "560 kcal", nutrition: "Protein 35g • Carbs 28g • Fat 20g", description: "Roast chicken and vegetables for an easy dinner.", ingredients: ["chicken", "potatoes", "broccoli"], steps: ["Roast until cooked through."] }, snack: { title: "Apple slices", calories: "120 kcal", nutrition: "Fiber 4g • Carbs 25g • Fat 0g", description: "A simple snack with natural sweetness.", ingredients: ["apple"], steps: ["Slice and serve."] } } },
      { day: "Tuesday", meals: { breakfast: { title: "Oatmeal with banana", calories: "330 kcal", nutrition: "Protein 10g • Carbs 48g • Fat 8g", description: "Warm and filling to start the day.", ingredients: ["oats", "banana", "milk"], steps: ["Cook and top with fruit."] }, lunch: { title: "Chicken salad", calories: "410 kcal", nutrition: "Protein 27g • Carbs 20g • Fat 16g", description: "A light lunch with crunch and protein.", ingredients: ["chicken", "lettuce", "cucumber"], steps: ["Toss together."] }, dinner: { title: "Vegetable curry", calories: "540 kcal", nutrition: "Protein 15g • Carbs 60g • Fat 18g", description: "A cozy curry with rice.", ingredients: ["curry paste", "vegetables", "rice"], steps: ["Simmer and serve over rice."] }, snack: { title: "Trail mix", calories: "180 kcal", nutrition: "Protein 6g • Carbs 20g • Fat 10g", description: "A convenient snack for between meals.", ingredients: ["nuts", "seeds"], steps: ["Serve as is."] } } },
      { day: "Wednesday", meals: { breakfast: { title: "Scrambled eggs", calories: "300 kcal", nutrition: "Protein 18g • Carbs 2g • Fat 23g", description: "A classic breakfast that cooks in minutes.", ingredients: ["eggs", "toast"], steps: ["Scramble and serve."] }, lunch: { title: "Quinoa bowl", calories: "450 kcal", nutrition: "Protein 20g • Carbs 50g • Fat 15g", description: "A wholesome bowl with plenty of texture.", ingredients: ["quinoa", "beans", "veg"], steps: ["Combine everything."] }, dinner: { title: "Salmon and rice", calories: "580 kcal", nutrition: "Protein 34g • Carbs 42g • Fat 24g", description: "A simple seafood dinner with greens.", ingredients: ["salmon", "rice", "spinach"], steps: ["Bake and serve."] }, snack: { title: "Cheese cubes", calories: "150 kcal", nutrition: "Protein 8g • Carbs 1g • Fat 12g", description: "A quick savory option.", ingredients: ["cheese"], steps: ["Slice and serve."] } } },
      { day: "Thursday", meals: { breakfast: { title: "Smoothie", calories: "320 kcal", nutrition: "Protein 16g • Carbs 42g • Fat 8g", description: "Blend fruit and yogurt for a fast breakfast.", ingredients: ["banana", "yogurt", "milk"], steps: ["Blend until smooth."] }, lunch: { title: "Pasta salad", calories: "440 kcal", nutrition: "Protein 18g • Carbs 54g • Fat 14g", description: "A cold lunch that keeps well.", ingredients: ["pasta", "chickpeas", "veg"], steps: ["Toss together."] }, dinner: { title: "Stir-fry tofu", calories: "520 kcal", nutrition: "Protein 22g • Carbs 36g • Fat 22g", description: "A fast dinner with plenty of vegetables.", ingredients: ["tofu", "broccoli", "soy sauce"], steps: ["Stir-fry until crisp."] }, snack: { title: "Banana", calories: "105 kcal", nutrition: "Carbs 27g • Fiber 3g • Fat 0g", description: "An easy fruit snack.", ingredients: ["banana"], steps: ["Peel and eat."] } } },
      { day: "Friday", meals: { breakfast: { title: "Avocado toast", calories: "340 kcal", nutrition: "Protein 12g • Carbs 30g • Fat 18g", description: "A simple breakfast with healthy fats.", ingredients: ["bread", "avocado"], steps: ["Toast and top."] }, lunch: { title: "Bean soup", calories: "400 kcal", nutrition: "Protein 21g • Carbs 48g • Fat 10g", description: "A comforting lunch with fiber.", ingredients: ["beans", "broth", "onions"], steps: ["Simmer until thick."] }, dinner: { title: "Taco night", calories: "550 kcal", nutrition: "Protein 28g • Carbs 44g • Fat 20g", description: "A fun dinner with a variety of toppings.", ingredients: ["tortillas", "meat or beans", "lettuce"], steps: ["Assemble and serve."] }, snack: { title: "Hummus", calories: "140 kcal", nutrition: "Protein 5g • Carbs 10g • Fat 8g", description: "A creamy dip with crunchy vegetables.", ingredients: ["hummus", "carrot sticks"], steps: ["Serve together."] } } },
      { day: "Saturday", meals: { breakfast: { title: "Pancakes", calories: "360 kcal", nutrition: "Protein 11g • Carbs 50g • Fat 12g", description: "A weekend breakfast with fruit.", ingredients: ["pancake mix", "fruit"], steps: ["Cook and top."] }, lunch: { title: "Mediterranean plate", calories: "430 kcal", nutrition: "Protein 19g • Carbs 34g • Fat 16g", description: "A colorful lunch full of fresh flavors.", ingredients: ["cucumber", "tomatoes", "cheese"], steps: ["Arrange and serve."] }, dinner: { title: "Pizza", calories: "600 kcal", nutrition: "Protein 25g • Carbs 68g • Fat 22g", description: "A relaxed dinner that is easy to customize.", ingredients: ["pizza dough", "sauce", "toppings"], steps: ["Bake and slice."] }, snack: { title: "Yogurt", calories: "130 kcal", nutrition: "Protein 10g • Carbs 12g • Fat 4g", description: "A simple protein-rich snack.", ingredients: ["yogurt"], steps: ["Serve chilled."] } } },
      { day: "Sunday", meals: { breakfast: { title: "Bagel with cream cheese", calories: "320 kcal", nutrition: "Protein 12g • Carbs 38g • Fat 12g", description: "A quick breakfast for a slower morning.", ingredients: ["bagel", "cream cheese"], steps: ["Toast and spread."] }, lunch: { title: "Soup and sandwich", calories: "410 kcal", nutrition: "Protein 20g • Carbs 42g • Fat 14g", description: "A comforting lunch with familiar flavors.", ingredients: ["soup", "sandwich bread"], steps: ["Serve together."] }, dinner: { title: "Roasted vegetables", calories: "500 kcal", nutrition: "Protein 16g • Carbs 36g • Fat 20g", description: "A flexible dinner with grains or protein.", ingredients: ["vegetables", "grain", "protein"], steps: ["Roast and serve."] }, snack: { title: "Orange", calories: "60 kcal", nutrition: "Vitamin C • Carbs 15g • Fat 0g", description: "A refreshing end to the day.", ingredients: ["orange"], steps: ["Peel and eat."] } } },
    ],
  };
}

function createFallbackScanResponse() {
  return { ingredients: ["tomato", "onion", "garlic", "olive oil"] };
}

function createFallbackChatReply(message) {
  return {
    reply: `I can help with that. For now, I’m using a local cooking suggestion because the AI service is unavailable. Try: ${message || "a simple recipe idea"}.`,
  };
}

function isGeminiAvailable() {
  return Boolean(ai && process.env.GEMINI_API_KEY);
}

function handleGeminiError(res, fallbackMessage, logLabel) {
  console.error(`${logLabel}:`, fallbackMessage);
  return res.status(500).json({ error: fallbackMessage });
}

async function runWithGeminiFallback({ res, fallbackData, request, errorLabel, successHandler }) {
  try {
    const data = await request();
    if (typeof successHandler === "function") {
      return successHandler(data, res);
    }
    return res.json(data);
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    console.error(`${errorLabel}:`, message);
    return res.json(fallbackData());
  }
}

// Create recipe ideas based on ingredients entered by the user.
app.post("/api/recipes", async (req, res) => {
  const { ingredients } = req.body;
  if (typeof ingredients !== "string" || !ingredients.trim()) {
    return res.status(400).json({ error: "Please list a few ingredients first." });
  }

  if (!isGeminiAvailable()) {
    return res.json(createFallbackRecipeResponse(ingredients));
  }

  const request = async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are a professional chef assistant. Suggest 4 realistic recipes using mostly these ingredients: ${ingredients.trim()}. For every ingredient, include a useful quantity or amount when reasonable (for example, "2 chicken breasts" or "1 cup rice"). Reply ONLY with JSON in this exact shape: {"recipes":[{"title":"string","time":"e.g. 25 min","difficulty":"Easy|Medium|Hard","calories":"e.g. 420 kcal","match":"e.g. 92%","description":"one short sentence","ingredients":["quantity and ingredient"]}]}`,
      config: { temperature: 0.8, responseMimeType: "application/json" },
    });
    const data = JSON.parse(response.text || "{}");
    if (!Array.isArray(data.recipes)) throw new Error("Invalid recipe response.");
    return { recipes: data.recipes };
  };

  return runWithGeminiFallback({
    res,
    fallbackData: () => createFallbackRecipeResponse(ingredients),
    request,
    errorLabel: "Recipe generation error",
  });
});

// Build a personalised seven-day meal plan from the user's food preferences.
app.post("/api/meal-plan", async (req, res) => {
  const { dietType, calorieGoal, ingredients, allergies } = req.body || {};
  const preferences = {
    dietType: typeof dietType === "string" ? dietType.trim() : "No preference",
    calorieGoal: typeof calorieGoal === "string" ? calorieGoal.trim() : "Balanced",
    ingredients: typeof ingredients === "string" ? ingredients.trim() : "No specific ingredients",
    allergies: typeof allergies === "string" ? allergies.trim() : "None stated",
  };

  const prompt = `You are a practical nutrition-aware chef creating a weekly meal plan.
Create a complete Monday-to-Sunday meal plan using these preferences:
- Diet type: ${preferences.dietType || "No preference"}
- Daily calorie goal: ${preferences.calorieGoal || "Balanced"}
- Available ingredients to use where suitable: ${preferences.ingredients || "No specific ingredients"}
- Allergies or foods to avoid: ${preferences.allergies || "None stated"}

Respect allergies strictly. Include breakfast, lunch, dinner, and one snack every day. Meals should be varied, realistic, concise, and suitable for home cooking.
Reply ONLY with valid JSON in this exact shape:
{"plan":[{"day":"Monday","meals":{"breakfast":{"title":"string","calories":"e.g. 380 kcal","nutrition":"e.g. Protein 18g • Carbs 45g • Fat 12g","description":"short description","ingredients":["item"],"steps":["step"]},"lunch":{"title":"string","calories":"string","nutrition":"string","description":"string","ingredients":["item"],"steps":["step"]},"dinner":{"title":"string","calories":"string","nutrition":"string","description":"string","ingredients":["item"],"steps":["step"]},"snack":{"title":"string","calories":"string","nutrition":"string","description":"string","ingredients":["item"],"steps":["step"]}}}]}`;

  if (!isGeminiAvailable()) {
    return res.json(createFallbackMealPlanResponse());
  }

  const request = async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: { temperature: 0.75, responseMimeType: "application/json" },
    });
    const data = JSON.parse(response.text || "{}");
    if (!Array.isArray(data.plan) || data.plan.length !== 7) {
      throw new Error("Invalid meal-plan response.");
    }
    return { plan: data.plan };
  };

  return runWithGeminiFallback({
    res,
    fallbackData: () => createFallbackMealPlanResponse(),
    request,
    errorLabel: "Meal plan generation error",
  });
});

// Read ingredients from a kitchen photo.
app.post("/api/scan", async (req, res) => {
  const { imageBase64, mimeType } = req.body;
  if (typeof imageBase64 !== "string" || !imageBase64.trim()) {
    return res.status(400).json({ error: "No image was received." });
  }

  if (!isGeminiAvailable()) {
    return res.json(createFallbackScanResponse());
  }

  const request = async () => {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [
        { text: 'List the distinct food ingredients visible in this image. Reply ONLY as JSON: {"ingredients":["ingredient"]}' },
        { inlineData: { mimeType: mimeType || "image/jpeg", data: imageBase64 } },
      ] }],
      config: { temperature: 0.4, responseMimeType: "application/json" },
    });
    const data = JSON.parse(response.text || "{}");
    if (!Array.isArray(data.ingredients)) throw new Error("Invalid scan response.");
    return { ingredients: data.ingredients };
  };

  return runWithGeminiFallback({
    res,
    fallbackData: () => createFallbackScanResponse(),
    request,
    errorLabel: "Ingredient scan error",
  });
});

// Answer cooking questions in the Flo chat assistant.
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  // Check that the user included a non-empty message.
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ reply: "Please type a cooking question first." });
  }

  if (!isGeminiAvailable()) {
    return res.json(createFallbackChatReply(message));
  }

  const request = async () => {
    // Ask Gemini to answer as the AI Recipe Finder cooking coach.
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: message.trim(),
      config: {
        systemInstruction:
          "You are Flo, a friendly, encouraging AI cooking assistant inside the AI Recipe Finder app. Give concise, practical cooking and recipe advice.",
        temperature: 0.7,
      },
    });

    return { reply: response.text || "I couldn't create a reply just now. Please try again." };
  };

  return runWithGeminiFallback({
    res,
    fallbackData: () => createFallbackChatReply(message),
    request,
    errorLabel: "Gemini chat error",
  });
});

function startServer(port = process.env.PORT || 3000, onListening) {
  const requestedPort = Number(port);
  const maxAttempts = 20;
  const host = process.env.HOST || "127.0.0.1";

  const tryListen = (currentPort, attempt) => {
    const server = http.createServer(app);

    const handleError = (error) => {
      if (error.code === "EADDRINUSE" && attempt < maxAttempts) {
        console.warn(`Port ${currentPort} is busy. Trying ${currentPort + 1} instead.`);
        if (server.listening) {
          server.close(() => {
            tryListen(currentPort + 1, attempt + 1);
          });
        } else {
          tryListen(currentPort + 1, attempt + 1);
        }
        return;
      }

      console.error("Server startup error:", error);
      if (typeof onListening === "function") {
        onListening(null, null, error);
      }
    };

    server.once("error", handleError);

    try {
      server.listen(currentPort, host, () => {
        const actualPort = server.address().port;
        console.log(`AI Recipe Finder is running at http://localhost:${actualPort}`);
        if (typeof onListening === "function") {
          onListening(server, actualPort);
        }
      });
    } catch (error) {
      handleError(error);
    }

    return server;
  };

  return tryListen(requestedPort, 1);
}

if (require.main === module) {
  startServer();
}

// Vercel needs this file to export the Express app itself (a callable
// request handler) so it can wrap it as a single Vercel Function.
// Previously this exported a plain object with no callable app, which is
// why Vercel's function invocation was failing — there was nothing valid
// for it to invoke.
module.exports = app;
module.exports.startServer = startServer;
module.exports.createFallbackRecipeResponse = createFallbackRecipeResponse;
module.exports.createFallbackMealPlanResponse = createFallbackMealPlanResponse;
module.exports.createFallbackScanResponse = createFallbackScanResponse;
module.exports.createFallbackChatReply = createFallbackChatReply;
module.exports.runWithGeminiFallback = runWithGeminiFallback;
