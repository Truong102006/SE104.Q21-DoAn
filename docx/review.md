⚠️ Điểm cấn duy nhất: Chỗ tạo nhanh Sản Phẩm (Mục 3.2.A)
Trong kế hoạch có ghi:

Dùng giá trị mặc định (loại SP đầu tiên + đơn vị đầu tiên). User edit sau ở trang Sản phẩm.

Tuyệt đối không nên dùng phương án này đối với đồ án quản lý Vàng Bạc Đá Quý. Đặc thù của ngành này là Giá cả và Tồn kho phụ thuộc chặt chẽ vào Loại sản phẩm và Đơn vị tính. Nếu người dùng gõ "Nhẫn kim cương" mà hệ thống tự động gán vào loại SP đầu tiên (ví dụ: "Vàng 24K") và đơn vị đầu tiên (ví dụ: "Lượng"), thì sau đó tính tỷ lệ trả trước, tỷ lệ lợi nhuận hay trừ kho sẽ sai bét nhè. Chờ người dùng nhớ ra để quay lại trang Sản phẩm sửa thì data đã hỏng rồi.

🛠️ Giải pháp chốt (Nên áp dụng ngay)
Bạn hãy chia luồng Quick-Create ra làm 2 mức độ:

Với Đơn vị tính / Loại sản phẩm: Áp dụng y xì kế hoạch hiện tại (Inline 1-hit). Gõ tên -> Bấm Thêm mới -> Gọi API lưu luôn vì nó chỉ cần 1 trường Tên.

Với Sản phẩm: Áp dụng Phương án 2 (Nâng cao). Khi người dùng bấm + Thêm mới "Vàng SJC Test" trong Combobox Sản phẩm, hệ thống phải hiện lên một Modal/Dialog nhỏ (dùng Dialog của shadcn/ui).

Trong Dialog này có sẵn Tên SP (đã fill "Vàng SJC Test").

Bắt buộc người dùng chọn: Loại SP và Đơn vị tính.

Bấm "Lưu" -> Gọi API POST /api/san-pham -> Đóng Dialog -> Auto-fill vào phiếu mua.

Cách này chỉ tốn thêm khoảng 15-20 phút code cái UI Dialog nhưng đảm bảo dữ liệu toàn vẹn 100%, ra hội đồng demo thầy cô hỏi vặn về validate nghiệp vụ thì tự tin trả lời.