import pandas as pd
import os
import sys

# Check scikit-learn
try:
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import LabelEncoder
    from sklearn.metrics import accuracy_score
except ImportError:
    print("Error: 'scikit-learn' library is missing. Run: pip install scikit-learn")
    sys.exit(1)

# ---------------------------
# Function: Preprocess dataset
# ---------------------------
def preprocess_data(df):
    # Split Blood Pressure
    df[['BP_Systolic', 'BP_Diastolic']] = df['Blood Pressure'].str.split('/', expand=True).astype(int)
    
    # Features and target
    target_col = 'Stress Level'
    drop_cols = ['Person ID', 'Stress Level', 'Quality of Sleep', 'Blood Pressure']
    X = df.drop(columns=drop_cols)
    y = df[target_col].astype(int)
    
    # Encode categorical columns
    encoders = {}
    categorical_cols = ['Gender', 'Occupation', 'BMI Category']
    for col in categorical_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col])
        encoders[col] = le
    
    return X, y, encoders

# ---------------------------
# Function: Get user input
# ---------------------------
def get_user_input(encoders):
    print("\n--- Stress Tester ---")
    gender = input("Gender (Male/Female): ").strip()
    age = int(input("Age: "))
    occupation = input("Occupation (e.g., Doctor, Nurse, Engineer, Teacher): ").strip()
    sleep_duration = float(input("Sleep Duration (hours/day, e.g., 6.5): "))
    activity = int(input("Physical Activity (minutes/day): "))
    bmi = input("BMI Category (Normal, Overweight, Obese): ").strip()
    bp = input("Blood Pressure (systolic/diastolic, e.g., 120/80): ").strip()
    
    # Process BP safely
    try:
        systolic, diastolic = map(int, bp.split('/'))
    except:
        print("Invalid BP format. Using default 120/80.")
        systolic, diastolic = 120, 80
    
    data = {
        'Gender': [gender],
        'Age': [age],
        'Occupation': [occupation],
        'Sleep Duration': [sleep_duration],
        'Physical Activity Level': [activity],
        'BMI Category': [bmi],
        'BP_Systolic': [systolic],
        'BP_Diastolic': [diastolic]
    }
    df = pd.DataFrame(data)
    
    # Encode categorical features safely
    for col, le in encoders.items():
        try:
            df[col] = le.transform(df[col])
        except ValueError:
            print(f"Warning: '{df[col][0]}' not recognized for {col}, using default value 0.")
            df[col] = 0
    
    return df

# ---------------------------
# Main project function
# ---------------------------
def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "sleep_health_data.csv")
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return
    
    # Load and preprocess data
    df = pd.read_csv(data_path)
    X, y, encoders = preprocess_data(df)
    
    # Model initialization
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    
    # Cross-validation for reliable accuracy
    scores = cross_val_score(clf, X, y, cv=5)
    print(f"5-Fold CV Accuracy: {scores.mean()*100:.1f}% ± {scores.std()*100:.1f}%")
    
    # Train model on full data
    clf.fit(X, y)
    print("Model trained and ready for predictions!")
    
    # Interactive loop
    while True:
        try:
            user_df = get_user_input(encoders)
            prediction = clf.predict(user_df)[0]
            print("\n==========================================")
            print(f"CALCULATED STRESS LEVEL: {prediction}/10")
            print("==========================================")
            
            cont = input("\nTest another person? (yes/no): ").strip().lower()
            if cont not in ['yes', 'y']:
                print("Exiting Stress Tester. Stay healthy!")
                break
        except KeyboardInterrupt:
            print("\nExiting Stress Tester. Goodbye!")
            break
        except Exception as e:
            print(f"An error occurred: {e}")

# ---------------------------
if __name__ == "__main__":
    main()
