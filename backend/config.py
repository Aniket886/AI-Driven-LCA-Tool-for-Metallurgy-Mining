"""
Configuration settings for the AI-Driven LCA Tool
"""

import os
from datetime import timedelta

class Config:
    """Base configuration class"""
    
    # Flask settings
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database settings
    DB_HOST = os.environ.get('DB_HOST') or 'localhost'
    DB_PORT = os.environ.get('DB_PORT') or '5432'
    DB_NAME = os.environ.get('DB_NAME') or 'lca_tool'
    DB_USER = os.environ.get('DB_USER') or 'postgres'
    DB_PASSWORD = os.environ.get('DB_PASSWORD') or 'password'
    
    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # ML Model settings
    ML_MODEL_PATH = os.environ.get('ML_MODEL_PATH') or 'ml_models/trained_models'
    ML_RETRAIN_INTERVAL = int(os.environ.get('ML_RETRAIN_INTERVAL', '7'))  # days
    
    # External API settings
    EXTERNAL_API_TIMEOUT = int(os.environ.get('EXTERNAL_API_TIMEOUT', '30'))  # seconds
    
    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER') or 'uploads'
    ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'json'}
    
    # Report generation settings
    REPORT_CACHE_TIMEOUT = int(os.environ.get('REPORT_CACHE_TIMEOUT', '3600'))  # seconds
    MAX_REPORT_SIZE = int(os.environ.get('MAX_REPORT_SIZE', '50'))  # MB
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL') or 'memory://'
    RATELIMIT_DEFAULT = "100 per hour"
    
    # Logging
    LOG_LEVEL = os.environ.get('LOG_LEVEL') or 'INFO'
    LOG_FILE = os.environ.get('LOG_FILE') or 'logs/lca_tool.log'
    
    # Security settings
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Metal properties cache
    METAL_PROPERTIES_CACHE_TIMEOUT = int(os.environ.get('METAL_PROPERTIES_CACHE_TIMEOUT', '86400'))  # 24 hours
    
    # AI/ML Configuration
    AI_CONFIDENCE_THRESHOLD = float(os.environ.get('AI_CONFIDENCE_THRESHOLD', '0.7'))
    AI_MAX_PREDICTION_TIME = int(os.environ.get('AI_MAX_PREDICTION_TIME', '30'))  # seconds
    
    # External data sources
    EXTERNAL_DATA_SOURCES = {
        'ecoinvent': {
            'url': os.environ.get('ECOINVENT_API_URL'),
            'api_key': os.environ.get('ECOINVENT_API_KEY'),
            'timeout': 30
        },
        'idemat': {
            'url': os.environ.get('IDEMAT_API_URL'),
            'api_key': os.environ.get('IDEMAT_API_KEY'),
            'timeout': 30
        },
        'greet': {
            'url': os.environ.get('GREET_API_URL'),
            'api_key': os.environ.get('GREET_API_KEY'),
            'timeout': 30
        }
    }
    
    # Validation settings
    MIN_QUANTITY = 0.001  # kg
    MAX_QUANTITY = 1000000  # kg
    MIN_ENERGY = 0.1  # kWh
    MAX_ENERGY = 1000000  # kWh
    MIN_DISTANCE = 0  # km
    MAX_DISTANCE = 50000  # km
    
    # Circularity thresholds
    CIRCULARITY_THRESHOLDS = {
        'linear': 0.3,
        'transitional': 0.6,
        'circular': 0.8
    }
    
    # Sustainability score weights
    SUSTAINABILITY_WEIGHTS = {
        'carbon_footprint': 0.25,
        'energy_efficiency': 0.20,
        'water_usage': 0.15,
        'waste_generation': 0.15,
        'circularity_index': 0.15,
        'material_efficiency': 0.10
    }

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    
    # Use SQLite for development if PostgreSQL not available
    if not os.environ.get('DB_PASSWORD'):
        SQLALCHEMY_DATABASE_URI = 'sqlite:///lca_tool_dev.db'
    
    # Relaxed security for development
    SESSION_COOKIE_SECURE = False
    
    # Enable detailed logging
    LOG_LEVEL = 'DEBUG'

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = True
    
    # Use in-memory SQLite for testing
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    
    # Disable CSRF for testing
    WTF_CSRF_ENABLED = False
    
    # Faster ML training for tests
    ML_RETRAIN_INTERVAL = 1
    
    # Shorter timeouts for tests
    EXTERNAL_API_TIMEOUT = 5
    REPORT_CACHE_TIMEOUT = 60

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Ensure all required environment variables are set
    required_vars = ['SECRET_KEY', 'DB_PASSWORD']
    for var in required_vars:
        if not os.environ.get(var):
            raise ValueError(f"Required environment variable {var} is not set")
    
    # Enhanced security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    
    # Production logging
    LOG_LEVEL = 'WARNING'

class SIHConfig(Config):
    """Smart India Hackathon specific configuration"""
    DEBUG = True
    TESTING = False
    
    # SIH demo settings
    DEMO_MODE = True
    DEMO_DATA_ENABLED = True
    
    # Faster processing for demos
    AI_MAX_PREDICTION_TIME = 10
    REPORT_CACHE_TIMEOUT = 300
    
    # Allow all origins for demo
    CORS_ORIGINS = ['*']
    
    # Use SQLite for portability
    SQLALCHEMY_DATABASE_URI = 'sqlite:///lca_tool_sih.db'
    
    # Demo-specific settings
    MAX_ASSESSMENTS_PER_SESSION = 50
    DEMO_RESET_INTERVAL = 3600  # Reset demo data every hour

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'sih': SIHConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])