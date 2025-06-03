#!/usr/bin/env python3
"""
Database initialization script for Mergington High School Activities

This script populates the MongoDB database with the initial activities data.
"""

from pymongo import MongoClient
import json

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['mergington_school']
activities_collection = db['activities']

# Clear existing data
activities_collection.drop()

# Initial activities data
activities_data = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    },
    # Sports activities
    "Soccer Team": {
        "description": "Join the school soccer team and compete in local leagues",
        "schedule": "Tuesdays and Thursdays, 4:00 PM - 5:30 PM",
        "max_participants": 18,
        "participants": ["lucas@mergington.edu", "mia@mergington.edu"]
    },
    "Basketball Club": {
        "description": "Practice basketball skills and play friendly matches",
        "schedule": "Wednesdays, 3:30 PM - 5:00 PM",
        "max_participants": 15,
        "participants": ["liam@mergington.edu", "ava@mergington.edu"]
    },
    # Artistic activities
    "Art Club": {
        "description": "Explore painting, drawing, and other visual arts",
        "schedule": "Mondays, 3:30 PM - 5:00 PM",
        "max_participants": 16,
        "participants": ["ella@mergington.edu", "noah@mergington.edu"]
    },
    "Drama Society": {
        "description": "Participate in acting, stage production, and school plays",
        "schedule": "Thursdays, 4:00 PM - 5:30 PM",
        "max_participants": 20,
        "participants": ["charlotte@mergington.edu", "jack@mergington.edu"]
    },
    # Intellectual activities
    "Math Olympiad": {
        "description": "Prepare for math competitions and solve challenging problems",
        "schedule": "Fridays, 2:00 PM - 3:30 PM",
        "max_participants": 10,
        "participants": ["amelia@mergington.edu", "benjamin@mergington.edu"]
    },
    "Science Club": {
        "description": "Conduct experiments and explore scientific concepts",
        "schedule": "Wednesdays, 4:00 PM - 5:00 PM",
        "max_participants": 14,
        "participants": ["ethan@mergington.edu", "grace@mergington.edu"]
    }
}

# Insert activities into MongoDB
print("Initializing MongoDB database...")
for activity_name, activity_data in activities_data.items():
    # Use activity name as the _id to maintain the same key structure
    document = {
        "_id": activity_name,
        **activity_data
    }
    activities_collection.insert_one(document)
    print(f"✓ Added activity: {activity_name}")

print(f"\nDatabase initialization complete!")
print(f"Database: mergington_school")
print(f"Collection: activities")
print(f"Total activities: {activities_collection.count_documents({})}")

# Verify the data
print("\nVerifying data:")
for activity in activities_collection.find():
    print(f"- {activity['_id']}: {len(activity['participants'])} participants")

client.close()
