# Tagly – Frontend Documentation

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Routing & Navigation](#3-routing--navigation)
4. [Views & Components](#4-views--components)
5. [Services & API Layer](#5-services--api-layer)
6. [Security](#6-security)
7. [Development Setup](#7-development-setup)
8. [Roadmap & Team Tasks](#8-roadmap--team-tasks)
9. [Development Guidelines](#9-development-guidelines)

---

## 1. Project Overview

**Tagly** is a personal inventory management system. Users register their belongings — appliances, electronics, tools — with metadata like purchase date, model number, warranty notes, and receipt photos. Each item gets a unique QR code. Scanning the QR code shows the item's details.

### Key Capabilities
- Register and manage personal items with metadata and photos
- Generate, display, print, and download QR codes for items
- View and edit item details; upload and delete receipt images
- Google OAuth 2.0 sign-in alongside standard email/password login
- Password reset via email link and in-app change-password flow
- Role-based access: `customer` and `admin`
- Admin panel displaying all registered users

### Repositories
| Component | Repository |
|-----------|------------|
| Backend | https://github.com/taltech-vanemarendajaks/team-2-qr-backend |
| Frontend | https://github.com/taltech-vanemarendajaks/team-2-qr-front |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue.js 3.2.13 |
| Build tool | Vue CLI 5.0.0 |
| Language | JavaScript (ES6+) |
| Routing | Vue Router 4 |
| HTTP client | Axios 1.7.9 + vue-axios 3.5.2 |
| UI framework | Bootstrap 5.3.3 |
| Icons | Font Awesome 6.7.2 (`@fortawesome/vue-fontawesome`) |
| Date picker | @vuepic/vue-datepicker 12.1.0 |
| QR code rendering | qrcode.vue 3.6.0 |
| Auth | Google Sign-In SDK (OAuth 2.0) |
| Tooltip/dropdown | @popperjs/core 2.11.8 |

---

## 2. Architecture

### System Overview

```
Browser (Vue 3 SPA — localhost:8081)
  └── Vue Router (client-side navigation + route guards)
        └── Views & Components (Bootstrap UI, Font Awesome icons)
              └── Service layer (Axios with CSRF headers, sessionStorage)
                    └── HTTP proxy → Backend API (localhost:8080)
```

The frontend is a **single-page application** served by the Vue CLI dev server on port **8081**. All `/api/**` requests are proxied to the backend on port **8080** via `vue.config.js`. The two processes are completely separate — the frontend has no server-side rendering.

### Project Structure

```
qr-frontend/
├── public/
│   └── index.html                  # SPA entry point; loads Google Sign-In SDK
├── src/
│   ├── main.js                     # App bootstrap (Vue, router, Axios, icons)
│   ├── App.vue                     # Root component (header, logout modal, router-view)
│   ├── router/
│   │   └── index.js                # All route definitions and navigation guards
│   ├── services/                   # Business logic and API communication
│   │   ├── api.js                  # Axios instance with CSRF interceptor
│   │   ├── LoginService.js
│   │   ├── SessionStorageService.js
│   │   ├── NavigationService.js
│   │   ├── ItemService.js
│   │   ├── QrCodeService.js
│   │   ├── UserService.js
│   │   ├── PasswordResetService.js
│   │   ├── AdminService.js
│   │   ├── PasswordService.js
│   │   ├── UsernameService.js
│   │   └── EmailService.js
│   ├── views/                      # Page-level components (one per route)
│   ├── components/                 # Reusable UI components and input fields
│   ├── modal/                      # Modal dialog components
│   └── assets/
│       ├── css/                    # Feature-scoped stylesheets
│       └── images/                 # Logo, placeholder, background, showcase images
├── package.json
├── vue.config.js                   # Dev server proxy + CORS header
└── jsconfig.json                   # Path alias (@/ → src/)
```

### State Management
There is no Vuex/Pinia store. Application state is kept in two places:

| Where | What |
|-------|------|
| `sessionStorage` | `userId`, `roleName`, `username`, `itemMode` — cleared on logout |
| Component `data` / `ref` | Local UI state (form values, loading flags, error messages) |

---

## 3. Routing & Navigation

### Route Table

| Path | View | Access |
|------|------|--------|
| `/` | `HomeView` | Guest only |
| `/login` | `LoginView` | Guest only |
| `/new-account` | `NewAccountView` | Guest only |
| `/forgot-password` | `ForgotPasswordView` | Guest only |
| `/reset-password` | `ResetPasswordView` | Guest only |
| `/items` | `ItemsView` | Auth required |
| `/item` | `ItemView` | Auth required |
| `/change-password` | `ChangePasswordView` | Auth required |
| `/admin` | `AdminView` | Auth required + `admin` role |
| `/error` | `ErrorView` | Public |
| `/not-authorized` | `NotAuthorizedView` | Public |

### Navigation Guards

Before every route change the router runs a global `beforeEach` guard:

1. **Guest-only routes** — if the user is already authenticated (checked via `GET /api/auth/me`), redirect to `/items`.
2. **Auth-required routes** — call `getCurrentUser()`. If the session is invalid, redirect to `/login?redirect=<original-path>` so the user lands back after logging in.
3. **Admin route** — additionally check `roleName === 'admin'`; redirect to `/not-authorized` if the check fails.

`NavigationService.js` wraps `router.push()` calls across the app and supplies `itemMode` flags (`add` / `view` / `edit`) to `ItemView` via sessionStorage.

---

## 4. Views & Components

### Views

#### `HomeView.vue`
Landing page for unauthenticated visitors. Shows a feature list (save receipts, track warranty, access by QR code) and an animated `FeatureShowcasePanel`. Contains the `LoginCreateAccountMenu` for quick navigation.

#### `LoginView.vue`
- Email/password login form
- Google OAuth sign-in via `GoogleSignInButton`
- Error alerts for wrong credentials, rate limiting (HTTP 429), and server errors
- "Forgot password" link to `/forgot-password`
- On success, stores user in sessionStorage and navigates to `/items` (or the `?redirect=` target)

#### `NewAccountView.vue`
- Registration form: username, password, email
- Client-side validation (all fields required; password must be 8–50 chars with at least one letter and one digit)
- Google OAuth as an alternative
- On success, shows confirmation and auto-redirects to `/login` after 8 seconds
- Handles duplicate username (errorCode 222) and duplicate email (errorCode 223)

#### `ItemsView.vue`
- Lists all active items for the logged-in user
- Client-side search/filter by item name
- Per-item actions: **View**, **Edit**, **Delete**, **QR Code**
- "Add new item" button
- Empty state and loading state

#### `ItemView.vue`
- Three modes controlled by `itemMode` in sessionStorage: **Add**, **View** (read-only), **Edit**
- Fields: item name, purchase date (date picker), model number, comment, receipt image
- Image upload and per-image delete
- QR code preview (fetched from backend on demand)
- Inline delete confirmation via `DeleteItemModal`
- Validation errors shown per field

#### `ForgotPasswordView.vue`
- Email input that triggers `POST /api/auth/forgot-password`
- Always shows a success message (mirrors backend anti-enumeration design)
- Back to login link

#### `ResetPasswordView.vue`
- Reads `?token=` from the URL query string
- New password form with strength validation
- Shows an error when the token is missing, invalid, or expired
- Redirects to `/login` on success

#### `ChangePasswordView.vue`
- Current password + new password fields
- New password must meet signup strength rules
- Success alert shown in-page; back to `/items` button

#### `AdminView.vue`
- Displays all users from `GET /api/admin/users` in a table
- Columns: ID, Username, Email, Status, Role, Auth Provider, Item Count, Created Date, Last Login
- Loading and error states; formatted dates

#### `ErrorView.vue`
- Generic error page with animated GIF

#### `NotAuthorizedView.vue`
- 403 Access Denied page with links home or back

---

### Components

#### `GoogleSignInButton.vue`
Renders the official Google Sign-In button using the `accounts.google.com/gsi/client` library loaded in `index.html`. Emits `success` (with credential token) or `error` events. Client ID is set here directly.

#### `LoginCreateAccountMenu.vue`
Simple nav bar with links to `/login` and `/new-account`. Used on the home page.

#### `FeatureShowcasePanel.vue`
Animated carousel cycling through feature scenes (Questions → Receipt → Item → Success) with navigation arrows. Used only on `HomeView`.

#### `ItemDetails.vue`
Form panel shared between Add/Edit/View modes. Contains all item fields and the image upload area. Displays per-field validation error messages. Read-only mode disables all inputs.

#### `ItemImage.vue`
Displays the item's receipt image or a placeholder. Click opens `ImagePreviewModal`. Disabled in view-only mode.

#### `QrImage.vue`
Renders the QR code using `qrcode.vue`. Click opens `QrCodeModal` with print and download options.

#### Input components (`components/inputs/`)
| Component | Purpose |
|-----------|---------|
| `EmailInput.vue` | Email field with validation error slot |
| `PasswordInput.vue` | Password field with show/hide toggle |
| `UsernameInput.vue` | Username field with validation error slot |
| `ImageInput.vue` | File picker (PNG/JPG only, max 10 MB); shows selected filename |

---

### Modals (`modal/`)

| Component | Purpose |
|-----------|---------|
| `Modal.vue` | Base modal: teleported to `<body>`, backdrop-click + Escape close, body-scroll lock. Two style variants: `confirm` and `preview` |
| `QrCodeModal.vue` | Fullscreen QR code display; **Print** (new window with SVG) and **Save** (PNG download) buttons |
| `LogOutModal.vue` | Logout confirmation dialog |
| `DeleteItemModal.vue` | Item deletion confirmation |
| `ImagePreviewModal.vue` | Full-size receipt image viewer |

---

## 5. Services & API Layer

### `api.js` — Axios Instance

All HTTP calls go through a shared Axios instance configured with:
- `withCredentials: true` — sends the session cookie on every request
- **CSRF request interceptor** — reads the `XSRF-TOKEN` cookie and adds it as `X-XSRF-TOKEN` header on every mutating request (`POST`, `PUT`, `DELETE`, `PATCH`)

```
src/services/api.js
```

### Service Modules

#### `LoginService.js`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `login(email, password)` | POST | `/api/auth/login` |
| `googleLogin(idToken)` | POST | `/api/auth/google` |
| `getCurrentUser()` | GET | `/api/auth/me` |
| `logout()` | POST | `/api/auth/logout` |

#### `SessionStorageService.js`
Manages user session data in `sessionStorage`.

| Method | Description |
|--------|-------------|
| `isLoggedIn()` | Returns `true` if userId is set |
| `isAdmin()` | Returns `true` if roleName is `'admin'` |
| `getUserId()` | Returns stored userId |
| `getUsername()` | Returns stored username |
| `setLoggedInUser(data)` | Saves userId, roleName, username |
| `setItemMode(mode)` / `getItemMode()` | Sets/gets the current item view mode (`add`/`view`/`edit`) |
| `clearUserSession()` | Removes all session keys |

#### `ItemService.js`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `sendPostItemRequest(item)` | POST | `/api/item?userId=...` |
| `sendGetItemsRequest()` | GET | `/api/item/all?userId=...` |
| `sendGetItemRequest(itemId)` | GET | `/api/item?itemId=...` |
| `sendPutItemRequest(itemId, item)` | PUT | `/api/item?itemId=...` |
| `sendDeleteItem(itemId)` | DELETE | `/api/item?itemId=...` |
| `sendDeleteItemImageRequest(itemId, imageId)` | DELETE | `/api/item/{itemId}/images/{imageId}` |

#### `QrCodeService.js`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `sendGetQrCodeRequest(itemId)` | GET | `/api/qr-code?itemId=...` |

#### `UserService.js`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `sendPostUserRequest(user)` | POST | `/api/auth/signup` |

#### `PasswordResetService.js`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `forgotPassword(email)` | POST | `/api/auth/forgot-password` |
| `resetPassword(token, newPassword)` | POST | `/api/auth/reset-password` |
| `changePassword(currentPassword, newPassword)` | POST | `/api/auth/change-password` |

#### `AdminService.js`
| Method | HTTP | Endpoint |
|--------|------|----------|
| `getAllUsers()` | GET | `/api/admin/users` |

#### Validation Services
| Service | Rules |
|---------|-------|
| `EmailService.js` | Valid email format, max 254 chars, required |
| `PasswordService.js` | Login: required, max 50 chars. Signup: 8–50 chars, must contain at least one letter and one digit |
| `UsernameService.js` | 3–20 chars, required |

---

## 6. Security

### CSRF Protection
`api.js` reads the `XSRF-TOKEN` cookie (set by the backend) and attaches it as the `X-XSRF-TOKEN` request header on all state-changing requests. This follows the Spring Security double-submit cookie pattern.

### Google OAuth
The Google Sign-In SDK is loaded from `https://accounts.google.com/gsi/client` in `index.html`. `GoogleSignInButton.vue` initiates the sign-in flow and forwards the returned ID token to `POST /api/auth/google` for server-side verification. No token processing happens in the frontend.

### Session Storage
After login, `userId`, `roleName`, and `username` are stored in `sessionStorage` (not `localStorage`), so they are cleared automatically when the browser tab is closed. `SessionStorageService.clearUserSession()` wipes them on explicit logout.

### Route Guards
Every protected route calls `GET /api/auth/me` before rendering. If the session is invalid the user is sent to `/login`. Admin routes additionally verify `roleName === 'admin'`; unauthorised users land on `/not-authorized`.

### Input Validation
All form inputs are validated client-side before a request is sent:

| Field | Rules |
|-------|-------|
| Email | Valid format, max 254 chars |
| Password (login) | Required, max 50 chars |
| Password (signup/reset) | 8–50 chars, ≥1 letter, ≥1 digit |
| Username | 3–20 chars |
| Image upload | PNG or JPG only, max 10 MB |

Server-side validation is the authoritative check; client-side validation provides immediate feedback.

### Cross-Origin Opener Policy
`vue.config.js` injects `Cross-Origin-Opener-Policy: same-origin-allow-popups` on the dev server so the Google OAuth popup can complete without being blocked by COOP restrictions.

---

## 7. Development Setup

### Prerequisites
- Node.js (LTS recommended)
- npm
- Backend running on port 8080 (see backend documentation)

### Install and Run

```bash
# Install dependencies
npm install

# Start development server (http://localhost:8081)
npm run serve

# Build for production
npm run build
```

The dev server proxies all `/api/**` requests to `http://localhost:8080`, so the backend must be running before you use the frontend.

**Frontend available at:** `http://localhost:8081`

### Proxy Configuration (`vue.config.js`)

```js
// All /api/* requests forwarded to the backend
proxy: {
  '/api': {
    target: 'http://localhost:8080'
  }
}
```

### Google OAuth Client ID
The Google Client ID is set inside `GoogleSignInButton.vue`. To use a different Google project, update the `client_id` value there and ensure the backend `GOOGLE_CLIENT_ID` environment variable matches.

### Environment
There is no `.env` file committed to the repository. The frontend has no runtime environment variables of its own — all sensitive configuration (Google Client ID, API URLs) is either hardcoded for the dev proxy setup or belongs to the backend `.env`.

### Seed Accounts (from backend)

| Email / Username | Password | Role |
|-----------------|----------|------|
| admin | 123 | admin |
| hanna | 123 | customer |
| katha | 123 | customer |

---

## 8. Roadmap & Team Tasks

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Login redesign** | Done | Email-based login; Google OAuth |
| 2 | **Google OAuth** | Done | `GoogleSignInButton` + `/api/auth/google` |
| 3 | **Password Reset** | Done | Forgot / Reset / Change password flows |
| 4 | **Item management UI** | Done | Add, View, Edit, Delete with validation |
| 5 | **QR code UI** | Done | Preview, print, and download QR codes |
| 6 | **Admin panel** | Done | User table at `/admin` |
| 7 | **Push notifications** | Planned | Notify users of important events |
| 8 | **Warranty expiry emails** | Planned | Frontend display of expiry warnings |
| 9 | **Family & Friends sharing** | Planned | Share item access with other users |
| 10 | **New frontend design** | Planned | Full UI redesign |
| 11 | **Deploy to TalTech server** | Planned | Production deployment |

---

## 9. Development Guidelines

### Component Conventions
- **Views** (`src/views/`) — one file per route; handle data fetching, navigation, and top-level error/loading state
- **Components** (`src/components/`) — reusable UI pieces; receive props, emit events, own no session state
- **Modals** (`src/modal/`) — all dialogs extend `Modal.vue`; teleport to `<body>` to avoid z-index issues
- **Services** (`src/services/`) — all API calls and business logic live here; views call services, not `api.js` directly

### Styling
- Global styles go in `src/assets/css/base.css`
- Feature-scoped styles go in their own CSS file (`item-view.css`, `modal.css`, etc.) imported in `main.js`
- Bootstrap utility classes are preferred; custom CSS only when Bootstrap doesn't cover it
- Avoid inline styles

### API Communication
- Always use the shared `api.js` Axios instance — never create a bare `axios` call
- Attach `userId` from `SessionStorageService.getUserId()` to item requests; do not read it from the DOM or props

### Navigation
- Use `NavigationService` for programmatic navigation instead of calling `router.push()` directly in views
- Set `itemMode` via `SessionStorageService.setItemMode()` before navigating to `ItemView`

### Validation
- Call validation service methods before submitting any form; display per-field errors, not a single banner
- Server-side error codes map to specific messages — handle `errorCode` from the response body, not just HTTP status
