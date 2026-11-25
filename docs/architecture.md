# Kiến trúc và tech stack

Trạng thái: đề xuất, chờ duyệt. Các quyết định ghi ở decisions.md.

## Sơ đồ

```
Thiết bị GSHT, cảm biến ──(file Excel hoặc API)──> Nạp dữ liệu, kiểm tra chất lượng
                                                       │
                                                       v
                                          PostgreSQL: xe, xe_ngay, canh_bao, ket_luan, nhat_ky
                                                       │
                                     Tác vụ hằng tuần: chỉ số tiêu hao, Isolation Forest, khai thác
                                                       │
                                                       v
                                      API FastAPI (phân quyền, ghi nhật ký) ──> Web quản lý
                                                                             └─> Ứng dụng tài xế (web trên điện thoại)
```

## Thành phần

| Lớp | Lựa chọn | Lý do |
|---|---|---|
| Backend | Python 3.12, FastAPI | Cùng ngôn ngữ với các script phân tích đã kiểm chứng; dùng lại pandas, scikit-learn |
| Cơ sở dữ liệu | PostgreSQL, giai đoạn thử dùng SQLite | Dữ liệu dạng bảng, có quan hệ xe – ngày |
| Phân tích | pandas, scikit-learn, statsmodels | Đã chạy ra số liệu trong đề án |
| Frontend | HTML, CSS, JavaScript thuần; Leaflet cho bản đồ | Nhẹ, không cần build, nhân viên Công ty bảo trì được |
| Bản đồ | Leaflet với tile OpenStreetMap | Không tốn phí bản quyền |
| Xác thực | Tài khoản nội bộ, mật khẩu băm bằng argon2, phiên có hạn | Không phụ thuộc dịch vụ ngoài |

## Bảo mật, theo bộ kiểm tra claude-security

- Không để khóa, mật khẩu trong mã nguồn; dùng biến môi trường.
- Mọi truy vấn cơ sở dữ liệu dùng tham số, không ghép chuỗi.
- Kiểm tra file nạp lên: chỉ nhận .xlsx, giới hạn kích thước, đọc bằng chế độ chỉ lấy giá trị, không chạy macro.
- Phân quyền ở phía máy chủ theo vai trò; tài xế chỉ đọc dữ liệu của xe được giao.
- Content-Security-Policy chỉ cho phép nguồn script, font, tile bản đồ đã liệt kê.
- Ghi nhật ký ai xem dữ liệu vị trí, khi nào.
- Dữ liệu vị trí lưu có thời hạn; bảng phân tích chỉ dùng mã xe, không dùng họ tên.
