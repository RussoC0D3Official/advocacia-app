from flask import Blueprint, request, jsonify, send_file
from src.services.firebase_service import firebase_service
from src.services.document_service import document_service
from src.middleware.auth import require_auth, get_current_user
import io
from datetime import datetime

documents_bp = Blueprint('documents', __name__)

@documents_bp.route('/upload', methods=['POST'])
@require_auth
def upload_document():
    """Upload a Word document"""
    user_id = get_current_user()
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not file.filename.endswith('.docx'):
        return jsonify({'error': 'Only .docx files are supported'}), 400
    
    try:
        # Upload file to Firebase Storage
        blob_path = firebase_service.upload_file(file, file.filename, user_id)
        if not blob_path:
            return jsonify({'error': 'Failed to upload file'}), 500
        
        # Save metadata
        doc_id = firebase_service.save_document_metadata(user_id, file.filename, blob_path)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': file.filename,
            'blob_path': blob_path,
            'document_id': doc_id
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@documents_bp.route('/list', methods=['GET'])
@require_auth
def list_documents():
    """List user's documents"""
    user_id = get_current_user()
    
    try:
        documents = firebase_service.list_user_files(user_id)
        return jsonify({'documents': documents}), 200
    
    except Exception as e:
        return jsonify({'error': f'Failed to list documents: {str(e)}'}), 500

@documents_bp.route('/merge', methods=['POST'])
@require_auth
def merge_documents():
    """Merge selected documents"""
    user_id = get_current_user()
    
    data = request.get_json()
    document_paths = data.get('document_paths')
    
    if not document_paths or len(document_paths) < 2:
        return jsonify({'error': 'At least 2 documents are required for merging'}), 400
    
    try:
        # Merge documents
        merged_stream = document_service.merge_documents(document_paths, user_id)
        
        # Generate filename for merged document
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        merged_filename = f"merged_document_{timestamp}.docx"
        
        # Upload merged document
        merged_blob_path = document_service.upload_merged_document(
            merged_stream, merged_filename, user_id
        )
        
        if not merged_blob_path:
            return jsonify({'error': 'Failed to save merged document'}), 500
        
        return jsonify({
            'message': 'Documents merged successfully',
            'merged_filename': merged_filename,
            'merged_blob_path': merged_blob_path
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Merge failed: {str(e)}'}), 500

@documents_bp.route('/download/<path:blob_path>', methods=['GET'])
@require_auth
def download_document(blob_path):
    """Download a document"""
    user_id = get_current_user()
    
    # Verify that the user owns this document (blob_path should start with users/{user_id}/)
    if not blob_path.startswith(f'users/{user_id}/'):
        return jsonify({'error': 'Access denied'}), 403
    
    try:
        file_bytes = firebase_service.download_file(blob_path)
        if not file_bytes:
            return jsonify({'error': 'File not found'}), 404
        
        file_stream = io.BytesIO(file_bytes)
        filename = blob_path.split('/')[-1]
        
        return send_file(
            file_stream,
            as_attachment=True,
            download_name=filename,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    
    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500

@documents_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'documents'}), 200

# Development-only routes (remove in production)
@documents_bp.route('/dev/upload', methods=['POST'])
def dev_upload_document():
    """Development upload without authentication"""
    user_id = "test_user"  # Fixed user for development
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not file.filename.endswith('.docx'):
        return jsonify({'error': 'Only .docx files are supported'}), 400
    
    try:
        # Upload file to Firebase Storage
        blob_path = firebase_service.upload_file(file, file.filename, user_id)
        if not blob_path:
            return jsonify({'error': 'Failed to upload file'}), 500
        
        # Save metadata
        doc_id = firebase_service.save_document_metadata(user_id, file.filename, blob_path)
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': file.filename,
            'blob_path': blob_path,
            'document_id': doc_id
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@documents_bp.route('/dev/list', methods=['GET'])
def dev_list_documents():
    """Development list without authentication"""
    user_id = "test_user"  # Fixed user for development
    
    try:
        documents = firebase_service.list_user_files(user_id)
        return jsonify({'documents': documents}), 200
    
    except Exception as e:
        return jsonify({'error': f'Failed to list documents: {str(e)}'}), 500

@documents_bp.route('/dev/merge', methods=['POST'])
def dev_merge_documents():
    """Development merge without authentication"""
    user_id = "test_user"  # Fixed user for development
    
    data = request.get_json()
    document_paths = data.get('document_paths')
    
    if not document_paths or len(document_paths) < 2:
        return jsonify({'error': 'At least 2 documents are required for merging'}), 400
    
    try:
        # Merge documents
        merged_stream = document_service.merge_documents(document_paths, user_id)
        
        # Generate filename for merged document
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        merged_filename = f"merged_document_{timestamp}.docx"
        
        # Upload merged document
        merged_blob_path = document_service.upload_merged_document(
            merged_stream, merged_filename, user_id
        )
        
        if not merged_blob_path:
            return jsonify({'error': 'Failed to save merged document'}), 500
        
        return jsonify({
            'message': 'Documents merged successfully',
            'merged_filename': merged_filename,
            'merged_blob_path': merged_blob_path
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Merge failed: {str(e)}'}), 500

