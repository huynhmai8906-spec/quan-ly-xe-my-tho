(function () {
  const { so, el, TRU_SO, luu, banDo } = window.SF;
  // ---------- Đăng nhập: máy chủ kiểm tra tài khoản và PIN đã băm, khóa tài khoản sau 5 lần sai
  const loi = document.getElementById('loi-pin'), form = document.getElementById('dang-nhap');
  const vao = async () => {
    const d = await API.duLieu();
    if (!d.xe || !d.xe.length) throw new Error('Tài khoản chưa được giao xe. Liên hệ người phụ trách đội.');
    document.getElementById('man-pin').hidden = true; document.getElementById('ung-dung').hidden = false;
    batDau(d);
  };
  const kiemTra = async (n) => {
    if (n.vai_tro !== 'tai-xe') { await API.dangXuat(); throw new Error('App này dành cho tài khoản tài xế. Tài khoản quản lý dùng trang web.'); }
    await vao();
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); const nut = form.querySelector('button'); nut.disabled = true; loi.textContent = '';
    try { await kiemTra(await API.dangNhap(form.elements.username.value, form.elements.password.value)); }
    catch (l) { loi.textContent = l.message; form.elements.password.value = ''; form.elements.password.focus(); }
    finally { nut.disabled = false; }
  });
  // Tài khoản xem thử hiện sẵn trên màn hình đăng nhập
  document.getElementById('xt-ten').textContent = API.XEM_THU.app.ten; document.getElementById('xt-mk').textContent = API.XEM_THU.app.mat_khau;
  document.getElementById('dien-thu').addEventListener('click', () => { form.elements.username.value = API.XEM_THU.app.ten; form.elements.password.value = API.XEM_THU.app.mat_khau; form.querySelector('button[type=submit]').focus(); });
  document.getElementById('thoat').addEventListener('click', async () => { try { await API.dangXuat(); } finally { location.reload(); } });
  (async () => { try { await kiemTra(await API.toi()); } catch (l) { if (l.trangThai !== 401) loi.textContent = l.message; } })();

  function batDau(F) {
  const XE = F.xe[0];
  const HO_TRO = F.ho_tro[XE.loai];

  document.getElementById('xe-dang-lai').textContent = `Xe ${XE.bien_so}`;
  const nd = document.getElementById('noi-dung');
  const homNay = new Date().toISOString().slice(0, 10);

  // ---------- Tuyến hôm nay
  function tuyen() {
    const xong = luu.doc('chuyen.' + homNay, []);
    const tbChuyen = Math.round(XE.chuyen_t7 / XE.ngay_hd);
    const ds = el('div', {});
    const ve = () => ds.replaceChildren(...Array.from({ length: tbChuyen }, (_, i) => {
      const da = xong.includes(i + 1);
      return el('div', { class: 'chuyen' + (da ? ' xong' : '') },
        el('div', {}, el('b', { text: `Chuyến ${i + 1}` }), el('small', { text: da ? 'Đã hoàn thành' : 'Thu gom, ép rác, đổ tại bãi' })),
        el('button', { class: da ? 'nut' : 'nut dac', type: 'button', 'aria-pressed': String(da), onclick: () => {
          const k = xong.indexOf(i + 1); k >= 0 ? xong.splice(k, 1) : xong.push(i + 1); luu.ghi('chuyen.' + homNay, xong); ve(); } }, da ? 'Đã xong' : `Hoàn thành chuyến ${i + 1}`));
    }));
    ve();
    nd.replaceChildren(
      el('div', { class: 'ban-do-app' }, el('div', { id: 'ban-do-app' }), el('div', { class: 'ten-man' }, el('h1', { text: 'Tuyến hôm nay' }))),
      el('section', { class: 'vung' }, el('h2', { text: XE.ten }), el('p', { class: 'dan', text: `Tháng 7/2026 xe chạy ${XE.chuyen_t7} chuyến trong ${XE.ngay_hd} ngày, bình quân ${tbChuyen} chuyến mỗi ngày.` }),
        ds, el('div', { class: 'trong' }, el('b', { text: 'Chưa có danh sách điểm thu gom. ' }), 'Khi Phòng Kế hoạch Kinh doanh lập tuyến, các điểm sẽ hiện theo thứ tự chạy và bản đồ chỉ đường đến từng điểm.')));
    const map = banDo('ban-do-app', [TRU_SO[0] + 0.004, TRU_SO[1] - 0.004], 14, { dragging: true });
    L.marker([TRU_SO[0] + 0.005, TRU_SO[1] - 0.012], { icon: L.divIcon({ html: el('div', { class: 'dau-xe', text: 'XE' }), className: '', iconSize: [46, 46], iconAnchor: [23, 23] }) })
      .addTo(map).bindTooltip('Vị trí mô phỏng');
    L.marker(TRU_SO, { icon: L.divIcon({ html: el('div', { class: 'dau-xe', text: 'TS' }), className: '', iconSize: [46, 46], iconAnchor: [23, 23] }) }).addTo(map).bindTooltip('Trụ sở, nơi cấp dầu');
  }

  // ---------- Tiêu hao của chính xe
  function hieuQua() {
    const tb = XE.chi_so_tuan.reduce((a, c) => a + c, 0) / XE.chi_so_tuan.length;
    const tien = HO_TRO[1] === 'chuyến' ? XE.chuyen_t7 * HO_TRO[0] : XE.ngay_hd * HO_TRO[0];
    nd.replaceChildren(el('section', { class: 'vung' },
      el('h2', { text: 'Tiêu hao của xe' }), el('p', { class: 'dan', text: 'Chỉ số 1,00 là đúng mức thường ngày của chính xe này. Không xếp hạng giữa các tài xế.' }),
      el('div', { class: 'lon' },
        el('div', {}, el('b', { class: 'so', text: so(tb, 2) }), el('span', { text: 'Chỉ số tháng 7' })),
        el('div', {}, el('b', { class: 'so', text: so(tien / 1e6, 2) }), el('span', { text: 'Triệu đồng hỗ trợ' }))),
      ...XE.chi_so_tuan.map((c, i) => el('div', { class: 'tuan' }, el('span', { text: `Tuần ${i + 1}` }),
        el('div', { class: 'vach-o', role: 'img', 'aria-label': `Chỉ số ${so(c, 2)}` }, el('i', { class: c > F.nguong_tuan ? 'cao' : '', style: `width:${Math.min(100, c / 1.5 * 100)}%` })),
        el('b', { class: 'so', text: so(c, 2) }))),
      el('p', { class: 'ghi', text: `Vạch xanh là mức 1,00. Hỗ trợ tính theo Biên bản họp ngày 25/8/2025: ${so(HO_TRO[0], 0)} đồng mỗi ${HO_TRO[1]}, ${XE.chuyen_t7} chuyến trong tháng 7/2026. Chỉ bạn và người phụ trách đội xem được trang này.` })));
  }

  // ---------- Báo sự cố
  function suCo() {
    let loai = '', anh = null;
    const LOAI = ['Xe hỏng', 'Tắc đường', 'Lỗi cảm biến, thiết bị', 'Điểm tập kết ùn ứ'];
    const nut = el('div', { class: 'loai-su-co', role: 'group', 'aria-label': 'Loại sự cố' }, ...LOAI.map(l => el('button', { type: 'button', 'aria-pressed': 'false',
      onclick: (e) => { loai = l; nut.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === e.currentTarget))); } }, l)));
    const ghi = el('textarea', { maxlength: '300', placeholder: 'Ví dụ: kẹt xe đường Lý Thường Kiệt, trễ chuyến 2 khoảng 30 phút' });
    const xem = el('img', { alt: 'Ảnh vừa chụp', hidden: true });
    const chon = el('input', { type: 'file', accept: 'image/*', capture: 'environment', id: 'anh-su-co', onchange: (e) => {
      const f = e.target.files[0]; if (!f) return;
      if (!/^image\//.test(f.type) || f.size > 8e6) { tb.textContent = 'Chỉ nhận ảnh dưới 8 MB.'; tb.style.color = 'var(--do)'; return; }
      anh = f.name; xem.src = URL.createObjectURL(f); xem.hidden = false; } });
    const tb = el('p', { class: 'da-gui', 'aria-live': 'polite' });
    nd.replaceChildren(el('section', { class: 'vung' },
      el('h2', { text: 'Báo sự cố' }), el('p', { class: 'dan', text: 'Chọn loại sự cố, chụp ảnh nếu có, rồi gửi về Phòng Kế hoạch Kinh doanh.' }),
      nut, el('label', { class: 'truong' }, 'Ghi chú', ghi),
      el('div', { class: 'chup' }, chon, el('label', { class: 'nut', for: 'anh-su-co' }, 'Chụp ảnh'), xem),
      el('button', { class: 'nut dac gui', type: 'button', onclick: () => {
        if (!loai) { tb.style.color = 'var(--do)'; tb.textContent = 'Chọn loại sự cố trước khi gửi.'; return; }
        API.baoSuCo({ loai, ghi: ghi.value.slice(0, 300) })
          .then(() => { tb.style.color = ''; tb.textContent = 'Đã gửi báo cáo về Phòng Kế hoạch Kinh doanh.'; })
          .catch((l) => { tb.style.color = 'var(--do)'; tb.textContent = l.message; }); } }, 'Gửi báo cáo'), tb));
  }

  const TAB = { tuyen, 'hanh-trinh': () => window.HanhTrinh.ve(nd), 'hieu-qua': hieuQua, 'su-co': suCo };
  function mo(t) {
    TAB[t](); nd.focus({ preventScroll: true }); window.scrollTo(0, 0);
    document.querySelectorAll('.thanh-duoi button').forEach(b => b.toggleAttribute('aria-current', b.dataset.tab === t));
    document.querySelectorAll('.thanh-duoi button[aria-current]').forEach(b => b.setAttribute('aria-current', 'page'));
  }
  document.querySelectorAll('.thanh-duoi button').forEach(b => b.addEventListener('click', () => mo(b.dataset.tab)));
  mo('tuyen');
  }
})();
