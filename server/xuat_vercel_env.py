"""Tạo tệp server/du_lieu/vercel.env gồm 3 biến môi trường để dán vào Vercel (Settings → Environment Variables → dán nội dung .env).
Tệp nằm trong server/du_lieu nên không đưa lên kho. Chứa số liệu thật và khóa ký phiên: không gửi cho ai.

  server\\.venv\\Scripts\\python -m server.xuat_vercel_env
"""
import json
import os
import secrets

from . import csdl

so_lieu = json.dumps(json.load(open(os.path.join(csdl.THU_MUC, 'fleet.json'), encoding='utf-8')), ensure_ascii=False, separators=(',', ':'))
tai_khoan = json.dumps(json.load(open(os.path.join(csdl.THU_MUC, 'tai-khoan.json'), encoding='utf-8')), ensure_ascii=False, separators=(',', ':'))
p = os.path.join(csdl.THU_MUC, 'vercel.env')
khoa = secrets.token_urlsafe(48)
with open(p, 'w', encoding='utf-8') as f:
    f.write(f"SF_KHOA_BI_MAT={khoa}\nSF_TAI_KHOAN_JSON='{tai_khoan}'\nSF_SO_LIEU_JSON='{so_lieu}'\n")
print(f'Đã ghi {p} ({os.path.getsize(p):,} byte). Số liệu {len(so_lieu):,} ký tự; giới hạn Vercel 64 KB cho tổng các biến.')
assert "'" not in so_lieu and "'" not in tai_khoan, 'Có dấu nháy đơn trong dữ liệu, cần đổi cách bao chuỗi'
