import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ParticipantPreview } from "@/components/dev/ParticipantPreview";

describe("ParticipantPreview", () => {
  it("renders the certificate generator with editable fixture participant data", () => {
    render(<ParticipantPreview />);

    expect(screen.getByRole("heading", { name: "Participant preview" })).toBeInTheDocument();
    expect(screen.getByLabelText("Participant name")).toHaveValue("Ada Lovelace");
    expect(screen.getByLabelText("Certificate for Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Participant name"), { target: { value: "Grace Hopper" } });

    expect(screen.getByLabelText("Certificate for Grace Hopper")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Grace Hopper" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Participant overview" }));

    expect(screen.getByRole("heading", { name: "Explore AI" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download certificate" })).toBeInTheDocument();
  });
});
