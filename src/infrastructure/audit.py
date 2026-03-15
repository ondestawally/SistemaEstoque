import json
from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import Session
from infrastructure.orm_models.auth_models import AuditLogORM

def log_audit(db: Session, user_id: str, username: str, action: str, entity: str, entity_id: str = None, details: dict = None):
    """
    Registra uma ação no log de auditoria do sistema.
    """
    try:
        details_str = json.dumps(details, default=str) if details else None
        log_entry = AuditLogORM(
            id=str(uuid4()),
            user_id=user_id,
            username=username,
            action=action,
            entity=entity,
            entity_id=entity_id,
            details=details_str,
            timestamp=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        # Em produção, usar um logger real. Aqui apenas ignoramos para não travar a transação principal
        print(f"Erro ao gravar log de auditoria: {e}")
