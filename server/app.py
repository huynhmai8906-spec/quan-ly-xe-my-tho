"""Backend Quản lý xe: đăng nhập, phiên, phân quyền và API số liệu (ADR-001, ADR-005).

Chạy thử trên máy:  server\\.venv\\Scripts\\python -m uvicorn server.app:app --port 8770
Biến môi trường:
  SF_HTTPS=1              bật cờ Secure cho cookie (tự bật trên Vercel)
  SF_DU_LIEU=...          thư mục chứa smart_fleet.db và fleet.json (mặc định server/du_lieu; trên Vercel là /tmp)
  SF_KHOA_BI_MAT=...      khóa ký phiên đăng nhập (bắt buộc khi chạy nhiều bản máy chủ như Vercel)
  SF_SO_LIEU_JSON=...     nội dung fleet.json (khi nền tảng không có tệp bí mật, ví dụ Vercel)
  SF_TAI_KHOAN_JSON=...   danh sách tài khoản, chỉ mật khẩu đã băm
"""
import base64
import hmac
import hashlib
import json
import os
import secrets
import time

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

try:
    from . import csdl
except ImportError:   # nền tảng nạp app.py như tệp độc lập, không phải gói server
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import csdl

# Thư mục gốc kho (chứa web/, app/, shared/)
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Trên Render, số liệu và danh sách tài khoản (chỉ có mật khẩu đã băm) là Secret File ở /etc/secrets
TEP_SO_LIEU = os.environ.get('SF_SO_LIEU', os.path.join(csdl.THU_MUC, 'fleet.json'))
TEP_TAI_KHOAN = os.environ.get('SF_TAI_KHOAN', '')
HTTPS = os.environ.get('SF_HTTPS', '0') == '1' or bool(os.environ.get('VERCEL'))
TEN_COOKIE = 'sf_phien'
THOI_HAN_PHIEN = 8 * 3600            # một ca làm việc
SAI_TOI_DA, KHOA_GIAY = 5, 15 * 60   # sai 5 lần thì khóa tài khoản 15 phút
ph = PasswordHasher()
BAM_GIA = ph.hash(secrets.token_hex(16))   # so mật khẩu với chuỗi giả khi tài khoản không tồn tại, để thời gian trả lời như nhau

app = FastAPI(title='Quản lý xe', docs_url=None, redoc_url=None, openapi_url=None)
csdl.khoi_tao()


def nap_tai_khoan(duong_dan: str = '', noi_dung: str = ''):
    """Nạp tài khoản [{ten, mat_khau_bam, vai_tro, xe_ma}] từ tệp hoặc chuỗi JSON khi khởi động.
    Ổ đĩa của gói miễn phí (Render, Vercel) bị xóa khi khởi động lại, nên tài khoản phải nạp lại mỗi lần."""
    if noi_dung:
        ds = json.loads(noi_dung)
    elif duong_dan and os.path.isfile(duong_dan):
        with open(duong_dan, encoding='utf-8') as f:
            ds = json.load(f)
    else:
        return 0
    with csdl.ket_noi() as c:
        for t in ds:
            if t.get('vai_tro') not in ('quan-ly', 'tai-xe') or not str(t.get('mat_khau_bam', '')).startswith('$argon2'):
                continue    # bỏ qua dòng sai, không bao giờ nhận mật khẩu dạng chữ thường
            c.execute('INSERT INTO tai_khoan (ten, mat_khau_bam, vai_tro, xe_ma, tao_luc) VALUES (?, ?, ?, ?, ?) '
                      'ON CONFLICT(ten) DO UPDATE SET mat_khau_bam = excluded.mat_khau_bam, vai_tro = excluded.vai_tro, xe_ma = excluded.xe_ma',
                      (str(t['ten']).strip().lower(), t['mat_khau_bam'], t['vai_tro'], t.get('xe_ma'), time.time()))
    return len(ds)


nap_tai_khoan(TEP_TAI_KHOAN, os.environ.get('SF_TAI_KHOAN_JSON', ''))

CSP = ("default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; "
       "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; "
       "font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://tile.openstreetmap.org https://cdnjs.cloudflare.com; "
       "media-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")


@app.middleware('http')
async def dau_bao_mat(request: Request, call_next):
    # Chặn yêu cầu ghi đến từ trang khác (CSRF): cookie đã SameSite=Strict, thêm kiểm tra Origin và header riêng
    if request.method not in ('GET', 'HEAD', 'OPTIONS') and request.url.path.startswith('/api/'):
        origin = request.headers.get('origin')
        if origin and origin.rstrip('/').split('://')[-1] != request.headers.get('host', ''):
            return JSONResponse({'loi': 'Yêu cầu không hợp lệ'}, status_code=403)
        if request.headers.get('x-sf') != '1':
            return JSONResponse({'loi': 'Yêu cầu không hợp lệ'}, status_code=403)
    r = await call_next(request)
    r.headers['Content-Security-Policy'] = CSP
    r.headers['X-Content-Type-Options'] = 'nosniff'
    r.headers['X-Frame-Options'] = 'DENY'
    r.headers['Referrer-Policy'] = 'no-referrer'
    r.headers['Permissions-Policy'] = 'geolocation=(self), camera=(self), microphone=()'
    if HTTPS:
        r.headers['Strict-Transport-Security'] = 'max-age=31536000'
    if request.url.path.startswith('/api/'):
        r.headers['Cache-Control'] = 'no-store'
    return r


# ---------- Phiên đăng nhập: token ký HMAC-SHA256 (tên, hạn, mã phiên, dấu mật khẩu)
# Máy chủ tự kiểm chữ ký nên không cần lưu phiên; đổi mật khẩu thì dấu mật khẩu đổi, mọi phiên cũ mất hiệu lực.
def _khoa_ky() -> bytes:
    k = os.environ.get('SF_KHOA_BI_MAT', '')
    if k:
        return k.encode()
    p = os.path.join(csdl.THU_MUC, 'khoa-phien.bin')      # chạy trên máy: tự sinh và giữ trong thư mục dữ liệu
    if not os.path.isfile(p):
        with open(p, 'wb') as f:
            f.write(secrets.token_bytes(32))
    with open(p, 'rb') as f:
        return f.read()


KHOA_KY = _khoa_ky()


def _b64(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b'=').decode()


def _dau_mk(mat_khau_bam: str) -> str:
    return hashlib.sha256(mat_khau_bam.encode()).hexdigest()[:16]


def tao_token(ten: str, mat_khau_bam: str, het_han: float) -> str:
    than = _b64(json.dumps([ten, int(het_han), secrets.token_hex(8), _dau_mk(mat_khau_bam)], separators=(',', ':')).encode())
    return than + '.' + _b64(hmac.new(KHOA_KY, than.encode(), hashlib.sha256).digest())


def doc_token(token: str):
    try:
        than, chu_ky = token.split('.')
        if not hmac.compare_digest(chu_ky, _b64(hmac.new(KHOA_KY, than.encode(), hashlib.sha256).digest())):
            return None
        return json.loads(base64.urlsafe_b64decode(than + '=' * (-len(than) % 4)))
    except (ValueError, TypeError):
        return None


def _ip(request: Request) -> str:
    return request.client.host if request.client else ''


class NguoiDung(BaseModel):
    ten: str
    vai_tro: str
    xe_ma: str | None = None


def nguoi_dung(request: Request) -> NguoiDung:
    d = doc_token(request.cookies.get(TEN_COOKIE, ''))
    if not d or d[1] < time.time():
        raise HTTPException(401, 'Chưa đăng nhập hoặc phiên đã hết hạn')
    ten, _, ma_phien, dau = d
    with csdl.ket_noi() as c:
        t = c.execute('SELECT ten, vai_tro, xe_ma, mat_khau_bam FROM tai_khoan WHERE ten = ?', (ten,)).fetchone()
        thu_hoi = c.execute('SELECT 1 FROM phien WHERE token_bam = ?', (ma_phien,)).fetchone()
    if not t or thu_hoi or not hmac.compare_digest(dau, _dau_mk(t['mat_khau_bam'])):
        raise HTTPException(401, 'Phiên không còn hiệu lực')
    return NguoiDung(ten=t['ten'], vai_tro=t['vai_tro'], xe_ma=t['xe_ma'])


def quan_ly(n: NguoiDung = Depends(nguoi_dung)) -> NguoiDung:
    if n.vai_tro != 'quan-ly':
        raise HTTPException(403, 'Tài khoản không có quyền này')
    return n


class DangNhap(BaseModel):
    ten: str = Field(min_length=1, max_length=40)
    mat_khau: str = Field(min_length=1, max_length=128)


@app.post('/api/dang-nhap')
def dang_nhap(d: DangNhap, request: Request, response: Response):
    ten, now = d.ten.strip().lower(), time.time()
    # Lỗi được ném ra sau khi khối 'with' đã lưu, để số lần sai và nhật ký không bị mất
    loi = None
    with csdl.ket_noi() as c:
        t = c.execute('SELECT * FROM tai_khoan WHERE ten = ?', (ten,)).fetchone()
        if t and t['khoa_den'] > now:
            csdl.ghi_nhat_ky(c, ten, 'dang-nhap-bi-khoa', ip=_ip(request))
            loi = HTTPException(429, f'Tài khoản đang tạm khóa do nhập sai nhiều lần. Thử lại sau {int((t["khoa_den"] - now) // 60) + 1} phút.')
        else:
            try:
                ph.verify(t['mat_khau_bam'] if t else BAM_GIA, d.mat_khau)
                dung = t is not None
            except (VerificationError, InvalidHashError):
                dung = False
            if not dung:
                if t:
                    sai = t['sai_lien_tiep'] + 1
                    c.execute('UPDATE tai_khoan SET sai_lien_tiep = ?, khoa_den = ? WHERE ten = ?',
                              (0 if sai >= SAI_TOI_DA else sai, now + KHOA_GIAY if sai >= SAI_TOI_DA else 0, ten))
                csdl.ghi_nhat_ky(c, ten, 'dang-nhap-sai', ip=_ip(request))
                loi = HTTPException(401, 'Tên đăng nhập hoặc mật khẩu không đúng')
    if loi:
        raise loi
    with csdl.ket_noi() as c:
        if ph.check_needs_rehash(t['mat_khau_bam']):
            c.execute('UPDATE tai_khoan SET mat_khau_bam = ? WHERE ten = ?', (ph.hash(d.mat_khau), ten))
        c.execute('UPDATE tai_khoan SET sai_lien_tiep = 0, khoa_den = 0 WHERE ten = ?', (ten,))
        c.execute('DELETE FROM phien WHERE het_han < ?', (now,))
        token = tao_token(ten, t['mat_khau_bam'], now + THOI_HAN_PHIEN)
        csdl.ghi_nhat_ky(c, ten, 'dang-nhap', ip=_ip(request))
    response.set_cookie(TEN_COOKIE, token, max_age=THOI_HAN_PHIEN, httponly=True, secure=HTTPS, samesite='strict', path='/')
    return {'ten': ten, 'vai_tro': t['vai_tro'], 'xe_ma': t['xe_ma']}


@app.post('/api/dang-xuat')
def dang_xuat(request: Request, response: Response):
    # Bảng phien giờ là danh sách mã phiên đã thu hồi (đăng xuất) cho tới khi hết hạn
    d = doc_token(request.cookies.get(TEN_COOKIE, ''))
    if d:
        with csdl.ket_noi() as c:
            c.execute('INSERT OR IGNORE INTO phien (token_bam, ten, het_han, tao_luc) VALUES (?, ?, ?, ?)', (d[2], d[0], d[1], time.time()))
    response.delete_cookie(TEN_COOKIE, path='/', httponly=True, secure=HTTPS, samesite='strict')
    return {'ok': True}


@app.get('/api/toi')
def toi(n: NguoiDung = Depends(nguoi_dung)):
    return n


# ---------- Số liệu: quản lý xem cả đội, tài xế chỉ xem xe được giao
_SO_LIEU = None


def _so_lieu():
    global _SO_LIEU
    if _SO_LIEU is None:
        if os.environ.get('SF_SO_LIEU_JSON'):
            _SO_LIEU = json.loads(os.environ['SF_SO_LIEU_JSON'])
        else:
            with open(TEP_SO_LIEU, encoding='utf-8') as f:
                _SO_LIEU = json.load(f)
    return json.loads(json.dumps(_SO_LIEU))   # bản sao, để lọc theo vai trò không sửa bản gốc


@app.get('/api/du-lieu')
def du_lieu(request: Request, n: NguoiDung = Depends(nguoi_dung)):
    d = _so_lieu()
    if n.vai_tro == 'tai-xe':
        d = {'gia_dau': d['gia_dau'], 'nguong_tuan': d['nguong_tuan'], 'ho_tro': d['ho_tro'],
             'xe': [x for x in d['xe'] if x['ma'] == n.xe_ma]}
    with csdl.ket_noi() as c:
        csdl.ghi_nhat_ky(c, n.ten, 'xem-du-lieu', ip=_ip(request))
    return d


# ---------- Kết luận cảnh báo (chỉ quản lý), có tên người ghi và thời điểm
LY_DO = {'Làm việc tại chỗ', 'Tuyến xa, chuyến ngoài khu vực', 'Lỗi thiết bị', 'Cần kiểm tra kỹ thuật', 'Chưa rõ, theo dõi tiếp', ''}


class KetLuan(BaseModel):
    ly_do: str = Field(max_length=60)
    ghi: str = Field(default='', max_length=500)


def _xe_hop_le(ma: str) -> bool:
    return any(x['ma'] == ma for x in _so_lieu()['xe'])


@app.get('/api/ket-luan')
def ds_ket_luan(n: NguoiDung = Depends(quan_ly)):
    with csdl.ket_noi() as c:
        return {r['xe_ma']: {'ly_do': r['ly_do'], 'ghi': r['ghi'], 'nguoi': r['nguoi'], 'luc': r['luc']}
                for r in c.execute('SELECT * FROM ket_luan')}


@app.put('/api/ket-luan/{xe_ma}')
def luu_ket_luan(xe_ma: str, k: KetLuan, request: Request, n: NguoiDung = Depends(quan_ly)):
    if k.ly_do not in LY_DO or not _xe_hop_le(xe_ma):
        raise HTTPException(422, 'Dữ liệu không hợp lệ')
    now = time.time()
    with csdl.ket_noi() as c:
        c.execute('INSERT INTO ket_luan (xe_ma, ly_do, ghi, nguoi, luc) VALUES (?, ?, ?, ?, ?) '
                  'ON CONFLICT(xe_ma) DO UPDATE SET ly_do = excluded.ly_do, ghi = excluded.ghi, nguoi = excluded.nguoi, luc = excluded.luc',
                  (xe_ma, k.ly_do, k.ghi, n.ten, now))
        csdl.ghi_nhat_ky(c, n.ten, 'ket-luan', f'{xe_ma}: {k.ly_do}', _ip(request))
    return {'ly_do': k.ly_do, 'ghi': k.ghi, 'nguoi': n.ten, 'luc': now}


# ---------- Lịch xe dùng chung (chỉ quản lý); máy chủ kiểm tra trùng lịch
NGAY = {'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'}
BUOI = {'Sáng 6:00–11:00', 'Chiều 13:00–17:00', 'Cả ngày'}
DOI = {'Công viên cây xanh', 'Xây dựng cầu đường', 'Vệ sinh môi trường'}


class DatXe(BaseModel):
    xe: str = Field(max_length=10)
    doi: str = Field(max_length=40)
    ngay: str = Field(max_length=10)
    gio: str = Field(max_length=30)


@app.get('/api/dat-xe')
def ds_dat_xe(n: NguoiDung = Depends(quan_ly)):
    with csdl.ket_noi() as c:
        return [{'xe': r['xe_ma'], 'doi': r['doi'], 'ngay': r['ngay'], 'gio': r['buoi'], 'nguoi': r['nguoi']}
                for r in c.execute('SELECT * FROM dat_xe ORDER BY id')]


@app.post('/api/dat-xe')
def dat_xe(d: DatXe, request: Request, n: NguoiDung = Depends(quan_ly)):
    if d.ngay not in NGAY or d.gio not in BUOI or d.doi not in DOI or not _xe_hop_le(d.xe):
        raise HTTPException(422, 'Dữ liệu không hợp lệ')
    with csdl.ket_noi() as c:
        trung = c.execute("SELECT 1 FROM dat_xe WHERE xe_ma = ? AND ngay = ? AND (buoi = ? OR buoi = 'Cả ngày' OR ? = 'Cả ngày')",
                          (d.xe, d.ngay, d.gio, d.gio)).fetchone()
        if trung:
            raise HTTPException(409, 'Xe đã có lịch trùng buổi này. Chọn buổi khác hoặc xe khác.')
        c.execute('INSERT INTO dat_xe (xe_ma, doi, ngay, buoi, nguoi, luc) VALUES (?, ?, ?, ?, ?, ?)', (d.xe, d.doi, d.ngay, d.gio, n.ten, time.time()))
        csdl.ghi_nhat_ky(c, n.ten, 'dat-xe', f'{d.xe} {d.ngay} {d.gio}', _ip(request))
    return {'ok': True}


# ---------- Báo sự cố (tài xế, chỉ cho xe được giao)
class SuCo(BaseModel):
    loai: str = Field(max_length=40)
    ghi: str = Field(default='', max_length=300)


@app.post('/api/su-co')
def bao_su_co(s: SuCo, request: Request, n: NguoiDung = Depends(nguoi_dung)):
    if n.vai_tro != 'tai-xe' or not n.xe_ma:
        raise HTTPException(403, 'Chỉ tài khoản tài xế được báo sự cố')
    if s.loai not in {'Xe hỏng', 'Tắc đường', 'Lỗi cảm biến, thiết bị', 'Điểm tập kết ùn ứ'}:
        raise HTTPException(422, 'Dữ liệu không hợp lệ')
    with csdl.ket_noi() as c:
        c.execute('INSERT INTO su_co (xe_ma, loai, ghi, nguoi, luc) VALUES (?, ?, ?, ?, ?)', (n.xe_ma, s.loai, s.ghi, n.ten, time.time()))
        csdl.ghi_nhat_ky(c, n.ten, 'su-co', s.loai, _ip(request))
    return {'ok': True}


# ---------- Tệp giao diện: chỉ phục vụ ba thư mục này, không lộ server/, docs/, tools/
for thu_muc in ('web', 'app', 'shared'):
    if os.path.isdir(os.path.join(GOC, thu_muc)):
        app.mount(f'/{thu_muc}', StaticFiles(directory=os.path.join(GOC, thu_muc), html=True), name=thu_muc)


@app.get('/')
def trang_chu():
    return RedirectResponse('/web/index.html')
