from sqlalchemy.orm import Session
from infrastructure.database import SessionLocal, engine
import infrastructure.orm_models.robust_models # Importa para registrar PedidoVendaORM
import infrastructure.orm_models.erp_models    # Importa para registrar ClienteORM
from infrastructure.orm_models.crm_models import VendedorORM
import uuid

def seed_sellers():
    db = SessionLocal()
    sellers = [
        {"id": "VEN-001", "nome": "Roberto Vendedor", "email": "roberto@erp.com", "comissao_percentual": 3.0},
        {"id": "VEN-002", "nome": "Ana Vendas", "email": "ana.vendas@erp.com", "comissao_percentual": 2.5},
        {"id": "VEN-003", "nome": "Carlos Key Account", "email": "carlos@erp.com", "comissao_percentual": 4.0},
    ]

    for s_data in sellers:
        existing = db.query(VendedorORM).filter(VendedorORM.id == s_data["id"]).first()
        if not existing:
            v = VendedorORM(**s_data)
            db.add(v)
            print(f"Sendedor {s_data['nome']} criado.")
    
    db.commit()
    db.close()

if __name__ == "__main__":
    print("Seeding sellers...")
    seed_sellers()
    print("Done.")
