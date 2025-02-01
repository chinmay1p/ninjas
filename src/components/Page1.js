import React, { useState, useRef } from 'react';
import './p1.css';
import './p2.css';

export default function Page1() {
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
      setError(null);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    if (!fileInputRef.current.files[0]) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);

    try {
      const response = await fetch('https://ninjas-tp.onrender.com/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        // mode: 'no-cors',
      });

      if (response.status === 0) {
        throw new Error('Network error - CORS issue or server unreachable. Please check your network connection or contact support.');
      }

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('File too large. Please upload a smaller file.');
        } else if (response.status === 415) {
          throw new Error('Invalid file type. Please upload a PDF file.');
        } else {
          throw new Error(`Server error (${response.status}): ${response.statusText || 'Unknown error'}`);
        }
      }

      let data;
      try {
        const responseText = await response.text();
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Response text:', responseText);
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        throw new Error(`Failed to parse server response: ${error.message}`);
      }

      if (!data || !data.tables || !data.tables.standalone || !data.tables.consolidated) {
        throw new Error('Invalid data format received from server');
      }

      setFinancialData(data);
    } catch (error) {
      console.error('Error details:', error);
      setError(error.message || 'Failed to upload file. Please try again.');
      setFinancialData(null);
    } finally {
      setLoading(false);
    }
  };

  const getLastValue = (arr) => {
    if (!Array.isArray(arr)) return "N/A";
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] && arr[i] !== "") return arr[i];
    }
    return "N/A";
  };

  const calculateGrowth = (current, previous) => {
    if (!current || !previous || isNaN(current) || isNaN(previous) || previous === 0) return 0;
    const curr = parseFloat(current.toString().replace(/,/g, ''));
    const prev = parseFloat(previous.toString().replace(/,/g, ''));
    return ((curr - prev) / Math.abs(prev) * 100).toFixed(1);
  };

  const getPreviousValue = (arr) => {
    if (!Array.isArray(arr)) return null;
    let lastValueIndex = -1;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] && arr[i] !== "") {
        lastValueIndex = i;
        break;
      }
    }
    return lastValueIndex > 0 ? arr[lastValueIndex - 1] : null;
  };

  return (
    <>
      <div className="upload-container">
        <div className="upload-wrapper">
          <div className="upload-description">
            <h1>Smart Analysis,<br />Smarter Decisions</h1>
            <p>Upload your financial report and unlock deep insights instantly. Transform raw numbers into strategic intelligence.</p>
          </div>

          <div className="upload-section">
            <div 
              onClick={handleFileSelect} 
              className="file-drop-zone"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".pdf"
                className="file-input" 
                onChange={handleFileChange} 
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className="upload-icon"
              >
                <path d="M21.2 15.2l-1.4 1.4c-.4.4-1 .4-1.4 0L8 7.4V12h-2V4h8v2h-4.6l8.8 8.8c.4.4.4 1 0 1.4zM3 3l18 18m-9-5v4h4v-4h-4z" />
                <path d="M14 4v6.88l4 4"/>
              </svg>
              <p className="text-gray-300">
                {fileName ? fileName : "Click to upload PDF report"}
              </p>
            </div>
            
            <button 
              onClick={handleSubmit}
              disabled={!fileName || loading}
              className="submit-button"
            >
              <span>{loading ? "Analyzing..." : "Analyze Report"}</span>
            </button>

            {error && (
              <div className="error-message" style={{
                color: 'red',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: '#fff',
                border: '1px solid #ffcdd2',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="output-container">
        <div className='output'>
          <div className="output-header">
            <h2>Financial Analysis</h2>
            <p>Comprehensive overview of financial performance</p>
          </div>
          
          <div className="output-grid">
            {/* Standalone Data Card */}
            <div className="data-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 21H3V3h18v18z"/>
                    <path d="M7 14l3-3 4 4 3-3"/>
                  </svg>
                </div>
                <h3 className="card-title">Standalone Data</h3>
              </div>
              
              <div className="metric-grid">
                <div className="metric-item">
                  <div className="metric-label">Revenue</div>
                  <div className="metric-value">
                    <span>
                      {financialData?.tables?.standalone[1] ? 
                        getLastValue(financialData.tables.standalone[1].slice(1)) : "N/A"}
                    </span>
                    {financialData?.tables?.standalone[1] && (
                      <span className={`trend-indicator ${calculateGrowth(
                        getLastValue(financialData.tables.standalone[1].slice(1)),
                        getPreviousValue(financialData.tables.standalone[1].slice(1))
                      ) >= 0 ? 'positive' : 'negative'}`}>
                        {calculateGrowth(
                          getLastValue(financialData.tables.standalone[1].slice(1)),
                          getPreviousValue(financialData.tables.standalone[1].slice(1))
                        )}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Operating Profit</div>
                  <div className="metric-value">
                    <span>
                      {financialData?.tables?.standalone[3] ? 
                        getLastValue(financialData.tables.standalone[3].slice(1)) : "N/A"}
                    </span>
                    {financialData?.tables?.standalone[3] && (
                      <span className={`trend-indicator ${calculateGrowth(
                        getLastValue(financialData.tables.standalone[3].slice(1)),
                        getPreviousValue(financialData.tables.standalone[3].slice(1))
                      ) >= 0 ? 'positive' : 'negative'}`}>
                        {calculateGrowth(
                          getLastValue(financialData.tables.standalone[3].slice(1)),
                          getPreviousValue(financialData.tables.standalone[3].slice(1))
                        )}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Net Profit</div>
                  <div className="metric-value">
                    <span>
                      {financialData?.tables?.standalone[10] ? 
                        getLastValue(financialData.tables.standalone[10].slice(1)) : "N/A"}
                    </span>
                    {financialData?.tables?.standalone[10] && (
                      <span className={`trend-indicator ${calculateGrowth(
                        getLastValue(financialData.tables.standalone[10].slice(1)),
                        getPreviousValue(financialData.tables.standalone[10].slice(1))
                      ) >= 0 ? 'positive' : 'negative'}`}>
                        {calculateGrowth(
                          getLastValue(financialData.tables.standalone[10].slice(1)),
                          getPreviousValue(financialData.tables.standalone[10].slice(1))
                        )}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Consolidated Data Card */}
            <div className="data-card">
              <div className="card-header">
                <div className="card-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 12V7H3v10h18v-5z"/>
                    <path d="M3 7l9-4 9 4"/>
                  </svg>
                </div>
                <h3 className="card-title">Consolidated Data</h3>
              </div>
              
              <div className="metric-grid">
                <div className="metric-item">
                  <div className="metric-label">Revenue</div>
                  <div className="metric-value">
                    <span>
                      {financialData?.tables?.consolidated[1] ? 
                        getLastValue(financialData.tables.consolidated[1].slice(1)) : "N/A"}
                    </span>
                    {financialData?.tables?.consolidated[1] && (
                      <span className={`trend-indicator ${calculateGrowth(
                        getLastValue(financialData.tables.consolidated[1].slice(1)),
                        getPreviousValue(financialData.tables.consolidated[1].slice(1))
                      ) >= 0 ? 'positive' : 'negative'}`}>
                        {calculateGrowth(
                          getLastValue(financialData.tables.consolidated[1].slice(1)),
                          getPreviousValue(financialData.tables.consolidated[1].slice(1))
                        )}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Operating Profit</div>
                  <div className="metric-value">
                    <span>
                      {financialData?.tables?.consolidated[3] ? 
                        getLastValue(financialData.tables.consolidated[3].slice(1)) : "N/A"}
                    </span>
                    {financialData?.tables?.consolidated[3] && (
                      <span className={`trend-indicator ${calculateGrowth(
                        getLastValue(financialData.tables.consolidated[3].slice(1)),
                        getPreviousValue(financialData.tables.consolidated[3].slice(1))
                      ) >= 0 ? 'positive' : 'negative'}`}>
                        {calculateGrowth(
                          getLastValue(financialData.tables.consolidated[3].slice(1)),
                          getPreviousValue(financialData.tables.consolidated[3].slice(1))
                        )}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="metric-item">
                  <div className="metric-label">Net Profit</div>
                  <div className="metric-value">
                    <span>
                      {financialData?.tables?.consolidated[10] ? 
                        getLastValue(financialData.tables.consolidated[10].slice(1)) : "N/A"}
                    </span>
                    {financialData?.tables?.consolidated[10] && (
                      <span className={`trend-indicator ${calculateGrowth(
                        getLastValue(financialData.tables.consolidated[10].slice(1)),
                        getPreviousValue(financialData.tables.consolidated[10].slice(1))
                      ) >= 0 ? 'positive' : 'negative'}`}>
                        {calculateGrowth(
                          getLastValue(financialData.tables.consolidated[10].slice(1)),
                          getPreviousValue(financialData.tables.consolidated[10].slice(1))
                        )}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && <div className="loader"></div>}
      </div>
    </>
  );
}