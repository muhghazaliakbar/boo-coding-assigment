'use strict';

const MBTI_OPTIONS = [
  'INFP', 'INFJ', 'ENFP', 'ENFJ', 'INTJ', 'INTP', 'ENTP', 'ENTJ',
  'ISFP', 'ISFJ', 'ESFP', 'ESFJ', 'ISTP', 'ISTJ', 'ESTP', 'ESTJ',
];

const ENNEAGRAM_OPTIONS = [
  '1w2', '2w3', '3w2', '3w4', '4w3', '4w5', '5w4', '5w6',
  '6w5', '6w7', '7w6', '7w8', '8w7', '8w9', '9w8', '9w1',
];

const ZODIAC_OPTIONS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

function isValidOption(value, options) {
  return value == null || value === '' || options.includes(value);
}

const isValidMbti = (value) => isValidOption(value, MBTI_OPTIONS);
const isValidEnneagram = (value) => isValidOption(value, ENNEAGRAM_OPTIONS);
const isValidZodiac = (value) => isValidOption(value, ZODIAC_OPTIONS);

module.exports = {
  MBTI_OPTIONS,
  ENNEAGRAM_OPTIONS,
  ZODIAC_OPTIONS,
  isValidMbti,
  isValidEnneagram,
  isValidZodiac,
};
