(function () {
  // Số liệu do khoi-dong.js tải từ /api/du-lieu sau khi đăng nhập; khách chưa đăng nhập thì rỗng
  const F = window.FLEET || { xe: [], nguong_tuan: 1, chi_phi_2025: [], tong_2025: 0, kiem_chung: {}, gia_dau: 0 }, { so, el, TRANG_THAI, TRU_SO, banDo } = window.SF;
  const lucKL = k => k.luc ? `${new Date(k.luc * 1000).toLocaleString('vi-VN')}, ${k.nguoi}` : '';
  const NG = F.nguong_tuan, XE = F.xe, CB = XE.filter(x => x.cam_bien);
  const trang = document.getElementById('trang');
  const ten = x => x.bien_so ? `${x.bien_so}` : x.ten;
  const moTa = x => x.bien_so ? `${x.ten}, ${x.doi.toLowerCase()}` : x.doi;

  function muc(tieuDe, cauDan, den, ...noiDung) {
    return el('section', { class: 'muc' + (den ? ' muc-den' : '') },
      el('div', { class: 'khung-rong' }, el('h2', { class: 'tieu-de-muc', text: tieuDe }), el('div', { class: 'ke-vang' }),
        cauDan ? el('p', { class: 'cau-dan', text: cauDan }) : el('div', { style: 'height:28px' }), ...noiDung));
  }
  function thanh(nhan, giaTri, max, chu, nhanManh) {
    return el('div', { class: 'thanh' }, el('span', { text: nhan }),
      el('div', { class: 'o-vach' }, el('div', { class: 'vach' + (nhanManh ? ' nhan' : ''), style: `width:${Math.max(0.5, giaTri / max * 100)}%` })),
      el('b', { class: 'so', text: chu }));
  }
  const canKiemTra = () => CB.map(x => ({ x, max: Math.max(0, ...x.chi_so_tuan), vuot: x.chi_so_tuan.some(c => c > NG) }))
    .filter(r => r.vuot || r.x.ngay_if > 0).sort((a, b) => (b.vuot - a.vuot) || (b.x.ngay_if - a.x.ngay_if) || (b.max - a.max));

  // ---------- Trang chủ, theo bố cục bản Canva của Công ty
  // Ảnh đặt trong web/anh/; chưa có ảnh thì hiện khung chờ ghi rõ cần ảnh gì
  function anh(file, moTa, chu) {
    const k = el('div', { class: 'anh-khung' });
    const cho = el('div', { class: 'anh-cho', role: 'img', 'aria-label': moTa }, el('div', {}, (() => { const s = icon('hop'); s.querySelector('path').setAttribute('d', 'M4 6h16v12H4zM4 15l5-5 4 4 3-3 4 4M15 9.5a1.2 1.2 0 1 0 0-.01'); return s; })(), el('b', { text: chu || moTa })));
    const i = el('img', { src: `anh/${file}`, alt: moTa, loading: 'lazy' });
    i.addEventListener('error', () => i.replaceWith(cho));
    k.append(i); return k;
  }
  const ICON = {
    xe: 'M3 16V7h11v9M14 10h4l3 3v3h-7M6.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    bieu: 'M4 20V10M10 20V4M16 20v-7M22 20H2', co_le: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6z',
    la: 'M5 19c8 0 14-6 14-14C11 5 5 11 5 19zm0 0 7-7', rac: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13', cong: 'M3 21h18M5 21V10l7-5 7 5v11M10 21v-6h4v6',
    hop: 'M3 8l9-5 9 5v8l-9 5-9-5V8zm0 0 9 5 9-5M12 13v8', bia: 'M8 21V9a4 4 0 0 1 8 0v12M5 21h14M12 13v4'
  };
  const icon = (k) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', ICON[k]); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '1.8'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); s.append(p); return s; };
  // Hình thành phố nét mảnh, vẽ mới cho trang này
  function thanhPho(cls) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 560 180'); s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true');
    const nha = [[10, 120, 40, 60], [56, 90, 34, 90], [96, 60, 44, 120], [146, 100, 30, 80], [182, 40, 46, 140], [234, 80, 36, 100], [276, 20, 40, 160], [322, 70, 52, 110], [380, 50, 34, 130], [420, 95, 42, 85], [468, 66, 38, 114], [512, 110, 40, 70]];
    for (const [x, y, w, h] of nha) {
      const r = document.createElementNS(s.namespaceURI, 'rect'); Object.entries({ x, y, width: w, height: h, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.4 }).forEach(([k, v]) => r.setAttribute(k, v)); s.append(r);
      for (let yy = y + 10; yy < 170; yy += 14) { const l = document.createElementNS(s.namespaceURI, 'line'); Object.entries({ x1: x + 6, x2: x + w - 6, y1: yy, y2: yy, stroke: 'currentColor', 'stroke-width': .6, 'stroke-dasharray': '4 4' }).forEach(([k, v]) => l.setAttribute(k, v)); s.append(l); }
    }
    const g = document.createElementNS(s.namespaceURI, 'path'); g.setAttribute('d', 'M0 178 C140 160 280 186 560 168'); g.setAttribute('fill', 'none'); g.setAttribute('stroke', 'currentColor'); g.setAttribute('stroke-width', '2'); s.append(g);
    return s;
  }
  function songDay() {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 1200 120'); s.setAttribute('class', 'song-day'); s.setAttribute('preserveAspectRatio', 'none'); s.setAttribute('aria-hidden', 'true');
    [['M0 70 C300 20 600 110 900 60 C1050 35 1140 50 1200 60 V120 H0Z', .18], ['M0 90 C260 60 560 120 860 86 C1020 68 1130 84 1200 90 V120 H0Z', .32]].forEach(([d, o]) => {
      const p = document.createElementNS(s.namespaceURI, 'path'); p.setAttribute('d', d); p.setAttribute('fill', 'currentColor'); p.setAttribute('opacity', o); s.append(p); });
    // Cầu dây văng nét mảnh trên mặt sông
    const c = document.createElementNS(s.namespaceURI, 'path'); c.setAttribute('d', 'M420 70 H780 M500 70 L540 30 L580 70 M620 70 L660 30 L700 70 M540 30 V70 M660 30 V70');
    c.setAttribute('fill', 'none'); c.setAttribute('stroke', 'currentColor'); c.setAttribute('stroke-width', '1.6'); c.setAttribute('opacity', '.7'); s.append(c);
    return s;
  }
  function mucTrang(nhanMuc, tieuDe, nhanManh, cauDan, lop, ...noiDung) {
    const h = el('h2', { class: 'tieu-de-muc' }, tieuDe, nhanManh ? ' ' : '', nhanManh ? el('em', { text: nhanManh }) : null);
    return el('section', { class: 'muc ' + (lop || '') },
      el('div', { class: 'khung-rong' }, el('p', { class: 'nhan-muc', text: nhanMuc }), h, el('div', { class: 'ke-vang' }),
        cauDan ? el('p', { class: 'cau-dan', text: cauDan }) : el('div', { style: 'height:28px' }), ...noiDung));
  }

  // Chạy số từ 0 lên giá trị thật trong 0,9 giây; bỏ qua khi người dùng chọn giảm chuyển động
  function demSo(ds) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ds.forEach(b => {
      const goc = b.textContent, m = goc.match(/[\d.,]+/); if (!m) return;
      const giaTri = parseFloat(m[0].replace(/\./g, '').replace(',', '.')), le = (m[0].split(',')[1] || '').length, t0 = performance.now();
      const buoc = (t) => { const k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3);
        b.textContent = goc.replace(m[0], (giaTri * e).toLocaleString('vi-VN', { minimumFractionDigits: le, maximumFractionDigits: le })); if (k < 1) requestAnimationFrame(buoc); else b.textContent = goc; };
      requestAnimationFrame(buoc);
    });
  }

  // ---------- Trang giới thiệu công khai: không có dữ liệu vận hành nội bộ
  function congKhai() {
    const thanhSo = el('div', { class: 'thanh-so' },
      el('div', {}, icon('xe'), el('b', { class: 'so', text: '42' }), el('span', { text: 'Xe chuyên dùng' })),
      el('div', {}, icon('la'), el('b', { class: 'so', text: '411' }), el('span', { text: 'Người lao động, năm 2025' })),
      el('div', {}, icon('cong'), el('b', { class: 'so', text: '3' }), el('span', { text: 'Đội sản xuất' })));
    const hero = el('section', { class: 'hero', 'aria-labelledby': 'tieu-de-chinh' },
      el('div', { class: 'khung-rong hero-luoi' },
        el('div', { style: 'position:relative' }, anh('tru-so.jpg', 'Tập thể người lao động trước trụ sở Công ty', 'Tập thể Công ty trước trụ sở'), thanhSo),
        el('div', { class: 'hero-chu' },
          el('p', { class: 'nhan-mo', text: 'Công ty TNHH MTV Công trình Đô thị Mỹ Tho' }),
          el('h1', { id: 'tieu-de-chinh' }, el('span', { text: 'Vì một Mỹ Tho' }), el('span', { text: 'xanh, sạch, đẹp' })),
          el('p', { text: 'Công ty thực hiện dịch vụ công ích đô thị tại khu vực Mỹ Tho: thu gom, vận chuyển rác; duy trì công viên, cây xanh; duy tu cầu đường, thoát nước và chiếu sáng công cộng.' }),
          el('div', { class: 'hang-nut' }, el('a', { class: 'nut dac', href: '#gioi-thieu/linh-vuc' }, 'Lĩnh vực hoạt động'), el('a', { class: 'nut', href: '#tong-quan' }, 'Vào phần quản lý xe', el('span', { class: 'mui', text: '→' }))))),
      thanhPho('thanh-pho'));
    const MOC = [['1998', 'Thành lập', 'Theo Quyết định số 699/1998/QĐ-UB ngày 31/3/1998 của UBND tỉnh Tiền Giang.'],
      ['2009–2010', 'Chuyển đổi', 'Trở thành công ty trách nhiệm hữu hạn một thành viên, 100% vốn nhà nước.'],
      ['2025', 'Chủ sở hữu mới', 'UBND tỉnh Đồng Tháp là chủ sở hữu theo Quyết định số 561/QĐ-UBND ngày 26/8/2025.'],
      ['Hiện nay', 'Ba đội sản xuất', 'Đội Vệ sinh môi trường, Đội Công viên cây xanh và Đội Xây dựng cầu đường, thoát nước, chiếu sáng.']];
    const gioiThieu = mucTrang('Giới thiệu', 'Về', 'Công ty', null, '',
      el('ol', { class: 'moc-thoi-gian' }, ...MOC.map(([n, t, m]) => el('li', {}, el('b', { text: n }), el('h3', { text: t }), el('p', { text: m })))));
    gioiThieu.id = 've-cong-ty';
    const LV = [['linh-vuc-1.jpg', 'la', 'Thực hiện công việc theo kế hoạch Ủy ban nhân dân giao hằng năm', 'Quét dọn, thu gom rác, chăm sóc công viên, cây xanh, nạo vét cống, sửa chữa hạ tầng, bảo trì hệ thống chiếu sáng công cộng.'],
      ['linh-vuc-2.jpg', 'rac', 'Thu gom rác sinh hoạt', 'Thu gom rác sinh hoạt trong hộ dân và thu phí vệ sinh theo biểu giá Ủy ban nhân dân tỉnh quy định.'],
      ['linh-vuc-3.jpg', 'cong', 'Kinh doanh dịch vụ công cộng', 'Thi công công trình cho cơ quan, đơn vị và người dân có yêu cầu, phù hợp nội dung đăng ký kinh doanh.'],
      ['linh-vuc-4.jpg', 'hop', 'Sản xuất, cung ứng vật tư, nguyên vật liệu', 'Phục vụ nhu cầu công việc của Công ty.'],
      ['linh-vuc-5.jpg', 'bia', 'Quản lý, chăm sóc nghĩa trang nhân dân', 'Nghĩa trang nhân dân thành phố Mỹ Tho.', 'Đài tưởng niệm các anh hùng liệt sĩ được Công ty trang trí hoa']];
    const linhVuc = mucTrang('Lĩnh vực hoạt động', 'Các lĩnh vực hoạt động', 'chính', null, 'muc-xanh',
      el('div', { class: 'luoi-the nam' }, ...LV.map(([f, ic, t, m, mt]) => el('article', { class: 'the' }, anh(f, mt || t), el('div', { class: 'the-chu' }, el('h3', {}, icon(ic), t), el('p', { text: m }))))),
      songDay());
    linhVuc.id = 'linh-vuc';
    const HD = [['cong-dong-1.jpg', 'Ra quân vệ sinh môi trường'], ['cong-dong-2.jpg', 'Thăm hỏi, tặng quà người có hoàn cảnh khó khăn'],
      ['cong-dong-3.jpg', 'Chương trình Phụ nữ yêu thương'], ['cong-dong-4.jpg', 'Giải bóng đá mini của đoàn viên']];
    const ANH = [['hoat-dong-1.jpg', 'Bồn hoa quanh tượng đài'], ['hoat-dong-2.jpg', 'Đường hoa dịp Tết'], ['hoat-dong-3.jpg', 'Chăm sóc thảm hoa ven đường'],
      ['hoat-dong-4.jpg', 'Thảm hoa tại quảng trường'], ['hoat-dong-5.jpg', 'Mảng xanh công viên'], ['hoat-dong-6.jpg', 'Lễ khởi công công trình']];
    const congDong = mucTrang('Cộng đồng, trách nhiệm xã hội', 'Các hoạt động', 'cộng đồng',
      'Công ty Đô thị Mỹ Tho tích cực tham gia các hoạt động cộng đồng, góp phần xây dựng thành phố xanh, sạch, đẹp.', '',
      el('div', { class: 'luoi-the hai' }, ...HD.map(([f, t]) => el('figure', { class: 'the chu-anh', style: 'margin:0' }, anh(f, t), el('p', { text: t })))));
    congDong.id = 'cong-dong';
    const hinhAnh = mucTrang('Hình ảnh', 'Đô thị', 'xanh, sạch, đẹp', 'Một số công trình cây xanh, hoa và chiếu sáng do Công ty thực hiện, chăm sóc.', 'muc-den',
      el('div', { class: 'luoi-anh' }, ...ANH.map(([f, t]) => el('figure', {}, anh(f, t), el('figcaption', { text: t })))),
      el('p', { class: 'giua' }, el('a', { class: 'nut', href: 'http://congtrinhdothimytho.tiengiang.gov.vn/thu-vien-anh', target: '_blank', rel: 'noopener' }, 'Thư viện ảnh của Công ty', el('span', { class: 'mui', text: '→' }))));
    const video = mucTrang('Truyền hình, sự kiện', 'Đồng hành cùng', 'cộng đồng', null, 'muc-kem',
      el('div', { class: 'video-luoi' },
        // Clip thật của Công ty, tệp đặt trong web/video/; trình duyệt hiện khung hình ở giây thứ 1 làm ảnh đầu
        el('div', { class: 'video-khung' }, el('video', { class: 'video-that', src: 'video/su-kien.mp4#t=1', controls: true, preload: 'metadata', playsinline: true,
          'aria-label': 'Clip hoạt động của Công ty Đô thị Mỹ Tho' }, 'Trình duyệt không phát được video.')),
        el('div', { class: 'video-chu' },
          el('p', { text: 'Luôn cập nhật những thông tin mới nhất về các hoạt động của Công ty Đô thị Mỹ Tho, góp phần xây dựng đô thị xanh, sạch, đẹp và phát triển bền vững.' }),
          el('a', { class: 'nut', href: 'http://congtrinhdothimytho.tiengiang.gov.vn/', target: '_blank', rel: 'noopener' }, 'Xem tin tức', el('span', { class: 'mui', text: '→' })))));
    hinhAnh.id = 'hinh-anh';
    trang.append(hero, gioiThieu, linhVuc, congDong, hinhAnh, video);
    demSo(trang.querySelectorAll('.thanh-so b'));
  }

  // ---------- Khung dùng chung cho 6 mục quản lý xe: đầu trang có tiêu đề lớn và bốn con số
  // oSo: [[icon, số, nhãn, 'canh' nếu cần chú ý], ...]
  function dauTrang(nhanMo, tieuDe, nhanManh, dan, oSo) {
    return el('section', { class: 'bx-dau' }, el('div', { class: 'khung-rong' },
      el('p', { class: 'nhan-mo', text: nhanMo }),
      el('h1', {}, tieuDe + ' ', el('span', { text: nhanManh })),
      el('p', { class: 'bx-dan', text: dan }),
      el('div', { class: 'bx-so' }, ...oSo.map(([ic, b, t, lop]) => el('div', { class: lop || '' }, icon(ic), el('b', { class: 'so', text: b }), el('span', { text: t }))))));
  }
  const DOI = ['Vệ sinh môi trường', 'Công viên cây xanh', 'Xây dựng cầu đường'];
  const phanTram = c => `${c >= 1 ? '+' : ''}${so((c - 1) * 100, 0)}%`;
  // Lý do cảnh báo viết bằng lời thường, không dùng tên thuật toán
  const lyDo = r => [r.vuot ? `Có tuần dùng dầu cao hơn ${so((r.max - 1) * 100, 0)}% so với mức thường ngày của chính xe` : '',
    r.x.ngay_if ? `${r.x.ngay_if} ngày tiêu hao khác hẳn các ngày còn lại trong tháng` : ''].filter(Boolean).join('. ');

  // ---------- Tổng quan
  function tongQuan() {
    const dem = { xanh: 0, vang: 0, do: 0, chua: 0 }; XE.forEach(x => dem[x.trang_thai]++);
    const lit = CB.reduce((a, x) => a + (x.lit || 0), 0);
    const kt = CB.reduce((a, x) => a + x.ngay_hd, 0) / CB.length / 31 * 100;
    const ck = canKiemTra(), kl = window.KET_LUAN || {};
    const dau = dauTrang('Quản lý xe, tháng 7/2026', 'Tổng quan', 'đội xe',
      `${XE.length} xe chuyên dùng của ba đội, ${CB.length} xe có cảm biến nhiên liệu gửi số liệu từng ngày. Trang này cho biết tháng này tốn bao nhiêu dầu, xe chạy đủ chưa và xe nào cần xem trước.`,
      [['xe', so(lit * F.gia_dau / 1e6, 1), 'Triệu đồng tiền dầu tháng 7 (25 xe có cảm biến)'], ['bieu', so(kt, 1) + '%', 'Số ngày xe có chạy trên tổng số ngày'],
        ['co_le', String(dem.do), `Xe cần kiểm tra, thêm ${ck.length - dem.do} xe theo dõi`, 'canh'], ['hop', String(XE.length - CB.length), 'Xe chưa lắp cảm biến nhiên liệu']]);
    // Việc cần xem tuần này và bản đồ đặt cạnh nhau
    const xem = el('div', { class: 'the-trang' },
      el('div', { class: 'the-trang-dau' }, el('h2', { text: 'Cần xem tuần này' }), el('a', { href: '#canh-bao', text: `Xem đủ ${ck.length} xe →` })),
      el('ol', { class: 'ds-viec' }, ...ck.slice(0, 5).map(r => el('li', {},
        el('i', { class: 'cham ' + r.x.trang_thai }),
        el('div', {}, el('b', { text: ten(r.x) }), el('small', { text: moTa(r.x) }), el('p', { text: lyDo(r) })),
        el('span', { class: 'nhan-nho ' + (kl[r.x.ma] ? 'xong' : r.x.trang_thai === 'do' ? 'cho' : ''), text: kl[r.x.ma] ? 'Đã kết luận' : r.x.trang_thai === 'do' ? 'Cần kiểm tra' : 'Theo dõi' })))));
    const banDoKhung = el('div', { class: 'the-trang the-ban-do' },
      el('div', { class: 'the-trang-dau' }, el('h2', { text: 'Bản đồ đội xe' }), el('small', { text: 'Vị trí mô phỏng, màu theo tình trạng thật' })),
      el('div', { class: 'ban-do-khung', role: 'region', 'aria-label': 'Bản đồ đội xe' }, el('div', { id: 'ban-do' })),
      el('div', { class: 'chu-giai' }, ...['xanh', 'vang', 'do', 'chua'].map(k => el('span', {}, el('i', { class: 'cham ' + k }), `${TRANG_THAI[k]}: ${dem[k]}`))));
    const haiCot = el('section', { class: 'muc muc-den' }, el('div', { class: 'khung-rong hai-cot' }, xem, banDoKhung));
    // Ba đội: số xe, khai thác, dầu
    const theDoi = DOI.map(d => {
      const xs = XE.filter(x => x.doi === d), cb = xs.filter(x => x.cam_bien), c = xs.filter(x => x.trang_thai === 'do').length;
      const ktD = cb.length ? cb.reduce((a, x) => a + x.ngay_hd, 0) / cb.length / 31 * 100 : 0;
      return el('article', { class: 'the-doi' }, el('h3', { text: 'Đội ' + d }),
        el('dl', {}, el('dt', { text: 'Số xe' }), el('dd', { text: `${xs.length} (${cb.length} có cảm biến)` }),
          el('dt', { text: 'Ngày có chạy' }), el('dd', { text: cb.length ? so(ktD, 0) + '%' : '–' }),
          el('dt', { text: 'Dầu tháng 7' }), el('dd', { text: so(cb.reduce((a, x) => a + (x.lit || 0), 0), 0) + ' lít' }),
          el('dt', { text: 'Cần kiểm tra' }), el('dd', { class: c ? 'canh' : '', text: `${c} xe` })),
        el('div', { class: 'o-vach' }, el('div', { class: 'vach nhan', style: `width:${ktD}%` })));
    });
    trang.append(dau, haiCot, mucTrang('Theo đội', 'Ba đội', 'sản xuất', null, '', el('div', { class: 'luoi-doi' }, ...theDoi)));
    demSo(trang.querySelectorAll('.bx-so b'));
    // Bản đồ: điểm xe mô phỏng trên vùng đất phía bắc sông Tiền, cố định theo mã xe
    const map = banDo('ban-do', [TRU_SO[0] + 0.006, TRU_SO[1] + 0.002], 13);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const VUNG = [[10.3605, 106.3530], [10.3650, 106.3640], [10.3700, 106.3560], [10.3590, 106.3760], [10.3665, 106.3830], [10.3745, 106.3690], [10.3560, 106.3460], [10.3720, 106.3440]];
    XE.forEach((x, i) => {
      const v = VUNG[i % VUNG.length], h = (i * 7919) % 97 / 97, k = (i * 104729) % 89 / 89;
      L.marker([v[0] + (h - .5) * 0.006, v[1] + (k - .5) * 0.008], { icon: L.divIcon({ html: el('div', { class: 'diem-xe ' + x.trang_thai }), className: '', iconSize: [14, 14], iconAnchor: [7, 7] }), title: ten(x), keyboard: true })
        .addTo(map).bindTooltip(`${ten(x)}: ${x.bien_so ? x.ten + ', ' : ''}${TRANG_THAI[x.trang_thai].toLowerCase()}`);
    });
    L.marker(TRU_SO, { icon: L.divIcon({ html: el('div', { class: 'dau-tru-so', text: 'TS' }), className: '', iconSize: [30, 30], iconAnchor: [15, 15] }), title: 'Trụ sở Công ty' })
      .addTo(map).bindTooltip('Trụ sở Công ty, Số 12 Huỳnh Tịnh Của, vị trí gần đúng');
  }

  // ---------- Tuyến GPX: nhận tệp từ app tài xế, vẽ lại tuyến, quy ra lít dầu
  function tuyenGPX() {
    const G = window.GPX, HS = 0.105;
    const ketQua = el('div', {}), tb = el('p', { class: 'da-luu', 'aria-live': 'polite' });
    const chon = el('input', { type: 'file', accept: '.gpx,application/gpx+xml,application/xml', id: 'tep-gpx', multiple: true, class: 'an-chu' });
    const khungBD = el('div', { class: 'ban-do-khung', style: 'height:480px;border-radius:10px;overflow:hidden;border:1px solid var(--vien)' }, el('div', { id: 'ban-do-gpx' }));
    trang.append(mucTrang('Lập tuyến', 'Tuyến', 'GPX', 'Mở tệp GPX do app tài xế ghi để vẽ lại tuyến đang chạy, đo quãng đường và quy ra lít dầu. Đây là bước đo mức nền trước khi tối ưu tuyến.', '',
      el('div', { class: 'hang-nut', style: 'justify-content:center;margin:0 0 22px' }, chon, el('label', { class: 'nut dac', for: 'tep-gpx' }, 'Mở tệp GPX')), tb, khungBD, ketQua));
    const map = banDo('ban-do-gpx', [TRU_SO[0] + 0.004, TRU_SO[1]], 14, { dragging: true });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const lop = L.featureGroup().addTo(map);
    const MAU = ['#0563D4', '#D64541', '#2E8B57', '#D39B1F', '#6B4FBB'];
    chon.addEventListener('change', async () => {
      lop.clearLayers(); const hang = []; let loi = 0;
      for (const [i, f] of [...chon.files].slice(0, 5).entries()) {
        if (f.size > 5e6) { loi++; continue; }
        try {
          const h = G.docTep(await f.text()), m = G.tong(h.doan), mau = MAU[i % MAU.length];
          h.doan.forEach(d => L.polyline(d.map(p => [p.lat, p.lon]), { color: mau, weight: 4 }).addTo(lop));
          h.diemDanhDau.forEach(w => L.circleMarker([w.lat, w.lon], { radius: 6, color: '#fff', fillColor: mau, fillOpacity: 1, weight: 2 }).addTo(lop).bindTooltip(w.ten));
          const t = h.doan.flat().map(p => p.t).filter(Boolean);
          hang.push([h.ten, h.doan.length, h.diemDanhDau.length, m / 1000, t.length > 1 ? (Math.max(...t) - Math.min(...t)) / 60000 : null, mau]);
        } catch (e) { loi++; }
      }
      if (lop.getLayers().length) map.fitBounds(lop.getBounds(), { padding: [30, 30] });
      tb.style.color = loi ? 'var(--do)' : ''; tb.textContent = `Đã mở ${hang.length} tệp${loi ? `, ${loi} tệp không đọc được hoặc lớn hơn 5 MB` : ''}.`;
      ketQua.replaceChildren(el('div', { class: 'bang-cuon', style: 'margin-top:22px' }, el('table', {},
        el('thead', {}, el('tr', {}, ...['Hành trình', 'Đoạn ghi', 'Điểm đánh dấu', 'Quãng đường, km', 'Thời gian, phút', 'Dầu di chuyển, lít', 'Tiền dầu, đồng'].map((x, i) => el('th', { class: i ? 'so' : '', text: x })))),
        el('tbody', {}, ...hang.map(([n, d, w, km, ph, mau]) => el('tr', {}, el('td', {}, el('i', { class: 'cham', style: `background:${mau}` }), ' ', n),
          el('td', { class: 'so', text: String(d) }), el('td', { class: 'so', text: String(w) }), el('td', { class: 'so', text: so(km, 2) }),
          el('td', { class: 'so', text: ph == null ? '–' : so(ph, 0) }), el('td', { class: 'so', text: so(km * HS, 1) }), el('td', { class: 'so', text: so(km * HS * F.gia_dau, 0) })))))),
        el('p', { class: 'ghi', text: `Dầu di chuyển tính theo hệ số 0,105 lít/km của định mức hai thành phần, chưa gồm phần dầu ép rác theo chuyến; giá ${so(F.gia_dau, 2)} đồng/lít. Tệp được đọc ngay trên máy, không gửi đi đâu.` }));
    });
  }

  // ---------- Đội xe và TCO
  function doiXe() {
    if (window.veBaiXe) window.veBaiXe(trang);
    let loc = 'Tất cả';
    const tb = el('tbody');
    const ve = () => {
      tb.replaceChildren(...XE.filter(x => loc === 'Tất cả' || x.doi === loc).map(x => el('tr', {},
        el('td', { text: x.ma }), el('td', {}, el('b', { text: ten(x) }), el('br'), x.bien_so ? x.ten : ''),
        el('td', { text: x.doi }), el('td', { class: 'so', text: String(x.nam) }), el('td', { class: 'so', text: String(x.tuoi) }),
        el('td', { class: 'so', text: so(x.nguyen_gia, 0) }), el('td', { class: 'so', text: so(x.gtcl, 0) }),
        el('td', { text: x.het_kh ? 'Đã hết' : 'Còn' }), el('td', {}, el('i', { class: 'cham ' + x.trang_thai }), ' ', TRANG_THAI[x.trang_thai]))));
    };
    const chips = el('div', { class: 'loc', role: 'group', 'aria-label': 'Lọc theo đội' }, ...['Tất cả', 'Vệ sinh môi trường', 'Công viên cây xanh', 'Xây dựng cầu đường'].map(d =>
      el('button', { class: 'chip', type: 'button', 'aria-pressed': String(d === loc), onclick: (e) => { loc = d; chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === e.currentTarget))); ve(); } }, d)));
    ve();
    const het = XE.filter(x => x.het_kh).length;
    const hang = XE.filter(x => x.diem_thay >= 2).sort((a, b) => b.diem_thay - a.diem_thay || b.tuoi - a.tuoi).slice(0, 8);
    trang.append(
      muc('Bảng tài sản', `${het}/${XE.length} xe đã khấu hao hết; nguyên giá cả đội ${so(XE.reduce((a, x) => a + x.nguyen_gia, 0) / 1000, 2)} tỷ đồng.`, false, el('details', { class: 'gon' }, el('summary', { text: 'Xem bảng nguyên giá, giá trị còn lại của 42 xe' }), chips,
        el('div', { class: 'bang-cuon' }, el('table', {}, el('thead', {}, el('tr', {}, ...['Mã', 'Xe', 'Đội', 'Năm', 'Tuổi', 'Nguyên giá', 'Còn lại', 'Khấu hao', 'Trạng thái'].map((t, i) => el('th', { class: [3, 4, 5, 6].includes(i) ? 'so' : '', text: t })))), tb)),
        el('p', { class: 'ghi', text: 'Nguyên giá và giá trị còn lại: triệu đồng, theo bảng khấu hao năm 2025. Xe mua cùng lô được chia đều nguyên giá.' }))),
      muc('Xếp hạng xem xét thay xe', 'Tuổi xe một mình chưa đủ làm căn cứ; xe được tính lại bằng tổng chi phí sở hữu khi chi phí đã ghi theo mã xe.', true,
        el('div', { class: 'ds' }, ...hang.map(x => el('div', { class: 'dong' }, el('i', { class: 'cham ' + x.trang_thai }),
          el('div', {}, el('h3', { text: ten(x) }), el('p', { text: moTa(x) })),
          el('p', { text: x.ly_do_thay.join('; ') }), el('span', { class: 'diem-cao so', text: `${x.diem_thay}/4 tiêu chí` })))),
        el('p', { class: 'ghi', text: 'Bốn tiêu chí: trên 10 năm, đã khấu hao hết, tiêu hao cao hơn cụm trên 5%, chạy dưới 16/31 ngày. Xe chưa có cảm biến chỉ xét được hai tiêu chí đầu.' })));
  }

  // ---------- Nhiên liệu và định mức
  function nhienLieu() {
    const rows = CB.filter(x => x.lit_dm).map(x => ({ x, t: x.lit_tt / x.lit_dm })).sort((a, b) => b.t - a.t);
    const tDm = rows.reduce((a, r) => a + r.x.lit_dm, 0), tTt = rows.reduce((a, r) => a + r.x.lit_tt, 0);
    const vuot = rows.filter(r => r.t > 1.05).length;
    const TRAN = 1.6;   // thanh dài nhất ứng với 160% định mức
    const soSanh = el('div', { class: 'so-sanh' },
      el('div', { class: 'so-sanh-dau' }, el('span', { text: 'Xe' }), el('span', { text: 'Dầu thực tế so với định mức cũ (vạch đứng = đúng định mức)' }), el('span', { text: 'Chênh' })),
      ...rows.map(({ x, t }) => el('div', { class: 'so-sanh-dong' + (t > 1.05 ? ' vuot' : t < .8 ? ' thap' : '') },
        el('div', {}, el('b', { text: ten(x) }), el('small', { text: `${x.ten}, ${x.doi.toLowerCase()}` })),
        el('div', { class: 'so-sanh-ray', role: 'img', 'aria-label': `Dầu thực tế bằng ${so(t * 100, 0)}% định mức` },
          el('i', { style: `width:${Math.min(t, TRAN) / TRAN * 100}%` }), el('u', { style: `left:${1 / TRAN * 100}%` })),
        el('b', { class: 'so', text: phanTram(t) }))));
    const bang = el('details', { class: 'gon' }, el('summary', { text: 'Xem bảng số lít từng xe' }),
      el('div', { class: 'bang-cuon' }, el('table', {},
        el('thead', {}, el('tr', {}, ...['Xe', 'Đội', 'Định mức cũ', 'Dầu định mức, lít', 'Dầu thực tế, lít', 'Chênh lệch', 'Tiêu hao thực tế'].map((t, i) => el('th', { class: i >= 3 ? 'so' : '', text: t })))),
        el('tbody', {}, ...rows.map(({ x, t }) => el('tr', {},
          el('td', {}, el('b', { text: ten(x) }), el('br'), x.ten), el('td', { text: x.doi }), el('td', { text: x.dm_cu ? `${so(x.dm_cu, x.dm_cu % 1 ? 2 : 0)} ${x.don_vi === 'lít/giờ' ? 'lít/giờ' : 'lít/chuyến hoặc 100 km'}` : '–' }),
          el('td', { class: 'so', text: so(x.lit_dm, 0) }), el('td', { class: 'so', text: so(x.lit_tt, 0) }),
          el('td', { class: 'so' + (t > 1.05 ? ' chu-do' : ''), text: phanTram(t) }),
          el('td', { class: 'so', text: x.tieu_hao ? `${so(x.tieu_hao, 2)} ${x.don_vi}` : '–' })))),
        el('tfoot', {}, el('tr', {}, el('td', {}, el('b', { text: 'Cộng' })), el('td'), el('td'), el('td', { class: 'so', text: so(tDm, 0) }), el('td', { class: 'so', text: so(tTt, 0) }), el('td', { class: 'so', text: phanTram(tTt / tDm) }), el('td'))))),
      el('p', { class: 'ghi', text: 'Nguồn: Biểu số 5 tháng 7/2026 và báo cáo nhiên liệu từ thiết bị giám sát hành trình.' }));
    const DM = [['Xe ép rác nhỏ', '0,105 lít/km', '+ 6,5 lít mỗi chuyến'], ['Xe ép rác lớn', '0,105 lít/km', '+ 10,5 lít mỗi chuyến'], ['Xe làm việc theo giờ', 'Theo giờ máy', 'tính riêng từng xe từ số liệu cảm biến']];
    trang.append(
      dauTrang('Quản lý xe, tháng 7/2026', 'Nhiên liệu', 'và định mức',
        `Cả đội dùng ít dầu hơn định mức cũ, nhưng vẫn có xe dùng quá. Định mức cũ đặt chung cho nhiều xe nên xe tốn dầu bị che trong số bình quân.`,
        [['xe', so(tTt, 0), `Lít dầu thực tế tháng 7, ${rows.length} xe có định mức`], ['bieu', so(tDm, 0), 'Lít dầu theo định mức cũ'],
          ['co_le', String(vuot), 'Xe dùng quá định mức trên 5%', 'canh'], ['la', phanTram(tTt / tDm), 'Cả đội so với định mức cũ']]),
      mucTrang('Từng xe', 'Xe nào', 'dùng quá định mức', 'Thanh đỏ là xe dùng quá định mức trên 5%; thanh xám nhạt là xe dùng dưới 80% định mức, thường do ít chạy trong tháng.', '', soSanh, bang),
      mucTrang('Đề xuất', 'Định mức mới', 'theo từng xe', 'Định mức hai phần: phần theo quãng đường và phần theo số chuyến ép rác. Thử lại trên số liệu cũ, định mức này lệch thực tế ' + so(F.kiem_chung.moi, 1) + '%, định mức cũ lệch ' + so(F.kiem_chung.cu, 1) + '%.', 'muc-den',
        el('div', { class: 'luoi-dm' }, ...DM.map(([t, a, b]) => el('div', { class: 'the-dm' }, el('h3', { text: t }), el('b', { text: a }), el('span', { text: b }))))));
    demSo(trang.querySelectorAll('.bx-so b'));
  }

  // ---------- Cảnh báo
  function canhBao() {
    const ck = canKiemTra(), kl = window.KET_LUAN || {};
    const LY_DO = ['Làm việc tại chỗ', 'Tuyến xa, chuyến ngoài khu vực', 'Lỗi thiết bị', 'Cần kiểm tra kỹ thuật', 'Chưa rõ, theo dõi tiếp'];
    const dsThe = el('div', { class: 'luoi-cb' }), dem = el('p', { class: 'bx-dem', 'aria-live': 'polite' });
    let loc = 'tat-ca';
    const the = ck.map(r => {
      const x = r.x, k = kl[x.ma] || {}, nang = x.trang_thai === 'do';
      const nhap = el('textarea', { 'aria-label': `Ghi chú kết luận cho xe ${ten(x)}`, maxlength: '500', placeholder: 'Ví dụ: đối chiếu nhật ký, xe cẩu rác tại chỗ 3 giờ ngày 18/7' }); nhap.value = k.ghi || '';
      const bao = el('span', { class: 'da-luu', 'aria-live': 'polite', text: k.luc ? `Đã lưu ${lucKL(k)}` : '' });
      const nhan = el('span', { class: 'nhan-nho ' + (k.luc ? 'xong' : 'cho'), text: k.luc ? 'Đã kết luận' : 'Chưa kết luận' });
      let chon = k.ly_do || '';
      const chips = el('div', { class: 'chon', role: 'group', 'aria-label': 'Nguyên nhân' }, ...LY_DO.map(l => el('button', { class: 'chip', type: 'button', 'aria-pressed': String(l === chon),
        onclick: (e) => { chon = l; chips.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === e.currentTarget))); } }, l)));
      const t = el('article', { class: 'the-cb' + (nang ? ' nang' : ''), 'data-xong': k.luc ? '1' : '' },
        el('header', {}, el('i', { class: 'cham ' + x.trang_thai }), el('div', {}, el('h3', { text: ten(x) }), el('small', { text: moTa(x) })),
          el('span', { class: 'muc-do', text: nang ? 'Cần kiểm tra' : 'Theo dõi' })),
        el('p', { class: 'ly-do', text: lyDo(r) + '.' }),
        x.chi_so_tuan.length ? null : el('p', { class: 'ghi', text: 'Xe chưa đủ số ngày chạy để tính chỉ số theo tuần.' }),
        x.chi_so_tuan.length === 0 ? null : el('div', { class: 'tuan' }, ...x.chi_so_tuan.map((c, i) => el('div', { class: c > NG ? 'vuot' : '' },
          el('i', { style: `height:${Math.min(100, Math.max(6, c / 1.5 * 100))}%` }), el('b', { text: phanTram(c) }), el('span', { text: `Tuần ${i + 1}` })))),
        el('details', { class: 'ket-luan' }, el('summary', {}, nhan, el('span', { text: k.ly_do ? `Nguyên nhân: ${k.ly_do}` : 'Ghi kết luận' })),
          chips, nhap, el('div', { class: 'chon' }, el('button', { class: 'nut dac', type: 'button', onclick: async (e) => {
            const nut = e.currentTarget; nut.disabled = true; bao.style.color = ''; bao.textContent = 'Đang lưu…';
            try {
              kl[x.ma] = await API.luuKetLuan(x.ma, { ly_do: chon, ghi: nhap.value.slice(0, 500) });
              bao.textContent = `Đã lưu ${lucKL(kl[x.ma])}`; nhan.textContent = 'Đã kết luận'; nhan.className = 'nhan-nho xong'; t.dataset.xong = '1'; capNhat();
            } catch (loi) { bao.style.color = 'var(--do)'; bao.textContent = loi.message; } finally { nut.disabled = false; } } }, 'Lưu kết luận'), bao)));
      return t;
    });
    const ve = () => { let n = 0; the.forEach(t => { const hien = loc === 'tat-ca' || (loc === 'chua') === !t.dataset.xong; t.hidden = !hien; n += hien; });
      dem.textContent = n ? `Đang hiện ${n}/${the.length} xe` : 'Không còn xe nào trong nhóm này.'; };
    const soXong = el('b', { class: 'so' });
    const capNhat = () => { soXong.textContent = String(the.filter(t => t.dataset.xong).length); ve(); };
    const chipLoc = el('div', { class: 'chon', role: 'group', 'aria-label': 'Lọc cảnh báo' }, ...[['tat-ca', 'Tất cả'], ['chua', 'Chưa kết luận'], ['xong', 'Đã kết luận']].map(([v, tx]) =>
      el('button', { class: 'chip', type: 'button', 'aria-pressed': String(v === loc), onclick: (e) => { loc = v; chipLoc.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c === e.currentTarget))); ve(); } }, tx)));
    dsThe.append(...the);
    const dau = dauTrang('Quản lý xe, tháng 7/2026', 'Cảnh báo', 'cần kiểm tra',
      `Mỗi xe được so với chính nó: dầu dùng trong tuần chia cho mức thường ngày của xe đó. Tuần nào cao hơn ${so((NG - 1) * 100, 1)}% thì xe vào danh sách. Danh sách để đối chiếu nhật ký, không dùng để xử phạt.`,
      [['co_le', String(ck.filter(r => r.x.trang_thai === 'do').length), 'Xe cần kiểm tra', 'canh'], ['bieu', String(ck.filter(r => r.x.trang_thai !== 'do').length), 'Xe theo dõi, có 1 ngày khác thường'],
        ['la', '', 'Xe đã có kết luận'], ['xe', so(F.kiem_chung.bao_nham_moi, 0) + '%', 'Tỷ lệ báo nhầm khi thử nghiệm']]);
    dau.querySelectorAll('.bx-so b')[2].replaceWith(soXong);
    trang.append(dau, el('section', { class: 'muc' }, el('div', { class: 'khung-rong' }, el('div', { class: 'thanh-loc' }, chipLoc, dem), dsThe,
      el('p', { class: 'ghi', text: 'Kết luận lưu trên máy chủ kèm tên người ghi và thời điểm; mọi lần lưu được ghi vào nhật ký.' }))));
    capNhat();
  }

  // ---------- Điều phối xe dùng chung
  function dieuPhoi() {
    const theoGio = XE.filter(x => x.cam_bien && x.don_vi === 'lít/giờ');
    const datXe = window.DAT_XE || [];
    const NGAY = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const luoi = el('div', { class: 'luoi-tuan' });
    const veLuoi = () => {
      luoi.replaceChildren(el('div', { class: 'dau-cot', text: 'Xe' }), ...NGAY.map(n => el('div', { class: 'dau-cot', text: n })),
        ...theoGio.flatMap(x => [el('div', {}, el('b', { text: ten(x) }), el('br'), x.ten),
          ...NGAY.map(n => el('div', {}, ...datXe.filter(d => d.xe === x.ma && d.ngay === n).map(d => el('div', { class: 'dat-xe', text: `${d.doi}, ${d.gio}` }))))]));
    };
    veLuoi();
    const chonXe = el('select', { id: 'f-xe' }, ...theoGio.map(x => el('option', { value: x.ma, text: `${ten(x)}, ${x.ten}` })));
    const chonDoi = el('select', { id: 'f-doi' }, ...['Công viên cây xanh', 'Xây dựng cầu đường', 'Vệ sinh môi trường'].map(d => el('option', { value: d, text: d })));
    const chonNgay = el('select', { id: 'f-ngay' }, ...NGAY.map(n => el('option', { value: n, text: n })));
    const gio = el('select', { id: 'f-gio' }, ...['Sáng 6:00–11:00', 'Chiều 13:00–17:00', 'Cả ngày'].map(g => el('option', { value: g, text: g })));
    const tb = el('p', { class: 'da-luu', 'aria-live': 'polite' });
    const form = el('form', { class: 'dang-ky', onsubmit: async (e) => {
      e.preventDefault();
      const moi = { xe: chonXe.value, doi: chonDoi.value, ngay: chonNgay.value, gio: gio.value };
      try { await API.themDatXe(moi); datXe.push(moi); veLuoi(); tb.style.color = ''; tb.textContent = 'Đã đăng ký lịch xe.'; }
      catch (loi) { tb.style.color = 'var(--do)'; tb.textContent = loi.message; } } },
      el('label', { class: 'o' }, 'Xe', chonXe), el('label', { class: 'o' }, 'Đội đăng ký', chonDoi), el('label', { class: 'o' }, 'Ngày', chonNgay), el('label', { class: 'o' }, 'Buổi', gio),
      el('button', { class: 'nut dac', type: 'submit' }, 'Đăng ký xe'));
    const kt = CB.reduce((a, x) => a + x.ngay_hd, 0) / CB.length / 31 * 100, cau = XE.find(x => x.bien_so === '63M-000.42');
    trang.append(
      dauTrang('Quản lý xe, tháng 7/2026', 'Điều phối', 'và lịch xe',
        'Xem xe nào chạy đủ ngày, xe nào nằm bãi nhiều; đăng ký xe làm theo giờ dùng chung giữa các đội; mở tệp GPX từ app tài xế để xem lại tuyến.',
        [['xe', String(theoGio.length), 'Xe làm theo giờ, điều phối chung'], ['bieu', so(kt, 1) + '%', 'Ngày có chạy, bình quân 25 xe'],
          ['co_le', String(CB.filter(x => x.ngay_hd < 16).length), 'Xe chạy dưới 16/31 ngày', 'canh'], ['hop', so(cau ? cau.gio_lv : 0, 0) + ' giờ', 'Giờ làm của xe cẩu 63M-000.42 cả tháng']]),
      muc('Khai thác tháng 7/2026', 'Mỗi ô là một ngày; ô đậm là ngày xe có hoạt động. Xe dưới 50% trong ba tháng liên tiếp được đưa vào danh sách xem xét.', false,
        ...['Vệ sinh môi trường', 'Công viên cây xanh', 'Xây dựng cầu đường'].map(d => el('div', {},
          el('h3', { class: 'tieu-de-nho', style: 'margin-top:32px', text: 'Đội ' + d }),
          ...CB.filter(x => x.doi === d).sort((a, b) => b.ngay_hd - a.ngay_hd).map(x => el('div', { class: 'thanh' },
            el('span', { text: `${ten(x)}, ${x.ten.toLowerCase()}` }),
            el('div', { class: 'o-vach' }, el('div', { class: 'lich', role: 'img', 'aria-label': `${x.ngay_hd} trên 31 ngày` }, ...x.lich.map((c, k) => el('i', { class: c ? 'co' : '', title: `Ngày ${k + 1}/7` })))),
            el('b', { class: 'so', text: `${x.ngay_hd}/31` })))))),
      muc('Lịch xe dùng chung', `Xe làm việc theo giờ được điều phối chung giữa các đội. Xe cẩu 63M-000.42 chỉ làm ${so(XE.find(x => x.bien_so === '63M-000.42')?.gio_lv ?? 0, 1)} giờ trong tháng 7/2026.`, false,
        el('div', { class: 'bang-cuon' }, luoi), datXe.length ? null : el('p', { class: 'ghi', text: 'Chưa có lịch đăng ký trong tuần. Các đội đăng ký nhu cầu xe theo tuần ở biểu mẫu dưới đây.' }), form, tb));
    tuyenGPX();
  }

  // ---------- Báo cáo trình Ban Giám đốc
  function thiDiem() {
    const max = F.chi_phi_2025[0][1], tong = F.tong_2025;
    const B = [
      ['Thử lại trên số liệu cũ', 'Đã làm', `Định mức theo từng xe lệch thực tế ${so(F.kiem_chung.moi, 1)}%, định mức cũ lệch ${so(F.kiem_chung.cu, 1)}% (20 xe).`],
      ['Thử cảnh báo với sai lệch giả lập', 'Đã làm', `Cảnh báo theo tuần bắt được ${so(F.kiem_chung.phat_hien_moi, 1)}% số lần dùng dầu cao hơn 20%, báo nhầm ${so(F.kiem_chung.bao_nham_moi, 1)}%.`],
      ['Thí điểm có nhóm so sánh', 'Chờ duyệt', `10–12 xe ép rác: 6 tuần đo như cũ, 6 tuần áp dụng định mức mới; đủ để thấy mức giảm từ khoảng ${so(F.kiem_chung.mde, 1)}%.`],
      ['Theo dõi sau khi áp dụng', 'Chưa bắt đầu', 'Mỗi quý xem lại định mức và tỷ lệ báo nhầm.']];
    const NGUONG = [['Định mức theo xe', 'Thử lại trên số liệu mỗi quý', 'Ít nhất 80% số xe lệch không quá 10%'],
      ['Tuyến, lịch điều xe', 'So với nhóm xe không đổi tuyến', 'Số km giảm rõ ràng, không do ngẫu nhiên'],
      ['Cảnh báo tự động', 'Thử với sai lệch giả lập mỗi quý', 'Bắt được ít nhất 80% lần vượt 20%, báo nhầm tối đa 10%'],
      ['Dùng chung xe giữa các đội', 'Luân phiên theo tuần', 'Xe chạy nhiều ngày hơn, các đội không phải chờ xe lâu hơn'],
      ['Bảo dưỡng theo tình trạng xe', 'So 12 tháng trước và sau', 'Số lần hỏng đột xuất trên 10.000 km giảm'],
      ['Lái xe tiết kiệm', 'So với nhóm tài xế chưa tập huấn, đo lại sau 3 tháng', 'Mức giảm dầu rõ ràng, không do ngẫu nhiên']];
    const KB = [['Mức thấp', 'Theo số liệu tháng 7/2026', '368,81', '130,31', '107,3%', 'khoảng 9 tháng'], ['Mức cao', 'Theo bình quân tháng 6–7/2025', '535,65', '297,15', '244,6%', 'khoảng 4 tháng']];
    trang.append(
      dauTrang('Báo cáo trình Ban Giám đốc', 'Báo cáo', 'chi phí và hiệu quả',
        'Chi phí đội xe năm 2025, khoản tiết kiệm dự kiến khi cấp dầu theo tiêu hao thực tế, và tiến độ kiểm chứng trước khi áp dụng cho cả đội.',
        [['bieu', so(tong / 1000, 2), 'Tỷ đồng chi phí đội xe năm 2025'], ['xe', so(F.chi_phi_2025[1][1] / tong * 100, 0) + '%', 'Phần tiền dầu trong tổng chi phí'],
          ['la', '368,81', 'Triệu đồng dầu tiết kiệm mỗi năm, mức thấp'], ['co_le', '9 tháng', 'Thời gian hoàn vốn, mức thấp']]),
      mucTrang('Chi phí 2025', 'Chi phí', 'đội xe năm 2025', `Tổng ${so(tong, 0)} triệu đồng. Lương tài xế và khấu hao chiếm 61%, phần này chỉ giảm khi bớt được số xe hoặc số ca; tiền dầu là khoản giảm được sớm nhất.`, '',
        ...F.chi_phi_2025.map(([t, v], i) => thanh(t, v, max, so(v, 0), i === 1)),
        el('p', { class: 'ghi', text: 'Đơn vị: triệu đồng. Nguồn: sổ chi phí đội xe năm 2025.' })),
      mucTrang('Hiệu quả', 'Hiệu quả', 'kinh tế', 'Cấp dầu theo tiêu hao thực tế, tính theo hai mức tiết kiệm đã đo. Hòa vốn khi tiết kiệm khoảng 1.140 lít mỗi tháng.', 'muc-den',
        el('div', { class: 'luoi-kb' }, ...KB.map(([t, n, s, r, roi, hv]) => el('article', { class: 'the-kb' },
          el('p', { class: 'nhan-muc', text: t }), el('small', { text: n }),
          el('dl', {}, el('dt', { text: 'Dầu tiết kiệm mỗi năm' }), el('dd', { text: s + ' triệu' }), el('dt', { text: 'Hiệu quả ròng' }), el('dd', { text: r + ' triệu' }),
            el('dt', { text: 'ROI' }), el('dd', { text: roi }), el('dt', { text: 'Hoàn vốn' }), el('dd', { text: hv }))))),
        el('p', { class: 'ghi', text: 'Các khoản đầu tư đã có giá đều dưới 05 tỷ đồng, thuộc thẩm quyền Chủ tịch công ty.' })),
      mucTrang('Tiến độ', 'Kiểm chứng', 'trước khi áp dụng', 'Chỉ áp dụng cho cả đội khi có bằng chứng trên số liệu và trong vận hành thật. Nếu kết quả không rõ thì kéo dài thí điểm; nếu xấu đi hoặc chất lượng dịch vụ giảm thì dừng.', '',
        el('ol', { class: 'tien-do' }, ...B.map(([t, tt, m]) => el('li', { class: tt === 'Đã làm' ? 'xong' : tt === 'Chờ duyệt' ? 'cho' : '' }, el('div', {}, el('b', { text: t }), el('small', { text: m })), el('span', { text: tt })))),
        el('details', { class: 'gon', style: 'margin-top:26px' }, el('summary', { text: 'Điều kiện để áp dụng từng giải pháp' }),
          el('div', { class: 'bang-cuon' }, el('table', {}, el('thead', {}, el('tr', {}, ...['Giải pháp', 'Cách kiểm chứng', 'Áp dụng cho cả đội khi'].map(t => el('th', { text: t })))),
            el('tbody', {}, ...NGUONG.map(r => el('tr', {}, ...r.map(c => el('td', { text: c }))))))))),
      el('p', { class: 'giua', style: 'margin:0 0 64px' }, el('button', { class: 'nut dac', type: 'button', onclick: () => window.print() }, 'In báo cáo trình Ban Giám đốc')));
    demSo(trang.querySelectorAll('.bx-so b'));
  }


  // ---------- Đăng nhập: các mục quản lý chỉ mở khi máy chủ xác nhận tài khoản quản lý
  function dangNhapTrang(id) {
    const n = window.NGUOI_DUNG;
    const loi = el('p', { class: 'loi-dn', role: 'alert', text: window.LOI_KET_NOI || '' });
    const ten = el('input', { id: 'dn-ten', name: 'username', autocomplete: 'username', required: true, maxlength: '40', autocapitalize: 'off', spellcheck: 'false' });
    const mk = el('input', { id: 'dn-mk', name: 'password', type: 'password', autocomplete: 'current-password', required: true, maxlength: '128' });
    const nut = el('button', { class: 'nut dac', type: 'submit' }, 'Đăng nhập');
    const form = el('form', { class: 'the-dang-nhap', onsubmit: async (e) => {
      e.preventDefault(); nut.disabled = true; loi.textContent = '';
      try { await API.dangNhap(ten.value, mk.value); location.reload(); }
      catch (l) { loi.textContent = l.message; mk.value = ''; mk.focus(); nut.disabled = false; } } },
      el('p', { class: 'nhan-muc', text: 'Khu vực nội bộ' }),
      el('h1', { text: 'Đăng nhập quản lý xe' }),
      el('p', { class: 'dan', text: 'Các mục Tổng quan, Cảnh báo, Đội xe, Nhiên liệu, Điều phối và Báo cáo có số liệu vận hành của Công ty, chỉ mở cho tài khoản được cấp.' }),
      window.KHONG_MAY_CHU
        ? el('div', {}, el('p', { class: 'loi-dn', text: window.LOI_KET_NOI }),
            /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && location.port !== '8770'
              ? el('a', { class: 'nut dac', href: `http://localhost:8770/web/index.html#${id}` }, 'Mở trang có máy chủ') : null)
        : n && n.vai_tro !== 'quan-ly'
        ? el('div', {}, el('p', { class: 'loi-dn', text: `Bạn đang đăng nhập bằng tài khoản tài xế ${n.ten}. Tài khoản này chỉ dùng app tài xế; đăng xuất để đăng nhập bằng tài khoản quản lý.` }),
            el('button', { class: 'nut dac', type: 'button', onclick: async () => { try { await API.dangXuat(); } finally { location.reload(); } } }, 'Đăng xuất để đổi tài khoản'))
        : el('div', {},
            // Ô tài khoản xem thử: chữ to, có nút điền sẵn, để thầy cô đăng nhập ngay
            el('div', { class: 'tk-xem-thu', role: 'note', 'aria-label': 'Tài khoản xem thử dành cho thầy cô' },
              el('p', { class: 'tk-tieu-de', text: 'Tài khoản xem thử dành cho thầy cô' }),
              el('dl', {}, el('dt', { text: 'Tên đăng nhập' }), el('dd', { text: API.XEM_THU.web.ten }),
                el('dt', { text: 'Mật khẩu' }), el('dd', { text: API.XEM_THU.web.mat_khau })),
              el('button', { class: 'nut', type: 'button', onclick: () => { ten.value = API.XEM_THU.web.ten; mk.value = API.XEM_THU.web.mat_khau; nut.focus(); } }, 'Điền sẵn tài khoản xem thử'),
              el('small', { text: 'Tài khoản này chỉ xem được 6 mục, không lưu kết luận hay đặt lịch xe.' })),
            el('label', { for: 'dn-ten', text: 'Tên đăng nhập' }), ten, el('label', { for: 'dn-mk', text: 'Mật khẩu' }), mk, loi, nut),
      el('p', { class: 'ghi', text: 'Nhập sai 5 lần liên tiếp thì tài khoản tạm khóa 15 phút. Phiên đăng nhập hết hạn sau 8 giờ.' }));
    trang.append(el('section', { class: 'muc muc-den' }, el('div', { class: 'khung-rong' }, form)));
    if (!n) setTimeout(() => ten.focus(), 50);
  }
  // Tên người đang đăng nhập và nút đăng xuất trên thanh thông báo
  if (window.NGUOI_DUNG) {
    const o = document.querySelector('.tb-phai');
    if (o) o.prepend(el('span', { class: 'tb-nguoi', text: window.NGUOI_DUNG.ten + (window.NGUOI_DUNG.chi_xem ? ' (chỉ xem)' : '') }),
      el('button', { type: 'button', class: 'tb-thoat', onclick: async () => { try { await API.dangXuat(); } finally { location.hash = 'gioi-thieu'; location.reload(); } } }, 'Đăng xuất'));
  }

  // ---------- Điều hướng theo dấu #
  // Trang chủ là Giới thiệu; '#gioi-thieu/linh-vuc' mở trang Giới thiệu rồi cuộn tới mục linh-vuc
  const TRANG = { 'gioi-thieu': congKhai, 'tong-quan': tongQuan, 'canh-bao': canhBao, 'doi-xe': doiXe, 'nhien-lieu': nhienLieu, 'dieu-phoi': dieuPhoi, 'bao-cao': thiDiem };
  const BI_DANH = { 'tuyen-gpx': 'dieu-phoi', 'thi-diem': 'bao-cao', 'bai-xe': 'doi-xe', 'linh-vuc': 'gioi-thieu/linh-vuc', 'cong-dong': 'gioi-thieu/cong-dong', 'lien-he': 'gioi-thieu/lien-he' };
  const menuXo = document.querySelector('.menu-xo');
  let dangMo = '';
  function mo() {
    let h = (location.hash || '#gioi-thieu').slice(1); h = BI_DANH[h] || h;
    let [id, neo] = h.split('/'); if (!TRANG[id]) id = 'gioi-thieu';
    const daMo = dangMo !== '';   // lần mở đầu tiên thì nhảy thẳng tới mục, không cuộn mượt
    if (id !== dangMo) { trang.replaceChildren(); if (id !== 'gioi-thieu' && !window.FLEET) dangNhapTrang(id); else TRANG[id](); dangMo = id; }
    document.querySelectorAll('.dieu-huong > a').forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + id));
    document.querySelectorAll('.dieu-huong a[aria-current]').forEach(a => a.setAttribute('aria-current', 'page'));
    if (menuXo) { menuXo.open = false; menuXo.classList.toggle('dang-xem', id === 'gioi-thieu'); }
    const dich = neo && document.getElementById(neo);
    if (dich) dich.scrollIntoView({ behavior: !daMo || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    else window.scrollTo(0, 0);
  }
  // đóng menu thả xuống khi bấm ra ngoài hoặc nhấn Esc
  document.addEventListener('click', e => { if (menuXo && menuXo.open && !menuXo.contains(e.target)) menuXo.open = false; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuXo && menuXo.open) { menuXo.open = false; menuXo.querySelector('summary').focus(); } });
  window.addEventListener('hashchange', () => { mo(); trang.focus({ preventScroll: true }); });
  mo();
  document.getElementById('tim').addEventListener('submit', (e) => {
    e.preventDefault();
    const o = document.getElementById('o-tim');
    const q = o.value.trim().toUpperCase().replace(/[^0-9A-Z]/g, '');
    if (!window.FLEET) { location.hash = 'doi-xe'; return; }   // chưa đăng nhập: đưa tới ô đăng nhập
    const x = q && XE.find(v => v.bien_so && v.bien_so.replace(/[^0-9A-Z]/g, '').includes(q));
    if (!x) { o.setCustomValidity('Không tìm thấy xe có biển số này'); o.reportValidity(); return; }
    o.setCustomValidity(''); location.hash = 'doi-xe';
    setTimeout(() => { const t = document.querySelector(`.the-xe[data-ma="${x.ma}"]`); if (t) { t.click(); t.scrollIntoView({ block: 'center' }); } }, 120);
  });
  document.getElementById('o-tim').addEventListener('input', e => e.target.setCustomValidity(''));

})();
