import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, Volume2, HelpCircle } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';

const AI_AVATAR = '🤖';

const AI_RESPONSES = {
  greeting: [
    "Bonjour! 👋 أنا مساعدك في تعلم الفرنسية! كيف يمكنني مساعدتك اليوم؟",
    "Salut! 😊 مستعد لمساعدتك في رحلة تعلم الفرنسية!"
  ],
  pronunciation: [
    "لننطق الكلمة معاً! استمع إلي أولاً: 🎧",
    "كرر معي: 🔊",
    "رائع! حاول مرة أخرى، أنت تتحسن! 💪"
  ],
  encouragement: [
    "Bravo! 🎉 إجابة ممتازة!",
    "Très bien! 👏 أحسنت!",
    "Génial! ⭐ استمر في هذا الأداء الرائع!",
    "Excellent! 🌟 أنت تتعلم بسرعة!"
  ],
  help: [
    "تحتاج مساعدة؟ يمكنني:\n🎧 مساعدتك في النطق\n📚 شرح الكلمات\n💡 إعطائك نصائح\n🎯 تشجيعك!",
    "أنا هنا للمساعدة! جرب أن تسألني:\n- كيف أقول...؟\n- ما معنى...؟\n- ساعدني في النطق"
  ],
  vocabulary: {
    'bonjour': 'Bonjour يعني "صباح الخير" أو "مرحباً" بالفرنسية. يستخدم في الصباح والنهار. ☀️',
    'merci': 'Merci يعني "شكراً". من أهم الكلمات في أي لغة! 🙏',
    'chat': 'Chat يعني "قطة". النطق: شا (مثل شاي). 🐱',
    'chien': 'Chien يعني "كلب". النطق: شيان (الـ n خفيفة). 🐕',
    'pomme': 'Pomme يعني "تفاحة". النطق: پوم (مثل بوم لكن بـ p). 🍎',
    'eau': 'Eau يعني "ماء". النطق: أو (مثل أو في العربية). 💧',
    'soleil': 'Soleil يعني "شمس". النطق: سوْلِي. ☀️',
    'lune': 'Lune يعني "قمر". النطق: لون (مثل لون لكن بـ n في النهاية). 🌙'
  },
  default: [
    "🤔 هل يمكنك إعادة صياغة سؤالك؟ أنا أفهم:\n- ما معنى [كلمة]؟\n- كيف أقول [كلمة] بالفرنسية؟\n- ساعدني في النطق",
    "💡 جرب أن تسألني:\n- 'ما معنى bonjour؟'\n- 'كيف أقول قطة بالفرنسية؟'\n- 'ساعدني في النطق'"
  ]
};

function AIHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'ai', text: AI_RESPONSES.greeting[0] }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { speak, speaking } = useSpeech();

  const getAIResponse = (text) => {
    const lowerText = text.toLowerCase().trim();
    
    // Check for vocabulary questions
    if (lowerText.includes('معنى') || lowerText.includes('ماذا تعني')) {
      for (const [word, meaning] of Object.entries(AI_RESPONSES.vocabulary)) {
        if (lowerText.includes(word)) {
          return meaning;
        }
      }
      return "🤔 لم أجد هذه الكلمة في قاموسي بعد. جرب كلمات مثل: bonjour, merci, chat, chien, pomme, eau, soleil, lune";
    }
    
    // Check for pronunciation help
    if (lowerText.includes('نطق') || lowerText.includes('كيف أقول')) {
      const word = lowerText.replace(/.*(?:نطق|كيف أقول|say)/, '').trim();
      if (word) {
        return `🔊 ${AI_RESPONSES.pronunciation[1]} "${word}"`;
      }
      return AI_RESPONSES.pronunciation[0];
    }
    
    // Check for help
    if (lowerText.includes('مساعدة') || lowerText.includes('ماذا تفعل') || lowerText.includes('help')) {
      return AI_RESPONSES.help[0];
    }
    
    // Check for greetings
    if (lowerText.includes('مرحبا') || lowerText.includes('bonjour') || lowerText.includes('salut')) {
      return AI_RESPONSES.greeting[Math.floor(Math.random() * AI_RESPONSES.greeting.length)];
    }
    
    // Default response
    return AI_RESPONSES.default[Math.floor(Math.random() * AI_RESPONSES.default.length)];
  };

  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage = { type: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      const response = getAIResponse(inputText);
      setMessages(prev => [...prev, { type: 'ai', text: response }]);
      setIsTyping(false);
      
      // Speak the response if it's French
      if (response.includes('"') || response.includes('🔊')) {
        const frenchWord = response.match(/"([^"]+)"/)?.[1];
        if (frenchWord) {
          speak(frenchWord, 'fr-FR');
        }
      }
    }, 1000);
  }, [inputText, speak]);

  const handleQuickAction = (action) => {
    let text = '';
    switch(action) {
      case 'pronunciation':
        text = 'ساعدني في النطق';
        break;
      case 'vocabulary':
        text = 'ما معنى bonjour؟';
        break;
      case 'help':
        text = 'ماذا يمكنك أن تفعل؟';
        break;
      default:
        return;
    }
    setInputText(text);
    setTimeout(() => handleSend(), 100);
  };

  const speakMessage = (text) => {
    // Extract French words and speak them
    const frenchParts = text.match(/[a-zA-ZÀ-ÿ]+/g);
    if (frenchParts) {
      speak(frenchParts.join(' '), 'fr-FR');
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <motion.button
        className="ai-floating-btn"
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5 }}
        title="المساعد الذكي"
      >
        {AI_AVATAR}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="ai-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="ai-chat-modal"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
            >
              {/* Header */}
              <div className="ai-header">
                <div className="ai-avatar-large">{AI_AVATAR}</div>
                <div className="ai-title">
                  <h3>🤖 مساعد الفرنسية</h3>
                  <span>سأساعدك في التعلم!</span>
                </div>
                <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="ai-quick-actions">
                <button onClick={() => handleQuickAction('pronunciation')}>
                  🎧 النطق
                </button>
                <button onClick={() => handleQuickAction('vocabulary')}>
                  📚 معاني
                </button>
                <button onClick={() => handleQuickAction('help')}>
                  💡 مساعدة
                </button>
              </div>

              {/* Messages */}
              <div className="ai-messages">
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    className={`ai-message ${msg.type}`}
                    initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="message-avatar">
                      {msg.type === 'ai' ? AI_AVATAR : '👤'}
                    </div>
                    <div className="message-content">
                      <p>{msg.text}</p>
                      {msg.type === 'ai' && (
                        <button 
                          className="speak-btn"
                          onClick={() => speakMessage(msg.text)}
                          disabled={speaking}
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div 
                    className="ai-message ai"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="message-avatar">{AI_AVATAR}</div>
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="ai-input-area">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="اكتب سؤالك هنا... (مثال: ما معنى bonjour؟)"
                  className="ai-input"
                />
                <button 
                  className="ai-send-btn"
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                >
                  <Send size={20} />
                </button>
              </div>

              {/* Suggestions */}
              <div className="ai-suggestions">
                <small>💡 جرب: "ما معنى chat؟" | "ساعدني في النطق" | "كيف أقول شكراً؟"</small>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AIHelper;