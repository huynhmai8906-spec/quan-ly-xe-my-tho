"""Xuất danh sách tài khoản (chỉ mật khẩu đã băm argon2, không có mật khẩu thật) ra server/du_lieu/tai-khoan.json
để tải lên Render làm Secret File. Tạo hoặc đổi tài khoản trước bằng server.tao_tai_khoan rồi chạy lại lệnh này.

  server\\.venv\\Scripts\\python -m server.xuat_tai_khoan
"""
import json
import os

from . import csdl

with csdl.ket_noi() as c:
    ds = [{'ten': r['ten'], 'mat_khau_bam': r['mat_khau_bam'], 'vai_tro': r['vai_tro'], 'xe_ma': r['xe_ma']}
          for r in c.execute('SELECT ten, mat_khau_bam, vai_tro, xe_ma FROM tai_khoan ORDER BY ten')]
p = os.path.join(csdl.THU_MUC, 'tai-khoan.json')
with open(p, 'w', encoding='utf-8') as f:
    json.dump(ds, f, ensure_ascii=False, indent=1)
print(f'Đã xuất {len(ds)} tài khoản ra {p}')
