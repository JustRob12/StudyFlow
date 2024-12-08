export const SUBJECT_ICONS = {
  'Mathematics': '📐',
  'Science': '🔬',
  'Literature': '📚',
  'History': '🏛️',
  'Language': '💭',
  'Art': '🎨',
  'Music': '🎵',
  'Physical Education': '⚽',
  'Computer Science': '💻',
  'Biology': '🧬',
  'Chemistry': '⚗️',
  'Physics': '⚛️',
  'Geography': '🌍',
  'Economics': '📊',
  'Psychology': '🧠',
  'Engineering': '⚙️',
  'Default': '📚'
};

export const getSubjectIcon = (subject) => {
  return SUBJECT_ICONS[subject] || SUBJECT_ICONS['Default'];
}; 