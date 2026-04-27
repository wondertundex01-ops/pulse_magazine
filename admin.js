(function () {
  const API_BASE = "/api";

  const form = document.getElementById("articleForm");
  const message = document.getElementById("adminMessage");
  const grid = document.getElementById("adminArticles");

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderArticleCard(article) {
    return `
      <article class="story-card">
        <a class="card-link" href="./article.html?slug=${encodeURIComponent(article.slug)}">
          <img src="${escapeHtml(article.coverImage || "")}" alt="${escapeHtml(article.title)}" loading="lazy" />
          <div class="story-content">
            <p class="tag">${escapeHtml(article.categorySlug)}</p>
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.excerpt || "")}</p>
            <p class="meta">featured: ${Boolean(article.featured)} | pick: ${Boolean(article.editorsPick)}</p>
          </div>
        </a>
      </article>
    `;
  }

  async function loadArticles() {
    const res = await fetch(`${API_BASE}/articles`);
    const articles = await res.json();
    grid.innerHTML = articles.map(renderArticleCard).join("");
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const payload = {
        title: String(data.get("title") || "").trim(),
        slug: String(data.get("slug") || "").trim(),
        subheadline: String(data.get("subheadline") || "").trim(),
        excerpt: String(data.get("excerpt") || "").trim(),
        content: String(data.get("content") || "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        pullQuote: String(data.get("pullQuote") || "").trim(),
        coverImage: String(data.get("coverImage") || "").trim(),
        authorId: String(data.get("authorId") || "").trim(),
        categorySlug: String(data.get("categorySlug") || "").trim(),
        readingTime: Number(data.get("readingTime") || 5),
        featured: data.get("featured") === "on",
        editorsPick: data.get("editorsPick") === "on"
      };

      const res = await fetch(`${API_BASE}/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        message.style.color = "#fca5a5";
        message.textContent = "Could not publish article.";
        return;
      }

      message.style.color = "#86efac";
      message.textContent = "Article published successfully.";
      form.reset();
      await loadArticles();
    });
  }

  loadArticles().catch(() => {
    if (message) {
      message.style.color = "#fca5a5";
      message.textContent = "Start backend first: npm install && npm run dev";
    }
  });
})();
