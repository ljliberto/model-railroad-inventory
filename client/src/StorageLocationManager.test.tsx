import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StorageLocationManager from "./StorageLocationManager";

describe("StorageLocationManager", () => {
  it("renders the storage location management table and insert action", () => {
    render(<MockedProvider><StorageLocationManager /></MockedProvider>);

    expect(screen.getByRole("heading", { name: "Manage Storage Locations" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Insert" })).toBeTruthy();
  });
});
