import functools
from flask import request, jsonify, g
from firebase_admin import auth
from src.services.auth_service import AuthService

auth_service = AuthService()

def require_auth(f):
    """Decorator que requer autenticação Firebase"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        # Verifica se é uma rota de desenvolvimento (sem autenticação)
        if request.endpoint and 'dev' in request.endpoint:
            return f(*args, **kwargs)
        
        # Extrai o token do header Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Token de autorização necessário'}), 401
        
        try:
            # Remove "Bearer " do início do token
            token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
            
            # Verifica o token com Firebase
            decoded_token = auth.verify_id_token(token)
            firebase_uid = decoded_token['uid']
            
            # Busca o usuário no banco local
            user = auth_service.get_user_by_firebase_uid(firebase_uid)
            if not user:
                # Se o usuário não existe no banco local, cria automaticamente
                email = decoded_token.get('email')
                display_name = decoded_token.get('name')
                user = auth_service.create_user(firebase_uid, email, display_name)
            
            # Verifica se o usuário está ativo
            if not user.is_active:
                return jsonify({'error': 'Usuário desativado'}), 403
            
            # Adiciona o usuário ao contexto da requisição
            g.current_user = user
            g.firebase_token = decoded_token
            
            return f(*args, **kwargs)
            
        except auth.InvalidIdTokenError:
            return jsonify({'error': 'Token inválido'}), 401
        except auth.ExpiredIdTokenError:
            return jsonify({'error': 'Token expirado'}), 401
        except Exception as e:
            return jsonify({'error': f'Erro de autenticação: {str(e)}'}), 401
    
    return decorated_function

def require_role(required_role):
    """Decorator que requer um papel específico"""
    def decorator(f):
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            # Verifica se é uma rota de desenvolvimento
            if request.endpoint and 'dev' in request.endpoint:
                return f(*args, **kwargs)
            
            # Verifica se o usuário está autenticado
            if not hasattr(g, 'current_user') or not g.current_user:
                return jsonify({'error': 'Usuário não autenticado'}), 401
            
            # Verifica permissões
            if not auth_service.check_user_permission(g.current_user, required_role):
                return jsonify({'error': 'Permissão insuficiente'}), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def require_2fa_verified(f):
    """Decorator que requer verificação 2FA"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        # Verifica se é uma rota de desenvolvimento
        if request.endpoint and 'dev' in request.endpoint:
            return f(*args, **kwargs)
        
        # Verifica se o usuário está autenticado
        if not hasattr(g, 'current_user') or not g.current_user:
            return jsonify({'error': 'Usuário não autenticado'}), 401
        
        user = g.current_user
        
        # Se 2FA está habilitado, verifica sessão válida
        if user.two_factor_enabled:
            if not auth_service.has_valid_2fa_session(user.id):
                return jsonify({
                    'error': 'Verificação 2FA necessária',
                    'requires_2fa': True
                }), 403
        
        return f(*args, **kwargs)
    
    return decorated_function

def optional_auth(f):
    """Decorator para autenticação opcional"""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        # Tenta autenticar, mas não falha se não conseguir
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1] if auth_header.startswith('Bearer ') else auth_header
                decoded_token = auth.verify_id_token(token)
                firebase_uid = decoded_token['uid']
                
                user = auth_service.get_user_by_firebase_uid(firebase_uid)
                if user and user.is_active:
                    g.current_user = user
                    g.firebase_token = decoded_token
            except:
                # Ignora erros de autenticação
                pass
        
        return f(*args, **kwargs)
    
    return decorated_function

