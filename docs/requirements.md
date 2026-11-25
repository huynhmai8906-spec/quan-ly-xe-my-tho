# Yêu cầu và nghiệp vụ

Trạng thái: đề xuất, chờ người dùng duyệt.

## Bối cảnh

Smart Fleet là Giải pháp 7 trong đề án quản trị chi phí đội xe của Công ty TNHH MTV Công trình Đô thị Mỹ Tho. Hệ thống gồm web quản lý cho Phòng Kế hoạch Kinh doanh, đội trưởng, Ban Giám đốc, và ứng dụng cho tài xế. Dữ liệu lấy từ thiết bị giám sát hành trình và cảm biến nhiên liệu đã lắp cho 27 xe.

## Người dùng

| Vai trò | Việc chính |
|---|---|
| Nhân viên Phòng KH-KD | Nạp dữ liệu, xem cảnh báo tuần, lập kế hoạch cấp dầu, điều phối xe dùng chung |
| Đội trưởng | Xem xe của đội, ghi kết luận cho từng cảnh báo, đăng ký nhu cầu xe theo tuần |
| Phòng Tổ chức – Kế toán | Xem chi phí theo mã xe, TCO xe trên 10 năm |
| Ban Giám đốc, Chủ tịch công ty | Xem tổng quan, kết quả thí điểm, xếp hạng thay xe; chỉ đọc |
| Tài xế | Xem tuyến được giao, cập nhật chuyến, xem chỉ số tiêu hao của chính xe mình |

## Chức năng

| Mã | Chức năng | Màn hình |
|---|---|---|
| F01 | Tổng quan chi phí đội xe theo khoản mục và theo đội | Web: Tổng quan |
| F02 | Bản đồ vị trí xe từ thiết bị giám sát hành trình | Web: Bản đồ; App: Tuyến hôm nay |
| F03 | Nhiên liệu và định mức: định mức theo xe, so với thực tế | Web: Nhiên liệu |
| F04 | Cảnh báo tuần: xe có chỉ số hiệu quả tiêu hao trên ngưỡng, kèm ô ghi kết luận | Web: Cần kiểm tra |
| F05 | Ngày bất thường do Isolation Forest lọc ra, chỉ để kiểm tra, không dùng xử phạt | Web: Cần kiểm tra |
| F06 | Mức khai thác từng xe, danh sách xe dưới 50% trong 3 tháng | Web: Khai thác |
| F07 | Lập tuyến thu gom, giao tuyến cho tài xế | Web: Lập tuyến; App |
| F08 | Đánh giá thí điểm khác biệt kép, cận dưới khoảng tin cậy 95% | Web: Thí điểm |
| F09 | Tài xế xem chỉ số tiêu hao của chính xe, không xếp hạng công khai | App |
| F10 | Nạp file xuất từ thiết bị giám sát hành trình, kiểm tra chất lượng dữ liệu | Web: Nạp dữ liệu |
| F11 | Phân quyền theo vai trò và nhật ký truy cập dữ liệu | Toàn hệ thống |

## Yêu cầu phi chức năng

- Dữ liệu cá nhân theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15: không lưu họ tên tài xế trong bảng phân tích; dữ liệu vị trí chỉ người có vai trò được xem; có thời hạn lưu.
- Cảnh báo không tự động dẫn đến xử phạt; mỗi cảnh báo phải có người ghi kết luận.
- Giao diện tiếng Việt, chạy trên máy tính văn phòng và điện thoại Android phổ thông.
- Số liệu trên màn hình phải truy ngược được về dữ liệu gốc.

## Câu hỏi còn mở

1. Thiết bị giám sát hành trình của nhà cung cấp nào, có API hay chỉ xuất file Excel?
2. Có chứng từ khối lượng rác theo chuyến không?
3. Máy chủ đặt tại Công ty hay thuê ngoài?
4. Tọa độ điểm tập kết và tuyến thu gom hiện có ở dạng nào?
