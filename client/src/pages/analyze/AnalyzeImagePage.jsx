import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../../api/axios';
import { Image as ImageIcon, UploadCloud, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AgentProgress from '../../components/AgentProgress';

export default function AnalyzeImagePage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles) => {
    const selected = acceptedFiles[0];
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        toast.error('File size must be under 5MB');
        return;
      }
      setFile(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
  });

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setStep(1);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const progressTimer1 = setTimeout(() => setStep(2), 2500); 
      const progressTimer2 = setTimeout(() => setStep(3), 6000); 

      const res = await api.post('/analyze/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      
      setStep(4);
      toast.success('Analysis complete');
      
      setTimeout(() => {
        navigate(`/reports/${res.data.reportId}`);
      }, 1000);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Analysis failed');
      setAnalyzing(false);
      setStep(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-tl-text">Analyze Image/Screenshot</h1>
        <p className="text-tl-muted text-sm mt-1">Upload a screenshot of a news article, tweet, or WhatsApp message for OCR and deep analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 flex flex-col">
          {!preview ? (
            <div 
              {...getRootProps()} 
              className={`flex-1 min-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors duration-200
                ${isDragActive ? 'border-emerald-400 bg-emerald-400/5' : 'border-tl-border hover:border-tl-accent/50 hover:bg-tl-surface'}`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-tl-surface flex items-center justify-center mb-4">
                <UploadCloud size={32} className={isDragActive ? 'text-emerald-400' : 'text-tl-muted'} />
              </div>
              <h3 className="text-lg font-medium mb-2">Drag & drop your screenshot</h3>
              <p className="text-sm text-tl-muted max-w-[250px]">
                Support for JPG, PNG, WEBP up to 5MB. We'll extract the text using OCR automatically.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="relative flex-1 rounded-xl overflow-hidden bg-tl-surface border border-tl-border flex items-center justify-center p-2">
                <img src={preview} alt="Upload preview" className="max-h-[300px] max-w-full object-contain rounded" />
                {!analyzing && (
                  <button 
                    onClick={removeFile}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 rounded-lg text-white transition-colors backdrop-blur"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <button 
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-primary w-full h-12 text-lg flex justify-center items-center gap-2 mt-4"
              >
                {analyzing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Extracting & Analyzing...
                  </>
                ) : (
                  <>
                    <ImageIcon size={20} />
                    Analyze Image
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {analyzing ? (
            <div className="animate-slide-up h-full">
              <AgentProgress currentStep={step} completed={step === 4} />
            </div>
          ) : (
            <div className="card p-6 h-full flex flex-col justify-center text-center text-tl-muted">
              <div className="w-16 h-16 rounded-full bg-tl-surface flex items-center justify-center mx-auto mb-4 border border-tl-border">
                <ImageIcon size={24} className="text-emerald-400 opacity-50" />
              </div>
              <p className="text-sm">
                Our OCR agent extracts text from images, bypassing image-based misinformation tactics often used on social media platforms.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
