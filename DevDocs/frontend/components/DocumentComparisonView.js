import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiX, FiEye, FiGrid, FiList, FiBarChart2 } from 'react-icons/fi';
import AccessibilityWrapper from './AccessibilityWrapper';
import { ComparativeChart } from './charts';

// Component to highlight differences in text
const DiffText = ({ original, updated }) => {
  if (!original || !updated) return null;
  
  // Simple diff algorithm for demonstration
  // For production, use a more sophisticated diff library
  const highlightDiff = (str1, str2) => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    const result = [];
    let i = 0, j = 0;
    
    while (i < words1.length && j < words2.length) {
      if (words1[i] === words2[j]) {
        result.push(<span key={`same-${i}`}>{words1[i]} </span>);
        i++;
        j++;
      } else {
        // Try to find the removed and added words
        let found = false;
        for (let k = 1; k < 3 && i + k < words1.length; k++) {
          if (words1[i + k] === words2[j]) {
            // Found words removed
            for (let l = 0; l < k; l++) {
              result.push(<span key={`removed-${i + l}`} className="bg-red-100 line-through">{words1[i + l]} </span>);
            }
            i += k;
            found = true;
            break;
          }
        }
        
        if (!found) {
          for (let k = 1; k < 3 && j + k < words2.length; k++) {
            if (words1[i] === words2[j + k]) {
              // Found words added
              for (let l = 0; l < k; l++) {
                result.push(<span key={`added-${j + l}`} className="bg-green-100">{words2[j + l]} </span>);
              }
              j += k;
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          // Just mark them as different
          result.push(<span key={`removed-${i}`} className="bg-red-100 line-through">{words1[i]} </span>);
          result.push(<span key={`added-${j}`} className="bg-green-100">{words2[j]} </span>);
          i++;
          j++;
        }
      }
    }
    
    // Add remaining words
    while (i < words1.length) {
      result.push(<span key={`removed-${i}`} className="bg-red-100 line-through">{words1[i]} </span>);
      i++;
    }
    
    while (j < words2.length) {
      result.push(<span key={`added-${j}`} className="bg-green-100">{words2[j]} </span>);
      j++;
    }
    
    return result;
  };
  
  return (
    <div className="text-gray-800 whitespace-pre-wrap">
      {highlightDiff(original, updated)}
    </div>
  );
};

// Component to display a table with highlighted differences
const DiffTable = ({ tables, headers }) => {
  if (!tables || tables.length < 2 || !tables[0] || !tables[1]) {
    return <div className="text-gray-500 p-4">No comparable tables available</div>;
  }
  
  const table1 = tables[0];
  const table2 = tables[1];
  
  // Use provided headers or extract from tables
  const tableHeaders = headers || 
    (table1.headers ? table1.headers : 
      (table1.length > 0 ? Object.keys(table1[0]) : []));
  
  // Compare cell values and determine if they differ
  const compareCell = (row1, row2, key) => {
    if (!row1 || !row2) return { differs: true, value1: row1?.[key], value2: row2?.[key] };
    
    const val1 = row1[key];
    const val2 = row2[key];
    
    // Handle numeric values (compare with tolerance)
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      const differs = Math.abs(val1 - val2) > 0.001;
      return { differs, value1: val1, value2: val2 };
    }
    
    // Handle string values
    return { 
      differs: val1 !== val2,
      value1: val1,
      value2: val2
    };
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {tableHeaders.map((header, idx) => (
              <th 
                key={idx} 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table1.map((row1, rowIdx) => {
            const row2 = table2[rowIdx];
            
            return (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {tableHeaders.map((header, colIdx) => {
                  const { differs, value1, value2 } = compareCell(row1, row2, header);
                  
                  return (
                    <td 
                      key={colIdx} 
                      className={`px-6 py-4 whitespace-nowrap text-sm ${differs ? 'bg-yellow-50' : ''}`}
                    >
                      {differs ? (
                        <div>
                          <div className="line-through text-red-600">{value1}</div>
                          <div className="text-green-600">{value2}</div>
                        </div>
                      ) : (
                        <span>{value1}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          
          {/* Show additional rows in table2 if it has more rows than table1 */}
          {table2.length > table1.length && table2.slice(table1.length).map((row, rowIdx) => (
            <tr key={`extra-${rowIdx}`} className="bg-green-50">
              {tableHeaders.map((header, colIdx) => (
                <td 
                  key={colIdx} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-green-600"
                >
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const DocumentComparisonView = ({ documents, height = '100%', width = '100%' }) => {
  const [view, setView] = useState('side-by-side'); // 'side-by-side', 'diff', 'chart'
  const [section, setSection] = useState('summary'); // 'summary', 'holdings', 'details', 'tables'
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    holdings: true,
    details: false,
    tables: false
  });
  
  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
  
  const prepareDocumentsForComparison = () => {
    if (!documents || documents.length < 2) {
      return {
        summary: null,
        holdings: null,
        details: null,
        tables: null
      };
    }
    
    return {
      summary: documents.map(doc => doc.summary || {}),
      holdings: documents.map(doc => doc.holdings || []),
      details: documents.map(doc => doc.details || {}),
      tables: documents.map(doc => doc.tables || [])
    };
  };
  
  const compareData = prepareDocumentsForComparison();
  
  const renderSummarySection = () => {
    if (!compareData.summary) return null;
    
    const summary1 = compareData.summary[0];
    const summary2 = compareData.summary[1];
    
    if (view === 'side-by-side') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-medium text-sm mb-2">{documents[0].name}</h4>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(summary1).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">{key}</div>
                  <div className="text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-medium text-sm mb-2">{documents[1].name}</h4>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(summary2).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-2 rounded">
                  <div className="text-xs text-gray-500">{key}</div>
                  <div className="text-sm font-medium">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (view === 'diff') {
      // Combine all summary keys from both documents
      const allKeys = [...new Set([
        ...Object.keys(summary1 || {}),
        ...Object.keys(summary2 || {})
      ])];
      
      return (
        <div className="border rounded-lg p-4 bg-white">
          <div className="grid grid-cols-1 gap-2">
            {allKeys.map(key => {
              const value1 = summary1[key];
              const value2 = summary2[key];
              const isDifferent = value1 !== value2;
              
              return (
                <div key={key} className={`p-2 rounded ${isDifferent ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <div className="text-xs text-gray-500">{key}</div>
                  {isDifferent ? (
                    <div>
                      <div className="text-sm line-through text-red-600">{value1}</div>
                      <div className="text-sm text-green-600">{value2}</div>
                    </div>
                  ) : (
                    <div className="text-sm font-medium">{value1}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (view === 'chart') {
      return (
        <div className="border rounded-lg p-4 bg-white">
          <ComparativeChart 
            documents={documents} 
            height={300}
            title="Document Comparison"
          />
        </div>
      );
    }
    
    return null;
  };
  
  const renderHoldingsSection = () => {
    if (!compareData.holdings) return null;
    
    const holdings1 = compareData.holdings[0];
    const holdings2 = compareData.holdings[1];
    
    if (view === 'side-by-side') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-medium text-sm mb-2">{documents[0].name}</h4>
            <div className="divide-y">
              {holdings1.map((holding, idx) => (
                <div key={idx} className="py-2">
                  <div className="flex justify-between">
                    <div className="font-medium">{holding.name}</div>
                    <div>{holding.value?.toLocaleString()}</div>
                  </div>
                  {holding.details && (
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.entries(holding.details).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-medium text-sm mb-2">{documents[1].name}</h4>
            <div className="divide-y">
              {holdings2.map((holding, idx) => (
                <div key={idx} className="py-2">
                  <div className="flex justify-between">
                    <div className="font-medium">{holding.name}</div>
                    <div>{holding.value?.toLocaleString()}</div>
                  </div>
                  {holding.details && (
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.entries(holding.details).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (view === 'diff') {
      // Create a map of holdings by name for easier comparison
      const holdingsMap1 = Object.fromEntries(
        holdings1.map(h => [h.name, h])
      );
      
      const holdingsMap2 = Object.fromEntries(
        holdings2.map(h => [h.name, h])
      );
      
      // Combine all holding names from both documents
      const allHoldingNames = [...new Set([
        ...holdings1.map(h => h.name),
        ...holdings2.map(h => h.name)
      ])];
      
      return (
        <div className="border rounded-lg p-4 bg-white">
          <div className="divide-y">
            {allHoldingNames.map((name, idx) => {
              const holding1 = holdingsMap1[name];
              const holding2 = holdingsMap2[name];
              
              // Determine if this holding exists in both documents
              const onlyIn1 = holding1 && !holding2;
              const onlyIn2 = !holding1 && holding2;
              const inBoth = holding1 && holding2;
              
              // Determine if values differ
              const valueDiffers = inBoth && holding1.value !== holding2.value;
              
              return (
                <div 
                  key={idx} 
                  className={`py-2 ${
                    onlyIn1 ? 'bg-red-50' : 
                    onlyIn2 ? 'bg-green-50' : 
                    valueDiffers ? 'bg-yellow-50' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="font-medium">{name}</div>
                    {onlyIn1 && (
                      <div className="text-red-600 line-through">
                        {holding1.value?.toLocaleString()}
                      </div>
                    )}
                    {onlyIn2 && (
                      <div className="text-green-600">
                        {holding2.value?.toLocaleString()}
                      </div>
                    )}
                    {inBoth && valueDiffers && (
                      <div>
                        <div className="text-red-600 line-through">
                          {holding1.value?.toLocaleString()}
                        </div>
                        <div className="text-green-600">
                          {holding2.value?.toLocaleString()}
                        </div>
                      </div>
                    )}
                    {inBoth && !valueDiffers && (
                      <div>{holding1.value?.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (view === 'chart') {
      return (
        <div className="border rounded-lg p-4 bg-white">
          <ComparativeChart 
            documents={documents} 
            height={300}
            title="Holdings Comparison"
          />
        </div>
      );
    }
    
    return null;
  };
  
  const renderDetailsSection = () => {
    if (!compareData.details) return null;
    
    const details1 = compareData.details[0];
    const details2 = compareData.details[1];
    
    if (view === 'side-by-side') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-medium text-sm mb-2">{documents[0].name}</h4>
            <pre className="text-xs whitespace-pre-wrap">{
              typeof details1 === 'object' ? 
                JSON.stringify(details1, null, 2) : 
                details1
            }</pre>
          </div>
          
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-medium text-sm mb-2">{documents[1].name}</h4>
            <pre className="text-xs whitespace-pre-wrap">{
              typeof details2 === 'object' ? 
                JSON.stringify(details2, null, 2) : 
                details2
            }</pre>
          </div>
        </div>
      );
    }
    
    if (view === 'diff') {
      const detailsStr1 = typeof details1 === 'object' ? 
        JSON.stringify(details1, null, 2) : 
        String(details1);
      
      const detailsStr2 = typeof details2 === 'object' ? 
        JSON.stringify(details2, null, 2) : 
        String(details2);
      
      return (
        <div className="border rounded-lg p-4 bg-white">
          <DiffText original={detailsStr1} updated={detailsStr2} />
        </div>
      );
    }
    
    return null;
  };
  
  const renderTablesSection = () => {
    if (!compareData.tables || compareData.tables[0]?.length === 0 || compareData.tables[1]?.length === 0) {
      return null;
    }
    
    const tables1 = compareData.tables[0];
    const tables2 = compareData.tables[1];
    
    if (view === 'side-by-side') {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-medium text-sm mb-2">{documents[0].name}</h4>
            <div className="overflow-x-auto">
              {tables1.map((table, idx) => (
                <div key={idx} className="mb-4">
                  {table.title && <h5 className="text-sm font-medium mb-2">{table.title}</h5>}
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {(table.headers || Object.keys(table.data[0] || {})).map((header, headerIdx) => (
                          <th 
                            key={headerIdx} 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(table.data || []).map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {(table.headers || Object.keys(row)).map((header, cellIdx) => (
                            <td 
                              key={cellIdx} 
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-white">
            <h4 className="font-medium text-sm mb-2">{documents[1].name}</h4>
            <div className="overflow-x-auto">
              {tables2.map((table, idx) => (
                <div key={idx} className="mb-4">
                  {table.title && <h5 className="text-sm font-medium mb-2">{table.title}</h5>}
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {(table.headers || Object.keys(table.data[0] || {})).map((header, headerIdx) => (
                          <th 
                            key={headerIdx} 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(table.data || []).map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {(table.headers || Object.keys(row)).map((header, cellIdx) => (
                            <td 
                              key={cellIdx} 
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    if (view === 'diff') {
      // For each table in document 1, try to find corresponding table in document 2
      return (
        <div className="border rounded-lg p-4 bg-white">
          {tables1.map((table1, idx) => {
            // Try to find matching table by title or structure
            const matchingTable = tables2.find(t => 
              (t.title && t.title === table1.title) || 
              (t.headers && table1.headers && t.headers.join() === table1.headers.join())
            );
            
            if (!matchingTable) {
              return (
                <div key={idx} className="mb-4 bg-red-50 p-2 rounded">
                  <h5 className="text-sm font-medium mb-2">
                    {table1.title || `Table ${idx + 1}`} 
                    <span className="text-red-600 ml-2">(Only in {documents[0].name})</span>
                  </h5>
                </div>
              );
            }
            
            return (
              <div key={idx} className="mb-4">
                <h5 className="text-sm font-medium mb-2">
                  {table1.title || `Table ${idx + 1}`}
                </h5>
                <DiffTable 
                  tables={[table1.data, matchingTable.data]}
                  headers={table1.headers || (table1.data && table1.data.length > 0 ? Object.keys(table1.data[0]) : [])}
                />
              </div>
            );
          })}
          
          {/* Show tables that are only in document 2 */}
          {tables2.filter(t2 => 
            !tables1.some(t1 => 
              (t1.title && t1.title === t2.title) || 
              (t1.headers && t2.headers && t1.headers.join() === t2.headers.join())
            )
          ).map((table, idx) => (
            <div key={`doc2-${idx}`} className="mb-4 bg-green-50 p-2 rounded">
              <h5 className="text-sm font-medium mb-2">
                {table.title || `Table ${idx + 1}`} 
                <span className="text-green-600 ml-2">(Only in {documents[1].name})</span>
              </h5>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <AccessibilityWrapper>
      <div 
        className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
        style={{ width, height }}
      >
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Document Comparison</h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setView('side-by-side')}
                className={`p-2 rounded-md ${view === 'side-by-side' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Side by Side View"
              >
                <FiGrid className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setView('diff')}
                className={`p-2 rounded-md ${view === 'diff' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Diff View"
              >
                <FiList className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setView('chart')}
                className={`p-2 rounded-md ${view === 'chart' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Chart View"
              >
                <FiBarChart2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {documents && documents.length >= 2 && (
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <div>{documents[0].name || 'Document 1'}</div>
              <div className="mx-2">vs</div>
              <div>{documents[1].name || 'Document 2'}</div>
            </div>
          )}
        </div>
        
        <div className="overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
          <div className="p-4 space-y-4">
            {/* Summary Section */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div 
                className="p-3 bg-gray-100 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSection('summary')}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Summary</h4>
                  {expandedSections.summary ? 
                    <FiChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <FiChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
              </div>
              {expandedSections.summary && (
                <div className="p-4">
                  {renderSummarySection()}
                </div>
              )}
            </div>
            
            {/* Holdings Section */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div 
                className="p-3 bg-gray-100 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSection('holdings')}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Holdings</h4>
                  {expandedSections.holdings ? 
                    <FiChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <FiChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
              </div>
              {expandedSections.holdings && (
                <div className="p-4">
                  {renderHoldingsSection()}
                </div>
              )}
            </div>
            
            {/* Details Section */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div 
                className="p-3 bg-gray-100 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSection('details')}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Details</h4>
                  {expandedSections.details ? 
                    <FiChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <FiChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
              </div>
              {expandedSections.details && (
                <div className="p-4">
                  {renderDetailsSection()}
                </div>
              )}
            </div>
            
            {/* Tables Section */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div 
                className="p-3 bg-gray-100 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSection('tables')}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Tables</h4>
                  {expandedSections.tables ? 
                    <FiChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <FiChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
              </div>
              {expandedSections.tables && (
                <div className="p-4">
                  {renderTablesSection()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AccessibilityWrapper>
  );
};

export default DocumentComparisonView;
