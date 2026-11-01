import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Wordmark } from "@/src/components/Wordmark";

describe("Wordmark", () => {
  it("shows the product name", () => {
    render(<Wordmark />);
    expect(screen.getByText("Dummio")).toBeInTheDocument();
  });
});
