"""Tạo hoặc đặt lại tài khoản. Mật khẩu gõ khi chạy (không hiện, không lưu trong mã), lưu dạng băm argon2.

  server\\.venv\\Scripts\\python -m server.tao_tai_khoan quanly01 quan-ly
  server\\.venv\\Scripts\\python -m server.tao_tai_khoan taixe01 tai-xe X05
"""
import getpass
import sys
import time

from argon2 import PasswordHasher

from . import csdl


def tao(ten, vai_tro, xe_ma, mat_khau):
    ten = ten.strip().lower()
    if vai_tro not in ('quan-ly', 'tai-xe'):
        raise ValueError('Vai trò là quan-ly hoặc tai-xe')
    if vai_tro == 'tai-xe' and not xe_ma:
        raise ValueError('Tài khoản tài xế cần mã xe được giao, ví dụ X05')
    toi_thieu = 6 if vai_tro == 'tai-xe' else 10
    if len(mat_khau) < toi_thieu:
        raise ValueError(f'Mật khẩu cần ít nhất {toi_thieu} ký tự')
    csdl.khoi_tao()
    with csdl.ket_noi() as c:
        c.execute('INSERT INTO tai_khoan (ten, mat_khau_bam, vai_tro, xe_ma, tao_luc) VALUES (?, ?, ?, ?, ?) '
                  'ON CONFLICT(ten) DO UPDATE SET mat_khau_bam = excluded.mat_khau_bam, vai_tro = excluded.vai_tro, '
                  'xe_ma = excluded.xe_ma, sai_lien_tiep = 0, khoa_den = 0',
                  (ten, PasswordHasher().hash(mat_khau), vai_tro, xe_ma if vai_tro == 'tai-xe' else None, time.time()))
        c.execute('DELETE FROM phien WHERE ten = ?', (ten,))   # đổi mật khẩu thì đăng xuất mọi phiên cũ
        csdl.ghi_nhat_ky(c, 'he-thong', 'tao-tai-khoan', f'{ten} ({vai_tro})')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    ten, vai_tro, xe_ma = sys.argv[1], sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else None)
    mk = getpass.getpass('Mật khẩu (tài xế: ít nhất 6 số; quản lý: ít nhất 10 ký tự): ')
    if mk != getpass.getpass('Nhập lại: '):
        sys.exit('Hai lần nhập không khớp.')
    tao(ten, vai_tro, xe_ma, mk)
    print(f'Đã lưu tài khoản {ten.strip().lower()} ({vai_tro}).')
