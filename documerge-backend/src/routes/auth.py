from flask import Blueprint, request, jsonify, g
from src.middleware.auth_middleware import require_auth, require_role
from src.services.auth_service import AuthService
from src.models.user import db
from datetime import datetime
from firebase_admin import auth as fb_auth

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()

@auth_bp.route('/login', methods=['POST'])
@require_auth
def login():
    """Endpoint de login - verifica se 2FA é necessário e se precisa trocar a senha"""
    try:
        user = g.current_user
        
        response_data = {
            'user': user.to_dict(),
            'requires_2fa': user.two_factor_enabled,
            'must_change_password': user.must_change_password
        }
        
        # Se 2FA está habilitado, gera e envia código
        if user.two_factor_enabled:
            success = auth_service.generate_2fa_code(user.id)
            if not success:
                return jsonify({'error': 'Erro ao gerar código 2FA'}), 500
            
            response_data['message'] = 'Código 2FA enviado para seu email'
        else:
            response_data['message'] = 'Login realizado com sucesso'
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro no login: {str(e)}'}), 500

@auth_bp.route('/verify-2fa', methods=['POST'])
@require_auth
def verify_2fa():
    """Verifica código 2FA e registra sessão 2FA"""
    try:
        data = request.get_json()
        code = data.get('code')
        
        if not code:
            return jsonify({'error': 'Código é obrigatório'}), 400
        
        user = g.current_user
        
        # Verifica o código
        is_valid = auth_service.verify_2fa_code(user.id, code)
        
        if not is_valid:
            return jsonify({'error': 'Código inválido ou expirado'}), 400
        
        return jsonify({
            'message': '2FA verificado com sucesso',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro na verificação 2FA: {str(e)}'}), 500

@auth_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    """Retorna perfil do usuário atual"""
    try:
        user = g.current_user
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar perfil: {str(e)}'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@require_auth
def change_password():
    """Troca a senha do usuário logado (usado no primeiro login)"""
    try:
        data = request.get_json()
        new_password = data.get('new_password')
        if not new_password or len(new_password) < 6:
            return jsonify({'error': 'Senha inválida (mínimo 6 caracteres)'}), 400
        
        user = g.current_user
        
        # Atualiza senha no Firebase
        updated = auth_service.update_firebase_password(user.firebase_uid, new_password)
        if not updated:
            return jsonify({'error': 'Falha ao atualizar senha no Firebase'}), 500
        
        # Atualiza flags locais
        user.must_change_password = False
        user.last_password_change = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Senha alterada com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao alterar senha: {str(e)}'}), 500

@auth_bp.route('/enable-2fa', methods=['POST'])
@require_auth
def enable_2fa():
    """Habilita 2FA para o usuário atual"""
    try:
        user = g.current_user
        
        updated_user = auth_service.enable_two_factor(user.id)
        if not updated_user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({
            'message': '2FA habilitado com sucesso',
            'user': updated_user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao habilitar 2FA: {str(e)}'}), 500

@auth_bp.route('/disable-2fa', methods=['POST'])
@require_auth
def disable_2fa():
    """Desabilita 2FA para o usuário atual"""
    try:
        user = g.current_user
        
        updated_user = auth_service.disable_two_factor(user.id)
        if not updated_user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({
            'message': '2FA desabilitado com sucesso',
            'user': updated_user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao desabilitar 2FA: {str(e)}'}), 500

@auth_bp.route('/users', methods=['POST'])
@require_auth
@require_role('advogado_administrador')
def admin_create_user():
    """Administrador cria usuário no Firebase e local. Retorna usuário criado.
    Body: { email, password, display_name, role }
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        display_name = data.get('display_name')
        role = data.get('role', 'advogado_redator')
        
        if not email or not password:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        user = auth_service.create_firebase_user(email, password, display_name, role, must_change_password=True)
        
        return jsonify({'message': 'Usuário criado com sucesso', 'user': user.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': f'Erro ao criar usuário: {str(e)}'}), 500

@auth_bp.route('/users', methods=['GET'])
@require_auth
@require_role('advogado_administrador')
def list_users():
    """Lista todos os usuários (apenas para administradores)"""
    try:
        users = auth_service.list_users()
        return jsonify({
            'users': [user.to_dict() for user in users]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar usuários: {str(e)}'}), 500

@auth_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@require_auth
@require_role('advogado_administrador')
def update_user_role(user_id):
    """Atualiza papel de um usuário (apenas para administradores)"""
    try:
        data = request.get_json()
        new_role = data.get('role')
        
        if not new_role:
            return jsonify({'error': 'Papel é obrigatório'}), 400
        
        updated_user = auth_service.update_user_role(user_id, new_role)
        if not updated_user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({
            'message': 'Papel atualizado com sucesso',
            'user': updated_user.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Erro ao atualizar papel: {str(e)}'}), 500

@auth_bp.route('/users/<int:user_id>/deactivate', methods=['PUT'])
@require_auth
@require_role('advogado_administrador')
def deactivate_user(user_id):
    """Desativa um usuário (apenas para administradores)"""
    try:
        updated_user = auth_service.deactivate_user(user_id)
        if not updated_user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({
            'message': 'Usuário desativado com sucesso',
            'user': updated_user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao desativar usuário: {str(e)}'}), 500

@auth_bp.route('/users/<int:user_id>/activate', methods=['PUT'])
@require_auth
@require_role('advogado_administrador')
def activate_user(user_id):
    """Ativa um usuário (apenas para administradores)"""
    try:
        updated_user = auth_service.activate_user(user_id)
        if not updated_user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        return jsonify({
            'message': 'Usuário ativado com sucesso',
            'user': updated_user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao ativar usuário: {str(e)}'}), 500

@auth_bp.route('/resend-2fa', methods=['POST'])
@require_auth
def resend_2fa():
    """Reenvia código 2FA"""
    try:
        user = g.current_user
        
        if not user.two_factor_enabled:
            return jsonify({'error': '2FA não está habilitado'}), 400
        
        success = auth_service.generate_2fa_code(user.id)
        if not success:
            return jsonify({'error': 'Erro ao gerar código 2FA'}), 500
        
        return jsonify({'message': 'Código 2FA reenviado'}), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao reenviar código: {str(e)}'}), 500

