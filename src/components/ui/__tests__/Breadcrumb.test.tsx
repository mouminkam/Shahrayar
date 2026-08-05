/**
 * Tests for Breadcrumb component
 */

import { render, screen } from "@testing-library/react";
import Breadcrumb from "../Breadcrumb";

// Mock the hooks
jest.mock("../../../hooks/usePrefetchRoute", () => ({
  usePrefetchRoute: () => ({
    prefetchRoute: jest.fn(),
  }),
}));

jest.mock("../../../context/LanguageContext", () => ({
  useLanguage: () => ({
    lang: "en",
  }),
}));

jest.mock("../../../locales/i18n/getTranslation", () => ({
  t: (lang: string, key: string) => {
    const translations: Record<string, string> = {
      home: "Home",
    };
    return translations[key] || key;
  },
}));

describe("Breadcrumb Component", () => {
  it("should render the title in h1", () => {
    render(<Breadcrumb title="Test Page" />);
    const titleElement = screen.getByRole("heading", { level: 1, name: "Test Page" });
    expect(titleElement).toBeInTheDocument();
  });

  it("should show links by default", () => {
    render(<Breadcrumb title="Test Page" />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("should hide links when showLinks is false", () => {
    render(<Breadcrumb title="Test Page" showLinks={false} />);
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
  });

  it("should render title in uppercase class", () => {
    render(<Breadcrumb title="test page" />);
    const titleElement = screen.getByRole("heading", { level: 1, name: "test page" });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveClass("uppercase");
  });
});
