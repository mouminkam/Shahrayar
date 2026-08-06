/** PRODUCTION: return axiosInstance.post<ApiResponse>("/delivery/quote", { dropoff }); */
import { mockResponse } from "../mocks/mockClient";
import type { ApiResponse } from "./types";

export interface DeliveryDropoff {
  lat: number;
  lng: number;
  address: string;
}

export const getDeliveryQuote = async (_dropoff: DeliveryDropoff): Promise<ApiResponse> => {
  // Flat demo delivery fee — a real integration would call a routing/quote provider.
  return mockResponse({ quote_id: `quote_mock_${Date.now()}`, fee: 3.5, eta_minutes: 35 });
};

const deliveryAPI = {
  getDeliveryQuote,
};

export default deliveryAPI;
