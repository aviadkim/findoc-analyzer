#!/usr/bin/env python3
"""
FinancialAdvisorAgent for FinDoc Analyzer
This agent provides financial advice based on portfolio analysis.
"""

import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple, Union

class FinancialAdvisorAgent:
    """
    Agent that provides financial advice based on portfolio analysis.
    """
    
    def __init__(self):
        """Initialize the FinancialAdvisorAgent"""
        self.name = "FinancialAdvisorAgent"
        self.version = "1.0.0"
        
        # Load reference data for benchmarks
        self.benchmarks = self._load_benchmarks()
        
        # Load risk tolerance profiles
        self.risk_profiles = self._load_risk_profiles()
        
        # Load recommendation templates
        self.templates = self._load_recommendation_templates()
    
    def _load_benchmarks(self) -> Dict[str, Any]:
        """
        Load benchmark data for comparisons.
        Returns:
            Dictionary of benchmark data
        """
        # In a real implementation, this would load from files or a database
        return {
            "market_indices": {
                "SP500": {"annual_return": 10.5, "volatility": 15.0},
                "MSCI_World": {"annual_return": 9.8, "volatility": 14.2},
                "MSCI_EM": {"annual_return": 11.2, "volatility": 18.5},
                "Agg_Bond": {"annual_return": 4.2, "volatility": 5.5}
            },
            "asset_allocations": {
                "conservative": {"equity": 30, "fixed_income": 60, "alternatives": 5, "cash": 5},
                "moderate": {"equity": 50, "fixed_income": 40, "alternatives": 7, "cash": 3},
                "aggressive": {"equity": 70, "fixed_income": 20, "alternatives": 8, "cash": 2}
            },
            "expense_ratios": {
                "equity_funds": {"low": 0.1, "average": 0.6, "high": 1.2},
                "bond_funds": {"low": 0.05, "average": 0.45, "high": 0.9},
                "alternative_funds": {"low": 0.3, "average": 1.0, "high": 2.0}
            }
        }
    
    def _load_risk_profiles(self) -> Dict[str, Any]:
        """
        Load risk tolerance profiles.
        Returns:
            Dictionary of risk profiles
        """
        return {
            "conservative": {
                "description": "Primarily focused on capital preservation with modest growth potential",
                "target_allocation": {"equity": 20, "fixed_income": 60, "alternatives": 10, "cash": 10},
                "max_volatility": 8.0,
                "return_expectation": 4.0,
                "time_horizon": "3-5 years"
            },
            "moderate": {
                "description": "Balanced approach between growth and capital preservation",
                "target_allocation": {"equity": 50, "fixed_income": 40, "alternatives": 7, "cash": 3},
                "max_volatility": 12.0,
                "return_expectation": 6.5,
                "time_horizon": "5-10 years"
            },
            "growth": {
                "description": "Primarily focused on long-term growth with higher volatility tolerance",
                "target_allocation": {"equity": 70, "fixed_income": 25, "alternatives": 5, "cash": 0},
                "max_volatility": 15.0,
                "return_expectation": 8.0,
                "time_horizon": "7+ years"
            },
            "aggressive": {
                "description": "Maximizing long-term growth potential with high volatility tolerance",
                "target_allocation": {"equity": 85, "fixed_income": 10, "alternatives": 5, "cash": 0},
                "max_volatility": 20.0,
                "return_expectation": 9.5,
                "time_horizon": "10+ years"
            }
        }
    
    def _load_recommendation_templates(self) -> Dict[str, str]:
        """
        Load recommendation templates.
        Returns:
            Dictionary of recommendation templates
        """
        return {
            "allocation_adjustment": (
                "Based on your {risk_profile} risk profile, we recommend adjusting your asset allocation to "
                "increase {increase_asset_class} exposure by approximately {increase_percentage}% and "
                "decrease {decrease_asset_class} exposure by approximately {decrease_percentage}%."
            ),
            "diversification": (
                "Your portfolio shows {diversification_level} diversification. We recommend adding exposure to "
                "{recommended_sectors} to enhance diversification and potentially reduce portfolio volatility."
            ),
            "expense_ratio": (
                "Your portfolio has an average expense ratio of {current_ratio}%, which is {comparison} "
                "the industry average. Consider {action} to funds with lower expense ratios, which could "
                "improve your net returns by approximately {improvement}% annually."
            ),
            "risk_assessment": (
                "Your portfolio has an estimated volatility of {volatility}%, which is {risk_comparison} "
                "your stated risk tolerance. Consider {risk_action} to better align with your investment goals."
            )
        }
    
    def analyze_portfolio(self, portfolio_data: Dict[str, Any], client_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze a portfolio and provide recommendations based on client profile.
        
        Args:
            portfolio_data: Portfolio data dictionary with securities and analysis
            client_profile: Client profile with risk tolerance, goals, and constraints
        
        Returns:
            Dictionary with recommendations and analysis
        """
        # Extract essential portfolio metrics
        try:
            # Calculate key metrics if not already present
            if 'analysis' not in portfolio_data:
                portfolio_data['analysis'] = self._calculate_portfolio_metrics(portfolio_data)
            
            portfolio_metrics = portfolio_data['analysis']
            
            # Extract client's risk profile
            risk_profile = client_profile.get('risk_profile', 'moderate')
            
            # Generate recommendations
            allocation_recommendations = self._recommend_allocation(portfolio_metrics, risk_profile)
            diversification_recommendations = self._recommend_diversification(portfolio_metrics, risk_profile)
            expense_recommendations = self._recommend_expense_optimization(portfolio_metrics)
            risk_recommendations = self._assess_risk_alignment(portfolio_metrics, risk_profile)
            
            # Create comprehensive recommendations
            recommendations = {
                'summary': self._generate_recommendation_summary(portfolio_metrics, risk_profile),
                'allocation': allocation_recommendations,
                'diversification': diversification_recommendations,
                'expenses': expense_recommendations,
                'risk': risk_recommendations,
                'implementation_steps': self._generate_implementation_steps(
                    allocation_recommendations,
                    diversification_recommendations,
                    expense_recommendations,
                    risk_recommendations
                )
            }
            
            # Prepare the result
            result = {
                'status': 'success',
                'recommendations': recommendations,
                'portfolio_summary': self._generate_portfolio_summary(portfolio_metrics),
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return result
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f"Failed to generate recommendations: {str(e)}",
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            }
    
    def _calculate_portfolio_metrics(self, portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate essential portfolio metrics if not already provided.
        
        Args:
            portfolio_data: Portfolio data dictionary
        
        Returns:
            Dictionary with calculated metrics
        """
        # Extract securities data
        securities = portfolio_data.get('securities', [])
        
        if not securities:
            raise ValueError("Portfolio contains no securities data")
        
        # Calculate asset allocation
        asset_allocation = {}
        total_value = sum(security.get('value', 0) for security in securities)
        
        if total_value == 0:
            raise ValueError("Portfolio total value is zero")
        
        # Group securities by asset class
        for security in securities:
            asset_class = security.get('asset_class', 'unknown')
            value = security.get('value', 0)
            
            if asset_class in asset_allocation:
                asset_allocation[asset_class] += value
            else:
                asset_allocation[asset_class] = value
        
        # Convert to percentages
        for asset_class in asset_allocation:
            asset_allocation[asset_class] = (asset_allocation[asset_class] / total_value) * 100
        
        # Calculate average expense ratio if available
        total_weight = 0
        weighted_expense = 0
        
        for security in securities:
            expense_ratio = security.get('expense_ratio')
            value = security.get('value', 0)
            
            if expense_ratio is not None and value > 0:
                weight = value / total_value
                weighted_expense += expense_ratio * weight
                total_weight += weight
        
        avg_expense_ratio = weighted_expense / total_weight if total_weight > 0 else None
        
        # Calculate diversification metrics
        num_securities = len(securities)
        asset_classes = set(security.get('asset_class', 'unknown') for security in securities)
        num_asset_classes = len(asset_classes)
        
        # Prepare the result
        return {
            'asset_allocation': asset_allocation,
            'total_value': total_value,
            'num_securities': num_securities,
            'num_asset_classes': num_asset_classes,
            'avg_expense_ratio': avg_expense_ratio,
            'estimated_volatility': self._estimate_portfolio_volatility(securities, asset_allocation),
            'estimated_return': self._estimate_portfolio_return(securities, asset_allocation)
        }
    
    def _estimate_portfolio_volatility(self, securities: List[Dict[str, Any]], 
                                      asset_allocation: Dict[str, float]) -> float:
        """
        Estimate portfolio volatility based on asset allocation.
        
        Args:
            securities: List of securities
            asset_allocation: Asset allocation dictionary
        
        Returns:
            Estimated volatility as a percentage
        """
        # Simplified volatility estimation based on asset class weights
        volatility_by_class = {
            'equity': 15.0,
            'fixed_income': 5.0,
            'alternatives': 12.0,
            'cash': 0.5,
            'unknown': 10.0
        }
        
        estimated_volatility = 0
        for asset_class, percentage in asset_allocation.items():
            class_volatility = volatility_by_class.get(asset_class.lower(), volatility_by_class['unknown'])
            estimated_volatility += (percentage / 100) * class_volatility
        
        return round(estimated_volatility, 2)
    
    def _estimate_portfolio_return(self, securities: List[Dict[str, Any]], 
                                  asset_allocation: Dict[str, float]) -> float:
        """
        Estimate portfolio return based on asset allocation.
        
        Args:
            securities: List of securities
            asset_allocation: Asset allocation dictionary
        
        Returns:
            Estimated annual return as a percentage
        """
        # Simplified return estimation based on asset class weights
        return_by_class = {
            'equity': 9.0,
            'fixed_income': 4.0,
            'alternatives': 7.0,
            'cash': 1.0,
            'unknown': 6.0
        }
        
        estimated_return = 0
        for asset_class, percentage in asset_allocation.items():
            class_return = return_by_class.get(asset_class.lower(), return_by_class['unknown'])
            estimated_return += (percentage / 100) * class_return
        
        return round(estimated_return, 2)
    
    def _recommend_allocation(self, portfolio_metrics: Dict[str, Any], 
                             risk_profile: str) -> Dict[str, Any]:
        """
        Generate asset allocation recommendations based on risk profile.
        
        Args:
            portfolio_metrics: Portfolio metrics
            risk_profile: Client risk profile
        
        Returns:
            Dictionary with allocation recommendations
        """
        current_allocation = portfolio_metrics.get('asset_allocation', {})
        target_allocation = self.risk_profiles.get(risk_profile, {}).get('target_allocation', {})
        
        if not target_allocation:
            return {
                'status': 'error',
                'message': f"Invalid risk profile: {risk_profile}"
            }
        
        # Find allocation differences
        differences = {}
        for asset_class, target_pct in target_allocation.items():
            current_pct = current_allocation.get(asset_class, 0)
            diff = target_pct - current_pct
            differences[asset_class] = round(diff, 1)
        
        # Find asset classes to increase and decrease
        increases = {k: v for k, v in differences.items() if v > 0}
        decreases = {k: v for k, v in differences.items() if v < 0}
        
        # Format recommendations
        recommendations = []
        
        if increases:
            for asset_class, value in sorted(increases.items(), key=lambda x: abs(x[1]), reverse=True):
                recommendations.append(f"Increase {asset_class} allocation by approximately {abs(value)}%")
        
        if decreases:
            for asset_class, value in sorted(decreases.items(), key=lambda x: abs(x[1]), reverse=True):
                recommendations.append(f"Decrease {asset_class} allocation by approximately {abs(value)}%")
        
        # Calculate alignment score (0-100%)
        alignment_score = self._calculate_allocation_alignment(current_allocation, target_allocation)
        
        return {
            'status': 'success',
            'current_allocation': current_allocation,
            'target_allocation': target_allocation,
            'recommendations': recommendations,
            'alignment_score': alignment_score
        }
    
    def _calculate_allocation_alignment(self, current: Dict[str, float], 
                                       target: Dict[str, float]) -> float:
        """
        Calculate how well current allocation aligns with target.
        
        Args:
            current: Current allocation
            target: Target allocation
        
        Returns:
            Alignment score (0-100%)
        """
        # Combine all asset classes
        all_classes = set(list(current.keys()) + list(target.keys()))
        
        # Calculate sum of absolute differences
        total_diff = 0
        for asset_class in all_classes:
            current_val = current.get(asset_class, 0)
            target_val = target.get(asset_class, 0)
            total_diff += abs(current_val - target_val)
        
        # Convert to alignment score (100% - total difference percentage)
        # Cap at 0% floor
        alignment = max(0, 100 - total_diff)
        
        return round(alignment, 1)
    
    def _recommend_diversification(self, portfolio_metrics: Dict[str, Any], 
                                  risk_profile: str) -> Dict[str, Any]:
        """
        Generate diversification recommendations.
        
        Args:
            portfolio_metrics: Portfolio metrics
            risk_profile: Client risk profile
        
        Returns:
            Dictionary with diversification recommendations
        """
        num_securities = portfolio_metrics.get('num_securities', 0)
        num_asset_classes = portfolio_metrics.get('num_asset_classes', 0)
        
        # Determine diversification level
        if num_securities >= 15 and num_asset_classes >= 4:
            diversification_level = "high"
            score = 80
        elif num_securities >= 8 and num_asset_classes >= 3:
            diversification_level = "moderate"
            score = 60
        else:
            diversification_level = "low"
            score = 30
        
        # Generate recommendations based on diversification level
        recommendations = []
        
        if diversification_level == "low":
            recommendations.append("Increase the number of securities to at least 10-15 for better diversification")
            recommendations.append("Add exposure to more asset classes (aim for at least 4 different classes)")
        elif diversification_level == "moderate":
            recommendations.append("Consider adding international exposure if not already present")
            recommendations.append("Ensure sector diversification within equity holdings")
        else:
            recommendations.append("Review for potential overlap between funds to avoid over-diversification")
            recommendations.append("Consider simplifying portfolio if managing costs is a priority")
        
        return {
            'status': 'success',
            'diversification_level': diversification_level,
            'diversification_score': score,
            'recommendations': recommendations
        }
    
    def _recommend_expense_optimization(self, portfolio_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate expense optimization recommendations.
        
        Args:
            portfolio_metrics: Portfolio metrics
        
        Returns:
            Dictionary with expense optimization recommendations
        """
        avg_expense_ratio = portfolio_metrics.get('avg_expense_ratio')
        
        if avg_expense_ratio is None:
            return {
                'status': 'warning',
                'message': "Expense ratio data not available for analysis"
            }
        
        # Compare to industry benchmarks
        equity_avg = self.benchmarks['expense_ratios']['equity_funds']['average']
        bond_avg = self.benchmarks['expense_ratios']['bond_funds']['average']
        overall_avg = (equity_avg + bond_avg) / 2
        
        if avg_expense_ratio > overall_avg:
            expense_status = "high"
            potential_savings = round((avg_expense_ratio - overall_avg), 2)
            recommendations = [
                f"Reduce average expense ratio from {avg_expense_ratio}% to near {overall_avg}%",
                f"Consider lower-cost index funds or ETFs for core positions",
                f"Review high-expense funds for viable alternatives"
            ]
        elif avg_expense_ratio > overall_avg * 0.7:
            expense_status = "moderate"
            potential_savings = round((avg_expense_ratio - overall_avg * 0.7), 2)
            recommendations = [
                f"Current expense ratio is reasonable but could be optimized further",
                f"Consider replacing highest expense funds with lower-cost alternatives"
            ]
        else:
            expense_status = "low"
            potential_savings = 0
            recommendations = [
                "Expense ratio is already well-optimized",
                "Continue monitoring for any increases in fund expenses"
            ]
        
        return {
            'status': 'success',
            'expense_status': expense_status,
            'current_ratio': avg_expense_ratio,
            'industry_average': overall_avg,
            'potential_savings': potential_savings,
            'recommendations': recommendations
        }
    
    def _assess_risk_alignment(self, portfolio_metrics: Dict[str, Any], 
                              risk_profile: str) -> Dict[str, Any]:
        """
        Assess how well portfolio risk aligns with risk profile.
        
        Args:
            portfolio_metrics: Portfolio metrics
            risk_profile: Client risk profile
        
        Returns:
            Dictionary with risk alignment assessment
        """
        estimated_volatility = portfolio_metrics.get('estimated_volatility')
        estimated_return = portfolio_metrics.get('estimated_return')
        
        if estimated_volatility is None or estimated_return is None:
            return {
                'status': 'warning',
                'message': "Volatility or return data not available for analysis"
            }
        
        # Get target risk metrics from profile
        profile_data = self.risk_profiles.get(risk_profile, {})
        target_volatility = profile_data.get('max_volatility')
        target_return = profile_data.get('return_expectation')
        
        if not target_volatility or not target_return:
            return {
                'status': 'error',
                'message': f"Invalid risk profile: {risk_profile}"
            }
        
        # Assess volatility alignment
        volatility_diff = estimated_volatility - target_volatility
        if volatility_diff > 2:
            risk_status = "too high"
            vol_recommendations = ["Consider reducing portfolio risk by increasing allocation to fixed income and cash"]
        elif volatility_diff < -2:
            risk_status = "too low"
            vol_recommendations = ["Consider increasing growth potential by adding more equity exposure"]
        else:
            risk_status = "well aligned"
            vol_recommendations = ["Current risk level is well aligned with your risk tolerance"]
        
        # Assess return alignment
        return_diff = estimated_return - target_return
        if return_diff < -1:
            return_status = "below target"
            ret_recommendations = ["Consider strategies to enhance portfolio yield and growth potential"]
        elif return_diff > 1:
            return_status = "above target"
            ret_recommendations = ["Current return potential exceeds target, suggesting higher risk than necessary"]
        else:
            return_status = "on target"
            ret_recommendations = ["Expected return is well aligned with your financial goals"]
        
        # Calculate risk efficiency (return per unit of risk)
        risk_efficiency = round(estimated_return / estimated_volatility, 2) if estimated_volatility > 0 else 0
        
        # Combine recommendations
        recommendations = vol_recommendations + ret_recommendations
        
        return {
            'status': 'success',
            'risk_status': risk_status,
            'return_status': return_status,
            'current_volatility': estimated_volatility,
            'target_volatility': target_volatility,
            'current_return': estimated_return,
            'target_return': target_return,
            'risk_efficiency': risk_efficiency,
            'recommendations': recommendations
        }
    
    def _generate_recommendation_summary(self, portfolio_metrics: Dict[str, Any], 
                                        risk_profile: str) -> str:
        """
        Generate an executive summary of recommendations.
        
        Args:
            portfolio_metrics: Portfolio metrics
            risk_profile: Client risk profile
        
        Returns:
            Summary string
        """
        # Get key metrics
        allocation = portfolio_metrics.get('asset_allocation', {})
        volatility = portfolio_metrics.get('estimated_volatility')
        expected_return = portfolio_metrics.get('estimated_return')
        
        # Get profile targets
        profile_data = self.risk_profiles.get(risk_profile, {})
        target_allocation = profile_data.get('target_allocation', {})
        target_volatility = profile_data.get('max_volatility')
        target_return = profile_data.get('return_expectation')
        
        # Create summary
        summary = f"Based on your {risk_profile} risk profile, our analysis shows that your portfolio "
        
        # Assess allocation alignment
        alignment_score = self._calculate_allocation_alignment(allocation, target_allocation)
        if alignment_score > 80:
            summary += "has a well-aligned asset allocation structure. "
        elif alignment_score > 60:
            summary += "has a moderately aligned asset allocation that could benefit from some adjustments. "
        else:
            summary += "has significant asset allocation misalignments that should be addressed. "
        
        # Assess risk alignment
        if volatility and target_volatility:
            vol_diff = volatility - target_volatility
            if abs(vol_diff) < 2:
                summary += f"The portfolio's estimated risk level ({volatility}%) is well-aligned with your risk tolerance. "
            elif vol_diff > 0:
                summary += f"The portfolio's estimated risk level ({volatility}%) is higher than your risk tolerance. "
            else:
                summary += f"The portfolio's estimated risk level ({volatility}%) is lower than needed for your goals. "
        
        # Assess return potential
        if expected_return and target_return:
            ret_diff = expected_return - target_return
            if abs(ret_diff) < 1:
                summary += f"The expected return ({expected_return}%) is appropriate for your financial goals."
            elif ret_diff > 0:
                summary += f"The expected return ({expected_return}%) exceeds your target, possibly indicating excessive risk."
            else:
                summary += f"The expected return ({expected_return}%) is below your target, which may impact your financial goals."
        
        return summary
    
    def _generate_implementation_steps(self, allocation_rec: Dict[str, Any],
                                      diversification_rec: Dict[str, Any],
                                      expense_rec: Dict[str, Any],
                                      risk_rec: Dict[str, Any]) -> List[str]:
        """
        Generate concrete implementation steps based on recommendations.
        
        Args:
            allocation_rec: Allocation recommendations
            diversification_rec: Diversification recommendations
            expense_rec: Expense recommendations
            risk_rec: Risk recommendations
        
        Returns:
            List of implementation steps
        """
        implementation_steps = []
        
        # Get main recommendations
        allocation_changes = allocation_rec.get('recommendations', [])
        diversification_changes = diversification_rec.get('recommendations', [])
        expense_changes = expense_rec.get('recommendations', [])
        risk_changes = risk_rec.get('recommendations', [])
        
        # Add step numbers and organize by priority
        priority = 1
        
        # Add risk alignment steps first
        if risk_rec.get('risk_status') != 'well aligned':
            for rec in risk_changes:
                if 'Current risk level is well aligned' not in rec:
                    implementation_steps.append(f"{priority}. {rec}")
                    priority += 1
        
        # Add allocation changes
        for rec in allocation_changes:
            implementation_steps.append(f"{priority}. {rec}")
            priority += 1
        
        # Add diversification steps
        for rec in diversification_changes:
            if rec not in [s.replace(f"{i}. ", "") for i, s in enumerate(implementation_steps, 1)]:
                implementation_steps.append(f"{priority}. {rec}")
                priority += 1
        
        # Add expense optimization steps
        for rec in expense_changes:
            if 'already well-optimized' not in rec and rec not in [s.replace(f"{i}. ", "") for i, s in enumerate(implementation_steps, 1)]:
                implementation_steps.append(f"{priority}. {rec}")
                priority += 1
        
        # Add implementation timing
        implementation_steps.append(f"{priority}. Implement changes gradually to minimize market timing risks")
        
        # Add review recommendation
        implementation_steps.append(f"{priority + 1}. Schedule a portfolio review in 6 months to assess progress")
        
        return implementation_steps
    
    def _generate_portfolio_summary(self, portfolio_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a concise portfolio summary.
        
        Args:
            portfolio_metrics: Portfolio metrics
        
        Returns:
            Dictionary with portfolio summary
        """
        return {
            'total_value': portfolio_metrics.get('total_value', 0),
            'num_securities': portfolio_metrics.get('num_securities', 0),
            'asset_allocation': portfolio_metrics.get('asset_allocation', {}),
            'estimated_return': portfolio_metrics.get('estimated_return'),
            'estimated_volatility': portfolio_metrics.get('estimated_volatility'),
            'expense_ratio': portfolio_metrics.get('avg_expense_ratio')
        }
    
    def generate_report(self, portfolio_data: Dict[str, Any], 
                       client_profile: Dict[str, Any], 
                       analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a comprehensive financial advice report.
        
        Args:
            portfolio_data: Portfolio data
            client_profile: Client profile
            analysis_result: Analysis result from analyze_portfolio method
        
        Returns:
            Dictionary with formatted report
        """
        if analysis_result.get('status') != 'success':
            return {
                'status': 'error',
                'message': "Cannot generate report from unsuccessful analysis",
                'original_error': analysis_result.get('message', 'Unknown error')
            }
        
        recommendations = analysis_result.get('recommendations', {})
        
        # Extract client information
        client_name = client_profile.get('name', 'Client')
        risk_profile = client_profile.get('risk_profile', 'moderate')
        time_horizon = self.risk_profiles.get(risk_profile, {}).get('time_horizon', '5-10 years')
        
        # Format the report
        report = {
            'title': f"Investment Recommendations for {client_name}",
            'date': datetime.now().strftime('%Y-%m-%d'),
            'client_profile': {
                'name': client_name,
                'risk_profile': risk_profile,
                'time_horizon': time_horizon
            },
            'executive_summary': recommendations.get('summary', ''),
            'portfolio_analysis': analysis_result.get('portfolio_summary', {}),
            'key_recommendations': {
                'asset_allocation': recommendations.get('allocation', {}).get('recommendations', []),
                'diversification': recommendations.get('diversification', {}).get('recommendations', []),
                'expense_optimization': recommendations.get('expenses', {}).get('recommendations', []),
                'risk_management': recommendations.get('risk', {}).get('recommendations', [])
            },
            'implementation_plan': {
                'steps': recommendations.get('implementation_steps', []),
                'timeline': f"Recommended implementation over the next 1-3 months",
                'priority_actions': recommendations.get('implementation_steps', [])[:3] if len(recommendations.get('implementation_steps', [])) > 3 else recommendations.get('implementation_steps', [])
            },
            'disclaimer': (
                "This report is for informational purposes only and does not constitute financial advice. "
                "Please consult with a qualified financial advisor before making investment decisions."
            )
        }
        
        return {
            'status': 'success',
            'report': report
        }
    
    def print_info(self) -> Dict[str, Any]:
        """
        Print information about the FinancialAdvisorAgent.
        
        Returns:
            Dictionary with agent information
        """
        return {
            'name': self.name,
            'version': self.version,
            'description': 'Agent that provides financial advice based on portfolio analysis',
            'capabilities': [
                'Portfolio analysis',
                'Asset allocation recommendations',
                'Diversification assessment',
                'Expense optimization recommendations',
                'Risk alignment analysis',
                'Implementation planning',
                'Report generation'
            ]
        }

# Demo code
if __name__ == "__main__":
    # Create an instance of the agent
    advisor_agent = FinancialAdvisorAgent()
    
    # Print agent information
    print(json.dumps(advisor_agent.print_info(), indent=2))
    
    # Sample portfolio data
    sample_portfolio = {
        'securities': [
            {'name': 'US Large Cap Fund', 'asset_class': 'equity', 'value': 50000, 'expense_ratio': 0.8},
            {'name': 'US Bond Fund', 'asset_class': 'fixed_income', 'value': 25000, 'expense_ratio': 0.6},
            {'name': 'International Equity Fund', 'asset_class': 'equity', 'value': 15000, 'expense_ratio': 1.2},
            {'name': 'Cash', 'asset_class': 'cash', 'value': 10000, 'expense_ratio': 0.0}
        ]
    }
    
    # Sample client profile
    sample_profile = {
        'name': 'John Doe',
        'risk_profile': 'moderate',
        'age': 45,
        'financial_goals': ['retirement', 'college_funding']
    }
    
    # Analyze portfolio
    analysis_result = advisor_agent.analyze_portfolio(sample_portfolio, sample_profile)
    
    # Generate report
    report_result = advisor_agent.generate_report(sample_portfolio, sample_profile, analysis_result)
    
    # Print report
    if report_result['status'] == 'success':
        print(json.dumps(report_result['report'], indent=2))
    else:
        print(f"Error: {report_result['message']}")
