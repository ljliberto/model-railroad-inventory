import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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

const mockItem = {
  id: "1",
  image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDA==",
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

describe("Image Handling Tests", () => {
  it("should display image preview after file selection", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i) as HTMLInputElement;
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(function(this: any) {
        this.result = 'data:image/jpeg;base64,testdata';
        this.onloadend?.();
      }),
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    const file = new File(['image-data'], 'test-locomotive.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for the preview image to appear
    await waitFor(() => {
      const previewImage = screen.getByAltText("Preview");
      expect(previewImage).toBeInTheDocument();
    });
  });

  it("should convert image to base64 format", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i) as HTMLInputElement;
    
    const mockFileReader = {
      readAsDataURL: vi.fn(function(this: any) {
        this.result = 'data:image/jpeg;base64,testbase64data';
        this.onloadend?.();
      }),
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    const file = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file);
    });
  });

  it("should display uploaded images in inventory cards", async () => {
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

    // Verify image is displayed
    const image = screen.getByAltText(mockItem.description) as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toContain("data:image/jpeg;base64");
  });

  it("should show placeholder when no image is available", async () => {
    const itemWithoutImage = {
      ...mockItem,
      image: "",
    };

    const mocksWithItems = [
      {
        request: { query: GET_ITEMS },
        result: { data: { inventoryItems: [itemWithoutImage] } },
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

    // Should show placeholder
    expect(screen.getByText("No Image")).toBeInTheDocument();
  });

  it("should handle image click to show fullscreen", async () => {
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

    const image = screen.getByAltText(mockItem.description) as HTMLImageElement;
    expect(image).toHaveStyle({ cursor: 'pointer' });

    fireEvent.click(image);

    // Fullscreen modal should appear
    await waitFor(() => {
      const fullscreenImage = screen.getByAltText("Full size");
      expect(fullscreenImage).toBeInTheDocument();
    });
  });

  it("should close fullscreen image on click", async () => {
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

    const image = screen.getByAltText(mockItem.description);
    fireEvent.click(image);

    await waitFor(() => {
      expect(screen.getByAltText("Full size")).toBeInTheDocument();
    });

    // Find and click the close button
    const closeButton = screen.getByTitle("Close");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByAltText("Full size")).not.toBeInTheDocument();
    });
  });

  it("should support zoom controls in fullscreen view", async () => {
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

    const image = screen.getByAltText(mockItem.description);
    fireEvent.click(image);

    await waitFor(() => {
      expect(screen.getByAltText("Full size")).toBeInTheDocument();
    });

    // Should have zoom in and zoom out buttons
    const zoomInButton = screen.getByTitle("Zoom In");
    const zoomOutButton = screen.getByTitle("Zoom Out");
    const resetButton = screen.getByTitle("Reset Zoom");

    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
    expect(resetButton).toBeInTheDocument();
  });

  it("should handle zoom in action", async () => {
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

    const image = screen.getByAltText(mockItem.description);
    fireEvent.click(image);

    await waitFor(() => {
      expect(screen.getByAltText("Full size")).toBeInTheDocument();
    });

    const zoomInButton = screen.getByTitle("Zoom In");
    const resetButton = screen.getByTitle("Reset Zoom");
    
    // Initial zoom should be 100%
    expect(resetButton.textContent).toBe("100%");

    fireEvent.click(zoomInButton);

    // Zoom should increase by 25%
    await waitFor(() => {
      expect(resetButton.textContent).toBe("125%");
    });
  });

  it("should handle zoom out action", async () => {
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

    const image = screen.getByAltText(mockItem.description);
    fireEvent.click(image);

    await waitFor(() => {
      expect(screen.getByAltText("Full size")).toBeInTheDocument();
    });

    const zoomOutButton = screen.getByTitle("Zoom Out");
    const resetButton = screen.getByTitle("Reset Zoom");

    fireEvent.click(zoomOutButton);

    // Zoom should decrease by 25%
    await waitFor(() => {
      expect(resetButton.textContent).toBe("75%");
    });
  });

  it("should reset zoom to 100%", async () => {
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

    const image = screen.getByAltText(mockItem.description);
    fireEvent.click(image);

    await waitFor(() => {
      expect(screen.getByAltText("Full size")).toBeInTheDocument();
    });

    const zoomInButton = screen.getByTitle("Zoom In");
    const resetButton = screen.getByTitle("Reset Zoom");

    // Zoom in several times
    fireEvent.click(zoomInButton);
    fireEvent.click(zoomInButton);

    await waitFor(() => {
      expect(resetButton.textContent).not.toBe("100%");
    });

    // Reset zoom
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(resetButton.textContent).toBe("100%");
    });
  });

  it("should limit zoom to maximum of 500%", async () => {
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

    const image = screen.getByAltText(mockItem.description);
    fireEvent.click(image);

    await waitFor(() => {
      expect(screen.getByAltText("Full size")).toBeInTheDocument();
    });

    const zoomInButton = screen.getByTitle("Zoom In");
    const resetButton = screen.getByTitle("Reset Zoom");

    // Click zoom in many times
    for (let i = 0; i < 20; i++) {
      fireEvent.click(zoomInButton);
    }

    // Should not exceed 500%
    await waitFor(() => {
      const zoomText = resetButton.textContent || "";
      const zoomValue = parseInt(zoomText);
      expect(zoomValue).toBeLessThanOrEqual(500);
    });
  });

  it("should limit zoom to minimum of 50%", async () => {
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

    const image = screen.getByAltText(mockItem.description);
    fireEvent.click(image);

    await waitFor(() => {
      expect(screen.getByAltText("Full size")).toBeInTheDocument();
    });

    const zoomOutButton = screen.getByTitle("Zoom Out");
    const resetButton = screen.getByTitle("Reset Zoom");

    // Click zoom out many times
    for (let i = 0; i < 10; i++) {
      fireEvent.click(zoomOutButton);
    }

    // Should not go below 50%
    await waitFor(() => {
      const zoomText = resetButton.textContent || "";
      const zoomValue = parseInt(zoomText);
      expect(zoomValue).toBeGreaterThanOrEqual(50);
    });
  });

  it("should handle image error gracefully", async () => {
    const itemWithBrokenImage = {
      ...mockItem,
      image: "invalid-image-data",
    };

    const mocksWithItems = [
      {
        request: { query: GET_ITEMS },
        result: { data: { inventoryItems: [itemWithBrokenImage] } },
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

    const image = screen.getByAltText(mockItem.description) as HTMLImageElement;
    
    // Trigger error handler
    fireEvent.error(image);

    // Image should be hidden on error (display: none)
    expect(image).toHaveStyle({ display: 'none' });
  });

  it("should preserve image preview when editing item", async () => {
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

    // Image preview should be populated
    const previewImage = screen.getByAltText("Preview") as HTMLImageElement;
    expect(previewImage).toBeInTheDocument();
    expect(previewImage.src).toBe(mockItem.image);
  });

  it("should clear image preview on form clear", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Add New Item")).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i) as HTMLInputElement;
    
    const mockFileReader = {
      readAsDataURL: vi.fn(function(this: any) {
        this.result = 'data:image/jpeg;base64,testdata';
        this.onloadend?.();
      }),
    };
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    const file = new File(['image-data'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByAltText("Preview")).toBeInTheDocument();
    });

    // Click Clear button
    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);

    // Image preview should be removed
    await waitFor(() => {
      expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
    });
  });

  it("should clear image preview on cancel edit", async () => {
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

    // Image preview should be present
    expect(screen.getByAltText("Preview")).toBeInTheDocument();

    // Click Cancel
    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    // Should return to Add mode without preview
    await waitFor(() => {
      expect(screen.getByText("Add New Item")).toBeInTheDocument();
      expect(screen.queryByAltText("Preview")).not.toBeInTheDocument();
    });
  });
});
