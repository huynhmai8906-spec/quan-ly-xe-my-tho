(function () {
  const F = window.FLEET, { so, el, ICON, TRU_SO } = window.SF;
  const NG = F.nguong_tuan;

  document.getElementById('dai-phu').textContent = `${F.ky}, ${F.xe.length} xe có dữ liệu cảm biến`;
  const hd = F.xe.reduce((a, x) => a + x.ngay_hd, 0) / F.xe.length;
  document.getElementById('tom-tat-xe').textContent = `${F.xe.length} xe có cảm biến, bình quân ${so(hd)} ngày hoạt động trong tháng`;

  // Bản đồ: mỗi loại xe một ô biểu tượng, số ở góc là số xe; vị trí minh họa quanh trụ sở
  const map = L.map('ban-do', { zoomControl: false, scrollWheelZoom: false, attributionControl: true }).setView([TRU_SO[0] + 0.006, TRU_SO[1] + 0.002], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  const nhom = {};
  for (const x of F.xe) (nhom[x.loai] = nhom[x.loai] || []).push(x);
  // Lệch về phía bắc trụ sở để ô biểu tượng không rơi xuống sông Tiền
  const lech = [[0.002, -0.017], [0.006, -0.007], [0.004, 0.011], [0.000, 0.021], [0.007, 0.024]];
  Object.entries(nhom).forEach(([loai, ds], i) => {
    const vuot = ds.some(x => x.chi_so_tuan.some(c => c > NG));
    const div = el('div', { class: 'o-xe' + (vuot ? ' canh-bao' : ''), title: loai }, ICON(loai), el('span', { class: 'dem', text: String(ds.length) }));
    const p = [TRU_SO[0] + lech[i % lech.length][0], TRU_SO[1] + lech[i % lech.length][1]];
    L.marker(p, { icon: L.divIcon({ html: div, className: '', iconSize: [64, 64], iconAnchor: [32, 32] }), keyboard: true, title: `${loai}: ${ds.length} xe` })
      .addTo(map).bindTooltip(`${loai}: ${ds.length} xe${vuot ? ', có xe cần kiểm tra' : ''}`);
  });
  L.marker(TRU_SO, { icon: L.divIcon({ html: el('div', { class: 'o-tru-so', text: 'TS' }), className: '', iconSize: [46, 46], iconAnchor: [23, 23] }), title: 'Trụ sở Công ty' })
    .addTo(map).bindTooltip('Trụ sở Công ty, vị trí gần đúng');

  // Danh sách cần kiểm tra: tuần có chỉ số vượt ngưỡng, hoặc có ngày bị Isolation Forest lọc ra
  document.getElementById('giai-thich-nguong').textContent =
    `Chỉ số tiêu hao bằng lít thực tế chia lít thường ngày của chính xe. Ngưỡng ${so(NG, 2)} là mức mà 95% số tuần nằm dưới. Danh sách chỉ để kiểm tra nhật ký, không dùng để xử phạt.`;
  const ds = F.xe.map(x => ({ x, max: Math.max(0, ...x.chi_so_tuan), vuot: x.chi_so_tuan.some(c => c > NG) }))
    .filter(r => r.vuot || r.x.ngay_if > 0)
    .sort((a, b) => (b.vuot - a.vuot) || (b.max - a.max) || (b.x.ngay_if - a.x.ngay_if));
  const hop = document.getElementById('ds-kiem-tra');
  ds.forEach((r, i) => {
    const x = r.x;
    const ly_do = [];
    if (r.vuot) ly_do.push(`chỉ số tuần cao nhất ${so(r.max, 2)}`);
    if (x.ngay_if) ly_do.push(`${x.ngay_if} ngày khác thường`);
    const cot = el('div', { class: 'cot-tuan', 'aria-label': 'Chỉ số theo tuần' },
      ...x.chi_so_tuan.map((c, k) => el('div', { class: c > NG ? 'vuot' : '', style: `height:${Math.min(40, Math.max(4, c * 26))}px`, title: `Tuần ${k + 1}: ${so(c, 2)}` }, el('span', { text: `T${k + 1}` }))));
    const kl = el('div', { class: 'ket-luan' },
      el('label', { for: `kl-${i}`, class: 'ghi', text: 'Kết luận sau khi kiểm tra nhật ký, ví dụ: làm việc tại chỗ, lỗi thiết bị, cần kiểm tra kỹ thuật' }),
      el('textarea', { id: `kl-${i}`, maxlength: '500' }),
      el('button', { class: 'nut', type: 'button', onclick: (e) => { e.target.textContent = 'Đã lưu kết luận'; } }, 'Lưu kết luận'));
    const dong = el('div', { class: 'dong-xe', 'data-an': i >= 4 ? '1' : '0' },
      el('div', { class: 'o-xe' + (r.vuot ? ' canh-bao' : ''), 'aria-hidden': 'true' }, ICON(x.loai)),
      el('div', {}, el('h3', { text: `${x.bien_so}, ${x.loai.toLowerCase()}` }),
        el('p', { class: 'mo-ta', text: `${x.doi}; ${ly_do.join('; ')}` }), cot),
      el('button', { class: 'nut', type: 'button', 'aria-expanded': 'false', onclick: (e) => { const m = kl.classList.toggle('mo'); e.target.setAttribute('aria-expanded', m); } }, 'Ghi kết luận'),
      kl);
    if (i >= 4) dong.hidden = true;
    hop.append(dong);
  });
  const mr = document.getElementById('nut-mo-rong');
  if (ds.length <= 4) mr.hidden = true;
  mr.addEventListener('click', () => {
    const mo = mr.getAttribute('aria-expanded') !== 'true';
    hop.querySelectorAll('[data-an="1"]').forEach(d => { d.hidden = !mo; });
    mr.setAttribute('aria-expanded', mo); mr.textContent = mo ? 'Thu gọn' : 'Mở rộng';
  });

  // Chi phí 2025
  const cp = document.getElementById('bieu-do-chi-phi'), maxCp = F.chi_phi_2025[0][1];
  F.chi_phi_2025.forEach(([ten, v], i) => cp.append(el('div', { class: 'thanh' },
    el('span', { text: ten }),
    el('div', { class: 'vach-o' }, el('div', { class: 'vach' + (i === 1 ? ' dong' : ''), style: `width:${v / maxCp * 100}%` })),
    el('b', { class: 'so', text: so(v, 0) }))));
  cp.append(el('div', { class: 'thanh' }, el('span', { text: 'Tổng' }), el('span'), el('b', { class: 'so', text: so(F.tong_2025, 0) })));

  // Khai thác theo đội: mỗi ô là một ngày của tháng, ô đen là ngày xe có hoạt động
  const kt = document.getElementById('khai-thac');
  const theoDoi = {};
  for (const x of F.xe) (theoDoi[x.doi] = theoDoi[x.doi] || []).push(x);
  Object.entries(theoDoi).forEach(([doi, xs]) => {
    kt.append(el('h3', { class: 'nhom-doi', text: `Đội ${doi}` }));
    xs.sort((a, b) => b.ngay_hd - a.ngay_hd).forEach(x => {
      const ngay = el('div', { class: 'ngay', role: 'img', 'aria-label': `${x.ngay_hd} trên 31 ngày` },
        ...x.lich.map((c, k) => el('i', { class: c ? 'co' : '', title: `Ngày ${k + 1}/7` })));
      kt.append(el('div', { class: 'thanh' }, el('span', { class: 'ten', text: `${x.bien_so}, ${x.loai.toLowerCase()}` }), el('div', { class: 'vach-o' }, ngay), el('b', { class: 'so', text: `${x.ngay_hd}/31` })));
    });
  });

  // Mô hình
  const mh = document.getElementById('mo-hinh');
  F.mo_hinh.forEach(([ten, v], i) => mh.append(el('div', { class: 'thanh' }, el('span', { text: ten }),
    el('div', { class: 'vach-o' }, el('div', { class: 'vach' + (i === 0 ? ' dong' : ' nhat'), style: `width:${v / 20 * 100}%` })), el('b', { class: 'so', text: so(v) }))));
  const kc = F.kiem_chung, kcd = document.getElementById('kiem-chung');
  [['Chênh lệch với thực tế, %', kc.cu, kc.moi], ['Phát hiện vượt 20%, %', kc.phat_hien_cu, kc.phat_hien_moi], ['Báo nhầm khi chưa vượt, %', kc.bao_nham_cu, kc.bao_nham_moi]]
    .forEach(([ten, a, b]) => kcd.append(el('div', { class: 'thanh' }, el('span', { text: ten }),
      el('div', { class: 'vach-o' }, el('div', { class: 'vach nhat', style: `width:${a}%` }), el('div', { class: 'vach dong', style: `width:${b}%;margin-top:3px` })),
      el('b', { class: 'so', text: `${so(a)} / ${so(b)}` }))));
  kcd.append(el('p', { class: 'nguon', text: 'Thanh xám: định mức cũ. Thanh đồng: định mức và cảnh báo theo xe. Kiểm chứng trên ngày 22–31/7/2026.' }));
})();
