from flask import Blueprint, request, jsonify, g
from src.middleware.auth_middleware import require_auth, require_role, require_2fa_verified
from src.models.user import db, Client, Thesis, PetitionModel, Question, ThesisQuestionLink
from src.services.document_service import DocumentService

legal_content_bp = Blueprint('legal_content', __name__)
document_service = DocumentService()

# ===== CLIENTES =====

@legal_content_bp.route('/clients', methods=['GET'])
@require_auth
@require_2fa_verified
def list_clients():
    """Lista todos os clientes"""
    try:
        clients = Client.query.all()
        return jsonify({
            'clients': [client.to_dict() for client in clients]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar clientes: {str(e)}'}), 500

@legal_content_bp.route('/clients', methods=['POST'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def create_client():
    """Cria um novo cliente"""
    try:
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        
        if not name:
            return jsonify({'error': 'Nome é obrigatório'}), 400
        
        # Verifica se já existe
        existing_client = Client.query.filter_by(name=name).first()
        if existing_client:
            return jsonify({'error': 'Cliente já existe'}), 409
        
        client = Client(name=name, description=description)
        db.session.add(client)
        db.session.commit()
        
        return jsonify({
            'message': 'Cliente criado com sucesso',
            'client': client.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar cliente: {str(e)}'}), 500

@legal_content_bp.route('/clients/<int:client_id>', methods=['PUT'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def update_client(client_id):
    """Atualiza um cliente"""
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Cliente não encontrado'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            client.name = data['name']
        if 'description' in data:
            client.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Cliente atualizado com sucesso',
            'client': client.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar cliente: {str(e)}'}), 500

@legal_content_bp.route('/clients/<int:client_id>', methods=['DELETE'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def delete_client(client_id):
    """Remove um cliente"""
    try:
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Cliente não encontrado'}), 404
        
        db.session.delete(client)
        db.session.commit()
        
        return jsonify({'message': 'Cliente removido com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover cliente: {str(e)}'}), 500

# ===== TESES =====

@legal_content_bp.route('/clients/<int:client_id>/theses', methods=['GET'])
@require_auth
@require_2fa_verified
def list_theses(client_id):
    """Lista teses de um cliente"""
    try:
        theses = Thesis.query.filter_by(client_id=client_id).all()
        return jsonify({
            'theses': [thesis.to_dict() for thesis in theses]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar teses: {str(e)}'}), 500

@legal_content_bp.route('/clients/<int:client_id>/theses', methods=['POST'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def create_thesis(client_id):
    """Cria uma nova tese (UC-04)"""
    try:
        # Verifica se o cliente existe
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Cliente não encontrado'}), 404
        
        # Verifica se há arquivo
        if 'file' not in request.files:
            return jsonify({'error': 'Arquivo .docx é obrigatório'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        # Verifica extensão
        if not file.filename.lower().endswith('.docx'):
            return jsonify({'error': 'Apenas arquivos .docx são permitidos'}), 400
        
        # Dados do formulário
        title = request.form.get('title')
        description = request.form.get('description', '')
        
        if not title:
            return jsonify({'error': 'Título é obrigatório'}), 400
        
        # Faz upload do arquivo
        gcs_path = document_service.upload_thesis_file(file, client_id, title)
        
        # Cria a tese no banco
        thesis = Thesis(
            client_id=client_id,
            title=title,
            description=description,
            gcs_path=gcs_path
        )
        
        db.session.add(thesis)
        db.session.commit()
        
        return jsonify({
            'message': 'Tese criada com sucesso',
            'thesis': thesis.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar tese: {str(e)}'}), 500

@legal_content_bp.route('/theses/<int:thesis_id>', methods=['PUT'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def update_thesis(thesis_id):
    """Atualiza uma tese"""
    try:
        thesis = Thesis.query.get(thesis_id)
        if not thesis:
            return jsonify({'error': 'Tese não encontrada'}), 404
        
        # Se há arquivo novo
        if 'file' in request.files:
            file = request.files['file']
            if file.filename != '' and file.filename.lower().endswith('.docx'):
                # Remove arquivo antigo e faz upload do novo
                document_service.delete_file(thesis.gcs_path)
                thesis.gcs_path = document_service.upload_thesis_file(
                    file, thesis.client_id, thesis.title
                )
        
        # Atualiza metadados
        if 'title' in request.form:
            thesis.title = request.form['title']
        if 'description' in request.form:
            thesis.description = request.form['description']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Tese atualizada com sucesso',
            'thesis': thesis.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar tese: {str(e)}'}), 500

@legal_content_bp.route('/theses/<int:thesis_id>', methods=['DELETE'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def delete_thesis(thesis_id):
    """Remove uma tese"""
    try:
        thesis = Thesis.query.get(thesis_id)
        if not thesis:
            return jsonify({'error': 'Tese não encontrada'}), 404
        
        # Remove arquivo do GCS
        document_service.delete_file(thesis.gcs_path)
        
        # Remove do banco
        db.session.delete(thesis)
        db.session.commit()
        
        return jsonify({'message': 'Tese removida com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover tese: {str(e)}'}), 500

# ===== MODELOS DE PETIÇÃO =====

@legal_content_bp.route('/clients/<int:client_id>/petition-models', methods=['GET'])
@require_auth
@require_2fa_verified
def list_petition_models(client_id):
    """Lista modelos de petição de um cliente"""
    try:
        models = PetitionModel.query.filter_by(client_id=client_id).all()
        return jsonify({
            'petition_models': [model.to_dict() for model in models]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar modelos: {str(e)}'}), 500

@legal_content_bp.route('/clients/<int:client_id>/petition-models', methods=['POST'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def create_petition_model(client_id):
    """Cria um novo modelo de petição (UC-05)"""
    try:
        # Verifica se o cliente existe
        client = Client.query.get(client_id)
        if not client:
            return jsonify({'error': 'Cliente não encontrado'}), 404
        
        data = request.get_json()
        name = data.get('name')
        description = data.get('description', '')
        
        if not name:
            return jsonify({'error': 'Nome é obrigatório'}), 400
        
        model = PetitionModel(
            client_id=client_id,
            name=name,
            description=description
        )
        
        db.session.add(model)
        db.session.commit()
        
        return jsonify({
            'message': 'Modelo criado com sucesso',
            'petition_model': model.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar modelo: {str(e)}'}), 500

@legal_content_bp.route('/petition-models/<int:model_id>', methods=['PUT'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def update_petition_model(model_id):
    """Atualiza um modelo de petição"""
    try:
        model = PetitionModel.query.get(model_id)
        if not model:
            return jsonify({'error': 'Modelo não encontrado'}), 404
        
        data = request.get_json()
        
        if 'name' in data:
            model.name = data['name']
        if 'description' in data:
            model.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Modelo atualizado com sucesso',
            'petition_model': model.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar modelo: {str(e)}'}), 500

@legal_content_bp.route('/petition-models/<int:model_id>', methods=['DELETE'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def delete_petition_model(model_id):
    """Remove um modelo de petição"""
    try:
        model = PetitionModel.query.get(model_id)
        if not model:
            return jsonify({'error': 'Modelo não encontrado'}), 404
        
        db.session.delete(model)
        db.session.commit()
        
        return jsonify({'message': 'Modelo removido com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover modelo: {str(e)}'}), 500

# ===== PERGUNTAS =====

@legal_content_bp.route('/petition-models/<int:model_id>/questions', methods=['GET'])
@require_auth
@require_2fa_verified
def list_questions(model_id):
    """Lista perguntas de um modelo"""
    try:
        questions = Question.query.filter_by(petition_model_id=model_id).order_by(Question.order).all()
        return jsonify({
            'questions': [question.to_dict() for question in questions]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar perguntas: {str(e)}'}), 500

@legal_content_bp.route('/petition-models/<int:model_id>/questions', methods=['POST'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def create_question(model_id):
    """Cria uma nova pergunta"""
    try:
        model = PetitionModel.query.get(model_id)
        if not model:
            return jsonify({'error': 'Modelo não encontrado'}), 404
        
        data = request.get_json()
        text = data.get('text')
        order = data.get('order')
        hierarchy_level = data.get('hierarchy_level', 1)
        
        if not text or order is None:
            return jsonify({'error': 'Texto e ordem são obrigatórios'}), 400
        
        question = Question(
            petition_model_id=model_id,
            text=text,
            order=order,
            hierarchy_level=hierarchy_level
        )
        
        db.session.add(question)
        db.session.commit()
        
        return jsonify({
            'message': 'Pergunta criada com sucesso',
            'question': question.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar pergunta: {str(e)}'}), 500

@legal_content_bp.route('/questions/<int:question_id>', methods=['PUT'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def update_question(question_id):
    """Atualiza uma pergunta"""
    try:
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Pergunta não encontrada'}), 404
        
        data = request.get_json()
        
        if 'text' in data:
            question.text = data['text']
        if 'order' in data:
            question.order = data['order']
        if 'hierarchy_level' in data:
            question.hierarchy_level = data['hierarchy_level']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Pergunta atualizada com sucesso',
            'question': question.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao atualizar pergunta: {str(e)}'}), 500

@legal_content_bp.route('/questions/<int:question_id>', methods=['DELETE'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def delete_question(question_id):
    """Remove uma pergunta"""
    try:
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Pergunta não encontrada'}), 404
        
        db.session.delete(question)
        db.session.commit()
        
        return jsonify({'message': 'Pergunta removida com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover pergunta: {str(e)}'}), 500

# ===== VINCULAÇÕES TESE-PERGUNTA =====

@legal_content_bp.route('/questions/<int:question_id>/thesis-links', methods=['GET'])
@require_auth
@require_2fa_verified
def list_thesis_links(question_id):
    """Lista vinculações de uma pergunta"""
    try:
        links = ThesisQuestionLink.query.filter_by(question_id=question_id).all()
        return jsonify({
            'thesis_links': [link.to_dict() for link in links]
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Erro ao listar vinculações: {str(e)}'}), 500

@legal_content_bp.route('/questions/<int:question_id>/thesis-links', methods=['POST'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def create_thesis_link(question_id):
    """Cria uma vinculação tese-pergunta (UC-06)"""
    try:
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Pergunta não encontrada'}), 404
        
        data = request.get_json()
        thesis_id = data.get('thesis_id')
        answer = data.get('answer')
        
        if not thesis_id or not answer:
            return jsonify({'error': 'ID da tese e resposta são obrigatórios'}), 400
        
        if answer not in ['sim', 'nao']:
            return jsonify({'error': 'Resposta deve ser "sim" ou "nao"'}), 400
        
        # Verifica se a tese existe
        thesis = Thesis.query.get(thesis_id)
        if not thesis:
            return jsonify({'error': 'Tese não encontrada'}), 404
        
        # Verifica se já existe vinculação
        existing_link = ThesisQuestionLink.query.filter_by(
            question_id=question_id,
            thesis_id=thesis_id,
            answer=answer
        ).first()
        
        if existing_link:
            return jsonify({'error': 'Vinculação já existe'}), 409
        
        link = ThesisQuestionLink(
            question_id=question_id,
            thesis_id=thesis_id,
            answer=answer
        )
        
        db.session.add(link)
        db.session.commit()
        
        return jsonify({
            'message': 'Vinculação criada com sucesso',
            'thesis_link': link.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar vinculação: {str(e)}'}), 500

@legal_content_bp.route('/thesis-links/<int:link_id>', methods=['DELETE'])
@require_auth
@require_role('advogado_administrador')
@require_2fa_verified
def delete_thesis_link(link_id):
    """Remove uma vinculação"""
    try:
        link = ThesisQuestionLink.query.get(link_id)
        if not link:
            return jsonify({'error': 'Vinculação não encontrada'}), 404
        
        db.session.delete(link)
        db.session.commit()
        
        return jsonify({'message': 'Vinculação removida com sucesso'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao remover vinculação: {str(e)}'}), 500

