# Guia de Deploy - Sistema de Advocacia

Este guia fornece instruções passo a passo para fazer o deploy da aplicação em ambiente de produção.

## 🎯 Opções de Deploy

### 1. Deploy Completo (Recomendado)
- **Backend**: Heroku, Railway, ou DigitalOcean App Platform
- **Frontend**: Netlify, Vercel, ou GitHub Pages
- **Banco de Dados**: PostgreSQL (Heroku Postgres, Supabase, ou AWS RDS)
- **Arquivos**: Google Cloud Storage ou AWS S3

### 2. Deploy Simplificado
- **Full-Stack**: Heroku com arquivos locais
- **Banco de Dados**: SQLite (para testes)

## 🚀 Deploy do Backend

### Opção A: Heroku (Recomendado)

#### 1. Preparação
```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login no Heroku
heroku login

# Navegar para o diretório do backend
cd documerge-backend
```

#### 2. Criar aplicação
```bash
# Criar app no Heroku
heroku create seu-app-advocacia-backend

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini
```

#### 3. Configurar variáveis de ambiente
```bash
# Configurações básicas
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=$(openssl rand -base64 32)

# Firebase (obter do Firebase Console)
heroku config:set FIREBASE_PROJECT_ID=seu_projeto_firebase
heroku config:set FIREBASE_PRIVATE_KEY_ID=sua_private_key_id
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua_private_key_aqui\n-----END PRIVATE KEY-----\n"
heroku config:set FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu_projeto.iam.gserviceaccount.com
heroku config:set FIREBASE_CLIENT_ID=seu_client_id

# SendGrid (obter do SendGrid)
heroku config:set SENDGRID_API_KEY=sua_api_key_sendgrid
heroku config:set SENDGRID_FROM_EMAIL=noreply@seudominio.com

# Google Cloud Storage (opcional)
heroku config:set GOOGLE_CLOUD_PROJECT=seu_projeto_gcp
heroku config:set GOOGLE_CLOUD_BUCKET=seu_bucket_storage

# CORS (adicionar domínio do frontend)
heroku config:set CORS_ORIGINS=https://seu-frontend.netlify.app
```

#### 4. Deploy
```bash
# Inicializar git (se necessário)
git init
git add .
git commit -m "Initial commit"

# Adicionar remote do Heroku
heroku git:remote -a seu-app-advocacia-backend

# Deploy
git push heroku main

# Verificar logs
heroku logs --tail
```

### Opção B: Railway

#### 1. Preparação
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login no Railway
railway login
```

#### 2. Deploy
```bash
# Navegar para o backend
cd documerge-backend

# Inicializar projeto Railway
railway init

# Adicionar PostgreSQL
railway add postgresql

# Deploy
railway up
```

#### 3. Configurar variáveis
```bash
# Configurar via Railway Dashboard ou CLI
railway variables set FLASK_ENV=production
railway variables set SECRET_KEY=$(openssl rand -base64 32)
# ... outras variáveis
```

## 🌐 Deploy do Frontend

### Opção A: Netlify (Recomendado)

#### 1. Build local
```bash
cd documerge-frontend
pnpm run build
```

#### 2. Deploy via Netlify CLI
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login no Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### 3. Configurar variáveis de ambiente
```bash
# No Netlify Dashboard, adicionar:
# VITE_API_URL=https://seu-backend.herokuapp.com
```

### Opção B: Vercel

#### 1. Deploy via Vercel CLI
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login no Vercel
vercel login

# Deploy
cd documerge-frontend
vercel --prod
```

#### 2. Configurar variáveis
```bash
# Via Vercel Dashboard ou CLI
vercel env add VITE_API_URL production
# Inserir: https://seu-backend.herokuapp.com
```

### Opção C: GitHub Pages

#### 1. Configurar base URL
```javascript
// vite.config.js
export default defineConfig({
  base: '/nome-do-repositorio/',
  // ... outras configurações
})
```

#### 2. Build e deploy
```bash
pnpm run build
npx gh-pages -d dist
```

## 🔧 Configurações de Produção

### 1. Firebase Setup

#### Criar projeto Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Crie novo projeto
3. Ative Authentication > Email/Password
4. Vá em Project Settings > Service Accounts
5. Gere nova chave privada
6. Use os dados da chave nas variáveis de ambiente

### 2. SendGrid Setup

#### Configurar SendGrid
1. Crie conta no [SendGrid](https://sendgrid.com)
2. Vá em Settings > API Keys
3. Crie nova API Key com permissões de envio
4. Configure domínio de envio (opcional)
5. Use a API Key nas variáveis de ambiente

### 3. Google Cloud Storage (Opcional)

#### Configurar GCS
1. Crie projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Ative Cloud Storage API
3. Crie bucket para arquivos
4. Crie Service Account com permissões de Storage
5. Baixe chave JSON e configure variáveis

### 4. Banco de Dados

#### PostgreSQL (Produção)
```bash
# Heroku Postgres
heroku addons:create heroku-postgresql:mini

# Ou configurar DATABASE_URL manualmente
heroku config:set DATABASE_URL=postgresql://user:pass@host:port/db
```

#### SQLite (Desenvolvimento)
```bash
# Usar SQLite local (padrão)
# Arquivo será criado automaticamente
```

## 🔒 Configurações de Segurança

### 1. HTTPS
- Heroku: HTTPS automático
- Netlify: HTTPS automático
- Outros: Configurar certificado SSL

### 2. CORS
```bash
# Configurar origens permitidas
heroku config:set CORS_ORIGINS=https://seu-frontend.com,https://www.seu-frontend.com
```

### 3. Variáveis Sensíveis
- Nunca commitar arquivos .env
- Usar variáveis de ambiente da plataforma
- Rotacionar chaves regularmente

## 📊 Monitoramento

### 1. Logs
```bash
# Heroku
heroku logs --tail -a seu-app-backend

# Railway
railway logs

# Netlify
netlify logs
```

### 2. Uptime
- Configurar monitoring (UptimeRobot, Pingdom)
- Alertas por email/SMS

### 3. Performance
- Lighthouse para frontend
- New Relic ou Datadog para backend

## 🔄 CI/CD (Opcional)

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "seu-app-backend"
          heroku_email: "seu@email.com"
          appdir: "documerge-backend"
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd documerge-frontend && npm install && npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=documerge-frontend/dist
        env:
          NETLIFY_AUTH_TOKEN: ${{secrets.NETLIFY_AUTH_TOKEN}}
          NETLIFY_SITE_ID: ${{secrets.NETLIFY_SITE_ID}}
```

## 🆘 Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS
```bash
# Verificar CORS_ORIGINS
heroku config:get CORS_ORIGINS

# Adicionar origem do frontend
heroku config:set CORS_ORIGINS=https://seu-frontend.com
```

#### 2. Erro de Database
```bash
# Verificar DATABASE_URL
heroku config:get DATABASE_URL

# Resetar database (cuidado!)
heroku pg:reset DATABASE_URL
```

#### 3. Erro de Build Frontend
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar variáveis de ambiente
echo $VITE_API_URL
```

#### 4. Erro de Firebase
```bash
# Verificar configuração
heroku config:get FIREBASE_PROJECT_ID

# Testar credenciais localmente
python -c "import firebase_admin; print('Firebase OK')"
```

### Logs Úteis
```bash
# Backend
heroku logs --tail --source app

# Frontend (browser)
# Abrir DevTools > Console

# Database
heroku pg:logs
```

## 📞 Suporte

### Recursos Úteis
- [Heroku Dev Center](https://devcenter.heroku.com/)
- [Netlify Docs](https://docs.netlify.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com/)

### Checklist de Deploy
- [ ] Backend deployado e funcionando
- [ ] Frontend deployado e funcionando
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Firebase Authentication funcionando
- [ ] SendGrid enviando emails
- [ ] CORS configurado corretamente
- [ ] HTTPS ativo
- [ ] Logs sendo gerados
- [ ] Monitoramento configurado

### Próximos Passos
1. Configurar domínio customizado
2. Implementar backup automático
3. Configurar alertas de monitoramento
4. Otimizar performance
5. Implementar analytics

