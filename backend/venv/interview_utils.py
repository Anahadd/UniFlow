import os
import queue
import string
import time
import threading  # Import threading for the event
from google.cloud import speech
import vertexai
from vertexai.preview.generative_models import GenerativeModel
from google.cloud import texttospeech
from playsound import playsound
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Setup Flask app
app = Flask(__name__)
CORS(app)

# hidding the api's 
load_dotenv()

# put in .env later (once pushed to github)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.getenv("GCP")

RATE = 16000
CHUNK = int(RATE / 10)  

# Global event for stopping playback
playback_event = threading.Event()

def clean_transcript(context):
    context = context.replace('*', '')
    context = context.translate(str.maketrans('', '', string.punctuation))
    return context

def analyze_with_vertex_ai(context, question):
    system_prompt = (
        "You're a seasoned university admissions interviewer with years of experience. Your goal is to provide extremely thorough, constructive, and strict feedback on THE RESPONSE OF THE STUDENT. Remember that top universities have very high standards, and your feedback should reflect this."
        " Always address the student directly as 'you' or 'YOU'RE'."
        f" The student was responding to the question: '{question}'."
        "REMOVE ANY ASTERISKS IN THE RESPONSE SINCE THIS MAKES IT HARDER TO READ!"
        " Provide a comprehensive analysis of their response, covering the following points in extensive detail THAT IS WITHIN 75 WORDS TO 100 WORDS:"
        "\n1. Understanding and relevance (1 point): Critically evaluate how well they understood and answered the question. Discuss the clarity, organization, and relevance of their response. Include quotes from the student's answer."
        "\n2. Communication skills (1 point): Analyze their verbal communication skills, including articulation, pace, confidence, and ability to convey complex ideas. Use specific examples."
        "\n3. Depth of thought (1 point): Assess the intellectual depth of their response. Did they provide nuanced arguments, consider multiple perspectives, or demonstrate critical thinking? Quote relevant sections."
        "\n4. Well-roundedness (1 point): Evaluate how well the student demonstrated a balance between academic prowess, extracurricular involvement, and a clear vision for their future. Quote any parts of the response that relate to this."
        "\n5. Strengths (1 point): Highlight the strengths in their answer, providing specific examples from their response."
        "\n6. Areas for significant improvement (1 point): Identify areas where they fall short of the high standards expected by top universities. Offer specific, actionable advice on how they can substantially enhance their responses."
        "\n7. Examples and suggestions (1 point): Provide detailed examples of how top-tier candidates might approach the question. Suggest alternative ways they could have demonstrated their well-roundedness and vision."
        "\n8. Score and justification (1 point): End your feedback with a score out of 9. Be very strict with scoring - a score of 9 should be nearly impossible to achieve, reserved only for truly exceptional responses that would impress even the most demanding admissions committee. Provide a thorough justification for the score, explaining exactly what would be needed to achieve a higher score."
        " Your feedback must be between 75 words to 100 words, providing an exceptionally comprehensive and insightful analysis that will challenge the student to meet the extremely high standards of top university admissions."
        " Remember that the response was NOT WRITTEN BUT SAID, also remove any asterisks or any punctuation as another AI will be reading this."
    )

    project_id = os.getenv("PROJECT_ID")
    vertexai.init(project=project_id, location="us-central1")

    cleaned_context = clean_transcript(context)
    model = GenerativeModel("gemini-1.5-pro-001")

    prompt = system_prompt + "\n\n" + cleaned_context
    response = model.generate_content(
        prompt,
        generation_config={
            "max_output_tokens": 512,  
            "temperature": 0.1,
            "top_p": 0.5,
            "top_k": 20
        }
    )

    feedback = response.text if hasattr(response, 'text') else str(response)
    return feedback.strip()

def speak_feedback(feedback):
    global playback_event  # Declare playback_event as global
    playback_event.clear()  # Clear any previous events

    tts_client = texttospeech.TextToSpeechClient()
    synthesis_input = texttospeech.SynthesisInput(text=feedback)

    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        name="en-US-Casual-K",
    )

    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.LINEAR16,
        speaking_rate=1.2, 
        pitch=4.0,
        volume_gain_db=0.0
    )

    response = tts_client.synthesize_speech(
        request={"input": synthesis_input, "voice": voice, "audio_config": audio_config}
    )

    # Ensure the 'audio' directory exists
    audio_dir = "audio"
    if not os.path.exists(audio_dir):
        os.makedirs(audio_dir)

    # Generate a unique filename for each output in the 'audio' directory
    output_filename = os.path.join(audio_dir, f"output_{int(time.time())}.wav")
    
    # Save the audio content to the file
    with open(output_filename, "wb") as out:
        out.write(response.audio_content)
        print(f'Audio content written to file "{output_filename}"')

    # Start playback in a separate thread to check the event flag
    def play_audio():
        try:
            playsound(output_filename)
        except Exception as e:
            print(f"Error playing sound: {e}")

    audio_thread = threading.Thread(target=play_audio)
    audio_thread.start()

    # Monitor for stop signal while audio is playing
    while audio_thread.is_alive():
        if playback_event.is_set():
            print(f"Playback stopped.")
            break
        time.sleep(0.1)  # Small sleep to prevent CPU overuse

    # Clean up: delete the file after it has been played or stopped
    try:
        os.remove(output_filename)
        print(f'File "{output_filename}" deleted after playback.')
    except Exception as e:
        print(f'Error deleting file "{output_filename}": {e}')

@app.route('/stop_playback', methods=['POST'])
def stop_playback():
    global playback_event
    playback_event.set()  
    return jsonify({"status": "playback stopped"})

if __name__ == "__main__":
    app.run(debug=True)
