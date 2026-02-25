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
  CREATE_ITEM
} from "./graphql";

// Base mocks for required queries
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
    result: { data: { allSourceNames: ["eBay", "Train Show", "Local Shop"] } },
  },
  {
    request: { query: GET_STORAGE_LOCATION_NAMES },
    result: { data: { allStorageLocationNames: ["Shelf A", "Shelf B", "Basement"] } },
  },
  {
    request: { query: GET_CATEGORY_NAMES },
    result: { data: { allCategoryNames: ["Locomotive", "Freight Car", "Passenger Car"] } },
  },
];

describe("Form Validation Tests", () => {
  it("should require description field", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    const descriptionField = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;
    expect(descriptionField.required).toBe(true);
  });

  it("should require category field", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    });

    const categoryField = screen.getByLabelText(/Category/i) as HTMLSelectElement;
    expect(categoryField.required).toBe(true);
  });

  it("should require scale field", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Scale/i)).toBeInTheDocument();
    });

    const scaleField = screen.getByLabelText(/Scale/i) as HTMLSelectElement;
    expect(scaleField.required).toBe(true);
  });

  it("should require manufacturer field", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Manufacturer/i)).toBeInTheDocument();
    });

    const manufacturerField = screen.getByLabelText(/Manufacturer/i) as HTMLSelectElement;
    expect(manufacturerField.required).toBe(true);
  });

  it("should require condition field", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Condition/i)).toBeInTheDocument();
    });

    const conditionField = screen.getByLabelText(/Condition/i) as HTMLSelectElement;
    expect(conditionField.required).toBe(true);
  });

  it("should accept valid image file types (JPEG, PNG)", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i) as HTMLInputElement;
    expect(fileInput.accept).toBe("image/*");
  });

  it("should validate image file type in handleFileChange", async () => {
    // Mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i) as HTMLInputElement;
    
    // Create a non-image file
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Please select an image file (JPG, PNG, etc.)");
    });

    alertMock.mockRestore();
  });

  it("should validate image file size (max 5MB)", async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i) as HTMLInputElement;
    
    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith("Image size must be less than 5MB");
    });

    alertMock.mockRestore();
  });

  it("should accept number constraints for year fields", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Model First Year/i)).toBeInTheDocument();
    });

    const yearField = screen.getByLabelText(/Model First Year/i) as HTMLInputElement;
    expect(yearField.type).toBe("number");
  });

  it("should accept number constraints for value fields", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Original Value/i)).toBeInTheDocument();
    });

    const originalValueField = screen.getByLabelText(/Original Value/i) as HTMLInputElement;
    expect(originalValueField.type).toBe("number");
    expect(originalValueField.step).toBe("0.01");
    expect(originalValueField.min).toBe("0");

    const estimatedValueField = screen.getByLabelText(/Estimated Value/i) as HTMLInputElement;
    expect(estimatedValueField.type).toBe("number");
    expect(estimatedValueField.step).toBe("0.01");
    expect(estimatedValueField.min).toBe("0");
  });

  it("should handle empty optional fields", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Model Number/i)).toBeInTheDocument();
    });

    const modelNumberField = screen.getByLabelText(/Model Number/i) as HTMLInputElement;
    expect(modelNumberField.required).toBe(false);

    const variationField = screen.getByPlaceholderText(/Open Spoke Wheels, Thin Trim, etc./i) as HTMLInputElement;
    expect(variationField.required).toBe(false);
  });

  it("should handle null values in optional fields", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Collection Name/i)).toBeInTheDocument();
    });

    const collectionField = screen.getByLabelText(/Collection Name/i) as HTMLInputElement;
    expect(collectionField.value).toBe("");
    expect(collectionField.required).toBe(false);
  });

  it("should show validation for acquired date field", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Acquired Date/i)).toBeInTheDocument();
    });

    const dateField = screen.getByLabelText(/Acquired Date/i) as HTMLInputElement;
    expect(dateField.type).toBe("date");
  });

  it("should allow originalBox checkbox to be checked or unchecked", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Original Box/i)).toBeInTheDocument();
    });

    const checkboxField = screen.getByLabelText(/Original Box/i) as HTMLInputElement;
    expect(checkboxField.type).toBe("checkbox");
    expect(checkboxField.checked).toBe(false); // Default unchecked
  });

  it("should populate dropdown options from GraphQL queries", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Manufacturer/i)).toBeInTheDocument();
    });

    const manufacturerSelect = screen.getByLabelText(/Manufacturer/i) as HTMLSelectElement;
    
    await waitFor(() => {
      expect(manufacturerSelect.options.length).toBeGreaterThan(1); // Has options beyond "Select Manufacturer"
    });

    const optionTexts = Array.from(manufacturerSelect.options).map(opt => opt.text);
    expect(optionTexts).toContain("Lionel");
    expect(optionTexts).toContain("MTH");
    expect(optionTexts).toContain("Atlas");
  });

  it("should auto-populate description from image filename", async () => {
    render(
      <MockedProvider mocks={baseMocks}>
        <App />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i)).toBeInTheDocument();
    });

    const fileInput = screen.getByLabelText(/Image \(JPG\/PNG, max 5MB\)/i) as HTMLInputElement;
    const descriptionField = screen.getByLabelText(/Description/i) as HTMLTextAreaElement;

    // Ensure description is empty initially
    expect(descriptionField.value).toBe("");

    // Create a small valid image file with a descriptive name
    const file = new File(['image-data'], 'Lionel 2046 Steam Locomotive.jpg', { type: 'image/jpeg' });
    
    // Use Object.defineProperty to mock FileReader since it's not fully supported in test env
    const mockFileReader = {
      readAsDataURL: vi.fn(function(this: any) {
        this.onloadend?.();
      }),
      result: 'data:image/jpeg;base64,test',
    };
    
    vi.spyOn(window, 'FileReader').mockImplementation(() => mockFileReader as any);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(descriptionField.value).toBe("Lionel 2046 Steam Locomotive");
    });
  });
});
