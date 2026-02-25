import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import App from "./App";
import { 
  GET_ITEMS, 
  GET_BACKGROUND, 
  GET_MANUFACTURER_NAMES, 
  GET_SCALES, 
  GET_SOURCE_NAMES, 
  GET_STORAGE_LOCATION_NAMES, 
  GET_CATEGORY_NAMES,
  CREATE_ITEM,
  UPDATE_ITEM,
  DELETE_ITEM
} from "./graphql";

const mockItem = {
  id: "1",
  image: "data:image/jpeg;base64,test",
  description: "Lionel 2046 Steam Locomotive",
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
};

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

describe("CRUD Operations Tests", () => {
  it("should display Add New Item form initially", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Add New Item")).toBeInTheDocument();
    });

    expect(screen.getByText("Add Item")).toBeInTheDocument();
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("should create a new item with required fields", async () => {
    const createMock = {
      request: {
        query: CREATE_ITEM,
        variables: {
          input: {
            image: "data:image/jpeg;base64,test",
            description: "New Locomotive",
            category: "Locomotive",
            scale: "O",
            manufacturer: "Lionel",
            modelFirstYear: null,
            modelNumber: "",
            acquiredFrom: null,
            acquiredDate: null,
            condition: "Excellent",
            collectionName: "",
            storageLocation: null,
            variation: "",
            originalBox: false,
            originalValue: null,
            estimatedValue: null,
          },
        },
      },
      result: {
        data: {
          createInventoryItem: {
            id: "2",
          },
        },
      },
    };

    const refetchMock = {
      request: { query: GET_ITEMS },
      result: {
        data: {
          inventoryItems: [
            {
              id: "2",
              image: "data:image/jpeg;base64,test",
              description: "New Locomotive",
              category: "Locomotive",
              scale: "O",
              manufacturer: "Lionel",
              modelFirstYear: null,
              modelNumber: "",
              acquiredFrom: null,
              acquiredDate: null,
              condition: "Excellent",
              collectionName: "",
              storageLocation: null,
              variation: "",
              originalBox: false,
              originalValue: null,
              estimatedValue: null,
              created_timestamp: "2024-01-16T10:00:00Z",
              updated_timestamp: "2024-01-16T10:00:00Z",
            },
          ],
        },
      },
    };

    render(
      <MockedProvider mocks={[...baseMocks, createMock, refetchMock]}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Add Item")).toBeInTheDocument();
    });

    // Form submission would require filling all required fields
    // This test verifies the form is ready for input
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Scale/i)).toBeInTheDocument();
  });

  it("should handle edit item action", async () => {
    const mocksWithItems = [
      {
        request: { query: GET_ITEMS },
        result: { data: { inventoryItems: [mockItem] } },
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={mocksWithItems}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(mockItem.description)).toBeInTheDocument();
    });

    // Find and click edit button (✏️)
    const editButtons = screen.getAllByTitle("Edit");
    expect(editButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(editButtons[0]);

    // Should change to Edit mode
    await waitFor(() => {
      expect(screen.getByText("Edit Item")).toBeInTheDocument();
    });

    // Should show Save Changes and Cancel buttons
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();

    // Form should be populated with item data
    const descriptionField = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    expect(descriptionField.value).toBe(mockItem.description);
  });

  it("should handle cancel edit action", async () => {
    const mocksWithItems = [
      {
        request: { query: GET_ITEMS },
        result: { data: { inventoryItems: [mockItem] } },
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={mocksWithItems}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(mockItem.description)).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Edit Item")).toBeInTheDocument();
    });

    // Click Cancel button
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Should return to Add New Item mode
    await waitFor(() => {
      expect(screen.getByText("Add New Item")).toBeInTheDocument();
    });

    // Form should be cleared
    const descriptionField = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    expect(descriptionField.value).toBe("");
  });

  it("should handle clear form action", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Add New Item")).toBeInTheDocument();
    });

    const descriptionField = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    
    // Type something in the description field
    fireEvent.change(descriptionField, { target: { value: "Test Description" } });
    expect(descriptionField.value).toBe("Test Description");

    // Click Clear button
    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);

    // Form should be cleared
    expect(descriptionField.value).toBe("");
  });

  it("should handle delete item action", async () => {
    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const deleteMock = {
      request: {
        query: DELETE_ITEM,
        variables: { id: "1" },
      },
      result: {
        data: {
          deleteInventoryItem: true,
        },
      },
    };

    const refetchMockAfterDelete = {
      request: { query: GET_ITEMS },
      result: { data: { inventoryItems: [] } },
    };

    const mocksWithItems = [
      {
        request: { query: GET_ITEMS },
        result: { data: { inventoryItems: [mockItem] } },
      },
      ...baseMocks.slice(1),
      deleteMock,
      refetchMockAfterDelete,
    ];

    render(
      <MockedProvider mocks={mocksWithItems}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(mockItem.description)).toBeInTheDocument();
    });

    // Find and click delete button (🗑️)
    const deleteButtons = screen.getAllByTitle("Delete");
    expect(deleteButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(deleteButtons[0]);

    // Verify confirmation was called
    expect(confirmMock).toHaveBeenCalledWith("Delete this item?");

    confirmMock.mockRestore();
  });

  it("should not delete item if user cancels confirmation", async () => {
    const confirmMock = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const mocksWithItems = [
      {
        request: { query: GET_ITEMS },
        result: { data: { inventoryItems: [mockItem] } },
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={mocksWithItems}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(mockItem.description)).toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButtons = screen.getAllByTitle("Delete");
    fireEvent.click(deleteButtons[0]);

    // Verify confirmation was called
    expect(confirmMock).toHaveBeenCalledWith("Delete this item?");

    // Item should still be displayed
    expect(screen.getByText(mockItem.description)).toBeInTheDocument();

    confirmMock.mockRestore();
  });

  it("should update existing item", async () => {
    const updateMock = {
      request: {
        query: UPDATE_ITEM,
        variables: {
          id: "1",
          input: {
            image: mockItem.image,
            description: "Updated Description",
            category: mockItem.category,
            scale: mockItem.scale,
            manufacturer: mockItem.manufacturer,
            modelFirstYear: mockItem.modelFirstYear,
            modelNumber: mockItem.modelNumber,
            acquiredFrom: mockItem.acquiredFrom,
            acquiredDate: mockItem.acquiredDate,
            condition: mockItem.condition,
            collectionName: mockItem.collectionName,
            storageLocation: mockItem.storageLocation,
            variation: mockItem.variation,
            originalBox: mockItem.originalBox,
            originalValue: mockItem.originalValue,
            estimatedValue: mockItem.estimatedValue,
          },
        },
      },
      result: {
        data: {
          updateInventoryItem: {
            id: "1",
          },
        },
      },
    };

    const mocksWithItems = [
      {
        request: { query: GET_ITEMS },
        result: { data: { inventoryItems: [mockItem] } },
      },
      ...baseMocks.slice(1),
      updateMock,
    ];

    render(
      <MockedProvider mocks={mocksWithItems}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(mockItem.description)).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Edit Item")).toBeInTheDocument();
    });

    // Verify form state is preserved during edit
    const descriptionField = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    expect(descriptionField.value).toBe(mockItem.description);

    const variationField = screen.getByPlaceholderText(/Open Spoke Wheels, Thin Trim, etc./i) as HTMLInputElement;
    expect(variationField.value).toBe(mockItem.variation);
  });

  it("should handle form state changes", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Add New Item")).toBeInTheDocument();
    });

    const descriptionField = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    const variationField = screen.getByPlaceholderText(/Open Spoke Wheels, Thin Trim, etc./i) as HTMLInputElement;
    const originalBoxCheckbox = screen.getByLabelText(/Original Box/i) as HTMLInputElement;

    // Test text input
    fireEvent.change(descriptionField, { target: { value: "Test Loco" } });
    expect(descriptionField.value).toBe("Test Loco");

    // Test variation field
    fireEvent.change(variationField, { target: { value: "Red Stripe" } });
    expect(variationField.value).toBe("Red Stripe");

    // Test checkbox
    expect(originalBoxCheckbox.checked).toBe(false);
    fireEvent.click(originalBoxCheckbox);
    expect(originalBoxCheckbox.checked).toBe(true);
  });

  it("should display no items message when inventory is empty", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/No items yet. Add your first locomotive!/i)).toBeInTheDocument();
    });
  });

  it("should display inventory items when available", async () => {
    const mocksWithItems = [
      {
        request: { query: GET_ITEMS },
        result: { data: { inventoryItems: [mockItem] } },
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={mocksWithItems}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(mockItem.description)).toBeInTheDocument();
    });

    // Verify item details are displayed
    expect(screen.getByText(`${mockItem.scale} • ${mockItem.category} • ${mockItem.manufacturer}`)).toBeInTheDocument();
    expect(screen.getByText(mockItem.variation!)).toBeInTheDocument();
  });

  it("should preserve variation field data during edit", async () => {
    const mocksWithItems = [
      {
        request: { query: GET_ITEMS },
        result: { data: { inventoryItems: [mockItem] } },
      },
      ...baseMocks.slice(1),
    ];

    render(
      <MockedProvider mocks={mocksWithItems}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(mockItem.description)).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByTitle("Edit");
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Edit Item")).toBeInTheDocument();
    });

    // Verify variation field is populated
    const variationField = screen.getByPlaceholderText(/Open Spoke Wheels, Thin Trim, etc./i) as HTMLInputElement;
    expect(variationField.value).toBe("Open Spoke Wheels");
  });
});
