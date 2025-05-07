const { execSync } = require('child_process');

console.log('🔍 Verificando instalação do Tailwind CSS...');

try {
  // Tenta importar tailwindcss para verificar se está instalado
  require.resolve('tailwindcss');
  console.log('✅ Tailwind CSS já está instalado!');
} catch (error) {
  // Se não estiver instalado, instala manualmente
  console.log('⚠️ Tailwind CSS não encontrado. Instalando...');
  
  try {
    execSync('npm install tailwindcss postcss autoprefixer --no-save', { stdio: 'inherit' });
    console.log('✅ Tailwind CSS instalado com sucesso!');
  } catch (installError) {
    console.error('❌ Erro ao instalar Tailwind CSS:', installError);
    process.exit(1);
  }
}
