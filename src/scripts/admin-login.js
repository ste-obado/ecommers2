import { supabase } from '../config/supabase.js';

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginMessage = document.getElementById('loginMessage');

async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.href = '/admin-dashboard.html';
  }
}

checkAuth();

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';
  loginMessage.innerHTML = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (adminError || !adminUser) {
      await supabase.auth.signOut();
      throw new Error('Access denied. Admin account required.');
    }

    loginMessage.innerHTML = '<div class="success-message">Login successful! Redirecting...</div>';

    setTimeout(() => {
      window.location.href = '/admin-dashboard.html';
    }, 1000);
  } catch (error) {
    console.error('Login error:', error);
    loginMessage.innerHTML = `<div class="error-message">${error.message}</div>`;
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});