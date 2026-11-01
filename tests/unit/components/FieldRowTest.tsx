import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldRow } from "@/src/components/FieldRow";

describe("FieldRow", () => {
  it("shows a placeholder bar before a fill", () => {
    const { container } = render(
      <FieldRow label="Email" group="contact" index={0} />,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(container.querySelector(".bg-skeleton")).not.toBeNull();
  });

  it("shows the filled value and plays the highlight", () => {
    render(
      <FieldRow
        label="Mobile no."
        group="contact"
        index={2}
        value="09174821093"
        status="filled"
      />,
    );
    const row = screen.getByText("09174821093").closest("li");
    expect(row).toHaveClass("animate-filled");
    expect(row).toHaveStyle({ animationDelay: "60ms" });
  });

  it("says when the form rejected the value", () => {
    render(
      <FieldRow
        label="Birthday"
        group="date"
        index={0}
        value="18/03/1994"
        status="rejected"
      />,
    );
    expect(screen.getByText("Not accepted")).toBeInTheDocument();
    expect(screen.queryByText("18/03/1994")).toBeNull();
  });

  it("says when a field was left alone", () => {
    render(
      <FieldRow label="Notes" group="choice" index={0} status="skipped" />,
    );
    expect(screen.getByText("Left as is")).toBeInTheDocument();
  });
});
