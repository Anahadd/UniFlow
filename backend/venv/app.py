import os
import uuid
import json
import logging
import requests  
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from google.cloud import speech, storage
from bs4 import BeautifulSoup  
from vertexai.preview.generative_models import GenerativeModel
import vertexai
from dotenv import load_dotenv
from interview_utils import analyze_with_vertex_ai, speak_feedback
from bson.objectid import ObjectId
from datetime import datetime

load_dotenv()

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)  

client = MongoClient('mongodb://localhost:27017/')
db = client['easify_apps']
profiles_collection = db['user_profiles']

GCS_BUCKET_NAME = os.getenv('BUCKET_NAME')
storage_client = storage.Client()

project_id = os.getenv("PROJECT_ID")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GCP")
vertexai.init(project=project_id, location="us-central1")

def upload_to_gcs(file_content, destination_blob_name):
    bucket = storage_client.bucket(GCS_BUCKET_NAME)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_string(file_content, content_type='audio/webm')
    return f"gs://{GCS_BUCKET_NAME}/{destination_blob_name}"

@app.route('/add_scholarship', methods=['POST'])
def add_scholarship():
    try:
        data = request.get_json()
        scholarship = {
            'title': data['title'],
            'description': data['description'],
            'amount': data['amount'],
            'deadline': datetime.strptime(data['deadline'], '%Y-%m-%d'),
            'eligibility': data['eligibility'],
            'tags': data['tags']
        }
        result = scholarships_collection.insert_one(scholarship)
        return jsonify({'message': 'Scholarship added successfully', 'id': str(result.inserted_id)}), 201
    except Exception as e:
        logging.error(f"Error adding scholarship: {e}", exc_info=True)
        return jsonify({'error': 'Failed to add scholarship'}), 500

@app.route('/get_matching_scholarships', methods=['GET'])
def get_matching_scholarships():
    try:
        email = request.args.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400

        user_profile = profiles_collection.find_one({'email': email})
        if not user_profile:
            return jsonify({'error': 'User profile not found'}), 404

        matching_scholarships = scholarships_collection.find({
            '$or': [
                {'eligibility.study': user_profile['study']},
                {'eligibility.universities': {'$in': user_profile['universities']}}
            ]
        })

        scholarships_list = []
        for scholarship in matching_scholarships:
            scholarship['_id'] = str(scholarship['_id'])
            scholarship['deadline'] = scholarship['deadline'].strftime('%Y-%m-%d')
            scholarships_list.append(scholarship)

        return jsonify(scholarships_list), 200
    except Exception as e:
        logging.error(f"Error getting matching scholarships: {e}", exc_info=True)
        return jsonify({'error': 'Failed to get matching scholarships'}), 500

@app.route('/admin/add_scholarship', methods=['POST'])
def admin_add_scholarship():
    try:
        data = request.get_json()
        required_fields = ['title', 'description', 'amount', 'deadline', 'eligibility', 'tags']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        scholarship = {
            'title': data['title'],
            'description': data['description'],
            'amount': float(data['amount']),
            'deadline': datetime.strptime(data['deadline'], '%Y-%m-%d'),
            'eligibility': data['eligibility'],
            'tags': data['tags']
        }
        
        result = scholarships_collection.insert_one(scholarship)
        return jsonify({'message': 'Scholarship added successfully', 'id': str(result.inserted_id)}), 201
    except Exception as e:
        logging.error(f"Error adding scholarship: {e}", exc_info=True)
        return jsonify({'error': 'Failed to add scholarship'}), 500

@app.route('/update_scholarship_status', methods=['POST'])
def update_scholarship_status():
    try:
        data = request.get_json()
        email = data['email']
        scholarship_id = data['scholarshipId']
        status = data['status']

        result = profiles_collection.update_one(
            {'email': email},
            {'$set': {f'scholarships.{scholarship_id}': status}}
        )

        if result.modified_count > 0:
            return jsonify({'message': 'Scholarship status updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update scholarship status'}), 400
    except Exception as e:
        logging.error(f"Error updating scholarship status: {e}", exc_info=True)
        return jsonify({'error': 'Failed to update scholarship status'}), 500
    
@app.route('/scrape_scholarships', methods=['GET'])
def scrape_scholarships():
    url = 'https://www.ouinfo.ca/scholarships' 
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({'error': 'Failed to retrieve data'}), 500
    
    soup = BeautifulSoup(response.text, 'html.parser')
    scholarships = []

    # Adjust these selectors based on the actual HTML structure you find
    for item in soup.find_all('div', class_='scholarship-item'):
        title = item.find('h2').text.strip()
        institution = item.find('span', class_='institution').text.strip()
        amount = item.find('span', class_='amount').text.strip()
        deadline = item.find('span', class_='deadline').text.strip()

        scholarships.append({
            'title': title,
            'institution': institution,
            'amount': amount,
            'deadline': deadline
        })
    print(scholarships)
    return jsonify(scholarships)

@app.route('/get_profile', methods=['GET'])
def get_profile():
    email = request.args.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    profile = profiles_collection.find_one({'email': email})
    if profile:
        profile['_id'] = str(profile['_id'])
        if 'universities' in profile:
            if isinstance(profile['universities'], str):
                profile['universities'] = json.loads(profile['universities'])
            if not isinstance(profile['universities'], list):
                profile['universities'] = [profile['universities']]
        else:
            profile['universities'] = []
        logging.debug('Returning Profile:', profile) 
        return jsonify(profile)
    else:
        return jsonify({'error': 'Profile not found'}), 404

@app.route('/save_application', methods=['POST'])
def save_application():
    try:
        data = request.get_json()
        email = data['email']
        university = data['university']
        responses = data['responses']

        result = profiles_collection.update_one(
            {'email': email},
            {'$set': {f'applications.{university}': {'responses': responses}}},
            upsert=True
        )

        return jsonify({'message': 'Application saved successfully'}), 200

    except Exception as e:
        logging.error(f"Error saving application: {e}", exc_info=True)
        return jsonify({'error': 'Failed to save application'}), 500

@app.route('/save_profile', methods=['POST'])
def save_profile():
    data = request.form
    resume = request.files['resume']
    
    resumes_dir = 'resumes'
    if not os.path.exists(resumes_dir):
        os.makedirs(resumes_dir)
    
    resume_filename = os.path.join(resumes_dir, resume.filename)
    resume.save(resume_filename)
    
    profile = {
        'email': data['email'],
        'firstName': data['firstName'],
        'lastName': data['lastName'],
        'study': data['study'],
        'universities': data['universities'],
        'resume': resume_filename
    }
    result = profiles_collection.insert_one(profile)
    return jsonify({'message': 'Profile saved', 'id': str(result.inserted_id)})

@app.route('/analyze_essay', methods=['POST', 'OPTIONS'])
def analyze_essay():
    logging.info(f"Received {request.method} request to /analyze_essay")
    
    if request.method == 'OPTIONS':
        logging.info("Handling OPTIONS request")
        return '', 204
    
    logging.info("Handling POST request")
    try:
        data = request.get_json()
        logging.info(f"Received data: {data}")
        
        email = data['email']
        university = data['university']
        question = data['question']

        profile = profiles_collection.find_one({'email': email})
        if not profile:
            logging.warning(f"Profile not found for email: {email}")
            return jsonify({'error': 'Profile not found'}), 404

        application = profile.get('applications', {}).get(university, {})
        if not application:
            logging.warning(f"Application not found for university: {university}")
            return jsonify({'error': 'Application not found for this university'}), 404

        essay_text = application.get('responses', {}).get(question, '')
        if not essay_text:
            logging.warning(f"No response found for question: {question}")
            return jsonify({'error': 'No response found for the selected question'}), 404

        logging.info("Generating feedback")
        feedback = analyze_with_vertex_ai(essay_text, question)
        logging.info("Feedback generated successfully")
        return jsonify({'feedback': feedback}), 200

    except Exception as e:
        logging.error(f"Error analyzing essay: {e}", exc_info=True)
        return jsonify({'error': 'Failed to analyze essay'}), 500

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    try:
        if 'audio' not in request.files or 'question' not in request.form:
            return jsonify({'error': 'Audio file and question are required'}), 400

        audio_file = request.files['audio']
        question = request.form['question']
        
        audio_content = audio_file.read()

        gcs_uri = upload_to_gcs(audio_content, f"audio_uploads/{uuid.uuid4()}.webm")

        client = speech.SpeechClient()
        audio = speech.RecognitionAudio(uri=gcs_uri)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=16000,
            language_code="en-US",
        )

        operation = client.long_running_recognize(config=config, audio=audio)
        
        logging.info("Waiting for operation to complete...")
        response = operation.result(timeout=300)
        
        transcription = ''
        for result in response.results:
            transcription += result.alternatives[0].transcript

        logging.info(f"Transcription: {transcription}")

        feedback = analyze_with_vertex_ai(transcription, question)

        speak_feedback(feedback)

        return jsonify({'transcription': transcription, 'feedback': feedback})
    except Exception as e:
        logging.error(f"Error: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/get_application', methods=['GET'])
def get_application():
    try:
        email = request.args.get('email')
        university = request.args.get('university')

        if not email or not university:
            return jsonify({'error': 'Email and university are required'}), 400

        profile = profiles_collection.find_one({'email': email})

        if profile:
            application = profile.get('applications', {}).get(university, {})
            if application:
                return jsonify(application), 200
            else:
                return jsonify({'error': 'Application for this university not found'}), 404
        else:
            return jsonify({'error': 'Profile not found'}), 404

    except Exception as e:
        logging.error(f"Error fetching application: {e}", exc_info=True)
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/stop_playback', methods=['POST'])
def stop_playback():
    """Endpoint to stop the current audio playback."""
    playback_event.set()
    return jsonify({'message': 'Playback stopped'})

@app.after_request
def after_request(response):
    logging.info(f"Sending response with status {response.status_code}")
    return response

if __name__ == "__main__":
    logging.info("Starting Flask server")
    app.run(debug=True, port=5000)  