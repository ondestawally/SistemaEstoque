from fastapi import Request, status
from fastapi.responses import JSONResponse

class BusinessRuleException(Exception):
    def __init__(self, message: str):
        self.message = message

def add_exception_handlers(app):
    @app.exception_handler(BusinessRuleException)
    async def business_rule_exception_handler(request: Request, exc: BusinessRuleException):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": exc.message},
        )
