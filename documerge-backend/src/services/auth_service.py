import os
import pyotp
import random
import string
from datetime import datetime, timedelta
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from firebase_admin import auth
from src.models.user import db, User, TwoFactorCode, TwoFactorSession

class AuthService:
    def __init__(self):
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        self.from_email = os.getenv('FROM_EMAIL', 'noreply@advocacia.com')
        
    def create_user(self, firebase_uid, email, display_name=None, role='advogado_redator', must_change_password=False, two_factor_enabled=True):
        """Cria um novo usuário no banco de dados local"""
        try:
            # Verifica se o usuário já existe
            existing_user = User.query.filter_by(firebase_uid=firebase_uid).first()
            if existing_user:
                return existing_user
            
            # Cria novo usuário
            user = User(
                firebase_uid=firebase_uid,
                email=email,
                display_name=display_name,
                role=role,
                must_change_password=must_change_password,
                two_factor_enabled=two_factor_enabled
            )
            
            db.session.add(user)
            db.session.commit()
            
            return user
        except Exception as e:
            db.session.rollback()
            raise e
    
    def create_firebase_user(self, email, password, display_name=None, role='advogado_redator', must_change_password=True):
        """Cria usuário no Firebase e no banco local, com flag de troca de senha."""
        try:
            fb_user = auth.create_user(
                email=email,
                password=password,
                display_name=display_name,
                email_verified=False
            )
            # Define custom claims com o papel
            try:
                auth.set_custom_user_claims(fb_user.uid, {'role': role})
            except Exception as e:
                print(f"Falha ao setar claims: {e}")
# Cria no banco local
            user = self.create_user(fb_user.uid, email, display_name, role, must_change_password=must_change_password, two_factor_enabled=True)
            return user
        except Exception as e:
            raise e

    def update_firebase_password(self, firebase_uid, new_password):
        """Atualiza a senha no Firebase."""
        try:
            auth.update_user(firebase_uid, password=new_password)
            return True
        except Exception as e:
            print(f"Erro ao atualizar senha no Firebase: {e}")
            return False

    def get_user_by_firebase_uid(self, firebase_uid):
        """Busca usuário pelo Firebase UID"""
        return User.query.filter_by(firebase_uid=firebase_uid).first()
    
    def get_user_by_email(self, email):
        """Busca usuário pelo email"""
        return User.query.filter_by(email=email).first()
    
    def enable_two_factor(self, user_id):
        """Habilita 2FA para um usuário"""
        try:
            user = User.query.get(user_id)
            if not user:
                return None
            
            # Gera um secret para TOTP (caso queira usar TOTP no futuro)
            secret = pyotp.random_base32()
            
            user.two_factor_enabled = True
            user.two_factor_secret = secret
            user.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            return user
        except Exception as e:
            db.session.rollback()
            raise e
    
    def disable_two_factor(self, user_id):
        """Desabilita 2FA para um usuário"""
        try:
            user = User.query.get(user_id)
            if not user:
                return None
            
            user.two_factor_enabled = False
            user.two_factor_secret = None
            user.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            return user
        except Exception as e:
            db.session.rollback()
            raise e
    
    def generate_2fa_code(self, user_id):
        """Gera um código 2FA e envia por email"""
        try:
            user = User.query.get(user_id)
            if not user or not user.two_factor_enabled:
                return False
            
            # Gera código de 6 dígitos
            code = ''.join(random.choices(string.digits, k=6))
            
            # Define expiração (5 minutos)
            expires_at = datetime.utcnow() + timedelta(minutes=5)
            
            # Salva o código no banco
            two_factor_code = TwoFactorCode(
                user_id=user_id,
                code=code,
                expires_at=expires_at
            )
            
            db.session.add(two_factor_code)
            db.session.commit()
            
            # Envia por email
            self._send_2fa_email(user.email, code, user.display_name or user.email)
            
            return True
        except Exception as e:
            db.session.rollback()
            raise e
    
    def verify_2fa_code(self, user_id, code):
        """Verifica um código 2FA e cria sessão de 2FA se válido"""
        try:
            # Busca código válido não usado
            two_factor_code = TwoFactorCode.query.filter_by(
                user_id=user_id,
                code=code,
                used=False
            ).filter(
                TwoFactorCode.expires_at > datetime.utcnow()
            ).first()
            
            if not two_factor_code:
                return False
            
            # Marca como usado
            two_factor_code.used = True
            
            # Cria uma sessão de 2FA válida por 12 horas
            session = TwoFactorSession(
                user_id=user_id,
                valid_until=datetime.utcnow() + timedelta(hours=12)
            )
            db.session.add(session)
            db.session.commit()
            
            return True
        except Exception as e:
            db.session.rollback()
            raise e
    
    def has_valid_2fa_session(self, user_id):
        """Verifica se o usuário possui sessão 2FA válida"""
        try:
            session = TwoFactorSession.query.filter_by(user_id=user_id).filter(
                TwoFactorSession.valid_until > datetime.utcnow()
            ).order_by(TwoFactorSession.valid_until.desc()).first()
            return session is not None
        except Exception:
            return False

    def _send_2fa_email(self, to_email, code, display_name):
        """Envia email com código 2FA"""
        if not self.sendgrid_api_key:
            print(f"SendGrid não configurado. Código 2FA para {to_email}: {code}")
            return
        
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject='Código de Verificação - Sistema Advocacia',
                html_content=f'''
                <html>
                <body>
                    <h2>Código de Verificação</h2>
                    <p>Olá {display_name},</p>
                    <p>Seu código de verificação é: <strong>{code}</strong></p>
                    <p>Este código expira em 5 minutos.</p>
                    <p>Se você não solicitou este código, ignore este email.</p>
                    <br>
                    <p>Atenciosamente,<br>Sistema Advocacia</p>
                </body>
                </html>
                '''
            )
            
            sg = SendGridAPIClient(api_key=self.sendgrid_api_key)
            response = sg.send(message)
            
            print(f"Email 2FA enviado para {to_email}. Status: {response.status_code}")
            
        except Exception as e:
            print(f"Erro ao enviar email 2FA: {str(e)}")
            # Em desenvolvimento, apenas imprime o código
            print(f"Código 2FA para {to_email}: {code}")
    
    def update_user_role(self, user_id, new_role):
        """Atualiza o papel de um usuário"""
        try:
            user = User.query.get(user_id)
            if not user:
                return None
            
            # Valida o papel
            valid_roles = ['advogado_redator', 'advogado_administrador', 'dev']
            if new_role not in valid_roles:
                raise ValueError(f"Papel inválido: {new_role}")
            
            user.role = new_role
            user.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            # Atualiza custom claims no Firebase
            try:
                auth.set_custom_user_claims(user.firebase_uid, {'role': new_role})
            except Exception as firebase_error:
                print(f"Erro ao atualizar custom claims no Firebase: {firebase_error}")
            
            return user
        except Exception as e:
            db.session.rollback()
            raise e
    
    def deactivate_user(self, user_id):
        """Desativa um usuário"""
        try:
            user = User.query.get(user_id)
            if not user:
                return None
            
            user.is_active = False
            user.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            return user
        except Exception as e:
            db.session.rollback()
            raise e
    
    def activate_user(self, user_id):
        """Ativa um usuário"""
        try:
            user = User.query.get(user_id)
            if not user:
                return None
            
            user.is_active = True
            user.updated_at = datetime.utcnow()
            
            db.session.commit()
            
            return user
        except Exception as e:
            db.session.rollback()
            raise e
    
    def list_users(self):
        """Lista todos os usuários"""
        return User.query.all()
    
    def check_user_permission(self, user, required_role):
        """Verifica se o usuário tem permissão para uma ação"""
        if not user or not user.is_active:
            return False
        
        # Dev tem todas as permissões
        if user.role == 'dev':
            return True
        
        # Advogado Administrador tem permissões de administração
        if user.role == 'advogado_administrador' and required_role in ['advogado_administrador', 'advogado_redator']:
            return True
        
        # Advogado Redator tem apenas suas próprias permissões
        if user.role == 'advogado_redator' and required_role == 'advogado_redator':
            return True
        
        return False

