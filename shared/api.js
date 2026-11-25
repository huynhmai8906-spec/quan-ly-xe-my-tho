// Gọi backend. Cookie phiên là HttpOnly nên JavaScript không đọc được; mọi yêu cầu ghi kèm header X-SF để máy chủ chặn CSRF.
window.API = (function () {
  async function goi(duong, phuong = 'GET', than) {
    let r;
    try {
      r = await fetch('/api/' + duong, { method: phuong, credentials: 'same-origin', cache: 'no-store',
        headers: Object.assign({ 'X-SF': '1' }, than ? { 'Content-Type': 'application/json' } : {}), body: than ? JSON.stringify(than) : undefined });
    } catch (e) { const l = new Error('Không kết nối được máy chủ. Kiểm tra mạng hoặc liên hệ người quản trị.'); l.trangThai = 0; throw l; }
    let d = null; try { d = await r.json(); } catch (e) { /* trang tĩnh không có API trả về HTML */ }
    if (!r.ok || !d) {
      const l = new Error((d && (d.detail || d.loi)) || (r.status === 404 ? 'Trang này chưa nối với máy chủ Quản lý xe.' : 'Máy chủ báo lỗi, thử lại sau.'));
      l.trangThai = r.status; throw l;
    }
    return d;
  }
  return {
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
