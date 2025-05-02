/**
 * Table Understanding Agent
 *
 * This agent analyzes table structures and identifies column types.
 */

const { generateContentInternal } = require('../../api/controllers/geminiController');
const { extractTables } = require('./table_extractor');

/**
 * Table Understanding Agent
 */
class TableUnderstandingAgent {
  /**
   * Constructor
   * @param {object} options - Agent options
   */
  constructor(options = {}) {
    this.name = 'Table Understanding Agent';
    this.description = 'Analyzes table structures and identifies column types';
    this.options = options;
    this.state = {
      processing: false,
      completed: false
    };
  }

  /**
   * Process tables
   * @param {Array<object>} tables - Tables to process
   * @param {object} documentAnalysis - Document analysis result
   * @returns {Promise<Array<object>>} Processed tables
   */
  async processTables(tables, documentAnalysis = {}) {
    try {
      console.log(`Table Understanding processing ${tables.length} tables`);

      // Update state
      this.state = {
        processing: true,
        completed: false
      };

      // Use enhanced table extractor
      const processedTables = await extractTables(documentAnalysis);

      // Analyze table relationships
      const tableRelationships = await this.analyzeTableRelationships(processedTables);

      // Add relationships to tables
      for (const table of processedTables) {
        table.relationships = tableRelationships.filter(rel => rel.sourceTableId === table.id || rel.targetTableId === table.id);
      }

      // Update state
      this.state = {
        processing: false,
        completed: true
      };

      return processedTables;
    } catch (error) {
      console.error('Error in Table Understanding:', error);

      // Update state
      this.state = {
        processing: false,
        completed: false,
        error: error.message
      };

      throw error;
    }
  }

  /**
   * Analyze table relationships
   * @param {Array<object>} tables - Processed tables
   * @returns {Promise<Array<object>>} Table relationships
   */
  async analyzeTableRelationships(tables) {
    try {
      // If there are fewer than 2 tables, there are no relationships
      if (tables.length < 2) {
        return [];
      }

      // Prepare prompt
      const prompt = `
        Analyze the relationships between the following tables.

        Tables:
        ${tables.map((table, index) => `
          Table ${index + 1} (${table.tableType || 'unknown'}):
          ${table.text}
        `).join('\n\n')}

        Identify relationships between tables, such as:
        - One table summarizes another table
        - One table provides details for another table
        - Tables share common columns or data

        Return the relationships as a JSON array of objects with the following properties:
        - sourceTableId: The index of the source table (1-based)
        - targetTableId: The index of the target table (1-based)
        - relationshipType: The type of relationship (summary, detail, related)
        - description: A brief description of the relationship

        If there are no relationships, return an empty array.
      `;

      try {
        // Generate response using Gemini API
        const responseText = await generateContentInternal(prompt);

        // Extract JSON
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);

        if (jsonMatch) {
          try {
            const relationships = JSON.parse(jsonMatch[0]);
            return relationships;
          } catch (error) {
            console.error('Error parsing relationships JSON:', error);
            // Continue to fallback
          }
        }
      } catch (error) {
        console.error('Error analyzing table relationships with Gemini:', error);
        // Continue to fallback
      }

      // Fallback to simple relationship detection
      return this.detectSimpleRelationships(tables);
    } catch (error) {
      console.error('Error analyzing table relationships:', error);
      return [];
    }
  }

  /**
   * Detect simple relationships between tables
   * @param {Array<object>} tables - Processed tables
   * @returns {Array<object>} Table relationships
   */
  detectSimpleRelationships(tables) {
    const relationships = [];

    // Check for summary-detail relationships
    for (let i = 0; i < tables.length; i++) {
      for (let j = 0; j < tables.length; j++) {
        if (i === j) {
          continue;
        }

        const table1 = tables[i];
        const table2 = tables[j];

        // Check if table1 is a summary of table2
        if (
          table1.tableType === 'summary_table' &&
          (table2.tableType === 'securities_table' || table2.tableType === 'transactions_table')
        ) {
          relationships.push({
            sourceTableId: i + 1,
            targetTableId: j + 1,
            relationshipType: 'summary',
            description: `Table ${i + 1} summarizes data from Table ${j + 1}`
          });
        }

        // Check if table1 provides details for table2
        if (
          (table1.tableType === 'securities_table' || table1.tableType === 'transactions_table') &&
          table2.tableType === 'summary_table'
        ) {
          relationships.push({
            sourceTableId: i + 1,
            targetTableId: j + 1,
            relationshipType: 'detail',
            description: `Table ${i + 1} provides details for Table ${j + 1}`
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Get agent status
   * @returns {Promise<object>} Agent status
   */
  async getStatus() {
    return {
      name: this.name,
      description: this.description,
      state: this.state,
      apiKeyConfigured: true // We're using the geminiController which handles API key management
    };
  }
}

module.exports = {
  TableUnderstandingAgent
};
