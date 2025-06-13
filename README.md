# FE Project

## Cấu trúc thư mục

- `src/components/`: Các component dùng chung
- `src/views/`: Các trang lớn
- `src/stores/`: State management (Pinia)
- `src/router/`: Định tuyến
- `src/axios/`: Cấu hình axios, gọi API
- `src/socket/`: Cấu hình websocket
- `src/utils/`: Hàm tiện ích
- `src/assets/`: Ảnh, style, ...

## Phát triển

```bash
npm install
npm run dev
```

## Lint & Format

```bash
npm run lint    # Kiểm tra code style
npm run format  # Tự động format code
```

## Alias
- Sử dụng `@` để import từ thư mục `src`.

## Thông tin khác
- Sử dụng Vite + Vue 3 + Pinia
- Đã cấu hình ESLint + Prettier
