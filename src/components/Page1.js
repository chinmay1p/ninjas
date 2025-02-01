import React, { useState, useRef } from 'react';
import './p1.css';
import './p2.css';

export default function Page1() {
  const [fileName, setFileName] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [selectedTableType, setSelectedTableType] = useState(""); // "consolidated" or "standalone"
  const [selectedDateIndex, setSelectedDateIndex] = useState(1); // default to first date column (index 1)
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    // Get the file from the file input
    const file = fileInputRef.current.files[0];
    if (!file) {
      console.error("No file selected!");
      return;
    }
  
    // Create a FormData object and append the file
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      // Send a POST request to the backend's /upload endpoint
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
  
      // Parse the JSON response from the backend
      const data = await response.json();
      console.log("Server response:", data);
      setResponseData(data);
      
      // Set default table type: if consolidated exists, use it; else standalone
      if (data.tables) {
        if (data.tables.consolidated) {
          setSelectedTableType("consolidated");
        } else if (data.tables.standalone) {
          setSelectedTableType("standalone");
        }
      }
  
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const renderMetricTable = (tableData) => {
    if (!tableData || tableData.length === 0) return null;
  
    // The header row is assumed to be at index 0.
    const headerRow = tableData[0];
  
    // Validate the selectedDateIndex is within range.
    if (selectedDateIndex < 1 || selectedDateIndex >= headerRow.length) return null;
  
    // Define the fixed row indices to display (skipping header at index 0).
    const rowIndices = [1, 2, 3, 8, 10];
  
    // Map the specified indices to the corresponding rows, filtering out any missing rows.
    const rows = rowIndices
      .map((idx) => tableData[idx])
      .filter((row) => row !== undefined);
  
    // Build the table rows.
    return (
      <table className="metric-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>
              Metric (in cr)
            </th>
            <th style={{ padding: '8px', textAlign: 'left', border: '1px solid #ddd' }}>
              {headerRow[selectedDateIndex]}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row[0]}</td>
              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{row[selectedDateIndex]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  
  

  // Function to render the select dropdown for date columns.
  const renderDateSelect = (tableData) => {
    if (!tableData || tableData.length === 0) return null;
    const headerRow = tableData[0];
    // Skip the first element (usually empty)
    return (
      <select
        value={selectedDateIndex}
        onChange={(e) => setSelectedDateIndex(Number(e.target.value))}
        style={{ padding: '8px', margin: '10px 0', borderRadius: '4px' }}
      >
        {headerRow.slice(1).map((date, index) => (
          <option key={index} value={index + 1}>
            {date}
          </option>
        ))}
      </select>
    );
  };

  // Function to render table type select if both are available.
  const renderTableTypeSelect = () => {
    if (!responseData || !responseData.tables) return null;
    const types = [];
    if (responseData.tables.consolidated) types.push("consolidated");
    if (responseData.tables.standalone) types.push("standalone");

    if (types.length <= 1) return null; // no need to select if only one type

    return (
      <select
        value={selectedTableType}
        onChange={(e) => { setSelectedTableType(e.target.value); setSelectedDateIndex(1); }}
        style={{ padding: '8px', margin: '10px 0', borderRadius: '4px' }}
      >
        {types.map((type) => (
          <option key={type} value={type}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </option>
        ))}
      </select>
    );
  };

  // Get the currently selected table data (if available)
  const currentTableData =
    responseData && responseData.tables && responseData.tables[selectedTableType]
      ? responseData.tables[selectedTableType]
      : null;

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
              disabled={!fileName}
              className="submit-button"
            >
              <span>Analyze Report</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="output-container">
        <div className='output'>
          <div className="output-header">
            <h2>Financial Analysis</h2>
            {responseData && responseData.company_name && (
              <p>Company: {responseData.company_name} (BSE Code: {responseData.bse_code})</p>
            )}
          </div>

          {/* Only render table UI if valid table data exists */}
          {responseData && responseData.tables ? (
            <>
              {renderTableTypeSelect()}
              {renderDateSelect(currentTableData)}
              <div style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                {renderMetricTable(currentTableData)}
              </div>
            </>
          ) : (
            <p style={{ marginTop: '20px' }}>Invalid PDF or no table data available.</p>
          )}
        </div>
        <div className="loader"></div>
      </div>
    </>
  );
}
