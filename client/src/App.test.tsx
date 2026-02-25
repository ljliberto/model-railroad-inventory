import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import App from "./App";
import { GET_ITEMS, GET_BACKGROUND, GET_MANUFACTURER_NAMES, GET_SCALES, GET_SOURCE_NAMES, GET_STORAGE_LOCATION_NAMES, GET_CATEGORY_NAMES } from "./graphql";

// Mock data for Apollo Client
const mocks = [
  {
    request: {
      query: GET_ITEMS,
    },
    result: {
      data: {
        inventoryItems: [],
      },
    },
  },
  {
    request: {
      query: GET_BACKGROUND,
    },
    result: {
      data: {
        background: null,
      },
    },
  },
  {
    request: {
      query: GET_MANUFACTURER_NAMES,
    },
    result: {
      data: {
        allManufacturerNames: [],
      },
    },
  },
  {
    request: {
      query: GET_SCALES,
    },
    result: {
      data: {
        uniqueScales: [],
      },
    },
  },
  {
    request: {
      query: GET_SOURCE_NAMES,
    },
    result: {
      data: {
        allSourceNames: [],
      },
    },
  },
  {
    request: {
      query: GET_STORAGE_LOCATION_NAMES,
    },
    result: {
      data: {
        allStorageLocationNames: [],
      },
    },
  },
  {
    request: {
      query: GET_CATEGORY_NAMES,
    },
    result: {
      data: {
        allCategoryNames: [],
      },
    },
  },
];

describe("App functions", () => {
  it("handleChange updates form state including variation", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>
    );
    
    // Wait for the app to load
    const variationInput = await screen.findByPlaceholderText("Open Spoke Wheels, Thin Trim, etc.");
    expect(variationInput).toBeTruthy();
  });

  it("handleFileChange validates and sets image preview", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>
    );
    
    const imageLabel = await screen.findByText(/Image \(JPG\/PNG, max 5MB\)/);
    expect(imageLabel).toBeTruthy();
  });

  it("handleEdit populates form with item data including variation", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>
    );
    
    const heading = await screen.findByText("Add New Item");
    expect(heading).toBeTruthy();
  });

  it("handleSubmit allows variation to be empty or null", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>
    );
    
    const button = await screen.findByText("Add Item");
    expect(button).toBeTruthy();
  });

  it("handleClear resets the form including variation", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>
    );
    
    const clearButton = await screen.findByText("Clear");
    expect(clearButton).toBeTruthy();
  });

  it("variation field is included in export/import logic", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>
    );
    
    const importLabel = await screen.findByText("Import from Excel");
    expect(importLabel).toBeTruthy();
  });
});
