import html2canvas from "html2canvas";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createCertificatePdfFromElement } from "@/lib/browser/certificate-render";
import { createCertificateContent } from "@/lib/domain/certificate";

vi.mock("html2canvas", () => ({
  default: vi.fn(),
}));

function createMockCanvas() {
  return {
    height: 900,
    toDataURL: vi.fn(() => `data:image/jpeg;base64,${btoa("\xff\xd8\xff\xd9")}`),
    width: 1400,
  };
}

describe("certificate browser renderer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("screenshots the online certificate element and embeds that image in the PDF", async () => {
    const canvas = createMockCanvas();
    vi.mocked(html2canvas).mockResolvedValue(canvas as unknown as HTMLCanvasElement);
    const element = document.createElement("article");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      bottom: 900,
      height: 900,
      left: 0,
      right: 1400,
      toJSON: () => ({}),
      top: 0,
      width: 1400,
      x: 0,
      y: 0,
    });

    const pdf = await createCertificatePdfFromElement(element, createCertificateContent({ participantName: "Walter" }));
    const pdfText = new TextDecoder("latin1").decode(pdf);

    expect(html2canvas).toHaveBeenCalledWith(element, {
      backgroundColor: null,
      height: 900,
      logging: false,
      onclone: expect.any(Function),
      scale: 2,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: 1400,
      windowHeight: 768,
      windowWidth: 1024,
    });
    const clonedElement = document.createElement("article");
    const html2canvasOptions = vi.mocked(html2canvas).mock.calls[0]?.[1];
    html2canvasOptions?.onclone?.(document, clonedElement);
    expect(clonedElement).toHaveStyle({
      boxSizing: "border-box",
      height: "900px",
      minHeight: "900px",
      width: "1400px",
    });
    expect(canvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.98);
    expect(pdfText).toContain("/Subtype /Image");
    expect(pdfText).toContain("/Filter /DCTDecode");
  });

  it("rejects hidden certificate elements before attempting a screenshot", async () => {
    const element = document.createElement("article");
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      toJSON: () => ({}),
      top: 0,
      width: 0,
      x: 0,
      y: 0,
    });

    await expect(createCertificatePdfFromElement(element, createCertificateContent({ participantName: "Walter" }))).rejects.toThrow(
      "Certificate preview must be visible before it can be downloaded.",
    );
    expect(html2canvas).not.toHaveBeenCalled();
  });

  it("does not block forever when an image already completed without dimensions", async () => {
    const canvas = createMockCanvas();
    vi.mocked(html2canvas).mockResolvedValue(canvas as unknown as HTMLCanvasElement);
    const element = document.createElement("article");
    const brokenImage = document.createElement("img");
    Object.defineProperties(brokenImage, {
      complete: { value: true },
      naturalWidth: { value: 0 },
    });
    element.append(brokenImage);
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
      bottom: 900,
      height: 900,
      left: 0,
      right: 1400,
      toJSON: () => ({}),
      top: 0,
      width: 1400,
      x: 0,
      y: 0,
    });

    const result = await Promise.race([
      createCertificatePdfFromElement(element, createCertificateContent({ participantName: "Walter" })).then(() => "rendered"),
      new Promise((resolve) => setTimeout(() => resolve("timed out"), 25)),
    ]);

    expect(result).toBe("rendered");
    expect(html2canvas).toHaveBeenCalled();
  });
});
