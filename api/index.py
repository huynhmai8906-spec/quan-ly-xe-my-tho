# Điểm vào hàm Python trên Vercel: mọi yêu cầu /api/* được chuyển tới đây (xem vercel.json).
# Giao diện (web/, app/, shared/) do CDN của Vercel phục vụ trực tiếp.
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.app import app  # noqa: E402,F401
