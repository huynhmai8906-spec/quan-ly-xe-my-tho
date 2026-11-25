// Hàm dùng chung. Chỉ tạo phần tử bằng createElement và textContent, không chèn HTML lấy từ dữ liệu.
window.SF = (function () {
  const so = (x, d = 1) => x == null ? '–' : Number(x).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
  function el(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c);
    return e;
  }
  const TRANG_THAI = {
    xanh: 'Hoạt động tốt', vang: 'Khai thác thấp', do: 'Cần kiểm tra', chua: 'Chưa có cảm biến'
  };
  // Trụ sở: Số 12 Huỳnh Tịnh Của, phường Mỹ Tho; tọa độ gần đúng
  const TRU_SO = [10.3552, 106.3646];
  // Lưu trên máy người dùng; bọc try vì trình duyệt có thể chặn
  const luu = {
    doc(k, mac) { try { const v = localStorage.getItem('sf.' + k); return v == null ? mac : JSON.parse(v); } catch (e) { return mac; } },
    ghi(k, v) { try { localStorage.setItem('sf.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  // Bản đồ nền tối tông ấm: tile OpenStreetMap lọc màu bằng CSS
  function banDo(id, tam, zoom, opt) {
    const map = L.map(id, Object.assign({ zoomControl: false, scrollWheelZoom: false, attributionControl: true }, opt || {})).setView(tam, zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap', className: 'tile-am' }).addTo(map);
    return map;
  }
  return { so, el, TRANG_THAI, TRU_SO, luu, banDo };
})();
