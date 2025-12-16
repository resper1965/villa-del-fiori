# Funcionalidades Principais - Gabi - Síndica Virtual

**Última Atualização**: 2025-01-15

---

## 📋 Visão Geral

**Gabi - Síndica Virtual** é uma aplicação web completa para gestão de processos condominiais com workflow de aprovação por stakeholders. O sistema permite que síndico, conselho e administradora revisem, aprovem ou rejeitem processos, com capacidade de refazer processos baseado em feedback estruturado.

---

## 🎯 Funcionalidades Principais

### 1. 📄 Gestão de Processos Condominiais

**Descrição**: Sistema completo para documentar, organizar e gerenciar processos condominiais de forma estruturada.

**Funcionalidades**:
- ✅ **35 Processos Pré-cadastrados** organizados por categorias:
  - Governança
  - Operação
  - Áreas Comuns
  - Convivência
  - Eventos
  - Emergências
- ✅ **Visualização de Processos** por categoria
- ✅ **Detalhes Completos** de cada processo:
  - Conteúdo estruturado
  - Variáveis aplicadas
  - Entidades envolvidas
  - Histórico de versões
  - Diagramas Mermaid
  - Matriz RACI
- ✅ **Status de Processos**:
  - Rascunho
  - Em Revisão
  - Aprovado
  - Rejeitado
- ✅ **Versionamento Completo**:
  - Histórico de todas as versões
  - Rastreabilidade de mudanças
  - Comparação entre versões

**Benefícios**:
- Centraliza toda documentação de processos
- Facilita consulta e referência
- Mantém histórico completo de mudanças

---

### 2. ✅ Workflow de Aprovação

**Descrição**: Sistema de aprovação multi-stakeholder onde processos precisam ser aprovados antes de serem considerados oficiais.

**Funcionalidades**:
- ✅ **Aprovação por Stakeholders**:
  - Síndico
  - Conselho
  - Administradora
  - Subsíndico
- ✅ **Rejeição com Motivos**:
  - Campo obrigatório de motivo
  - Registro de quem rejeitou e quando
  - Feedback estruturado
- ✅ **Rastreabilidade Completa**:
  - Todas as aprovações registradas
  - Timestamp de cada ação
  - Identificação do stakeholder
- ✅ **Status em Tempo Real**:
  - Visualização clara do status atual
  - Indicadores visuais de progresso
  - Notificações de mudanças

**Benefícios**:
- Garante que processos sejam revisados antes de aprovação
- Facilita comunicação entre stakeholders
- Mantém registro completo de decisões

---

### 3. 🔄 Refazer Processos Baseado em Feedback

**Descrição**: Permite que criadores de processos refaçam processos rejeitados baseado nos motivos de rejeição.

**Funcionalidades**:
- ✅ **Edição de Processos Rejeitados**:
  - Visualização clara dos motivos de rejeição
  - Identificação do stakeholder que rejeitou
  - Data e hora da rejeição
- ✅ **Criação de Nova Versão**:
  - Mantém histórico completo
  - Permite reenvio para aprovação
  - Rastreabilidade de mudanças
- ✅ **Histórico de Versões**:
  - Todas as versões anteriores preservadas
  - Comparação entre versões
  - Resumo de mudanças

**Benefícios**:
- Facilita correção de processos
- Melhora qualidade da documentação
- Mantém histórico completo

---

### 4. 👥 Gestão de Usuários e Permissões (RBAC)

**Descrição**: Sistema completo de gestão de usuários com controle de acesso baseado em roles.

**Funcionalidades**:
- ✅ **Sistema de Aprovação de Usuários**:
  - Novos usuários precisam ser aprovados
  - Administradores aprovam/rejeitam usuários
  - Notificações de status
- ✅ **CRUD Completo de Usuários**:
  - Criar novos usuários
  - Editar informações
  - Aprovar/rejeitar usuários
  - Deletar (desativar) usuários
- ✅ **Roles e Permissões (RBAC)**:
  - **Admin**: Acesso total ao sistema
  - **Syndic (Síndico)**: Pode aprovar processos, gerenciar usuários
  - **Subsindico**: Pode aprovar processos
  - **Council (Conselho)**: Pode aprovar processos
  - **Staff**: Acesso limitado
  - **Resident (Morador)**: Acesso básico, pode usar chat
- ✅ **Controle de Acesso**:
  - Interface adaptada por role
  - Funcionalidades restritas por permissão
  - Proteção de rotas

**Benefícios**:
- Segurança e controle de acesso
- Facilita gestão de equipe
- Garante que apenas usuários autorizados acessem funcionalidades

---

### 5. 🏢 Gestão de Entidades

**Descrição**: Sistema para gerenciar pessoas, empresas, serviços e infraestrutura relacionadas ao condomínio.

**Funcionalidades**:
- ✅ **Tipos de Entidades**:
  - **Pessoa**: Síndico, conselheiro, morador, staff
  - **Empresa**: Administradora, fornecedores
  - **Serviço de Emergência**: Bombeiros, polícia, SAMU
  - **Infraestrutura**: Portão, elevador, sistema de câmeras
- ✅ **Categorias Específicas**:
  - Sindico, conselheiro, administradora
  - Faxineiro, portaria online, segurança
  - Manutenção, jardinagem, dedetização
  - E outros
- ✅ **Informações Completas**:
  - Nome, telefone, email
  - Pessoa de contato
  - Endereço
  - CNPJ (para empresas)
  - Descrição e observações
- ✅ **Status Ativo/Inativo**:
  - Controle de entidades ativas
  - Histórico preservado

**Benefícios**:
- Centraliza informações de contatos
- Facilita referência em processos
- Mantém dados atualizados

---

### 6. 🏘️ Gestão de Condomínio (Mono-Tenant)

**Descrição**: Sistema mono-tenant que gerencia um único condomínio por instalação.

**Funcionalidades**:
- ✅ **Cadastro de Condomínio**:
  - Nome, CNPJ, endereço completo
  - Informações de contato
  - Características (unidades, andares, blocos)
  - Amenidades (piscina, academia, salão de festas)
- ✅ **Setup Obrigatório**:
  - Cadastro de condomínio é obrigatório no início
  - Apenas um condomínio ativo por vez
  - Redirecionamento automático para setup se não houver condomínio
- ✅ **Exibição no Dashboard**:
  - Nome do condomínio ativo
  - Endereço completo
  - Link para gerenciamento

**Benefícios**:
- Foco em um único condomínio
- Interface simplificada
- Dados sempre contextualizados

---

### 7. 🚗 Gestão de Veículos

**Descrição**: Sistema para cadastrar e gerenciar veículos dos moradores do condomínio.

**Funcionalidades**:
- ✅ **Cadastro de Veículos**:
  - Marca, modelo, cor, ano
  - Placa (normalizada automaticamente)
  - Tipo (carro, moto, caminhão)
  - Associação com unidade/stakeholder
- ✅ **Normalização Automática**:
  - Placas normalizadas (maiúsculas, sem espaços/hífens)
  - Validação de formato
- ✅ **Controle de Acesso**:
  - Moradores podem gerenciar seus veículos
  - Admin/síndico podem gerenciar todos

**Benefícios**:
- Facilita controle de acesso
- Mantém registro atualizado
- Melhora segurança do condomínio

---

### 8. 🏠 Gestão de Unidades

**Descrição**: Sistema para gerenciar apartamentos/casas do condomínio.

**Funcionalidades**:
- ✅ **Cadastro de Unidades**:
  - Número identificador
  - Bloco (se aplicável)
  - Andar (se aplicável)
  - Área em m²
  - Vagas de garagem
  - Descrição
- ✅ **Associação com Stakeholders**:
  - Unidades podem ter moradores associados
  - Relacionamento com veículos e pets
- ✅ **Status Ativo/Inativo**:
  - Controle de unidades ativas
  - Histórico preservado

**Benefícios**:
- Organiza estrutura do condomínio
- Facilita associação de dados
- Melhora gestão de informações

---

### 9. 🐾 Gestão de Pets

**Descrição**: Sistema para cadastrar e gerenciar animais de estimação dos moradores.

**Funcionalidades**:
- ✅ **Cadastro de Pets**:
  - Nome, espécie, raça, cor
  - Porte (pequeno, médio, grande)
  - Peso
  - Data de nascimento
  - Número de microchip
  - Status de vacinação
- ✅ **Associação com Unidade**:
  - Pet vinculado a unidade
  - Proprietário (stakeholder)
- ✅ **Controle de Vacinação**:
  - Status de vacinação
  - Data da última vacina

**Benefícios**:
- Facilita controle de pets no condomínio
- Melhora gestão de saúde animal
- Mantém registro atualizado

---

### 10. 💬 Chat com Gabi (Síndica Virtual)

**Descrição**: Assistente inteligente que responde perguntas sobre processos e informações do condomínio.

**Funcionalidades**:
- ✅ **Chat Interativo**:
  - Interface de chat moderna
  - Histórico de conversas
  - Respostas baseadas em processos aprovados
- ✅ **Base de Conhecimento**:
  - Acesso a processos aprovados
  - Informações do condomínio
  - Entidades e contatos
  - Documentos gerais indexados
- ✅ **RAG (Retrieval-Augmented Generation)**:
  - Busca semântica em documentos
  - Respostas contextuais
  - Referências a processos

**Benefícios**:
- Facilita consulta de informações
- Reduz necessidade de buscar manualmente
- Melhora experiência do usuário

---

### 11. 📄 Documentos Gerais

**Descrição**: Sistema de upload e indexação de documentos que não são processos aprovados.

**Funcionalidades**:
- ✅ **Upload de Arquivos**:
  - Suporte a PDF, DOCX, TXT, MD
  - Extração automática de conteúdo
  - Validação de tipo e tamanho (máx. 10MB)
- ✅ **Cadastro Manual**:
  - Copiar e colar conteúdo diretamente
  - Edição do conteúdo extraído
- ✅ **Tipos de Documento**:
  - Regulamentos
  - Convenções
  - Atas
  - Assembleias
  - Editais
  - Comunicados
- ✅ **Indexação Automática**:
  - Documentos são indexados na base de conhecimento
  - Disponíveis para busca no chat
  - Status de ingestão rastreado

**Benefícios**:
- Centraliza documentação do condomínio
- Facilita busca e consulta
- Integra com chat assistente

---

### 12. 🔐 Autenticação e Segurança

**Descrição**: Sistema robusto de autenticação e controle de acesso.

**Funcionalidades**:
- ✅ **Autenticação com Supabase Auth**:
  - Login seguro
  - Recuperação de senha
  - Sessões gerenciadas
- ✅ **Aprovação de Usuários**:
  - Novos usuários precisam aprovação
  - Tela de aguardo de aprovação
  - Notificações de status
- ✅ **Row Level Security (RLS)**:
  - Políticas de segurança no banco
  - Proteção de dados por role
  - Acesso baseado em permissões
- ✅ **Proteção de Rotas**:
  - Middleware de autenticação
  - Redirecionamento automático
  - Guards de acesso

**Benefícios**:
- Segurança robusta
- Controle de acesso granular
- Proteção de dados sensíveis

---

### 13. 📊 Dashboard e Visualizações

**Descrição**: Interface central que exibe informações importantes e status do sistema.

**Funcionalidades**:
- ✅ **Dashboard Principal**:
  - Resumo de processos por status
  - Processos pendentes de aprovação
  - Informações do condomínio ativo
  - Estatísticas rápidas
- ✅ **Indicadores Visuais**:
  - Status coloridos
  - Badges e labels
  - Ícones informativos
- ✅ **Navegação Intuitiva**:
  - Sidebar com menu organizado
  - Breadcrumbs
  - Títulos de página contextuais

**Benefícios**:
- Visão geral rápida do sistema
- Facilita navegação
- Melhora experiência do usuário

---

### 14. 🔔 Sistema de Notificações

**Descrição**: Sistema de notificações em tempo real para alertar sobre eventos importantes.

**Funcionalidades**:
- ✅ **Tipos de Notificações**:
  - Aprovação pendente
  - Processo aprovado/rejeitado
  - Usuário aprovado/rejeitado
  - Processo atualizado
  - Lembretes
- ✅ **Interface de Notificações**:
  - Badge com contador de não lidas
  - Lista de notificações recentes
  - Marcar como lida
  - Marcar todas como lidas
- ✅ **Notificações em Tempo Real**:
  - Atualização automática
  - Indicadores visuais

**Benefícios**:
- Mantém usuários informados
- Facilita acompanhamento de processos
- Melhora comunicação

---

## 🎨 Interface e Experiência do Usuário

### Design System

- ✅ **Design System "ness"**:
  - Filosofia: "Invisível quando funciona, Presente quando importa"
  - Paleta refinada de cinzas profundos
  - Azul primário #00ade8 usado estrategicamente
  - Tipografia: Inter (primária) e Montserrat (títulos)
  - Espaçamento baseado em múltiplos de 4px

### Componentes

- ✅ **shadcn/ui**: Componentes modernos e acessíveis
- ✅ **Tailwind CSS**: Estilização utilitária
- ✅ **Responsivo**: Mobile, tablet e desktop
- ✅ **Acessibilidade**: Componentes a11y-friendly
- ✅ **Loading States**: Skeleton loaders em todas as páginas
- ✅ **Empty States**: Estados vazios informativos
- ✅ **Toast Notifications**: Feedback visual de ações

---

## 📈 Estatísticas do Sistema

### Dados Atuais

- ✅ **35 Processos** pré-cadastrados
- ✅ **7 Categorias** de processos
- ✅ **6 Roles** de usuários
- ✅ **4 Tipos** de entidades
- ✅ **Múltiplas versões** por processo (histórico completo)

### Escala

- ~20 stakeholders (moradores + síndico + conselho + administradora)
- 35 processos pré-cadastrados
- Múltiplas versões por processo (média estimada: 2-3 versões)
- Histórico completo de todas as ações

---

## 🔧 Tecnologias Utilizadas

### Backend

- **Supabase**: PostgreSQL, Auth, Storage, Edge Functions
- **PostgreSQL 15+**: Banco de dados relacional
- **Row Level Security**: Políticas de segurança
- **pgvector**: Extensão para busca vetorial

### Frontend

- **Next.js 14**: Framework React com App Router
- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **React Query**: Gerenciamento de estado server-side
- **TanStack Table**: Tabelas avançadas
- **shadcn/ui**: Componentes de UI
- **Tailwind CSS**: Estilização

### Deploy

- **Vercel**: Frontend
- **Supabase**: Backend

---

## 📝 Notas Importantes

### Escopo Atual

O sistema foca em **gestão documental de processos**, não em operação direta do condomínio. Ele permite documentar, revisar e aprovar processos, mas não executa ou automatiza processos.

### Fora do Escopo

- Geração automática de documentos para publicação
- Execução ou automação dos processos
- Integração com sistemas externos (portaria, câmeras, etc.)
- Gestão financeira ou contábil operacional
- Sistema de votação eletrônica
- Aplicativo mobile nativo (apenas web responsiva)

---

**Última Atualização**: 2025-01-15
