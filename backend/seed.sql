-- 🧑‍💻 Insert Admin
INSERT INTO "User" ("username", "email", "password", "role", "createdAt", "updatedAt")
VALUES ('H25639SRV', 'h25639srv@gmail.com', '123456', 'ADMIN', now(), now());

-- 👥 Insert Users
INSERT INTO "User" ("username", "email", "password", "role", "createdAt", "updatedAt")
VALUES 
('testuser1', 'test1@example.com', '123456', 'USER', now(), now()),
('testuser2', 'test2@example.com', '123456', 'USER', now(), now());

-- 🍱 Insert Sample Products
INSERT INTO "Product" ("name", "description", "price", "image", "createdAt", "updatedAt")
VALUES
('Pottery 1', 'abc', 95000, 'https://i.imgur.com/A8eQsll.jpeg', now(), now()),
('Pottery 2', 'abc', 85000, 'https://i.imgur.com/qW2d1pT.jpeg', now(), now()),
('Pottery 3', 'abc', 65000, 'https://i.imgur.com/Yr8v3cC.jpeg', now(), now());

-- 🛒 Create Cart for testuser1
INSERT INTO "Cart" ("userId", "createdAt", "updatedAt")
VALUES (1, now(), now());

-- 🧺 Add one product to cart
INSERT INTO "CartItem" ("cartId", "productId", "quantity")
VALUES (1, 1, 2);

