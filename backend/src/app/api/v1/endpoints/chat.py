from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.stakeholder import Stakeholder

router = APIRouter()


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    suggestions: list[str] = []


@router.post("/message", response_model=ChatResponse)
async def chat_message(
    chat_data: ChatMessage,
    db: Session = Depends(get_db),
    current_user: Stakeholder = Depends(get_current_active_user),
):
    """
    Endpoint de chat - Mock inicial
    Retorna uma resposta simples simulada da IA
    """
    user_message = chat_data.message.lower()

    # Respostas mock simples baseadas em palavras-chave
    if any(word in user_message for word in ["horário", "horario", "funciona", "abre", "fecha"]):
        response = "Os horários das áreas comuns variam conforme o tipo. A academia funciona das 6h às 22h. O escritório compartilhado está disponível das 8h às 20h. Para mais informações, consulte o regulamento de uso das áreas comuns."
        suggestions = ["Quais são os horários da academia?", "Como reservar o escritório?"]
    
    elif any(word in user_message for word in ["reserva", "reservar", "agendar", "agendamento"]):
        response = "Para reservar áreas comuns, você pode entrar em contato com a administradora através do email ou telefone. Algumas áreas podem ser reservadas através do sistema online. Consulte o processo de 'Reservas de Áreas Comuns' para mais detalhes."
        suggestions = ["Como funciona a reserva do escritório?", "Quais áreas podem ser reservadas?"]
    
    elif any(word in user_message for word in ["pet", "animal", "cachorro", "gato"]):
        response = "Pets são permitidos no condomínio, mas devem seguir as regras de convivência. É necessário uso de focinheira em áreas comuns quando necessário, manter os animais sempre na coleira e garantir que não causem perturbação aos vizinhos. Consulte o processo de 'Gestão de Pets' para mais informações."
        suggestions = ["Quais são as regras para pets?", "Preciso de autorização para ter pet?"]
    
    elif any(word in user_message for word in ["reclamação", "reclamacao", "problema", "ruído", "ruido", "barulho"]):
        response = "Para registrar uma reclamação ou reportar um problema, você pode entrar em contato com a administradora ou o síndico. Para questões de ruído, consulte o processo de 'Regras de Silêncio' que define os horários de silêncio obrigatório."
        suggestions = ["Qual o horário de silêncio?", "Como reportar um problema?"]
    
    elif any(word in user_message for word in ["elevador", "elevadores", "quebrado", "manutenção", "manutencao"]):
        response = "Em caso de problemas com elevadores, entre em contato imediatamente com a portaria ou administradora. A manutenção preventiva é realizada mensalmente pela empresa contratada. Para emergências, use o telefone de emergência disponível no elevador."
        suggestions = ["Como funciona a manutenção dos elevadores?", "O que fazer se ficar preso no elevador?"]
    
    elif any(word in user_message for word in ["portaria", "visitante", "entrada", "acesso"]):
        response = "O acesso ao condomínio é controlado por biometria facial e digital nas portas sociais, e por controle remoto na garagem. Visitantes devem ser autorizados pelos moradores através do sistema de portaria online. Consulte o processo de 'Controle de Acesso' para mais detalhes."
        suggestions = ["Como autorizar um visitante?", "Como funciona o sistema de biometria?"]
    
    else:
        response = "Olá! Sou a Gabi, Síndica Virtual do Condomínio Villa Dei Fiori. Posso ajudar com informações sobre processos, regras, horários, reservas e muito mais. Como posso ajudá-lo hoje?"
        suggestions = [
            "Quais são os horários das áreas comuns?",
            "Como reservar o escritório?",
            "Quais são as regras para pets?",
        ]

    return ChatResponse(
        response=response,
        suggestions=suggestions,
    )

