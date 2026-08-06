/** PRODUCTION: return axiosInstance.get<ApiResponse>("/legal/terms-conditions", { params: { locale } }); */
import { mockResponse } from "../mocks/mockClient";
import type { ApiResponse } from "./types";

const mockLegalContent: Record<string, { title: string; content: string }> = {
  "terms-conditions": {
    title: "Terms & Conditions",
    content:
      "<p>This is placeholder legal copy for the Shahrayar demo build. In production this HTML is delivered by the backend's legal-content endpoint and rendered through <code>LegalContentSection</code> after sanitization with <code>isomorphic-dompurify</code>.</p>",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    content:
      "<p>This is placeholder legal copy for the Shahrayar demo build. In production this HTML is delivered by the backend's legal-content endpoint and rendered through <code>LegalContentSection</code> after sanitization with <code>isomorphic-dompurify</code>.</p>",
  },
};

export const getTermsConditions = async (_locale = "bg"): Promise<ApiResponse> => {
  return mockResponse(mockLegalContent["terms-conditions"]);
};

export const getPrivacyPolicy = async (_locale = "bg"): Promise<ApiResponse> => {
  return mockResponse(mockLegalContent["privacy-policy"]);
};

const legalAPI = {
  getTermsConditions,
  getPrivacyPolicy,
};

export default legalAPI;
