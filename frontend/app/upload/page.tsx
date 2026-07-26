"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FileUp, FileText, CheckCircle2, ArrowRight } from "lucide-react";

export default function UploadResumePage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Simulate File Upload
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      startUpload();
    }
  };

  const startUpload = () => {
    setIsUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => router.push("/analysis"), 1000);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Upload your Resume
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground"
          >
            Our AI will analyze your experience and tailor the mentorship to you.
          </motion.p>
        </div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`relative group border-2 border-dashed rounded-3xl p-12 transition-all duration-500 ease-out flex flex-col items-center justify-center
            ${isDragging ? "border-primary bg-primary/5" : "border-white/10 bg-[#111111]/50 hover:border-white/20"}
            ${isUploading ? "pointer-events-none" : "cursor-pointer"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && startUpload()} // Simulated click upload
        >
          {/* Subtle Glow on hover/drag */}
          <div className={`absolute inset-0 rounded-3xl bg-primary/20 blur-[100px] transition-opacity duration-500 ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-30"}`} />

          <AnimatePresence mode="wait">
            {!isUploading ? (
              <motion.div
                key="upload-prompt"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center text-center relative z-10"
              >
                <div className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <FileUp className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Drag & drop your PDF here
                </h3>
                <p className="text-muted-foreground mb-6">
                  or click to browse from your computer
                </p>
                <span className="text-xs font-medium text-white/40 bg-white/5 px-3 py-1 rounded-full">
                  PDF format only, up to 10MB
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="upload-progress"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center relative z-10"
              >
                <div className="relative mb-8">
                  {progress < 100 ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-20 w-20 rounded-full border-2 border-primary/20 border-t-primary"
                    />
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-10 w-10 text-success" />
                    </motion.div>
                  )}
                  {progress < 100 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-white/50" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">
                  {progress < 100 ? "Uploading your resume..." : "Upload Complete!"}
                </h3>
                
                <div className="w-full max-w-md bg-white/5 rounded-full h-2 mt-6 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-purple-500"
                    style={{ width: `${progress}%` }}
                    layout
                  />
                </div>
                <div className="mt-3 text-sm font-medium text-muted-foreground">
                  {progress}%
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex items-center justify-center"
        >
          <button 
            onClick={() => router.push("/profile-builder")}
            className="flex items-center text-muted-foreground hover:text-white transition-colors duration-300 font-medium group"
          >
            <span>Or continue manually without a resume</span>
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
