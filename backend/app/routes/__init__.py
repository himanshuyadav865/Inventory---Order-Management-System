from app.routes.products import router as products_router
from app.routes.customers import router as customers_router
from app.routes.orders import router as orders_router
from app.routes.dashboard import router as dashboard_router

__all__ = ["products_router", "customers_router", "orders_router", "dashboard_router"]
