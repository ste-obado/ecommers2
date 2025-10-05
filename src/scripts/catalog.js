import { getActiveProducts, getCategories, trackAnalytics } from '../config/supabase.js';

trackAnalytics('page_view');

let allProducts = [];
let filteredProducts = [];

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.querySelector('.nav-links');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const productsGrid = document.getElementById('productsGrid');
const resultsCount = document.getElementById('resultsCount');

mobileMenuToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

async function loadCategories() {
  try {
    const categories = await getCategories();
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.name;
      option.textContent = category.name;
      categoryFilter.appendChild(option);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      categoryFilter.value = categoryParam;
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

async function loadProducts() {
  productsGrid.innerHTML = '<div class="loading">Loading products...</div>';

  try {
    allProducts = await getActiveProducts();
    filteredProducts = [...allProducts];
    applyFilters();
  } catch (error) {
    console.error('Error loading products:', error);
    productsGrid.innerHTML = '<p class="error-message">Failed to load products</p>';
  }
}

function applyFilters() {
  let products = [...allProducts];

  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    products = products.filter(product =>
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }

  const category = categoryFilter.value;
  if (category) {
    products = products.filter(product => product.category === category);
  }

  const sortBy = sortFilter.value;
  switch (sortBy) {
    case 'newest':
      products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'oldest':
      products.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      break;
    case 'price-low':
      products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      break;
    case 'price-high':
      products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      break;
    case 'popular':
      products.sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
  }

  filteredProducts = products;
  renderProducts();
}

function renderProducts() {
  resultsCount.textContent = `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = '<p class="loading">No products found matching your criteria</p>';
    return;
  }

  productsGrid.innerHTML = filteredProducts.map(product => `
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
}

function clearFilters() {
  searchInput.value = '';
  categoryFilter.value = '';
  sortFilter.value = 'newest';
  applyFilters();
}

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
sortFilter.addEventListener('change', applyFilters);
clearFiltersBtn.addEventListener('click', clearFilters);

loadCategories();
loadProducts();