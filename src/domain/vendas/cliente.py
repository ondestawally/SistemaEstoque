from dataclasses import dataclass
from typing import Optional
from domain.value_objects import CNPJ

@dataclass
class Cliente:
    id: str
    razao_social: str
    cnpj_cpf: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    ativo: bool = True

    def __post_init__(self):
        if not self.razao_social:
            raise ValueError("Razão Social é obrigatória")
