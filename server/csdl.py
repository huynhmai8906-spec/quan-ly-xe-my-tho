"""Cơ sở dữ liệu SQLite cho giai đoạn thử (ADR-005). Mọi truy vấn dùng tham số, không ghép chuỗi."""
import os
import sqlite3
import time
from contextlib import contextmanager

THU_MUC = os.environ.get('SF_DU_LIEU', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'du_lieu'))
DUONG_DAN = os.path.join(THU_MUC, 'smart_fleet.db')

LUOC_DO = """
CREATE TABLE IF NOT EXISTS tai_khoan (
  ten TEXT PRIMARY KEY,
  mat_khau_bam TEXT NOT NULL,
  vai_tro TEXT NOT NULL CHECK (vai_tro IN ('quan-ly', 'tai-xe')),
  xe_ma TEXT,
  sai_lien_tiep INTEGER NOT NULL DEFAULT 0,
  khoa_den REAL NOT NULL DEFAULT 0,
  tao_luc REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS phien (
  token_bam TEXT PRIMARY KEY,
  ten TEXT NOT NULL REFERENCES tai_khoan(ten) ON DELETE CASCADE,
  het_han REAL NOT NULL,
  tao_luc REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS ket_luan (
  xe_ma TEXT PRIMARY KEY,
  ly_do TEXT NOT NULL,
  ghi TEXT NOT NULL,
  nguoi TEXT NOT NULL,
  luc REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS dat_xe (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  xe_ma TEXT NOT NULL,
  doi TEXT NOT NULL,
  ngay TEXT NOT NULL,
  buoi TEXT NOT NULL,
  nguoi TEXT NOT NULL,
  luc REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS su_co (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  xe_ma TEXT NOT NULL,
  loai TEXT NOT NULL,
  ghi TEXT NOT NULL,
  nguoi TEXT NOT NULL,
  luc REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS nhat_ky (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  luc REAL NOT NULL,
  ten TEXT,
  hanh_dong TEXT NOT NULL,
  chi_tiet TEXT,
  ip TEXT
);
"""


def khoi_tao():
    os.makedirs(THU_MUC, exist_ok=True)
    with ket_noi() as c:
        c.executescript(LUOC_DO)


@contextmanager
def ket_noi():
    c = sqlite3.connect(DUONG_DAN, timeout=10)
    c.row_factory = sqlite3.Row
    c.execute('PRAGMA foreign_keys = ON')
    try:
        yield c
        c.commit()
    finally:
        c.close()


def ghi_nhat_ky(c, ten, hanh_dong, chi_tiet='', ip=''):
    c.execute('INSERT INTO nhat_ky (luc, ten, hanh_dong, chi_tiet, ip) VALUES (?, ?, ?, ?, ?)',
              (time.time(), ten, hanh_dong, chi_tiet[:300], ip))
