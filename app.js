const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const os = require('os');
const useragent = require('express-useragent');

const app = express();
app.use(bodyParser.json());
app.use(useragent.express());

const port = process.env.PORT || 3000;

// Initialize an array to store chat history
const chatHistory = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

app.post('/chat', (req, res) => {
    const userMessage = req.body.message.toLowerCase();
    let botResponse = '';

    // Handle clear command
    if (userMessage === 'clear') {
        // Clear chat history
        chatHistory.length = 0;
        botResponse = 'Chat history cleared.';
    } 
    else if (userMessage === 'help') {
        // Provide help instructions
        botResponse = 'Welcome to the chat! You can ask me questions like:\n' +
            '- "What is the time?"\n' +
            '- "What is my IP address?"\n' +
            '- "Tell me about my user agent."\n' +
            '- "Hello" (for a greeting)\n' +
            '- "Goodbye" (to end the conversation)\n' +
            '- "Clear" (to clear the chat history)\n' +
            'Feel free to ask anything!';
    }
    else if (userMessage.startsWith('cal')) {
        // Handle calculation
        botResponse = handleCalculation(userMessage);
    }
    else if (userMessage.startsWith('convert ') || userMessage.startsWith('conv ')) {
        // Convert Euro to Dollar
        const euroAmount = parseFloat(userMessage.split(' ')[1]);

        if (!isNaN(euroAmount)) {
            // Use the current exchange rate (you can replace this with the actual exchange rate)
            const exchangeRate = 1.15; // 1 Euro to Dollar
            const dollarAmount = euroAmount * exchangeRate;
            botResponse = `${euroAmount} Euro is approximately ${dollarAmount.toFixed(2)} Dollars.`;
        } else {
            botResponse = 'Please provide a valid amount in Euro for conversion.';
        }
    }
    else {
        // Handle other queries
        if (userMessage.includes('time')|| userMessage.includes('what is the curreny time ?')) {
            const currentTime = new Date().toLocaleTimeString();
            botResponse = `The current time is ${currentTime}`;
        } else if (userMessage.includes('ip')|| userMessage.includes('What is my IP ?')) {
            const ipAddress = req.connection.remoteAddress;
            botResponse = `Your IP address is ${ipAddress}`;
        } else if (userMessage.includes('user agent')) {
            const userAgent = req.useragent.browser + ' on ' + req.useragent.os;
            botResponse = `Your user agent is: ${userAgent}`;
        } else if (userMessage.includes('hello')|| userMessage.includes('hi')|| userMessage.includes('Hello, my friend!')|| userMessage.includes('can help me ?')) {
            botResponse = "Hi, how can I assist you today?";
        } else if (userMessage.includes('goodbye')|| userMessage.includes('bye')) {
            botResponse = "Goodbye! Feel free to return if you have more questions.";
        } 
        
        else if (userMessage.includes('who are you ?')|| userMessage.includes('who are you?')) {
            botResponse = "Hello! I'm your friendly chatbot here to assist you. I'm designed to help answer your questions, provide information, share interesting facts, and even crack a joke or two. I'm here to make your digital interactions more engaging and informative. Feel free to ask me anything you're curious about, and I'll do my best to assist you. Whether you need a quick calculation, a weather update, a piece of advice, or just a friendly conversation, I'm here for you. Ask away!";
        }
        else {
            botResponse = "I'm not sure I understand. Can you please rephrase your question?";
        }

        // Add user's message and bot's response to chat history
        chatHistory.push({ user: req.body.message, bot: botResponse });
    }

    res.json({ message: botResponse });
});

// Endpoint to retrieve chat history
app.get('/history', (req, res) => {
    res.json({ history: chatHistory });
});

function handleCalculation(userMessage) {
    // Example: "Calculate 5 + 3"
    const calculationRegex = /cal ([\d.]+) ([+\-*/]) ([\d.]+)/;
    const match = userMessage.match(calculationRegex);

    if (match && match.length === 4) {
        const num1 = parseFloat(match[1]);
        const operator = match[2];
        const num2 = parseFloat(match[3]);

        let result;
        switch (operator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '/':
                if (num2 === 0) {
                    return "Division by zero is not allowed.";
                }
                result = num1 / num2;
                break;
            default:
                return "Invalid operator. Please use +, -, *, or / for calculations.";
        }

        return ` ${num1} ${operator} ${num2} = ${result}`;
    } else {
        return "Invalid calculation format. Please use the format 'Calculate [expression]'.";
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
