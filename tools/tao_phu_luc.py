# -*- coding: utf-8 -*-
"""Tạo Phụ lục D: đặc tả kiến trúc và giao diện Smart Fleet, theo quy cách đề án: Times New Roman 13, giãn dòng 1,5."""
import os, sys, json
import docx
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANH = os.path.join(ROOT, 'docs', 'anh')
OUT = os.path.join(os.path.dirname(ROOT), 'PHU LUC D - DAC TA HE THONG SMART FLEET.docx')
t = open(os.path.join(ROOT, 'shared', 'data.js'), encoding='utf-8').read()
F = json.loads(t[t.index('{'):t.rindex('}') + 1])
XE = F['xe']; CB = [x for x in XE if x['cam_bien']]
dem = {k: sum(1 for x in XE if x['trang_thai'] == k) for k in ('xanh', 'vang', 'do', 'chua')}

d = docx.Document()
for s in d.sections:
    s.top_margin = Cm(2); s.bottom_margin = Cm(2); s.left_margin = Cm(3); s.right_margin = Cm(2)
st = d.styles['Normal']; st.font.name = 'Times New Roman'; st.font.size = Pt(13)
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman')
st.paragraph_format.line_spacing = 1.5; st.paragraph_format.space_after = Pt(6)
so_hinh = [0]; so_bang = [0]


def h(text, cap=1):
    p = d.add_paragraph(); r = p.add_run(text); r.bold = True; r.font.size = Pt(14 if cap == 1 else 13)
    if cap == 1: p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.keep_with_next = True
    return p


def para(text):
    p = d.add_paragraph(text); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY; p.paragraph_format.first_line_indent = Cm(1); return p


def bang(ten, cot, dong, rong=None):
    so_bang[0] += 1
    c = d.add_paragraph(); r = c.add_run(f'Bảng D.{so_bang[0]}. {ten}'); r.bold = True
    c.alignment = WD_ALIGN_PARAGRAPH.CENTER; c.paragraph_format.keep_with_next = True
    tb = d.add_table(rows=1, cols=len(cot)); tb.style = 'Table Grid'
    for i, x in enumerate(cot):
        cell = tb.rows[0].cells[i]; cell.text = ''; rr = cell.paragraphs[0].add_run(x); rr.bold = True; rr.font.size = Pt(12)
    for row in dong:
        cells = tb.add_row().cells
        for i, x in enumerate(row):
            cells[i].text = ''; rr = cells[i].paragraphs[0].add_run(str(x)); rr.font.size = Pt(12)
    for row in tb.rows:
        tr = row._tr.get_or_add_trPr(); e = OxmlElement('w:cantSplit'); tr.append(e)
        for c2 in row.cells:
            for p in c2.paragraphs: p.paragraph_format.line_spacing = 1.15; p.paragraph_format.space_after = Pt(2)
    h0 = tb.rows[0]._tr.get_or_add_trPr(); e = OxmlElement('w:tblHeader'); h0.append(e)
    if rong:
        for row in tb.rows:
            for c2, w in zip(row.cells, rong): c2.width = Cm(w)
    d.add_paragraph()


def hinh(file, ten, rong=15.5):
    so_hinh[0] += 1
    p = d.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next = True
    p.add_run().add_picture(os.path.join(ANH, file), width=Cm(rong))
    c = d.add_paragraph(); r = c.add_run(f'Hình D.{so_hinh[0]}. {ten}'); r.bold = True; c.alignment = WD_ALIGN_PARAGRAPH.CENTER


def hinh_doi(files, ten):
    so_hinh[0] += 1
    tb = d.add_table(rows=1, cols=len(files))
    for c2, f in zip(tb.rows[0].cells, files):
        p = c2.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.add_run().add_picture(os.path.join(ANH, f), width=Cm(4.6))
    c = d.add_paragraph(); r = c.add_run(f'Hình D.{so_hinh[0]}. {ten}'); r.bold = True; c.alignment = WD_ALIGN_PARAGRAPH.CENTER


h('PHỤ LỤC D. ĐẶC TẢ HỆ THỐNG SMART FLEET')
para('Phụ lục mô tả kiến trúc và giao diện của Giải pháp 7: một web quản trị cho Ban Giám đốc và các phòng, một ứng dụng riêng cho tài xế. Bản mẫu đã chạy được trên dữ liệu thật tháng 7/2026 của Công ty; họ tên tài xế đã được bỏ khỏi mọi tệp dữ liệu. Mã nguồn bản mẫu nằm trong thư mục SMART FLEET MY THO đi kèm đề án.')

h('D.1. Người dùng và phân quyền', 2)
para('Hệ thống phân quyền theo vai trò, viết tắt là RBAC. Quyền được kiểm tra ở máy chủ, không dựa vào việc ẩn nút trên giao diện.')
bang('Vai trò và quyền truy cập', ['Vai trò', 'Được xem', 'Được làm'], [
    ['Chủ tịch công ty, Giám đốc', 'Toàn bộ số liệu, báo cáo thí điểm', 'Duyệt định mức, duyệt đầu tư theo thẩm quyền'],
    ['Phòng Kế hoạch Kinh doanh', 'Toàn bộ đội xe, vị trí xe', 'Nạp dữ liệu, chạy cảnh báo, điều phối xe dùng chung'],
    ['Phòng Tổ chức – Kế toán', 'Chi phí theo mã xe, tài sản', 'Hạch toán theo mã xe, tính tổng chi phí sở hữu'],
    ['Đội trưởng', 'Xe của đội mình', 'Ghi kết luận cảnh báo, đăng ký xe dùng chung'],
    ['Tài xế', 'Xe được giao, chỉ số của chính xe', 'Xác nhận chuyến, báo sự cố']], [4.2, 5.4, 6.4])

h('D.2. Kiến trúc kỹ thuật', 2)
bang('Các lớp của hệ thống', ['Lớp', 'Thành phần', 'Ghi chú'], [
    ['Thu nhận dữ liệu', 'Tệp Excel xuất từ thiết bị giám sát hành trình; giai đoạn sau dùng API của nhà cung cấp, MQTT hoặc WebSocket để nhận vị trí liên tục', 'Kiểm tra định dạng, kích thước, chỉ đọc giá trị'],
    ['Cơ sở dữ liệu', 'PostgreSQL với PostGIS cho tọa độ và tuyến; giai đoạn thử dùng SQLite', 'Bảng xe, xe – ngày, cảnh báo, kết luận, nhật ký'],
    ['Phân tích', 'Python, pandas, scikit-learn, statsmodels', 'Dùng lại các script đã kiểm chứng trong đề án'],
    ['API', 'FastAPI, REST cho màn hình, WebSocket cho bản đồ thời gian thực', 'Phân quyền và ghi nhật ký ở lớp này'],
    ['Web quản trị', 'Bản mẫu: HTML, CSS, JavaScript và Leaflet; bản chính thức có thể chuyển sang React, Next.js', 'Thành phần dùng lại được, đáp ứng màn hình lớn và máy tính bảng'],
    ['App tài xế', 'Ứng dụng web cài được lên điện thoại, viết tắt là PWA', 'Không cần qua kho ứng dụng, chạy trên Android phổ thông']], [3.2, 7.4, 5.4])

h('D.3. Quy tắc tính từ dữ liệu', 2)
para(f'Chỉ số hiệu quả tiêu hao của một tuần bằng lít thực tế chia lít kỳ vọng, trong đó lít kỳ vọng tính từ các tuần còn lại của chính xe đó. Ngưỡng cảnh báo là mức mà 95% số tuần nằm dưới, bằng {F["nguong_tuan"]:.2f}'.replace('.', ',') + ' trên dữ liệu tháng 7/2026; ngưỡng được tính lại mỗi quý. Isolation Forest dùng bốn đặc trưng: lít trên 100 km, giờ dừng, km trong ngày và phần dư so với mức thường ngày của xe, đúng như script chay_hoc_may.py.')
bang('Quy tắc gán trạng thái trên bản đồ', ['Trạng thái', 'Điều kiện', 'Số xe tháng 7/2026'], [
    ['Cần kiểm tra', 'Có tuần vượt ngưỡng hoặc từ 2 ngày bị Isolation Forest lọc ra', dem['do']],
    ['Khai thác thấp', 'Dưới 16 trên 31 ngày có hoạt động', dem['vang']],
    ['Hoạt động tốt', 'Các xe có cảm biến còn lại', dem['xanh']],
    ['Chưa có cảm biến', 'Xe chưa lắp thiết bị hoặc chưa có dữ liệu', dem['chua']]], [3.6, 9.0, 3.4])

h('D.4. Web quản trị', 2)
bang('Các phân hệ của web quản trị', ['Phân hệ', 'Nội dung', 'Người dùng chính'], [
    ['Tổng quan', 'Bản đồ 42 xe theo trạng thái; chi phí nhiên liệu tháng, tỷ lệ khai thác, số xe cần kiểm tra', 'Ban Giám đốc'],
    ['Đội xe và tổng chi phí sở hữu', '42 xe với năm sử dụng, nguyên giá, giá trị còn lại; xếp hạng xem xét thay xe theo 4 tiêu chí', 'Phòng TC-KT, Chủ tịch công ty'],
    ['Nhiên liệu và định mức', 'Đối chiếu định mức cũ với dầu thực tế theo xe; sai số các mô hình dự báo', 'Phòng KH-KD'],
    ['Cảnh báo', 'Xe có tuần vượt ngưỡng, ngày khác thường; chọn nguyên nhân và ghi kết luận', 'Đội trưởng, Phòng KH-KD'],
    ['Điều phối xe', 'Lịch khai thác từng ngày; lưới đăng ký xe dùng chung theo buổi, chặn đăng ký trùng', 'Các đội, tổ điều phối'],
    ['Thí điểm', 'Bốn bước kiểm chứng, ngưỡng nhân rộng, tỷ suất và thời gian hoàn vốn; in báo cáo', 'Ban Giám đốc']], [4.0, 8.6, 3.4])
hinh('web-tong-quan.png', 'Web quản trị, phân hệ Tổng quan, chế độ tối')
hinh('web-tong-quan-sang.png', 'Web quản trị, phân hệ Tổng quan, chế độ sáng')
hinh('web-canh-bao.png', 'Web quản trị, phân hệ Cảnh báo với ô ghi kết luận')
hinh('web-doi-xe.png', 'Web quản trị, danh sách đội xe và tài sản')
hinh('web-dieu-phoi.png', 'Web quản trị, lịch khai thác và đăng ký xe dùng chung')

h('D.5. Ứng dụng tài xế', 2)
para('Ứng dụng dành cho thao tác một tay: các nút chính nằm ở nửa dưới màn hình, vùng bấm từ 52 điểm ảnh trở lên, thanh chức năng cố định ở đáy. Tài xế chỉ thấy xe được giao và chỉ số của chính xe đó; không có bảng xếp hạng giữa các tài xế.')
bang('Các màn hình của ứng dụng tài xế', ['Màn hình', 'Nội dung'], [
    ['Đăng nhập', 'Mã PIN 4 số hoặc vân tay; khóa sau 5 lần nhập sai'],
    ['Tuyến hôm nay', 'Bản đồ, danh sách chuyến trong ngày, nút xác nhận hoàn thành từng chuyến; danh sách điểm thu gom hiện khi Phòng KH-KD đã lập tuyến'],
    ['Tiêu hao', f'Chỉ số theo tuần của chính xe, mức hỗ trợ tháng tính theo Biên bản họp ngày 25/8/2025: xe 63C-171.96 chạy {next(x for x in XE if x["bien_so"] == "63C-171.96")["chuyen_t7"]} chuyến, được 1,38 triệu đồng'],
    ['Báo sự cố', 'Chọn loại: xe hỏng, tắc đường, lỗi thiết bị, điểm tập kết ùn ứ; ghi chú, chụp ảnh và gửi']], [3.6, 12.4])
hinh_doi(['app-pin.jpg', 'app-tuyen.jpg', 'app-tieu-hao.jpg'], 'Ứng dụng tài xế: đăng nhập, tuyến hôm nay, tiêu hao của xe')

h('D.6. Quy chuẩn giao diện', 2)
para('Cách tổ chức trang theo logic của trang Trung Nguyên Legend: thương hiệu bên trái, các phân hệ luôn hiện trên thanh điều hướng, một dải tiêu đề dưới đầu trang, mỗi mục có tiêu đề đặt giữa và một câu dẫn, khung trích dẫn khi mở trang. Màu theo hướng đơn giản của trang Nestlé Việt Nam: chế độ tối nền xám than, chữ kem xám, màu chính xanh dương; chế độ sáng nền trắng, chữ nâu xám. Không dùng logo, ảnh hay tên thương hiệu của hai trang này.')
bang('Bảng màu', ['Vai trò', 'Chế độ tối', 'Chế độ sáng'], [
    ['Nền', '#242525', '#FFFFFF'], ['Chữ chính', '#E5E0D8', '#30261D'], ['Chữ phụ', '#A0988A', '#8F8475'],
    ['Nút chính', '#17668C', '#17668C'], ['Hoạt động tốt', '#6FB35F', '#34682B'], ['Cần kiểm tra', '#E2675A', '#C0392B']], [5.0, 5.5, 5.5])

h('D.7. Bảo mật và tuân thủ', 2)
for s in [
    'Dữ liệu vị trí và hành vi lái xe là dữ liệu cá nhân theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15; Luật có quy định riêng về dữ liệu trong quản lý người lao động tại Điều 25 và dữ liệu vị trí tại Điều 31. Bảng phân tích chỉ dùng mã xe; họ tên tài xế không xuất hiện trên màn hình phân tích.',
    'Cảnh báo chỉ để kiểm tra; hệ thống không có chức năng xử phạt tự động, mỗi cảnh báo phải có người kết luận.',
    'Mật khẩu và mã PIN được băm bằng argon2 ở máy chủ; khóa bí mật đặt trong biến môi trường, không lưu trong mã nguồn.',
    'Mọi truy vấn cơ sở dữ liệu dùng tham số; tệp nạp lên chỉ nhận định dạng xlsx, có giới hạn kích thước và không chạy macro.',
    'Chính sách bảo mật nội dung, viết tắt là CSP, chỉ cho phép tải mã, phông chữ và bản đồ từ các nguồn đã liệt kê; giao diện không chèn mã HTML lấy từ dữ liệu.',
    'Máy chủ ghi nhật ký ai xem dữ liệu vị trí và khi nào; dữ liệu vị trí lưu có thời hạn.']:
    p = d.add_paragraph(s, style='List Bullet'); p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

h('D.8. Giới hạn của bản mẫu', 2)
para('Dữ liệu tháng 7/2026 không có tọa độ nên vị trí xe trên bản đồ là mô phỏng; khi nối thiết bị giám sát hành trình sẽ hiện vị trí thật. Công ty chưa có tài liệu tuyến nên chưa có danh sách điểm thu gom. Bản mẫu lưu kết luận, lịch đăng ký và báo cáo sự cố trên máy đang dùng; bản chính thức lưu vào cơ sở dữ liệu qua API.')
d.save(OUT)
print('Đã tạo', OUT, '| bảng', so_bang[0], '| hình', so_hinh[0])
