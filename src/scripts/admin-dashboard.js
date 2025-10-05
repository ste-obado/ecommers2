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

  document.getElementById('adminUserName').textContent = adminUser.full_name || adminUser.email;
  return true;
}

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  await supabase.auth.signOut();
  window.location.href = '/admin-login.html';
});

async function loadStats() {
  try {
    const { data: products } = await supabase.from('products').select('views');
    const { data: inquiries } = await supabase.from('clients').select('id');
    const { data: clicks } = await supabase
      .from('analytics')
      .select('id')
      .eq('event_type', 'affiliate_click');

    const totalViews = products?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;

    document.getElementById('totalProducts').textContent = products?.length || 0;
    document.getElementById('totalInquiries').textContent = inquiries?.length || 0;
    document.getElementById('totalViews').textContent = totalViews;
    document.getElementById('totalClicks').textContent = clicks?.length || 0;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

async function loadRecentInquiries() {
  const container = document.getElementById('recentInquiries');

  try {
    const { data: inquiries, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!inquiries || inquiries.length === 0) {
      container.innerHTML = '<p style="color: var(--gray); text-align: center;">No inquiries yet</p>';
      return;
    }

    container.innerHTML = inquiries.map(inquiry => {
      const date = new Date(inquiry.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return `
        <div class="inquiry-item">
          <div class="inquiry-header">
            <span class="inquiry-name">${inquiry.name}</span>
            <span class="inquiry-date">${date}</span>
          </div>
          <div class="inquiry-email">${inquiry.email}</div>
          <div class="inquiry-message">${inquiry.message}</div>
          <span class="inquiry-status ${inquiry.status}">${inquiry.status}</span>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading inquiries:', error);
    container.innerHTML = '<p class="error-message">Failed to load inquiries</p>';
  }
}

async function loadTopProducts() {
  const container = document.getElementById('topProducts');

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('views', { ascending: false })
      .limit(5);

    if (error) throw error;

    if (!products || products.length === 0) {
      container.innerHTML = '<p style="color: var(--gray); text-align: center;">No products yet</p>';
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-item">
        <img src="${product.image_url || 'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=100'}"
             alt="${product.title}"
             class="product-item-image"
             onerror="this.src='https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=100'">
        <div class="product-item-info">
          <div class="product-item-title">${product.title}</div>
          <div class="product-item-stats">
            👁️ ${product.views || 0} views • $${parseFloat(product.price).toFixed(2)}
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading top products:', error);
    container.innerHTML = '<p class="error-message">Failed to load products</p>';
  }
}

checkAuth().then(isAuthenticated => {
  if (isAuthenticated) {
    loadStats();
    loadRecentInquiries();
    loadTopProducts();
  }
});