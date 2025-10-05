import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function trackAnalytics(eventType, productId = null, metadata = {}) {
  try {
    await supabase.from('analytics').insert({
      event_type: eventType,
      product_id: productId,
      metadata
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

export async function getActiveProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return data || [];
}

export async function getProductById(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function incrementProductViews(productId) {
  const { error } = await supabase.rpc('increment_views', { product_id: productId });
  if (error) console.error('Error incrementing views:', error);
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('status', 'active');

  if (error) throw error;

  const categories = {};
  data.forEach(product => {
    categories[product.category] = (categories[product.category] || 0) + 1;
  });

  return Object.entries(categories).map(([name, count]) => ({ name, count }));
}

export async function getProductsByCategory(category) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('category', category)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function submitInquiry(inquiryData) {
  const { data, error } = await supabase
    .from('clients')
    .insert(inquiryData)
    .select()
    .single();

  if (error) throw error;
  return data;
}