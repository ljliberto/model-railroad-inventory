import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CategoryManager from "./CategoryManager";

describe("CategoryManager", () => {
  it("renders the category management table and insert action", () => {
    render(<MockedProvider><CategoryManager /></MockedProvider>);

    expect(screen.getByRole("heading", { name: "Manage Categories" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Insert" })).toBeTruthy();
  });
});
