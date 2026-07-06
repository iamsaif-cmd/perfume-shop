-- Run this in Supabase SQL Editor to switch ALL products to custom local
-- illustrations. None of these depend on any external website, so they can
-- never break/go dead again.

update products set image_url = 'images/velvet-oud.svg' where name = 'Velvet Oud';
update products set image_url = 'images/blanc-neroli.svg' where name = 'Blanc Neroli';
update products set image_url = 'images/cedar-smoke.svg' where name = 'Cedar & Smoke';
update products set image_url = 'images/rose-mirage.svg' where name = 'Rose Mirage';
update products set image_url = 'images/amber-nocturne.svg' where name = 'Amber Nocturne';
update products set image_url = 'images/fig-vetiver.svg' where name = 'Fig & Vetiver';
update products set image_url = 'images/golden-hour.svg' where name = 'Golden Hour';
update products set image_url = 'images/iron-leather.svg' where name = 'Iron & Leather';
update products set image_url = 'images/salt-air.svg' where name = 'Salt Air';
update products set image_url = 'images/midnight-tuberose.svg' where name = 'Midnight Tuberose';
update products set image_url = 'images/smoked-vanilla.svg' where name = 'Smoked Vanilla';
update products set image_url = 'images/citrus-verde.svg' where name = 'Citrus Verde';
update products set image_url = 'images/dusk-rose.svg' where name = 'Dusk Rose';
update products set image_url = 'images/stone-cedar.svg' where name = 'Stone & Cedar';
update products set image_url = 'images/velvet-peony.svg' where name = 'Velvet Peony';
update products set image_url = 'images/amberwood-reserve.svg' where name = 'Amberwood Reserve';
