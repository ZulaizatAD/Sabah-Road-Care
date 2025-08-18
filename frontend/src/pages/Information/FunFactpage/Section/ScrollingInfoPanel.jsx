const ScrollingInfoPanel = ({ facts, onClose }) => {
  const [audio, setAudio] = useState(null);

  const playAudio = (audioUrl) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    // const newAudio = new Audio(audioUrl);
    // newAudio.play();
    // setAudio(newAudio);
    console.log(`Attempting to play audio: ${audioUrl}`);
  };

  return (
    <div className="scrolling-info-panel-overlay">
      <div className="scrolling-info-panel">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <div className="scrolling-content">
          {facts.map((fact) => (
            <div key={fact.id} className="fact-item">
              <button className="play-button" onClick={() => playAudio(fact.audio)}>
                ▶
              </button>
              <p className="fact-text">{fact.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};