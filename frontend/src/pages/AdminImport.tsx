import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

export default function AdminImport() {
  const [step, setStep] = useState(1);
  const [importType, setImportType] = useState('students');
  const [file, setFile] = useState<File | null>(null);
  const [session, setSession] = useState('2024/2025');
  const [dryRunResults, setDryRunResults] = useState<any>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [jobId, setJobId] = useState('');
  const [reportUrl, setReportUrl] = useState('');

  const types = [
    { id: 'programmes', label: '1. Programmes & Departments' },
    { id: 'staff', label: '2. Staff' },
    { id: 'students', label: '3. Students' },
    { id: 'results', label: '4. Results' },
    { id: 'payments', label: '5. Payments' },
    { id: 'hostel-allocations', label: '6. Hostel Allocations' },
    { id: 'scratch-cards', label: '7. Scratch Cards' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDryRun = async () => {
    if (!file) return;
    setStatus('Running Dry-Run...');
    
    // In a real implementation, we would upload the file to a backend endpoint that performs the dry-run.
    // For this demonstration/scaffold, we mock the dry run response.
    setTimeout(() => {
      setDryRunResults({
        total: 1500,
        valid: 1480,
        errors: [
          { row: 14, field: 'matric_no', message: 'Unrecognisable matric format: XYZ123' },
          { row: 89, field: 'ca_score', message: 'INVALID_CA_SCORE' }
        ],
        skippedProtected: 18,
      });
      setStep(4);
      setStatus('');
    }, 1500);
  };

  const handleLiveImport = async () => {
    setStatus('Initializing Live Import...');
    const newJobId = `job-${Date.now()}`;
    setJobId(newJobId);
    setStep(5);

    // Start listening to SSE
    const eventSource = new EventSource(`/api/admin/import/progress/${newJobId}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'connected') {
        setStatus('Importing...');
      } else {
        setProgress(data.progress);
        if (data.status === 'completed') {
          setStatus('Completed Successfully!');
          setReportUrl('https://coels-crms.s3.amazonaws.com/reports/imports/mock_report.pdf');
          eventSource.close();
        }
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      setStatus('Error during import.');
      eventSource.close();
    };
  };

  const hasErrors = dryRunResults && dryRunResults.errors.length > 0;
  const canConfirm = !hasErrors || overrideReason.length > 10;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Migration System</h1>
        <p className="text-gray-500">Securely ingest legacy records into COELS CRMS.</p>
      </div>

      {/* STEPPER */}
      <div className="flex items-center justify-between mb-8">
        {['Select Type', 'Upload File', 'Dry Run', 'Review', 'Confirm'].map((label, i) => (
          <div key={label} className={`flex items-center ${i + 1 === step ? 'text-blue-600 font-bold' : i + 1 < step ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${i + 1 === step ? 'border-blue-600' : i + 1 < step ? 'border-green-600' : 'border-gray-400'}`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            {label}
            {i < 4 && <div className="w-16 h-px bg-gray-300 mx-4"></div>}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 1: Select Import Type</h2>
              <div className="grid grid-cols-2 gap-4">
                {types.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setImportType(t.id)}
                    className={`p-4 text-left rounded-xl border-2 transition-all ${importType === t.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setStep(2)}>Next: Upload File</Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 2: Upload Source File</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
                <input type="file" accept=".csv, .xlsx" onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
                  {file ? file.name : 'Choose CSV / XLSX File'}
                </label>
                <p className="mt-4 text-gray-500 text-sm">Supported formats: .csv, .xlsx</p>
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} disabled={!file}>Next: Session Info</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Step 3: Run Validation (Dry Run)</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Target Academic Session</label>
                <input
                  type="text"
                  value={session}
                  onChange={e => setSession(e.target.value)}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <Alert>
                <AlertTitle>Zero-Write Guarantee</AlertTitle>
                <AlertDescription>
                  The Dry Run will parse the entire file and run all database lookups and validations without writing any data to the database.
                </AlertDescription>
              </Alert>
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleDryRun} disabled={!!status}>
                  {status ? status : 'Execute Dry Run'}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && dryRunResults && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Step 4: Review Validation Results</h2>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border text-center">
                  <div className="text-sm text-gray-500">Total Rows</div>
                  <div className="text-2xl font-bold">{dryRunResults.total}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border text-center">
                  <div className="text-sm text-gray-500">Valid</div>
                  <div className="text-2xl font-bold text-green-700">{dryRunResults.valid}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border text-center">
                  <div className="text-sm text-gray-500">Errors</div>
                  <div className="text-2xl font-bold text-red-700">{dryRunResults.errors.length}</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border text-center">
                  <div className="text-sm text-gray-500">Skipped (Protected)</div>
                  <div className="text-2xl font-bold text-yellow-700">{dryRunResults.skippedProtected}</div>
                </div>
              </div>

              {hasErrors && (
                <div className="border border-red-200 rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-4 py-2 font-semibold text-red-800 border-b border-red-200">
                    Validation Errors ({dryRunResults.errors.length})
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 border-b">Row</th>
                          <th className="px-4 py-2 border-b">Field</th>
                          <th className="px-4 py-2 border-b">Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dryRunResults.errors.map((e: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="px-4 py-2">{e.row}</td>
                            <td className="px-4 py-2 font-mono text-xs">{e.field}</td>
                            <td className="px-4 py-2 text-red-600">{e.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {hasErrors && (
                <div className="mt-4 p-4 border border-orange-300 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Super Admin Override</h3>
                  <p className="text-sm text-orange-700 mb-3">You have errors. To force import the valid rows, you must provide a reason for the Audit Log.</p>
                  <input
                    type="text"
                    placeholder="Reason for overriding validation errors..."
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    className="w-full border-orange-300 rounded-md p-2"
                  />
                </div>
              )}

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setStep(3)}>Run Again</Button>
                <Button onClick={handleLiveImport} disabled={!canConfirm} className={canConfirm && hasErrors ? 'bg-orange-600 hover:bg-orange-700' : ''}>
                  {hasErrors ? 'Force Live Import (Valid Rows Only)' : 'Start Live Import'}
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center py-10">
              <h2 className="text-2xl font-bold">{status}</h2>
              
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                <div 
                  className={`h-4 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-600' : 'bg-blue-600'}`} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-gray-500 font-mono text-sm">Job ID: {jobId} | Progress: {progress}%</p>

              {progress === 100 && (
                <div className="mt-8 flex justify-center space-x-4">
                  <Button variant="outline" onClick={() => window.location.reload()}>Start New Import</Button>
                  {reportUrl && (
                    <Button onClick={() => window.open(reportUrl, '_blank')} className="bg-green-600 hover:bg-green-700">
                      Download PDF Report
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
