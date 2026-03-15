import re
from dataclasses import dataclass
from decimal import Decimal

@dataclass(frozen=True)
class CNPJ:
    numero: str

    def __post_init__(self):
        # Remove caracteres não numéricos
        numero_limpo = re.sub(r'[^0-9]', '', self.numero)
        if len(numero_limpo) != 14:
            raise ValueError(f"CNPJ inválido: {self.numero}")
        # Uma implementação real de CNPJ teria o cálculo dos dígitos verificadores
        # Para fins didáticos e simplificação, mantemos apenas o tamanho
        object.__setattr__(self, 'numero', numero_limpo)

    def formatado(self) -> str:
        return f"{self.numero[:2]}.{self.numero[2:5]}.{self.numero[5:8]}/{self.numero[8:12]}-{self.numero[12:]}"


@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str = "BRL"

    def __post_init__(self):
        if not isinstance(self.amount, Decimal):
            object.__setattr__(self, 'amount', Decimal(str(self.amount)))
            
    def __add__(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError("Não é possível somar valores com moedas diferentes.")
        return Money(self.amount + other.amount, self.currency)

    def __sub__(self, other: 'Money') -> 'Money':
        if self.currency != other.currency:
            raise ValueError("Não é possível subtrair valores com moedas diferentes.")
        return Money(self.amount - other.amount, self.currency)

    def __mul__(self, multiplier: int | Decimal | float) -> 'Money':
        total = self.amount * Decimal(str(multiplier))
        return Money(total, self.currency)

    def formatado(self) -> str:
        sinal = "R$" if self.currency == "BRL" else self.currency
        return f"{sinal} {self.amount:,.2f}".replace(",", "_").replace(".", ",").replace("_", ".")
