#!/usr/bin/env python3
"""
Simple test script for the LCA Tool backend API
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"✅ Health check: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_metals():
    """Test metals endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/metals")
        data = response.json()
        print(f"✅ Metals endpoint: {response.status_code} - Found {len(data)} metals")
        return True
    except Exception as e:
        print(f"❌ Metals endpoint failed: {e}")
        return False

def test_assessment():
    """Test assessment creation"""
    try:
        assessment_data = {
            "metal_type": "aluminum",
            "production_route": "primary",
            "energy_source": "renewable",
            "quantity": 1000,
            "energy_data": {
                "electricity_kwh": 500,
                "fossil_fuel_mj": 200
            },
            "transport_distance_km": 100,
            "recycled_content_ratio": 0.3,
            "process_efficiency": 0.85
        }
        
        response = requests.post(f"{BASE_URL}/api/assess", json=assessment_data)
        data = response.json()
        print(f"✅ Assessment creation: {response.status_code}")
        print(f"   Carbon footprint: {data.get('carbon_footprint', 0):.2f} kg CO2")
        print(f"   Sustainability score: {data.get('sustainability_score', 0):.1f}/100")
        return True
    except Exception as e:
        print(f"❌ Assessment creation failed: {e}")
        return False

def main():
    print("🧪 Testing AI-Driven LCA Tool Backend API...")
    print("=" * 50)
    
    # Wait a moment for server to be ready
    time.sleep(2)
    
    tests = [
        ("Health Check", test_health),
        ("Metals Endpoint", test_metals),
        ("Assessment Creation", test_assessment)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        if test_func():
            passed += 1
        print("-" * 30)
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the backend logs.")

if __name__ == '__main__':
    main()