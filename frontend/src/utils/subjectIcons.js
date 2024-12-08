// Map of subject names to their corresponding emoji icons
export const SUBJECT_ICONS = {
  'Mathematics': '📐',
  'Physics': '⚛️',
  'Chemistry': '🧪',
  'Biology': '🧬',
  'Computer Science': '💻',
  'Literature': '📚',
  'History': '📜',
  'Geography': '🌍',
  'Languages': '🗣️',
  'Art': '🎨',
  'Music': '🎵',
  'Physical Education': '⚽',
  'Economics': '📊',
  'Business': '💼',
  'Psychology': '🧠',
  'Philosophy': '🤔',
  'Engineering': '⚙️',
  'Medicine': '⚕️',
  'Law': '⚖️',
  'Other': '📝'
};

// Get icon for a specific subject
export const getSubjectIcon = (subject) => {
  return SUBJECT_ICONS[subject] || '📝';
};

// Get all available subject options
export const getSubjectOptions = () => {
  return Object.keys(SUBJECT_ICONS);
};
