import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CertificateDocument } from "@/components/portal/CertificateDocument";

describe("CertificateDocument", () => {
  it("renders a downloadable bilingual certificate for the participant", () => {
    render(<CertificateDocument participantName="Walter" />);

    expect(screen.getByLabelText("Certificate for Walter")).toBeInTheDocument();
    const tumAiLogo = screen.getByRole("img", { name: "TUM.ai" });
    const schlossElmauLogo = screen.getByRole("img", { name: "Schloss Elmau" });
    expect(tumAiLogo).toHaveAttribute("src", "/brand-assets/TUM.ai-logo-dark-purple.png");
    expect(tumAiLogo).toHaveAttribute("width", "156");
    expect(tumAiLogo).toHaveAttribute("height", "39");
    expect(schlossElmauLogo).toHaveAttribute("src", "/brand-assets/Schloss-Elmau-Logo-Black.png");
    expect(schlossElmauLogo).toHaveAttribute("width", "48");
    expect(schlossElmauLogo).toHaveAttribute("height", "48");
    const courseColumn = screen.getByText("AI Edutainment").closest("div");
    const organizerColumn = screen.getByText("Student Initiative at Technical University of Munich").closest("div");
    expect(courseColumn).not.toBeNull();
    expect(organizerColumn).not.toBeNull();
    expect(within(courseColumn as HTMLElement).getByRole("img", { name: "Schloss Elmau" })).toBeInTheDocument();
    expect(within(organizerColumn as HTMLElement).getByRole("img", { name: "TUM.ai" })).toBeInTheDocument();
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
