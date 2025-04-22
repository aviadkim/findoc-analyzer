import React from 'react';
import FinDocLayout from '../components/FinDocLayout';
import Head from 'next/head';
import FinDocRAG from '../components/FinDocRAG';

const FinDocRAGPage = () => {
  return (
    <>
      <Head>
        <title>FinDocRAG - Financial Document Analysis</title>
        <meta name="description" content="Analyze financial documents with FinDocRAG" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <FinDocLayout>
        <div className="page-container">
          <FinDocRAG />
        </div>

        <style jsx>{`
          .page-container {
            padding: 20px;
          }
        `}</style>
      </FinDocLayout>
    </>
  );
};

export default FinDocRAGPage;
