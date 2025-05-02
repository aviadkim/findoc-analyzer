import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
  HStack,
  Avatar,
  Spinner,
  useToast,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { FiSend, FiRefreshCw, FiDownload, FiCopy } from 'react-icons/fi';

const DocumentChat = ({ documentId, documentName }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your financial document assistant. I can answer questions about the document "${documentName || 'you uploaded'}". What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate a response
      const response = await simulateApiCall(input, documentId);

      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate API call to backend
  const simulateApiCall = async (message, docId) => {
    // In a real implementation, this would be an actual API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Sample responses based on keywords in the message
    if (message.toLowerCase().includes('harp')) {
      return {
        role: 'assistant',
        content:
          'The HARP ISSUER (4% MIN/5,5% MAX) NOTES 2023-18.09.2028 with ISIN XS2565592833 has a value of 1,502,850 USD, which is 7.70% of the total assets. The nominal quantity is 1,500,000 and the actual price is 98.39.',
      };
    } else if (message.toLowerCase().includes('total value') || message.toLowerCase().includes('portfolio value')) {
      return {
        role: 'assistant',
        content: 'The total portfolio value is 19,524,382 USD as of the valuation date.',
      };
    } else if (message.toLowerCase().includes('asset') && message.toLowerCase().includes('allocation')) {
      return {
        role: 'assistant',
        content:
          'The asset allocation of the portfolio is:\n- Bonds: 14.01% (2,734,371 USD)\n- Equities: 43.32% (8,456,789 USD)\n- Alternative Investments: 29.09% (5,678,901 USD)\n- Cash: 13.58% (2,654,321 USD)',
      };
    } else if (message.toLowerCase().includes('goldman')) {
      return {
        role: 'assistant',
        content:
          'The GOLDMAN SACHS 0% NOTES 23-07.11.29 SERIES P with ISIN XS2692298537 has a value of 735,333 USD, which is 3.77% of the total assets. The nominal quantity is 690,000 and the actual price is 106.57.',
      };
    } else {
      return {
        role: 'assistant',
        content:
          "I've analyzed the document and found information about various securities including bonds from Toronto Dominion Bank, Canadian Imperial Bank of Commerce, Harp Issuer, Goldman Sachs, and Luminis. The portfolio has a total value of approximately 19.5 million USD with allocations across bonds, equities, alternative investments, and cash. Is there something specific you'd like to know about?",
      };
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I'm your financial document assistant. I can answer questions about the document "${documentName || 'you uploaded'}". What would you like to know?`,
      },
    ]);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Message copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box
      bg="white"
      borderRadius="md"
      boxShadow="md"
      height="600px"
      display="flex"
      flexDirection="column"
    >
      <Flex
        bg="blue.500"
        color="white"
        p={3}
        borderTopRadius="md"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontWeight="bold">Document Chat Assistant</Text>
        <Tooltip label="Reset conversation">
          <IconButton
            icon={<FiRefreshCw />}
            size="sm"
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={clearChat}
            aria-label="Reset conversation"
          />
        </Tooltip>
      </Flex>

      <VStack
        flex="1"
        overflowY="auto"
        p={4}
        spacing={4}
        align="stretch"
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            width: '10px',
            background: '#f1f1f1',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c5c5c5',
            borderRadius: '24px',
          },
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            alignSelf={message.role === 'user' ? 'flex-end' : 'flex-start'}
            maxWidth="80%"
          >
            <HStack alignItems="flex-start" spacing={2}>
              {message.role === 'assistant' && (
                <Avatar size="sm" name="AI Assistant" bg="blue.500" />
              )}
              <Box>
                <Box
                  bg={message.role === 'user' ? 'blue.100' : 'gray.100'}
                  p={3}
                  borderRadius="lg"
                  position="relative"
                >
                  <Text whiteSpace="pre-wrap">{message.content}</Text>
                </Box>
                {message.role === 'assistant' && (
                  <HStack mt={1} justifyContent="flex-start">
                    <Tooltip label="Copy to clipboard">
                      <IconButton
                        icon={<FiCopy />}
                        size="xs"
                        variant="ghost"
                        onClick={() => copyToClipboard(message.content)}
                        aria-label="Copy to clipboard"
                      />
                    </Tooltip>
                  </HStack>
                )}
              </Box>
              {message.role === 'user' && (
                <Avatar size="sm" name="User" bg="green.500" />
              )}
            </HStack>
          </Box>
        ))}
        {isLoading && (
          <Box alignSelf="flex-start" maxWidth="80%">
            <HStack alignItems="flex-start" spacing={2}>
              <Avatar size="sm" name="AI Assistant" bg="blue.500" />
              <Box bg="gray.100" p={3} borderRadius="lg">
                <Spinner size="sm" mr={2} />
                <Text as="span">Thinking...</Text>
              </Box>
            </HStack>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </VStack>

      <Divider />

      <Box p={3}>
        <HStack>
          <Input
            placeholder="Ask a question about the document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            colorScheme="blue"
            onClick={handleSendMessage}
            isLoading={isLoading}
            leftIcon={<FiSend />}
            disabled={!input.trim()}
          >
            Send
          </Button>
        </HStack>
        <Text fontSize="xs" color="gray.500" mt={1}>
          Ask questions like "What is the value of the Harp security?" or "What is the asset allocation?"
        </Text>
      </Box>
    </Box>
  );
};

export default DocumentChat;
