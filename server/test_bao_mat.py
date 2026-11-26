"""Kiểm thử bảo mật backend. Chạy: server\\.venv\\Scripts\\python -m pytest server -q"""
import importlib
import json
import os
import shutil
import sys

import pytest
from fastapi.testclient import TestClient

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MK_QL, MK_TX = 'thu-quan-ly-' + os.urandom(4).hex(), '73' + str(int.from_bytes(os.urandom(3), 'big')).zfill(7)
H = {'X-SF': '1'}


@pytest.fixture()
def c(tmp_path, monkeypatch):
    # Cơ sở dữ liệu tạm cho mỗi bài thử; số liệu chép từ server/du_lieu/fleet.json
    shutil.copy(os.path.join(GOC, 'server', 'du_lieu', 'fleet.json'), tmp_path / 'fleet.json')
    monkeypatch.setenv('SF_DU_LIEU', str(tmp_path))
    for m in [k for k in sys.modules if k.startswith('server')]:
        del sys.modules[m]
    app_mod = importlib.import_module('server.app')
    tk = importlib.import_module('server.tao_tai_khoan')
    xe = json.load(open(tmp_path / 'fleet.json', encoding='utf-8'))['xe'][0]['ma']
    tk.tao('ql1', 'quan-ly', None, MK_QL)
    tk.tao('tx1', 'tai-xe', xe, MK_TX)
    return TestClient(app_mod.app, base_url='http://testserver')


def dn(c, ten, mk):
    return c.post('/api/dang-nhap', json={'ten': ten, 'mat_khau': mk}, headers=H)


def test_chua_dang_nhap_khong_xem_duoc_so_lieu(c):
    for p in ('/api/du-lieu', '/api/ket-luan', '/api/dat-xe', '/api/toi'):
        assert c.get(p).status_code == 401


def test_tep_noi_bo_khong_bi_phuc_vu(c):
    for p in ('/server/app.py', '/server/du_lieu/fleet.json', '/server/du_lieu/smart_fleet.db', '/shared/data.js', '/tools/xuat_du_lieu.py', '/docs/progress.md', '/.git/config'):
        assert c.get(p).status_code == 404, p


def test_sai_mat_khau_va_khoa_tai_khoan(c):
    assert dn(c, 'ql1', 'sai').status_code == 401
    assert dn(c, 'khong-co', 'sai').status_code == 401          # cùng thông báo, không lộ tài khoản có tồn tại hay không
    for _ in range(4):
        dn(c, 'ql1', 'sai')
    r = dn(c, 'ql1', MK_QL)                                       # đúng mật khẩu nhưng đang bị khóa
    assert r.status_code == 429


def test_cookie_phien_an_toan(c):
    r = dn(c, 'ql1', MK_QL)
    assert r.status_code == 200
    ck = r.headers['set-cookie'].lower()
    assert 'httponly' in ck and 'samesite=strict' in ck and 'max-age=28800' in ck
    assert 'mat_khau' not in r.text and MK_QL not in r.text


def test_quan_ly_xem_ca_doi(c):
    dn(c, 'ql1', MK_QL)
    assert len(c.get('/api/du-lieu').json()['xe']) == 42


def test_tai_xe_chi_xem_xe_minh_va_khong_vao_muc_quan_ly(c):
    dn(c, 'tx1', MK_TX)
    d = c.get('/api/du-lieu').json()
    assert len(d['xe']) == 1 and 'chi_phi_2025' not in d
    assert c.get('/api/ket-luan').status_code == 403
    assert c.put('/api/ket-luan/X01', json={'ly_do': 'Lỗi thiết bị', 'ghi': ''}, headers=H).status_code == 403


def test_chong_csrf(c):
    dn(c, 'ql1', MK_QL)
    body = {'ly_do': 'Lỗi thiết bị', 'ghi': 'x'}
    assert c.put('/api/ket-luan/X01', json=body).status_code == 403                                          # thiếu header X-SF
    assert c.put('/api/ket-luan/X01', json=body, headers={**H, 'Origin': 'https://trang-la.example'}).status_code == 403
    assert c.put('/api/ket-luan/X01', json=body, headers={**H, 'Origin': 'http://testserver'}).status_code == 200


def test_ket_luan_ghi_ten_nguoi_va_kiem_tra_dau_vao(c):
    dn(c, 'ql1', MK_QL)
    r = c.put('/api/ket-luan/X01', json={'ly_do': 'Lỗi thiết bị', 'ghi': '<script>alert(1)</script>'}, headers=H)
    assert r.json()['nguoi'] == 'ql1'
    assert c.put('/api/ket-luan/X01', json={'ly_do': 'tùy ý', 'ghi': ''}, headers=H).status_code == 422
    assert c.put("/api/ket-luan/X01' OR 1=1--", json={'ly_do': 'Lỗi thiết bị', 'ghi': ''}, headers=H).status_code == 422
    assert c.put('/api/ket-luan/X01', json={'ly_do': 'Lỗi thiết bị', 'ghi': 'a' * 501}, headers=H).status_code == 422


def test_dat_xe_trung_lich_bi_chan_o_may_chu(c):
    dn(c, 'ql1', MK_QL)
    xe = c.get('/api/du-lieu').json()['xe'][0]['ma']
    d = {'xe': xe, 'doi': 'Công viên cây xanh', 'ngay': 'Thứ hai', 'gio': 'Cả ngày'}
    assert c.post('/api/dat-xe', json=d, headers=H).status_code == 200
    assert c.post('/api/dat-xe', json={**d, 'gio': 'Sáng 6:00–11:00'}, headers=H).status_code == 409


def test_dang_xuat_huy_phien(c):
    dn(c, 'ql1', MK_QL)
    tok = c.cookies.get('sf_phien')
    c.post('/api/dang-xuat', headers=H)
    c.cookies.set('sf_phien', tok)                                 # dùng lại token cũ
    assert c.get('/api/du-lieu').status_code == 401


def test_token_gia_bi_tu_choi(c):
    c.cookies.set('sf_phien', 'gia-mao')
    assert c.get('/api/du-lieu').status_code == 401


def test_header_bao_mat(c):
    r = c.get('/web/index.html')
    assert "frame-ancestors 'none'" in r.headers['content-security-policy']
    assert r.headers['x-frame-options'] == 'DENY' and r.headers['x-content-type-options'] == 'nosniff'
    dn(c, 'ql1', MK_QL)
    assert c.get('/api/du-lieu').headers['cache-control'] == 'no-store'


def test_nap_tai_khoan_chi_nhan_mat_khau_da_bam(tmp_path, c):
    import server.app as a
    from argon2 import PasswordHasher
    p = tmp_path / 'tk.json'
    p.write_text(json.dumps([{'ten': 'moi', 'mat_khau_bam': PasswordHasher().hash('mat-khau-moi-123'), 'vai_tro': 'quan-ly'},
                             {'ten': 'chu-thuong', 'mat_khau_bam': 'mat-khau-chu-thuong', 'vai_tro': 'quan-ly'}]), encoding='utf-8')
    a.nap_tai_khoan(str(p))
    assert dn(c, 'moi', 'mat-khau-moi-123').status_code == 200
    assert dn(c, 'chu-thuong', 'mat-khau-chu-thuong').status_code == 401


def _ban_may_chu(tmp, monkeypatch, khoa, so_lieu_json, tk_json):
    # Một "bản máy chủ" mới: cơ sở dữ liệu riêng, số liệu và tài khoản lấy từ biến môi trường như trên Vercel
    monkeypatch.setenv('SF_DU_LIEU', str(tmp)); monkeypatch.setenv('SF_KHOA_BI_MAT', khoa)
    monkeypatch.setenv('SF_SO_LIEU_JSON', so_lieu_json); monkeypatch.setenv('SF_TAI_KHOAN_JSON', tk_json)
    for m in [k for k in sys.modules if k.startswith('server')]:
        del sys.modules[m]
    return TestClient(importlib.import_module('server.app').app, base_url='https://quan-ly-xe.vercel.app')


def test_phien_dung_duoc_giua_cac_ban_may_chu(tmp_path, monkeypatch):
    from argon2 import PasswordHasher
    so_lieu = json.dumps(json.load(open(os.path.join(GOC, 'server', 'du_lieu', 'fleet.json'), encoding='utf-8')), ensure_ascii=False, separators=(',', ':'))
    tk = json.dumps([{'ten': 'ql', 'mat_khau_bam': PasswordHasher().hash(MK_QL), 'vai_tro': 'quan-ly'}])
    (tmp_path / 'a').mkdir(); (tmp_path / 'b').mkdir(); (tmp_path / 'c').mkdir()
    a = _ban_may_chu(tmp_path / 'a', monkeypatch, 'khoa-chung-' + 'x' * 32, so_lieu, tk)
    assert dn(a, 'ql', MK_QL).status_code == 200
    tok = a.cookies.get('sf_phien')
    b = _ban_may_chu(tmp_path / 'b', monkeypatch, 'khoa-chung-' + 'x' * 32, so_lieu, tk)
    b.cookies.set('sf_phien', tok)
    assert len(b.get('/api/du-lieu').json()['xe']) == 42             # bản khác, cùng khóa: phiên vẫn dùng được
    c = _ban_may_chu(tmp_path / 'c', monkeypatch, 'khoa-khac-' + 'y' * 32, so_lieu, tk)
    c.cookies.set('sf_phien', tok)
    assert c.get('/api/du-lieu').status_code == 401                   # khóa khác: token bị từ chối
    than, ky = tok.split('.')
    b.cookies.set('sf_phien', than[:-2] + 'AA.' + ky)
    assert b.get('/api/du-lieu').status_code == 401                   # sửa nội dung token: chữ ký sai


def test_doi_mat_khau_lam_mat_phien_cu(c):
    dn(c, 'ql1', MK_QL)
    import server.tao_tai_khoan as tk
    tk.tao('ql1', 'quan-ly', None, 'mat-khau-moi-' + os.urandom(4).hex())
    assert c.get('/api/du-lieu').status_code == 401
