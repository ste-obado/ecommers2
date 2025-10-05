import { getProductById, trackAnalytics } from '../config/supabase.js';
import { supabase } from '../config/supabase.js';

const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.querySelector('.nav-links');
const container = document.getElementById('productContainer');

mobileMenuToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

if (!productId) {
  container.innerHTML = '<div class="container"><p class="error-message">Product not found</p></div>';
} else {
  loadProduct();
}

async function loadProduct() {
  try {
    const product = await getProductById(productId);

    if (!product) {
      container.innerHTML = '<div class="container"><p class="error-message">Product not found</p></div>';
      return;
    }

    await incrementViews(productId);
    trackAnalytics('product_view', productId);

    const createdDate = new Date(product.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    container.innerHTML = `
      <div class="product-detail">
        <div class="breadcrumb">
          <a href="/">Home</a> / <a href="/catalog.html">Products</a> / ${product.title}
        </div>

        <div class="product-content">
          <div class="product-media">
            <img src="${product.image_url || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800'}"
                 alt="${product.title}"
                 class="product-main-image"
                 onerror="this.src='https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=800'">

            ${product.video_url ? `
              <label class="video-label">Product Demo Video</label>
              <video class="product-video" controls>
                <source src="${product.video_url}" type="video/mp4">
                Your browser does not support video playback.
              </video>
            ` : ''}
          </div>

          <div class="product-info-section">
            <span class="product-category-badge">${product.category}</span>
            <h1 class="product-detail-title">${product.title}</h1>
            <div class="product-detail-price">$${parseFloat(product.price).toFixed(2)}</div>
            <div class="product-views">👁️ ${product.views || 0} views</div>

            <p class="product-description-full">${product.description}</p>

            <div class="product-actions">
              <a href="${product.affiliate_link}"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="affiliate-button"
                 onclick="trackAffiliateClick('${productId}')">
                Buy Now on Digistore
              </a>
            </div>

            <div class="product-meta">
              <h3>Product Information</h3>
              <div class="meta-item">
                <span class="meta-label">Category</span>
                <span class="meta-value">${product.category}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Price</span>
                <span class="meta-value">$${parseFloat(product.price).toFixed(2)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Listed</span>
                <span class="meta-value">${createdDate}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Views</span>
                <span class="meta-value">${product.views || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading product:', error);
    container.innerHTML = '<div class="container"><p class="error-message">Failed to load product details</p></div>';
  }
}

async function incrementViews(productId) {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('views')
      .eq('id', productId)
      .maybeSingle();

    if (product) {
      await supabase
        .from('products')
        .update({ views: (product.views || 0) + 1 })
        .eq('id', productId);
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
}

window.trackAffiliateClick = function(productId) {
  trackAnalytics('affiliate_click', productId);
};