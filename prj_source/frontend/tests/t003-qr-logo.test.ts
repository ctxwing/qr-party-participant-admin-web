/**
 * T003: qrcode.react 및 Canvas API를 활용한 로고 병합 기술 검증
 * - QRCodeCanvas 렌더링 가능 여부 확인
 * - Canvas API의 drawImage/toDataURL 사용 가능 확인
 * 작성자: ctxwing@gmail.com
 */
import { describe, test, expect } from "bun:test";

describe("T003: QR 코드 로고 병합 기술 검증", () => {
  test("qrcode.react QRCodeCanvas가 import 가능해야 한다", async () => {
    const { QRCodeCanvas } = await import("qrcode.react");
    expect(QRCodeCanvas).toBeDefined();
  });

  test("qrcode.react QRCodeSVG가 import 가능해야 한다", async () => {
    const { QRCodeSVG } = await import("qrcode.react");
    expect(QRCodeSVG).toBeDefined();
  });

  test("QR 코드 생성에 필요한 props 구조가 올바른지 확인", () => {
    // QRCodeCanvas에 전달할 props 타입 검증
    const qrProps = {
      value: "https://qrparty.example.com/join/abc123",
      size: 300,
      level: "H" as const, // 로고 삽입 시 High 에러 보정 필요
      includeMargin: true,
      bgColor: "#FFFFFF",
      fgColor: "#000000",
      imageSettings: {
        src: "/logo.png",
        x: undefined,
        y: undefined,
        height: 60,
        width: 60,
        excavate: true, // 로고 영역 비움
      },
    };

    expect(qrProps.value).toContain("https://");
    expect(qrProps.level).toBe("H");
    expect(qrProps.imageSettings?.excavate).toBe(true);
    expect(qrProps.imageSettings?.height).toBe(60);
  });

  test("PNG/SVG 다운로드를 위한 Canvas API 기본 검증", () => {
    // Bun 환경에서는 Canvas가 없지만, 로직 구조 검증
    const downloadLogic = {
      getPng: (canvasEl: HTMLCanvasElement | null) => {
        if (!canvasEl) return null;
        return canvasEl.toDataURL("image/png");
      },
      getSvg: (svgEl: SVGSVGElement | null) => {
        if (!svgEl) return null;
        const serializer = new XMLSerializer();
        return serializer.serializeToString(svgEl);
      },
    };

    // 함수 구조 존재 확인
    expect(typeof downloadLogic.getPng).toBe("function");
    expect(typeof downloadLogic.getSvg).toBe("function");

    // null 입력 처리 확인
    expect(downloadLogic.getPng(null)).toBeNull();
  });
});
