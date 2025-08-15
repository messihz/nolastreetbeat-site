// Helper: fetch JSON and return data
async function fetchJSON(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error('Failed to load ' + path);
  }
  return await response.json();
}

// Populate the hero section with the first article
function renderHero(article) {
  const hero = document.getElementById('hero');
  hero.innerHTML = '';
  if (!article) return;
  const title = document.createElement('h2');
  title.textContent = article.title;
  hero.appendChild(title);
}

// Populate the events sidebar
function renderEvents(events) {
  const eventsEl = document.getElementById('events');
  if (!eventsEl) return;
  let html = '<h3>Whats Happening</h3><ul>';
  events.forEach(event => {
    const date = new Date(event.date).toLocaleDateString();
    html += `<li>${event.title} — ${date}</li>`;
  });
  html += '</ul>';
  eventsEl.innerHTML = html;
}

// Populate the news grid
function renderNews(articles) {
  const newsEl = document.getElementById('news');
  if (!newsEl) return;
  const grid = document.createElement('div');
  grid.className = 'news-grid';
  articles.forEach(article => {
    const card = document.createElement('a');
    card.href = `article.html?slug=${encodeURIComponent(article.slug)}`;
    card.className = 'news-item';
    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title;
    const h4 = document.createElement('h4');
    h4.textContent = article.title;
    const p = document.createElement('p');
    p.textContent = article.excerpt;
    card.appendChild(img);
    card.appendChild(h4);
    card.appendChild(p);
    grid.appendChild(card);
  });
  newsEl.innerHTML = '';
  newsEl.appendChild(grid);
}

// Populate the photo stories section (uses the remaining articles)
function renderPhotoStories(articles) {
  const storiesEl = document.getElementById('photo-stories');
  if (!storiesEl) return;
  if (!articles.length) return;
  let html = '<h3>Photo Stories</h3>';
  articles.forEach(article => {
    html += `<a href="article.html?slug=${encodeURIComponent(article.slug)}" class="photo-story"><img src="${article.image}" alt="${article.title}"><h4>${article.title}</h4></a>`;
  });
  storiesEl.innerHTML = html;
}

// Load the homepage: fetch data and call render functions
async function loadHome() {
  try {
    const [articlesData, eventsData] = await Promise.all([
      fetchJSON('data/articles.json'),
      fetchJSON('data/events.json'),
    ]);
    const articles = articlesData.articles || [];
    const events = eventsData.events || [];
    if (articles.length) {
      const [heroArticle, ...restArticles] = articles;
      renderHero(heroArticle);
      // For the news grid, show all remaining articles
      renderNews(restArticles);
      // For photo stories, take the first two of the rest (if available)
      renderPhotoStories(restArticles.slice(0, 2));
    }
    renderEvents(events);
  } catch (err) {
    console.error(err);
  }
}

// Get slug from the query string
function getSlug() {
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

// Load an article page based on slug
async function loadArticle() {
  try {
    const articlesData = await fetchJSON('data/articles.json');
    const articles = articlesData.articles || [];
    const slug = getSlug();
    const article = articles.find(a => a.slug === slug);
    const container = document.getElementById('article-content');
    if (!container) return;
    if (!article) {
      container.innerHTML = '<p>Article not found.</p>';
      return;
    }
    // Build article markup
    const html = `<h1 class="article-title">${article.title}</h1>` +
      `<p class="article-meta">${new Date(article.date).toLocaleDateString()} — ${article.author}${article.neighborhood ? ' — ' + article.neighborhood : ''}</p>` +
      `<div class="article-body">${article.html}</div>`;
    container.innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

// Determine which page to load based on the presence of certain elements
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('hero')) {
    loadHome();
  }
  if (document.getElementById('article-content')) {
    loadArticle();
  }
});
