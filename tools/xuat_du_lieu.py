# -*- coding: utf-8 -*-
"""Xuất dữ liệu thật thành shared/data.js cho web quản trị và app tài xế.

Đầu vào, đều trong thư mục cha, không có họ tên tài xế:
  DU LIEU HOC MAY - XE NGAY THANG 7-2026.xlsx  sheet DATA: xe – ngày tháng 7/2026 từ thiết bị giám sát hành trình
  DU LIEU DE AN - DOI XE MY THO.xlsx           sheet SPSS_XE: 42 xe, nguyên giá, giá trị còn lại; sheet 3 dinh muc: số chuyến, định mức cũ
Cách chạy: python tools/xuat_du_lieu.py
"""
import os, re, sys, json
import numpy as np, pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UP = os.path.dirname(ROOT)
d = pd.read_excel(os.path.join(UP, 'DU LIEU HOC MAY - XE NGAY THANG 7-2026.xlsx'), sheet_name='DATA')
A = pd.read_excel(os.path.join(UP, 'DU LIEU DE AN - DOI XE MY THO.xlsx'), sheet_name='SPSS_XE')
S3 = pd.read_excel(os.path.join(UP, 'DU LIEU DE AN - DOI XE MY THO.xlsx'), sheet_name='3 dinh muc', header=None)
DOI = {1: 'Vệ sinh môi trường', 2: 'Công viên cây xanh', 3: 'Xây dựng cầu đường'}
LOAI = {1: 'Xe ép rác', 2: 'Xe hút cầu', 3: 'Xe ben, xe tải', 4: 'Xe cẩu, xe thang', 5: 'Xe bồn tưới', 6: 'Xe công trình'}

# ---- Chỉ số tuần và Isolation Forest: đúng cách tính trong kiem_chung_giai_phap.py và chay_hoc_may.py
d['U'] = np.where(d.DON_VI_DM.eq('lít/giờ'), d.GIO_LV, d.KM_GPS)
m = d[(d.HOAT_DONG == 1) & (d.LOI_TG == 0) & (d.U > 0)].copy()
m['TUAN4'] = ((m.NGAY_TT - 1) // 7).clip(upper=3)
tuan = []
for v, g in m.groupby('XE_ID'):
    if g.NGAY_TT.nunique() < 14: continue
    for w, gw in g.groupby('TUAN4'):
        rest = g[g.TUAN4 != w]; exp = gw.U.sum() * rest.LIT.sum() / rest.U.sum()
        if exp > 0 and len(gw) >= 3: tuan.append((v, int(w) + 1, float(gw.LIT.sum() / exp)))
T = pd.DataFrame(tuan, columns=['XE_ID', 'TUAN', 'CHI_SO'])
NGUONG = float(T.CHI_SO.quantile(0.95))
ml = d[d.DUNG_MAU == 1].copy()
kv = ml.KM_GPS * ml.XE_ID.map(ml.groupby('XE_ID').LIT.sum() / ml.groupby('XE_ID').KM_GPS.sum())
ml['RES_PCT'] = (ml.LIT - kv) / kv
ml['IF'] = IsolationForest(n_estimators=300, contamination=0.03, random_state=1).fit_predict(
    StandardScaler().fit_transform(ml[['L100KM', 'GIO_DUNG', 'KM_GPS', 'RES_PCT']])) == -1
IF_XE = ml.groupby('XE_ID').IF.sum()

# ---- Số chuyến tháng 7/2026 theo Biểu số 5, dùng tính hỗ trợ tài xế
CHUYEN = {}
for _, r in S3.iterrows():
    if isinstance(r[1], str) and re.match(r'^\d{2}[A-Z]', r[1]) and r[6] == 'chuyến':
        CHUYEN[r[1][:10]] = int(r[5])

CUM = {'63C-073.04': 'Xe lớn, tuyến thường', '63C-073.42': 'Xe lớn, tuyến thường', '63C-171.96': 'Xe lớn, tuyến thường',
       '63C-228.26': 'Xe lớn, tuyến thường', '63M-000.32': 'Xe lớn, tuyến thường', '63M-000.44': 'Xe lớn, tuyến thường',
       '63C-111.44': 'Xe nhỏ', '63C-112.38': 'Xe nhỏ', '66A-508.16': 'Xe nhỏ', '66A-508.36': 'Xe nhỏ',
       '63A-724.45': 'Xe lớn, tuyến dài', '63C-171.98': 'Xe lớn, tuyến dài'}
# Tiêu hao so với bình quân cụm, đúng cách tính Bảng 5.6
e = d[(d.TEN_LOAI == 'Xe ép rác') & (d.HOAT_DONG == 1) & (d.KM_GPS > 0) & d.BIEN_SO.isin(CUM)]
vc = e.groupby('BIEN_SO').agg(KM=('KM_GPS', 'sum'), LIT=('LIT', 'sum')); vc['CUM'] = vc.index.map(CUM)
vc['L100'] = vc.LIT / vc.KM * 100
vc['LECH_CUM'] = vc.L100 / vc.CUM.map(vc.groupby('CUM').LIT.sum() / vc.groupby('CUM').KM.sum() * 100) - 1


def bien_so(ten):
    m_ = re.search(r'(\d{2}[A-Z])\s*-?\s*(\d{3})\.?(\d{2})', ten.replace(' ', ''))
    return f'{m_.group(1)}-{m_.group(2)}.{m_.group(3)}' if m_ else None


# ---- 42 xe. Nối với dữ liệu cảm biến bằng mã thiết bị XE_ID_GSHT, không bằng biển số vì có xe đã đổi biển
DA_NOI = set(A.XE_ID_GSHT.dropna().astype(int))
BS_A = {bien_so(p) for t in A.TEN_XE.astype(str) for p in re.findall(r'\d{2}[A-Z]\s*-?\s*\d{3}\.?\d{2}', t.replace(' ', ''))}
MINI = sorted(int(i) for i in set(d.XE_ID.unique()) - DA_NOI if d[d.XE_ID == i].BIEN_SO.iloc[0] not in BS_A)
print('xe cam bien chua noi ma:', [(i, d[d.XE_ID == i].BIEN_SO.iloc[0], d[d.XE_ID == i].TEN_LOAI.iloc[0]) for i in MINI])
xe = []
for _, r in A.iterrows():
    ten = re.sub(r'\s+', ' ', str(r.TEN_XE)).strip()
    plates = re.findall(r'\d{2}[A-Z]\s*-?\s*\d{3}\.?\d{2}', ten.replace(' ', ''))
    n = int(r.SO_LUONG)
    for i in range(n):
        bs = bien_so(plates[i]) if i < len(plates) else None
        ten_goc = re.sub(r'\(.*?\)|\d{2}[A-Z][\s\-]*\d{3}\.?\d{2}|số|,\s', ' ', ten).replace('1,8m3', '1,8 m³')
        ten_goc = re.sub(r'\s+', ' ', ten_goc).strip()
        ten_goc = ten_goc[0].upper() + ten_goc[1:]
        if n > 1 and not bs: ten_goc = f'{ten_goc}, chiếc {i + 1}/{n}'
        # Ưu tiên biển số có trong dữ liệu cảm biến, sau đó mã thiết bị của dòng, cuối cùng là xe mini chưa nối mã
        xid = int(d[d.BIEN_SO == bs].XE_ID.iloc[0]) if bs and (d.BIEN_SO == bs).any() else None
        if xid is None and pd.notna(r.XE_ID_GSHT) and n == 1: xid = int(r.XE_ID_GSHT)
        if xid is None and 'mini' in ten and MINI: xid = MINI.pop(0)
        g = d[d.XE_ID == xid] if xid else d.iloc[0:0]
        if len(g): bs = g.BIEN_SO.iloc[0]
        theo_gio = len(g) and g.DON_VI_DM.iloc[0] == 'lít/giờ'
        gm = m[m.XE_ID == xid] if xid else m.iloc[0:0]
        ct = T[T.XE_ID == xid].sort_values('TUAN').CHI_SO.round(3).tolist() if xid else []
        xe.append(dict(
            ma=f'X{len(xe) + 1:02d}', bien_so=bs, ten=ten_goc, loai=LOAI[int(r.LOAI)], doi=DOI[int(r.DOI)],
            nam=int(r.NAM_SD), tuoi=2025 - int(r.NAM_SD), nguyen_gia=round(float(r.NGUYEN_GIA) / n, 1),
            gtcl=round(float(r.GTCL_2025) / n, 1), het_kh=bool(r.HET_KH), cam_bien=bool(len(g)),
            ngay_hd=int(g.HOAT_DONG.sum()) if len(g) else None,
            lich=[int(g[g.NGAY_TT == k].HOAT_DONG.sum() > 0) for k in range(1, 32)] if len(g) else None,
            km=round(float(g.KM_GPS.sum()), 1) if len(g) else None, lit=round(float(g.LIT.sum()), 1) if len(g) else None,
            gio_lv=round(float(g.GIO_LV.sum()), 1) if len(g) else None,
            gio_dung=round(float(g.GIO_DUNG.mean()), 1) if len(g) and g.GIO_DUNG.notna().any() else None,
            don_vi=('lít/giờ' if theo_gio else 'lít/100 km') if len(g) else None,
            tieu_hao=round(float(gm.LIT.sum() / gm.U.sum() * (1 if theo_gio else 100)), 2) if len(gm) and gm.U.sum() > 0 else None,
            dm_cu=None if pd.isna(r.DM_CU) else float(r.DM_CU), lit_dm=None if pd.isna(r.LIT_DM_T7) else round(float(r.LIT_DM_T7) / n, 1),
            lit_tt=None if pd.isna(r.LIT_TT_T7) else round(float(r.LIT_TT_T7) / n, 1),
            chi_so_tuan=ct, ngay_if=int(IF_XE.get(xid, 0)) if xid else 0, cum=CUM.get(bs),
            lech_cum=round(float(vc.LECH_CUM[bs]), 3) if bs in vc.index else None,
            chuyen_t7=CHUYEN.get(bs)))

# Trạng thái theo dữ liệu tháng 7/2026
for x in xe:
    if not x['cam_bien']: x['trang_thai'] = 'chua'
    elif any(c > NGUONG for c in x['chi_so_tuan']) or x['ngay_if'] >= 2: x['trang_thai'] = 'do'
    elif x['ngay_hd'] is not None and x['ngay_hd'] < 16: x['trang_thai'] = 'vang'
    else: x['trang_thai'] = 'xanh'

# Xếp hạng xem xét thay xe: điểm bằng số tiêu chí bất lợi, đúng các tiêu chí ở Giải pháp 5
for x in xe:
    ly = []
    if x['tuoi'] > 10: ly.append(f"{x['tuoi']} năm sử dụng")
    if x['het_kh']: ly.append('đã khấu hao hết')
    if x['lech_cum'] is not None and x['lech_cum'] > 0.05: ly.append(f"tiêu hao cao hơn cụm {x['lech_cum']*100:.1f}%".replace('.', ','))
    if x['ngay_hd'] is not None and x['ngay_hd'] < 16: ly.append(f"chạy {x['ngay_hd']}/31 ngày")
    x['diem_thay'] = len(ly); x['ly_do_thay'] = ly

OUT = dict(
    ky='Tháng 7/2026', nguong_tuan=round(NGUONG, 3), xe=xe,
    chi_phi_2025=[['Lương tài xế', 6200.45], ['Nhiên liệu', 4816.55], ['Khấu hao xe', 3754.91], ['Bảo hiểm, công đoàn tài xế', 582.60],
                  ['Dầu thủy lực, dầu mỡ, rửa xe', 494.40], ['Sửa chữa, bảo dưỡng', 299.79], ['Bảo hiểm xe, đăng kiểm, phí đường bộ', 175.00]],
    tong_2025=16323.68, gia_dau=17439.55,
    ho_tro={'Xe ép rác': [10000, 'chuyến'], 'Xe hút cầu': [10000, 'chuyến'], 'Xe ben, xe tải': [20000, 'ngày'],
            'Xe cẩu, xe thang': [20000, 'ngày'], 'Xe bồn tưới': [20000, 'ngày']},
    mo_hinh=[['Bình quân lít/km theo từng xe', 7.6], ['Gradient Boosting', 8.4], ['Hồi quy hỗn hợp', 8.5], ['Random Forest', 9.3], ['Bình quân lít/km chung', 19.1]],
    kiem_chung=dict(cu=17.6, moi=8.5, phat_hien_moi=89.2, phat_hien_cu=23.6, bao_nham_moi=5.0, bao_nham_cu=26.3, mde=2.5),
)
os.makedirs(os.path.join(ROOT, 'shared'), exist_ok=True)
with open(os.path.join(ROOT, 'shared', 'data.js'), 'w', encoding='utf-8') as f:
    f.write('// Sinh tự động bởi tools/xuat_du_lieu.py từ dữ liệu thật. Không sửa tay. Không có họ tên tài xế.\n')
    f.write('window.FLEET = ' + json.dumps(OUT, ensure_ascii=False, indent=1) + ';\n')
import collections
print(len(xe), 'xe;', collections.Counter(x['trang_thai'] for x in xe), '; nguong', round(NGUONG, 3))
print('khong bien so:', [x['ten'] for x in xe if not x['bien_so']][:20])
print('top thay:', sorted([(x['diem_thay'], x['bien_so'] or x['ten']) for x in xe], reverse=True)[:6])
print('sum ng', round(sum(x['nguyen_gia'] for x in xe), 1), 'chuyen', CHUYEN.get('63C-171.96'))


