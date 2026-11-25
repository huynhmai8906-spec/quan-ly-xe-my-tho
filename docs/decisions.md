# Nhật ký quyết định

## ADR-001. Dùng Python FastAPI cho backend

Trạng thái: đề xuất. Lý do: các phép tính chỉ số tiêu hao, Isolation Forest, khác biệt kép đã viết và kiểm chứng bằng Python trong đề án; dùng lại được nguyên mã. Phương án khác: Node.js, phải viết lại phần phân tích.

## ADR-002. Giao diện không dùng framework

Trạng thái: đề xuất. Lý do: số màn hình ít, Công ty chưa có lập trình viên frontend; HTML, CSS, JavaScript thuần dễ sửa hơn. Xem lại nếu số màn hình vượt khoảng 15.

## ADR-003. Cảnh báo chính theo tuần, Isolation Forest chỉ là phụ

Trạng thái: chốt theo kết quả thử nghiệm chèn bất thường trong đề án: phần dư tuần phát hiện 89,2% trường hợp vượt 20%, Isolation Forest theo ngày chỉ 8,6%.

## ADR-004. Không hiển thị họ tên tài xế trên màn hình phân tích

Trạng thái: chốt theo Luật 91/2025/QH15 và nguyên tắc không xử phạt tự động trong đề án.
