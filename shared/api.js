// Gọi backend. Cookie phiên là HttpOnly nên JavaScript không đọc được; mọi yêu cầu ghi kèm header X-SF để máy chủ chặn CSRF.
window.API = (function () {
  async function goi(duong, phuong = 'GET', than) {
    let r;
    try {
      r = await fetch('/api/' + duong, { method: phuong, credentials: 'same-origin', cache: 'no-store',
        headers: Object.assign({ 'X-SF': '1' }, than ? { 'Content-Type': 'application/json' } : {}), body: than ? JSON.stringify(than) : undefined });
    } catch (e) { const l = new Error('Không kết nối được máy chủ. Kiểm tra mạng hoặc liên hệ người quản trị.'); l.trangThai = 0; throw l; }
    let d = null; try { d = await r.json(); } catch (e) { /* trang tĩnh (GitHub Pages, máy chủ tĩnh) trả về HTML, không phải JSON */ }
    if (!d) { const l = new Error(API.thongBaoKhongMayChu()); l.trangThai = r.status; l.khongMayChu = true; throw l; }
    if (!r.ok) {
      const ct = Array.isArray(d.detail) ? 'Dữ liệu nhập chưa hợp lệ.' : (d.detail || d.loi || 'Máy chủ báo lỗi, thử lại sau.');
      const l = new Error(ct); l.trangThai = r.status; throw l;
    }
    return d;
  }
  return {
    // Trang đang mở ở nơi không có backend: nói rõ nơi đăng nhập được
    thongBaoKhongMayChu: () => location.hostname.endsWith('github.io')
      ? 'Bản trên GitHub Pages chỉ là trang tĩnh, không có máy chủ nên không đăng nhập được. Phần quản lý chạy trên máy chủ Quản lý xe của Công ty.'
      : `Địa chỉ ${location.host || 'này'} không có máy chủ Quản lý xe. Chạy máy chủ (cấu hình quan-ly-xe-api) rồi mở http://localhost:8770 để đăng nhập.`,
    toi: () => goi('toi'),
    dangNhap: (ten, mat_khau) => goi('dang-nhap', 'POST', { ten, mat_khau }),
    dangXuat: () => goi('dang-xuat', 'POST'),
    duLieu: () => goi('du-lieu'),
    ketLuan: () => goi('ket-luan'),
    luuKetLuan: (ma, k) => goi('ket-luan/' + encodeURIComponent(ma), 'PUT', k),
    datXe: () => goi('dat-xe'),
    themDatXe: (d) => goi('dat-xe', 'POST', d),
    baoSuCo: (s) => goi('su-co', 'POST', s)
  };
})();
