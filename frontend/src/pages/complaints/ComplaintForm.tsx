import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { Camera, MapPin, FileText, ArrowRight, Info, AlertTriangle, Mic, MicOff, Upload, X, Loader2 } from 'lucide-react';

export const ComplaintForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasVoice, setHasVoice] = useState(false);

  const handleJoin = async () => {
    try {
      setIsLoading(true);
      await api.post(`/complaints/${duplicateWarning?.duplicateOfId}/join`);
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to join complaint');
      setIsLoading(false);
    }
  };
  
  // File Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string, name: string, size: number, type: string } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setDuplicateWarning(null);
      
      const payload = { 
        ...data, 
        hasVoice, 
        hasFile: !!uploadedFile,
        mediaUrl: uploadedFile?.url
      };
      
      const res = await api.post('/complaints', payload);
      if (res.data.success) {
         navigate('/app/complaints/success');
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setDuplicateWarning(err.response.data);
      } else {
        alert(err.response?.data?.message || 'Error submitting complaint');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 10MB.");
      return;
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only JPG, PNG, and PDF are allowed.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data.success) {
        setUploadedFile({
          url: res.data.data.url,
          name: res.data.data.fileName,
          size: res.data.data.size,
          type: file.type
        });
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setUploadError(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Register New Complaint</h1>
        <p className="text-gray-500">Provide details about the issue. Our AI will automatically categorize and route it to the correct department.</p>
      </div>

      {duplicateWarning && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3 text-yellow-800">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-semibold">Possible Duplicate Detected</h4>
            <p className="text-sm mt-1">{duplicateWarning.message}</p>
            <button 
              type="button"
              onClick={handleJoin}
              className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
            >
              Join Existing Complaint
            </button>
            <button 
              type="button" 
              onClick={() => setDuplicateWarning(null)} 
              className="mt-3 ml-3 text-sm font-medium text-yellow-700 hover:underline"
            >
              Ignore and submit anyway
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-8 space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Complaint Title</label>
          <input 
            type="text" 
            {...register("title", { required: "Title is required" })}
            className="input-field"
            placeholder="E.g. Broken water pipe leaking on main road"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
          <textarea 
            {...register("description", { required: "Description is required" })}
            className="input-field min-h-[120px] py-3"
            placeholder="Provide as much detail as possible about the issue, how long it has been occurring, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                {...register("district")}
                className="input-field pl-10"
                placeholder="District Name"
              />
            </div>
          </div>

          {/* Location details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address / Landmark</label>
            <input 
              type="text" 
              {...register("address")}
              className="input-field"
              placeholder="Near Central Park..."
            />
          </div>
        </div>

        {/* Uploads & Voice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evidence (Images/PDF)</label>
            
            {!uploadedFile && !isUploading && (
              <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer block">
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">Click to attach file</p>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".jpg,.jpeg,.png,.pdf" 
                  onChange={handleFileSelect}
                />
              </label>
            )}

            {isUploading && (
              <div className="border-2 border-dashed border-primary-300 bg-primary-50 rounded-xl p-6 text-center flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin mb-2" />
                <p className="text-sm font-medium text-primary-600">Uploading...</p>
              </div>
            )}

            {uploadedFile && (
              <div className="border-2 border-primary-500 bg-primary-50 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-3">
                  {uploadedFile.type.includes('image') ? (
                    <img src={`http://localhost:5000${uploadedFile.url}`} alt="Thumbnail" className="w-12 h-12 rounded object-cover border border-primary-200" />
                  ) : (
                    <div className="w-12 h-12 rounded bg-primary-100 text-primary-500 flex items-center justify-center border border-primary-200">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={removeFile}
                  className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {uploadError && <p className="text-xs text-red-500 mt-2 font-medium">{uploadError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Voice Note</label>
            <div 
              onClick={() => {
                if (isRecording) {
                  setIsRecording(false);
                  setHasVoice(true);
                } else {
                  setIsRecording(true);
                  setHasVoice(false);
                }
              }}
              className={`border-2 rounded-xl p-6 text-center transition-colors cursor-pointer flex flex-col items-center justify-center h-full ${
                isRecording ? 'border-red-500 bg-red-50' : 
                hasVoice ? 'border-green-500 bg-green-50' : 
                'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {isRecording ? <MicOff className="w-6 h-6 text-red-500 mb-2 animate-pulse" /> : <Mic className={`w-6 h-6 mb-2 ${hasVoice ? 'text-green-500' : 'text-gray-400'}`} />}
              <p className="text-sm font-medium text-gray-600">
                {isRecording ? 'Recording... Click to stop' : hasVoice ? 'Voice Note Saved' : 'Tap to Record Voice'}
              </p>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="bg-primary-50 rounded-lg p-4 flex gap-3 text-primary-800 text-sm">
          <Info className="w-5 h-5 shrink-0" />
          <p>By submitting this form, you authorize our AI system to analyze the content and route it to the appropriate government official automatically.</p>
        </div>

        <button 
          type="submit" 
          disabled={isLoading || duplicateWarning !== null}
          className="w-full btn-primary flex justify-center items-center gap-2 py-4 disabled:opacity-70 disabled:cursor-not-allowed group text-lg"
        >
          {isLoading ? 'Processing via AI...' : (
            <>
              Submit Complaint
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
