import os
import firebase_admin
from firebase_admin import credentials, storage

# Caminho absoluto para o arquivo de credenciais
# Recomendo usar variável de ambiente, mas você também pode usar o nome diretamente
BASE_DIR = os.path.dirname(__file__)
SERVICE_ACCOUNT_KEY_PATH = os.path.join(BASE_DIR, 'projeto-advocacia-tales-firebase-adminsdk-fbsvc-969b4fefcf.json')

# Identificador do projeto e bucket (ajuste conforme seu Firebase)
FIREBASE_PROJECT_ID = 'projeto-advocacia-tales'
STORAGE_BUCKET = 'projeto-advocacia-tales.appspot.com'

# Inicialização do Firebase Admin SDK (evita reinicializações múltiplas)
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred, {
        'projectId': FIREBASE_PROJECT_ID,
        'storageBucket': STORAGE_BUCKET
    })

# Opcional: exporta o bucket para facilitar uso em outros arquivos
firebase_storage_bucket = storage.bucket()
