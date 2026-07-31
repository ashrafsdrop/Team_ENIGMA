# EcoNexus — Smart City Waste Management

EcoNexus is an end-to-end municipal waste-management platform for Dhaka, Bangladesh. It connects every actor in the waste chain — house owners, van and truck drivers, STS (Secondary Transfer Station) managers, landfill managers, area heads, and the mayor — so every kilogram of waste is collected, moved, weighed, and accounted for.

This is a monorepo containing a **Django REST API backend** and a **Next.js frontend** with role-based dashboards.

## Key Features by Role

| Role | Route | Capabilities |
| --- | --- | --- |
| **Mayor / Admin** | `/admin` | City-wide stats, STS station status, live alerts, assign **Area Heads** and **Landfill Managers** |
| **Area Head** | `/area-head` | Station & van status, assign **STS Managers**, assign **vans to STS stations** |
| **House Owner** | `/house-owner` | Pickup requests & history, **upload a waste photo** (ML analysis coming soon), **nearest van map popup** (Leaflet) |
| **Landfill Manager** | `/landfill-manager` | STS & truck status, assign **truck drivers**, approve/reject **truck requests from STS managers** |
| **STS Manager** | `/sts-manager` | STS fill level, **weight check for arriving vans** (approve / flag discrepancies), assign pickup requests to vans |
| **Truck Driver** | `/truck-driver` | Trip history, next dispatch, **update fuel percentage and usage** (fuel log) |
| **Van Driver** | `/van-driver` | **Live Leaflet route map** with next pickup point, **submit waste weight to the STS** |

## Tech Stack

**Frontend**
- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + React 19
- Tailwind CSS v4 (dark theme)
- [react-leaflet](https://react-leaflet.js.org) / Leaflet for maps (CARTO dark tiles)
- lucide-react icons

**Backend**
- Django 6 + Django REST Framework
- JWT auth (`djangorestframework-simplejwt`)
- CORS (`django-cors-headers`)
- OpenAPI schema (`drf-spectacular`, see `schema.yaml`)
- Gemini AI image/OCR analysis endpoints

## Project Structure

```
.
├── backend/                      # Django REST API
│   ├── api/
│   │   ├── migrations/
│   │   ├── admin.py
│   │   ├── models.py             # Item, ItemImage
│   │   ├── serializers.py
│   │   ├── urls.py               # API routes
│   │   └── views.py              # ItemViewSet, AIAnalysisView, OCRAnalysisView, RegisterView
│   ├── backend/                  # Django project settings (settings.py, urls.py)
│   ├── media/                    # Uploaded images (item-images/)
│   ├── manage.py
│   └── schema.yaml               # OpenAPI spec
│
└── frontend/                     # Next.js app
    ├── app/
    │   ├── layout.js             # Root layout
    │   ├── globals.css           # Theme tokens, Leaflet dark overrides
    │   ├── page.js               # Landing page
    │   ├── login/page.jsx        # Login (role select, JWT)
    │   ├── register/page.jsx     # Registration
    │   └── <role>/page.jsx       # One dashboard per role:
    │       ├── admin/            # Mayor / Admin
    │       ├── area-head/
    │       ├── house-owner/
    │       ├── landfill-manager/
    │       ├── sts-manager/
    │       ├── truck-driver/
    │       └── van-driver/
    ├── components/
    │   ├── common/               # Card, Badge, StatCard, Modal, Sidebar, Map, LeafletMap, ...
    │   └── dashboards/           # Dashboard components per role
    ├── utils/
    │   ├── constants.js          # Roles, routes, nav items, API base URL
    │   └── helpers.js            # cn(), useAuth(), initials(), roleLabel()
    └── public/                   # Static assets
```

### Frontend pages

| Page | Purpose |
| --- | --- |
| `/` | Landing page; "Open a dashboard" scrolls to the role selector |
| `/login` `/register` | Auth flow (role select, calls `/api/auth/token/`) |
| `/admin` … `/van-driver` | Role dashboards (viewable without login for demo purposes) |

### Backend API endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET/POST | `/api/items/` | Items CRUD |
| GET/POST | `/api/item-images/` | Item image uploads |
| POST | `/api/analyze/` | Gemini AI analysis of an image |
| POST | `/api/ocr/` | OCR analysis |
| POST | `/api/auth/register/` | Create a user |
| POST | `/api/auth/token/` | JWT obtain (login) |
| POST | `/api/auth/token/refresh/` | JWT refresh |

## Getting Started

### Backend (Django)

```bash
cd backend
python -m venv venv
# activate: .\venv\Scripts\activate  (Windows)  or  source venv/bin/activate  (macOS/Linux)
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers drf-spectacular python-dotenv Pillow
python manage.py migrate
python manage.py runserver        # API at http://127.0.0.1:8000/api
```

Optional environment variables (loaded from `.env`):
- `SECRET_KEY` — Django secret key
- `GEMINI_API_KEY` — Google Gemini API key for the analyze/OCR endpoints

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev                       # http://localhost:3000
```

Environment:
- `NEXT_PUBLIC_API_BASE_URL` — defaults to `http://127.0.0.1:8000/api`

| Script | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Start | `npm run start` |
| Lint | `npm run lint` |

## Notes

- Dashboards are interactive with client-side mock state, ready to be wired to the backend API.
- Maps use Leaflet with OpenStreetMap/CARTO dark tiles and are rendered client-side only (`ssr: false`).
- The house-owner photo report flow is built; the ML waste-classification model is planned to plug into `/api/analyze/`.
