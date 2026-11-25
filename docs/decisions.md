# Nhật ký quyết định

## ADR-001. Dùng Python FastAPI cho backend

Trạng thái: đề xuất. Lý do: các phép tính chỉ số tiêu hao, Isolation Forest, khác biệt kép đã viết và kiểm chứng bằng Python trong đề án; dùng lại được nguyên mã. Phương án khác: Node.js, phải viết lại phần phân tích.

## ADR-002. Giao diện không dùng framework

Trạng thái: đề xuất. Lý do: số màn hình ít, Công ty chưa có lập trình viên frontend; HTML, CSS, JavaScript thuần dễ sửa hơn. Xem lại nếu số màn hình vượt khoảng 15.

## ADR-003. Cảnh báo chính theo tuần, Isolation Forest chỉ là phụ

Trạng thái: chốt theo kết quả thử nghiệm chèn bất thường trong đề án: phần dư tuần phát hiện 89,2% trường hợp vượt 20%, Isolation Forest theo ngày chỉ 8,6%.

## ADR-004. Không hiển thị họ tên tài xế trên màn hình phân tích

Trạng thái: chốt theo Luật 91/2025/QH15 và nguyên tắc không xử phạt tự động trong đề án.

## ADR-005. Backend FastAPI chạy thật, số liệu chỉ phục vụ sau khi đăng nhập

Trạng thái: chốt ngày 26/11/2026 theo yêu cầu của người dùng sau khi rà bảo mật. Lý do: bản mẫu trước đó kiểm tra PIN ngay trên trình duyệt (PIN ghi trong mã nguồn), web quản lý không có đăng nhập và `shared/data.js` chứa số liệu thật nằm công khai trên GitHub Pages.

Cách làm: `server/app.py` (FastAPI, SQLite) phục vụ cả giao diện lẫn API, cùng một địa chỉ nên cookie không phải gửi sang miền khác. Mật khẩu băm argon2; phiên là token ngẫu nhiên lưu dạng băm SHA-256, cookie HttpOnly, SameSite=Strict, Secure khi chạy HTTPS, hết hạn sau 8 giờ. Sai 5 lần khóa tài khoản 15 phút. Quyền xét ở máy chủ: quản lý xem cả đội, tài xế chỉ nhận số liệu của xe được giao. Yêu cầu ghi phải có header X-SF và Origin đúng (chống CSRF). Kết luận cảnh báo, lịch xe, sự cố và mọi lần xem số liệu ghi vào cơ sở dữ liệu kèm tên người. Số liệu thật nằm ở `server/du_lieu/fleet.json`, không đưa lên kho.

Hệ quả: GitHub Pages chỉ còn hiển thị phần Giới thiệu; các mục quản lý cần máy chủ chạy `server/app.py`. Phương án khác: dịch vụ đăng nhập bên ngoài (Firebase, Supabase), không chọn vì kiến trúc đã định tài khoản nội bộ, không phụ thuộc dịch vụ ngoài.
