import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { reportService } from '../services/reportService';

const reportTypes = [
  { value: '', label: 'All Types' },
  { value: 'Deposit', label: 'Deposit' },
  { value: 'Withdrawal', label: 'Withdrawal' },
  { value: 'Commission', label: 'Commission' },
];

function exportToCSV(data, filename) {
  const csvRows = [];
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));
  for (const row of data) {
    csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  }
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function exportToPDF(data, filters) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.text('Collection Management System', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Admin Report', pageWidth / 2, 28, { align: 'center' });

  // Filter info
  doc.setFontSize(10);
  let filterText = `Type: ${filters.type || 'All'} | Start: ${filters.startDate || '-'} | End: ${filters.endDate || '-'}`;
  doc.text(filterText, 14, 38);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);

  // Table
  doc.autoTable({
    startY: 50,
    head: [['ID', 'Type', 'Date', 'User', 'Amount']],
    body: data.map(r => [r.id, r.type, r.date, r.user, r.amount]),
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 3 },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
    }
  });

  doc.save('report.pdf');
}

const Reports = () => {
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
  });
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await reportService.getReports(filters);
      setReports(response.data);
    } catch (error) {
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic (client-side fallback)
  const filteredReports = reports.filter(r => {
    const matchesType = !filters.type || r.type === filters.type;
    const matchesStart = !filters.startDate || r.date >= filters.startDate;
    const matchesEnd = !filters.endDate || r.date <= filters.endDate;
    return matchesType && matchesStart && matchesEnd;
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDownloadCSV = () => {
    if (filteredReports.length === 0) return;
    exportToCSV(filteredReports, 'report.csv');
  };

  const handleDownloadPDF = () => {
    if (filteredReports.length === 0) return;
    exportToPDF(filteredReports, filters);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Reports</h1>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="row align-items-end">
                <div className="col-md-3">
                  <label className="form-label mb-0">Type</label>
                  <select
                    className="form-select"
                    name="type"
                    value={filters.type}
                    onChange={handleChange}
                  >
                    {reportTypes.map(rt => (
                      <option key={rt.value} value={rt.value}>{rt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label mb-0">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label mb-0">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 text-end">
                  <button
                    className="btn btn-primary me-2"
                    onClick={handleDownloadCSV}
                    disabled={filteredReports.length === 0}
                  >
                    <i className="fas fa-file-csv me-2"></i>
                    Download CSV
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDownloadPDF}
                    disabled={filteredReports.length === 0}
                  >
                    <i className="fas fa-file-pdf me-2"></i>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>User</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No reports found
                          </td>
                        </tr>
                      ) : (
                        filteredReports.map((r) => (
                          <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.type}</td>
                            <td>{r.date}</td>
                            <td>{r.user}</td>
                            <td>{r.amount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
