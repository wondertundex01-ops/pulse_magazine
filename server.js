const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const DATA_PATH = path.join(__dirname, "data", "content.json");

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

function readStore() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeStore(next) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(next, null, 2), "utf-8");
}

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Email Configuration
let transporter;
let emailEnabled = false;

// Initialize transporter with Ethereal Email (test service) or Gmail (production)
async function initializeEmailTransporter() {
  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use Gmail if credentials provided
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      // Use Ethereal Email for testing (works immediately without setup)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log("📧 Using Ethereal Email Test Service (no Gmail setup needed)");
    }

    // Verify transporter connectivity before enabling email delivery
    await transporter.verify();
    emailEnabled = true;
  } catch (err) {
    transporter = null;
    emailEnabled = false;
    console.warn(
      "Email transporter initialization failed. Newsletter subscriptions will still work, but email delivery is disabled.",
      err
    );
  }
}

// Call this at startup
initializeEmailTransporter();

// Email Templates
function getWelcomeEmailTemplate(email) {
  return {
    subject: "Welcome to Pulse Magazine 🎉",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2328; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f6f5f1; }
    .header { background: linear-gradient(145deg, #101827, #1f2937); color: #f9fafb; padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 900; }
    .header .tagline { color: #fca5a5; font-size: 14px; margin-top: 5px; }
    .content { background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; }
    .section { margin-bottom: 25px; }
    .section h2 { color: #b4233c; font-size: 18px; margin: 0 0 12px 0; font-weight: 700; }
    .section p { margin: 0 0 12px 0; color: #5f6672; }
    .feature-list { list-style: none; padding: 0; margin: 0; }
    .feature-list li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .feature-list li:last-child { border-bottom: none; }
    .feature-list li:before { content: "✓ "; color: #b4233c; font-weight: bold; margin-right: 8px; }
    .cta-button { display: inline-block; background: #b4233c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 15px 0; }
    .cta-button:hover { background: #901d31; }
    .footer { background: #f6f5f1; padding: 20px; text-align: center; font-size: 12px; color: #5f6672; border-top: 1px solid #e5e7eb; }
    .footer a { color: #b4233c; text-decoration: none; }
    .categories { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
    .category-box { background: #f6f5f1; padding: 15px; border-radius: 8px; border-left: 4px solid #b4233c; }
    .category-box strong { color: #1f2328; display: block; margin-bottom: 5px; }
    .category-box small { color: #5f6672; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pulse<span style="color: #fca5a5;">Magazine</span></h1>
      <p class="tagline">Editorial storytelling across tech, culture, music, and design</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Welcome, ${email}! 👋</h2>
        <p>Thank you for subscribing to Pulse Magazine. You're now part of our growing community of curious readers who love thoughtful, curated storytelling.</p>
      </div>

      <div class="section">
        <h2>What You'll Get 📬</h2>
        <ul class="feature-list">
          <li><strong>Weekly Digest</strong> - Handpicked stories delivered to your inbox every week</li>
          <li><strong>Editor's Notes</strong> - Behind-the-scenes insights from our editorial team</li>
          <li><strong>Long-form Recommendations</strong> - Deep dives into topics you care about</li>
          <li><strong>Exclusive Content</strong> - Early access to new articles and special features</li>
          <li><strong>No Spam Promise</strong> - Only meaningful content, no fluff</li>
        </ul>
      </div>

      <div class="section">
        <h2>Explore Our Categories 🎯</h2>
        <div class="categories">
          <div class="category-box">
            <strong>Tech</strong>
            <small>AI, software, devices, and the future of product experiences</small>
          </div>
          <div class="category-box">
            <strong>Culture</strong>
            <small>Film, visual arts, and creator economy stories</small>
          </div>
          <div class="category-box">
            <strong>Music</strong>
            <small>Industry shifts, sonic trends, and artist profiles</small>
          </div>
          <div class="category-box">
            <strong>Design</strong>
            <small>Architecture, product design, and urban futures</small>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Next Steps 🚀</h2>
        <p>Visit Pulse Magazine to browse our latest stories and discover content that resonates with you.</p>
        <a href="/" class="cta-button">Explore Pulse Magazine</a>
      </div>

      <div class="section">
        <h2>Questions? 💬</h2>
        <p>If you have any questions or feedback, feel free to reach out to us at <strong>contact@pulsemagazine.com</strong> or visit our <a href="/contact.html" style="color: #b4233c;">Contact Page</a>.</p>
      </div>

      <div class="section" style="border-top: 2px solid #e5e7eb; padding-top: 15px; font-size: 13px; color: #5f6672;">
        <p>✨ <strong>Pro Tip:</strong> Add our email to your contacts so our newsletters always land in your inbox.</p>
      </div>
    </div>

    <div class="footer">
      <p>© 2026 Pulse Magazine. Editorial storytelling platform.<br>
      <a href="/">Visit our website</a> | 
      <a href="/contact.html">Contact us</a></p>
      <p style="margin-top: 10px; font-size: 11px;">
        <a href="#" style="color: #5f6672;">Manage Preferences</a> | 
        <a href="#" style="color: #5f6672;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Welcome to Pulse Magazine!

Thank you for subscribing. You're now part of our community of curious readers.

WHAT YOU'LL GET:
✓ Weekly Digest - Handpicked stories delivered every week
✓ Editor's Notes - Behind-the-scenes insights
✓ Long-form Recommendations - Deep dives into topics you care about
✓ Exclusive Content - Early access to new articles
✓ No Spam - Only meaningful content

EXPLORE OUR CATEGORIES:
- Tech: AI, software, devices, and the future of product experiences
- Culture: Film, visual arts, and creator economy stories
- Music: Industry shifts, sonic trends, and artist profiles
- Design: Architecture, product design, and urban futures

Next, visit Pulse Magazine to browse our latest stories!

Questions? Contact us at contact@pulsemagazine.com

© 2026 Pulse Magazine
    `
  };
}

function getWeeklyDigestTemplate(email, topArticles = []) {
  const articlesHtml = topArticles.slice(0, 5).map(article => `
    <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
      <h3 style="margin: 0 0 5px 0; color: #1f2328; font-size: 16px;">
        <a href="${BASE_URL}/article.html?slug=${article.slug}" style="color: #b4233c; text-decoration: none;">
          ${article.title}
        </a>
      </h3>
      <p style="margin: 5px 0; color: #5f6672; font-size: 13px;">${article.excerpt || ''}</p>
      <a href="${BASE_URL}/article.html?slug=${article.slug}" style="color: #b4233c; text-decoration: none; font-weight: 600; font-size: 13px;">Read full story →</a>
    </div>
  `).join('');

  return {
    subject: "Pulse Magazine Weekly Digest 📰",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2328; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f6f5f1; }
    .header { background: linear-gradient(145deg, #101827, #1f2937); color: #f9fafb; padding: 25px 20px; border-radius: 12px 12px 0 0; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 900; }
    .content { background: #ffffff; padding: 30px; }
    .section { margin-bottom: 25px; }
    .section h2 { color: #b4233c; font-size: 18px; margin: 0 0 15px 0; font-weight: 700; }
    .footer { background: #f6f5f1; padding: 20px; text-align: center; font-size: 12px; color: #5f6672; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Pulse <span style="color: #fca5a5;">Weekly</span></h1>
      <p>This week's curated stories</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>Top Stories This Week ✨</h2>
        ${articlesHtml || '<p>Check back soon for new stories!</p>'}
      </div>

      <div class="section">
        <p style="text-align: center; margin-top: 30px;">
          <a href="${BASE_URL}" style="display: inline-block; background: #b4233c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            View All Stories
          </a>
        </p>
      </div>
    </div>

    <div class="footer">
      <p>© 2026 Pulse Magazine. Editorial storytelling platform.</p>
    </div>
  </div>
</body>
</html>
    `
  };
}

app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/api/articles", (req, res) => {
  const store = readStore();
  const { category, featured, q } = req.query;
  let result = [...store.articles];

  if (category) result = result.filter((a) => a.categorySlug === category);
  if (featured === "true") result = result.filter((a) => Boolean(a.featured));
  if (q) {
    const term = String(q).toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(term) ||
        (a.excerpt || "").toLowerCase().includes(term) ||
        (a.content || []).join(" ").toLowerCase().includes(term)
    );
  }

  result.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  res.json(result);
});

app.get("/api/search", (req, res) => {
  const store = readStore();
  const term = String(req.query.q || "").toLowerCase().trim();
  if (!term) return res.json([]);
  const result = store.articles.filter(
    (a) =>
      a.title.toLowerCase().includes(term) ||
      (a.excerpt || "").toLowerCase().includes(term) ||
      (a.content || []).join(" ").toLowerCase().includes(term) ||
      (a.tags || []).join(" ").toLowerCase().includes(term)
  );
  res.json(result);
});

app.get("/api/articles/:slug", (req, res) => {
  const store = readStore();
  const article = store.articles.find((a) => a.slug === req.params.slug);
  if (!article) return res.status(404).json({ message: "Article not found" });
  res.json(article);
});

app.post("/api/articles", (req, res) => {
  const store = readStore();
  const payload = req.body || {};
  if (!payload.title || !payload.categorySlug) {
    return res.status(400).json({ message: "title and categorySlug are required" });
  }

  const id = `art-${Date.now()}`;
  const article = {
    id,
    title: payload.title,
    slug: payload.slug ? slugify(payload.slug) : slugify(payload.title),
    subheadline: payload.subheadline || "",
    excerpt: payload.excerpt || "",
    content: Array.isArray(payload.content) ? payload.content : [payload.content || ""],
    pullQuote: payload.pullQuote || "",
    coverImage: payload.coverImage || "",
    authorId: payload.authorId || "",
    categorySlug: payload.categorySlug,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    publishedAt: payload.publishedAt || new Date().toISOString(),
    readingTime: Number(payload.readingTime || 5),
    featured: Boolean(payload.featured),
    editorsPick: Boolean(payload.editorsPick),
    views: Number(payload.views || 0)
  };

  store.articles.unshift(article);
  writeStore(store);
  res.status(201).json(article);
});

app.put("/api/articles/:slug", (req, res) => {
  const store = readStore();
  const idx = store.articles.findIndex((a) => a.slug === req.params.slug);
  if (idx === -1) return res.status(404).json({ message: "Article not found" });

  const prev = store.articles[idx];
  const next = { ...prev, ...req.body };
  if (req.body.title && !req.body.slug) next.slug = slugify(req.body.title);
  if (req.body.slug) next.slug = slugify(req.body.slug);
  store.articles[idx] = next;
  writeStore(store);
  res.json(next);
});

app.get("/api/categories", (_, res) => {
  res.json(readStore().categories);
});

app.post("/api/categories", (req, res) => {
  const store = readStore();
  const payload = req.body || {};
  if (!payload.name) return res.status(400).json({ message: "name is required" });
  const category = {
    id: `cat-${Date.now()}`,
    name: payload.name,
    slug: slugify(payload.slug || payload.name),
    description: payload.description || ""
  };
  store.categories.push(category);
  writeStore(store);
  res.status(201).json(category);
});

app.get("/api/authors", (_, res) => {
  res.json(readStore().authors);
});

app.get("/api/featured", (_, res) => {
  const featured = readStore().articles.filter((a) => a.featured);
  res.json(featured);
});

app.get("/api/analytics/overview", (_, res) => {
  const store = readStore();
  const mostRead = [...store.articles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map((a) => ({ title: a.title, slug: a.slug, views: a.views || 0 }));

  res.json({
    articleCount: store.articles.length,
    categoryCount: store.categories.length,
    avgReadingTime:
      store.articles.reduce((sum, item) => sum + Number(item.readingTime || 0), 0) /
      Math.max(1, store.articles.length),
    mostRead
  });
});

// Newsletter Subscription Endpoint
app.post("/api/newsletter", async (req, res) => {
  const { email } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Valid email address is required" });
  }

  try {
    const store = readStore();
    
    // Check if subscriber already exists
    if (!store.subscribers) store.subscribers = [];
    if (store.subscribers.includes(email)) {
      return res.status(200).json({ 
        message: "Already subscribed", 
        subscribed: false,
        alreadySubscribed: true
      });
    }

    // Add subscriber to list
    store.subscribers.push(email);
    writeStore(store);

    // Prepare welcome email
    const emailTemplate = getWelcomeEmailTemplate(email);
    const topArticles = store.articles.slice(0, 5);

    if (!emailEnabled || !transporter) {
      return res.status(200).json({
        message:
          "✅ Successfully subscribed! Email delivery is currently disabled, but your subscription is saved.",
        subscribed: true,
        email: email,
        note:
          "The newsletter service is not available right now, so no welcome email was sent."
      });
    }

    // Send welcome email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER || "noreply@pulsemagazine.com",
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    // Generate preview URL for test emails
    let previewUrl = null;
    if (info.response && info.response.includes("Ethereal")) {
      previewUrl = nodemailer.getTestMessageUrl(info);
    }

    res.status(200).json({
      message: "✅ Successfully subscribed! Check your email for a welcome message.",
      subscribed: true,
      email: email,
      previewUrl: previewUrl,
      note: previewUrl ? "Testing mode: View email preview" : "Email sent to your inbox"
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    
    res.status(500).json({
      message: "Error: Could not complete subscription. Please try again.",
      subscribed: false,
      error: error.message
    });
  }
});

// Get newsletter subscribers (admin only)
app.get("/api/newsletter/subscribers", (req, res) => {
  const store = readStore();
  const subscribers = store.subscribers || [];
  res.json({ count: subscribers.length, subscribers: subscribers });
});

app.get("/sitemap.xml", (_, res) => {
  const store = readStore();
  const base = BASE_URL;
  const urls = [
    `${base}/index.html`,
    `${base}/category.html`,
    `${base}/about.html`,
    `${base}/contact.html`
  ];

  store.articles.forEach((a) => urls.push(`${base}/article.html?slug=${encodeURIComponent(a.slug)}`));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n")}
</urlset>`;

  res.type("application/xml").send(xml);
});

app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Pulse Magazine running on http://localhost:${PORT}`);
  });
}

module.exports = app;
