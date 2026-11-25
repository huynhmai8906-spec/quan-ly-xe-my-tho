// Màn hình Hành trình: ghi GPS, tạm dừng hoặc tiếp tục, đánh dấu điểm, lưu và mở tệp GPX.
// Logic chức năng theo Open GPX Tracker; mã viết mới. Dữ liệu chỉ nằm trên điện thoại cho đến khi tài xế gửi.
window.HanhTrinh = (function () {
  const { so, el, TRU_SO, luu, banDo } = window.SF, G = window.GPX;
  const KHOA = 'ht.hien-tai', KHO = 'ht.da-luu';
  let HT = luu.doc(KHOA, null);          // hành trình đang ghi
  let trangThai = 'dung';                 // dung | ghi | tam-dung
  let theoDoi = null, moPhong = null, dongHo = null, viTri = null;
  let map = null, lop = null, nd = null;
  const moi = (ten) => ({ ten, batDau: Date.now(), doan: [], diemDanhDau: [], thoiGian: 0, moPhong: false });
  const giu = () => { if (HT) luu.ghi(KHOA, HT); };

  // ---------- Nhận vị trí
  function themDiem(p) {
    viTri = p;
    if (trangThai === 'ghi' && HT) {
      const d = HT.doan[HT.doan.length - 1], cuoi = d[d.length - 1];
      // Bỏ điểm sai số lớn hơn 50 m hoặc gần điểm trước dưới 3 m, như cách lọc nhiễu thông thường của máy ghi GPX
      if ((p.acc == null || p.acc <= 50) && (!cuoi || G.khoangCach(cuoi, p) >= 3)) { d.push({ lat: p.lat, lon: p.lon, ele: p.ele, t: p.t }); giu(); }
    }
    veLai();
  }
  function batGPS() {
    if (!('geolocation' in navigator)) { bao('Điện thoại không hỗ trợ định vị. Dùng chạy thử mô phỏng để xem chức năng.', true); return false; }
    theoDoi = navigator.geolocation.watchPosition(
      v => themDiem({ lat: v.coords.latitude, lon: v.coords.longitude, ele: v.coords.altitude, acc: v.coords.accuracy, spd: v.coords.speed, t: v.timestamp }),
      e => bao(e.code === 1 ? 'Chưa được cấp quyền vị trí. Bật quyền vị trí cho trình duyệt rồi thử lại.' : 'Chưa lấy được vị trí. Ra chỗ thoáng hoặc thử lại sau.', true),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
    return true;
  }
  function tatGPS() { if (theoDoi != null) navigator.geolocation.clearWatch(theoDoi); theoDoi = null; clearInterval(moPhong); moPhong = null; }
  // Chạy thử: xe chạy vòng quanh trụ sở 20 km/h, mỗi giây một điểm; hành trình được ghi rõ là mô phỏng
  function chayMoPhong() {
    let goc = 0; HT.moPhong = true; HT.ten = 'Mô phỏng ' + new Date().toLocaleDateString('vi-VN');
    moPhong = setInterval(() => {
      goc += 0.012;
      const lat = TRU_SO[0] + 0.006 + 0.005 * Math.sin(goc), lon = TRU_SO[1] - 0.004 + 0.008 * Math.cos(goc * 0.9);
      themDiem({ lat, lon, ele: 2 + Math.sin(goc) , acc: 6, spd: 5.6, t: Date.now() });
    }, 1000);
  }

  // ---------- Điều khiển
  function batDau(thu) {
    if (!HT) HT = moi('Hành trình ' + new Date().toLocaleString('vi-VN'));
    HT.doan.push([]); trangThai = 'ghi'; giu();
    if (thu) chayMoPhong(); else if (!batGPS()) return;
    dongHo = setInterval(() => { HT.thoiGian += 1000; veSo(); }, 1000);
    ve();
  }
  function tamDung() { trangThai = 'tam-dung'; tatGPS(); clearInterval(dongHo); giu(); ve(); }
  function danhDau(p) {
    p = p || viTri; if (!HT || !p) { bao('Chưa có vị trí để đánh dấu.', true); return; }
    HT.diemDanhDau.push({ lat: p.lat, lon: p.lon, ele: p.ele ?? null, t: Date.now(), ten: 'Điểm ' + (HT.diemDanhDau.length + 1) }); giu(); veLai();
  }
  function luuGPX() {
    if (!HT || !G.tong(HT.doan) && !HT.diemDanhDau.length) { bao('Hành trình chưa có điểm nào để lưu.', true); return; }
    tamDung();
    const kho = luu.doc(KHO, []); kho.unshift(Object.assign({}, HT, { luuLuc: Date.now() })); luu.ghi(KHO, kho.slice(0, 20));
    G.taiVe(HT.ten, G.taoTep(HT));
    bao(`Đã lưu ${HT.ten} và tải tệp GPX về máy.`); HT = null; trangThai = 'dung'; luu.ghi(KHOA, null); viTri = null; ve();
  }
  function moTep(f) {
    if (!f) return;
    if (f.size > 5e6) { bao('Tệp lớn hơn 5 MB, chưa mở được.', true); return; }
    f.text().then(t => {
      try { const h = G.docTep(t); tatGPS(); clearInterval(dongHo); HT = Object.assign(moi(h.ten), h); trangThai = 'tam-dung'; giu(); ve(); bao(`Đã mở ${h.ten}. Bấm Tiếp tục để ghi nối vào hành trình này.`); }
      catch (e) { bao(e.message, true); }
    });
  }

  // ---------- Vẽ
  let tb = null;
  function bao(s, loi) { if (tb) { tb.textContent = s; tb.style.color = loi ? 'var(--do)' : ''; } }
  function dongHoChu(ms) { const s = Math.floor(ms / 1000); return [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(x => String(x).padStart(2, '0')).join(':'); }
  function veSo() {
    const o = nd && nd.querySelector('.so-ht'); if (!o) return;
    const doanCuoi = HT && HT.doan.length ? G.doDai(HT.doan[HT.doan.length - 1]) : 0;
    const v = [['Thời gian', HT ? dongHoChu(HT.thoiGian) : '00:00:00'], ['Quãng đường', so((HT ? G.tong(HT.doan) : 0) / 1000, 2) + ' km'],
      ['Đoạn đang ghi', so(doanCuoi / 1000, 2) + ' km'], ['Tốc độ', viTri && viTri.spd != null ? so(viTri.spd * 3.6, 0) + ' km/h' : '–'],
      ['Sai số vị trí', viTri && viTri.acc != null ? '±' + so(viTri.acc, 0) + ' m' : '–'], ['Độ cao', viTri && viTri.ele != null ? so(viTri.ele, 0) + ' m' : '–']];
    o.replaceChildren(...v.map(([k, x]) => el('div', {}, el('b', { class: 'so', text: x }), el('span', { text: k }))));
  }
  function veLai() {
    veSo(); if (!map) return;
    lop.clearLayers();
    if (HT) {
      HT.doan.filter(d => d.length > 1).forEach(d => L.polyline(d.map(p => [p.lat, p.lon]), { color: getComputedStyle(document.documentElement).getPropertyValue('--nhan').trim(), weight: 5, opacity: .9 }).addTo(lop));
      HT.diemDanhDau.forEach((w, i) => {
        const m = L.marker([w.lat, w.lon], { draggable: true, title: w.ten, icon: L.divIcon({ html: el('div', { class: 'ghim', text: String(i + 1) }), className: '', iconSize: [30, 30], iconAnchor: [15, 30] }) }).addTo(lop);
        const ten = el('input', { value: w.ten, maxlength: '40', 'aria-label': 'Tên điểm' });
        m.bindPopup(el('div', { class: 'hop-ghim' }, ten,
          el('div', {}, el('button', { class: 'nut dac', type: 'button', onclick: () => { w.ten = ten.value.trim() || w.ten; giu(); m.closePopup(); veLai(); } }, 'Lưu tên'),
            el('button', { class: 'nut', type: 'button', onclick: () => { HT.diemDanhDau.splice(i, 1); giu(); veLai(); } }, 'Xóa điểm'))));
        m.on('dragend', e => { const p = e.target.getLatLng(); w.lat = p.lat; w.lon = p.lng; giu(); });
      });
    }
    if (viTri) {
      L.circle([viTri.lat, viTri.lon], { radius: viTri.acc || 10, color: '#5EBDE9', weight: 1, fillOpacity: .12 }).addTo(lop);
      L.marker([viTri.lat, viTri.lon], { icon: L.divIcon({ html: el('div', { class: 'cham-vi-tri' }), className: '', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(lop);
      if (trangThai === 'ghi') map.panTo([viTri.lat, viTri.lon], { animate: false });
    }
  }
  function ve(khung) {
    nd = khung || nd;
    const nutChinh = trangThai === 'ghi'
      ? el('button', { class: 'nut dac lon-nut', type: 'button', onclick: tamDung }, 'Tạm dừng')
      : el('button', { class: 'nut dac lon-nut', type: 'button', onclick: () => batDau(false) }, trangThai === 'tam-dung' ? 'Tiếp tục ghi' : 'Bắt đầu ghi');
    const chon = el('input', { type: 'file', accept: '.gpx,application/gpx+xml,application/xml', id: 'mo-gpx', class: 'an', onchange: e => moTep(e.target.files[0]) });
    tb = el('p', { class: 'da-gui', 'aria-live': 'polite' });
    const kho = luu.doc(KHO, []);
    nd.replaceChildren(
      el('div', { class: 'ban-do-app cao' }, el('div', { id: 'ban-do-ht' }), el('div', { class: 'ten-man' }, el('h1', { text: 'Hành trình' })),
        HT && HT.moPhong ? el('p', { class: 'nhan-mo-phong', text: 'Đang chạy mô phỏng' }) : null),
      el('section', { class: 'vung' },
        el('div', { class: 'so-ht' }),
        el('div', { class: 'hang-dk' }, nutChinh, el('button', { class: 'nut', type: 'button', onclick: () => danhDau() }, 'Đánh dấu điểm')),
        el('div', { class: 'hang-dk phu' }, el('button', { class: 'nut', type: 'button', onclick: luuGPX }, 'Lưu GPX'), chon, el('label', { class: 'nut', for: 'mo-gpx' }, 'Mở tệp GPX'),
          trangThai !== 'ghi' ? el('button', { class: 'nut', type: 'button', onclick: () => batDau(true) }, 'Chạy thử mô phỏng') : null),
        tb,
        el('p', { class: 'ghi', text: 'Nhấn giữ trên bản đồ để đánh dấu một điểm bất kỳ; chạm vào điểm để đổi tên hoặc xóa, kéo để dời. Tệp GPX mở được trên web quản trị để vẽ lại tuyến và tính quãng đường.' }),
        kho.length ? el('h2', { class: 'tieu-de-kho', text: 'Đã lưu trên máy' }) : null,
        ...kho.map((h, i) => el('div', { class: 'chuyen' },
          el('div', {}, el('b', { text: h.ten }), el('small', { text: `${so(G.tong(h.doan) / 1000, 2)} km, ${h.diemDanhDau.length} điểm đánh dấu, ${new Date(h.luuLuc).toLocaleString('vi-VN')}` })),
          el('div', { class: 'hang-dk' }, el('button', { class: 'nut', type: 'button', onclick: () => G.taiVe(h.ten, G.taoTep(h)) }, 'Tải GPX'),
            el('button', { class: 'nut', type: 'button', onclick: () => { tatGPS(); clearInterval(dongHo); HT = Object.assign({}, h); delete HT.luuLuc; trangThai = 'tam-dung'; giu(); ve(); bao(`Đã mở ${h.ten}. Bấm Tiếp tục ghi để ghi nối.`); } }, 'Ghi tiếp'),
            el('button', { class: 'nut', type: 'button', 'data-xac-nhan': '0', onclick: (e) => {
              const b = e.currentTarget; if (b.dataset.xacNhan === '0') { b.dataset.xacNhan = '1'; b.textContent = 'Bấm lần nữa để xóa'; return; }
              const k = luu.doc(KHO, []); k.splice(i, 1); luu.ghi(KHO, k); ve(); } }, 'Xóa'))))));
    map = banDo('ban-do-ht', viTri ? [viTri.lat, viTri.lon] : [TRU_SO[0] + 0.004, TRU_SO[1] - 0.004], 15, { dragging: true });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    lop = L.layerGroup().addTo(map);
    map.on('contextmenu', e => { if (!HT) HT = moi('Hành trình ' + new Date().toLocaleString('vi-VN')); danhDau({ lat: e.latlng.lat, lon: e.latlng.lng }); });
    if (HT && G.tong(HT.doan) > 0) { const all = HT.doan.flat().map(p => [p.lat, p.lon]); if (all.length > 1) map.fitBounds(all, { padding: [30, 30] }); }
    veLai();
  }
  return { ve };
})();
