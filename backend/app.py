from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from datetime import datetime
import os
import json
import sqlite3
# Using built-in libraries only
from ml_models.lca_predictor import LCAPredictor
from utils.report_generator import ReportGenerator
from utils.data_processor import DataProcessor

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'
DATABASE_PATH = 'lca_tool.db'

# Initialize ML models and utilities
lca_predictor = LCAPredictor()
report_generator = ReportGenerator()
data_processor = DataProcessor()

# Database helper functions
def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize SQLite database"""
    conn = get_db_connection()
    
    # Create tables
    conn.execute('''
        CREATE TABLE IF NOT EXISTS lca_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            metal_type TEXT NOT NULL,
            assessment_data TEXT NOT NULL,
            results TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS metal_properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metal_name TEXT NOT NULL UNIQUE,
            density REAL,
            melting_point REAL,
            recycling_efficiency REAL,
            carbon_footprint_primary REAL,
            carbon_footprint_recycled REAL
        )
    ''')
    
    # Insert sample metal properties
    metals_data = [
        ('aluminum', 2.70, 660, 0.95, 11.5, 0.6),
        ('copper', 8.96, 1085, 0.90, 3.8, 0.4),
        ('steel', 7.85, 1370, 0.85, 2.3, 0.5),
        ('lithium', 0.53, 180, 0.80, 15.2, 2.1),
        ('zinc', 7.14, 420, 0.95, 3.2, 0.7),
        ('nickel', 8.91, 1455, 0.92, 12.8, 2.4)
    ]
    
    for metal_data in metals_data:
        try:
            conn.execute('''
                INSERT OR IGNORE INTO metal_properties 
                (metal_name, density, melting_point, recycling_efficiency, 
                 carbon_footprint_primary, carbon_footprint_recycled)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', metal_data)
        except sqlite3.IntegrityError:
            pass  # Metal already exists
    
    conn.commit()
    conn.close()

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/metals', methods=['GET'])
def get_metals():
    """Get available metals and their properties"""
    conn = get_db_connection()
    metals = conn.execute('SELECT * FROM metal_properties').fetchall()
    conn.close()
    
    metals_list = []
    for metal in metals:
        metals_list.append({
            'id': metal['id'],
            'name': metal['metal_name'],
            'density': metal['density'],
            'melting_point': metal['melting_point'],
            'recycling_efficiency': metal['recycling_efficiency'],
            'carbon_footprint_primary': metal['carbon_footprint_primary'],
            'carbon_footprint_recycled': metal['carbon_footprint_recycled']
        })
    
    return jsonify({'metals': metals_list})

@app.route('/api/assess', methods=['POST'])
def create_assessment():
    """Create new LCA assessment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['metal_type', 'quantity', 'production_route']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Prepare input for ML model
        input_data = {
            'metal_type': data['metal_type'],
            'quantity': float(data['quantity']),
            'production_route': data['production_route'],
            'recycled_content': float(data.get('recycled_content', 0.0)),
            'energy_consumption': data.get('energy_consumption'),
            'electricity_source': data.get('electricity_source', 'grid_mix'),
            'transport_distance': float(data.get('transport_distance', 0)),
            'waste_generation': float(data.get('waste_generation', 0)),
            'end_of_life_scenario': data.get('end_of_life_scenario', 'recycling'),
            'process_temperature': data.get('process_temperature')
        }
        
        # Get predictions from ML model
        predictions = lca_predictor.predict_all_metrics(input_data)
        
        # Save to database
        conn = get_db_connection()
        cursor = conn.execute('''
            INSERT INTO lca_assessments (user_id, metal_type, assessment_data, results)
            VALUES (?, ?, ?, ?)
        ''', (
            data.get('user_id', 'anonymous'),
            data['metal_type'],
            json.dumps(data),
            json.dumps(predictions)
        ))
        
        assessment_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'assessment_id': assessment_id,
            'results': predictions,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/compare', methods=['POST'])
def compare_pathways():
    """Compare multiple LCA pathways"""
    try:
        data = request.get_json()
        pathways = data.get('pathways', [])
        
        if len(pathways) < 2:
            return jsonify({'error': 'At least 2 pathways required for comparison'}), 400
        
        comparison_results = []
        
        for i, pathway in enumerate(pathways):
            # Get predictions for each pathway
            predictions = lca_predictor.predict_all_metrics(pathway)
            
            comparison_results.append({
                'pathway_id': i + 1,
                'pathway_name': pathway.get('name', f'Pathway {i + 1}'),
                'metal_type': pathway['metal_type'],
                'production_route': pathway['production_route'],
                'results': predictions
            })
        
        # Generate comparison insights
        insights = data_processor.generate_comparison_insights(comparison_results)
        
        return jsonify({
            'comparison_results': comparison_results,
            'insights': insights,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/assessments/<string:user_id>', methods=['GET'])
def get_user_assessments(user_id):
    """Get assessments for a specific user"""
    conn = get_db_connection()
    assessments = conn.execute('''
        SELECT * FROM lca_assessments 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ''', (user_id,)).fetchall()
    conn.close()
    
    assessments_list = []
    for assessment in assessments:
        assessments_list.append({
            'id': assessment['id'],
            'metal_type': assessment['metal_type'],
            'assessment_data': json.loads(assessment['assessment_data']),
            'results': json.loads(assessment['results']),
            'created_at': assessment['created_at']
        })
    
    return jsonify({'assessments': assessments_list})

@app.route('/api/dashboard/<string:user_id>', methods=['GET'])
def get_dashboard_data(user_id):
    """Get dashboard data for user"""
    conn = get_db_connection()
    
    # Get recent assessments
    recent_assessments = conn.execute('''
        SELECT * FROM lca_assessments 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 5
    ''', (user_id,)).fetchall()
    
    # Get statistics
    stats = conn.execute('''
        SELECT 
            COUNT(*) as total_assessments,
            AVG(json_extract(results, '$.carbon_footprint')) as avg_carbon_footprint,
            AVG(json_extract(results, '$.sustainability_score')) as avg_sustainability_score,
            AVG(json_extract(results, '$.circularity_index')) as avg_circularity_index
        FROM lca_assessments 
        WHERE user_id = ?
    ''', (user_id,)).fetchone()
    
    conn.close()
    
    # Format recent assessments
    recent_list = []
    for assessment in recent_assessments:
        results = json.loads(assessment['results'])
        recent_list.append({
            'id': assessment['id'],
            'metal_type': assessment['metal_type'],
            'carbon_footprint': results.get('carbon_footprint', 0),
            'sustainability_score': results.get('sustainability_score', 0),
            'created_at': assessment['created_at']
        })
    
    return jsonify({
        'statistics': {
            'total_assessments': stats['total_assessments'] or 0,
            'average_carbon_footprint': round(stats['avg_carbon_footprint'] or 0, 2),
            'average_sustainability_score': round(stats['avg_sustainability_score'] or 0, 1),
            'average_circularity_index': round(stats['avg_circularity_index'] or 0, 3)
        },
        'recent_assessments': recent_list
    })

@app.route('/api/generate-report', methods=['POST'])
def generate_report():
    """Generate assessment report"""
    try:
        data = request.get_json()
        assessment_ids = data.get('assessment_ids', [])
        report_type = data.get('report_type', 'comprehensive')
        format_type = data.get('format', 'pdf')
        
        if not assessment_ids:
            return jsonify({'error': 'No assessment IDs provided'}), 400
        
        # Get assessment data
        conn = get_db_connection()
        assessments = []
        
        for assessment_id in assessment_ids:
            assessment = conn.execute('''
                SELECT * FROM lca_assessments WHERE id = ?
            ''', (assessment_id,)).fetchone()
            
            if assessment:
                assessments.append({
                    'id': assessment['id'],
                    'metal_type': assessment['metal_type'],
                    'assessment_data': json.loads(assessment['assessment_data']),
                    'results': json.loads(assessment['results']),
                    'created_at': assessment['created_at']
                })
        
        conn.close()
        
        if not assessments:
            return jsonify({'error': 'No valid assessments found'}), 404
        
        # Generate report
        report_path = report_generator.generate_report(
            assessments, report_type, format_type
        )
        
        return jsonify({
            'report_path': report_path,
            'download_url': f'/api/download-report/{os.path.basename(report_path)}',
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download-report/<filename>', methods=['GET'])
def download_report(filename):
    """Download generated report"""
    try:
        reports_dir = 'reports'
        file_path = os.path.join(reports_dir, filename)
        
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'Report not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/external-data/sync', methods=['POST'])
def sync_external_data():
    """Sync with external LCA databases"""
    try:
        # This would integrate with external databases like ecoinvent
        # For now, return a mock response
        return jsonify({
            'status': 'success',
            'message': 'External data sync completed',
            'updated_records': 0,
            'last_sync': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Initialize database
    init_database()
    
    # Train ML models
    lca_predictor.train_models()
    lca_predictor.save_models()
    
    print("🚀 AI-Driven LCA Tool Backend Starting...")
    print("📊 Database initialized")
    print("🤖 ML models trained")
    print("🌐 Server running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)