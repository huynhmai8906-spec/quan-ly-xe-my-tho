# Quản lý xe tại Công ty TNHH MTV Công trình Đô thị Mỹ Tho

Bản mẫu web quản lý đội xe chuyên dùng và ứng dụng cho tài xế. Đây là Giải pháp 7 trong đề án thạc sĩ về quản trị chi phí đội xe của Công ty. Số liệu là dữ liệu vận hành thật tháng 7/2026 của 42 xe, đã bỏ họ tên tài xế.

## Gồm những gì

- `web/index.html`: một trang duy nhất. Menu "Giới thiệu" thả xuống các mục về Công ty; sáu mục quản lý xe là Tổng quan, Cảnh báo, Đội xe, Nhiên liệu, Điều phối, Báo cáo.
- `app/index.html`: ứng dụng tài xế (mã PIN bản mẫu 2468), ghi hành trình GPS, lưu và mở tệp GPX, báo sự cố.
- `shared/`: dữ liệu (`data.js`, sinh từ `tools/xuat_du_lieu.py`), hàm dùng chung, đọc ghi GPX, màu và chữ.
- `docs/`: yêu cầu, kiến trúc, quyết định thiết kế, tiến độ.

## Chạy thử

Trang chỉ dùng HTML, CSS và JavaScript thuần, không cần cài đặt. Mở bằng một máy chủ tĩnh bất kỳ, ví dụ:

```
python -m http.server 8766
```

rồi vào `http://localhost:8766/web/index.html`.

Thư viện bản đồ Leaflet 1.9.4 tải từ cdnjs, nền bản đồ từ OpenStreetMap, chữ Be Vietnam Pro từ Google Fonts.

## Lưu ý về số liệu và hình ảnh

- Vị trí xe trên bản đồ và trong sơ đồ bãi là mô phỏng; màu tình trạng lấy từ số liệu thật.
- Cảnh báo chỉ để đối chiếu nhật ký, không dùng để xử phạt.
- Ảnh trong `web/anh/` lấy từ trang thông tin của Công ty (congtrinhdothimytho.tiengiang.gov.vn). Clip trong `web/video/` là bản tin truyền hình về hoạt động của Công ty.
