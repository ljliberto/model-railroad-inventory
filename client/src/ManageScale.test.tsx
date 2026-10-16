import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ManageScale from "./ManageScale";

describe("ManageScale", () => {
  it("renders the scale management table and insert action", () => {
    render(<MockedProvider><ManageScale /></MockedProvider>);

    expect(screen.getByRole("heading", { name: "Manage Scales" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Scale" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Insert" })).toBeTruthy();
  });
});
