// Khởi động trang: hỏi máy chủ ai đang đăng nhập; tài khoản quản lý thì tải số liệu, kết luận, lịch xe rồi mới vẽ trang.
// Khách chưa đăng nhập chỉ xem được phần Giới thiệu; các mục quản lý hiện ô đăng nhập.
(async function () {
  window.NGUOI_DUNG = null; window.FLEET = null; window.KET_LUAN = {}; window.DAT_XE = [];
  try {
    const n = await API.toi();
    window.NGUOI_DUNG = n;
    if (n.vai_tro === 'quan-ly') {
      const [d, kl, dx] = await Promise.all([API.duLieu(), API.ketLuan(), API.datXe()]);
      window.FLEET = d; window.KET_LUAN = kl; window.DAT_XE = dx;
    }
  } catch (e) { window.LOI_KET_NOI = e.trangThai === 401 ? null : e.message; }
  for (const src of ['bai-xe.js?v=7', 'web.js?v=23']) {
    await new Promise((ok, loi) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = loi; document.body.append(s); });
  }
})();
