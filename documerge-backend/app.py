#!/usr/bin/env python3
"""
Aplicação Flask para Sistema de Advocacia
Arquivo principal para deploy em produção
"""

import os
import sys
from pathlib import Path

# Adicionar o diretório src ao path
current_dir = Path(__file__).parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))

from main import create_app

# Criar a aplicação Flask
app = create_app()

if __name__ == "__main__":
    # Configurações para produção
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") == "development"
    
    app.run(
        host="0.0.0.0",
        port=port,
        debug=debug
    )

