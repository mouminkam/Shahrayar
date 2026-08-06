/**
 * PRODUCTION: auth/profile/orders would come from `/auth/*` and `/orders/*`
 * — see `src/api/auth.ts` and `src/api/orders.ts`.
 *
 * Any email/password combination signs in successfully in this demo build —
 * there is no real credential check because there is no real backend.
 */
export const mockUser = {
  id: 1,
  name: "Yousef Al-Sayed",
  email: "demo@shahrayar.example",
  phone: "+359 88 123 4567",
  branch_id: 1,
  image: "/img/profile/profile.png",
  address: "12 Vitosha Boulevard, Sofia, Bulgaria",
};

export const mockOrders = [
  {
    id: 1042,
    status: "delivered",
    payment_method: "cash",
    payment_status: "paid",
    order_type: "delivery",
    subtotal: 24.4,
    tax_amount: 10,
    delivery_charge: 3.5,
    discount_amount: 0,
    total_amount: 37.9,
    customer_name: mockUser.name,
    customer_phone: mockUser.phone,
    customer_email: mockUser.email,
    delivery_address: mockUser.address,
    created_at: "2026-07-28T18:32:00.000Z",
    order_items: [
      { id: 1, menu_item_id: 1, menu_item: { id: 1, name: "Chicken Shawarma Wrap", image: "/img/dishes/dishes3_1.jpg" }, quantity: 2, price: 8.5 },
      { id: 2, menu_item_id: 22, menu_item: { id: 22, name: "Kunafa", image: "/img/dishes/dishes6_1.png" }, quantity: 1, price: 6.5 },
    ],
  },
  {
    id: 1035,
    status: "delivered",
    payment_method: "stripe",
    payment_status: "paid",
    payment_intent_id: "pi_mock_1035",
    order_type: "pickup",
    subtotal: 22.8,
    tax_amount: 10,
    delivery_charge: 0,
    discount_amount: 2,
    total_amount: 30.8,
    customer_name: mockUser.name,
    customer_phone: mockUser.phone,
    customer_email: mockUser.email,
    created_at: "2026-07-15T12:05:00.000Z",
    order_items: [
      { id: 3, menu_item_id: 6, menu_item: { id: 6, name: "Shahrayar Signature Burger", image: "/img/dishes/burger.png" }, quantity: 2, price: 10.9 },
      { id: 4, menu_item_id: 17, menu_item: { id: 17, name: "Loaded Fries", image: "/img/dishes/dishes4_3.png" }, quantity: 1, price: 6.9 },
    ],
  },
  {
    id: 1021,
    status: "processing",
    payment_method: "cash",
    payment_status: "pending",
    order_type: "delivery",
    subtotal: 13.9,
    tax_amount: 10,
    delivery_charge: 3.5,
    discount_amount: 0,
    total_amount: 27.4,
    customer_name: mockUser.name,
    customer_phone: mockUser.phone,
    customer_email: mockUser.email,
    delivery_address: mockUser.address,
    created_at: "2026-08-04T20:10:00.000Z",
    order_items: [
      { id: 5, menu_item_id: 12, menu_item: { id: 12, name: "Spicy Shawarma Pizza", image: "/img/dishes/dishes2_2.png" }, quantity: 1, price: 13.9 },
    ],
  },
];

export function findMockOrderById(id: number | string) {
  return mockOrders.find((o) => String(o.id) === String(id));
}
