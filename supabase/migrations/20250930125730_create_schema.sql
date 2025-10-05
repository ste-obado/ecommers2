/*
  # Affiliate Product Showcase Website Schema

  ## Overview
  This migration creates the complete database schema for an affiliate product showcase website
  with admin panel, client tracking, and product management capabilities.

  ## New Tables

  ### 1. products
  Main table storing all product information including media and affiliate links
  - `id` (uuid, primary key) - Unique product identifier
  - `title` (text) - Product name/title
  - `description` (text) - Detailed product description
  - `short_description` (text) - Brief product summary for listings
  - `category` (text) - Product category for filtering
  - `price` (numeric) - Display price
  - `affiliate_link` (text) - Digistore or external affiliate URL
  - `image_url` (text) - Main product image URL
  - `video_url` (text) - Product demo video URL
  - `featured` (boolean) - Whether product is featured on homepage
  - `views` (integer) - Number of times product was viewed
  - `status` (text) - Product status: 'active', 'draft', 'archived'
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. clients
  Tracks client inquiries and contact information
  - `id` (uuid, primary key) - Unique client identifier
  - `name` (text) - Client full name
  - `email` (text) - Client email address
  - `phone` (text) - Client phone number
  - `message` (text) - Client inquiry message
  - `product_id` (uuid, foreign key) - Related product if inquiry is about specific product
  - `status` (text) - Inquiry status: 'new', 'contacted', 'resolved'
  - `created_at` (timestamptz) - Inquiry submission time

  ### 3. analytics
  Tracks website analytics and user interactions
  - `id` (uuid, primary key) - Unique analytics entry identifier
  - `event_type` (text) - Type of event: 'page_view', 'product_view', 'affiliate_click', 'inquiry_submit'
  - `product_id` (uuid, foreign key) - Related product (nullable)
  - `metadata` (jsonb) - Additional event data
  - `created_at` (timestamptz) - Event timestamp

  ### 4. admin_users
  Stores admin user credentials and information
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - Admin email
  - `full_name` (text) - Admin full name
  - `role` (text) - Admin role: 'super_admin', 'admin', 'editor'
  - `created_at` (timestamptz) - Account creation time

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Public read access for products (active only)
  - Public insert access for clients table (inquiries)
  - Public insert access for analytics (tracking)
  - Admin-only access for management operations
  - Authenticated admin access for admin_users table

  ## Indexes
  - Products: category, featured, status for fast filtering
  - Clients: status, created_at for inquiry management
  - Analytics: event_type, created_at for reporting

  ## Important Notes
  1. All tables use RLS for security
  2. Public users can view active products and submit inquiries
  3. Only authenticated admins can manage products and view analytics
  4. Foreign keys maintain referential integrity
  5. Default values ensure data consistency
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  short_description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  price numeric(10, 2) NOT NULL DEFAULT 0.00,
  affiliate_link text NOT NULL,
  image_url text DEFAULT '',
  video_url text DEFAULT '',
  featured boolean DEFAULT false,
  views integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  message text NOT NULL DEFAULT '',
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'affiliate_click', 'inquiry_submit')),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'editor')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products table
-- Public can view active products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (status = 'active');

-- Authenticated admins can view all products
CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Authenticated admins can insert products
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Authenticated admins can update products
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Authenticated admins can delete products
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for clients table
-- Anyone can submit inquiries
CREATE POLICY "Anyone can submit inquiries"
  ON clients FOR INSERT
  WITH CHECK (true);

-- Authenticated admins can view all client inquiries
CREATE POLICY "Admins can view all inquiries"
  ON clients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Authenticated admins can update inquiry status
CREATE POLICY "Admins can update inquiries"
  ON clients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for analytics table
-- Anyone can insert analytics events
CREATE POLICY "Anyone can track analytics"
  ON analytics FOR INSERT
  WITH CHECK (true);

-- Authenticated admins can view analytics
CREATE POLICY "Admins can view analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- RLS Policies for admin_users table
-- Authenticated admins can view admin users
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();