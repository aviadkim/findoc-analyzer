import React from 'react';
import {
  Box,
  Flex,
  Spinner,
  Text,
  VStack,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  useColorModeValue,
} from '@chakra-ui/react';

// Simple loading spinner with text
export const SimpleLoading = ({ text = 'Loading...', size = 'xl', color = 'blue.500' }) => (
  <Flex
    direction="column"
    align="center"
    justify="center"
    minH="200px"
    p={6}
    textAlign="center"
  >
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color={color}
      size={size}
      mb={4}
    />
    <Text color="gray.600" fontWeight="medium">
      {text}
    </Text>
  </Flex>
);

// Card skeleton for document cards
export const CardSkeleton = ({ count = 1 }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <>
      {Array(count)
        .fill('')
        .map((_, i) => (
          <Box
            key={i}
            p={5}
            shadow="md"
            borderWidth="1px"
            borderRadius="md"
            bg={bgColor}
            mb={4}
          >
            <Flex mb={4} align="center">
              <SkeletonCircle size="10" mr={4} />
              <VStack align="start" spacing={2} flex={1}>
                <Skeleton height="20px" width="70%" />
                <Skeleton height="12px" width="40%" />
              </VStack>
            </Flex>
            <SkeletonText mt={4} noOfLines={4} spacing={4} />
          </Box>
        ))}
    </>
  );
};

// Table skeleton for data tables
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Box
      shadow="md"
      borderWidth="1px"
      borderRadius="md"
      bg={bgColor}
      overflow="hidden"
    >
      {/* Table header */}
      <Box p={4} borderBottomWidth="1px">
        <Flex>
          {Array(columns)
            .fill('')
            .map((_, i) => (
              <Box key={i} flex={i === 0 ? 2 : 1} px={2}>
                <Skeleton height="20px" width="80%" />
              </Box>
            ))}
        </Flex>
      </Box>
      
      {/* Table rows */}
      {Array(rows)
        .fill('')
        .map((_, i) => (
          <Box key={i} p={4} borderBottomWidth={i === rows - 1 ? 0 : '1px'}>
            <Flex>
              {Array(columns)
                .fill('')
                .map((_, j) => (
                  <Box key={j} flex={j === 0 ? 2 : 1} px={2}>
                    <Skeleton height="16px" width={j === 0 ? '70%' : '60%'} />
                  </Box>
                ))}
            </Flex>
          </Box>
        ))}
    </Box>
  );
};

// Dashboard skeleton with multiple components
export const DashboardSkeleton = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Box>
      {/* Header section */}
      <Box mb={8}>
        <Skeleton height="40px" width="300px" mb={4} />
        <SkeletonText noOfLines={2} spacing={4} width="60%" />
      </Box>
      
      {/* Stats cards */}
      <Flex mb={8} flexWrap="wrap" gap={4}>
        {Array(4)
          .fill('')
          .map((_, i) => (
            <Box
              key={i}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="md"
              bg={bgColor}
              flex={{ base: '1 0 100%', md: '1 0 45%', lg: '1 0 22%' }}
            >
              <Skeleton height="24px" width="60%" mb={4} />
              <Skeleton height="40px" width="80%" mb={2} />
              <SkeletonText noOfLines={1} width="40%" />
            </Box>
          ))}
      </Flex>
      
      {/* Chart section */}
      <Box
        p={5}
        shadow="md"
        borderWidth="1px"
        borderRadius="md"
        bg={bgColor}
        mb={8}
        height="300px"
      >
        <Skeleton height="24px" width="200px" mb={6} />
        <Flex height="220px" align="center" justify="center">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Flex>
      </Box>
      
      {/* Table section */}
      <Box mb={8}>
        <Skeleton height="24px" width="200px" mb={4} />
        <TableSkeleton rows={3} columns={4} />
      </Box>
    </Box>
  );
};

export default SimpleLoading;
