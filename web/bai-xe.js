// Phân hệ Đội xe: sơ đồ bãi nhìn từ trên xuống bằng SVG, bốn con số chính và danh sách thẻ 42 xe.
// web.js gọi window.veBaiXe(trang) mỗi lần mở #doi-xe.
window.veBaiXe = function (trang) {
  const { el: e0 } = window.SF;
  const muc = (lop, nhan, tieuDe, nhanManh, ...noiDung) => e0('section', { class: 'muc ' + lop }, e0('div', { class: 'khung-rong' },
    e0('p', { class: 'nhan-muc', text: nhan }), e0('h2', { class: 'tieu-de-muc' }, tieuDe + ' ', e0('em', { text: nhanManh })), e0('div', { class: 'ke-vang' }), ...noiDung));
  trang.append(
    e0('section', { class: 'bx-dau' }, e0('div', { class: 'khung-rong' },
      e0('p', { class: 'nhan-mo', text: 'Quản lý xe, tháng 7/2026' }),
      e0('h1', {}, 'Đội xe ', e0('span', { text: 'và bãi đậu' })),
      e0('p', { class: 'bx-dan', text: 'Mỗi ô trên sơ đồ là một chỗ đậu. Màu cho biết tình trạng của xe tính từ dữ liệu cảm biến tháng 7/2026; bấm vào một xe để xem chi tiết.' }),
      e0('div', { class: 'bx-so', id: 'bx-so' }))),
    muc('muc-den', 'Sơ đồ', 'Bãi đậu', 'nhìn từ trên xuống',
      e0('div', { class: 'bx-so-do' },
        e0('div', { class: 'bx-khung-svg' }, (() => { const v = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); v.id = 'so-do'; v.setAttribute('role', 'group'); v.setAttribute('aria-label', 'Sơ đồ bãi đậu 48 chỗ'); return v; })()),
        e0('aside', { class: 'bx-chi-tiet', id: 'chi-tiet', 'aria-live': 'polite' }, e0('p', { class: 'bx-goi-y', text: 'Bấm vào một xe trên sơ đồ hoặc trong danh sách bên dưới để xem chi tiết.' }))),
      e0('div', { class: 'bx-chu-giai', id: 'chu-giai' }),
      e0('p', { class: 'ghi', text: 'Xe xếp theo đội. Vị trí từng xe trên sơ đồ là bố trí minh họa; trạng thái lấy từ dữ liệu thật. Khi nối thiết bị giám sát hành trình, sơ đồ hiện đúng chỗ xe đang đậu.' })),
    muc('', 'Danh sách', '42 xe', 'chuyên dùng',
      e0('div', { class: 'bx-loc' }, e0('div', { class: 'chon', role: 'group', 'aria-label': 'Lọc theo đội', id: 'loc-doi' }), e0('div', { class: 'chon', role: 'group', 'aria-label': 'Lọc theo tình trạng', id: 'loc-tt' })),
      e0('p', { class: 'bx-dem', id: 'dem', 'aria-live': 'polite' }),
      e0('div', { class: 'bx-the', id: 'ds-the' })));
  const F = window.FLEET, { so, el, TRANG_THAI } = window.SF, XE = F.xe, CB = XE.filter(x => x.cam_bien);
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs, ...kids) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs || {})) e.setAttribute(k, v); kids.forEach(k => k != null && e.append(k)); return e; };
  const MAU = { xanh: 'var(--xanh)', vang: 'var(--vang)', do: 'var(--do)', chua: 'var(--tro)' };
  const ten = x => x.bien_so || x.ten;
  const ICON = {
    'Xe ép rác': 'M2 15V7h12v8M14 9h4l3 3v3h-7M2 11h12M6 18a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 6 18zM17 18a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 17 18z',
    'Xe ben, xe tải': 'M2 15l2-6h10v6M14 10h4l3 3v2h-7M6 18a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 6 18zM17 18a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 17 18z',
    'Xe bồn tưới': 'M3 13a4 3 0 0 1 4-3h6a4 3 0 0 1 0 6H7a4 3 0 0 1-4-3zM15 10h3l3 3v2h-4M7 19a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 7 19zM17 19a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 17 19z',
    'Xe hút cầu': 'M3 13a4 3 0 0 1 4-3h6a4 3 0 0 1 0 6H7a4 3 0 0 1-4-3zM15 10h3l3 3v2h-4M7 19a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 7 19zM17 19a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 17 19z',
    'Xe cẩu, xe thang': 'M2 15h12V11H2zM14 11h4l3 3v1h-7M4 11l9-7M6 18a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 6 18zM17 18a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 17 18z',
    'Xe công trình': 'M3 15h10v-4H6zM13 13l5-6 3 1-4 7M5 18h8M5 18a2 2 0 1 1 0-.01M13 18a2 2 0 1 1 0-.01'
  };
  const icon = (loai, cls) => sv('svg', { viewBox: '0 0 24 24', 'aria-hidden': 'true', class: cls || '' },
    sv('path', { d: ICON[loai] || ICON['Xe ép rác'], fill: 'none', stroke: 'currentColor', 'stroke-width': '1.7', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));

  // ---------- Bốn con số
  const dem = { xanh: 0, vang: 0, do: 0, chua: 0 }; XE.forEach(x => dem[x.trang_thai]++);
  const kt = CB.reduce((a, x) => a + x.ngay_hd, 0) / CB.length / 31 * 100;
  const het = XE.filter(x => x.het_kh).length, nguyenGia = XE.reduce((a, x) => a + x.nguyen_gia, 0);
  const so4 = [['Xe ép rác', String(XE.length), 'Xe chuyên dùng của ba đội'], ['Xe bồn tưới', String(CB.length), 'Xe có cảm biến nhiên liệu'],
    ['Xe cẩu, xe thang', String(het), 'Xe đã khấu hao hết'], ['Xe ben, xe tải', so(nguyenGia / 1000, 2), 'Tỷ đồng nguyên giá cả đội']];
  $('bx-so').replaceChildren(...so4.map(([ic, b, t]) => el('div', {}, icon(ic), el('b', { text: b }), el('span', { text: t }))));

  // ---------- Sơ đồ bãi: 3 lối đậu, mỗi lối hai dãy 8 chỗ, cổng vào trái, cổng ra phải, một chiều
  const svg = $('so-do'); svg.setAttribute('viewBox', '0 0 1000 640');
  const CHO = []; const LOI = [125, 285, 445], XS = [180, 260, 340, 420, 500, 580, 660, 740];
  LOI.forEach(a => [-1, 1].forEach(phia => XS.forEach(x => CHO.push({ x, y: phia < 0 ? a - 18 - 64 : a + 18, phia }))));
  const s = (st) => ({ style: st });
  svg.append(
    sv('rect', Object.assign({ x: 0, y: 590, width: 1000, height: 50 }, s('fill:var(--mat-2)'))),
    sv('line', Object.assign({ x1: 0, y1: 615, x2: 1000, y2: 615, 'stroke-dasharray': '22 16', 'stroke-width': 3 }, s('stroke:var(--nen)'))),
    sv('rect', Object.assign({ x: 30, y: 20, width: 940, height: 560, rx: 18 }, s('fill:var(--mat);stroke:var(--vien);stroke-width:2'))),
    // đường nối hai bên và đường trước
    sv('rect', Object.assign({ x: 70, y: 100, width: 60, height: 440, rx: 8 }, s('fill:var(--mat-2)'))),
    sv('rect', Object.assign({ x: 870, y: 100, width: 60, height: 440, rx: 8 }, s('fill:var(--mat-2)'))),
    sv('rect', Object.assign({ x: 70, y: 520, width: 860, height: 46, rx: 8 }, s('fill:var(--mat-2)'))),
    ...LOI.map(a => sv('rect', Object.assign({ x: 70, y: a - 18, width: 860, height: 36, rx: 6 }, s('fill:var(--mat-2)')))),
    // mũi tên một chiều
    ...LOI.flatMap(a => [300, 540, 820].map(x => sv('path', Object.assign({ d: `M${x - 10} ${a - 7} L${x + 6} ${a} L${x - 10} ${a + 7}`, fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s('stroke:var(--nhat)'))))),
    sv('path', Object.assign({ d: 'M100 470 L100 440 M92 452 L100 440 L108 452', fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round' }, s('stroke:var(--nhat)'))),
    sv('path', Object.assign({ d: 'M900 170 L900 200 M892 188 L900 200 L908 188', fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round' }, s('stroke:var(--nhat)'))),
  );
  // cổng
  [[100, 'Cổng vào', 'var(--nhan)'], [900, 'Cổng ra', '#E07A1F']].forEach(([x, t, m]) => {
    svg.append(sv('rect', Object.assign({ x: x - 34, y: 566, width: 68, height: 24 }, s('fill:var(--mat-2)'))),
      sv('rect', Object.assign({ x: x - 52, y: 574, width: 14, height: 14, rx: 3 }, s(`fill:${m}`))), sv('rect', Object.assign({ x: x + 38, y: 574, width: 14, height: 14, rx: 3 }, s(`fill:${m}`))),
      sv('text', Object.assign({ x, y: 562, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }, s(`fill:${m};font-family:var(--serif)`)), t));
  });
  // chỗ đậu và xe: xếp theo đội để dễ nhìn
  const theoDoi = [...XE].sort((a, b) => a.doi.localeCompare(b.doi, 'vi') || (a.bien_so || 'z').localeCompare(b.bien_so || 'z'));
  const nhomCho = [];
  CHO.forEach((c, i) => {
    const x = theoDoi[i];
    const g = sv('g', x ? { class: 'cho', tabindex: 0, role: 'button', 'aria-label': `${ten(x)}, ${x.ten}, ${TRANG_THAI[x.trang_thai].toLowerCase()}` } : {});
    g.append(sv('rect', Object.assign({ class: 'vien-cho', x: c.x - 30, y: c.y, width: 60, height: 64, rx: 6 }, s('fill:var(--nen);stroke:var(--vien);stroke-width:1.5'))));
    if (x) {
      const cabY = c.phia < 0 ? c.y + 44 : c.y + 6;      // đầu xe quay ra lối đi
      g.append(sv('rect', Object.assign({ class: 'xe-than', x: c.x - 18, y: c.y + 8, width: 36, height: 48, rx: 7 }, s(`fill:${MAU[x.trang_thai]}`))),
        sv('rect', Object.assign({ x: c.x - 14, y: cabY, width: 28, height: 12, rx: 3 }, s('fill:rgba(255,255,255,.55)'))),
        sv('title', {}, `${ten(x)}: ${x.ten}, ${TRANG_THAI[x.trang_thai].toLowerCase()}`));
      g.addEventListener('click', () => chonXe(x)); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chonXe(x); } });
      nhomCho.push([g, x]);
    }
    svg.append(g);
  });
  $('chu-giai').replaceChildren(...['xanh', 'vang', 'do', 'chua'].map(k => el('span', {}, el('i', { style: `background:${MAU[k]}` }), `${TRANG_THAI[k]}, ${dem[k]} xe`)));

  // ---------- Chi tiết xe
  function chonXe(x, cuon) {
    nhomCho.forEach(([g, v]) => g.classList.toggle('chon', v === x));
    document.querySelectorAll('.the-xe').forEach(t => t.classList.toggle('chon', t.dataset.ma === x.ma));
    const dong = [['Đội', x.doi], ['Năm sử dụng', `${x.nam}, ${x.tuoi} năm`], ['Nguyên giá', so(x.nguyen_gia, 0) + ' triệu'], ['Giá trị còn lại', so(x.gtcl, 0) + ' triệu']];
    if (x.cam_bien) dong.push(['Ngày hoạt động tháng 7', `${x.ngay_hd}/31`], ['Quãng đường', so(x.km, 0) + ' km'], ['Dầu tiêu thụ', so(x.lit, 0) + ' lít'],
      ['Tiêu hao', x.tieu_hao ? `${so(x.tieu_hao, 2)} ${x.don_vi}` : '–'], ['Chỉ số tuần cao nhất', x.chi_so_tuan.length ? so(Math.max(...x.chi_so_tuan), 2) : '–'], ['Ngày khác thường', String(x.ngay_if)]);
    $('chi-tiet').replaceChildren(el('span', { class: 'the-tt ' + x.trang_thai, text: TRANG_THAI[x.trang_thai] }), el('h3', { text: ten(x) }), el('p', { class: 'loai', text: x.ten }),
      el('dl', {}, ...dong.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })])));
    if (cuon) $('chi-tiet').scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  // ---------- Danh sách thẻ, lọc, tìm
  let locDoi = 'Tất cả', locTT = 'tat-ca', tu = '';
  const chips = (id, ds, lay, dat) => { const hop = $(id); hop.replaceChildren(...ds.map(([v, t]) => el('button', { class: 'chip', type: 'button', 'aria-pressed': String(v === lay()), onclick: (e) => { dat(v); hop.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === e.currentTarget))); ve(); } }, t))); };
  chips('loc-doi', [['Tất cả', 'Tất cả đội'], ['Vệ sinh môi trường', 'Vệ sinh môi trường'], ['Công viên cây xanh', 'Công viên cây xanh'], ['Xây dựng cầu đường', 'Xây dựng cầu đường']], () => locDoi, v => locDoi = v);
  chips('loc-tt', [['tat-ca', 'Mọi tình trạng'], ...['do', 'vang', 'xanh', 'chua'].map(k => [k, TRANG_THAI[k]])], () => locTT, v => locTT = v);
  function ve() {
    const q = tu.toUpperCase().replace(/[^0-9A-Z]/g, '');
    const ds = XE.filter(x => (locDoi === 'Tất cả' || x.doi === locDoi) && (locTT === 'tat-ca' || x.trang_thai === locTT) && (!q || (x.bien_so || '').replace(/[^0-9A-Z]/g, '').includes(q)));
    $('dem').textContent = ds.length ? `Đang hiện ${ds.length}/${XE.length} xe` : 'Không có xe nào khớp bộ lọc. Bỏ bớt điều kiện lọc hoặc xóa ô tìm.';
    nhomCho.forEach(([g, x]) => g.classList.toggle('mo', !ds.includes(x)));
    $('ds-the').replaceChildren(...ds.map(x => el('button', { class: 'the-xe', type: 'button', 'data-ma': x.ma, style: `--mau:${MAU[x.trang_thai]}`, onclick: () => chonXe(x, true) },
      el('div', { class: 'the-dau' }, icon(x.loai), el('div', {}, el('b', { text: ten(x) }), el('small', { text: x.bien_so ? x.ten : x.doi }))),
      el('div', { class: 'the-chan' }, el('span', { text: x.doi }), el('span', { class: 'the-tt ' + x.trang_thai, text: TRANG_THAI[x.trang_thai] })),
      x.cam_bien ? el('div', {}, el('div', { class: 'the-chan' }, el('span', { text: 'Ngày hoạt động tháng 7' }), el('span', { text: `${x.ngay_hd}/31` })),
        el('div', { class: 'the-thanh' }, el('i', { style: `width:${x.ngay_hd / 31 * 100}%` }))) : el('div', { class: 'the-chan' }, el('span', { text: `${x.tuoi} năm sử dụng` }), el('span', { text: x.het_kh ? 'Đã hết khấu hao' : 'Còn khấu hao' })))));
  }
  // ô tìm ở đầu trang lọc luôn danh sách khi đang ở Đội xe; rời trang thì bỏ qua
  $('o-tim').oninput = e => { if (!$('ds-the')) return; tu = e.target.value; ve(); };
  tu = $('o-tim').value; ve();
};
