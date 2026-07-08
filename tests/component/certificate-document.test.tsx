import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CertificateDocument } from "@/components/portal/CertificateDocument";

describe("CertificateDocument", () => {
  it("renders a downloadable bilingual certificate for the participant", () => {
    render(<CertificateDocument participantName="Walter" />);

    expect(screen.getByLabelText("Certificate for Walter")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "TUM.ai" })).toHaveAttribute(
      "src",
      "/brand-assets/TUM.ai logo dark purple color.svg",
    );
    expect(screen.getByRole("img", { name: "Schloss Elmau" })).toHaveAttribute(
      "src",
      "/brand-assets/Schloss-Elmau-Logo-Black.png",
    );
    expect(screen.getByRole("heading", { name: "Walter" })).toBeInTheDocument();
    expect(screen.getByText(/This certifies that Walter has successfully completed/i)).toBeInTheDocument();
    expect(screen.getByText(/AI tools/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /print certificate/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Every experiment/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Deutsch" }));

    expect(screen.getByText(/KI-Werkzeuge/i)).toBeInTheDocument();
    expect(screen.getByText(/Hiermit wird bestätigt/i)).toBeInTheDocument();
    expect(screen.getByText(/präsentiert/i)).toBeInTheDocument();
    expect(screen.queryByText(/bestaetigt/i)).not.toBeInTheDocument();
  });
});
