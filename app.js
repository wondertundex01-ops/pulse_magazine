(function () {
  const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isCorrectPort = window.location.port === '4000';
  const API_BASE = (isLocalDev && !isCorrectPort) ? "http://localhost:4000/api" : "/api";
  
  const state = {
    categories: [],
    articles: [],
    authors: [],
    isOffline: false,
  };

  // ── Static fallback data (used when the server is not running) ──────────────
  const STATIC_DATA = {
    categories: [
      { id: "cat-tech",    name: "Tech",    slug: "tech",    description: "AI, software, devices, and the future of product experiences." },
      { id: "cat-culture", name: "Culture", slug: "culture", description: "Film, visual arts, and creator economy stories worth your time." },
      { id: "cat-music",   name: "Music",   slug: "music",   description: "Industry shifts, sonic trends, and deep profiles of modern artists." },
      { id: "cat-design",  name: "Design",  slug: "design",  description: "Architecture, product design, systems thinking, and urban futures." }
    ],
    authors: [
      { id: "author-1", name: "Maya Adebayo",  bio: "Editor-at-large focused on cities, tech, and systems design.",         profileImage: "assets/images/author-maya-adebayo.jpg" },
      { id: "author-2", name: "Noah Mensah",   bio: "Culture columnist covering independent media and creative industries.", profileImage: "assets/images/author-noah-mensah.jpg" }
    ],
    articles: [
      {
        id: "art-1", title: "The New Urban Playbook: Designing Cities for Human Rhythm",
        slug: "new-urban-playbook",
        subheadline: "From transit-first corridors to mixed-use micro-districts, city teams are redesigning for daily life.",
        excerpt: "A long-form look at how design and policy are reshaping modern city experiences.",
        content: [
          "The strongest urban projects begin with one simple premise: people should not have to choose between productivity and quality of life.",
          "Across major regions, planners are replacing zoning silos with mixed-use ecosystems that shorten commute cycles and improve neighborhood cohesion.",
          "This transition depends less on flashy technology and more on governance systems that align mobility, housing, and climate commitments."
        ],
        pullQuote: "Good city design makes daily life feel lighter, not louder.",
        coverImage: "assets/images/article-future-of-cities.jpg",
        authorId: "author-1", categorySlug: "design", tags: ["cities","design","policy"],
        publishedAt: "2026-04-24T09:00:00.000Z", readingTime: 8, featured: true, editorsPick: true, views: 13240
      },
      {
        id: "art-2", title: "AI Ops for Lean Teams: What Actually Scales",
        slug: "ai-ops-for-lean-teams",
        subheadline: "A practical framework for adoption without bloated tooling or messy workflows.",
        excerpt: "How focused teams use AI to accelerate delivery while preserving editorial standards.",
        content: [
          "Small teams win when they automate repetitive work and reserve judgment-heavy decisions for humans.",
          "The model is simple: one workflow at a time, clear quality gates, and weekly measurement.",
          "Teams that over-automate too early often increase revision costs. Discipline is the differentiator."
        ],
        pullQuote: "Automation should reduce friction, not editorial standards.",
        coverImage: "assets/images/article-ai-creativity.jpg",
        authorId: "author-1", categorySlug: "tech", tags: ["ai","automation","operations"],
        publishedAt: "2026-04-21T11:00:00.000Z", readingTime: 6, featured: true, editorsPick: true, views: 11901
      },
      {
        id: "art-3", title: "Independent Studios Are Rebuilding Cultural Trust",
        slug: "independent-studios-cultural-trust",
        subheadline: "Small teams with clear voice are outperforming broad entertainment brands.",
        excerpt: "Why local creative ecosystems are becoming globally influential.",
        content: [
          "Independents are succeeding because they can move from insight to release without committee drag.",
          "Audience loyalty is now tied to perspective and consistency, not just scale.",
          "The shift is creating room for sustainable, mission-driven media businesses."
        ],
        pullQuote: "People follow perspective before production budget.",
        coverImage: "assets/images/article-sustainable-fashion.jpg",
        authorId: "author-2", categorySlug: "culture", tags: ["culture","media","studios"],
        publishedAt: "2026-04-17T10:00:00.000Z", readingTime: 5, featured: false, editorsPick: true, views: 9780
      },
      {
        id: "art-4", title: "The Return of Album Worlds",
        slug: "return-of-album-worlds",
        subheadline: "Artists are designing multi-format releases with stronger narrative arcs.",
        excerpt: "A look at how musicians are blending audio, visuals, and live formats.",
        content: [
          "The album format is evolving from a playlist of tracks into a narrative system.",
          "Visual storytelling, intimate venue runs, and creator-owned channels are central to this trend.",
          "For listeners, the result is deeper attachment and longer retention."
        ],
        pullQuote: "Format is becoming part of the story again.",
        coverImage: "assets/images/article-sound-diaspora.jpg",
        authorId: "author-2", categorySlug: "music", tags: ["music","albums","storytelling"],
        publishedAt: "2026-04-14T08:30:00.000Z", readingTime: 4, featured: false, editorsPick: false, views: 8874
      }
    ]
  };
  // ────────────────────────────────────────────────────────────────────────────

  const $ = (selector) => document.querySelector(selector);
  const getParam = (name) => new URLSearchParams(window.location.search).get(name);

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value) {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
  }

  async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`Request failed: ${path}`);
    return res.json();
  }

  function setupHeaderFooter() {
    const header = $("#siteHeader");
    const footer = $("#siteFooter");

    if (header) {
      header.innerHTML = `
        <header class="site-header">
          <div class="container header-content">
            <a href="./index.html" class="logo">Pulse<span>Magazine</span></a>
            <nav class="main-nav">
              <button id="menuBtn" class="menu-btn" aria-label="Toggle menu">☰</button>
              <ul id="navLinks">
                <li><a href="./index.html">Home</a></li>
                <li><a href="./category.html">Categories</a></li>
                <li><a href="./about.html">About</a></li>
                <li><a href="./contact.html">Contact</a></li>
                <li><a href="./admin.html">CMS</a></li>
              </ul>
            </nav>
            <button id="themeToggle" class="theme-toggle" aria-label="Toggle light and dark mode">
              <i class="theme-icon fas fa-sun"></i>
            </button>
          </div>
        </header>
      `;
    }

    if (footer) {
      footer.innerHTML = `
        <footer class="site-footer">
          <div class="container footer-content">
            <p>© 2026 Pulse Magazine. Editorial storytelling platform.</p>
            <a href="./index.html">Back to home</a>
          </div>
        </footer>
      `;
    }

    $("#menuBtn")?.addEventListener("click", () => $("#navLinks")?.classList.toggle("show"));
  }

  function setupTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem("pulse_theme");
    const themeIcon = $("#themeToggle")?.querySelector(".theme-icon");
    
    if (saved === "dark") {
      root.classList.add("dark");
      if (themeIcon) themeIcon.className = "theme-icon fas fa-moon";
    } else {
      if (themeIcon) themeIcon.className = "theme-icon fas fa-sun";
    }

    $("#themeToggle")?.addEventListener("click", () => {
      root.classList.toggle("dark");
      const isDark = root.classList.contains("dark");
      localStorage.setItem("pulse_theme", isDark ? "dark" : "light");
      
      if (themeIcon) {
        themeIcon.className = isDark ? "theme-icon fas fa-moon" : "theme-icon fas fa-sun";
      }
    });
  }

  function setupProgressBar() {
    const bar = $("#readingProgress");
    if (!bar) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const value = max <= 0 ? 0 : (window.scrollY / max) * 100;
      bar.style.width = `${Math.min(100, Math.max(0, value))}%`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupReveal() {
    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("reveal-on");
        });
      },
      { threshold: 0.15 }
    );
    elements.forEach((el) => observer.observe(el));
  }

  function slugify(input) {
    return String(input || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function categoryName(slug) {
    return state.categories.find((c) => c.slug === slug)?.name || slug;
  }

  function authorName(authorId) {
    return state.authors.find((a) => a.id === authorId)?.name || "Editorial Team";
  }

  function articleHref(article) {
    return `./article.html?slug=${encodeURIComponent(article.slug)}`;
  }

  function renderStoryCard(article) {
    return `
      <article class="story-card reveal">
        <a class="card-link" href="${articleHref(article)}" aria-label="${escapeHtml(article.title)}">
          <img src="${escapeHtml(article.coverImage)}" alt="${escapeHtml(article.title)}" loading="lazy" />
          <div class="story-content">
            <p class="tag">${escapeHtml(categoryName(article.categorySlug))}</p>
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.excerpt || "")}</p>
            <p class="meta">${escapeHtml(formatDate(article.publishedAt))} • ${escapeHtml(authorName(article.authorId))} • ${escapeHtml(article.readingTime)} min read</p>
          </div>
        </a>
      </article>
    `;
  }

  function renderCategoryCards() {
    const grid = $("#categoriesGrid");
    if (!grid) return;
    grid.innerHTML = state.categories
      .map(
        (cat) => `
          <article class="category-card reveal">
            <h3>${escapeHtml(cat.name)}</h3>
            <p>${escapeHtml(cat.description || "")}</p>
            <a class="link" href="./category.html?c=${encodeURIComponent(cat.slug)}">Open ${escapeHtml(cat.name)}</a>
          </article>
        `
      )
      .join("");
  }

  function setupNewsletter() {
    const form = $("#newsletterForm");
    const emailInput = $("#emailInput");
    const msg = $("#formMessage");
    if (!form || !emailInput || !msg) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.style.color = "#fca5a5";
        msg.textContent = "Please enter a valid email address.";
        return;
      }

      try {
        msg.style.color = "#6b7280";
        msg.textContent = "Subscribing...";
        
        const response = await fetch(`${API_BASE}/newsletter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (data.subscribed) {
          msg.style.color = "#86efac";
          msg.innerHTML = `✓ ${data.message}`;
          
          // Show preview link if testing
          if (data.previewUrl) {
            msg.innerHTML += `<br><a href="${data.previewUrl}" target="_blank" style="color: #b4233c; text-decoration: underline; font-weight: 600;">View email preview →</a>`;
            console.log("📧 Email preview:", data.previewUrl);
          }
          
          form.reset();
        } else if (data.alreadySubscribed) {
          msg.style.color = "#fbbf24";
          msg.textContent = "📧 You're already subscribed with this email!";
        } else {
          msg.style.color = "#fca5a5";
          msg.textContent = data.message || "Subscription error. Please try again.";
        }
      } catch (error) {
        msg.style.color = "#fca5a5";
        msg.textContent = "Error: Could not complete subscription. Please try again.";
        console.error("Newsletter subscription error:", error);
      }
    });
  }

  function setupContactForm() {
    const form = $("#contactForm");
    const msg = $("#contactMessage");
    if (!form || !msg) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.style.color = "#86efac";
      msg.textContent = "Message sent (demo).";
      form.reset();
    });
  }

  function renderHome() {
    const featured = state.articles.filter((a) => a.featured).slice(0, 2);
    const main = featured[0];
    const second = featured[1];

    const heroMain = $("#heroMain");
    if (heroMain && main) {
      heroMain.innerHTML = `
        <p class="tag">Cover Story</p>
        <h1>${escapeHtml(main.title)}</h1>
        <p>${escapeHtml(main.subheadline || main.excerpt || "")}</p>
        <a class="btn" href="${articleHref(main)}">Read Feature</a>
      `;
    }

    const heroSecondary = $("#heroSecondary");
    if (heroSecondary && second) {
      heroSecondary.innerHTML = `
        <img src="${escapeHtml(second.coverImage)}" alt="${escapeHtml(second.title)}" loading="lazy" />
        <div class="hero-secondary-body">
          <p class="tag">Second Feature</p>
          <h3>${escapeHtml(second.title)}</h3>
          <p>${escapeHtml(second.excerpt || "")}</p>
          <a class="link" href="${articleHref(second)}">Read story</a>
        </div>
      `;
    }

    const trending = $("#trendingList");
    if (trending) {
      const items = [...state.articles]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
      trending.innerHTML = items
        .map((a) => `<li><a href="${articleHref(a)}">${escapeHtml(a.title)}</a></li>`)
        .join("");
    }

    const picks = $("#editorsPicksGrid");
    if (picks) {
      const data = state.articles.filter((a) => a.editorsPick).slice(0, 3);
      picks.innerHTML = data.map(renderStoryCard).join("");
    }

    const storiesGrid = $("#storiesGrid");
    const search = $("#searchInput");
    const sort = $("#sortSelect");
    const buttons = document.querySelectorAll(".filter-btn");
    let active = "all";

    function applyFilters() {
      const term = (search?.value || "").trim().toLowerCase();
      const sortMode = sort?.value || "latest";
      let list = state.articles.filter((a) => active === "all" || a.categorySlug === active);
      list = list.filter((a) => {
        if (!term) return true;
        return a.title.toLowerCase().includes(term) || (a.excerpt || "").toLowerCase().includes(term);
      });
      list.sort((a, b) => {
        if (sortMode === "popular") return (b.views || 0) - (a.views || 0);
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });
      if (storiesGrid) storiesGrid.innerHTML = list.map(renderStoryCard).join("");
      setupReveal();
    }

    search?.addEventListener("input", applyFilters);
    sort?.addEventListener("change", applyFilters);
    buttons.forEach((btn) =>
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        active = btn.dataset.category || "all";
        applyFilters();
      })
    );

    renderCategoryCards();
    setupNewsletter();
    applyFilters();
  }

  function renderCategoryPage() {
    const key = getParam("c") || "all";
    const heading = $("#categoryHeading");
    const storiesGrid = $("#storiesGrid");
    const search = $("#searchInput");
    const dateFilter = $("#dateFilter");
    const sort = $("#sortSelect");

    if (heading) {
      heading.textContent = key === "all" ? "All Categories" : categoryName(key);
    }

    const categoryFeature = $("#categoryFeature");
    const featuredInCategory = state.articles.find(
      (a) => (key === "all" || a.categorySlug === key) && a.featured
    );
    if (categoryFeature && featuredInCategory) {
      categoryFeature.innerHTML = `
        <img src="${escapeHtml(featuredInCategory.coverImage)}" alt="${escapeHtml(featuredInCategory.title)}" loading="lazy" />
        <p class="tag">Featured in ${escapeHtml(categoryName(featuredInCategory.categorySlug))}</p>
        <h3>${escapeHtml(featuredInCategory.title)}</h3>
        <p>${escapeHtml(featuredInCategory.excerpt || "")}</p>
        <a class="link" href="${articleHref(featuredInCategory)}">Read feature</a>
      `;
    }

    function apply() {
      const term = (search?.value || "").trim().toLowerCase();
      const days = Number(dateFilter?.value || "0");
      const sortMode = sort?.value || "latest";
      const now = Date.now();

      let list = state.articles.filter((a) => key === "all" || a.categorySlug === key);
      list = list.filter((a) => {
        const termMatch =
          !term ||
          a.title.toLowerCase().includes(term) ||
          (a.excerpt || "").toLowerCase().includes(term);
        const dateMatch =
          !days || now - new Date(a.publishedAt).getTime() <= days * 24 * 60 * 60 * 1000;
        return termMatch && dateMatch;
      });

      list.sort((a, b) => {
        if (sortMode === "popular") return (b.views || 0) - (a.views || 0);
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      });

      if (storiesGrid) storiesGrid.innerHTML = list.map(renderStoryCard).join("");
      setupReveal();
    }

    renderCategoryCards();
    search?.addEventListener("input", apply);
    dateFilter?.addEventListener("change", apply);
    sort?.addEventListener("change", apply);
    apply();
  }

  function renderArticlePage() {
    const slug = getParam("slug") || slugify(getParam("id") || "");
    const article = state.articles.find((a) => a.slug === slug);

    const notFound = $("#articleNotFound");
    const content = $("#articleContent");
    if (!article) {
      if (notFound) notFound.hidden = false;
      if (content) content.hidden = true;
      return;
    }

    const title = $("#articleTitle");
    const subtitle = $("#articleSubtitle");
    const meta = $("#articleMeta");
    const image = $("#articleImage");
    const body = $("#articleBody");
    const quote = $("#pullQuote");
    const related = $("#relatedStories");
    const backToCategory = $("#backToCategory");

    if (title) title.textContent = article.title;
    if (subtitle) subtitle.textContent = article.subheadline || article.excerpt || "";
    if (meta) {
      meta.textContent = `${categoryName(article.categorySlug)} • ${formatDate(article.publishedAt)} • ${authorName(article.authorId)} • ${article.readingTime} min read`;
    }
    if (image) {
      image.src = article.coverImage;
      image.alt = article.title;
    }
    if (body) {
      body.innerHTML = (article.content || []).map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    }
    if (quote) quote.textContent = article.pullQuote || "";
    if (backToCategory) backToCategory.href = `./category.html?c=${encodeURIComponent(article.categorySlug)}`;

    if (related) {
      const list = state.articles
        .filter((a) => a.slug !== article.slug && a.categorySlug === article.categorySlug)
        .slice(0, 3);
      related.innerHTML = list.map(renderStoryCard).join("");
    }
  }

  // ── Render helpers called after any data update ─────────────────────────────
  function renderCurrentPage() {
    const page = document.body?.dataset?.page || "home";
    if (page === "home")     renderHome();
    if (page === "category") renderCategoryPage();
    if (page === "article")  renderArticlePage();
  }

  function showOfflineBanner() {
    if (document.getElementById("offlineBanner")) return;
    const banner = document.createElement("div");
    banner.id = "offlineBanner";
    banner.style.cssText = [
      "position:fixed","bottom:20px","right:20px","z-index:9999",
      "background:rgba(20,20,20,0.93)","color:#f9fafb","padding:14px 18px",
      "border-radius:10px","font-size:13px","line-height:1.6",
      "box-shadow:0 4px 24px rgba(0,0,0,0.55)","max-width:310px",
      "border-left:4px solid #b4233c","backdrop-filter:blur(8px)",
      "animation:slideIn .3s ease"
    ].join(";");
    banner.innerHTML =
      "<strong style='display:block;margin-bottom:5px'>⚡ Offline / Preview mode</strong>" +
      "Showing built-in content. For live CMS data, run:<br>" +
      "<code style='background:#111;padding:2px 7px;border-radius:4px'>npm start</code>" +
      " then open <a href='http://localhost:4000' style='color:#fca5a5'>localhost:4000</a>" +
      "<span id='closeBanner' style='cursor:pointer;float:right;margin-top:-18px;font-size:16px;opacity:.5'>&#x2715;</span>";
    document.body.appendChild(banner);
    document.getElementById("closeBanner")
      ?.addEventListener("click", () => banner.remove());
  }

  // ── Background API upgrade (only when served via http/https) ─────────────────
  function tryApiUpgrade() {
    // Skip entirely when opened as a local file — fetch would always fail
    if (window.location.protocol === "file:") return;

    Promise.all([
      apiGet("/categories"),
      apiGet("/articles"),
      apiGet("/authors"),
    ]).then(([categories, articles, authors]) => {
      state.categories = categories;
      state.articles   = articles;
      state.authors    = authors;
      state.isOffline  = false;
      // Remove offline banner if it was showing
      document.getElementById("offlineBanner")?.remove();
      // Re-render with live data
      renderCurrentPage();
    }).catch(() => {
      // API still unreachable on http — show banner
      showOfflineBanner();
    });
  }

  async function init() {
    setupHeaderFooter();
    setupTheme();
    setupProgressBar();
    setupReveal();
    setupContactForm();

    // ── STEP 1: Pre-load static data synchronously so the page ALWAYS renders ──
    state.categories = STATIC_DATA.categories;
    state.articles   = STATIC_DATA.articles;
    state.authors    = STATIC_DATA.authors;
    state.isOffline  = true;

    // ── STEP 2: Render immediately with static data ────────────────────────────
    renderCurrentPage();

    // ── STEP 3: Try to pull live data from the API in the background ───────────
    // If the server is running, the content will silently update.
    // If not, the page stays exactly as rendered above — no error, no blank page.
    tryApiUpgrade();
  }

  // Inject keyframe for banner slide-in
  (function injectBannerAnimation() {
    const style = document.createElement("style");
    style.textContent = "@keyframes slideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}";
    document.head.appendChild(style);
  })();

  init();
})();

