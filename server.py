from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Initialize Flask with current directory as static folder
app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app)  # Enable CORS for all routes

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

# Questions Definition
QUESTIONS = [
    {
        "id": 1,
        "type": "radio",
        "text": "What is your gender?",
        "options": ["Male", "Female"]
    },
    {
        "id": 2,
        "type": "text",
        "text": "What is your age?",
        "placeholder": "e.g., 25",
        "inputType": "number"
    },
    {
        "id": 3,
        "type": "radio",
        "text": "What is your occupation?",
        "scrollable": True,
        "options": [
            "Software Engineer", "Doctor", "Nurse", "Teacher",
            "Engineer", "Accountant", "Lawyer", "Salesperson",
            "Manager", "Sales Representative", "Scientist",
            "Student", "Other"
        ]
    },
    {
        "id": 4,
        "type": "text",
        "text": "How many hours do you sleep per night?",
        "placeholder": "e.g., 7.5",
        "inputType": "number"
    },
    {
        "id": 6,
        "type": "text",
        "text": "How many minutes of physical activity do you perform daily?",
        "placeholder": "e.g., 45",
        "inputType": "number"
    },
    {
        "id": 8,
        "type": "radio",
        "text": "Which BMI Category best describes you?",
        "options": ["Normal", "Overweight", "Obese"]
    },
    {
        "id": 9,
        "type": "text",
        "text": "What is your Blood Pressure?",
        "placeholder": "e.g., 120/80",
        "inputType": "text"
    }
]

@app.route('/questions', methods=['GET'])
def get_questions():
    return jsonify(QUESTIONS)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Simple Logic Verification (Mock ML)
        # Higher stress if sleep is low, or BMI is Obese/Overweight
        
        stress_score = 0
        
        # Sleep Factor
        sleep = float(data.get('Sleep Duration', 7))
        if sleep < 5: stress_score += 4
        elif sleep < 6: stress_score += 3
        elif sleep < 7: stress_score += 2
        
        # BMI Factor
        bmi = data.get('BMI Category', 'Normal')
        if bmi == 'Obese': stress_score += 3
        elif bmi == 'Overweight': stress_score += 2
        
        # Activity Factor (Less activity = more stress potential)
        activity = int(data.get('Physical Activity Level', 60))
        if activity < 30: stress_score += 2
        
        # Base Score
        stress_score += 1
        
        # Cap at 8 (High) or 10
        final_level = min(max(stress_score, 1), 9) 
        
        # Probabilities for Pie Chart
        # Create a distribution centered around the predicted level
        probs = {
            1: 0.1, 2: 0.1, 3: 0.1, 4: 0.1, 5: 0.2, 
            6: 0.1, 7: 0.1, 8: 0.1, 9: 0.05, 10: 0.05
        }
        # Boost the predicted one
        probs[final_level] = 0.5
        # Normalize
        total = sum(probs.values())
        probs = {k: v/total for k,v in probs.items()}

        return jsonify({
            'stress_level': final_level,
            'probabilities': probs,
            'message': 'Prediction successful'
        })

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    # Run on port 5000 
    print("Server running on http://127.0.0.1:5500")
    app.run(debug=True, port=5500)
