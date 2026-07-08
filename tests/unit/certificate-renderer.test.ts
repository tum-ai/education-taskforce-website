import { afterEach, describe, expect, it, vi } from "vitest";
import { createCertificatePdfFromContent } from "@/lib/browser/certificate-render";
import { createCertificateContent } from "@/lib/domain/certificate";

function createMockCanvas() {
  const gradient = { addColorStop: vi.fn() };
  const context = {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    clip: vi.fn(),
    closePath: vi.fn(),
    createLinearGradient: vi.fn(() => gradient),
    createRadialGradient: vi.fn(() => gradient),
    drawImage: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: text.length * 9 })),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    rect: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
    fillStyle: "",
    font: "",
    globalAlpha: 1,
    lineWidth: 1,
    shadowBlur: 0,
    shadowColor: "",
    shadowOffsetY: 0,
    strokeStyle: "",
    textAlign: "start",
    textBaseline: "alphabetic",
  };
  const canvas = {
    getContext: vi.fn(() => context),
    height: 0,
    toDataURL: vi.fn(() => `data:image/jpeg;base64,${btoa("\xff\xd8\xff\xd9")}`),
    width: 0,
  };

  return { canvas, context };
}

describe("certificate browser renderer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders certificate PDFs without the taint-prone SVG foreignObject path", async () => {
    const { canvas, context } = createMockCanvas();
    const originalCreateElement = document.createElement.bind(document);
    URL.createObjectURL = vi.fn();
    const createObjectUrlSpy = vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
      throw new Error("The certificate renderer must not use SVG object URLs.");
    });
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return canvas as unknown as HTMLCanvasElement;
      }

      return originalCreateElement(tagName);
    });

    const pdf = await createCertificatePdfFromContent(
      createCertificateContent({ participantName: "Walter" }),
      {
        height: 900,
        width: 1400,
      },
      {
        schlossElmauLogo: {} as CanvasImageSource,
        tumAiLogo: {} as CanvasImageSource,
      },
    );
    const pdfText = new TextDecoder("latin1").decode(pdf);

    expect(createObjectUrlSpy).not.toHaveBeenCalled();
    expect(context.createRadialGradient).not.toHaveBeenCalled();
    expect(context.stroke).toHaveBeenCalledTimes(3);
    expect(context.drawImage).toHaveBeenCalledTimes(2);
    expect(context.fillText).toHaveBeenCalledWith("Walter", expect.any(Number), expect.any(Number));
    const renderedText = context.fillText.mock.calls.map((call) => String(call[0]));
    expect(renderedText.some((text) => text.includes("TUM.ai brings"))).toBe(false);
    expect(renderedText.some((text) => text.includes("Schloss Elmau provides"))).toBe(false);
    expect(canvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.98);
    expect(pdfText).toContain("/Subtype /Image");
    expect(pdfText).toContain("/Filter /DCTDecode");
  });

  it("fits certificate logos without distorting their aspect ratios", async () => {
    const { canvas, context } = createMockCanvas();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      if (tagName === "canvas") {
        return canvas as unknown as HTMLCanvasElement;
      }

      return originalCreateElement(tagName);
    });

    const tumAiLogo = { naturalHeight: 405.94, naturalWidth: 1640.05 } as HTMLImageElement;
    const schlossElmauLogo = { naturalHeight: 500, naturalWidth: 500 } as HTMLImageElement;
    const tumAiContainedHeight = 156 * (tumAiLogo.naturalHeight / tumAiLogo.naturalWidth);

    await createCertificatePdfFromContent(
      createCertificateContent({ participantName: "Walter" }),
      {
        height: 900,
        width: 1400,
      },
      {
        schlossElmauLogo,
        tumAiLogo,
      },
    );

    expect(context.drawImage).toHaveBeenNthCalledWith(
      1,
      schlossElmauLogo,
      76,
      expect.any(Number),
      48,
      48,
    );
    expect(context.drawImage).toHaveBeenNthCalledWith(
      2,
      tumAiLogo,
      709,
      expect.any(Number),
      156,
      expect.closeTo(tumAiContainedHeight, 5),
    );
    expect(context.fillText).toHaveBeenCalledWith("AI Edutainment", 76, expect.any(Number));
    expect(context.fillText).toHaveBeenCalledWith("TUM.ai", 709, expect.any(Number));

    const schlossLogoY = context.drawImage.mock.calls[0][2] as number;
    const tumLogoY = context.drawImage.mock.calls[1][2] as number;
    const courseTitleY = context.fillText.mock.calls.find((call) => call[0] === "AI Edutainment")?.[2] as number;
    const organizerTitleY = context.fillText.mock.calls.find((call) => call[0] === "TUM.ai" && call[1] === 709)?.[2] as number;

    expect(schlossLogoY).toBeLessThan(courseTitleY);
    expect(tumLogoY).toBeLessThan(organizerTitleY);
    expect(Math.abs(tumLogoY - schlossLogoY)).toBeLessThan(6);
  });
});
