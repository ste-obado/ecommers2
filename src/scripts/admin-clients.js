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

const statusFilter = document.getElementById('statusFilter');

statusFilter.addEventListener('change', loadInquiries);

async function loadInquiries() {
  const container = document.getElementById('inquiriesTable');
  const filterStatus = statusFilter.value;

  try {
    let query = supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (filterStatus) {
      query = query.eq('status', filterStatus);
    }

    const { data: inquiries, error } = await query;

    if (error) throw error;

    if (!inquiries || inquiries.length === 0) {
      container.innerHTML = '<div class="loading">No inquiries found</div>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Contact</th>
            <th>Message</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${inquiries.map(inquiry => {
            const date = new Date(inquiry.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return `
              <tr>
                <td>${date}</td>
                <td style="font-weight: 600;">${inquiry.name}</td>
                <td>
                  <div>${inquiry.email}</div>
                  ${inquiry.phone ? `<div style="font-size: 12px; color: var(--gray);">${inquiry.phone}</div>` : ''}
                </td>
                <td>
                  <div style="max-width: 300px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${inquiry.message}
                  </div>
                </td>
                <td>
                  <span class="inquiry-status ${inquiry.status}">${inquiry.status}</span>
                </td>
                <td class="table-actions">
                  ${inquiry.status !== 'contacted' ? `<button class="btn btn-primary" onclick="updateStatus('${inquiry.id}', 'contacted')">Mark Contacted</button>` : ''}
                  ${inquiry.status !== 'resolved' ? `<button class="btn btn-success" onclick="updateStatus('${inquiry.id}', 'resolved')">Mark Resolved</button>` : ''}
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Error loading inquiries:', error);
    container.innerHTML = '<p class="error-message">Failed to load inquiries</p>';
  }
}

window.updateStatus = async function(inquiryId, newStatus) {
  try {
    const { error } = await supabase
      .from('clients')
      .update({ status: newStatus })
      .eq('id', inquiryId);

    if (error) throw error;

    loadInquiries();
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Failed to update inquiry status');
  }
};

checkAuth().then(isAuthenticated => {
  if (isAuthenticated) {
    loadInquiries();
  }
});