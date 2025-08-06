# Sistema de Advocacia - DocuMerge

Sistema completo para escritórios de advocacia com geração automática de petições, gestão de clientes, teses jurídicas e autenticação de dois fatores.

## 🚀 Funcionalidades

### Autenticação e Usuários
- **Login com 2FA**: Autenticação de dois fatores via email
- **Três tipos de usuário**:
  - **Advogado/Redator**: Pode gerar petições, visualizar e editar suas próprias petições
  - **Advogado/Administrador**: Todas as permissões do redator + gestão de clientes, teses e modelos
  - **Desenvolvedor**: Acesso completo ao sistema + gestão de usuários

### Casos de Uso Implementados
- **UC-01**: Gerar petição a partir de formulário
- **UC-02**: Visualizar e editar petição
- **UC-03**: Salvar petição gerada
- **UC-04**: Cadastrar/Atualizar tese
- **UC-05**: Criar/Editar modelo de petição
- **UC-06**: Vincular tese a perguntas
- **UC-07**: Gerenciar usuários
- **UC-08**: Alternar perfil de acesso
- **UC-09**: Fazer login com 2FA

### Gestão de Conteúdo
- **Clientes**: Cadastro e gestão de clientes/organizações
- **Teses Jurídicas**: Upload e gestão de documentos .docx
- **Modelos de Petição**: Criação de templates com perguntas estruturadas
- **Vinculação Inteligente**: Associação de teses a respostas específicas

### Geração de Petições
- **Formulário Dinâmico**: Baseado no modelo selecionado
- **Mesclagem Automática**: Integração com documentos .docx
- **Prévia e Edição**: Visualização antes do salvamento
- **Download**: Exportação em formato .docx

## 🏗️ Arquitetura

### Backend (Flask)
```
documerge-backend/
├── src/
│   ├── main.py                 # Aplicação principal Flask
│   ├── models/                 # Modelos SQLAlchemy
│   │   ├── user.py
│   │   ├── client.py
│   │   ├── thesis.py
│   │   ├── petition_model.py
│   │   └── petition.py
│   ├── routes/                 # Rotas da API
│   │   ├── auth.py
│   │   ├── legal_content.py
│   │   └── petitions.py
│   ├── services/               # Lógica de negócio
│   │   ├── auth_service.py
│   │   └── document_service.py
│   └── middleware/             # Middlewares
│       └── auth_middleware.py
├── app.py                      # Arquivo principal para deploy
├── requirements.txt            # Dependências Python
├── Procfile                    # Configuração Heroku
└── runtime.txt                 # Versão Python
```

### Frontend (React)
```
documerge-frontend/
├── src/
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/                  # Páginas da aplicação
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── GeneratePetitionPage.jsx
│   │   ├── PetitionsPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── ClientsPage.jsx
│   │   ├── ThesesPage.jsx
│   │   └── PetitionModelsPage.jsx
│   ├── hooks/                  # Hooks customizados
│   │   └── useAuth.jsx
│   └── lib/                    # Utilitários
│       └── utils.js
├── dist/                       # Build de produção
└── package.json                # Dependências Node.js
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Flask**: Framework web Python
- **SQLAlchemy**: ORM para banco de dados
- **Firebase Admin SDK**: Autenticação e gestão de usuários
- **SendGrid**: Envio de emails para 2FA
- **python-docx**: Manipulação de documentos Word
- **Google Cloud Storage**: Armazenamento de arquivos
- **Flask-CORS**: Suporte a CORS

### Frontend
- **React 18**: Framework JavaScript
- **React Router**: Roteamento
- **shadcn/ui**: Biblioteca de componentes
- **Tailwind CSS**: Framework CSS
- **Lucide React**: Ícones
- **Sonner**: Notificações toast
- **Vite**: Build tool

## 📦 Instalação e Configuração

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- pnpm ou npm

### Backend

1. **Instalar dependências**:
```bash
cd documerge-backend
pip install -r requirements.txt
```

2. **Configurar variáveis de ambiente**:
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. **Executar em desenvolvimento**:
```bash
python src/main.py
```

### Frontend

1. **Instalar dependências**:
```bash
cd documerge-frontend
pnpm install
```

2. **Executar em desenvolvimento**:
```bash
pnpm run dev
```

3. **Build para produção**:
```bash
pnpm run build
```

## 🚀 Deploy

### Backend (Heroku)

1. **Criar aplicação no Heroku**:
```bash
heroku create seu-app-backend
```

2. **Configurar variáveis de ambiente**:
```bash
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=sua_chave_secreta
# ... outras variáveis
```

3. **Deploy**:
```bash
git push heroku main
```

### Frontend (Netlify/Vercel)

1. **Build da aplicação**:
```bash
pnpm run build
```

2. **Deploy do diretório `dist/`** na plataforma escolhida

## 🔐 Configuração de Segurança

### Firebase Authentication
1. Criar projeto no Firebase Console
2. Ativar Authentication com Email/Password
3. Gerar chave de serviço (Service Account)
4. Configurar variáveis de ambiente

### SendGrid
1. Criar conta no SendGrid
2. Gerar API Key
3. Configurar domínio de envio
4. Adicionar API Key nas variáveis de ambiente

### Google Cloud Storage
1. Criar projeto no Google Cloud
2. Ativar Cloud Storage API
3. Criar bucket para arquivos
4. Configurar credenciais de serviço

## 👥 Usuários de Teste

Para demonstração, use as seguintes credenciais:

- **Administrador**: admin@advocacia.com / 123456
- **Redator**: redator@advocacia.com / 123456  
- **Desenvolvedor**: dev@advocacia.com / 123456

## 📋 Casos de Uso Detalhados

### UC-01: Gerar Petição a partir de Formulário
1. Usuário seleciona cliente e modelo de petição
2. Preenche formulário com perguntas específicas
3. Sistema gera petição baseada nas respostas e teses vinculadas
4. Usuário visualiza prévia e confirma salvamento

### UC-02: Visualizar e Editar Petição
1. Usuário acessa lista de petições
2. Seleciona petição para visualizar
3. Pode editar título, descrição e conteúdo
4. Salva alterações

### UC-03: Salvar Petição Gerada
1. Sistema salva petição com metadados
2. Gera arquivo .docx para download
3. Mantém histórico de alterações

### UC-04: Cadastrar/Atualizar Tese
1. Administrador faz upload de arquivo .docx
2. Sistema armazena tese com metadados
3. Tese fica disponível para vinculação

### UC-05: Criar/Editar Modelo de Petição
1. Administrador cria modelo com perguntas
2. Define estrutura hierárquica de perguntas
3. Modelo fica disponível para geração

### UC-06: Vincular Tese a Perguntas
1. Administrador seleciona tese e pergunta
2. Define condições para aplicação da tese
3. Sistema usa vinculação na geração automática

### UC-07: Gerenciar Usuários
1. Administrador/Dev lista usuários
2. Pode criar, editar ou desativar usuários
3. Define papéis e permissões

### UC-08: Alternar Perfil de Acesso
1. Usuário com múltiplos papéis pode alternar
2. Interface adapta-se às permissões do papel ativo

### UC-09: Fazer Login com 2FA
1. Usuário insere email e senha
2. Sistema envia código por email
3. Usuário confirma código para acesso

## 🔧 Manutenção

### Logs
- Backend: Logs do Flask disponíveis via Heroku logs
- Frontend: Logs do browser para debugging

### Backup
- Banco de dados: Backup automático via Heroku Postgres
- Arquivos: Backup via Google Cloud Storage

### Monitoramento
- Uptime: Heroku metrics
- Performance: Lighthouse para frontend
- Erros: Sentry (opcional)

## 📞 Suporte

Para suporte técnico ou dúvidas sobre implementação, consulte:
- Documentação das APIs no código
- Comentários inline no código fonte
- Casos de teste implementados

## 📄 Licença

Este projeto foi desenvolvido especificamente para o escritório de advocacia solicitante. Todos os direitos reservados.

