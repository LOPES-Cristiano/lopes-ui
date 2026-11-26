import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OTPInput from "../../components/OTPInput";

describe("OTPInput", () => {
  it("renders accessible group and per-digit labels", () => {
    render(<OTPInput length={4} ariaLabel="Código 2FA" />);

    expect(screen.getByRole("group", { name: "Código 2FA" })).toBeInTheDocument();
    expect(screen.getByLabelText("Dígito 1 de 4")).toBeInTheDocument();
    expect(screen.getByLabelText("Dígito 4 de 4")).toBeInTheDocument();
  });

  it("sets aria-invalid on slots when error is true", () => {
    render(<OTPInput length={4} error />);
    const first = screen.getByLabelText("Dígito 1 de 4");
    expect(first).toHaveAttribute("aria-invalid", "true");
  });

  it("calls onComplete when all digits are pasted", () => {
    const onComplete = vi.fn();
    render(<OTPInput length={4} onComplete={onComplete} />);

    const first = screen.getByLabelText("Dígito 1 de 4");
    fireEvent.paste(first, {
      clipboardData: { getData: () => "1234" },
    });

    expect(onComplete).toHaveBeenCalledWith("1234");
  });
});
