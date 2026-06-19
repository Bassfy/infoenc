-- LED Profile Decorations — PostgreSQL Database Schema
-- Production-ready e-commerce schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── USERS ────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  avatar TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'manager')),
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verify_token TEXT,
  reset_password_token TEXT,
  reset_password_expires TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50) DEFAULT 'Home',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  street TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  phone VARCHAR(30),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRODUCTS ─────────────────────────────────────────────────────────────────

CREATE TABLE product_categories (
  id VARCHAR(100) PRIMARY KEY,
  label VARCHAR(200) NOT NULL,
  description TEXT,
  parent_id VARCHAR(100) REFERENCES product_categories(id),
  image TEXT,
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  meta_title VARCHAR(200),
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(300) UNIQUE NOT NULL,
  name VARCHAR(300) NOT NULL,
  short_description TEXT,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  category_id VARCHAR(100) REFERENCES product_categories(id),
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(100),
  weight_grams INT,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  stock_quantity INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 10,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  sales_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  warranty VARCHAR(100),
  installation_method TEXT,
  tags TEXT[],
  meta_title VARCHAR(200),
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured, is_active);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(short_description, '')));

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false
);

CREATE TABLE product_specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label VARCHAR(200) NOT NULL,
  value TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE product_finishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  finish_id VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  color_hex VARCHAR(7),
  image TEXT,
  sort_order INT DEFAULT 0
);

CREATE TABLE product_length_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  value_mm INT NOT NULL,
  label VARCHAR(50) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE TABLE product_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('CAD', 'IES', 'PDF', 'DXF')),
  label VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  file_size VARCHAR(50),
  sort_order INT DEFAULT 0
);

CREATE TABLE related_products (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  related_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, related_product_id)
);

-- ─── REVIEWS ──────────────────────────────────────────────────────────────────

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(200) NOT NULL,
  user_avatar TEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  project_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id, is_approved);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ─── ORDERS ───────────────────────────────────────────────────────────────────

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  status VARCHAR(30) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'cod')),
  payment_intent_id TEXT,
  subtotal DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  coupon_code VARCHAR(100),
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  tracking_number VARCHAR(200),
  shipping_carrier VARCHAR(100),
  estimated_delivery DATE,
  notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(300) NOT NULL,
  product_image TEXT,
  sku VARCHAR(100),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  selected_finish VARCHAR(200),
  selected_length VARCHAR(50),
  configuration JSONB
);

-- ─── COUPONS ──────────────────────────────────────────────────────────────────

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(12,2) NOT NULL CHECK (value > 0),
  min_order_amount DECIMAL(12,2),
  max_discount_amount DECIMAL(12,2),
  max_uses INT,
  used_count INT DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WISHLIST ─────────────────────────────────────────────────────────────────

CREATE TABLE wishlists (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, product_id)
);

-- ─── GALLERY / PROJECTS ───────────────────────────────────────────────────────

CREATE TABLE gallery_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(300) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  category VARCHAR(50) NOT NULL CHECK (category IN ('residential', 'commercial', 'retail', 'hospitality', 'office', 'outdoor')),
  cover_image TEXT NOT NULL,
  images TEXT[],
  products_used TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  completed_at DATE,
  meta_title VARCHAR(200),
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── NEWSLETTER ───────────────────────────────────────────────────────────────

CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  source VARCHAR(100),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- ─── CONTENT ──────────────────────────────────────────────────────────────────

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(300) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  meta_title VARCHAR(200),
  meta_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── TRIGGERS ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── SEED DATA ────────────────────────────────────────────────────────────────

INSERT INTO product_categories (id, label, description, sort_order, is_featured) VALUES
('recessed', 'Recessed Profiles', 'Seamless flush integration into ceilings and walls', 1, true),
('surface-mounted', 'Surface Mounted Profiles', 'Clean surface application for any environment', 2, true),
('corner', 'Corner Profiles', 'Precision 90° and custom angle solutions', 3, true),
('suspended', 'Suspended Profiles', 'Dramatic floating light installations', 4, true),
('trimless', 'Trimless Profiles', 'Invisible integration for purist aesthetics', 5, true),
('flexible', 'Flexible Profiles', 'Curved and custom shape applications', 6, false),
('led-strips', 'LED Strips', 'Premium SMD and COB LED strips', 7, true),
('cob-strips', 'COB LED Strips', 'Continuous filament-like COB strips', 8, true),
('drivers', 'Drivers', 'Constant voltage and constant current drivers', 9, false),
('controllers', 'Controllers', 'DALI, Bluetooth, KNX, DMX controllers', 10, false),
('power-supplies', 'Power Supplies', 'Professional-grade power solutions', 11, false),
('diffusers', 'Diffusers', 'Clear, opal, frosted, and prismatic diffusers', 12, false),
('accessories', 'Accessories', 'All accessories for complete installations', 13, false),
('connectors', 'Connectors', 'Strip-to-strip and strip-to-driver connectors', 14, false),
('end-caps', 'End Caps', 'Precision machined aluminum end caps', 15, false),
('mounting-clips', 'Mounting Clips', 'Tool-free spring mounting clips', 16, false);

INSERT INTO coupons (code, description, type, value, min_order_amount, max_uses, is_active) VALUES
('WELCOME15', '15% off your first order', 'percentage', 15, 200, 1000, true),
('ARCH50', '$50 off orders over $500', 'fixed', 50, 500, 500, true),
('PROF20', '20% off for professional accounts', 'percentage', 20, 1000, 200, true);
