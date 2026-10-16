import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ManufacturerManager from "./ManufacturerManager";

describe("ManufacturerManager", () => {
  it("renders the manufacturer management table and insert action", () => {
    render(<MockedProvider><ManufacturerManager /></MockedProvider>);

    expect(screen.getByRole("heading", { name: "Manage Manufacturers" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Insert" })).toBeTruthy();
  });
});
