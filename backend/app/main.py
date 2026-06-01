import time
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from app.database import engine, Base
from app.routes import products_router, customers_router, orders_router, dashboard_router

app = FastAPI(
    title="Inventory & Order Management System API",
    description="Backend API for managing products, customers, orders, and stock levels.",
    version="1.0.0",
)

# CORS Configuration
# In production, specify actual allowed origins for safety
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers
@app.exception_handler(SQLAlchemyError)
def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Database transaction failed: {str(exc)}"},
    )

@app.exception_handler(Exception)
def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"An unexpected error occurred: {str(exc)}"},
    )

# Startup DB validation & table creation
@app.on_event("startup")
def on_startup():
    # Wait for DB to be ready and auto-create tables
    max_retries = 5
    for attempt in range(max_retries):
        try:
            # Import models to ensure they register on Base
            from app import models
            Base.metadata.create_all(bind=engine)
            print("Database tables verified/created successfully.")
            break
        except Exception as e:
            print(f"Database connection attempt {attempt + 1} failed: {e}")
            if attempt == max_retries - 1:
                raise e
            time.sleep(2)

# Include Routers
app.include_router(dashboard_router)
app.include_router(products_router)
app.include_router(customers_router)
app.include_router(orders_router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Inventory & Order Management System API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }
