import os
import tempfile
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from markitdown import MarkItDown
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from app.core.config import settings
from app.schemas.ingestion import ContractExtractionResponse


class AIIngestionService:
    """Serviço para ingestão de contratos usando IA"""

    def __init__(self):
        self.openai_api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY não configurada. Configure a variável de ambiente ou no settings.")
        
        self.model_name = settings.OPENAI_MODEL
        self.llm = ChatOpenAI(
            model=self.model_name,
            temperature=0.1,  # Baixa temperatura para respostas mais determinísticas
            api_key=self.openai_api_key,
        )
        self.markitdown = MarkItDown()

    async def extract_from_pdf(self, file: UploadFile) -> ContractExtractionResponse:
        """
        Extrai informações estruturadas de um contrato PDF
        
        Args:
            file: Arquivo PDF enviado
            
        Returns:
            ContractExtractionResponse com dados extraídos
            
        Raises:
            HTTPException: Se houver erro ao processar o arquivo
        """
        # Validar tipo de arquivo
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Apenas arquivos PDF são suportados"
            )

        # Salvar arquivo temporariamente
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            try:
                # Ler conteúdo do arquivo
                content = await file.read()
                tmp_file.write(content)
                tmp_file_path = tmp_file.name

                # ETAPA A: Converter PDF -> Markdown
                try:
                    result = self.markitdown.convert(tmp_file_path)
                    markdown_content = result.text_content
                except Exception as e:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Erro ao converter PDF para Markdown: {str(e)}"
                    )

                # ETAPA B: Enviar para IA com structured output
                extraction_result = await self._extract_with_ai(markdown_content)

                return extraction_result

            finally:
                # Limpar arquivo temporário
                if os.path.exists(tmp_file_path):
                    os.unlink(tmp_file_path)

    async def _extract_with_ai(self, markdown_content: str) -> ContractExtractionResponse:
        """
        Extrai informações estruturadas do markdown usando IA
        
        Args:
            markdown_content: Conteúdo do contrato em Markdown
            
        Returns:
            ContractExtractionResponse
        """
        # Criar parser Pydantic
        parser = PydanticOutputParser(pydantic_object=ContractExtractionResponse)

        # Prompt do sistema
        system_prompt = """Você é um especialista em análise de contratos condominiais e extração de processos.

Sua tarefa é analisar um contrato e extrair informações estruturadas para criar um processo condominial.

INSTRUÇÕES:
1. Identifique o título principal do processo/contrato
2. Crie uma descrição clara e completa do processo
3. Identifique todas as entidades mencionadas (pessoas, empresas, serviços, infraestrutura)
4. Extraia as etapas do workflow, incluindo:
   - Ordem sequencial
   - Descrição detalhada
   - Responsável/papel de cada etapa
   - SLAs e prazos mencionados
   - Periodicidade (se aplicável: diário, semanal, mensal, trimestral, anual)
5. Crie uma matriz RACI baseada nas etapas e entidades identificadas
6. Liste ambiguidades ou pontos que precisam de esclarecimento humano

CATEGORIAS DE PROCESSOS:
- governanca: Processos de governança, aprovações, conselhos
- acesso_seguranca: Controle de acesso, segurança, portaria
- operacao: Operações diárias, manutenção, limpeza
- areas_comuns: Uso de áreas comuns, reservas
- convivencia: Regras de convivência, pets, silêncio
- eventos: Eventos, assembleias, reuniões
- emergencias: Procedimentos de emergência

TIPOS DE DOCUMENTOS:
- pop: Procedimento Operacional Padrão
- manual: Manual de procedimentos
- regulamento: Regulamento interno
- fluxograma: Fluxograma de processo
- aviso: Aviso aos moradores
- comunicado: Comunicado oficial
- checklist: Checklist de verificação
- formulario: Formulário
- politica: Política interna

ENTIDADES:
Identifique o tipo de cada entidade:
- pessoa: Síndico, conselheiros, faxineiro, moradores
- empresa: Administradora, fornecedores, empresas de serviços
- servico_emergencia: Bombeiros, polícia, SAMU
- infraestrutura: Portão, elevador, sistemas

MATRIZ RACI:
- R (Responsible): Quem executa a tarefa
- A (Accountable): Quem aprova/é responsável final
- C (Consulted): Quem é consultado antes da execução
- I (Informed): Quem é informado após a execução

Seja preciso e detalhado. Se algo não estiver claro no contrato, liste nas ambiguidades."""

        # Prompt do usuário
        user_prompt = f"""Analise o seguinte contrato e extraia as informações estruturadas:

{markdown_content}

{parser.get_format_instructions()}"""

        # Criar prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_prompt),
        ])

        # Criar chain com structured output
        chain = prompt | self.llm.with_structured_output(ContractExtractionResponse)

        try:
            # Executar extração
            result = await chain.ainvoke({})
            return result
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Erro ao processar com IA: {str(e)}"
            )

