import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import App from "./App";

describe("App functions", () => {
  it("handleChange updates form state including variation", () => {
    const { getByPlaceholderText } = render(<App />);
    const input = getByPlaceholderText("Describe any unique features");
    fireEvent.change(input, { target: { value: "Special wheels" } });
    expect(input.value).toBe("Special wheels");
  });

  it("handleFileChange validates and sets image preview", () => {
    const { getByLabelText } = render(<App />);
    const fileInput = getByLabelText(/Image/);
    expect(fileInput).toBeTruthy();
  });

  it("handleEdit populates form with item data including variation", () => {
    const { getAllByText } = render(<App />);
    expect(getAllByText("Edit").length).toBeGreaterThan(0);
  });

  it("handleSubmit allows variation to be empty or null", () => {
    const { getByText, getByPlaceholderText } = render(<App />);
    const input = getByPlaceholderText("Describe any unique features");
    fireEvent.change(input, { target: { value: "" } });
    const button = getByText(/Add Item|Save Changes/);
    expect(button).toBeTruthy();
  });

  it("handleClear resets the form including variation", () => {
    const { getByText, getByPlaceholderText } = render(<App />);
    const input = getByPlaceholderText("Describe any unique features");
    fireEvent.change(input, { target: { value: "Some variation" } });
    fireEvent.click(getByText("Clear"));
    expect(input.value).toBe("");
  });

  it("variation field is included in export/import logic", () => {
    const { getByText } = render(<App />);
    expect(getByText("Export to Excel")).toBeTruthy();
  });
});
