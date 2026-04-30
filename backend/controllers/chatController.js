/**
 * Chat Controller
 * Handles all chat-related logic (message processing, responses, etc.)
 * This layer can be extended for AI/LLM integration in the future
 */

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // Input validation
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request. "message" field is required and must be a string.',
      });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        error: 'Message cannot be empty.',
      });
    }

    // Log incoming message for debugging
    console.log(`[Chat] Received message: "${trimmedMessage}"`);

    // Mock response (future: replace with AI/LLM integration)
    const reply = generateMockResponse(trimmedMessage);

    // Log outgoing response
    console.log(`[Chat] Sending reply: "${reply}"`);

    // Return successful response
    res.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Chat] Error processing message:', error);
    res.status(500).json({
      error: 'Failed to process your message. Please try again.',
    });
  }
};

/**
 * Generate mock response based on user input
 * This is a placeholder for future AI/LLM integration
 * Replace this with actual API call or model inference
 */
const generateMockResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();

  // Simple mock responses for demonstration
  const mockResponses = {
    hello: 'Hello! How can I assist you today?',
    how: 'I\'m doing great! Thanks for asking. How can I help?',
    help: 'I\'m here to help with coding, writing, problem-solving, and more. What would you like to know?',
    thanks: 'You\'re welcome! Feel free to ask me anything else.',
    bye: 'Goodbye! Have a great day!',
  };

  // Check for keyword matches
  for (const [keyword, response] of Object.entries(mockResponses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }

  // Default response
  return `I received your message: "${userMessage}". This is a mock response from the backend. In the next phase, this will be replaced with real AI/LLM integration. You said: "${userMessage.length} characters", so I can see you\'re engaged!`;
};

module.exports = {
  sendMessage,
};
