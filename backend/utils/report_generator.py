import os
import json
import csv
from datetime import datetime

class ReportGenerator:
    """
    Simplified utility class for generating LCA assessment reports
    """
    
    def __init__(self):
        self.reports_dir = 'reports'
        
        # Ensure directory exists
        os.makedirs(self.reports_dir, exist_ok=True)
    
    def generate_report(self, assessment_data, results, format_type='json', assessment_id=None):
        """
        Generate a report in the specified format
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if assessment_id:
            filename = f"lca_report_{assessment_id}_{timestamp}"
        else:
            filename = f"lca_report_{timestamp}"
        
        if format_type.lower() == 'csv':
            return self._generate_csv_report(assessment_data, results, filename)
        elif format_type.lower() == 'json':
            return self._generate_json_report(assessment_data, results, filename)
        else:
            # Default to JSON for unsupported formats
            return self._generate_json_report(assessment_data, results, filename)
    
    def _generate_json_report(self, assessment_data, results, filename):
        """Generate a JSON report"""
        filepath = os.path.join(self.reports_dir, f"{filename}.json")
        
        report_data = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'report_type': 'LCA Assessment Report',
                'version': '1.0'
            },
            'assessment': assessment_data,
            'results': results,
            'summary': self._generate_summary(assessment_data, results)
        }
        
        with open(filepath, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        return {
            'success': True,
            'filename': f"{filename}.json",
            'filepath': filepath,
            'format': 'json'
        }
    
    def _generate_csv_report(self, assessment_data, results, filename):
        """Generate a CSV report"""
        filepath = os.path.join(self.reports_dir, f"{filename}.csv")
        
        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            
            # Header
            writer.writerow(['LCA Assessment Report'])
            writer.writerow(['Generated:', datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
            writer.writerow([])
            
            # Assessment Details
            writer.writerow(['Assessment Details'])
            writer.writerow(['Metal Type:', assessment_data.get('metal_type', 'N/A')])
            writer.writerow(['Production Route:', assessment_data.get('production_route', 'N/A')])
            writer.writerow(['Energy Source:', assessment_data.get('energy_source', 'N/A')])
            writer.writerow(['Quantity (kg):', assessment_data.get('quantity', 'N/A')])
            writer.writerow([])
            
            # Results
            writer.writerow(['Results'])
            writer.writerow(['Metric', 'Value', 'Unit'])
            writer.writerow(['Carbon Footprint', results.get('carbon_footprint', 0), 'kg CO2-eq'])
            writer.writerow(['Energy Consumption', results.get('energy_consumption', 0), 'MJ'])
            writer.writerow(['Water Usage', results.get('water_usage', 0), 'L'])
            writer.writerow(['Sustainability Score', results.get('sustainability_score', 0), 'Score (0-100)'])
            writer.writerow(['Circularity Index', results.get('circularity_index', 0), 'Index (0-1)'])
            writer.writerow(['Material Efficiency', results.get('material_efficiency', 0), '%'])
            writer.writerow(['Recycling Potential', results.get('recycling_potential', 0), '%'])
        
        return {
            'success': True,
            'filename': f"{filename}.csv",
            'filepath': filepath,
            'format': 'csv'
        }
    
    def _generate_summary(self, assessment_data, results):
        """Generate a summary of the assessment"""
        return {
            'metal_type': assessment_data.get('metal_type', 'Unknown'),
            'total_carbon_footprint': results.get('carbon_footprint', 0),
            'sustainability_rating': self._get_sustainability_rating(results.get('sustainability_score', 0)),
            'circularity_rating': self._get_circularity_rating(results.get('circularity_index', 0)),
            'key_recommendations': self._generate_recommendations(assessment_data, results)
        }
    
    def _get_sustainability_rating(self, score):
        """Convert sustainability score to rating"""
        if score >= 80:
            return 'Excellent'
        elif score >= 60:
            return 'Good'
        elif score >= 40:
            return 'Fair'
        else:
            return 'Poor'
    
    def _get_circularity_rating(self, index):
        """Convert circularity index to rating"""
        if index >= 0.8:
            return 'Highly Circular'
        elif index >= 0.6:
            return 'Moderately Circular'
        elif index >= 0.4:
            return 'Somewhat Circular'
        else:
            return 'Linear'
    
    def _generate_recommendations(self, assessment_data, results):
        """Generate basic recommendations based on results"""
        recommendations = []
        
        # Carbon footprint recommendations
        carbon_footprint = results.get('carbon_footprint', 0)
        if carbon_footprint > 1000:
            recommendations.append("Consider switching to renewable energy sources to reduce carbon footprint")
        
        # Energy efficiency recommendations
        energy_consumption = results.get('energy_consumption', 0)
        if energy_consumption > 5000:
            recommendations.append("Implement energy efficiency measures in production processes")
        
        # Circularity recommendations
        circularity_index = results.get('circularity_index', 0)
        if circularity_index < 0.5:
            recommendations.append("Increase recycling and circular economy practices")
        
        # Material efficiency recommendations
        material_efficiency = results.get('material_efficiency', 0)
        if material_efficiency < 70:
            recommendations.append("Optimize material usage to reduce waste")
        
        return recommendations[:3]  # Return top 3 recommendations
    
    def generate_comparison_report(self, comparison_data, format_type='json'):
        """Generate a comparison report"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"lca_comparison_{timestamp}"
        
        if format_type.lower() == 'csv':
            return self._generate_comparison_csv(comparison_data, filename)
        else:
            return self._generate_comparison_json(comparison_data, filename)
    
    def _generate_comparison_json(self, comparison_data, filename):
        """Generate a JSON comparison report"""
        filepath = os.path.join(self.reports_dir, f"{filename}.json")
        
        report_data = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'report_type': 'LCA Comparison Report',
                'version': '1.0'
            },
            'comparison': comparison_data,
            'analysis': self._generate_comparison_analysis(comparison_data)
        }
        
        with open(filepath, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        return {
            'success': True,
            'filename': f"{filename}.json",
            'filepath': filepath,
            'format': 'json'
        }
    
    def _generate_comparison_csv(self, comparison_data, filename):
        """Generate a CSV comparison report"""
        filepath = os.path.join(self.reports_dir, f"{filename}.csv")
        
        with open(filepath, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            
            # Header
            writer.writerow(['LCA Comparison Report'])
            writer.writerow(['Generated:', datetime.now().strftime("%Y-%m-%d %H:%M:%S")])
            writer.writerow([])
            
            # Comparison table
            if comparison_data and len(comparison_data) > 0:
                # Get all metrics from first assessment
                first_assessment = comparison_data[0]
                metrics = ['carbon_footprint', 'energy_consumption', 'water_usage', 
                          'sustainability_score', 'circularity_index', 'material_efficiency']
                
                # Header row
                header = ['Assessment'] + [metric.replace('_', ' ').title() for metric in metrics]
                writer.writerow(header)
                
                # Data rows
                for i, assessment in enumerate(comparison_data):
                    row = [f"Assessment {i+1}"]
                    for metric in metrics:
                        row.append(assessment.get('results', {}).get(metric, 0))
                    writer.writerow(row)
        
        return {
            'success': True,
            'filename': f"{filename}.csv",
            'filepath': filepath,
            'format': 'csv'
        }
    
    def _generate_comparison_analysis(self, comparison_data):
        """Generate basic comparison analysis"""
        if not comparison_data or len(comparison_data) < 2:
            return {"message": "Insufficient data for comparison"}
        
        # Find best and worst performing assessments
        best_carbon = min(comparison_data, key=lambda x: x.get('results', {}).get('carbon_footprint', float('inf')))
        best_sustainability = max(comparison_data, key=lambda x: x.get('results', {}).get('sustainability_score', 0))
        
        return {
            'best_carbon_performance': {
                'assessment_id': best_carbon.get('assessment_id', 'Unknown'),
                'carbon_footprint': best_carbon.get('results', {}).get('carbon_footprint', 0)
            },
            'best_sustainability': {
                'assessment_id': best_sustainability.get('assessment_id', 'Unknown'),
                'sustainability_score': best_sustainability.get('results', {}).get('sustainability_score', 0)
            }
        }