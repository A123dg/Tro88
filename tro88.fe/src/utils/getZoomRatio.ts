/**
 * Tính toán zoom ratio cho toàn app.
 *
 * Gồm 2 yếu tố:
 * 1. Screen width zoom: màn desktop lớn (>= 1400px physical) → thu nhỏ theo 1920px baseline
 * 2. OS scale compensation: Windows scale 125/150% → bù lại một phần để tránh scroll
 *
 * Lưu ý: chỉ bù 60% mức scale (partial compensation) để UI không quá nhỏ so với gốc.
 * Ví dụ: Windows 125% (ratio=1.25) → bù 60% → zoom *= (1/1.25)^0.6 ≈ 0.882
 */
export const getZoomRatio = (): number => {
  const screenWidth = window.screen.width;
  const dpr = window.devicePixelRatio || 1;

  // Physical screen width (trước khi bị OS scale)
  const physicalWidth = screenWidth * dpr;

  // --- Bước 1: Zoom theo chiều rộng màn hình ---
  // Chỉ áp dụng trên desktop có physical width >= 1400 * 1.1 = 1540px
  let zoom = 1;
  if (physicalWidth >= 1540 && physicalWidth < 2560) {
    zoom = physicalWidth / 1920;
  }

  // --- Bước 2: Partial OS scale compensation ---
  if (dpr > 1.1) {
    const partialCompensation = Math.pow(1 / dpr, 0.6);
    zoom *= partialCompensation;
  }

  // Clamp: không nhỏ hơn 0.75 và không lớn hơn 1.1
  return Math.min(Math.max(zoom, 0.75), 1.1);
};
