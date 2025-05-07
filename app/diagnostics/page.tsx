export default function DiagnosticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico do Sistema</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Informações do Cliente</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700">Navegador</h3>
            <p className="text-gray-900" id="browser-info">
              Carregando...
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Sistema Operacional</h3>
            <p className="text-gray-900" id="os-info">
              Carregando...
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">User Agent</h3>
            <p className="text-gray-900 text-sm break-all" id="user-agent">
              Carregando...
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Resolução de Tela</h3>
            <p className="text-gray-900" id="screen-resolution">
              Carregando...
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Status Online</h3>
            <p className="text-gray-900" id="online-status">
              Carregando...
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Cookies Habilitados</h3>
            <p className="text-gray-900" id="cookies-enabled">
              Carregando...
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="font-medium text-gray-700 mb-2">Teste de Conectividade</h3>
          <button id="test-connectivity" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Testar Conectividade
          </button>
          <p className="mt-2 text-gray-900" id="connectivity-result"></p>
        </div>

        <div className="mt-8">
          <h3 className="font-medium text-gray-700 mb-2">Teste de Processamento de Texto</h3>
          <textarea
            id="text-input"
            className="w-full p-2 border border-gray-300 rounded"
            rows={4}
            placeholder="Cole uma lista de produtos aqui para testar o processamento..."
          ></textarea>
          <button id="process-text" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Processar Texto
          </button>
          <div className="mt-2">
            <h4 className="font-medium text-gray-700">Resultado:</h4>
            <pre id="text-result" className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto max-h-40"></pre>
          </div>
        </div>
      </div>

      <script
        id="diagnostics-script"
        dangerouslySetInnerHTML={{
          __html: `
          // Função para executar quando o DOM estiver carregado
          document.addEventListener('DOMContentLoaded', function() {
            // Preencher informações básicas
            document.getElementById('browser-info').textContent = navigator.userAgent.match(/Chrome|Firefox|Safari|Edge|MSIE|Trident/) || 'Desconhecido';
            document.getElementById('os-info').textContent = navigator.platform || 'Desconhecido';
            document.getElementById('user-agent').textContent = navigator.userAgent;
            document.getElementById('screen-resolution').textContent = \`\${window.screen.width} x \${window.screen.height}\`;
            document.getElementById('online-status').textContent = navigator.onLine ? 'Online' : 'Offline';
            document.getElementById('cookies-enabled').textContent = navigator.cookieEnabled ? 'Sim' : 'Não';
            
            // Teste de conectividade
            document.getElementById('test-connectivity').addEventListener('click', async function() {
              const resultElement = document.getElementById('connectivity-result');
              resultElement.textContent = 'Testando...';
              
              try {
                const startTime = performance.now();
                const response = await fetch('/api/ping');
                const endTime = performance.now();
                
                if (response.ok) {
                  const data = await response.json();
                  resultElement.textContent = \`Conectado! Tempo de resposta: \${(endTime - startTime).toFixed(2)}ms. Timestamp do servidor: \${data.timestamp}\`;
                } else {
                  resultElement.textContent = \`Erro: \${response.status} \${response.statusText}\`;
                }
              } catch (error) {
                resultElement.textContent = \`Erro de conexão: \${error.message}\`;
              }
            });
            
            // Teste de processamento de texto
            document.getElementById('process-text').addEventListener('click', function() {
              const textInput = document.getElementById('text-input').value;
              const resultElement = document.getElementById('text-result');
              
              if (!textInput.trim()) {
                resultElement.textContent = 'Por favor, insira algum texto para processar.';
                return;
              }
              
              // Simular o processamento de texto
              const lines = textInput.split(/\\r?\\n/);
              const products = [];
              
              for (const line of lines) {
                const items = line.split(/[,;]/);
                for (const item of items) {
                  if (item.trim()) {
                    products.push(item.trim());
                  }
                }
              }
              
              resultElement.textContent = JSON.stringify(products, null, 2);
            });
          });
        `,
        }}
      />
    </div>
  )
}
