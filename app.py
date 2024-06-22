from flask import Flask, request, jsonify
from google.cloud import translate_v2 as translate
from PyPDF2 import PdfReader
import os

app = Flask(__name__)

# Initialize the Google Translate client
translate_client = translate.Client()

def translate_text(target: str, text: str) -> dict:
    """Translates text into the target language."""
    result = translate_client.translate(text, target_language=target)
    return result

@app.route('/translate', methods=['POST'])
def translate_pdf():
    if 'pdf' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['pdf']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save the file temporarily
    filepath = os.path.join('/tmp', file.filename)
    file.save(filepath)

    # Extract text from the PDF
    reader = PdfReader(filepath)
    text = ''
    for page in reader.pages:
        text += page.extract_text()

    # Translate the text
    target_language = 'es'  # Specify your target language here
    translated_result = translate_text(target_language, text)

    # Clean up the temporary file
    os.remove(filepath)

    return jsonify({'translation': translated_result['translatedText']})

if __name__ == '__main__':
    app.run(debug=True)
