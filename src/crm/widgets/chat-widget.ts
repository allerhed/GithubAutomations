/**
 * Chat Widget for Lead Capture
 * Embeddable chat widget for capturing leads through conversational interface
 */

export interface ChatConfig {
  apiEndpoint: string;
  styling?: {
    primaryColor?: string;
    position?: 'bottom-right' | 'bottom-left';
    welcomeMessage?: string;
    botName?: string;
  };
  fields?: {
    requirePhone?: boolean;
    requireCompany?: boolean;
    requireProductInterest?: boolean;
  };
}

interface Message {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export class LeadCaptureChat {
  private config: ChatConfig;
  private containerId: string;
  private isOpen: boolean = false;
  private messages: Message[] = [];
  private currentStep: number = 0;
  private leadData: any = {};
  
  private conversationFlow = [
    { field: 'firstName', question: 'Hi! What\'s your first name?', type: 'text' },
    { field: 'lastName', question: 'Nice to meet you! What\'s your last name?', type: 'text' },
    { field: 'email', question: 'Great! What\'s your email address?', type: 'email' },
    { field: 'phone', question: 'What\'s your phone number? (optional)', type: 'tel', optional: true },
    { field: 'company', question: 'Which company do you work for? (optional)', type: 'text', optional: true },
    { field: 'productInterest', question: 'What product or service are you interested in?', type: 'text', optional: true },
    { field: 'message', question: 'Is there anything specific you\'d like to know or discuss?', type: 'text', optional: true }
  ];

  constructor(containerId: string, config: ChatConfig) {
    this.containerId = containerId;
    this.config = {
      ...config,
      styling: {
        primaryColor: config.styling?.primaryColor || '#007bff',
        position: config.styling?.position || 'bottom-right',
        welcomeMessage: config.styling?.welcomeMessage || 'Hi! How can we help you today?',
        botName: config.styling?.botName || 'Support'
      }
    };
  }

  /**
   * Render the chat widget
   */
  render(): void {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container ${this.containerId} not found`);
    }

    container.innerHTML = this.generateHTML();
    this.attachEventListeners();
    
    // Show welcome message
    this.addBotMessage(this.config.styling?.welcomeMessage || 'Hi! How can we help you today?');
  }

  /**
   * Generate HTML for the chat widget
   */
  private generateHTML(): string {
    const primaryColor = this.config.styling?.primaryColor || '#007bff';
    const position = this.config.styling?.position || 'bottom-right';
    const positionStyles = position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;';
    
    return `
      <style>
        .chat-widget-container {
          position: fixed;
          bottom: 20px;
          ${positionStyles}
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        .chat-widget-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: ${primaryColor};
          color: white;
          border: none;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chat-widget-button:hover {
          opacity: 0.9;
        }
        .chat-widget-window {
          position: fixed;
          bottom: 90px;
          ${positionStyles}
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          display: none;
          flex-direction: column;
        }
        .chat-widget-window.open {
          display: flex;
        }
        .chat-widget-header {
          background-color: ${primaryColor};
          color: white;
          padding: 15px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-widget-header h3 {
          margin: 0;
          font-size: 16px;
        }
        .chat-widget-close {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
        }
        .chat-widget-messages {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .chat-message {
          max-width: 80%;
          padding: 10px 15px;
          border-radius: 18px;
          word-wrap: break-word;
        }
        .chat-message.bot {
          background-color: #f0f0f0;
          align-self: flex-start;
        }
        .chat-message.user {
          background-color: ${primaryColor};
          color: white;
          align-self: flex-end;
        }
        .chat-widget-input {
          padding: 15px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 10px;
        }
        .chat-widget-input input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
        }
        .chat-widget-input button {
          background-color: ${primaryColor};
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          font-size: 18px;
        }
        .chat-widget-input button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .chat-typing {
          color: #999;
          font-style: italic;
          font-size: 12px;
          padding: 5px 15px;
        }
      </style>
      
      <div class="chat-widget-container">
        <button class="chat-widget-button" id="chat-toggle">
          💬
        </button>
        
        <div class="chat-widget-window" id="chat-window">
          <div class="chat-widget-header">
            <h3>${this.config.styling?.botName || 'Support'}</h3>
            <button class="chat-widget-close" id="chat-close">×</button>
          </div>
          
          <div class="chat-widget-messages" id="chat-messages">
          </div>
          
          <div class="chat-widget-input">
            <input 
              type="text" 
              id="chat-input" 
              placeholder="Type your message..."
              autocomplete="off"
            />
            <button id="chat-send">➤</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    const toggleBtn = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('chat-close');
    const sendBtn = document.getElementById('chat-send');
    const input = document.getElementById('chat-input') as HTMLInputElement;

    toggleBtn?.addEventListener('click', () => this.toggleChat());
    closeBtn?.addEventListener('click', () => this.toggleChat());
    sendBtn?.addEventListener('click', () => this.sendMessage());
    
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  /**
   * Toggle chat window open/closed
   */
  private toggleChat(): void {
    this.isOpen = !this.isOpen;
    const chatWindow = document.getElementById('chat-window');
    if (chatWindow) {
      if (this.isOpen) {
        chatWindow.classList.add('open');
        // Start conversation if not started
        if (this.currentStep === 0 && this.messages.length === 1) {
          setTimeout(() => this.askNextQuestion(), 500);
        }
      } else {
        chatWindow.classList.remove('open');
      }
    }
  }

  /**
   * Send user message
   */
  private sendMessage(): void {
    const input = document.getElementById('chat-input') as HTMLInputElement;
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    this.addUserMessage(message);
    input.value = '';
    
    // Process the message
    this.processUserInput(message);
  }

  /**
   * Add a bot message
   */
  private addBotMessage(text: string): void {
    this.messages.push({
      sender: 'bot',
      text,
      timestamp: new Date()
    });
    this.renderMessages();
  }

  /**
   * Add a user message
   */
  private addUserMessage(text: string): void {
    this.messages.push({
      sender: 'user',
      text,
      timestamp: new Date()
    });
    this.renderMessages();
  }

  /**
   * Render all messages
   */
  private renderMessages(): void {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = this.messages.map(msg => `
      <div class="chat-message ${msg.sender}">
        ${msg.text}
      </div>
    `).join('');
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Process user input based on current conversation step
   */
  private processUserInput(input: string): void {
    const currentQuestion = this.conversationFlow[this.currentStep];
    
    // Validate and store input
    if (!currentQuestion.optional && !input.trim()) {
      this.addBotMessage('This field is required. Please provide a valid answer.');
      return;
    }
    
    // Special validation for email
    if (currentQuestion.type === 'email' && input.trim()) {
      if (!this.isValidEmail(input)) {
        this.addBotMessage('Please provide a valid email address.');
        return;
      }
    }
    
    // Store the data
    this.leadData[currentQuestion.field] = input.trim();
    
    // Move to next question or submit
    this.currentStep++;
    
    if (this.currentStep < this.conversationFlow.length) {
      setTimeout(() => this.askNextQuestion(), 500);
    } else {
      this.submitLead();
    }
  }

  /**
   * Ask the next question in the conversation flow
   */
  private askNextQuestion(): void {
    const question = this.conversationFlow[this.currentStep];
    this.addBotMessage(question.question);
  }

  /**
   * Submit the captured lead
   */
  private async submitLead(): Promise<void> {
    this.addBotMessage('Thank you! Let me submit your information...');
    
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.leadData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }

      this.addBotMessage('Perfect! We\'ve received your information and someone from our team will be in touch with you shortly. Have a great day!');
      
      // Reset for next conversation
      this.currentStep = 0;
      this.leadData = {};
      
    } catch (error) {
      this.addBotMessage('Sorry, there was an error submitting your information. Please try again or contact us directly.');
      console.error('Lead submission error:', error);
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
