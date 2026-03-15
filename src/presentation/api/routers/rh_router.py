"""
Router — RH (Recursos Humanos)
Cargos, Funcionários, Folha de Pagamento, Ponto
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

from infrastructure.database import get_db
from infrastructure.orm_models.rh_models import (
    CargoORM, FuncionarioORM, FolhaPagamentoORM, RegistroPontoORM
)
from domain.rh.funcionarios import FolhaPagamento
from presentation.api.routers.auth_router import require_role, get_current_user
from infrastructure.audit import log_audit
from infrastructure.orm_models.auth_models import UserORM

router = APIRouter(
    prefix="/rh", 
    tags=["RH - Recursos Humanos"],
    dependencies=[Depends(require_role(["ADMIN", "RH_USER"]))]
)


# ─────────────────────────── DTOs ───────────────────────────

class CargoDTO(BaseModel):
    id: str
    nome: str
    nivel: str
    salario_base: float
    descricao: Optional[str] = None


class FuncionarioDTO(BaseModel):
    id: str
    nome: str
    cpf: str
    cargo_id: str
    data_admissao: str   # "YYYY-MM-DD"
    email: Optional[str] = None
    telefone: Optional[str] = None
    num_dependentes: int = 0
    salario_atual: Optional[float] = None


class StatusUpdateDTO(BaseModel):
    status: str  # ATIVO, FERIAS, AFASTADO, DEMITIDO


class FolhaGerarDTO(BaseModel):
    id: str
    mes: int
    ano: int
    funcionario_id: str
    outros_descontos: float = 0.0
    outros_acrescimos: float = 0.0
    observacao: Optional[str] = None


class PontoDTO(BaseModel):
    id: str
    funcionario_id: str
    data: str       # "YYYY-MM-DD"
    entrada: Optional[str] = None   # "HH:MM"
    saida: Optional[str] = None     # "HH:MM"
    observacao: Optional[str] = None


# ─────────────────────────── CARGOS ───────────────────────────

@router.post("/cargos/", status_code=201)
def criar_cargo(dto: CargoDTO, db: Session = Depends(get_db)):
    if db.query(CargoORM).filter(CargoORM.id == dto.id).first():
        raise HTTPException(status_code=409, detail="Cargo já existe")
    orm = CargoORM(id=dto.id, nome=dto.nome, nivel=dto.nivel,
                   salario_base=dto.salario_base, descricao=dto.descricao)
    db.add(orm); db.commit()
    return {"message": "Cargo criado", "id": dto.id}


@router.get("/cargos/")
def listar_cargos(db: Session = Depends(get_db)):
    cargos = db.query(CargoORM).filter(CargoORM.ativo == True).order_by(CargoORM.nome).all()
    return [{"id": c.id, "nome": c.nome, "nivel": c.nivel, "salario_base": float(c.salario_base), "descricao": c.descricao} for c in cargos]


# ─────────────────────────── FUNCIONÁRIOS ───────────────────────────

@router.post("/funcionarios/", status_code=201)
def criar_funcionario(dto: FuncionarioDTO, db: Session = Depends(get_db)):
    if db.query(FuncionarioORM).filter(FuncionarioORM.cpf == dto.cpf).first():
        raise HTTPException(status_code=409, detail=f"CPF {dto.cpf} já cadastrado")
    orm = FuncionarioORM(
        id=dto.id, nome=dto.nome, cpf=dto.cpf, cargo_id=dto.cargo_id,
        data_admissao=date.fromisoformat(dto.data_admissao),
        email=dto.email, telefone=dto.telefone,
        num_dependentes=dto.num_dependentes, salario_atual=dto.salario_atual,
        status="ATIVO"
    )
    db.add(orm); db.commit()
    return {"message": "Funcionário cadastrado", "id": dto.id}


@router.get("/funcionarios/")
def listar_funcionarios(status: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(FuncionarioORM)
    if status:
        q = q.filter(FuncionarioORM.status == status.upper())
    funcs = q.order_by(FuncionarioORM.nome).all()
    return [
        {
            "id": f.id, "nome": f.nome, "cpf": f.cpf, "cargo_id": f.cargo_id,
            "data_admissao": str(f.data_admissao), "status": f.status,
            "email": f.email, "num_dependentes": f.num_dependentes,
            "salario_atual": float(f.salario_atual) if f.salario_atual else None,
        }
        for f in funcs
    ]


@router.patch("/funcionarios/{func_id}/status")
def atualizar_status(func_id: str, dto: StatusUpdateDTO, db: Session = Depends(get_db)):
    VALIDOS = {"ATIVO", "FERIAS", "AFASTADO", "DEMITIDO"}
    if dto.status.upper() not in VALIDOS:
        raise HTTPException(status_code=400, detail=f"Status inválido. Permitidos: {VALIDOS}")
    func = db.query(FuncionarioORM).filter(FuncionarioORM.id == func_id).first()
    if not func:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")
    func.status = dto.status.upper()
    db.commit()
    return {"message": f"Status → {func.status}"}


# ─────────────────────────── FOLHA DE PAGAMENTO ───────────────────────────

@router.post("/folha/", status_code=201)
def gerar_folha(dto: FolhaGerarDTO, db: Session = Depends(get_db), current_user: UserORM = Depends(get_current_user)):
    func = db.query(FuncionarioORM).filter(FuncionarioORM.id == dto.funcionario_id).first()
    if not func:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado")

    # Usa salário do funcionário ou do cargo
    if func.salario_atual:
        salario_bruto = float(func.salario_atual)
    else:
        cargo = db.query(CargoORM).filter(CargoORM.id == func.cargo_id).first()
        salario_bruto = float(cargo.salario_base) if cargo else 0.0

    # Calcula via domínio
    folha = FolhaPagamento(
        id=dto.id, mes=dto.mes, ano=dto.ano,
        funcionario_id=dto.funcionario_id, salario_bruto=salario_bruto,
        num_dependentes=func.num_dependentes,
        outros_descontos=dto.outros_descontos,
        outros_acrescimos=dto.outros_acrescimos,
    )
    inss = folha.calcular_inss()
    irrf = folha.calcular_irrf()
    liquido = folha.salario_liquido()

    orm = FolhaPagamentoORM(
        id=dto.id, mes=dto.mes, ano=dto.ano, funcionario_id=dto.funcionario_id,
        salario_bruto=salario_bruto, desconto_inss=inss, desconto_irrf=irrf,
        outros_descontos=dto.outros_descontos, outros_acrescimos=dto.outros_acrescimos,
        salario_liquido=liquido, num_dependentes=func.num_dependentes,
        observacao=dto.observacao
    )
    db.add(orm); db.commit()
    
    log_audit(db, current_user.id, current_user.username, "CREATE", "FolhaPagamento", dto.id, {"funcionario_id": dto.funcionario_id, "mes": dto.mes, "ano": dto.ano})
    
    return {
        "message": "Folha gerada com sucesso",
        "funcionario": func.nome,
        "salario_bruto": salario_bruto,
        "inss": inss,
        "irrf": irrf,
        "outros_descontos": dto.outros_descontos,
        "outros_acrescimos": dto.outros_acrescimos,
        "salario_liquido": liquido,
    }


@router.get("/folha/")
def listar_folha(mes: Optional[int] = None, ano: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(FolhaPagamentoORM)
    if mes: q = q.filter(FolhaPagamentoORM.mes == mes)
    if ano: q = q.filter(FolhaPagamentoORM.ano == ano)
    folhas = q.order_by(FolhaPagamentoORM.ano.desc(), FolhaPagamentoORM.mes.desc()).all()
    return [
        {
            "id": f.id, "mes": f.mes, "ano": f.ano, "funcionario_id": f.funcionario_id,
            "salario_bruto": float(f.salario_bruto), "desconto_inss": float(f.desconto_inss),
            "desconto_irrf": float(f.desconto_irrf), "outros_descontos": float(f.outros_descontos),
            "outros_acrescimos": float(f.outros_acrescimos), "salario_liquido": float(f.salario_liquido),
            "observacao": f.observacao,
        }
        for f in folhas
    ]


# ─────────────────────────── PONTO ───────────────────────────

@router.post("/ponto/", status_code=201)
def registrar_ponto(dto: PontoDTO, db: Session = Depends(get_db), current_user: UserORM = Depends(get_current_user)):
    # Calcula horas
    horas = None
    if dto.entrada and dto.saida:
        h_e, m_e = map(int, dto.entrada.split(":"))
        h_s, m_s = map(int, dto.saida.split(":"))
        mins = (h_s * 60 + m_s) - (h_e * 60 + m_e)
        horas = round(mins / 60, 2) if mins > 0 else 0.0

    orm = RegistroPontoORM(
        id=dto.id, funcionario_id=dto.funcionario_id,
        data=date.fromisoformat(dto.data),
        entrada=dto.entrada, saida=dto.saida,
        horas_trabalhadas=horas, observacao=dto.observacao
    )
    db.add(orm); db.commit()
    
    log_audit(db, current_user.id, current_user.username, "CREATE", "RegistroPonto", dto.id, {"funcionario_id": dto.funcionario_id, "data": dto.data})
    
    return {"message": "Ponto registrado", "horas_trabalhadas": horas}


@router.get("/ponto/")
def listar_ponto(funcionario_id: Optional[str] = None, mes: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(RegistroPontoORM)
    if funcionario_id: q = q.filter(RegistroPontoORM.funcionario_id == funcionario_id)
    if mes: q = q.filter(RegistroPontoORM.data.between(
        date(date.today().year, mes, 1),
        date(date.today().year, mes, 28)
    ))
    registros = q.order_by(RegistroPontoORM.data.desc()).all()
    return [
        {
            "id": r.id, "funcionario_id": r.funcionario_id, "data": str(r.data),
            "entrada": r.entrada, "saida": r.saida, "horas_trabalhadas": r.horas_trabalhadas,
            "observacao": r.observacao,
        }
        for r in registros
    ]


# ─────────────────────────── RESUMO RH ───────────────────────────

@router.get("/resumo/")
def resumo_rh(db: Session = Depends(get_db)):
    total = db.query(FuncionarioORM).count()
    ativos = db.query(FuncionarioORM).filter(FuncionarioORM.status == "ATIVO").count()
    ferias = db.query(FuncionarioORM).filter(FuncionarioORM.status == "FERIAS").count()
    from sqlalchemy import func
    total_folha = db.query(func.sum(FolhaPagamentoORM.salario_liquido)).filter(
        FolhaPagamentoORM.mes == datetime.utcnow().month,
        FolhaPagamentoORM.ano == datetime.utcnow().year
    ).scalar() or 0.0
    return {
        "total_funcionarios": total,
        "ativos": ativos,
        "em_ferias": ferias,
        "massa_salarial_liquida_mes": float(total_folha),
    }
