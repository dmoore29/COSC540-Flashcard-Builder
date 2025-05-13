import { useState } from 'react';
import ProfNav from '../components/profnav';
import Sidebar from '../components/sidebar';
import { useRouter } from 'next/router';

export default function UploadFile() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          selectedFile.type === 'application/msword') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF or Word document');
        setFile(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Sending file to server...');
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const response = await fetch('/api/process-file', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || 'Failed to process file');
      }

      const data = await response.json();
      console.log('Server response:', data);

      setSuccess('File processed successfully! Your flashcards have been created.');
      // Redirect to the new deck after a short delay
      setTimeout(() => {
        router.push(`/flashcards/${data.deckId}`);
      }, 2000);
    } catch (err) {
      console.error('Error during file upload:', err);
      setError(err.message || 'An error occurred while processing the file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <ProfNav />
        <main className="p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Upload File to Create Flashcards</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-gray-600">
                    {file ? (
                      <p className="text-green-600">{file.name}</p>
                    ) : (
                      <>
                        <p>Drag and drop your file here, or click to select</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Supported formats: PDF, DOC, DOCX
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>

              {error && (
                <div className="text-red-500 text-sm p-4 bg-red-50 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-green-500 text-sm p-4 bg-green-50 rounded-md">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className={`w-full py-2 px-4 rounded-md text-white ${
                  loading || !file
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : 'Create Flashcards'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
} 