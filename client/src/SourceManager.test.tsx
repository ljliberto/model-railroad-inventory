import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SourceManager from "./SourceManager";

describe("SourceManager", () => {
  it("renders the source management table and insert action", () => {
    render(<MockedProvider><SourceManager /></MockedProvider>);

    expect(screen.getByRole("heading", { name: "Manage Sources" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Insert" })).toBeTruthy();
  });
});
