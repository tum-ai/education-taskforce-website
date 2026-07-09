import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CertificateCard } from "@/components/portal/CertificateCard";

describe("CertificateCard", () => {
  it("links participants to their certificate without generator wording", () => {
    render(<CertificateCard locale="en" />);

    expect(screen.getByRole("link", { name: /your certificate/i })).toHaveAttribute("href", "/portal/certificate");
    expect(screen.getByText("Course certificate")).toBeInTheDocument();
    expect(screen.getByText("Download certificate")).toBeInTheDocument();
    expect(screen.queryByText(/English certificate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/generate/i)).not.toBeInTheDocument();
  });

  it("uses personal German copy without language-specific labels", () => {
    render(<CertificateCard locale="de" />);

    expect(screen.getByRole("link", { name: /dein zertifikat/i })).toHaveAttribute("href", "/portal/certificate");
    expect(screen.getByText("Kurszertifikat")).toBeInTheDocument();
    expect(screen.getByText("Zertifikat herunterladen")).toBeInTheDocument();
    expect(screen.queryByText(/Englisches Zertifikat/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/gener/i)).not.toBeInTheDocument();
  });
});
