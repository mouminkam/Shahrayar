import axiosInstance from "./config/axios";
import type { ApiResponse } from "./types";

export interface DeliveryDropoff {
  lat: number;
  lng: number;
  address: string;
}

export const getDeliveryQuote = async (dropoff: DeliveryDropoff): Promise<ApiResponse> => {
  return axiosInstance.post<ApiResponse, ApiResponse>("/delivery/quote", {
    dropoff: {
      lat: dropoff.lat,
      lng: dropoff.lng,
      address: dropoff.address,
    },
  });
};

const deliveryAPI = {
  getDeliveryQuote,
};

export default deliveryAPI;
