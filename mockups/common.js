// Hàm dùng chung. Chỉ tạo phần tử bằng createElement và textContent, không chèn HTML từ dữ liệu.
window.SF = (function () {
  const so = (x, d = 1) => x == null ? '–' : Number(x).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const c of kids) if (c != null) e.append(c);
    return e;
  }
  const ICON = (loai) => loai.includes('ép rác') ? '🚛' : loai.includes('cẩu') ? '🏗️' : loai.includes('bồn') ? '💧' : loai.includes('hút') ? '🚰' : '🚚';
  // Trụ sở: Số 12 Huỳnh Tịnh Của, phường Mỹ Tho; tọa độ gần đúng
  const TRU_SO = [10.3552, 106.3646];
  return { so, el, ICON, TRU_SO };
})();
