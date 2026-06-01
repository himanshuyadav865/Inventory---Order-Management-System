# Inventory & Order Management System

A Production-Ready Full Stack Inventory & Order Management System. Built using **FastAPI** (Python) and **SQLAlchemy ORM** on the backend, **PostgreSQL** for persistence, and **React (Vite)** on the frontend. The entire application is containerized with **Docker** and configured for easy deployment on **Render** and **Vercel**.

## Features

- **Dashboard Analytics**: Real-time summary cards (total products, customers, orders, low-stock count) and stock level distribution charts.
- **Product Management**: Create, view, search, edit, and delete products (validating pricing, positive stocks, and unique SKU codes).
- **Customer Management**: Register customers, track their emails (uniqueness check), phone numbers, and manage their deletion.
- **Order Registry & Wizard**: Dynamic order placement forms featuring live price previews, selection dropdowns, and stock checks.
- **Transactional Stock Control**: Auto-reduces inventory during order placement in a single database transaction. Prevents orders if stock is insufficient.

---

## Folder Architecture

```
inventory-management-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # Application entrypoint & middlewares
│   │   ├── database.py          # SQLAlchemy engine & session dependency
│   │   ├── models/              # SQLAlchemy Database Models
│   │   ├── schemas/             # Pydantic validation schemas
│   │   ├── routes/              # FastAPI Router endpoints
│   │   └── services/            # Transactional business logic (inventory)
│   ├── requirements.txt         # Python dependencies
│   ├── Dockerfile               # Backend docker config
│   └── .env.example             # Backend environment template
│
├── frontend/
│   ├── src/
│   │   ├── pages/               # React UI Pages (Dashboard, Products, Customers, Orders, Details)
│   │   ├── components/          # Reusable components (Sidebar, Header, Modal, Toast)
│   │   ├── services/            # Axios API consumer layer
│   │   ├── context/             # React Context for Toast & global state
│   │   ├── App.jsx              # Routing & Application wrapper
│   │   ├── main.jsx             # React DOM entrypoint
│   │   └── index.css            # Custom CSS styles (Dark mode SaaS theme)
│   ├── Dockerfile               # Node.js alpine container config
│   ├── package.json             # NPM packages config
│   ├── vite.config.js           # Vite dev server config
│   └── .env.example             # Frontend environment template
│
├── docker-compose.yml           # Runs multi-container stack
├── .dockerignore                # Docker compilation ignore list
├── .gitignore                   # Git tracking exclusion list
├── vercel.json                  # Vercel deployment settings (Router rewrite)
├── render.yaml                  # Render deployment blueprint (Backend + Postgres)
└── README.md                    # System documentation (This file)
```

---

## Quick Start (Docker Compose)

The easiest way to run the entire stack is using Docker Compose:

### 1. Requirements
Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

### 2. Run the Containers
Clone this repository, navigate to the root directory, and execute:
```bash
docker-compose up --build
```

This starts three services:
1. **PostgreSQL Database** on port `5432`
2. **FastAPI Backend** on `http://localhost:8000` (auto-creates database tables on startup)
3. **React Vite Frontend** on `http://localhost:3000`

### 3. Verification
- Open your browser and go to `http://localhost:3000` to interact with the dashboard.
- Access the interactive FastAPI Swagger API documentation at `http://localhost:8000/docs`.

---

## Manual Local Development (Without Docker)

If you prefer to run the applications locally, configure each service individually:

### Backend Setup
1. Open a terminal in the `backend/` directory.
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
   *Note: Edit `.env` if you need to adjust your PostgreSQL connection URI.*
5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Open a terminal in the `frontend/` directory.
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
4. Run the Vite developer server:
   ```bash
   npm run dev
   ```
5. The frontend will start at `http://localhost:3000`.

---

## Business Rules Implemented

1. **Unique Product SKUs**: Checked inside the FastAPI backend. Registering or updating products with duplicate SKUs raises an HTTP 400 Bad Request error.
2. **Unique Customer Email**: Regulated by the database integrity index. Duplicate email registration triggers an HTTP 400 error.
3. **Stock Non-negativity**: Validated by schemas during payload parsing (`stock_quantity >= 0`).
4. **Out of Stock Prevention**: The `/orders` submission checks the current available stock for each line item. If requested quantity exceeds the stock, it immediately rejects the order with an HTTP 400 error.
5. **ACID Transactional Deductions**: Order creation runs inside a single database transaction context. If any validation or item creation fails, all modifications are rolled back. On success, stock levels are reduced automatically.
6. **Automatic Total Calculator**: The backend loops through selected line items, grabs the real-time product prices from the database, and calculates the total amount automatically to prevent client-side price tampering.

---

## Deployment Configuration

### 🚀 Backend Deploy (Render)
1. Commit the code to GitHub.
2. Create a new account on **Render** (render.com).
3. Click **New +** > **Blueprint**.
4. Link your GitHub repository.
5. Render will automatically parse the `render.yaml` configuration at the root of your project, spin up a secure PostgreSQL database, connect it to the python backend, run the installations, and spin up the API web server.

### 🎨 Frontend Deploy (Vercel)
1. Go to **Vercel** (vercel.com) and sign in.
2. Click **Add New** > **Project** and select your GitHub repository.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = (Your Render backend service URL, e.g. `https://inventory-backend.onrender.com`)
5. Click **Deploy**. Vercel will build the frontend assets. Thanks to `vercel.json` rewrites, navigation refreshes will function perfectly.
