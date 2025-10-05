import { getFeaturedProducts, getCategories, trackAnalytics } from '../config/supabase.js';

trackAnalytics('page_view');

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.querySelector('.nav-links');

mobileMenuToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

async function loadFeaturedProducts() {
  const container = document.getElementById('featuredProducts');

  try {
    const products = await getFeaturedProducts();

    if (products.length === 0) {
      container.innerHTML = '<p class="loading">No featured products available</p>';
      return;
    }

    container.innerHTML = products.map(product => `
      <a href="/product.html?id=${product.id}" class="product-card">
        <img src="${product.image_url || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400'}"
             alt="${product.title}"
             class="product-image"
             onerror="this.src='https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=400'">
        <div class="product-info">
          <span class="product-category">${product.category}</span>
          <h3 class="product-title">${product.title}</h3>
          <p class="product-description">${product.short_description}</p>
          <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
        </div>
      </a>
    `).join('');
  } catch (error) {
    console.error('Error loading featured products:', error);
    container.innerHTML = '<p class="error-message">Failed to load products</p>';
  }
}

async function loadCategories() {
  const container = document.getElementById('categoriesGrid');

  try {
    const categories = await getCategories();

    if (categories.length === 0) {
      container.innerHTML = '<p class="loading">No categories available</p>';
      return;
    }

    const categoryIcons = {
      'electronics': '📱',
      'fashion': '👔',
      'home': '🏠',
      'sports': '⚽',
      'books': '📚',
      'health': '💪',
      'beauty': '💄',
      'toys': '🎮',
      'general': '🛍️'
    };

    container.innerHTML = categories.map(category => `
      <a href="/catalog.html?category=${encodeURIComponent(category.name)}" class="category-card">
        <div class="category-icon">${categoryIcons[category.name.toLowerCase()] || categoryIcons['general']}</div>
        <div class="category-name">${category.name}</div>
        <div class="category-count">${category.count} product${category.count !== 1 ? 's' : ''}</div>
      </a>
    `).join('');
  } catch (error) {
    console.error('Error loading categories:', error);
    container.innerHTML = '<p class="error-message">Failed to load categories</p>';
  }
}

loadFeaturedProducts();
loadCategories();