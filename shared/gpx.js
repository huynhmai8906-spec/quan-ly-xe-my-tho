// Tiện ích GPX dùng chung cho app tài xế và web quản trị.
// Viết mới theo logic chức năng của Open GPX Tracker (github.com/merlos/iOS-Open-GPX-Tracker): đoạn ghi tách khi tạm dừng,
// điểm đánh dấu có tên, xuất và nhập tệp GPX 1.1. Không dùng lại mã nguồn GPL của dự án đó.
window.GPX = (function () {
  const R = 6371008.8;
  const rad = d => d * Math.PI / 180;
  // Khoảng cách hai điểm theo công thức haversine, đơn vị mét
  function khoangCach(a, b) {
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const doDai = diem => diem.reduce((s, p, i) => i ? s + khoangCach(diem[i - 1], p) : 0, 0);
  const tong = doan => doan.reduce((s, d) => s + doDai(d), 0);
  const esc = s => String(s).replace(/[<>&'"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
  const so = (x, n) => Number(x).toFixed(n);
  // Tạo tệp GPX 1.1: mỗi lần tạm dừng là một trkseg mới, điểm đánh dấu là wpt
  function taoTep(hanhTrinh) {
    const wpt = hanhTrinh.diemDanhDau.map(w => `  <wpt lat="${so(w.lat, 7)}" lon="${so(w.lon, 7)}">${w.ele != null ? `<ele>${so(w.ele, 1)}</ele>` : ''}<time>${new Date(w.t).toISOString()}</time><name>${esc(w.ten)}</name></wpt>`).join('\n');
    const seg = hanhTrinh.doan.filter(d => d.length).map(d => '    <trkseg>\n' + d.map(p =>
      `      <trkpt lat="${so(p.lat, 7)}" lon="${so(p.lon, 7)}">${p.ele != null ? `<ele>${so(p.ele, 1)}</ele>` : ''}<time>${new Date(p.t).toISOString()}</time></trkpt>`).join('\n') + '\n    </trkseg>').join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Quan ly xe, Cong ty Do thi My Tho" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata><name>${esc(hanhTrinh.ten)}</name><time>${new Date(hanhTrinh.batDau || Date.now()).toISOString()}</time></metadata>
${wpt}
  <trk><name>${esc(hanhTrinh.ten)}</name>
${seg}
  </trk>
</gpx>
`;
  }
  // Đọc tệp GPX: lấy trkseg, rte và wpt; bỏ qua mọi thẻ khác, không chạy nội dung nào trong tệp
  function docTep(text) {
    const xml = new DOMParser().parseFromString(text, 'application/xml');
    if (xml.getElementsByTagName('parsererror').length) throw new Error('Tệp không phải GPX hợp lệ.');
    const pt = e => ({ lat: +e.getAttribute('lat'), lon: +e.getAttribute('lon'), ele: e.getElementsByTagName('ele')[0] ? +e.getElementsByTagName('ele')[0].textContent : null,
      t: e.getElementsByTagName('time')[0] ? Date.parse(e.getElementsByTagName('time')[0].textContent) : null });
    const ok = p => isFinite(p.lat) && isFinite(p.lon) && Math.abs(p.lat) <= 90 && Math.abs(p.lon) <= 180;
    const doan = [...xml.getElementsByTagName('trkseg')].map(s => [...s.getElementsByTagName('trkpt')].map(pt).filter(ok));
    [...xml.getElementsByTagName('rte')].forEach(r => doan.push([...r.getElementsByTagName('rtept')].map(pt).filter(ok)));
    const diemDanhDau = [...xml.getElementsByTagName('wpt')].map(e => Object.assign(pt(e), { ten: (e.getElementsByTagName('name')[0] || {}).textContent || 'Điểm' })).filter(ok);
    const ten = (xml.getElementsByTagName('name')[0] || {}).textContent || 'Hành trình';
    if (!doan.some(d => d.length) && !diemDanhDau.length) throw new Error('Tệp GPX không có điểm nào.');
    return { ten, doan: doan.filter(d => d.length), diemDanhDau };
  }
  function taiVe(ten, noiDung) {
    const url = URL.createObjectURL(new Blob([noiDung], { type: 'application/gpx+xml' }));
    const a = document.createElement('a'); a.href = url; a.download = ten.replace(/[^\w\-.]+/g, '_') + '.gpx';
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return { khoangCach, doDai, tong, taoTep, docTep, taiVe };
})();
