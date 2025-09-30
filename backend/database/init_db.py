"""
Database initialization script for the AI-Driven LCA Tool
Creates tables and populates with initial data
"""

import os
import sys
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import json

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, db, LCAAssessment, MetalProperties

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to PostgreSQL server (not specific database)
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'password')
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Create database if it doesn't exist
        db_name = os.getenv('DB_NAME', 'lca_tool')
        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{db_name}'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute(f'CREATE DATABASE "{db_name}"')
            print(f"Database '{db_name}' created successfully")
        else:
            print(f"Database '{db_name}' already exists")
            
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error creating database: {e}")
        return False
    
    return True

def init_tables():
    """Initialize database tables"""
    try:
        with app.app_context():
            # Drop all tables and recreate
            db.drop_all()
            db.create_all()
            print("Database tables created successfully")
            return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False

def populate_metal_properties():
    """Populate the database with metal properties data"""
    
    metal_data = [
        {
            'metal_type': 'aluminum',
            'density': 2.70,  # g/cm³
            'melting_point': 660.3,  # °C
            'primary_energy_intensity': 15.0,  # kWh/kg
            'recycled_energy_intensity': 0.75,  # kWh/kg
            'carbon_factor_primary': 11.5,  # kg CO2/kg
            'carbon_factor_recycled': 0.6,  # kg CO2/kg
            'water_usage_primary': 1500,  # L/kg
            'water_usage_recycled': 150,  # L/kg
            'recycling_rate': 0.75,
            'material_efficiency': 0.85,
            'typical_lifespan': 30,  # years
            'recyclability': 0.95,
            'properties': {
                'thermal_conductivity': 237,  # W/m·K
                'electrical_conductivity': 37.7,  # MS/m
                'corrosion_resistance': 'good',
                'strength_to_weight': 'high',
                'common_alloys': ['6061', '7075', '2024', '5052']
            }
        },
        {
            'metal_type': 'copper',
            'density': 8.96,
            'melting_point': 1084.6,
            'primary_energy_intensity': 18.5,
            'recycled_energy_intensity': 2.1,
            'carbon_factor_primary': 3.8,
            'carbon_factor_recycled': 0.4,
            'water_usage_primary': 2800,
            'water_usage_recycled': 280,
            'recycling_rate': 0.85,
            'material_efficiency': 0.90,
            'typical_lifespan': 50,
            'recyclability': 0.98,
            'properties': {
                'thermal_conductivity': 401,
                'electrical_conductivity': 59.6,
                'corrosion_resistance': 'excellent',
                'strength_to_weight': 'medium',
                'common_alloys': ['brass', 'bronze', 'beryllium_copper']
            }
        },
        {
            'metal_type': 'steel',
            'density': 7.85,
            'melting_point': 1370,
            'primary_energy_intensity': 20.0,
            'recycled_energy_intensity': 5.5,
            'carbon_factor_primary': 2.3,
            'carbon_factor_recycled': 0.5,
            'water_usage_primary': 2000,
            'water_usage_recycled': 400,
            'recycling_rate': 0.88,
            'material_efficiency': 0.92,
            'typical_lifespan': 75,
            'recyclability': 0.99,
            'properties': {
                'thermal_conductivity': 50,
                'electrical_conductivity': 10,
                'corrosion_resistance': 'variable',
                'strength_to_weight': 'very_high',
                'common_alloys': ['carbon_steel', 'stainless_steel', 'alloy_steel']
            }
        },
        {
            'metal_type': 'lithium',
            'density': 0.534,
            'melting_point': 180.5,
            'primary_energy_intensity': 85.0,
            'recycled_energy_intensity': 12.0,
            'carbon_factor_primary': 15.2,
            'carbon_factor_recycled': 2.1,
            'water_usage_primary': 2200000,  # L/kg (very high for lithium extraction)
            'water_usage_recycled': 50000,
            'recycling_rate': 0.05,  # Currently very low
            'material_efficiency': 0.65,
            'typical_lifespan': 10,
            'recyclability': 0.80,
            'properties': {
                'thermal_conductivity': 84.8,
                'electrical_conductivity': 10.8,
                'corrosion_resistance': 'poor',
                'strength_to_weight': 'low',
                'common_compounds': ['LiCoO2', 'LiFePO4', 'Li2CO3']
            }
        },
        {
            'metal_type': 'zinc',
            'density': 7.14,
            'melting_point': 419.5,
            'primary_energy_intensity': 12.5,
            'recycled_energy_intensity': 2.8,
            'carbon_factor_primary': 3.2,
            'carbon_factor_recycled': 0.7,
            'water_usage_primary': 1800,
            'water_usage_recycled': 360,
            'recycling_rate': 0.70,
            'material_efficiency': 0.88,
            'typical_lifespan': 40,
            'recyclability': 0.95,
            'properties': {
                'thermal_conductivity': 116,
                'electrical_conductivity': 16.6,
                'corrosion_resistance': 'good',
                'strength_to_weight': 'medium',
                'common_alloys': ['brass', 'zinc_die_cast']
            }
        },
        {
            'metal_type': 'nickel',
            'density': 8.91,
            'melting_point': 1455,
            'primary_energy_intensity': 45.0,
            'recycled_energy_intensity': 8.5,
            'carbon_factor_primary': 12.8,
            'carbon_factor_recycled': 2.4,
            'water_usage_primary': 3500,
            'water_usage_recycled': 700,
            'recycling_rate': 0.68,
            'material_efficiency': 0.82,
            'typical_lifespan': 60,
            'recyclability': 0.92,
            'properties': {
                'thermal_conductivity': 90.9,
                'electrical_conductivity': 14.3,
                'corrosion_resistance': 'excellent',
                'strength_to_weight': 'high',
                'common_alloys': ['inconel', 'monel', 'hastelloy']
            }
        }
    ]
    
    try:
        with app.app_context():
            for metal in metal_data:
                # Check if metal already exists
                existing = MetalProperties.query.filter_by(metal_type=metal['metal_type']).first()
                if not existing:
                    metal_props = MetalProperties(
                        metal_type=metal['metal_type'],
                        density=metal['density'],
                        melting_point=metal['melting_point'],
                        primary_energy_intensity=metal['primary_energy_intensity'],
                        recycled_energy_intensity=metal['recycled_energy_intensity'],
                        carbon_factor_primary=metal['carbon_factor_primary'],
                        carbon_factor_recycled=metal['carbon_factor_recycled'],
                        water_usage_primary=metal['water_usage_primary'],
                        water_usage_recycled=metal['water_usage_recycled'],
                        recycling_rate=metal['recycling_rate'],
                        material_efficiency=metal['material_efficiency'],
                        typical_lifespan=metal['typical_lifespan'],
                        recyclability=metal['recyclability'],
                        properties=json.dumps(metal['properties'])
                    )
                    db.session.add(metal_props)
                    print(f"Added metal properties for {metal['metal_type']}")
                else:
                    print(f"Metal properties for {metal['metal_type']} already exist")
            
            db.session.commit()
            print("Metal properties data populated successfully")
            return True
            
    except Exception as e:
        print(f"Error populating metal properties: {e}")
        db.session.rollback()
        return False

def create_sample_assessments():
    """Create sample LCA assessments for demonstration"""
    
    sample_assessments = [
        {
            'metal_type': 'aluminum',
            'quantity': 1000,
            'production_route': 'primary',
            'recycled_content': 0.0,
            'energy_consumption': 15000,
            'transport_distance': 500,
            'electricity_source': 'grid_mix',
            'fuel_type': 'natural_gas',
            'water_usage': 1500000,
            'waste_generation': 50,
            'end_of_life_scenario': 'recycling',
            'carbon_footprint': 11500,
            'energy_intensity': 15.0,
            'water_footprint': 1500000,
            'recycling_potential': 0.95,
            'material_efficiency': 0.85,
            'circularity_index': 0.25,
            'sustainability_score': 3.2,
            'environmental_impact': json.dumps({
                'climate_change': 11500,
                'ozone_depletion': 0.002,
                'acidification': 45.2,
                'eutrophication': 12.8,
                'resource_depletion': 0.85
            })
        },
        {
            'metal_type': 'aluminum',
            'quantity': 1000,
            'production_route': 'recycled',
            'recycled_content': 0.95,
            'energy_consumption': 750,
            'transport_distance': 200,
            'electricity_source': 'renewable',
            'fuel_type': 'electricity',
            'water_usage': 150000,
            'waste_generation': 15,
            'end_of_life_scenario': 'recycling',
            'carbon_footprint': 600,
            'energy_intensity': 0.75,
            'water_footprint': 150000,
            'recycling_potential': 0.95,
            'material_efficiency': 0.92,
            'circularity_index': 0.88,
            'sustainability_score': 8.7,
            'environmental_impact': json.dumps({
                'climate_change': 600,
                'ozone_depletion': 0.0001,
                'acidification': 2.1,
                'eutrophication': 0.8,
                'resource_depletion': 0.15
            })
        },
        {
            'metal_type': 'copper',
            'quantity': 500,
            'production_route': 'primary',
            'recycled_content': 0.0,
            'energy_consumption': 9250,
            'transport_distance': 800,
            'electricity_source': 'grid_mix',
            'fuel_type': 'diesel',
            'water_usage': 1400000,
            'waste_generation': 75,
            'end_of_life_scenario': 'recycling',
            'carbon_footprint': 1900,
            'energy_intensity': 18.5,
            'water_footprint': 1400000,
            'recycling_potential': 0.98,
            'material_efficiency': 0.90,
            'circularity_index': 0.35,
            'sustainability_score': 4.1,
            'environmental_impact': json.dumps({
                'climate_change': 1900,
                'ozone_depletion': 0.001,
                'acidification': 18.5,
                'eutrophication': 5.2,
                'resource_depletion': 0.78
            })
        }
    ]
    
    try:
        with app.app_context():
            for assessment_data in sample_assessments:
                assessment = LCAAssessment(**assessment_data)
                db.session.add(assessment)
                print(f"Added sample assessment for {assessment_data['metal_type']} ({assessment_data['production_route']})")
            
            db.session.commit()
            print("Sample assessments created successfully")
            return True
            
    except Exception as e:
        print(f"Error creating sample assessments: {e}")
        db.session.rollback()
        return False

def main():
    """Main initialization function"""
    print("Starting database initialization...")
    
    # Create database
    if not create_database():
        print("Failed to create database. Exiting.")
        return False
    
    # Initialize tables
    if not init_tables():
        print("Failed to create tables. Exiting.")
        return False
    
    # Populate metal properties
    if not populate_metal_properties():
        print("Failed to populate metal properties. Exiting.")
        return False
    
    # Create sample assessments
    if not create_sample_assessments():
        print("Failed to create sample assessments. Exiting.")
        return False
    
    print("\nDatabase initialization completed successfully!")
    print("The LCA Tool database is ready for use.")
    
    return True

if __name__ == "__main__":
    main()