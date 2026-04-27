(function () {
  const API_BASE = "/api";
  const state = {
    categories: [],
    articles: [],
    authors: [],
  };

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

  async function loadCoreData() {
    const [categories, articles, authors] = await Promise.all([
      apiGet("/categories"),
      apiGet("/articles"),
      apiGet("/authors"),
    ]);
    state.categories = categories;
    state.articles = articles;
    state.authors = authors;
  }

  async function init() {
    setupHeaderFooter();
    setupTheme();
    setupProgressBar();
    setupReveal();
    setupContactForm();

    try {
      await loadCoreData();
      const page = document.body?.dataset?.page || "home";
      if (page === "home") renderHome();
      if (page === "category") renderCategoryPage();
      if (page === "article") renderArticlePage();
    } catch (err) {
      const root = document.querySelector("main .container");
      if (root) {
        root.insertAdjacentHTML(
          "afterbegin",
          `<div class="notice"><h2>Backend not running</h2><p>Start the API server with <code>npm start</code>.</p></div>`
        );
      }
    }
  }

  init();
})();

