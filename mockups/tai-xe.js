(function () {
  const F = window.FLEET, { so, el, ICON, TRU_SO } = window.SF;
  // Ví dụ: tài xế được giao xe ép rác 63C-171.96; ứng dụng thật lấy xe theo tài khoản đăng nhập
  const x = F.xe.find(v => v.bien_so === '63C-171.96') || F.xe[0];
  document.getElementById('xe-tx').textContent = `Xe ${x.bien_so}, ${x.loai.toLowerCase()}`;

  const map = L.map('ban-do-tx', { zoomControl: false, attributionControl: true, dragging: true, scrollWheelZoom: false }).setView([TRU_SO[0] + 0.004, TRU_SO[1] - 0.004], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
  L.marker([TRU_SO[0] + 0.004, TRU_SO[1] - 0.011], { icon: L.divIcon({ html: el('div', { class: 'o-xe' }, ICON(x.loai)), className: '', iconSize: [64, 64], iconAnchor: [32, 32] }) })
    .addTo(map).bindTooltip('Vị trí minh họa');
  L.marker(TRU_SO, { icon: L.divIcon({ html: el('div', { class: 'o-tru-so', text: 'TS' }), className: '', iconSize: [46, 46], iconAnchor: [23, 23] }) })
    .addTo(map).bindTooltip('Trụ sở, nơi cấp dầu');

  const NG = F.nguong_tuan, hop = document.getElementById('tuan-tx');
  x.chi_so_tuan.forEach((c, k) => {
    const d = el('div', { class: 'dong-tuan' },
      el('div', { class: 'o-xe' + (c > NG ? ' canh-bao' : ''), 'aria-hidden': 'true' }, c > 1.05 ? '⛽' : '🌿'),
      el('p', {}, `Tuần ${k + 1}, tháng 7/2026`, el('small', { text: c > 1.05 ? 'Dùng dầu nhiều hơn thường ngày' : c < 0.95 ? 'Tiết kiệm hơn thường ngày' : 'Đúng mức thường ngày' })),
      el('b', { class: 'so' + (c > NG ? ' cao' : ''), text: so(c, 2) }));
    if (k >= 2) d.hidden = true;
    hop.append(d);
  });
  const mr = document.getElementById('mo-rong-tx');
  mr.addEventListener('click', () => {
    const mo = mr.getAttribute('aria-expanded') !== 'true';
    hop.querySelectorAll('.dong-tuan').forEach((d, k) => { if (k >= 2) d.hidden = !mo; });
    mr.setAttribute('aria-expanded', mo); mr.textContent = mo ? 'Thu gọn' : 'Mở rộng';
  });
})();
