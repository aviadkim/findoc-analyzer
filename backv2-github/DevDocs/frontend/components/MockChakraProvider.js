import React from 'react';

// This is a mock implementation of ChakraProvider that doesn't actually use Chakra UI
const MockChakraProvider = ({ children }) => {
  // Just render the children without any Chakra UI context
  return <>{children}</>;
};

export default MockChakraProvider;
