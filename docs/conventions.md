# Quy ước

- Thư mục: `backend/` API và phân tích, `web/` giao diện, `tools/` script xuất dữ liệu, `mockups/` giao diện mẫu tĩnh, `docs/` tài liệu.
- Tên biến, hàm: tiếng Anh không dấu kiểu snake_case cho Python, camelCase cho JavaScript; nhãn trên giao diện: tiếng Việt có dấu, viết hoa chữ đầu câu.
- Mã xe là khóa chung giữa sổ kế toán, phiếu cấp dầu, báo cáo giám sát hành trình và định mức.
- Số hiển thị theo kiểu Việt Nam: dấu phẩy thập phân, dấu chấm hàng nghìn.
- Lỗi trả về từ API: mã lỗi và câu giải thích phải làm gì, không trả stack trace ra người dùng.
- Mỗi con số trên giao diện ghi được nguồn: bảng, kỳ dữ liệu, script tính.
- Kiểm thử: mỗi phép tính có test so với số trong đề án, ví dụ WAPE 7,6%, lệch định mức 8,5%.
- Commit: một thay đổi một commit, mô tả bằng tiếng Việt.
