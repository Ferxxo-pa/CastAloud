import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useVoiceRecording from "@/hooks/useVoiceRecording";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Cast } from "@shared/schema";

interface VoiceInterfaceProps {
  cast: Cast;
  onClose: () => void;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'review' | 'success' | 'error';

export default function VoiceInterface({ cast, onClose }: VoiceInterfaceProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcription, setTranscription] = useState('');
  const [generatedComment, setGeneratedComment] = useState('');
  const [voiceCommentId, setVoiceCommentId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const { startRecording, stopRecording, isRecording } = useVoiceRecording();

  const processVoiceMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('castHash', cast.hash);
      formData.append('castContent', cast.content);

      const response = await fetch('/api/voice/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process voice');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setTranscription(data.transcription);
      setGeneratedComment(data.generatedComment);
      setVoiceCommentId(data.id);
      setState('review');
    },
    onError: (error) => {
      console.error('Error processing voice:', error);
      setErrorMessage(error.message || 'Failed to process voice recording');
      setState('error');
    },
  });

  const postCommentMutation = useMutation({
    mutationFn: async (comment: string) => {
      if (!voiceCommentId) throw new Error('No voice comment ID');
      const response = await apiRequest('POST', `/api/voice/post/${voiceCommentId}`, { comment });
      return response.json();
    },
    onSuccess: () => {
      setState('success');
    },
    onError: (error) => {
      console.error('Error posting comment:', error);
      setErrorMessage(error.message || 'Failed to post comment');
      setState('error');
    },
  });

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording().then((audioBlob) => {
        if (audioBlob) {
          setState('processing');
          processVoiceMutation.mutate(audioBlob);
        }
      });
    } else {
      setState('recording');
      startRecording();
    }
  };

  const handleSubmitReply = () => {
    postCommentMutation.mutate(generatedComment);
  };

  const handleRecordAgain = () => {
    setState('idle');
    setTranscription('');
    setGeneratedComment('');
    setVoiceCommentId(null);
    setErrorMessage('');
  };

  const handleTryAgain = () => {
    setState('idle');
    setErrorMessage('');
  };

  const renderStateContent = () => {
    switch (state) {
      case 'idle':
      case 'recording':
        return (
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-20 h-20 ${isRecording ? 'bg-fc-error' : 'bg-fc-error'} text-white rounded-full flex items-center justify-center text-3xl ${isRecording ? 'recording-pulse' : ''}`}>
                <i className="fas fa-microphone" aria-hidden="true"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-fc-gray-900 mb-2">Record Your Reply</h3>
                <p className="text-fc-gray-600">
                  {isRecording ? 'Recording... Tap to stop' : 'Tap the microphone to start recording'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleToggleRecording}
                className={`w-full ${isRecording ? 'bg-fc-gray-600 hover:bg-gray-700' : 'bg-fc-error hover:bg-red-600'} text-white font-medium py-4 px-6 rounded-xl h-auto border-0`}
              >
                <span className="text-lg">
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </span>
              </Button>
              
              <Button
                onClick={onClose}
                variant="secondary"
                className="w-full bg-fc-gray-500 hover:bg-fc-gray-600 text-white font-medium py-3 px-6 rounded-xl h-auto border-0"
              >
                Cancel
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-warning text-white rounded-full flex items-center justify-center">
                <i className="fas fa-spinner spin text-3xl" aria-hidden="true"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Processing Your Voice</h3>
                <p className="text-text-secondary">Converting speech to text and generating reply...</p>
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Review Your Reply</h3>
              <p className="text-text-secondary">AI generated this from your voice. Edit if needed.</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <Textarea
                value={generatedComment}
                onChange={(e) => setGeneratedComment(e.target.value)}
                className="w-full bg-transparent border-none resize-none focus:outline-none text-text-primary text-lg leading-relaxed min-h-[100px]"
                placeholder="Your generated reply will appear here..."
              />
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSubmitReply}
                disabled={postCommentMutation.isPending}
                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-4 px-6 rounded-xl h-auto"
              >
                <span className="text-lg">
                  {postCommentMutation.isPending ? 'Posting...' : 'Post Reply'}
                </span>
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleRecordAgain}
                  className="flex-1 bg-warning hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-xl h-auto"
                >
                  Record Again
                </Button>
                <Button
                  onClick={onClose}
                  variant="secondary"
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl h-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-success text-white rounded-full flex items-center justify-center">
                <i className="fas fa-check text-3xl" aria-hidden="true"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Reply Posted!</h3>
                <p className="text-text-secondary">Your voice reply has been successfully posted to Farcaster.</p>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-4 px-6 rounded-xl h-auto"
            >
              <span className="text-lg">Continue</span>
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-error text-white rounded-full flex items-center justify-center">
                <i className="fas fa-exclamation-triangle text-3xl" aria-hidden="true"></i>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">Something Went Wrong</h3>
                <p className="text-text-secondary">
                  {errorMessage || 'We couldn\'t process your voice recording. Please try again.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleTryAgain}
                className="w-full bg-warning hover:bg-orange-600 text-white font-medium py-4 px-6 rounded-xl h-auto"
              >
                <span className="text-lg">Try Again</span>
              </Button>
              <Button
                onClick={onClose}
                variant="secondary"
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl h-auto"
              >
                Cancel
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-fc-gray-200 p-6">
      {renderStateContent()}
    </div>
  );
}
