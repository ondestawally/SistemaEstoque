from infrastructure.auth import get_password_hash
try:
    p = get_password_hash("admin123")
    print(f"Hashed: {p}")
except Exception as e:
    print(f"Error: {e}")
