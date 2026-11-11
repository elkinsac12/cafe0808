import os
import secrets
import logging
from dotenv import load_dotenv

# Carga las variables del archivo .env
load_dotenv()

log = logging.getLogger("cafe0808")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(ROOT_DIR, "static")
LANDING_DIR = os.path.join(ROOT_DIR, "landing")
TEMPLATES_DIR = os.path.join(ROOT_DIR, "templates")

# Variables de MongoDB Atlas
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://esierra04_db_user:ri4GCz4QBSNhOAO4@dbcafe.nqvma4c.mongodb.net/DBcafe?retryWrites=true&w=majority")
DB_NAME = os.getenv("DB_NAME", "cafe0808")
MONGO_POOL_SIZE = int(os.getenv("MONGO_POOL_SIZE", "50"))

# Clave de sesión
SECRET_KEY = os.getenv("SECRET_KEY") or ""
if not SECRET_KEY:
    SECRET_KEY = secrets.token_urlsafe(48)
    log.warning("SECRET_KEY no está definida: se generó una temporal. Las sesiones se cerrarán en cada reinicio. Defínela en Render.")

SESSION_COOKIE = "sesion_0808"
SESSION_HOURS = int(os.getenv("SESSION_HOURS", "12"))

COOKIE_SECURE = os.getenv("COOKIE_SECURE", "1" if os.getenv("RENDER") else "0") == "1"

# Variables requeridas por main.py
ADMIN_INITIAL_PASSWORD = os.getenv("ADMIN_PASSWORD", "0808cafe")
ENABLE_DOCS = os.getenv("ENABLE_DOCS", "0") == "1"

LOGIN_MAX_FALLOS = 5
LOGIN_BLOQUEO_SEG = 5 * 60
API_REQ_POR_MINUTO = int(os.getenv("API_REQ_POR_MINUTO", "240"))
