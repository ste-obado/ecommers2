import { supabase } from '../config/supabase.js';

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = '/admin-login.html';
    return false;
  }

  const { data: adminUser, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error || !adminUser) {
    await supabase.auth.signOut();
    window.location.href = '/admin-login.html';
    return false;
  }

  return true;
}

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '/admin-login.html';
});

const modal = document.getElementById('productModal');
const addProductBtn = document.getElementById('addProductBtn');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const productForm = document.getElementById('productForm');
const saveBtn = document.getElementById('saveBtn');
const formMessage = document.getElementById('formMessage');

let isEditMode = false;

addProductBtn.addEventListener('click', () => {
  openModal();
});

closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

function openModal(product = null) {
  isEditMode = !!product;
  document.getElementById('modalTitle').textContent = isEditMode ? 'Edit Product' : 'Add Product';
  formMessage.innerHTML = '';

  if (product) {
    document.getElementById('productId').value = product.id;
    document.getElementById('title').value = product.title;
    document.getElementById('category').value = product.category;
    document.getElementById('short_description').value = product.short_description;
    document.getElementById('description').value = product.description;
    document.getElementById('price').value = product.price;
    document.getElementById('affiliate_link').value = product.affiliate_link;
    document.getElementById('image_url').value = product.image_url || '';
    document.getElementById('video_url').value = product.video_url || '';
    document.getElementById('featured').value = product.featured.toString();
    document.getElementById('status').value = product.status;
  } else {
    productForm.reset();
    document.getElementById('productId').value = '';
  }

  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
  productForm.reset();
}

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  formMessage.innerHTML = '';

  const formData = {
    title: document.getElementById('title').value.trim(),
    category: document.getElementById('category').value.trim(),
    short_description: document.getElementById('short_description').value.trim(),
    description: document.getElementById('description').value.trim(),
    price: parseFloat(document.getElementById('price').value),
    affiliate_link: document.getElementById('affiliate_link').value.trim(),
    image_url: document.getElementById('image_url').value.trim(),
    video_url: document.getElementById('video_url').value.trim() || null,
    featured: document.getElementById('featured').value === 'true',
    status: document.getElementById('status').value
  };

  try {
    if (isEditMode) {
      const productId = document.getElementById('productId').value;
      const { error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', productId);

      if (error) throw error;

      formMessage.innerHTML = '<div class="success-message">Product updated successfully!</div>';
    } else {
      const { error } = await supabase
        .from('products')
        .insert(formData);

      if (error) throw error;

      formMessage.innerHTML = '<div class="success-message">Product created successfully!</div>';
    }

    setTimeout(() => {
      closeModal();
      loadProducts();
    }, 1500);
  } catch (error) {
    console.error('Error saving product:', error);
    formMessage.innerHTML = `<div class="error-message">${error.message}</div>`;
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Product';
  }
});

async function loadProducts() {
  const container = document.getElementById('productsTable');

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!products || products.length === 0) {
      container.innerHTML = '<div class="loading">No products yet. Click "Add Product" to create one.</div>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Status</th>
            <th>Featured</th>
            <th>Views</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(product => `
            <tr>
              <td>
                <div style="display: flex; gap: 12px; align-items: center;">
                  <img src="${product.image_url || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=60'}"
                       alt="${product.title}"
                       style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                       onerror="this.src='https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=60'">
                  <div>
                    <div style="font-weight: 600;">${product.title}</div>
                    <div style="font-size: 12px; color: var(--gray);">${product.short_description.substring(0, 50)}...</div>
                  </div>
                </div>
              </td>
              <td>${product.category}</td>
              <td>$${parseFloat(product.price).toFixed(2)}</td>
              <td>
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; background-color: ${product.status === 'active' ? '#dcfce7' : product.status === 'draft' ? '#fef3c7' : '#fee'}; color: ${product.status === 'active' ? '#166534' : product.status === 'draft' ? '#92400e' : '#991b1b'};">
                  ${product.status}
                </span>
              </td>
              <td>${product.featured ? '⭐ Yes' : 'No'}</td>
              <td>${product.views || 0}</td>
              <td class="table-actions">
                <button class="btn btn-primary" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct('${product.id}', '${product.title}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error loading products:', error);
    container.innerHTML = '<p class="error-message">Failed to load products</p>';
  }
}

window.editProduct = async function(productId) {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .maybeSingle();

    if (error) throw error;
    if (!product) throw new Error('Product not found');

    openModal(product);
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Failed to load product details');
  }
};

window.deleteProduct = async function(productId, productTitle) {
  if (!confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`)) {
    return;
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    alert('Product deleted successfully');
    loadProducts();
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Failed to delete product');
  }
};

checkAuth().then(isAuthenticated => {
  if (isAuthenticated) {
    loadProducts();
  }
});