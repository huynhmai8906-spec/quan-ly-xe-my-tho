"""Tạo hai tài khoản để chạy thử trên máy: một quản lý, một tài xế (xe 63C-171.96).
Mật khẩu sinh ngẫu nhiên, ghi vào server/du_lieu/tai-khoan-thu.txt (thư mục không đưa lên kho).
Không dùng các tài khoản này khi chạy thật; khi chạy thật tạo tài khoản bằng server.tao_tai_khoan.

  server\\.venv\\Scripts\\python -m server.tao_tai_khoan_thu
"""
import json
import os
import secrets

from . import csdl
from .tao_tai_khoan import tao

xe = next(x['ma'] for x in json.load(open(os.path.join(csdl.THU_MUC, 'fleet.json'), encoding='utf-8'))['xe'] if x['bien_so'] == '63C-171.96')
mk_ql = secrets.token_urlsafe(12)
mk_tx = ''.join(secrets.choice('0123456789') for _ in range(6))
tao('thu-quanly', 'quan-ly', None, mk_ql)
tao('thu-taixe', 'tai-xe', xe, mk_tx)
p = os.path.join(csdl.THU_MUC, 'tai-khoan-thu.txt')
with open(p, 'w', encoding='utf-8') as f:
    f.write('Tài khoản chạy thử trên máy (không dùng khi chạy thật)\n'
            f'Quản lý (web):  thu-quanly  /  {mk_ql}\n'
            f'Tài xế (app, xe 63C-171.96):  thu-taixe  /  {mk_tx}\n')
print('Đã tạo 2 tài khoản thử; tên và mật khẩu ở', p)
