'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { api } from '@/lib/api';
import { Button } from '@/components/ui';
import { Mic, Square, Loader2, X, Send, Edit3, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onCancel: () => void;
  isDisabled?: boolean;
}

type VoiceRecorderState = 'idle' | 'recording' | 'transcribing' | 'preview';

export function VoiceRecorder({ onTranscriptionComplete, onCancel, isDisabled }: VoiceRecorderProps) {
  const {
    isRecording,
    recordingState,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
    error: recordingError,
  } = useAudioRecorder();

  const [state, setState] = useState<VoiceRecorderState>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    setError(null);
    setState('recording');
    await startRecording();
  };

  const handleStopRecording = async () => {
    stopRecording();
    setState('transcribing');

    // Wait a bit for the blob to be ready
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  // Handle transcription when audioBlob is available
  const handleTranscribe = useCallback(async (blob: Blob) => {
    setError(null);

    try {
      const response = await api.transcribeAudio(blob);

      if (response.success && response.data) {
        setTranscribedText(response.data.text);
        setState('preview');
      } else {
        setError(response.detail || response.error || 'Transcription failed');
        setState('idle');
        resetRecording();
      }
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio');
      setState('idle');
      resetRecording();
    }
  }, [resetRecording]);

  // Trigger transcription when recording stops and blob is ready
  useEffect(() => {
    if (state === 'transcribing' && audioBlob && recordingState === 'stopped') {
      handleTranscribe(audioBlob);
    }
  }, [state, audioBlob, recordingState, handleTranscribe]);

  const handleSend = () => {
    if (transcribedText.trim()) {
      onTranscriptionComplete(transcribedText.trim());
      handleReset();
    }
  };

  const handleReset = () => {
    setState('idle');
    setTranscribedText('');
    setIsEditing(false);
    setError(null);
    resetRecording();
  };

  const handleCancel = () => {
    handleReset();
    onCancel();
  };

  const displayError = error || recordingError;

  return (
    <div className="w-full">
      {/* Error Display */}
      {displayError && (
        <div className="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-300">{displayError}</p>
          <button onClick={handleReset} className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Idle State - Show record button */}
      {state === 'idle' && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleStartRecording}
            disabled={isDisabled}
            className="flex items-center gap-2"
          >
            <Mic className="h-4 w-4" />
            Start Recording
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Click to start recording your voice message
          </p>
        </div>
      )}

      {/* Recording State */}
      {state === 'recording' && isRecording && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Recording indicator */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-600 dark:text-red-400">Recording</span>
            </div>

            {/* Timer */}
            <span className="text-lg font-mono text-gray-700 dark:text-gray-300">
              {formatTime(recordingTime)}
            </span>

            {/* Waveform animation */}
            <div className="flex items-center gap-0.5 h-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                    minHeight: '4px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Stop button */}
          <Button
            onClick={handleStopRecording}
            variant="danger"
            className="flex items-center gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>

          {/* Cancel button */}
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Transcribing State */}
      {state === 'transcribing' && (
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Transcribing your voice message...
          </span>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Preview State - Editable transcription */}
      {state === 'preview' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Transcription Preview
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" />
                {isEditing ? 'Done' : 'Edit'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Re-record
              </Button>
            </div>
          </div>

          {/* Editable text area */}
          <div className="relative">
            {isEditing ? (
              <textarea
                value={transcribedText}
                onChange={(e) => setTranscribedText(e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-xl border transition-all resize-none',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-white',
                  'border-blue-300 dark:border-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none',
                  'min-h-[80px]'
                )}
                autoFocus
              />
            ) : (
              <div
                className={cn(
                  'px-4 py-3 rounded-xl border',
                  'bg-gray-50 dark:bg-gray-800/50',
                  'text-gray-900 dark:text-white',
                  'border-gray-200 dark:border-gray-700',
                  'min-h-[60px]'
                )}
              >
                {transcribedText}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleSend}
              disabled={!transcribedText.trim()}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Message
            </Button>
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
