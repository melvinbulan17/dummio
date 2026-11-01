import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "@/src/components/Toggle";

describe("Toggle", () => {
  it("is a labelled switch that reports the flipped value", () => {
    const onChange = vi.fn();
    render(
      <>
        <span id="label">Overwrite filled fields</span>
        <Toggle checked={false} labelledBy="label" onChange={onChange} />
      </>,
    );
    const toggle = screen.getByRole("switch", {
      name: "Overwrite filled fields",
    });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
