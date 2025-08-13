// Script temporário para corrigir a role do usuário no Firestore
// Execute este script no console do navegador enquanto estiver logado

// Função para atualizar a role do usuário atual
async function fixCurrentUserRole() {
  try {
    // Importar Firestore functions
    const { doc, updateDoc, getDoc } = await import('firebase/firestore');
    const { auth, db } = await import('../lib/firebase.js');
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ Nenhum usuário logado');
      return;
    }
    
    console.log('🔍 Usuário atual:', currentUser.email, currentUser.uid);
    
    // Referência ao documento do usuário
    const userRef = doc(db, 'users', currentUser.uid);
    
    // Verificar dados atuais
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      console.log('📋 Dados atuais do usuário:', userSnap.data());
    }
    
    // Atualizar para administrador
    await updateDoc(userRef, {
      role: 'advogado_administrador',
      updated_at: new Date().toISOString()
    });
    
    console.log('✅ Usuário atualizado para advogado_administrador');
    console.log('🔄 Faça logout e login novamente para aplicar as mudanças');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
  }
}

// Executar a função
fixCurrentUserRole();
