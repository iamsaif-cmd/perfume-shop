-- Run this in Supabase SQL Editor to ADD 10 more perfumes
-- (your existing 6 products stay untouched — this only inserts new rows)

insert into products (name, brand, description, top_notes, heart_notes, base_notes, price, image_url, category, stock) values
('Golden Hour', 'Essence House', 'A warm, sun-soaked scent built around amber and honeyed florals.', 'Bergamot, Mandarin', 'Jasmine, Honey', 'Amber, Tonka Bean', 4300, 'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?w=700&q=80', 'women', 22),
('Iron & Leather', 'Essence House', 'Bold and industrial — smoked leather over cold metallic accord.', 'Black Pepper, Cardamom', 'Leather, Iris', 'Oud, Patchouli', 5200, 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=700&q=80', 'men', 18),
('Salt Air', 'Essence House', 'A crisp, oceanic scent that feels like a walk along the coast.', 'Sea Salt, Grapefruit', 'Marine Accord, Lavender', 'Driftwood, Musk', 3400, 'https://images.unsplash.com/photo-1595425964272-3f5f0e2d6a37?w=700&q=80', 'unisex', 28),
('Midnight Tuberose', 'Essence House', 'Heady white florals for evenings that stretch past midnight.', 'Green Notes', 'Tuberose, Ylang Ylang', 'Sandalwood, Musk', 4800, 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=700&q=80', 'women', 16),
('Smoked Vanilla', 'Essence House', 'A gourmand vanilla softened with a whisper of smoke and spice.', 'Cinnamon, Clove', 'Vanilla Orchid', 'Smoked Wood, Benzoin', 4100, 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=700&q=80', 'unisex', 24),
('Citrus Verde', 'Essence House', 'Sharp Italian citrus over a green herbal base — pure energy in a bottle.', 'Lime, Grapefruit', 'Basil, Mint', 'Vetiver', 2900, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=700&q=80', 'men', 33),
('Dusk Rose', 'Essence House', 'A velvety rose deepened with dark berries and soft musk.', 'Blackcurrant', 'Bulgarian Rose', 'Musk, Sandalwood', 4600, 'https://images.unsplash.com/photo-1622108080322-6a1ea6c0a13e?w=700&q=80', 'women', 20),
('Stone & Cedar', 'Essence House', 'Mineral-cool top notes resting on warm, dry cedarwood.', 'Grey Amber, Bergamot', 'Cedarwood', 'Vetiver, Musk', 3900, 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=700&q=80', 'men', 27),
('Velvet Peony', 'Essence House', 'Soft, powdery peony wrapped in a plush musk base.', 'Peony, Litchi', 'Peach, Rose', 'White Musk', 3700, 'https://images.unsplash.com/photo-1587304785199-1de892be5b32?w=700&q=80', 'women', 19),
('Amberwood Reserve', 'Essence House', 'Our richest unisex scent — deep amber, aged wood, and a hint of resin.', 'Saffron, Pink Pepper', 'Amberwood', 'Labdanum, Oud', 5600, 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=700&q=80', 'unisex', 14);
