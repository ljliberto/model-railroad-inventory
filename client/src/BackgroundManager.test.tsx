import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BackgroundManager from "./BackgroundManager";

describe("BackgroundManager", () => {
  it("renders the background image manager", () => {
    render(
      <MockedProvider>
        <BackgroundManager onClose={vi.fn()} />
      </MockedProvider>
    );

    expect(screen.getByRole("heading", { name: "Background Image Manager" })).toBeTruthy();
    expect(screen.getByLabelText("Select Background Image (JPG/PNG)")).toBeTruthy();
  });
});
