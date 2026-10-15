# AI Spam Detector Web App

## Put these files in your existing Spam Detection folder

Copy:
- app.py
- templates/index.html
- static/style.css
- static/script.js

Your existing `spam_model.joblib` must be in the same folder as `app.py`.

## Install Flask

```bash
pip install flask
```

## Run

```bash
python app.py
```

Then open:

http://127.0.0.1:5000

The frontend sends the entered email to the existing trained model and displays its real spam probability.
