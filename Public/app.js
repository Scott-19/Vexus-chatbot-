// Vexus Foundation - Frontend
class VexusChat {
    constructor() {
        this.isProcessing = false;
        this.initializeChat();
    }

    initializeChat() {
        console.log('⚡ Vexus Foundation - Iniciado');
        this.setupEventListeners();
        this.updateStatus();
    }

    setupEventListeners() {
        const userInput = document.getElementById('userInput');
        const sendButton = document.querySelector('button');

        // Enter para enviar
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isProcessing) {
                this.sendMessage();
            }
        });

        // Botão enviar
        sendButton.addEventListener('click', () => {
            if (!this.isProcessing) {
                this.sendMessage();
            }
        });

        // Focar no input
        userInput.focus();
    }

    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();

        if (!message || this.isProcessing) return;

        // Adicionar mensagem do usuário
        this.addMessage('user', message);
        userInput.value = '';
        
        // Mostrar digitando
        this.showTyping();

        // Enviar para API
        await this.sendToAPI(message);
    }

    async sendToAPI(message) {
        this.isProcessing = true;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();

            this.removeTyping();

            if (data.success) {
                this.addMessage('assistant', data.response);
                this.updateStatus(data.mode);
            } else {
                this.addMessage('assistant', '❌ Erro temporário. Tente novamente.');
            }

        } catch (error) {
            console.error('Erro:', error);
            this.removeTyping();
            this.addMessage('assistant', '⚡ Estou com problemas de conexão. Tente novamente!');
        }

        this.isProcessing = false;
    }

    addMessage(sender, content) {
        const chatMessages = document.getElementById('chatMessages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        if (sender === 'user') {
            messageDiv.innerHTML = `<strong>Você:</strong>${content}`;
        } else {
            messageDiv.innerHTML = `<strong>Vexus:</strong>${content}`;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTyping() {
        const chatMessages = document.getElementById('chatMessages');
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'message assistant-message typing-indicator';
        typingDiv.innerHTML = '<strong>Vexus:</strong> digitando';
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    removeTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateStatus(mode = 'local') {
        const statusElement = document.getElementById('status');
        const modes = {
            'local': { text: 'Modo Local', color: '#f59e0b' },
            'ai': { text: 'Modo IA', color: '#10b981' },
            'error': { text: 'Com Erros', color: '#ef4444' }
        };

        const currentMode = modes[mode] || modes.local;
        
        statusElement.innerHTML = `
            <span class="status-dot"></span>
            ${currentMode.text}
        `;
        
        const dot = statusElement.querySelector('.status-dot');
        dot.style.background = currentMode.color;
    }
}

// Função global para o botão
function sendMessage() {
    if (window.vexusChat && !window.vexusChat.isProcessing) {
        window.vexusChat.sendMessage();
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    window.vexusChat = new VexusChat();
});
