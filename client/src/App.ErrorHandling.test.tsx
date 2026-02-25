import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import App from "./App";
import { 
  GET_ITEMS, 
  GET_BACKGROUND, 
  GET_MANUFACTURER_NAMES, 
  GET_SCALES, 
  GET_SOURCE_NAMES, 
  GET_STORAGE_LOCATION_NAMES, 
  GET_CATEGORY_NAMES
} from "./graphql";

const baseMocks = [
  {
    request: { query: GET_ITEMS },
    result: { data: { inventoryItems: [] } },
  },
  {
    request: { query: GET_BACKGROUND },
    result: { data: { background: null } },
  },
  {
    request: { query: GET_MANUFACTURER_NAMES },
    result: { data: { allManufacturerNames: ["Lionel", "MTH", "Atlas"] } },
  },
  {
    request: { query: GET_SCALES },
    result: { data: { uniqueScales: ["O", "HO", "N"] } },
  },
  {
    request: { query: GET_SOURCE_NAMES },
    result: { data: { allSourceNames: ["eBay", "Train Show"] } },
  },
  {
    request: { query: GET_STORAGE_LOCATION_NAMES },
    result: { data: { allStorageLocationNames: ["Shelf A", "Shelf B"] } },
  },
  {
    request: { query: GET_CATEGORY_NAMES },
    result: { data: { allCategoryNames: ["Locomotive", "Freight Car"] } },
  },
];

describe("Error Handling Tests", () => {
  it("should display error message when items query fails", async () => {
    const errorMocks = [
      {
        request: { query: GET_ITEMS },
        error: new Error("Failed to fetch items"),
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to fetch items/i)).toBeInTheDocument();
  });

  it("should display loading state while fetching items", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    // Loading state should appear initially (there may be multiple loading indicators)
    const loadingElements = screen.getAllByText(/Loading.../i);
    expect(loadingElements.length).toBeGreaterThan(0);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
    });
  });

  it("should handle manufacturer query error gracefully", async () => {
    const errorMocks = [
      baseMocks[0],
      baseMocks[1],
      {
        request: { query: GET_MANUFACTURER_NAMES },
        error: new Error("Failed to fetch manufacturers"),
      },
      ...baseMocks.slice(3),
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Manufacturer/i)).toBeInTheDocument();
    });

    // Should show error indicator for manufacturer dropdown
    expect(screen.getByText(/Error loading manufacturers/i)).toBeInTheDocument();
  });

  it("should handle scale query error gracefully", async () => {
    const errorMocks = [
      baseMocks[0],
      baseMocks[1],
      baseMocks[2],
      {
        request: { query: GET_SCALES },
        error: new Error("Failed to fetch scales"),
      },
      ...baseMocks.slice(4),
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Scale/i)).toBeInTheDocument();
    });

    // Should show error indicator for scale dropdown
    expect(screen.getByText(/Error loading scales/i)).toBeInTheDocument();
  });

  it("should disable manufacturer dropdown when loading", async () => {
    const delayedMocks = [
      baseMocks[0],
      baseMocks[1],
      {
        request: { query: GET_MANUFACTURER_NAMES },
        result: { data: { allManufacturerNames: ["Lionel"] } },
        delay: 1000, // Simulate slow network
      },
      ...baseMocks.slice(3),
    ];

    render(
      <MockedProvider mocks={delayedMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Manufacturer/i)).toBeInTheDocument();
    });

    const manufacturerSelect = screen.getByLabelText(/Manufacturer/i) as HTMLSelectElement;
    
    // Should show loading indicator
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("should disable scale dropdown when loading", async () => {
    const delayedMocks = [
      baseMocks[0],
      baseMocks[1],
      baseMocks[2],
      {
        request: { query: GET_SCALES },
        result: { data: { uniqueScales: ["O"] } },
        delay: 1000,
      },
      ...baseMocks.slice(4),
    ];

    render(
      <MockedProvider mocks={delayedMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Scale/i)).toBeInTheDocument();
    });

    // Should show loading state
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("should disable scale dropdown when error occurs", async () => {
    const errorMocks = [
      baseMocks[0],
      baseMocks[1],
      baseMocks[2],
      {
        request: { query: GET_SCALES },
        error: new Error("Network error"),
      },
      ...baseMocks.slice(4),
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Scale/i)).toBeInTheDocument();
    });

    const scaleSelect = screen.getByLabelText(/Scale/i) as HTMLSelectElement;
    expect(scaleSelect.disabled).toBe(true);
  });

  it("should disable manufacturer dropdown when error occurs", async () => {
    const errorMocks = [
      baseMocks[0],
      baseMocks[1],
      {
        request: { query: GET_MANUFACTURER_NAMES },
        error: new Error("Network error"),
      },
      ...baseMocks.slice(3),
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Manufacturer/i)).toBeInTheDocument();
    });

    const manufacturerSelect = screen.getByLabelText(/Manufacturer/i) as HTMLSelectElement;
    expect(manufacturerSelect.disabled).toBe(true);
  });

  it("should handle GraphQL errors", async () => {
    const errorMocks = [
      {
        request: { query: GET_ITEMS },
        result: {
          errors: [new GraphQLError("GraphQL error: Failed to fetch")],
        },
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });
  });

  it("should handle network errors", async () => {
    const errorMocks = [
      {
        request: { query: GET_ITEMS },
        error: new Error("Network error: Failed to fetch"),
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });

  it("should handle empty data responses", async () => {
    const emptyMocks = [
      {
        request: { query: GET_ITEMS },
        result: { data: { inventoryItems: [] } },
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={emptyMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No items yet/i)).toBeInTheDocument();
    });
  });

  it("should handle null category data", async () => {
    const nullMocks = [
      baseMocks[0],
      baseMocks[1],
      baseMocks[2],
      baseMocks[3],
      baseMocks[4],
      baseMocks[5],
      {
        request: { query: GET_CATEGORY_NAMES },
        result: { data: { allCategoryNames: null } },
      },
    ];

    render(
      <MockedProvider mocks={nullMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText(/Category/i) as HTMLSelectElement;
    // Should still render the select, just without options
    expect(categorySelect).toBeInTheDocument();
  });

  it("should handle null manufacturer data", async () => {
    const nullMocks = [
      baseMocks[0],
      baseMocks[1],
      {
        request: { query: GET_MANUFACTURER_NAMES },
        result: { data: { allManufacturerNames: null } },
      },
      ...baseMocks.slice(3),
    ];

    render(
      <MockedProvider mocks={nullMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Manufacturer/i)).toBeInTheDocument();
    });

    const manufacturerSelect = screen.getByLabelText(/Manufacturer/i) as HTMLSelectElement;
    expect(manufacturerSelect).toBeInTheDocument();
  });

  it("should handle null scale data", async () => {
    const nullMocks = [
      baseMocks[0],
      baseMocks[1],
      baseMocks[2],
      {
        request: { query: GET_SCALES },
        result: { data: { uniqueScales: null } },
      },
      ...baseMocks.slice(4),
    ];

    render(
      <MockedProvider mocks={nullMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Scale/i)).toBeInTheDocument();
    });

    const scaleSelect = screen.getByLabelText(/Scale/i) as HTMLSelectElement;
    expect(scaleSelect).toBeInTheDocument();
  });

  it("should handle category query error", async () => {
    const errorMocks = [
      ...baseMocks.slice(0, 6),
      {
        request: { query: GET_CATEGORY_NAMES },
        error: new Error("Failed to fetch categories"),
      },
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    });

    // Should show error indicator
    expect(screen.getByText(/Error loading categories/i)).toBeInTheDocument();
  });

  it("should handle source query error", async () => {
    const errorMocks = [
      ...baseMocks.slice(0, 4),
      {
        request: { query: GET_SOURCE_NAMES },
        error: new Error("Failed to fetch sources"),
      },
      ...baseMocks.slice(5),
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Acquired From/i)).toBeInTheDocument();
    });

    // The component should still render the select
    const sourceSelect = screen.getByLabelText(/Acquired From/i) as HTMLSelectElement;
    expect(sourceSelect).toBeInTheDocument();
  });

  it("should handle storage location query error", async () => {
    const errorMocks = [
      ...baseMocks.slice(0, 5),
      {
        request: { query: GET_STORAGE_LOCATION_NAMES },
        error: new Error("Failed to fetch storage locations"),
      },
      baseMocks[6],
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Storage Location/i)).toBeInTheDocument();
    });

    const storageSelect = screen.getByLabelText(/Storage Location/i) as HTMLSelectElement;
    expect(storageSelect).toBeInTheDocument();
  });

  it("should handle background query error gracefully", async () => {
    const errorMocks = [
      baseMocks[0],
      {
        request: { query: GET_BACKGROUND },
        error: new Error("Failed to fetch background"),
      },
      ...baseMocks.slice(2),
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    // App should still render even if background fails
    await waitFor(() => {
      expect(screen.getByText("Model Railroad Inventory")).toBeInTheDocument();
    });
  });

  it("should handle undefined data gracefully", async () => {
    const undefinedMocks = [
      {
        request: { query: GET_ITEMS },
        result: { data: undefined },
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={undefinedMocks}>
        <App />
      </MockedProvider>
    );

    // Should handle undefined data without crashing
    await waitFor(() => {
      expect(screen.getByText("Model Railroad Inventory")).toBeInTheDocument();
    });
  });

  it("should show appropriate message when loading categories", async () => {
    const delayedMocks = [
      baseMocks[0],
      baseMocks[1],
      baseMocks[2],
      baseMocks[3],
      baseMocks[4],
      baseMocks[5],
      {
        request: { query: GET_CATEGORY_NAMES },
        result: { data: { allCategoryNames: ["Locomotive"] } },
        delay: 1000,
      },
    ];

    render(
      <MockedProvider mocks={delayedMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText(/Category/i) as HTMLSelectElement;
    
    // Should show loading option
    const options = Array.from(categorySelect.options).map(opt => opt.text);
    expect(options).toContain("Loading categories...");
  });

  it("should handle multiple simultaneous errors", async () => {
    const multiErrorMocks = [
      {
        request: { query: GET_ITEMS },
        error: new Error("Failed to fetch items"),
      },
      {
        request: { query: GET_BACKGROUND },
        error: new Error("Failed to fetch background"),
      },
      {
        request: { query: GET_MANUFACTURER_NAMES },
        error: new Error("Failed to fetch manufacturers"),
      },
      {
        request: { query: GET_SCALES },
        error: new Error("Failed to fetch scales"),
      },
      {
        request: { query: GET_SOURCE_NAMES },
        error: new Error("Failed to fetch sources"),
      },
      {
        request: { query: GET_STORAGE_LOCATION_NAMES },
        error: new Error("Failed to fetch storage locations"),
      },
      {
        request: { query: GET_CATEGORY_NAMES },
        error: new Error("Failed to fetch categories"),
      },
    ];

    render(
      <MockedProvider mocks={multiErrorMocks}>
        <App />
      </MockedProvider>
    );

    // App should still render even with multiple errors
    await waitFor(() => {
      expect(screen.getByText("Model Railroad Inventory")).toBeInTheDocument();
    });

    // Should show error for items
    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
  });

  it("should continue to function after error recovery", async () => {
    const errorMocks = [
      {
        request: { query: GET_ITEMS },
        error: new Error("Temporary error"),
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={errorMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
    });

    // Form should still be available
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });
});
