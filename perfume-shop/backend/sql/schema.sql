-- ============================================
-- ESSENCE (Perfume Store) — Supabase SQL Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  is_admin boolean default false,
  created_at timestamp with time zone default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Products
create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  brand text,
  description text,
  top_notes text,
  heart_notes text,
  base_notes text,
  price numeric(10,2) not null,
  image_url text,
  category text default 'unisex',
  stock int default 20,
  created_at timestamp with time zone default now()
);

-- Cart items
create table if not exists cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity int default 1 check (quantity > 0),
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

-- Orders
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  total numeric(10,2) not null,
  status text default 'placed',
  created_at timestamp with time zone default now()
);

-- Order items
create table if not exists order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id),
  quantity int not null,
  price numeric(10,2) not null
);

-- ============================================
-- Row Level Security
-- ============================================
alter table profiles enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Profiles: user can read/update own profile
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Products: anyone can read; only admins write (writes happen via backend service role, so no insert/update policy needed for anon)
create policy "products_select_all" on products for select using (true);

-- Cart: user only sees/edits their own cart
create policy "cart_select_own" on cart_items for select using (auth.uid() = user_id);
create policy "cart_insert_own" on cart_items for insert with check (auth.uid() = user_id);
create policy "cart_update_own" on cart_items for update using (auth.uid() = user_id);
create policy "cart_delete_own" on cart_items for delete using (auth.uid() = user_id);

-- Orders: user only sees their own orders
create policy "orders_select_own" on orders for select using (auth.uid() = user_id);
create policy "order_items_select_own" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- ============================================
-- Seed sample products
-- ============================================
insert into products (name, brand, description, top_notes, heart_notes, base_notes, price, image_url, category, stock) values
('Velvet Oud', 'Essence House', 'A rich, smoky oud wrapped in warm amber for evening wear.', 'Saffron, Bergamot', 'Oud, Rose', 'Amber, Musk', 4200, 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&q=80', 'unisex', 25),
('Blanc Neroli', 'Essence House', 'Bright citrus and neroli for an effortless daytime scent.', 'Neroli, Lemon', 'Orange Blossom', 'White Musk', 3200, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&q=80', 'women', 40),
('Cedar & Smoke', 'Essence House', 'Woody and grounded, built around cedarwood and smoked vetiver.', 'Black Pepper', 'Cedarwood', 'Vetiver, Smoke', 3800, 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=700&q=80', 'men', 30),
('Rose Mirage', 'Essence House', 'A modern take on rose, softened with pink pepper and iris.', 'Pink Pepper', 'Rose, Iris', 'Sandalwood', 4500, 'https://images.unsplash.com/photo-1615368144592-8309d5c6c9c5?w=700&q=80', 'women', 20),
('Amber Nocturne', 'Essence House', 'A deep, sensual amber for cold nights.', 'Cinnamon', 'Amber, Labdanum', 'Vanilla, Musk', 5000, 'https://images.unsplash.com/photo-1592945403407-9caf930b0c8f?w=700&q=80', 'unisex', 15),
('Fig & Vetiver', 'Essence House', 'Green fig leaf balanced with earthy vetiver.', 'Fig Leaf', 'Green Notes', 'Vetiver', 3600, 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=700&q=80', 'unisex', 35);
