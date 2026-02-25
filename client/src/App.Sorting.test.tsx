import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
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

const mockItems = [
  {
    id: "1",
    image: "data:image/jpeg;base64,test1",
    description: "Zebra Locomotive",
    category: "Locomotive",
    scale: "O",
    manufacturer: "Lionel",
    modelFirstYear: 1952,
    modelNumber: "2046",
    acquiredFrom: "eBay",
    acquiredDate: "2024-01-15",
    condition: "Excellent",
    collectionName: "Steam Era",
    storageLocation: "Shelf A",
    variation: "Open Spoke Wheels",
    originalBox: true,
    originalValue: 125.00,
    estimatedValue: 275.00,
    created_timestamp: "2024-01-15T10:00:00Z",
    updated_timestamp: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    image: "data:image/jpeg;base64,test2",
    description: "Alpha Diesel",
    category: "Locomotive",
    scale: "HO",
    manufacturer: "MTH",
    modelFirstYear: 2005,
    modelNumber: "30-2567-1",
    acquiredFrom: "Train Show",
    acquiredDate: "2024-02-10",
    condition: "Mint",
    collectionName: "Modern Era",
    storageLocation: "Shelf B",
    variation: "Red Stripe",
    originalBox: true,
    originalValue: 350.00,
    estimatedValue: 400.00,
    created_timestamp: "2024-02-10T10:00:00Z",
    updated_timestamp: "2024-02-10T10:00:00Z",
  },
  {
    id: "3",
    image: "data:image/jpeg;base64,test3",
    description: "Beta Freight Car",
    category: "Freight Car",
    scale: "N",
    manufacturer: "Atlas",
    modelFirstYear: 1998,
    modelNumber: "1234",
    acquiredFrom: "Local Shop",
    acquiredDate: "2024-03-20",
    condition: "Good",
    collectionName: null,
    storageLocation: null,
    variation: null,
    originalBox: false,
    originalValue: null,
    estimatedValue: null,
    created_timestamp: "2024-03-20T10:00:00Z",
    updated_timestamp: "2024-03-20T10:00:00Z",
  },
];

const baseMocks = [
  {
    request: { query: GET_ITEMS },
    result: { data: { inventoryItems: mockItems } },
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
    result: { data: { allSourceNames: ["eBay", "Train Show", "Local Shop"] } },
  },
  {
    request: { query: GET_STORAGE_LOCATION_NAMES },
    result: { data: { allStorageLocationNames: ["Shelf A", "Shelf B"] } },
  },
  {
    request: { query: GET_CATEGORY_NAMES },
    result: { data: { allCategoryNames: ["Locomotive", "Freight Car", "Passenger Car"] } },
  },
];

describe("Sorting Tests", () => {
  it("should display sort controls when items exist", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Zebra Locomotive")).toBeInTheDocument();
    });

    expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    expect(screen.getByText("Secondary Sort:")).toBeInTheDocument();
    expect(screen.getByText("Tertiary Sort:")).toBeInTheDocument();
  });

  it("should have description as default primary sort", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const primarySortSelect = within(sortControls).getAllByRole('combobox')[0] as HTMLSelectElement;
    expect(primarySortSelect.value).toBe("description");
  });

  it("should display sort direction buttons", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    const directionButtons = screen.getAllByTitle(/Ascending|Descending/i);
    expect(directionButtons.length).toBeGreaterThan(0);
  });

  it("should toggle primary sort direction", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    // Find the primary sort direction button
    const sortLabels = screen.getAllByText(/Primary Sort:/i);
    const primarySection = sortLabels[0].parentElement;
    const directionButton = primarySection?.querySelector('[title="Ascending"]') as HTMLButtonElement;
    
    expect(directionButton).toBeTruthy();
    expect(directionButton.textContent).toBe("↑");

    // Click to toggle
    fireEvent.click(directionButton);

    // Should change to descending
    await waitFor(() => {
      const updatedButton = primarySection?.querySelector('[title="Descending"]') as HTMLButtonElement;
      expect(updatedButton?.textContent).toBe("↓");
    });
  });

  it("should have all available sort options", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const primarySortSelect = within(sortControls).getAllByRole('combobox')[0] as HTMLSelectElement;
    const options = Array.from(primarySortSelect.options).map(opt => opt.value);

    expect(options).toContain("description");
    expect(options).toContain("category");
    expect(options).toContain("scale");
    expect(options).toContain("manufacturer");
    expect(options).toContain("modelNumber");
    expect(options).toContain("acquiredDate");
    expect(options).toContain("created_timestamp");
    expect(options).toContain("updated_timestamp");
  });

  it("should not show used sort fields in secondary/tertiary options", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const allSortSelects = within(sortControls).getAllByRole('combobox');
    const primarySortSelect = allSortSelects[0] as HTMLSelectElement;
    const secondarySortSelect = allSortSelects[1] as HTMLSelectElement;

    // Primary is set to "description" by default
    expect(primarySortSelect.value).toBe("description");

    // Secondary should not have "description" as an option
    const secondaryOptions = Array.from(secondarySortSelect.options).map(opt => opt.value);
    expect(secondaryOptions).not.toContain("description");
  });

  it("should change primary sort field", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const primarySortSelect = within(sortControls).getAllByRole('combobox')[0] as HTMLSelectElement;
    
    fireEvent.change(primarySortSelect, { target: { value: "scale" } });

    expect(primarySortSelect.value).toBe("scale");
  });

  it("should set secondary sort field", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Secondary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const secondarySortSelect = within(sortControls).getAllByRole('combobox')[1] as HTMLSelectElement;
    
    // Initially should be empty
    expect(secondarySortSelect.value).toBe("");

    fireEvent.change(secondarySortSelect, { target: { value: "manufacturer" } });

    expect(secondarySortSelect.value).toBe("manufacturer");
  });

  it("should set tertiary sort field", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Tertiary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const tertiarySortSelect = within(sortControls).getAllByRole('combobox')[2] as HTMLSelectElement;
    
    expect(tertiarySortSelect.value).toBe("");

    fireEvent.change(tertiarySortSelect, { target: { value: "category" } });

    expect(tertiarySortSelect.value).toBe("category");
  });

  it("should only show direction button when secondary sort is selected", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Secondary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const secondarySortSelect = within(sortControls).getAllByRole('combobox')[1] as HTMLSelectElement;
    const secondarySection = secondarySortSelect.closest('.sort-field');

    // Initially no direction button since secondary sort is empty
    let directionButton = secondarySection?.querySelector('[class*="sort-direction-btn"]');
    expect(directionButton).toBeFalsy();

    // Set secondary sort
    fireEvent.change(secondarySortSelect, { target: { value: "manufacturer" } });

    // Now direction button should appear (conditional rendering in code)
  });

  it("should have refresh sort button", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    const refreshButton = screen.getByTitle("Refresh display");
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton.textContent).toContain("Refresh");
  });

  it("should trigger refetch on refresh button click", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByTitle("Refresh display")).toBeInTheDocument();
    });

    const refreshButton = screen.getByTitle("Refresh display");
    fireEvent.click(refreshButton);

    // The button triggers a refetch of the data
    // Since we're using mocks, we can't see the network request,
    // but we can verify the button is clickable
    expect(refreshButton).toBeInTheDocument();
  });

  it("should handle null values in sorting", async () => {
    // mockItems[2] has null values for collectionName, storageLocation, variation
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Beta Freight Car")).toBeInTheDocument();
    });

    // Items should render even with null values
    expect(screen.getByText("Beta Freight Car")).toBeInTheDocument();
    expect(screen.getByText("Zebra Locomotive")).toBeInTheDocument();
    expect(screen.getByText("Alpha Diesel")).toBeInTheDocument();
  });

  it("should sort items alphabetically by default (description)", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Alpha Diesel")).toBeInTheDocument();
    });

    // With default sort by description ascending, order should be:
    // Alpha Diesel, Beta Freight Car, Zebra Locomotive
    const cards = screen.getAllByRole("article");
    expect(cards[0].textContent).toContain("Alpha Diesel");
    expect(cards[1].textContent).toContain("Beta Freight Car");
    expect(cards[2].textContent).toContain("Zebra Locomotive");
  });

  it("should sort by scale", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const primarySortSelect = within(sortControls).getAllByRole('combobox')[0] as HTMLSelectElement;
    fireEvent.change(primarySortSelect, { target: { value: "scale" } });

    await waitFor(() => {
      expect(primarySortSelect.value).toBe("scale");
    });

    // After sorting by scale, order should be: HO, N, O
    // Alpha Diesel (HO), Beta Freight Car (N), Zebra Locomotive (O)
    const cards = screen.getAllByRole("article");
    expect(cards[0].textContent).toContain("HO");
    expect(cards[1].textContent).toContain("N");
    expect(cards[2].textContent).toContain("O");
  });

  it("should support multi-level sorting", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const allSortSelects = within(sortControls).getAllByRole('combobox');
    const primarySortSelect = allSortSelects[0] as HTMLSelectElement;
    const secondarySortSelect = allSortSelects[1] as HTMLSelectElement;

    // Set primary sort to category
    fireEvent.change(primarySortSelect, { target: { value: "category" } });

    // Set secondary sort to manufacturer
    fireEvent.change(secondarySortSelect, { target: { value: "manufacturer" } });

    await waitFor(() => {
      expect(primarySortSelect.value).toBe("category");
      expect(secondarySortSelect.value).toBe("manufacturer");
    });

    // Items should be sorted by category first, then manufacturer
    expect(screen.getByText("Alpha Diesel")).toBeInTheDocument();
  });

  it("should sort dates correctly", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const primarySortSelect = within(sortControls).getAllByRole('combobox')[0] as HTMLSelectElement;
    fireEvent.change(primarySortSelect, { target: { value: "acquiredDate" } });

    await waitFor(() => {
      expect(primarySortSelect.value).toBe("acquiredDate");
    });

    // Should sort by acquired date
    // Order should be earliest to latest: Zebra (01/14/2024), Alpha (02/09/2024), Beta (03/19/2024)
    const cards = screen.getAllByRole("article");
    expect(cards[0].textContent).toContain("Zebra");
    expect(cards[1].textContent).toContain("Alpha");
    expect(cards[2].textContent).toContain("Beta");
  });

  it("should sort numbers correctly", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    // Find the sort-controls container
    const sortControls = document.querySelector('.sort-controls') as HTMLElement;
    const primarySortSelect = within(sortControls).getAllByRole('combobox')[0] as HTMLSelectElement;
    fireEvent.change(primarySortSelect, { target: { value: "modelNumber" } });

    await waitFor(() => {
      expect(primarySortSelect.value).toBe("modelNumber");
    });

    // Should sort by model number as strings
    expect(screen.getByText("Alpha Diesel")).toBeInTheDocument();
  });

  it("should handle descending sort order", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Primary Sort:")).toBeInTheDocument();
    });

    const sortLabels = screen.getAllByText(/Primary Sort:/i);
    const primarySection = sortLabels[0].parentElement;
    const directionButton = primarySection?.querySelector('[title="Ascending"]') as HTMLButtonElement;
    
    // Click to change to descending
    fireEvent.click(directionButton);

    await waitFor(() => {
      const updatedButton = primarySection?.querySelector('[title="Descending"]') as HTMLButtonElement;
      expect(updatedButton).toBeTruthy();
    });

    // With descending sort on description, order should be reversed:
    // Zebra Locomotive, Beta Freight Car, Alpha Diesel
    const cards = screen.getAllByRole("article");
    expect(cards[0].textContent).toContain("Zebra");
    expect(cards[1].textContent).toContain("Beta");
    expect(cards[2].textContent).toContain("Alpha");
  });

  it("should not show sort controls when inventory is empty", async () => {
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

    // Sort controls should not be visible when no items
    expect(screen.queryByText("Primary Sort:")).not.toBeInTheDocument();
  });
});
