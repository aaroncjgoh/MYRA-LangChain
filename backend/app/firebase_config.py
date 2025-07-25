import firebase_admin
from firebase_admin import credentials, firestore
import os # Import os to handle file paths

# Get the directory of the current script (firebase_config.py)
# This ensures the path to the JSON file is always relative to this script's location,
# regardless of where the main application is started from.
script_dir = os.path.dirname(os.path.abspath(__file__))
service_account_key_path = os.path.join(script_dir, "MYRA_firebase_SDK.json")

try:
    # Initialize Firebase Admin SDK
    cred = credentials.Certificate(service_account_key_path)
    firebase_admin.initialize_app(cred)
    print(f"Firebase Admin SDK initialized successfully from firebase_config.py using: {service_account_key_path}")

    # Get the Firestore client
    db = firestore.client()
    print("Firestore client (db) created in firebase_config.py.")

except FileNotFoundError:
    print(f"Error: Service account key file not found at {service_account_key_path}.")
    print("Please ensure 'MYRA_firebase_SDK.json' is in the same directory as firebase_config.py, or update the path.")
    # Set db to None if initialization fails so dependent modules can check
    db = None
except Exception as e:
    print(f"An error occurred during Firebase initialization in firebase_config.py: {e}")
    # Set db to None if initialization fails
    db = None