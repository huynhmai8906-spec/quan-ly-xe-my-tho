# Thiết kế giao diện

Trạng thái: giao diện mẫu ở `mockups/`, chờ duyệt.

## Ý tưởng

Lấy logic trình bày của trang Trung Nguyên Legend: đầu trang có biểu tượng đặt giữa, nút menu bên trái, chuyển vai trò bên phải; một dải đen chữ vàng làm mốc; tiêu đề mục chữ serif in hoa nhỏ đặt giữa, kèm một câu dẫn. Kết hợp với giao diện bản đồ hành trình trong ảnh mẫu: bản đồ mờ dần ra mép, tiêu đề đặt nổi trên bản đồ, các ô biểu tượng trắng bo góc gắn trên bản đồ, danh sách theo ngày có ảnh nhỏ và nút Mở rộng. Không dùng logo, ảnh hay tên thương hiệu của Trung Nguyên Legend.

Bài học từ clip thiết kế dashboard: thứ bậc thông tin và khoảng trắng quyết định độ dễ dùng hơn số lượng biểu đồ. Vì vậy màn hình đầu chỉ trả lời một câu: tuần này xe nào cần kiểm tra.

## Màu

| Tên | Mã | Dùng cho |
|---|---|---|
| Mực | #000000 | Dải mốc, chữ tiêu đề |
| Đồng | #B48A3C | Viền biểu tượng, đường kẻ mốc, số nhấn |
| Mây | #F6F7F9 | Nền trang, lấy từ ảnh bản đồ mẫu |
| Giấy | #FFFFFF | Ô biểu tượng, danh sách |
| Sông Tiền | #2F80C8 | Liên kết, đường tuyến trên bản đồ |
| Gạch | #B4382F | Chỉ số vượt ngưỡng |

## Chữ

- Cormorant SC: tiêu đề mục, chữ serif in hoa nhỏ, có dấu tiếng Việt.
- Be Vietnam Pro: nội dung, số liệu dùng chữ số đều cột.

## Bố cục màn hình chính

```
 ☰              [biểu tượng]              Quản lý | Tài xế
 ███████ dải đen: Quản trị chi phí đội xe dựa trên dữ liệu ███████
 ┌──────────────── bản đồ Mỹ Tho, mờ ra mép ────────────────┐
 │  [ô xe]          ĐỘI XE MỸ THO           [ô xe]           │
 │        [ô xe]               [trụ sở]                      │
 └──────────────────────────────────────────────────────────┘
 Tuần này cần kiểm tra
 [ô] 63C-109.80, xe cẩu ............ chỉ số 1,17   Ghi kết luận
 [ô] ...                                           (Mở rộng)
          CHI PHÍ ĐỘI XE NĂM 2025 / câu dẫn / biểu đồ thanh
          KHAI THÁC THÁNG 7/2026 / mỗi xe một thanh 31 ngày
          MÔ HÌNH VÀ KIỂM CHỨNG
```

Căn giữa cho tiêu đề mục và câu dẫn; danh sách, bảng căn trái.

## Màn hình ứng dụng tài xế

Khung điện thoại như ảnh mẫu: giờ, nút quay lại, tiêu đề Tuyến hôm nay nổi trên bản đồ, danh sách chuyến, nút Mở rộng. Tài xế chỉ thấy xe của mình và chỉ số tiêu hao theo tuần của chính xe đó.

## Điều cần nói rõ trên giao diện mẫu

Dữ liệu tháng 7/2026 không có tọa độ, nên vị trí xe trên bản đồ là vị trí minh họa quanh trụ sở; khi nối API thiết bị giám sát hành trình sẽ thay bằng vị trí thật. Danh sách điểm thu gom chưa có vì Công ty chưa có tài liệu tuyến.
