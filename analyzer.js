import crypto from 'crypto';

function analyzeString(str) {
  const sha256_hash = crypto.createHash('sha256').update(str).digest('hex');
  const length = str.length;

  const lowerCaseStr = str.toLowerCase();
  const reversedStr = lowerCaseStr.split('').reverse().join('');
  const is_palindrome = lowerCaseStr === reversedStr;

  const words = str.trim().split(/\s+/).filter(Boolean);
  const word_count = words.length === 1 && words[0] === '' ? 0 : words.length;

  const unique_characters = new Set(str).size;

  const character_frequency_map = {};
  for (const char of str) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

export default analyzeString;