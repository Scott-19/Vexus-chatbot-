const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações básicas
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API Key - funciona COM ou SEM ela
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Respostas locais (fallback)
const localResponses = {
  'oi': 'Olá! Eu sou o Vexus. Como posso ajudar?',
  'olá': 'Olá! Eu sou o Vexus. Como posso ajudar?', 
  'como você está': 'Estou funcionando perfeitamente! Pronto para ajudar.',
  'quem é você': 'Sou o Vexus, seu assistente pessoal inteligente.',
  'obrigado': 'De nada! Estou aqui para ajudar.',
  'default': 'Entendi! No momento estou em modo básico. Em breve terei respostas mais avançadas!'
};

// Rota principal de chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const userMessage = message.toLowerCase().trim();

    console.log('💬 Mensagem recebida:', userMessage);

    // 1. Primeiro tenta resposta local
    const localResponse = localResponses[userMessage] || localResponses.default;
    
    // 2. Se tem API key, tenta DeepSeek
    if (DEEPSEEK_API_KEY && DEEPSEEK_API_KEY !== 'sua_chave_aqui') {
      try {
        const aiResponse = await axios.post('https://api.deepseek.com/chat/completions', {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'Você é o Vexus, um assistente pessoal útil e amigável. Seja direto e prático.'
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        }, {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        const aiText = aiResponse.data.choices[0].message.content;
        
        return res.json({
          success: true,
          response: `🤖 ${aiText}`,
          mode: 'ai',
          source: 'deepseek'
        });
      } catch (aiError) {
        console.log('⚠️  Erro na API, usando fallback local');
        // Continua para o fallback local
      }
    }

    // 3. Fallback local (sempre funciona)
    return res.json({
      success: true,
      response: `⚡ ${localResponse}`,
      mode: 'local',
      source: 'fallback'
    });

  } catch (error) {
    console.error('❌ Erro no servidor:', error);
    res.json({
      success: false,
      response: '⚡ Estou com instabilidades temporárias. Tente novamente!',
      mode: 'error'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: '✅ ONLINE',
    name: 'Vexus Foundation',
    version: '1.0.0',
    author: 'Victorino Sérgio',
    timestamp: new Date().toISOString(),
    features: {
      chat: true,
      fallback: true,
      deepseek: !!DEEPSEEK_API_KEY,
      deployment: 'render-ready'
    }
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 VEXUS FOUNDATION INICIADO!
📍 Porta: ${PORT}
🔧 Modo: ${DEEPSEEK_API_KEY ? 'IA + Local' : 'Apenas Local'}
📡 Health: http://localhost:${PORT}/health
💬 API: http://localhost:${PORT}/api/chat
  `);
});
