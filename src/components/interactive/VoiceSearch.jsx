import { useState, useCallback, memo } from "react";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const VoiceSearch = memo(function VoiceSearch({ onSearch }) {
  const [listening, setListening] = useState(false);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      onSearch(transcript);
    };
    recognition.start();
  }, [onSearch]);

  if (!SpeechRecognition) return null;

  return (
    <button className={`btn btn-icon voice-btn${listening ? " listening" : ""}`} onClick={startListening} title="Voice search" aria-label="Search by voice">
      {listening ? "🎙️" : "🎤"}
      {listening && <div className="listening-indicator">Listening...</div>}
    </button>
  );
});

export default VoiceSearch;
