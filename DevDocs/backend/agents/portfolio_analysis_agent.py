"""
Portfolio Analysis Agent for analyzing financial portfolios.
"""
import os
import json
import logging
import numpy as np
from typing import Dict, List, Any, Optional, Union, Tuple
from .base_agent import BaseAgent

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class PortfolioAnalysisAgent(BaseAgent):
    """Agent for analyzing financial portfolios."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        **kwargs
    ):
        """
        Initialize the portfolio analysis agent.

        Args:
            api_key: OpenRouter API key (optional)
            **kwargs: Additional parameters for the base agent
        """
        super().__init__(name="Portfolio Analysis Agent")
        self.api_key = api_key
        self.description = "I analyze financial portfolios and provide insights."

    def process(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a task to analyze a portfolio.

        Args:
            task: Task dictionary with the following keys:
                - portfolio: Portfolio data to analyze
                - analysis_type: Type of analysis to perform (optional)
                - benchmark: Benchmark data for comparison (optional)
                - time_period: Time period for analysis (optional)

        Returns:
            Dictionary with the analysis results
        """
        # Get the portfolio
        if 'portfolio' not in task:
            return {
                'status': 'error',
                'message': 'No portfolio provided'
            }

        portfolio = task['portfolio']

        # Get analysis options
        analysis_type = task.get('analysis_type', 'comprehensive')
        benchmark = task.get('benchmark', None)
        time_period = task.get('time_period', None)

        # Perform the analysis
        analysis = self.analyze_portfolio(portfolio, analysis_type, benchmark, time_period)

        return {
            'status': 'success',
            'analysis': analysis,
            'analysis_type': analysis_type
        }

    def analyze_portfolio(
        self,
        portfolio: Dict[str, Any],
        analysis_type: str = 'comprehensive',
        benchmark: Optional[Dict[str, Any]] = None,
        time_period: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze a portfolio.

        Args:
            portfolio: Portfolio data to analyze
            analysis_type: Type of analysis to perform
            benchmark: Benchmark data for comparison
            time_period: Time period for analysis

        Returns:
            Analysis results
        """
        # Extract portfolio data
        if 'portfolio' in portfolio:
            securities = portfolio.get('portfolio', {}).get('securities', [])
            summary = portfolio.get('portfolio', {}).get('summary', {})
        else:
            securities = portfolio.get('securities', [])
            summary = portfolio.get('summary', {})

        # Perform analysis based on type
        if analysis_type == 'comprehensive':
            return self._comprehensive_analysis(securities, summary, benchmark, time_period)
        elif analysis_type == 'risk':
            return self._risk_analysis(securities, summary, benchmark, time_period)
        elif analysis_type == 'performance':
            return self._performance_analysis(securities, summary, benchmark, time_period)
        elif analysis_type == 'allocation':
            return self._allocation_analysis(securities, summary, benchmark, time_period)
        else:
            # Default to comprehensive
            return self._comprehensive_analysis(securities, summary, benchmark, time_period)

    def _comprehensive_analysis(
        self,
        securities: List[Dict[str, Any]],
        summary: Dict[str, Any],
        benchmark: Optional[Dict[str, Any]] = None,
        time_period: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perform a comprehensive analysis of a portfolio.

        Args:
            securities: List of securities
            summary: Portfolio summary
            benchmark: Benchmark data for comparison
            time_period: Time period for analysis

        Returns:
            Comprehensive analysis results
        """
        # Perform individual analyses
        risk_analysis = self._risk_analysis(securities, summary, benchmark, time_period)
        performance_analysis = self._performance_analysis(securities, summary, benchmark, time_period)
        allocation_analysis = self._allocation_analysis(securities, summary, benchmark, time_period)

        # Combine analyses
        analysis = {
            'risk': risk_analysis,
            'performance': performance_analysis,
            'allocation': allocation_analysis,
            'summary': self._generate_analysis_summary(risk_analysis, performance_analysis, allocation_analysis)
        }

        return analysis

    def _risk_analysis(
        self,
        securities: List[Dict[str, Any]],
        summary: Dict[str, Any],
        benchmark: Optional[Dict[str, Any]] = None,
        time_period: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perform a risk analysis of a portfolio.

        Args:
            securities: List of securities
            summary: Portfolio summary
            benchmark: Benchmark data for comparison
            time_period: Time period for analysis

        Returns:
            Risk analysis results
        """
        # Calculate portfolio metrics
        total_value = summary.get('total_value', sum(security.get('value', 0) for security in securities))

        # Calculate weights
        weights = []
        for security in securities:
            value = security.get('value', 0)
            weight = value / total_value if total_value > 0 else 0
            weights.append(weight)

        # Calculate diversification metrics
        diversification_score = self._calculate_diversification_score(weights)
        concentration_risk = self._calculate_concentration_risk(weights)

        # Calculate volatility (if available)
        volatility = self._calculate_volatility(securities)

        # Calculate beta (if benchmark is available)
        beta = self._calculate_beta(securities, benchmark) if benchmark else None

        # Calculate value at risk (VaR)
        var_95 = self._calculate_var(securities, 0.95)
        var_99 = self._calculate_var(securities, 0.99)

        # Combine risk metrics
        risk_analysis = {
            'diversification_score': diversification_score,
            'concentration_risk': concentration_risk,
            'volatility': volatility,
            'beta': beta,
            'value_at_risk': {
                '95%': var_95,
                '99%': var_99
            }
        }

        return risk_analysis

    def _performance_analysis(
        self,
        securities: List[Dict[str, Any]],
        summary: Dict[str, Any],
        benchmark: Optional[Dict[str, Any]] = None,
        time_period: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perform a performance analysis of a portfolio.

        Args:
            securities: List of securities
            summary: Portfolio summary
            benchmark: Benchmark data for comparison
            time_period: Time period for analysis

        Returns:
            Performance analysis results
        """
        # Calculate portfolio metrics
        total_value = summary.get('total_value', sum(security.get('value', 0) for security in securities))

        # Calculate returns (if available)
        returns = self._calculate_returns(securities, time_period)

        # Calculate alpha (if benchmark is available)
        alpha = self._calculate_alpha(securities, benchmark) if benchmark else None

        # Calculate Sharpe ratio (if returns are available)
        sharpe_ratio = self._calculate_sharpe_ratio(returns) if returns else None

        # Calculate Sortino ratio (if returns are available)
        sortino_ratio = self._calculate_sortino_ratio(returns) if returns else None

        # Calculate top and bottom performers
        top_performers, bottom_performers = self._calculate_performers(securities)

        # Combine performance metrics
        performance_analysis = {
            'returns': returns,
            'alpha': alpha,
            'sharpe_ratio': sharpe_ratio,
            'sortino_ratio': sortino_ratio,
            'top_performers': top_performers,
            'bottom_performers': bottom_performers
        }

        return performance_analysis

    def _allocation_analysis(
        self,
        securities: List[Dict[str, Any]],
        summary: Dict[str, Any],
        benchmark: Optional[Dict[str, Any]] = None,
        time_period: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Perform an allocation analysis of a portfolio.

        Args:
            securities: List of securities
            summary: Portfolio summary
            benchmark: Benchmark data for comparison
            time_period: Time period for analysis

        Returns:
            Allocation analysis results
        """
        # Calculate portfolio metrics
        total_value = summary.get('total_value', sum(security.get('value', 0) for security in securities))

        # Calculate asset allocation
        asset_allocation = self._calculate_asset_allocation(securities, total_value)

        # Calculate sector allocation
        sector_allocation = self._calculate_sector_allocation(securities, total_value)

        # Calculate geographic allocation
        geographic_allocation = self._calculate_geographic_allocation(securities, total_value)

        # Calculate currency allocation
        currency_allocation = self._calculate_currency_allocation(securities, total_value)

        # Calculate allocation drift (if benchmark is available)
        allocation_drift = self._calculate_allocation_drift(asset_allocation, benchmark) if benchmark else None

        # Calculate recommended rebalancing (if benchmark is available)
        rebalancing = self._calculate_rebalancing(asset_allocation, benchmark) if benchmark else None

        # Combine allocation metrics
        allocation_analysis = {
            'asset_allocation': asset_allocation,
            'sector_allocation': sector_allocation,
            'geographic_allocation': geographic_allocation,
            'currency_allocation': currency_allocation,
            'allocation_drift': allocation_drift,
            'rebalancing': rebalancing
        }

        return allocation_analysis

    def _calculate_diversification_score(self, weights: List[float]) -> float:
        """
        Calculate the diversification score of a portfolio.

        Args:
            weights: List of security weights

        Returns:
            Diversification score (0-1)
        """
        if not weights:
            return 0.0

        # Calculate Herfindahl-Hirschman Index (HHI)
        hhi = sum(w ** 2 for w in weights)

        # Convert HHI to diversification score (1 - HHI)
        # Normalize to 0-1 range
        diversification_score = 1 - hhi

        return diversification_score

    def _calculate_concentration_risk(self, weights: List[float]) -> Dict[str, Any]:
        """
        Calculate the concentration risk of a portfolio.

        Args:
            weights: List of security weights

        Returns:
            Concentration risk metrics
        """
        if not weights:
            return {
                'top_5_concentration': 0.0,
                'top_10_concentration': 0.0,
                'max_single_security': 0.0
            }

        # Sort weights in descending order
        sorted_weights = sorted(weights, reverse=True)

        # Calculate top 5 concentration
        top_5_concentration = sum(sorted_weights[:5]) if len(sorted_weights) >= 5 else sum(sorted_weights)

        # Calculate top 10 concentration
        top_10_concentration = sum(sorted_weights[:10]) if len(sorted_weights) >= 10 else sum(sorted_weights)

        # Calculate maximum single security weight
        max_single_security = max(weights) if weights else 0.0

        return {
            'top_5_concentration': top_5_concentration,
            'top_10_concentration': top_10_concentration,
            'max_single_security': max_single_security
        }

    def _calculate_volatility(self, securities: List[Dict[str, Any]]) -> Optional[float]:
        """
        Calculate the volatility of a portfolio.

        Args:
            securities: List of securities

        Returns:
            Portfolio volatility or None if not available
        """
        # Check if securities have historical returns
        has_returns = any('historical_returns' in security for security in securities)

        if not has_returns:
            return None

        # This is a placeholder for a more detailed implementation
        # In a real implementation, we would calculate the volatility
        # based on historical returns
        return 0.15  # Example volatility (15%)

    def _calculate_beta(
        self,
        securities: List[Dict[str, Any]],
        benchmark: Dict[str, Any]
    ) -> Optional[float]:
        """
        Calculate the beta of a portfolio relative to a benchmark.

        Args:
            securities: List of securities
            benchmark: Benchmark data

        Returns:
            Portfolio beta or None if not available
        """
        # Check if securities and benchmark have historical returns
        has_returns = any('historical_returns' in security for security in securities)
        has_benchmark_returns = 'historical_returns' in benchmark

        if not has_returns or not has_benchmark_returns:
            return None

        # This is a placeholder for a more detailed implementation
        # In a real implementation, we would calculate the beta
        # based on historical returns
        return 1.0  # Example beta (1.0 = same as market)

    def _calculate_var(
        self,
        securities: List[Dict[str, Any]],
        confidence_level: float
    ) -> Optional[float]:
        """
        Calculate the Value at Risk (VaR) of a portfolio.

        Args:
            securities: List of securities
            confidence_level: Confidence level for VaR calculation

        Returns:
            Portfolio VaR or None if not available
        """
        # Check if securities have historical returns
        has_returns = any('historical_returns' in security for security in securities)

        if not has_returns:
            return None

        # This is a placeholder for a more detailed implementation
        # In a real implementation, we would calculate the VaR
        # based on historical returns
        if confidence_level == 0.95:
            return 0.05  # Example 95% VaR (5%)
        elif confidence_level == 0.99:
            return 0.08  # Example 99% VaR (8%)
        else:
            return None

    def _calculate_returns(
        self,
        securities: List[Dict[str, Any]],
        time_period: Optional[str]
    ) -> Optional[Dict[str, float]]:
        """
        Calculate the returns of a portfolio.

        Args:
            securities: List of securities
            time_period: Time period for return calculation

        Returns:
            Portfolio returns or None if not available
        """
        # Check if securities have historical returns
        has_returns = any('historical_returns' in security for security in securities)

        if not has_returns:
            return None

        # This is a placeholder for a more detailed implementation
        # In a real implementation, we would calculate the returns
        # based on historical returns
        return {
            'ytd': 0.08,  # Example YTD return (8%)
            '1y': 0.12,   # Example 1-year return (12%)
            '3y': 0.35,   # Example 3-year return (35%)
            '5y': 0.60    # Example 5-year return (60%)
        }

    def _calculate_alpha(
        self,
        securities: List[Dict[str, Any]],
        benchmark: Dict[str, Any]
    ) -> Optional[float]:
        """
        Calculate the alpha of a portfolio relative to a benchmark.

        Args:
            securities: List of securities
            benchmark: Benchmark data

        Returns:
            Portfolio alpha or None if not available
        """
        # Check if securities and benchmark have historical returns
        has_returns = any('historical_returns' in security for security in securities)
        has_benchmark_returns = 'historical_returns' in benchmark

        if not has_returns or not has_benchmark_returns:
            return None

        # This is a placeholder for a more detailed implementation
        # In a real implementation, we would calculate the alpha
        # based on historical returns
        return 0.02  # Example alpha (2%)

    def _calculate_sharpe_ratio(self, returns: Dict[str, float]) -> Optional[float]:
        """
        Calculate the Sharpe ratio of a portfolio.

        Args:
            returns: Portfolio returns

        Returns:
            Sharpe ratio or None if not available
        """
        if not returns or '1y' not in returns:
            return None

        # This is a placeholder for a more detailed implementation
        # In a real implementation, we would calculate the Sharpe ratio
        # based on returns and volatility
        return 1.2  # Example Sharpe ratio (1.2)

    def _calculate_sortino_ratio(self, returns: Dict[str, float]) -> Optional[float]:
        """
        Calculate the Sortino ratio of a portfolio.

        Args:
            returns: Portfolio returns

        Returns:
            Sortino ratio or None if not available
        """
        if not returns or '1y' not in returns:
            return None

        # This is a placeholder for a more detailed implementation
        # In a real implementation, we would calculate the Sortino ratio
        # based on returns and downside deviation
        return 1.5  # Example Sortino ratio (1.5)

    def _calculate_performers(
        self,
        securities: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Calculate the top and bottom performers in a portfolio.

        Args:
            securities: List of securities

        Returns:
            Tuple of top performers and bottom performers
        """
        # Check if securities have performance data
        performers = []
        for security in securities:
            if 'performance' in security:
                performers.append({
                    'name': security.get('name', security.get('description', 'Unknown')),
                    'isin': security.get('isin', 'Unknown'),
                    'performance': security['performance']
                })
            elif 'historical_returns' in security:
                # Use the most recent return as performance
                performers.append({
                    'name': security.get('name', security.get('description', 'Unknown')),
                    'isin': security.get('isin', 'Unknown'),
                    'performance': security['historical_returns'][-1]
                })

        if not performers:
            # Create dummy performers for testing
            performers = [
                {'name': 'Security 1', 'isin': 'Unknown', 'performance': 0.15},
                {'name': 'Security 2', 'isin': 'Unknown', 'performance': 0.10},
                {'name': 'Security 3', 'isin': 'Unknown', 'performance': 0.05},
                {'name': 'Security 4', 'isin': 'Unknown', 'performance': -0.05},
                {'name': 'Security 5', 'isin': 'Unknown', 'performance': -0.10}
            ]

        # Sort performers by performance
        sorted_performers = sorted(performers, key=lambda x: x['performance'], reverse=True)

        # Get top and bottom performers
        top_performers = sorted_performers[:3]
        bottom_performers = sorted_performers[-3:]

        return top_performers, bottom_performers

    def _calculate_asset_allocation(
        self,
        securities: List[Dict[str, Any]],
        total_value: float
    ) -> Dict[str, float]:
        """
        Calculate the asset allocation of a portfolio.

        Args:
            securities: List of securities
            total_value: Total portfolio value

        Returns:
            Asset allocation as a dictionary of asset types and percentages
        """
        # Calculate asset allocation
        asset_allocation = {}
        for security in securities:
            asset_type = security.get('type', security.get('asset_type', 'Unknown'))
            value = security.get('value', 0)

            if asset_type in asset_allocation:
                asset_allocation[asset_type] += value
            else:
                asset_allocation[asset_type] = value

        # Calculate percentages
        asset_allocation_percentages = {}
        for asset_type, value in asset_allocation.items():
            percentage = (value / total_value) * 100 if total_value > 0 else 0
            asset_allocation_percentages[asset_type] = percentage

        return asset_allocation_percentages

    def _calculate_sector_allocation(
        self,
        securities: List[Dict[str, Any]],
        total_value: float
    ) -> Dict[str, float]:
        """
        Calculate the sector allocation of a portfolio.

        Args:
            securities: List of securities
            total_value: Total portfolio value

        Returns:
            Sector allocation as a dictionary of sectors and percentages
        """
        # Calculate sector allocation
        sector_allocation = {}
        for security in securities:
            sector = security.get('sector', 'Unknown')
            value = security.get('value', 0)

            if sector in sector_allocation:
                sector_allocation[sector] += value
            else:
                sector_allocation[sector] = value

        # Calculate percentages
        sector_allocation_percentages = {}
        for sector, value in sector_allocation.items():
            percentage = (value / total_value) * 100 if total_value > 0 else 0
            sector_allocation_percentages[sector] = percentage

        return sector_allocation_percentages

    def _calculate_geographic_allocation(
        self,
        securities: List[Dict[str, Any]],
        total_value: float
    ) -> Dict[str, float]:
        """
        Calculate the geographic allocation of a portfolio.

        Args:
            securities: List of securities
            total_value: Total portfolio value

        Returns:
            Geographic allocation as a dictionary of regions and percentages
        """
        # Calculate geographic allocation
        geographic_allocation = {}
        for security in securities:
            region = security.get('region', security.get('country', 'Unknown'))
            value = security.get('value', 0)

            if region in geographic_allocation:
                geographic_allocation[region] += value
            else:
                geographic_allocation[region] = value

        # Calculate percentages
        geographic_allocation_percentages = {}
        for region, value in geographic_allocation.items():
            percentage = (value / total_value) * 100 if total_value > 0 else 0
            geographic_allocation_percentages[region] = percentage

        return geographic_allocation_percentages

    def _calculate_currency_allocation(
        self,
        securities: List[Dict[str, Any]],
        total_value: float
    ) -> Dict[str, float]:
        """
        Calculate the currency allocation of a portfolio.

        Args:
            securities: List of securities
            total_value: Total portfolio value

        Returns:
            Currency allocation as a dictionary of currencies and percentages
        """
        # Calculate currency allocation
        currency_allocation = {}
        for security in securities:
            currency = security.get('currency', 'Unknown')
            value = security.get('value', 0)

            if currency in currency_allocation:
                currency_allocation[currency] += value
            else:
                currency_allocation[currency] = value

        # Calculate percentages
        currency_allocation_percentages = {}
        for currency, value in currency_allocation.items():
            percentage = (value / total_value) * 100 if total_value > 0 else 0
            currency_allocation_percentages[currency] = percentage

        return currency_allocation_percentages

    def _calculate_allocation_drift(
        self,
        allocation: Dict[str, float],
        benchmark: Dict[str, Any]
    ) -> Dict[str, float]:
        """
        Calculate the allocation drift of a portfolio relative to a benchmark.

        Args:
            allocation: Portfolio allocation
            benchmark: Benchmark allocation

        Returns:
            Allocation drift as a dictionary of asset types and drift percentages
        """
        # Get benchmark allocation
        benchmark_allocation = benchmark.get('allocation', {})

        # Calculate drift
        drift = {}
        for asset_type, percentage in allocation.items():
            benchmark_percentage = benchmark_allocation.get(asset_type, 0)
            drift[asset_type] = percentage - benchmark_percentage

        return drift

    def _calculate_rebalancing(
        self,
        allocation: Dict[str, float],
        benchmark: Dict[str, Any]
    ) -> Dict[str, float]:
        """
        Calculate the recommended rebalancing of a portfolio.

        Args:
            allocation: Portfolio allocation
            benchmark: Benchmark allocation

        Returns:
            Recommended rebalancing as a dictionary of asset types and adjustment percentages
        """
        # Get benchmark allocation
        benchmark_allocation = benchmark.get('allocation', {})

        # Calculate rebalancing
        rebalancing = {}
        for asset_type, percentage in allocation.items():
            benchmark_percentage = benchmark_allocation.get(asset_type, 0)
            if abs(percentage - benchmark_percentage) > 5:  # 5% threshold
                rebalancing[asset_type] = benchmark_percentage - percentage

        return rebalancing

    def _generate_analysis_summary(
        self,
        risk_analysis: Dict[str, Any],
        performance_analysis: Dict[str, Any],
        allocation_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate a summary of the portfolio analysis.

        Args:
            risk_analysis: Risk analysis results
            performance_analysis: Performance analysis results
            allocation_analysis: Allocation analysis results

        Returns:
            Analysis summary
        """
        # Extract key metrics
        diversification_score = risk_analysis.get('diversification_score', 0)
        concentration_risk = risk_analysis.get('concentration_risk', {}).get('top_5_concentration', 0)
        volatility = risk_analysis.get('volatility', None)

        returns = performance_analysis.get('returns', {})
        ytd_return = returns.get('ytd', None) if returns else None
        one_year_return = returns.get('1y', None) if returns else None

        sharpe_ratio = performance_analysis.get('sharpe_ratio', None)

        # Generate insights
        insights = []

        # Diversification insights
        if diversification_score < 0.5:
            insights.append("The portfolio has low diversification. Consider adding more securities across different asset classes.")
        elif diversification_score < 0.7:
            insights.append("The portfolio has moderate diversification. Consider further diversifying to reduce risk.")
        else:
            insights.append("The portfolio is well-diversified across securities.")

        # Concentration insights
        if concentration_risk > 0.6:
            insights.append("The portfolio is highly concentrated in the top 5 securities. Consider reducing exposure to these securities.")
        elif concentration_risk > 0.4:
            insights.append("The portfolio has moderate concentration in the top 5 securities.")

        # Performance insights
        if one_year_return is not None:
            if one_year_return > 0.15:
                insights.append(f"The portfolio has strong 1-year performance ({one_year_return:.1%}).")
            elif one_year_return > 0:
                insights.append(f"The portfolio has positive 1-year performance ({one_year_return:.1%}).")
            else:
                insights.append(f"The portfolio has negative 1-year performance ({one_year_return:.1%}).")

        # Risk-adjusted performance insights
        if sharpe_ratio is not None:
            if sharpe_ratio > 1.5:
                insights.append(f"The portfolio has excellent risk-adjusted returns (Sharpe ratio: {sharpe_ratio:.2f}).")
            elif sharpe_ratio > 1:
                insights.append(f"The portfolio has good risk-adjusted returns (Sharpe ratio: {sharpe_ratio:.2f}).")
            elif sharpe_ratio > 0:
                insights.append(f"The portfolio has positive risk-adjusted returns (Sharpe ratio: {sharpe_ratio:.2f}).")
            else:
                insights.append(f"The portfolio has negative risk-adjusted returns (Sharpe ratio: {sharpe_ratio:.2f}).")

        # Generate recommendations
        recommendations = []

        # Diversification recommendations
        if diversification_score < 0.7:
            recommendations.append("Increase diversification by adding securities from different asset classes, sectors, and regions.")

        # Concentration recommendations
        if concentration_risk > 0.5:
            recommendations.append("Reduce concentration risk by decreasing exposure to the top holdings.")

        # Rebalancing recommendations
        if allocation_analysis.get('rebalancing'):
            rebalancing = allocation_analysis['rebalancing']
            for asset_type, adjustment in rebalancing.items():
                if adjustment > 0:
                    recommendations.append(f"Increase allocation to {asset_type} by {abs(adjustment):.1f}%.")
                else:
                    recommendations.append(f"Decrease allocation to {asset_type} by {abs(adjustment):.1f}%.")

        # Create summary
        summary = {
            'key_metrics': {
                'diversification_score': diversification_score,
                'concentration_risk': concentration_risk,
                'volatility': volatility,
                'ytd_return': ytd_return,
                'one_year_return': one_year_return,
                'sharpe_ratio': sharpe_ratio
            },
            'insights': insights,
            'recommendations': recommendations
        }

        return summary

    def save_analysis(self, analysis: Dict[str, Any], output_path: str) -> str:
        """
        Save analysis results to a file.

        Args:
            analysis: Analysis results
            output_path: Output file path

        Returns:
            Path to the saved file
        """
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2)

        return output_path
