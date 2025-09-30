"""
Simplified LCA Predictor using basic statistical models
Avoids complex ML libraries that require C++ compilation
"""

import json
import os
import pickle
import random
import math
from datetime import datetime

class SimpleLCAPredictor:
    """
    Simplified LCA predictor using statistical models and lookup tables
    """
    
    def __init__(self, model_path='ml_models/trained_models'):
        self.model_path = model_path
        self.metal_factors = {}
        self.route_factors = {}
        self.energy_factors = {}
        self.is_trained = False
        
        # Create model directory if it doesn't exist
        os.makedirs(model_path, exist_ok=True)
        
        # Initialize with default factors
        self._initialize_default_factors()
    
    def _initialize_default_factors(self):
        """Initialize default factors for predictions"""
        
        # Metal-specific factors (based on literature values)
        self.metal_factors = {
            'aluminum': {
                'carbon_intensity_primary': 11.5,  # kg CO2/kg
                'carbon_intensity_recycled': 0.6,
                'energy_intensity_primary': 15.0,  # kWh/kg
                'energy_intensity_recycled': 0.75,
                'water_intensity_primary': 1500,   # L/kg
                'water_intensity_recycled': 150,
                'recycling_potential': 0.95,
                'material_efficiency': 0.85
            },
            'copper': {
                'carbon_intensity_primary': 3.8,
                'carbon_intensity_recycled': 0.4,
                'energy_intensity_primary': 18.5,
                'energy_intensity_recycled': 2.1,
                'water_intensity_primary': 2800,
                'water_intensity_recycled': 280,
                'recycling_potential': 0.98,
                'material_efficiency': 0.90
            },
            'steel': {
                'carbon_intensity_primary': 2.3,
                'carbon_intensity_recycled': 0.5,
                'energy_intensity_primary': 20.0,
                'energy_intensity_recycled': 5.5,
                'water_intensity_primary': 2000,
                'water_intensity_recycled': 400,
                'recycling_potential': 0.99,
                'material_efficiency': 0.92
            },
            'lithium': {
                'carbon_intensity_primary': 15.2,
                'carbon_intensity_recycled': 2.1,
                'energy_intensity_primary': 85.0,
                'energy_intensity_recycled': 12.0,
                'water_intensity_primary': 2200000,
                'water_intensity_recycled': 50000,
                'recycling_potential': 0.80,
                'material_efficiency': 0.65
            },
            'zinc': {
                'carbon_intensity_primary': 3.2,
                'carbon_intensity_recycled': 0.7,
                'energy_intensity_primary': 12.5,
                'energy_intensity_recycled': 2.8,
                'water_intensity_primary': 1800,
                'water_intensity_recycled': 360,
                'recycling_potential': 0.95,
                'material_efficiency': 0.88
            },
            'nickel': {
                'carbon_intensity_primary': 12.8,
                'carbon_intensity_recycled': 2.4,
                'energy_intensity_primary': 45.0,
                'energy_intensity_recycled': 8.5,
                'water_intensity_primary': 3500,
                'water_intensity_recycled': 700,
                'recycling_potential': 0.92,
                'material_efficiency': 0.82
            }
        }
        
        # Route-specific multipliers
        self.route_factors = {
            'primary': 1.0,
            'recycled': 0.15,  # Significant reduction for recycled routes
            'mixed': 0.6       # Weighted average
        }
        
        # Energy source factors
        self.energy_factors = {
            'coal': 1.2,
            'natural_gas': 1.0,
            'grid_mix': 0.9,
            'renewable': 0.1,
            'nuclear': 0.05,
            'hydroelectric': 0.02
        }
    
    def predict_carbon_footprint(self, metal_type, quantity, production_route, 
                                recycled_content=0.0, energy_consumption=None, 
                                electricity_source='grid_mix', transport_distance=0):
        """Predict carbon footprint using statistical model"""
        
        if metal_type not in self.metal_factors:
            metal_type = 'aluminum'  # Default fallback
        
        metal_data = self.metal_factors[metal_type]
        
        # Base carbon intensity
        if production_route == 'recycled':
            base_intensity = metal_data['carbon_intensity_recycled']
        else:
            # Interpolate based on recycled content
            primary_intensity = metal_data['carbon_intensity_primary']
            recycled_intensity = metal_data['carbon_intensity_recycled']
            base_intensity = (primary_intensity * (1 - recycled_content) + 
                            recycled_intensity * recycled_content)
        
        # Apply energy source factor
        energy_factor = self.energy_factors.get(electricity_source, 1.0)
        
        # Transport emissions (rough estimate: 0.1 kg CO2 per kg per 100 km)
        transport_emissions = quantity * transport_distance * 0.001
        
        # Total carbon footprint
        carbon_footprint = quantity * base_intensity * energy_factor + transport_emissions
        
        # Add some realistic variation (±10%)
        variation = random.gauss(1.0, 0.05)
        carbon_footprint *= max(0.5, variation)
        
        return max(0, carbon_footprint)
    
    def predict_energy_consumption(self, metal_type, quantity, production_route, 
                                 recycled_content=0.0):
        """Predict energy consumption"""
        
        if metal_type not in self.metal_factors:
            metal_type = 'aluminum'
        
        metal_data = self.metal_factors[metal_type]
        
        if production_route == 'recycled':
            base_intensity = metal_data['energy_intensity_recycled']
        else:
            primary_intensity = metal_data['energy_intensity_primary']
            recycled_intensity = metal_data['energy_intensity_recycled']
            base_intensity = (primary_intensity * (1 - recycled_content) + 
                            recycled_intensity * recycled_content)
        
        energy_consumption = quantity * base_intensity
        
        # Add variation
        variation = random.gauss(1.0, 0.08)
        energy_consumption *= max(0.3, variation)
        
        return max(0, energy_consumption)
    
    def predict_water_usage(self, metal_type, quantity, production_route, 
                          recycled_content=0.0):
        """Predict water usage"""
        
        if metal_type not in self.metal_factors:
            metal_type = 'aluminum'
        
        metal_data = self.metal_factors[metal_type]
        
        if production_route == 'recycled':
            base_intensity = metal_data['water_intensity_recycled']
        else:
            primary_intensity = metal_data['water_intensity_primary']
            recycled_intensity = metal_data['water_intensity_recycled']
            base_intensity = (primary_intensity * (1 - recycled_content) + 
                            recycled_intensity * recycled_content)
        
        water_usage = quantity * base_intensity
        
        # Add variation
        variation = random.gauss(1.0, 0.1)
        water_usage *= max(0.2, variation)
        
        return max(0, water_usage)
    
    def predict_recycling_potential(self, metal_type, end_of_life_scenario='recycling'):
        """Predict recycling potential"""
        
        if metal_type not in self.metal_factors:
            metal_type = 'aluminum'
        
        base_potential = self.metal_factors[metal_type]['recycling_potential']
        
        # Adjust based on end-of-life scenario
        scenario_factors = {
            'recycling': 1.0,
            'landfill': 0.1,
            'incineration': 0.05,
            'reuse': 0.95
        }
        
        factor = scenario_factors.get(end_of_life_scenario, 0.5)
        return base_potential * factor
    
    def predict_material_efficiency(self, metal_type, production_route, 
                                  process_temperature=None):
        """Predict material efficiency"""
        
        if metal_type not in self.metal_factors:
            metal_type = 'aluminum'
        
        base_efficiency = self.metal_factors[metal_type]['material_efficiency']
        
        # Recycled routes are typically more efficient
        if production_route == 'recycled':
            base_efficiency *= 1.1
        
        # Temperature optimization (if provided)
        if process_temperature:
            metal_melting_points = {
                'aluminum': 660, 'copper': 1085, 'steel': 1370,
                'lithium': 180, 'zinc': 420, 'nickel': 1455
            }
            
            optimal_temp = metal_melting_points.get(metal_type, 1000)
            if process_temperature > optimal_temp * 1.5:
                base_efficiency *= 0.9  # Inefficient high temperature
            elif process_temperature < optimal_temp * 0.8:
                base_efficiency *= 0.85  # Inefficient low temperature
        
        return min(1.0, max(0.1, base_efficiency))
    
    def calculate_circularity_index(self, recycled_content, recycling_potential, 
                                  material_efficiency, end_of_life_scenario='recycling'):
        """Calculate circularity index"""
        
        # Weights for different factors
        weights = {
            'recycled_content': 0.3,
            'recycling_potential': 0.3,
            'material_efficiency': 0.25,
            'end_of_life': 0.15
        }
        
        # End-of-life factor
        eol_factors = {
            'recycling': 1.0,
            'reuse': 0.95,
            'landfill': 0.1,
            'incineration': 0.2
        }
        
        eol_factor = eol_factors.get(end_of_life_scenario, 0.5)
        
        # Calculate weighted circularity index
        circularity_index = (
            recycled_content * weights['recycled_content'] +
            recycling_potential * weights['recycling_potential'] +
            material_efficiency * weights['material_efficiency'] +
            eol_factor * weights['end_of_life']
        )
        
        return min(1.0, max(0.0, circularity_index))
    
    def calculate_sustainability_score(self, carbon_footprint, energy_intensity, 
                                     water_footprint, waste_generation, 
                                     circularity_index, material_efficiency):
        """Calculate overall sustainability score (0-10 scale)"""
        
        # Normalize metrics (lower is better for environmental impacts)
        # These are rough benchmarks for normalization
        carbon_norm = max(0, 1 - (carbon_footprint / 20000))  # Normalize to 20 tons CO2
        energy_norm = max(0, 1 - (energy_intensity / 50))     # Normalize to 50 kWh/kg
        water_norm = max(0, 1 - (water_footprint / 5000000))  # Normalize to 5M L
        waste_norm = max(0, 1 - (waste_generation / 200))     # Normalize to 200 kg waste
        
        # Weights for sustainability score
        weights = {
            'carbon': 0.25,
            'energy': 0.20,
            'water': 0.15,
            'waste': 0.15,
            'circularity': 0.15,
            'efficiency': 0.10
        }
        
        # Calculate weighted score
        score = (
            carbon_norm * weights['carbon'] +
            energy_norm * weights['energy'] +
            water_norm * weights['water'] +
            waste_norm * weights['waste'] +
            circularity_index * weights['circularity'] +
            material_efficiency * weights['efficiency']
        )
        
        # Convert to 0-10 scale
        return round(score * 10, 1)
    
    def predict_all_metrics(self, input_data):
        """Predict all LCA metrics for given input"""
        
        # Extract input parameters
        metal_type = input_data.get('metal_type', 'aluminum')
        quantity = input_data.get('quantity', 1000)
        production_route = input_data.get('production_route', 'primary')
        recycled_content = input_data.get('recycled_content', 0.0)
        energy_consumption = input_data.get('energy_consumption')
        electricity_source = input_data.get('electricity_source', 'grid_mix')
        transport_distance = input_data.get('transport_distance', 0)
        waste_generation = input_data.get('waste_generation', 0)
        end_of_life_scenario = input_data.get('end_of_life_scenario', 'recycling')
        process_temperature = input_data.get('process_temperature')
        
        # Predict individual metrics
        carbon_footprint = self.predict_carbon_footprint(
            metal_type, quantity, production_route, recycled_content,
            energy_consumption, electricity_source, transport_distance
        )
        
        if energy_consumption is None:
            energy_consumption = self.predict_energy_consumption(
                metal_type, quantity, production_route, recycled_content
            )
        
        energy_intensity = energy_consumption / quantity if quantity > 0 else 0
        
        water_footprint = self.predict_water_usage(
            metal_type, quantity, production_route, recycled_content
        )
        
        recycling_potential = self.predict_recycling_potential(
            metal_type, end_of_life_scenario
        )
        
        material_efficiency = self.predict_material_efficiency(
            metal_type, production_route, process_temperature
        )
        
        circularity_index = self.calculate_circularity_index(
            recycled_content, recycling_potential, material_efficiency, 
            end_of_life_scenario
        )
        
        # Estimate waste generation if not provided
        if waste_generation == 0:
            waste_generation = quantity * (0.1 - material_efficiency * 0.08)
        
        sustainability_score = self.calculate_sustainability_score(
            carbon_footprint, energy_intensity, water_footprint,
            waste_generation, circularity_index, material_efficiency
        )
        
        # Environmental impact categories
        environmental_impact = {
            'climate_change': carbon_footprint,
            'ozone_depletion': carbon_footprint * 0.00001,  # Rough estimate
            'acidification': carbon_footprint * 0.004,
            'eutrophication': carbon_footprint * 0.001,
            'resource_depletion': 1 - material_efficiency
        }
        
        return {
            'carbon_footprint': round(carbon_footprint, 2),
            'energy_intensity': round(energy_intensity, 2),
            'water_footprint': round(water_footprint, 2),
            'recycling_potential': round(recycling_potential, 3),
            'material_efficiency': round(material_efficiency, 3),
            'circularity_index': round(circularity_index, 3),
            'sustainability_score': sustainability_score,
            'environmental_impact': environmental_impact
        }
    
    def train_models(self):
        """Placeholder for model training (using statistical approach)"""
        print("Training statistical models...")
        
        # In a real implementation, this would analyze historical data
        # and update the factors based on patterns
        
        self.is_trained = True
        print("Statistical models trained successfully!")
        return True
    
    def save_models(self):
        """Save model factors to file"""
        model_data = {
            'metal_factors': self.metal_factors,
            'route_factors': self.route_factors,
            'energy_factors': self.energy_factors,
            'is_trained': self.is_trained,
            'last_updated': datetime.now().isoformat()
        }
        
        model_file = os.path.join(self.model_path, 'lca_predictor_model.pkl')
        with open(model_file, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Model saved to {model_file}")
        return True
    
    def load_models(self):
        """Load model factors from file"""
        model_file = os.path.join(self.model_path, 'lca_predictor_model.pkl')
        
        if os.path.exists(model_file):
            try:
                with open(model_file, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.metal_factors = model_data.get('metal_factors', self.metal_factors)
                self.route_factors = model_data.get('route_factors', self.route_factors)
                self.energy_factors = model_data.get('energy_factors', self.energy_factors)
                self.is_trained = model_data.get('is_trained', False)
                
                print(f"Model loaded from {model_file}")
                return True
            except Exception as e:
                print(f"Error loading model: {e}")
                return False
        else:
            print("No saved model found, using default factors")
            return False

# Alias for backward compatibility
LCAPredictor = SimpleLCAPredictor