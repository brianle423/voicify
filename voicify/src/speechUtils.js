// speechUtils.js
const synth = window.speechSynthesis;

/**
 * Get a voice by name or language
 * @param {string} name - Name to search for (partial match)
 * @returns {SpeechSynthesisVoice|null} - Voice object or null if not found
 */
const getVoiceByName = (name) => {
  const voices = synth.getVoices();
  if (voices.length === 0) return null;
  
  // Try to find by name (case insensitive partial match)
  const voice = voices.find(voice => 
    voice.name.toLowerCase().includes(name.toLowerCase())
  );
  
  return voice || voices[0]; // Return found voice or first available
};

/**
 * Speak text using speech synthesis
 * @param {string} text - Text to speak
 * @param {Object} options - Speech options
 * @param {boolean} options.asPhrase - If true, treat as a complete phrase instead of individual characters
 */
const speak = (text, options = {}) => {
  if (synth.speaking) {
    synth.cancel(); // Stop any current speech
  }

  if (!text) return;

  const utterance = new SpeechSynthesisUtterance(text);
  
  // If a voice name is provided, try to find it
  if (typeof options.voice === 'string') {
    utterance.voice = getVoiceByName(options.voice);
  }
  
  utterance.lang = options.lang || 'en-US';
  utterance.rate = options.rate || 1;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  // Only apply special character pronunciations for single characters
  // and when not explicitly treating as a phrase
  if (text.length === 1 && !options.asPhrase) {
    const pronunciationMap = {
      'A': 'ay',
      'B': 'bee',
      'C': 'see',
      'D': 'dee',
      'E': 'ee',
      'F': 'ef',
      'G': 'gee',
      'H': 'aitch',
      'I': 'eye',
      'J': 'jay',
      'K': 'kay',
      'L': 'el',
      'M': 'em',
      'N': 'en',
      'O': 'oh',
      'P': 'pee',
      'Q': 'queue',
      'R': 'ar',
      'S': 'ess',
      'T': 'tee',
      'U': 'you',
      'V': 'vee',
      'W': 'double-you',
      'X': 'ex',
      'Y': 'why',
      'Z': 'zee',
      ' ': 'space',
    };
    
    if (pronunciationMap[text.toUpperCase()]) {
      utterance.text = pronunciationMap[text.toUpperCase()];
    }
  }

  try {
    console.log(`Speaking: "${utterance.text}" with voice: ${utterance.voice?.name || 'default'}`);
    synth.speak(utterance);
  } catch (error) {
    console.error('Error speaking text:', error);
  }
};

/**
 * Get all available speech voices
 * @returns {Array} - Array of voice objects
 */
const getVoices = () => {
  return synth.getVoices();
};

// Export as an object with methods
const speechUtils = {
  speak,
  getVoices,
  getVoiceByName
};

export default speechUtils;