import pandas as pd
import numpy as np
from datetime import datetime
import json

class DataProcessor:
    """
    Utility class for processing and validating LCA input data
    """
    
    def __init__(self):
        self.supported_metals = ['aluminum', 'copper', 'steel', 'lithium']
        self.production_routes = ['primary', 'recycled', 'mixed']
        
        # Default values for missing parameters
        self.default_values = {
            'process_efficiency': 0.8,
            'transport_distance_km': 100,
            'recycled_content_ratio': 0.0,
            'energy_data': {
                'electricity_kwh': 500,
                'fossil_fuel_mj': 1000
            }
        }
    
    def process_input(self, raw_data):
        """
        Process and validate input data for LCA assessment
        
        Args:
            raw_data (dict): Raw input data from user
            
        Returns:
            dict: Processed and validated data
        """
        processed_data = {}
        
        # Validate and process metal type
        processed_data['metal_type'] = self._validate_metal_type(
            raw_data.get('metal_type', '').lower()
        )
        
        # Validate and process production route
        processed_data['production_route'] = self._validate_production_route(
            raw_data.get('production_route', '').lower()
        )
        
        # Process quantity
        processed_data['quantity'] = self._validate_quantity(
            raw_data.get('quantity', 1000)
        )
        
        # Process energy data
        processed_data['energy_data'] = self._process_energy_data(
            raw_data.get('energy_data', {})
        )
        
        # Process transport data
        processed_data['transport_distance_km'] = self._validate_numeric(
            raw_data.get('transport_distance_km'), 
            default=self.default_values['transport_distance_km'],
            min_val=0,
            max_val=10000
        )
        
        # Process recycled content ratio
        processed_data['recycled_content_ratio'] = self._validate_numeric(
            raw_data.get('recycled_content_ratio'),
            default=self.default_values['recycled_content_ratio'],
            min_val=0.0,
            max_val=1.0
        )
        
        # Process efficiency
        processed_data['process_efficiency'] = self._validate_numeric(
            raw_data.get('process_efficiency'),
            default=self.default_values['process_efficiency'],
            min_val=0.1,
            max_val=1.0
        )
        
        # Add metadata
        processed_data['processed_at'] = datetime.utcnow().isoformat()
        processed_data['data_completeness'] = self._calculate_data_completeness(raw_data)
        
        # Fill missing parameters with intelligent defaults
        processed_data = self._fill_missing_parameters(processed_data)
        
        return processed_data
    
    def _validate_metal_type(self, metal_type):
        """Validate metal type"""
        if metal_type in self.supported_metals:
            return metal_type
        else:
            # Default to aluminum if invalid
            return 'aluminum'
    
    def _validate_production_route(self, production_route):
        """Validate production route"""
        if production_route in self.production_routes:
            return production_route
        else:
            # Default to primary if invalid
            return 'primary'
    
    def _validate_quantity(self, quantity):
        """Validate quantity"""
        try:
            qty = float(quantity)
            if qty <= 0:
                return 1000  # Default quantity
            return qty
        except (ValueError, TypeError):
            return 1000  # Default quantity
    
    def _validate_numeric(self, value, default, min_val=None, max_val=None):
        """Validate numeric values with constraints"""
        try:
            num_val = float(value) if value is not None else default
            
            if min_val is not None and num_val < min_val:
                num_val = min_val
            if max_val is not None and num_val > max_val:
                num_val = max_val
                
            return num_val
        except (ValueError, TypeError):
            return default
    
    def _process_energy_data(self, energy_data):
        """Process energy consumption data"""
        processed_energy = {}
        
        # Electricity consumption
        processed_energy['electricity_kwh'] = self._validate_numeric(
            energy_data.get('electricity_kwh'),
            default=self.default_values['energy_data']['electricity_kwh'],
            min_val=0
        )
        
        # Fossil fuel consumption
        processed_energy['fossil_fuel_mj'] = self._validate_numeric(
            energy_data.get('fossil_fuel_mj'),
            default=self.default_values['energy_data']['fossil_fuel_mj'],
            min_val=0
        )
        
        # Natural gas (optional)
        processed_energy['natural_gas_mj'] = self._validate_numeric(
            energy_data.get('natural_gas_mj'),
            default=0,
            min_val=0
        )
        
        # Renewable energy (optional)
        processed_energy['renewable_kwh'] = self._validate_numeric(
            energy_data.get('renewable_kwh'),
            default=0,
            min_val=0
        )
        
        return processed_energy
    
    def _calculate_data_completeness(self, raw_data):
        """Calculate data completeness percentage"""
        required_fields = [
            'metal_type', 'production_route', 'quantity', 'energy_data'
        ]
        
        optional_fields = [
            'transport_distance_km', 'recycled_content_ratio', 'process_efficiency'
        ]
        
        total_fields = len(required_fields) + len(optional_fields)
        provided_fields = 0
        
        # Check required fields
        for field in required_fields:
            if field in raw_data and raw_data[field] is not None:
                provided_fields += 1
        
        # Check optional fields
        for field in optional_fields:
            if field in raw_data and raw_data[field] is not None:
                provided_fields += 1
        
        return round((provided_fields / total_fields) * 100, 2)
    
    def _fill_missing_parameters(self, processed_data):
        """Fill missing parameters with intelligent defaults based on metal type and route"""
        metal_type = processed_data['metal_type']
        production_route = processed_data['production_route']
        
        # Metal-specific defaults
        metal_defaults = {
            'aluminum': {
                'primary': {
                    'energy_multiplier': 1.5,
                    'typical_efficiency': 0.75,
                    'transport_factor': 1.2
                },
                'recycled': {
                    'energy_multiplier': 0.15,
                    'typical_efficiency': 0.95,
                    'transport_factor': 0.8
                }
            },
            'copper': {
                'primary': {
                    'energy_multiplier': 1.2,
                    'typical_efficiency': 0.80,
                    'transport_factor': 1.0
                },
                'recycled': {
                    'energy_multiplier': 0.20,
                    'typical_efficiency': 0.90,
                    'transport_factor': 0.7
                }
            },
            'steel': {
                'primary': {
                    'energy_multiplier': 1.0,
                    'typical_efficiency': 0.85,
                    'transport_factor': 0.9
                },
                'recycled': {
                    'energy_multiplier': 0.25,
                    'typical_efficiency': 0.85,
                    'transport_factor': 0.6
                }
            }
        }
        
        defaults = metal_defaults.get(metal_type, metal_defaults['aluminum'])
        route_defaults = defaults.get(production_route, defaults['primary'])
        
        # Adjust energy data if it seems too low/high
        energy_data = processed_data['energy_data']
        quantity = processed_data['quantity']
        
        # Estimate energy based on quantity and metal type
        estimated_electricity = quantity * route_defaults['energy_multiplier'] * 0.5
        estimated_fossil = quantity * route_defaults['energy_multiplier'] * 1.0
        
        # If provided energy is significantly different from estimates, use a blend
        if abs(energy_data['electricity_kwh'] - estimated_electricity) > estimated_electricity * 0.5:
            energy_data['electricity_kwh'] = (energy_data['electricity_kwh'] + estimated_electricity) / 2
        
        if abs(energy_data['fossil_fuel_mj'] - estimated_fossil) > estimated_fossil * 0.5:
            energy_data['fossil_fuel_mj'] = (energy_data['fossil_fuel_mj'] + estimated_fossil) / 2
        
        # Adjust process efficiency if not provided or seems unrealistic
        if processed_data['process_efficiency'] == self.default_values['process_efficiency']:
            processed_data['process_efficiency'] = route_defaults['typical_efficiency']
        
        # Adjust transport distance based on production route
        if processed_data['transport_distance_km'] == self.default_values['transport_distance_km']:
            processed_data['transport_distance_km'] *= route_defaults['transport_factor']
        
        return processed_data
    
    def validate_comparison_data(self, pathways_data):
        """Validate data for pathway comparison"""
        validated_pathways = []
        
        for i, pathway in enumerate(pathways_data):
            try:
                processed_pathway = self.process_input(pathway)
                processed_pathway['pathway_id'] = i
                processed_pathway['pathway_name'] = pathway.get('name', f'Pathway {i+1}')
                validated_pathways.append(processed_pathway)
            except Exception as e:
                # Skip invalid pathways but log the error
                print(f"Error processing pathway {i}: {e}")
                continue
        
        return validated_pathways
    
    def export_processed_data(self, processed_data, format_type='json'):
        """Export processed data in specified format"""
        if format_type.lower() == 'json':
            return json.dumps(processed_data, indent=2)
        elif format_type.lower() == 'csv':
            # Flatten the data for CSV export
            flattened_data = self._flatten_dict(processed_data)
            df = pd.DataFrame([flattened_data])
            return df.to_csv(index=False)
        else:
            raise ValueError(f"Unsupported export format: {format_type}")
    
    def _flatten_dict(self, d, parent_key='', sep='_'):
        """Flatten nested dictionary for CSV export"""
        items = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            else:
                items.append((new_key, v))
        return dict(items)
    
    def get_data_quality_report(self, processed_data):
        """Generate data quality report"""
        report = {
            'completeness_score': processed_data.get('data_completeness', 0),
            'quality_indicators': [],
            'recommendations': []
        }
        
        # Check data quality indicators
        if processed_data['data_completeness'] < 70:
            report['quality_indicators'].append('Low data completeness')
            report['recommendations'].append('Provide more detailed input data for better accuracy')
        
        # Check energy data consistency
        energy_ratio = (processed_data['energy_data']['electricity_kwh'] / 
                       processed_data['energy_data']['fossil_fuel_mj'])
        
        if energy_ratio > 2:
            report['quality_indicators'].append('High electricity to fossil fuel ratio')
            report['recommendations'].append('Verify energy consumption data for accuracy')
        
        # Check recycled content vs production route consistency
        if (processed_data['production_route'] == 'recycled' and 
            processed_data['recycled_content_ratio'] < 0.5):
            report['quality_indicators'].append('Low recycled content for recycled route')
            report['recommendations'].append('Increase recycled content ratio for recycled production route')
        
        return report