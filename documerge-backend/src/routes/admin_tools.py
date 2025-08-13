from flask import Blueprint, jsonify, request
from src.middleware.auth_middleware import require_auth, require_role
from src.services.auth_service import AuthService
from src.models.user import db, User, Client, Thesis
from src.services.document_service import DocumentService
import os

admin_bp = Blueprint('admin_tools', __name__)
auth_service = AuthService()
document_service = DocumentService()

@admin_bp.route('/seed/promote-to-dev', methods=['POST'])
@require_auth
def promote_to_dev():
    """Promove um usuário (por email) para dev.
    Regras:
    - Se já existe algum usuário dev, requer papel administrador.
    - Se não existe dev, o usuário autenticado pode se promover enviando seu próprio email.
    Body: {"email": "..."}
    """
    try:
        data = request.get_json() or {}
        email = data.get('email')
        if not email:
            return jsonify({'error': 'Email é obrigatório'}), 400
        
        # Verifica se existe algum dev
        from sqlalchemy import select
        any_dev = User.query.filter_by(role='dev').first() is not None
        
        # Se já existe dev, requer admin
        if any_dev:
            from flask import g
            if not g.current_user or g.current_user.role not in ['advogado_administrador', 'dev']:
                return jsonify({'error': 'Permissão insuficiente'}), 403
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'Usuário não encontrado'}), 404
        
        user.role = 'dev'
        db.session.commit()
        
        return jsonify({'message': f'Usuário {email} promovido a dev', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/seed/import-theses', methods=['POST'])
@require_auth
@require_role('advogado_administrador')
def import_theses():
    """Importa .docx de um diretório local como Teses de um cliente.
    Body: {"client_name": "...", "directory": "C:\\caminho\\para\\Teses"}
    """
    try:
        data = request.get_json() or {}
        client_name = data.get('client_name')
        directory = data.get('directory')
        if not client_name or not directory:
            return jsonify({'error': 'client_name e directory são obrigatórios'}), 400
        if not os.path.isdir(directory):
            return jsonify({'error': 'Diretório inválido'}), 400
        
        # Encontra ou cria o cliente
        client = Client.query.filter_by(name=client_name).first()
        if not client:
            client = Client(name=client_name, description='Importado via seed')
            db.session.add(client)
            db.session.commit()
        
        # Itera arquivos .docx
        created = []
        for entry in os.listdir(directory):
            if entry.lower().endswith('.docx'):
                path = os.path.join(directory, entry)
                title = os.path.splitext(entry)[0]
                gcs_path = document_service.upload_thesis_file(path, client.id, title)
                thesis = Thesis(client_id=client.id, title=title, description='', gcs_path=gcs_path)
                db.session.add(thesis)
                created.append(title)
        db.session.commit()
        
        return jsonify({'message': 'Teses importadas', 'count': len(created), 'titles': created}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

