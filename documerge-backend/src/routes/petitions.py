from flask import Blueprint, request, jsonify, g, send_file
from src.middleware.auth_middleware import require_auth, require_role
from src.models.user import db, PetitionModel, GeneratedPetition
from src.services.document_service import DocumentService

petitions_bp = Blueprint('petitions', __name__)
document_service = DocumentService()

@petitions_bp.route('/generate', methods=['POST'])
@require_auth
def generate_petition():
    """Gera uma nova petição a partir de formulário (UC-01)"""
    try:
        data = request.get_json()
        
        petition_model_id = data.get('petition_model_id')
        form_answers = data.get('form_answers')  # Dict com question_id: boolean
        title = data.get('title')
        process_number = data.get('process_number')
        client_id = data.get('client_id')
        
        # Validações
        if not petition_model_id or not form_answers or not title or not client_id:
            return jsonify({
                'error': 'petition_model_id, form_answers, title e client_id são obrigatórios'
            }), 400
        
        # Verifica se o modelo existe
        model = PetitionModel.query.get(petition_model_id)
        if not model:
            return jsonify({'error': 'Modelo de petição não encontrado'}), 404
        
        # Verifica se o cliente do modelo corresponde
        if model.client_id != client_id:
            return jsonify({'error': 'Cliente não corresponde ao modelo'}), 400
        
        user = g.current_user
        
        # Gera a petição
        petition = document_service.generate_petition(
            petition_model_id=petition_model_id,
            form_answers=form_answers,
            user_id=user.id,
            client_id=client_id,
            title=title,
            process_number=process_number
        )
        
        return jsonify({
            'message': 'Petição gerada com sucesso',
            'petition': petition.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar petição: {str(e)}'}), 500

@petitions_bp.route('/<int:petition_id>/content', methods=['GET'])
@require_auth
def get_petition_content(petition_id):
    """Obtém o conteúdo de uma petição para visualização/edição (UC-02)"""
    try:
        petition = GeneratedPetition.query.get(petition_id)
        if not petition:
            return jsonify({'error': 'Petição não encontrada'}), 404
        
        user = g.current_user
        
        # Verifica se o usuário tem permissão para ver esta petição
        if petition.user_id != user.id and not user.role in ['advogado_administrador', 'dev']:
            return jsonify({'error': 'Sem permissão para acessar esta petição'}), 403
        
        content_data = document_service.get_petition_content(petition_id)
        
        return jsonify(content_data), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao obter conteúdo: {str(e)}'}), 500

@petitions_bp.route('/<int:petition_id>/content', methods=['PUT'])
@require_auth
def update_petition_content(petition_id):
    """Atualiza o conteúdo de uma petição (UC-02)"""
    try:
        petition = GeneratedPetition.query.get(petition_id)
        if not petition:
            return jsonify({'error': 'Petição não encontrada'}), 404
        
        user = g.current_user
        
        # Verifica permissões
        if petition.user_id != user.id and not user.role in ['advogado_administrador', 'dev']:
            return jsonify({'error': 'Sem permissão para editar esta petição'}), 403
        
        data = request.get_json()
        new_content = data.get('content')
        new_title = data.get('title')
        
        if not new_content:
            return jsonify({'error': 'Conteúdo é obrigatório'}), 400
        
        updated_petition = document_service.update_petition_content(
            petition_id, new_content, new_title
        )
        
        return jsonify({
            'message': 'Petição atualizada com sucesso',
            'petition': updated_petition.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao atualizar petição: {str(e)}'}), 500

@petitions_bp.route('/<int:petition_id>/save', methods=['POST'])
@require_auth
def save_petition(petition_id):
    """Salva metadados adicionais de uma petição (UC-03)"""
    try:
        petition = GeneratedPetition.query.get(petition_id)
        if not petition:
            return jsonify({'error': 'Petição não encontrada'}), 404
        
        user = g.current_user
        
        # Verifica permissões
        if petition.user_id != user.id and not user.role in ['advogado_administrador', 'dev']:
            return jsonify({'error': 'Sem permissão para salvar esta petição'}), 403
        
        data = request.get_json()
        
        # Atualiza metadados se fornecidos
        if 'title' in data:
            petition.title = data['title']
        if 'process_number' in data:
            petition.process_number = data['process_number']
        
        petition.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Petição salva com sucesso',
            'petition': petition.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao salvar petição: {str(e)}'}), 500

@petitions_bp.route('/my-petitions', methods=['GET'])
@require_auth
def list_my_petitions():
    """Lista petições do usuário atual"""
    try:
        user = g.current_user
        petitions = document_service.list_user_petitions(user.id)
        
        return jsonify({'petitions': petitions}), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar petições: {str(e)}'}), 500

@petitions_bp.route('/all', methods=['GET'])
@require_auth
@require_role('advogado_administrador')
def list_all_petitions():
    """Lista todas as petições (apenas para administradores)"""
    try:
        petitions = GeneratedPetition.query.order_by(GeneratedPetition.created_at.desc()).all()
        
        return jsonify({
            'petitions': [petition.to_dict() for petition in petitions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar petições: {str(e)}'}), 500

@petitions_bp.route('/<int:petition_id>/download', methods=['GET'])
@require_auth
def download_petition(petition_id):
    """Faz download de uma petição"""
    try:
        petition = GeneratedPetition.query.get(petition_id)
        if not petition:
            return jsonify({'error': 'Petição não encontrada'}), 404
        
        user = g.current_user
        
        # Verifica permissões
        if petition.user_id != user.id and not user.role in ['advogado_administrador', 'dev']:
            return jsonify({'error': 'Sem permissão para baixar esta petição'}), 403
        
        file_path = document_service.get_petition_file(petition_id)
        
        return send_file(
            file_path,
            as_attachment=True,
            download_name=f"{petition.title}.docx",
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
        
    except Exception as e:
        return jsonify({'error': f'Erro ao baixar petição: {str(e)}'}), 500

@petitions_bp.route('/<int:petition_id>', methods=['DELETE'])
@require_auth
def delete_petition(petition_id):
    """Remove uma petição"""
    try:
        petition = GeneratedPetition.query.get(petition_id)
        if not petition:
            return jsonify({'error': 'Petição não encontrada'}), 404
        
        user = g.current_user
        
        # Verifica permissões
        if petition.user_id != user.id and not user.role in ['advogado_administrador', 'dev']:
            return jsonify({'error': 'Sem permissão para remover esta petição'}), 403
        
        # Remove arquivo
        document_service.delete_file(petition.gcs_path)
        
        # Remove do banco
        db.session.delete(petition)
        db.session.commit()
        
        return jsonify({'message': 'Petição removida com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover petição: {str(e)}'}), 500

# ===== ROTAS DE DESENVOLVIMENTO (SEM AUTENTICAÇÃO) =====

@petitions_bp.route('/dev/generate', methods=['POST'])
def dev_generate_petition():
    """Versão de desenvolvimento para gerar petição"""
    try:
        data = request.get_json()
        
        # Usa usuário de teste
        test_user_id = 1
        
        petition_model_id = data.get('petition_model_id')
        form_answers = data.get('form_answers')
        title = data.get('title')
        process_number = data.get('process_number')
        client_id = data.get('client_id')
        
        if not petition_model_id or not form_answers or not title or not client_id:
            return jsonify({
                'error': 'petition_model_id, form_answers, title e client_id são obrigatórios'
            }), 400
        
        petition = document_service.generate_petition(
            petition_model_id=petition_model_id,
            form_answers=form_answers,
            user_id=test_user_id,
            client_id=client_id,
            title=title,
            process_number=process_number
        )
        
        return jsonify({
            'message': 'Petição gerada com sucesso (modo desenvolvimento)',
            'petition': petition.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar petição: {str(e)}'}), 500

@petitions_bp.route('/dev/list', methods=['GET'])
def dev_list_petitions():
    """Lista petições em modo desenvolvimento"""
    try:
        petitions = GeneratedPetition.query.order_by(GeneratedPetition.created_at.desc()).limit(10).all()
        
        return jsonify({
            'petitions': [petition.to_dict() for petition in petitions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar petições: {str(e)}'}), 500

