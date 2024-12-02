const puppeteer = require("puppeteer");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();
const authConfig = require('./config/auth');

const app = express();
const port = process.env.PORT || 3000;

// تمكين CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');
app.use(cors({
  origin: allowedOrigins
}));

// الاتصال بقاعدة بيانات MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// إضافة وظيفة مساعدة للانتظار
const waitForNavigation = async (page, timeout = 120000) => {
  try {
    await Promise.race([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout }),
      page.waitForSelector('body', { timeout })
    ]);
  } catch (error) {
    console.log('Navigation timeout, continuing...');
  }
};

// إنشاء نموذج للجلسات
const sessionSchema = new mongoose.Schema({
  siteName: String,
  name: String,
  value: String,
  domain: String,
  path: String,
  expires: Number,
  httpOnly: Boolean,
  secure: Boolean,
});

const Session = mongoose.model('Session', sessionSchema);

async function extractSessionToken(siteName, res) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-zygote",
        "--single-process",
      ],
      timeout: 120000
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(120000);
    await page.setDefaultTimeout(120000);
    
    const site = authConfig[siteName];

    if (!site) {
      throw new Error(`موقع ${siteName} غير موجود في الإعدادات`);
    }

    console.log(`بدء عملية تسجيل الدخول لـ ${siteName}...`);

    // الذهاب إلى صفحة تسجيل الدخول
    await page.goto(site.loginUrl, {
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    console.log(`تم الوصول إلى صفحة تسجيل الدخول لـ ${siteName}`);

    // إدخال بيانات تسجيل الدخول
    await page.type(site.selectors.username, site.credentials.email);
    await page.type(site.selectors.password, site.credentials.password);

    console.log(`تم إدخال بيانات تسجيل الدخول لـ ${siteName}`);

    // النقر على زر تسجيل الدخول
    await Promise.all([
      page.click(site.selectors.loginButton),
      waitForNavigation(page)
    ]);

    console.log(`تم النقر على زر تسجيل الدخول لـ ${siteName}`);

    // انتظار إضافي للتأكد من اكتمال التحميل
    await page.waitForTimeout(5000);

    // استخراج الكوكيز بعد تسجيل الدخول
    const cookies = await page.cookies();

    // حذف الجلسات القديمة للموقع المحدد
    await Session.deleteMany({ siteName });
    console.log(`تم حذف الجلسات القديمة لـ ${siteName}`);

    // البحث عن توكين الجلسة
    const sessionToken = cookies.find(
      (cookie) => cookie.name === site.sessionCookie
    );

    if (sessionToken) {
      // حفظ التوكين في قاعدة البيانات
      const sessionData = new Session({
        siteName,
        name: sessionToken.name,
        value: sessionToken.value,
        domain: sessionToken.domain,
        path: sessionToken.path,
        expires: sessionToken.expires,
        httpOnly: sessionToken.httpOnly,
        secure: sessionToken.secure,
      });

      await sessionData.save();
      console.log(`تم حفظ توكين الجلسة بنجاح لـ ${siteName}`);

      res.json({ success: true, token: sessionData });
    } else {
      console.log(`لم يتم العثور على توكين الجلسة لـ ${siteName}`);
      res.json({ success: false, message: `لم يتم العثور على توكين الجلسة لـ ${siteName}` });
    }
  } catch (error) {
    console.error(`حدث خطأ مع ${siteName}:`, error);
    res.status(500).json({ 
      success: false, 
      message: `حدث خطأ أثناء استخراج التوكين لـ ${siteName}`,
      error: error.message 
    });
  } finally {
    if (browser) {
      await browser.close();
      console.log(`تم إغلاق المتصفح لـ ${siteName}`);
    }
  }
}

// نقطة النهاية للحصول على جميع المواقع المتاحة
app.get("/available-sites", (req, res) => {
  const sites = Object.keys(authConfig);
  res.json({ success: true, sites });
});

// نقطة النهاية لجلب أحدث بيانات الجلسة لموقع محدد
app.get("/get-session/:siteName", async (req, res) => {
  try {
    const { siteName } = req.params;
    
    if (!authConfig[siteName]) {
      return res.status(404).json({ success: false, message: "الموقع غير موجود" });
    }

    // استرجاع أحدث جلسة من قاعدة البيانات
    const sessionData = await Session.findOne({ siteName }).sort({ _id: -1 });

    if (sessionData) {
      res.json({ success: true, session: sessionData });
    } else {
      res.json({ success: false, message: "لم يتم العثور على بيانات جلسة." });
    }
  } catch (error) {
    console.error("Error retrieving session data:", error);
    res.status(500).json({ success: false, message: "خطأ في استرجاع بيانات الجلسة." });
  }
});

// نقطة النهاية لبدء جلسة جديدة لموقع محدد
app.get("/start-session/:siteName", (req, res) => {
  const { siteName } = req.params;
  
  if (!authConfig[siteName]) {
    return res.status(404).json({ success: false, message: "الموقع غير موجود" });
  }

  extractSessionToken(siteName, res);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
