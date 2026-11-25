# Quản lý xe tại Công ty TNHH MTV Công trình Đô thị Mỹ Tho

Bản mẫu web quản lý đội xe chuyên dùng và ứng dụng cho tài xế. Đây là Giải pháp 7 trong đề án thạc sĩ về quản trị chi phí đội xe của Công ty. Số liệu là dữ liệu vận hành thật tháng 7/2026 của 42 xe, đã bỏ họ tên tài xế.

## Gồm những gì

- `web/index.html`: một trang duy nhất. Menu "Giới thiệu" thả xuống các mục về Công ty; sáu mục quản lý xe là Tổng quan, Cảnh báo, Đội xe, Nhiên liệu, Điều phối, Báo cáo.
- `app/index.html`: ứng dụng tài xế (đăng nhập bằng tài khoản tài xế), ghi hành trình GPS, lưu và mở tệp GPX, báo sự cố.
- `shared/`: hàm dùng chung, gọi API, đọc ghi GPX, màu và chữ.
- `server/`: backend FastAPI, tài khoản, phiên, API số liệu, kiểm thử bảo mật.
- `docs/`: yêu cầu, kiến trúc, quyết định thiết kế, tiến độ.

## Chạy thử

Giao diện là HTML, CSS và JavaScript thuần; backend là Python FastAPI (thư mục `server/`). Số liệu thật không có trong kho: đặt tệp `fleet.json` (sinh bằng `tools/xuat_du_lieu.py`) vào `server/du_lieu/`.

```
python -m venv server/.venv
server/.venv/Scripts/python -m pip install -r server/requirements.txt
server/.venv/Scripts/python -m server.tao_tai_khoan quanly01 quan-ly
server/.venv/Scripts/python -m server.tao_tai_khoan taixe01 tai-xe X05
server/.venv/Scripts/python -m uvicorn server.app:app --port 8770
```

Rồi vào `http://localhost:8770/`. Khi chạy thật qua HTTPS, đặt biến môi trường `SF_HTTPS=1` để cookie phiên có cờ Secure. Kiểm thử bảo mật: `server/.venv/Scripts/python -m pytest server -q`.

## Bảo mật

- Đăng nhập kiểm tra ở máy chủ; mật khẩu băm argon2; sai 5 lần khóa 15 phút; phiên 8 giờ trong cookie HttpOnly, SameSite=Strict.
- Quản lý xem cả đội; tài xế chỉ nhận số liệu của xe được giao. Mọi lần xem số liệu, lưu kết luận, đặt xe đều ghi nhật ký kèm tên người.
- Bản trên GitHub Pages chỉ là trang tĩnh: phần Giới thiệu xem được, các mục quản lý cần máy chủ nên sẽ báo chưa kết nối.

Thư viện bản đồ Leaflet 1.9.4 tải từ cdnjs, nền bản đồ từ OpenStreetMap, chữ Be Vietnam Pro từ Google Fonts.
## Lưu ý về số liệu và hình ảnh

- Vị trí xe trên bản đồ và trong sơ đồ bãi là mô phỏng; màu tình trạng lấy từ số liệu thật.
- Cảnh báo chỉ để đối chiếu nhật ký, không dùng để xử phạt.
- Ảnh trong `web/anh/` lấy từ trang thông tin của Công ty (congtrinhdothimytho.tiengiang.gov.vn). Clip trong `web/video/` là bản tin truyền hình về hoạt động của Công ty.
