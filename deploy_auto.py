"""
Automated deployment script for the AI-Driven LCA Tool (no user input required)
"""

import os
import sys
from deploy import LCAToolDeployer

def main():
    """Main deployment function - automated version"""
    deployer = LCAToolDeployer()
    
    print("🌟 AI-Driven LCA Tool - Automated Deployment")
    print("Setting up everything automatically...")
    
    success = deployer.deploy()
    
    if success:
        print("\n🎉 Deployment completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Deployment failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()