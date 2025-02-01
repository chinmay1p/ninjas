import json
import re
import requests
import pdfplumber
from bs4 import BeautifulSoup
import google.generativeai as genai

genai.configure(api_key="AIzaSyCbYL0-nLv8c7090Yqy7FUOtzbULB3Ch0w")
GOOGLE_API_KEY = "AIzaSyAYT3n1wmg2dQzbxxKsbsiVX-iaMg3XOLE"
GOOGLE_CSE_ID = "e1ac3ba241d674191"

def extract_company_name_from_pdf(pdf_path, pages=2):
    """Extracts the company name from a PDF using Gemini API."""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page_num in range(min(pages, len(pdf.pages))):
            text += pdf.pages[page_num].extract_text() + "\n"

    prompt = f"""
    Extract the name of the company from the following financial report.
    If the company name is not available, return "Company Name Not Available".
    Only return the company name or "Company Name Not Available".

    Report Content:
    {text}
    """

    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text.strip() if response.text else "Company Name Not Available"
    except Exception as e:
        return f"Error: {e}"

def search_bse_code_from_web(company_name):
    """Searches the web for the BSE code of the company."""
    if company_name == "Company Name Not Available":
        return "Not Available"

    query = f"{company_name} BSE code OR Security code OR Stock code"
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={GOOGLE_API_KEY}&cx={GOOGLE_CSE_ID}"
    response = requests.get(url)

    if response.status_code == 200:
        search_results = response.json()
        print(search_results)
        for item in search_results.get("items", []):
            link = item.get("link", "")
            if "https://www.bseindia.com/stock-share-price" in link:
                match = re.search(r"/(\d{6})/?$", link)
                if match:
                    return match.group(1) 
    return "Not Available"

def search_bse_code_from_web2(company_name):
    """Searches the web for the BSE code of the company."""
    if company_name == "Company Name Not Available":
        return "Not Available"

    query = f"{company_name} BSE code OR Security code OR Stock code official bseindia website"
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={GOOGLE_API_KEY}&cx={GOOGLE_CSE_ID}"
    response = requests.get(url)

    if response.status_code == 200:
        search_results = response.json()
        print(search_results)
        for item in search_results.get("items", []):
            link = item.get("link", "")
            print(link)
            title = item.get("title", "").lower()
            snippet = item.get("snippet", "").lower()
            if "https://www.bseindia.com/stock-share-price" in link:
                match = re.search(r"/(\d{6})/?$", link)
                if match:
                    return match.group(1) 
    return "Not Available"

def search_bse_code_from_web3(company_name):
    """Searches the web for the BSE code of the company."""
    if company_name == "Company Name Not Available":
        return "Not Available"

    query = f"{company_name} stock share price screener.in"
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={GOOGLE_API_KEY}&cx={GOOGLE_CSE_ID}"
    response = requests.get(url)

    if response.status_code == 200:
        search_results = response.json()
        print(search_results)
        for item in search_results.get("items", []):
            link = item.get("link", "")
            print(link)
            title = item.get("title", "").lower()
            snippet = item.get("snippet", "").lower()
            if "https://www.bseindia.com/stock-share-price" in link:
                match = re.search(r"/(\d{6})/?$", link)
                if match:
                    return match.group(1) 
            if "https://money.rediff.com/companies/news/" in link:
                match = re.search(r"/(\d{6})-\d+", link)
                if match:
                    return match.group(1) 
            if "https://www.screener.in/company/" in link:
                match = re.search(r"/(\d{6})/?$", link)
                if match:
                    return match.group(1) 
    return "Not Available"

def extract_text_from_pdf(pdf_path, pages=2):
    """Extracts text from a PDF file."""
    text = ""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page_num in range(min(pages, len(pdf.pages))):
                text += pdf.pages[page_num].extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error extracting text from PDF: {e}"

def detect_report_types(text):
    """
    Detects if the PDF contains consolidated, standalone, or both types of tables.
    Returns a list of detected report types.
    """
    prompt = f"""
    Analyze the following financial report and determine if it contains:
    - Consolidated tables
    - Standalone tables
    - Both consolidated and standalone tables

    Only return one of the following:
    - "Consolidated"
    - "Standalone"
    - "Both"
    - "Not Available"

    Report Content:
    {text}
    """
    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        report_type = response.text.strip() if response.text else "Not Available"
        print(report_type)
        return report_type
    except Exception as e:
        return f"Error detecting report types: {e}"

def scrape_screener_quarterly_report_table(company_name, report_type):
    """
    Scrapes the entire quarterly report table from Screener.in for a given company.

    Args:
        company_name (str): Company name for Screener.in URL (e.g., 'tcs').
        report_type (str): Type of report to scrape ('consolidated' or 'standalone').

    Returns:
        list of lists or None: A 2D list representing the quarterly report table,
                               or None if data extraction fails. The first list is the header row.
    """
    company_name_url_safe = company_name.lower().replace(" ", "-")
    url = ""
    if report_type == "consolidated":
        url = f"https://www.screener.in/company/{company_name_url_safe}/consolidated/"
    else:
        url = f"https://www.screener.in/company/{company_name_url_safe}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        quarterly_results_table = soup.find('section', id='quarters').find('table')

        if not quarterly_results_table:
            print(f"Quarterly results table not found on the page for {report_type} report.")
            return None

        headers = [th.text.strip() for th in quarterly_results_table.thead.find_all('th')]
        data_rows = quarterly_results_table.tbody.find_all('tr')

        full_table_data = [headers]

        for row in data_rows:
            row_data = [td.text.strip() for td in row.find_all('td')]
            full_table_data.append(row_data)

        return full_table_data

    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        return None
    except AttributeError as e:
        print(f"Error parsing HTML structure: {e} - Website structure might have changed.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def display_table(table_data, title):
    """Displays the table data in a formatted way."""
    if not table_data:
        print(f"No data available for {title}.")
        return

    print(f"\n{title}")

    header_row = table_data[0]
    separator = "-" * (sum(len(h) + 4 for h in header_row) + len(header_row) - 1)
    print(separator)
    print("| " + " | ".join(header_row) + " |")
    print(separator)

    for row in table_data[1:]:
        print("| " + " | ".join(row) + " |")
    print(separator)

def process_pdf_and_return_tables(pdf_path):
    """
    Processes a PDF file and returns the quarterly report tables.

    Args:
        pdf_path (str): Path to the uploaded PDF file.

    Returns:
        dict: A dictionary containing the company name, BSE code, and tables.
              Example:
              {
                  "company_name": "Company Name",
                  "bse_code": "123456",
                  "tables": {
                      "consolidated": [...],
                      "standalone": [...]
                  }
              }
    """
    company_name = extract_company_name_from_pdf(pdf_path)
    if company_name.startswith("Error"):
        return {"error": company_name}

    bse_code = search_bse_code_from_web(company_name)
    if bse_code == "Not Available":
        bse_code = search_bse_code_from_web2(company_name)
    if bse_code == "Not Available":
        bse_code = search_bse_code_from_web3(company_name)

    pdf_text = extract_text_from_pdf(pdf_path)
    if pdf_text.startswith("Error"):
        return {"error": pdf_text}
    
    report_type = detect_report_types(pdf_text)
    if report_type.startswith("Error"):
        return {"error": report_type}

    tables = {}
    if report_type.lower() == "both":
        consolidated_table = scrape_screener_quarterly_report_table(bse_code, "consolidated")
        standalone_table = scrape_screener_quarterly_report_table(bse_code, "standalone")

        if consolidated_table:
            tables["consolidated"] = consolidated_table
        if standalone_table:
            tables["standalone"] = standalone_table

    elif report_type.lower() in ["consolidated", "standalone"]:
        table_data = scrape_screener_quarterly_report_table(bse_code, report_type.lower())
        if table_data:
            tables[report_type.lower()] = table_data

    return {
        "company_name": company_name,
        "bse_code": bse_code,
        "tables": tables
    }

if __name__ == "_main_":
    pdf_path = "/content/8094e692-68c8-41d7-b689-319554b07830.pdf"

    result = process_pdf_and_return_tables(pdf_path)

    print(json.dumps(result, indent=4))


from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile

app = Flask(__name__)
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No pdf file provided'}), 400

    pdf_file = request.files['file']
    if pdf_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        pdf_path = tmp.name
        pdf_file.save(pdf_path)

    result = process_pdf_and_return_tables(pdf_path)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
