# Tiến độ

## Giai đoạn hiện tại

Giai đoạn 1–4 đã có bản đề xuất, chờ người dùng duyệt. Chưa sang giai đoạn 5.

| Giai đoạn | Tài liệu | Trạng thái |
|---|---|---|
| 1. Yêu cầu | requirements.md | Chờ duyệt; 4 câu hỏi mở |
| 2. Kiến trúc | architecture.md, decisions.md | Chờ duyệt ADR-001, ADR-002 |
| 3. Quy ước | conventions.md | Chờ duyệt |
| 4. Giao diện mẫu | ui-design.md, mockups/index.html, mockups/tai-xe.html | Chờ duyệt |
| 5. Code | | Chưa bắt đầu |

## Backlog giai đoạn 5, theo thứ tự đề xuất

1. Backend FastAPI, SQLite: bảng xe, xe_ngay; nạp file Excel từ thiết bị (F10).
2. Tính chỉ số tuần và Isolation Forest từ dữ liệu nạp; API cảnh báo (F04, F05).
3. Đăng nhập, phân quyền, nhật ký truy cập (F11).
4. Màn hình Cần kiểm tra có lưu kết luận thật (F04).
5. Khai thác, chi phí, mô hình (F01, F03, F06).
6. Ứng dụng tài xế (F02, F09); lập tuyến khi có tài liệu tuyến (F07).
7. Đánh giá thí điểm khác biệt kép (F08).

## Nhật ký phiên

- 25/11/2026: xem web Công ty, trang mẫu Trung Nguyên Legend, ảnh mẫu bản đồ hành trình, repo agent-skills; dựng tài liệu giai đoạn 1–4 và giao diện mẫu chạy bằng dữ liệu thật tháng 7/2026. Chạy xem: `python -m http.server 8765 --directory mockups` rồi mở http://localhost:8765.

## Bước tiếp theo

Người dùng duyệt giai đoạn 1–4 và trả lời 4 câu hỏi mở trong requirements.md.

## 26/11/2026: tách trang giới thiệu và Smart Fleet
- `web/index.html`: trang giới thiệu công khai, 4 mục (Giới thiệu, Lĩnh vực hoạt động, Cộng đồng, Liên hệ), nút "Đăng nhập Smart Fleet". Không còn bản đồ, cảnh báo, ô tìm biển số, hộp lời dẫn 82%.
- `web/smart-fleet.html`: phân hệ nội bộ, 6 mục (Tổng quan, Cảnh báo, Đội xe, Nhiên liệu, Điều phối, Báo cáo). Đường dẫn cũ #thi-diem, #tuyen-gpx, #bai-xe tự chuyển sang mục mới.
- Bãi xe gộp vào Đội xe (`bai-xe.js` thành `window.veBaiXe`), đã xóa `bai-xe.html`. Tuyến GPX nằm cuối Điều phối. Thí điểm đổi thành Báo cáo, có thêm chi phí 2025. Bỏ phần so sánh mô hình dự báo ở Nhiên liệu.
- Ảnh thật lấy từ trang Công ty (congtrinhdothimytho.tiengiang.gov.vn), danh sách nguồn ở thư mục tạm khi xử lý.

## 26/11/2026 (sau): gộp lại một trang, đổi tên ứng dụng
- Người dùng muốn một trang duy nhất. `web/index.html` gồm menu "Giới thiệu" thả xuống (Về Công ty, Lĩnh vực hoạt động, Cộng đồng, Hình ảnh, Liên hệ) và 6 mục quản lý xe. Đã xóa `smart-fleet.html`.
- Trang mở đầu là Giới thiệu; đường dẫn dạng `#gioi-thieu/linh-vuc` mở trang Giới thiệu rồi cuộn tới mục.
- Tên ứng dụng: "Quản lý xe tại Công ty TNHH MTV Công trình Đô thị Mỹ Tho" (web, app tài xế, manifest).

## 26/11/2026 (tối): viết lại 6 mục quản lý xe, ảnh thật 100%
- Sáu mục có cùng kiểu đầu trang (tiêu đề lớn + 4 con số). Thống nhất: "Cần kiểm tra" = trạng thái đỏ (6 xe); 3 xe chỉ có 1 ngày khác thường là "Theo dõi".
- Tổng quan: danh sách cần xem đặt cạnh bản đồ, thêm thẻ ba đội. Cảnh báo: thẻ từng xe có biểu đồ 4 tuần, lọc theo đã/chưa kết luận, lời giải thích không dùng tên thuật toán. Nhiên liệu: thanh so với định mức từng xe, thẻ định mức mới. Báo cáo: hai kịch bản dạng thẻ, bảng điều kiện thu gọn.
- Ảnh lĩnh vực 2 và 5 lấy từ trang Công ty (ảnh 06, 34), thay ảnh Canva. Khung truyền hình dùng clip thật `web/video/su-kien.mp4` người dùng cung cấp.

## 26/11/2026: backend thật (ADR-005)
- server/app.py: đăng nhập, phiên, phân quyền, API số liệu, kết luận, lịch xe, sự cố, nhật ký. 12 kiểm thử bảo mật trong server/test_bao_mat.py đều qua.
- Đã gỡ shared/data.js và mockups/data.js khỏi kho; số liệu ở server/du_lieu (không đưa lên kho). Sửa nền bản đồ bị OSM chặn.

## 26/11/2026: chạy thật trên Vercel
- Địa chỉ: https://quan-ly-xe-my-tho.vercel.app (dự án h-c444/quan-ly-xe-my-tho). Root Directory phải để trống (gốc kho); Vercel tự nhận index.py (FastAPI).
- Ba biến môi trường SF_KHOA_BI_MAT, SF_TAI_KHOAN_JSON, SF_SO_LIEU_JSON (tạo bằng python -m server.xuat_vercel_env).
- .vercelignore chặn server/du_lieu và .venv khi triển khai từ máy; đã xóa một bản tải từ máy có lẫn tệp số liệu, đã đổi mật khẩu thử và khóa ký phiên.
