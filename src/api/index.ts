import authAPI from "./auth";
import branchesAPI from "./branches";
import menuAPI from "./menu";
import ordersAPI from "./orders";
import couponsAPI from "./coupons";
import paymentsAPI from "./payments";
import deliveryAPI from "./delivery";
import slidesAPI from "./slides";
import legalAPI from "./legal";

export {
  authAPI,
  branchesAPI,
  menuAPI,
  ordersAPI,
  couponsAPI,
  paymentsAPI,
  deliveryAPI,
  slidesAPI,
  legalAPI,
};

export { default as axiosInstance } from "./config/axios";
export type { ApiResponse } from "./types";

const api = {
  auth: authAPI,
  branches: branchesAPI,
  menu: menuAPI,
  orders: ordersAPI,
  coupons: couponsAPI,
  payments: paymentsAPI,
  delivery: deliveryAPI,
  slides: slidesAPI,
  legal: legalAPI,
};

export default api;
