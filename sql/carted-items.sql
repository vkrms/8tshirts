-- Run in Neon's SQL editor (or psql) to see demand.

-- 1. Units per SKU: reserved (visitor left an email) vs anonymous.
--    Items a visitor removed are deleted from cart_item, so they don't count.
SELECT ci.product_sku,
       ci.product_name,
       COALESCE(SUM(ci.qty) FILTER (WHERE COALESCE(c.customer_email, '') <> ''), 0) AS reserved_units,
       COALESCE(SUM(ci.qty) FILTER (WHERE COALESCE(c.customer_email, '') = ''), 0)  AS anonymous_units
FROM cart_item ci
JOIN cart c ON c.cart_id = ci.cart_id
GROUP BY ci.product_sku, ci.product_name
ORDER BY ci.product_sku;

-- 2. Who to contact, and what each person reserved.
SELECT c.customer_email,
       ci.product_sku,
       ci.product_name,
       ci.qty,
       c.updated_at
FROM cart c
JOIN cart_item ci ON ci.cart_id = c.cart_id
WHERE COALESCE(c.customer_email, '') <> ''
ORDER BY c.customer_email, ci.product_sku;
