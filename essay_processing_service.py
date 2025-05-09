import os

# Set NLTK data path to your custom location
os.environ["NLTK_DATA"] = "/home/vboxuser/Justreadin/Hackathon/Team-Hackathons/Admitguardian/backend/venv/nltk_data/"

# Ensure the necessary NLTK directory exists
NLTK_DATA_PATH = '/home/vboxuser/Justreadin/Hackathon/Team-Hackathons/Admitguardian/backend/venv/nltk_data/'
os.makedirs(NLTK_DATA_PATH, exist_ok=True)

# Add the path to the NLTK data search path
import nltk
nltk.data.path.append(NLTK_DATA_PATH)

# Download punkt_tab manually if it's not already present
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    print("punkt_tab resource not found. Downloading it...")
    nltk.download('punkt', download_dir=NLTK_DATA_PATH)  # Ensure 'punkt' is properly downloaded
    nltk.download('punkt_tab', download_dir=NLTK_DATA_PATH)  # Download 'punkt_tab' files

# Check if the relevant subcomponent is available
try:
    nltk.data.find("tokenizers/punkt_tab/english/")
except LookupError:
    print("Missing tokenizers/punkt_tab/english. Downloading...")
    nltk.download("punkt_tab", download_dir=NLTK_DATA_PATH)

# Ensure required resources like stopwords are available
required_nltk_resources = ['stopwords']

for resource in required_nltk_resources:
    try:
        nltk.data.find(f'corpora/{resource}')
    except LookupError:
        print(f"{resource} not found. Downloading it...")
        nltk.download(resource, download_dir=NLTK_DATA_PATH)

# Imports after NLTK setup
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer
from transformers import pipeline

# Load the summarizer from Hugging Face
summarizer = pipeline("summarization")

# Preprocess essay text function
def preprocess_essay(essay_text: str):
    try:
        # 1. Tokenization & Stopwords Removal
        stop_words = set(stopwords.words('english'))
        words = word_tokenize(essay_text)
        filtered_words = [word for word in words if word.lower() not in stop_words]

        # 2. Keyword Extraction using TF-IDF
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([essay_text])
        feature_names = vectorizer.get_feature_names_out()
        keywords = [feature_names[i] for i in tfidf_matrix.sum(axis=0).argsort()[::-1][:5]]

        # 3. Summarization using Hugging Face model
        summary_output = summarizer(essay_text, max_length=100, min_length=30, do_sample=False)
        summary_text = summary_output[0]['summary_text'] if summary_output and isinstance(summary_output, list) and 'summary_text' in summary_output[0] else "No summary generated"

        # 4. Lemmatization (Stemming) using Porter Stemmer
        ps = PorterStemmer()
        lemmatized_words = [ps.stem(word) for word in filtered_words]

        return {
            "filtered_words": filtered_words,
            "keywords": keywords,
            "summary": summary_text,
            "lemmatized_words": lemmatized_words
        }

    except Exception as e:
        return {"error": f"An error occurred during essay preprocessing: {str(e)}"}

# Test the tokenization and download process
print(word_tokenize("Hello, world!"))
