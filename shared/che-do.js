// Đặt chế độ sáng hoặc tối trước khi vẽ trang để không nháy màu. Lưu lựa chọn trên máy, bọc try vì trình duyệt có thể chặn.
(function () {
  let m = 'sang';
  try { m = localStorage.getItem('sf.che-do') || 'sang'; } catch (e) {}
  if (/[?&]che-do=(sang|toi)/.test(location.search)) m = location.search.match(/che-do=(sang|toi)/)[1];
  document.documentElement.setAttribute('data-che-do', m);
  document.addEventListener('DOMContentLoaded', () => {
    const nut = document.querySelectorAll('[data-che-do]:not(html)');
    const dat = (v) => {
      document.documentElement.setAttribute('data-che-do', v);
      nut.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cheDo === v)));
      try { localStorage.setItem('sf.che-do', v); } catch (e) {}
    };
    nut.forEach(b => b.addEventListener('click', () => dat(b.dataset.cheDo)));
    dat(document.documentElement.getAttribute('data-che-do'));
  });
})();
