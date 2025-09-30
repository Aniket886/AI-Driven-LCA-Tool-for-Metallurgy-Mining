"""
Test script for the AI-Driven LCA Tool API
Run this script to test basic functionality
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['message']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_metal_properties():
    """Test metal properties endpoint"""
    print("\nTesting metal properties...")
    try:
        response = requests.get(f"{API_BASE}/metals/aluminum/properties")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Metal properties retrieved for aluminum")
            print(f"   Density: {data.get('density')} g/cm³")
            print(f"   Primary energy: {data.get('primary_energy_intensity')} kWh/kg")
            return True
        else:
            print(f"❌ Metal properties failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Metal properties error: {e}")
        return False

def test_lca_assessment():
    """Test LCA assessment creation"""
    print("\nTesting LCA assessment...")
    
    assessment_data = {
        "metal_type": "aluminum",
        "quantity": 1000,
        "production_route": "primary",
        "recycled_content": 0.0,
        "energy_consumption": 15000,
        "transport_distance": 500,
        "electricity_source": "grid_mix",
        "fuel_type": "natural_gas",
        "water_usage": 1500000,
        "waste_generation": 50,
        "end_of_life_scenario": "recycling"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/assessment",
            json=assessment_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ LCA assessment created successfully")
            print(f"   Assessment ID: {data.get('id')}")
            print(f"   Carbon footprint: {data.get('carbon_footprint')} kg CO2")
            print(f"   Sustainability score: {data.get('sustainability_score')}/10")
            print(f"   Circularity index: {data.get('circularity_index')}")
            return data.get('id')
        else:
            print(f"❌ LCA assessment failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ LCA assessment error: {e}")
        return None

def test_comparison(assessment_ids):
    """Test pathway comparison"""
    print("\nTesting pathway comparison...")
    
    if len(assessment_ids) < 2:
        print("❌ Need at least 2 assessments for comparison")
        return False
    
    comparison_data = {
        "assessment_ids": assessment_ids[:2]
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/compare",
            json=comparison_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Comparison completed successfully")
            print(f"   Compared {len(data.get('assessments', []))} assessments")
            
            if 'recommendations' in data:
                print(f"   Recommendations: {len(data['recommendations'])} items")
            
            return True
        else:
            print(f"❌ Comparison failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Comparison error: {e}")
        return False

def test_dashboard():
    """Test dashboard data endpoint"""
    print("\nTesting dashboard...")
    try:
        response = requests.get(f"{API_BASE}/dashboard")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Dashboard data retrieved")
            print(f"   Total assessments: {data.get('total_assessments', 0)}")
            print(f"   Average carbon footprint: {data.get('avg_carbon_footprint', 0)} kg CO2")
            print(f"   Recent assessments: {len(data.get('recent_assessments', []))}")
            return True
        else:
            print(f"❌ Dashboard failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Dashboard error: {e}")
        return False

def test_report_generation(assessment_id):
    """Test report generation"""
    print("\nTesting report generation...")
    
    if not assessment_id:
        print("❌ No assessment ID available for report generation")
        return False
    
    report_data = {
        "assessment_ids": [assessment_id],
        "format": "json",
        "report_type": "comprehensive"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/generate-report",
            json=report_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print(f"✅ Report generated successfully")
            
            # Try to parse as JSON
            try:
                data = response.json()
                print(f"   Report contains {len(data.get('sections', []))} sections")
            except:
                print(f"   Report size: {len(response.content)} bytes")
            
            return True
        else:
            print(f"❌ Report generation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Report generation error: {e}")
        return False

def create_sample_assessments():
    """Create multiple sample assessments for testing"""
    print("\nCreating sample assessments...")
    
    sample_data = [
        {
            "metal_type": "aluminum",
            "quantity": 1000,
            "production_route": "recycled",
            "recycled_content": 0.95,
            "energy_consumption": 750,
            "transport_distance": 200,
            "electricity_source": "renewable",
            "fuel_type": "electricity",
            "water_usage": 150000,
            "waste_generation": 15,
            "end_of_life_scenario": "recycling"
        },
        {
            "metal_type": "copper",
            "quantity": 500,
            "production_route": "primary",
            "recycled_content": 0.0,
            "energy_consumption": 9250,
            "transport_distance": 800,
            "electricity_source": "grid_mix",
            "fuel_type": "diesel",
            "water_usage": 1400000,
            "waste_generation": 75,
            "end_of_life_scenario": "recycling"
        }
    ]
    
    assessment_ids = []
    
    for i, data in enumerate(sample_data):
        try:
            response = requests.post(
                f"{API_BASE}/assessment",
                json=data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                result = response.json()
                assessment_ids.append(result.get('id'))
                print(f"✅ Created assessment {i+1}: {data['metal_type']} ({data['production_route']})")
            else:
                print(f"❌ Failed to create assessment {i+1}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error creating assessment {i+1}: {e}")
    
    return assessment_ids

def main():
    """Run all tests"""
    print("🚀 Starting AI-Driven LCA Tool API Tests")
    print("=" * 50)
    
    # Track test results
    results = []
    assessment_ids = []
    
    # Test health check
    results.append(test_health_check())
    
    # Test metal properties
    results.append(test_metal_properties())
    
    # Test LCA assessment creation
    assessment_id = test_lca_assessment()
    if assessment_id:
        assessment_ids.append(assessment_id)
        results.append(True)
    else:
        results.append(False)
    
    # Create additional sample assessments
    sample_ids = create_sample_assessments()
    assessment_ids.extend(sample_ids)
    
    # Test comparison (if we have multiple assessments)
    if len(assessment_ids) >= 2:
        results.append(test_comparison(assessment_ids))
    else:
        print("\n⚠️  Skipping comparison test (need multiple assessments)")
        results.append(None)
    
    # Test dashboard
    results.append(test_dashboard())
    
    # Test report generation
    if assessment_ids:
        results.append(test_report_generation(assessment_ids[0]))
    else:
        print("\n⚠️  Skipping report test (no assessments available)")
        results.append(None)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary")
    print("=" * 50)
    
    passed = sum(1 for r in results if r is True)
    failed = sum(1 for r in results if r is False)
    skipped = sum(1 for r in results if r is None)
    
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"⚠️  Skipped: {skipped}")
    print(f"📈 Success Rate: {passed/(passed+failed)*100:.1f}%" if (passed+failed) > 0 else "N/A")
    
    if failed == 0:
        print("\n🎉 All tests passed! The API is working correctly.")
    else:
        print(f"\n⚠️  {failed} test(s) failed. Check the server logs for details.")
    
    return failed == 0

if __name__ == "__main__":
    main()