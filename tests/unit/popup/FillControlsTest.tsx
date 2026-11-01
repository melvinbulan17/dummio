import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FillControls } from "@/entrypoints/popup/FillControls";

function renderControls(shortcut?: string) {
  const onSetShortcut = vi.fn();
  render(
    <FillControls
      overwrite={false}
      shortcut={shortcut}
      onOverwriteChange={vi.fn()}
      onFill={vi.fn()}
      onSetShortcut={onSetShortcut}
    />,
  );
  return onSetShortcut;
}

describe("FillControls", () => {
  it("shows the shortcut the browser assigned", () => {
    renderControls("Alt+Shift+F");
    expect(screen.getByText("Alt+Shift+F")).toBeInTheDocument();
    expect(screen.queryByText("Set a shortcut")).toBeNull();
  });

  it("offers to set a shortcut when the browser left it blank", () => {
    const onSetShortcut = renderControls("");
    fireEvent.click(screen.getByRole("button", { name: "Set a shortcut" }));
    expect(onSetShortcut).toHaveBeenCalled();
  });

  it("shows neither while the shortcut is still loading", () => {
    renderControls(undefined);
    expect(screen.queryByText("Set a shortcut")).toBeNull();
    expect(screen.queryByText(/Alt/)).toBeNull();
  });
});
