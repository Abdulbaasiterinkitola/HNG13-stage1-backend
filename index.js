import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import analyzeString from './analyzer.js';

const app = express();

app.use(cors());
app.use(express.json());

const analyzedStrings = new Map();

function parseNaturalLanguageQuery(query) {
    const filters = {};
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('palindromic')) {
        filters.is_palindrome = true;
    }
    if (lowerQuery.includes('single word')) {
        filters.word_count = 1;
    }
    const lengthMatch = lowerQuery.match(/longer than (\d+)/);
    if (lengthMatch && lengthMatch[1]) {
        filters.min_length = parseInt(lengthMatch[1], 10) + 1;
    }
    const containsMatch = lowerQuery.match(/containing the letter ([a-z])/);
    if (containsMatch && containsMatch[1]) {
        filters.contains_character = containsMatch[1];
    }
    if (lowerQuery.includes('first vowel')) {
        filters.contains_character = 'a';
    }
    return filters;
}

app.post('/strings', (req, res) => {
    const { value } = req.body;
    if (!value) {
        return res.status(400).json({ error: 'Missing "value" field in request body' });
    }
    if (typeof value !== 'string') {
        return res.status(422).json({ error: 'Invalid data type for "value", must be a string' });
    }
    if (analyzedStrings.has(value)) {
        return res.status(409).json({ error: 'String already exists in the system' });
    }
    const properties = analyzeString(value);
    const result = {
        id: properties.sha256_hash,
        value: value,
        properties: properties,
        created_at: new Date().toISOString(),
    };
    analyzedStrings.set(value, result);
    return res.status(201).json(result);
});

app.get('/strings/:string_value', (req, res) => {
    const { string_value } = req.params;
    if (!analyzedStrings.has(string_value)) {
        return res.status(404).json({ error: 'String does not exist in the system' });
    }
    return res.status(200).json(analyzedStrings.get(string_value));
});

app.get('/strings', (req, res) => {
    let results = Array.from(analyzedStrings.values());
    const filters_applied = {};

    if (req.query.is_palindrome) {
        const isPalindrome = req.query.is_palindrome === 'true';
        results = results.filter(s => s.properties.is_palindrome === isPalindrome);
        filters_applied.is_palindrome = isPalindrome;
    }
    if (req.query.min_length) {
        const minLength = parseInt(req.query.min_length, 10);
        results = results.filter(s => s.properties.length >= minLength);
        filters_applied.min_length = minLength;
    }
    if (req.query.max_length) {
        const maxLength = parseInt(req.query.max_length, 10);
        results = results.filter(s => s.properties.length <= maxLength);
        filters_applied.max_length = maxLength;
    }
    if (req.query.word_count) {
        const wordCount = parseInt(req.query.word_count, 10);
        results = results.filter(s => s.properties.word_count === wordCount);
        filters_applied.word_count = wordCount;
    }
    if (req.query.contains_character) {
        const char = req.query.contains_character;
        results = results.filter(s => s.value.includes(char));
        filters_applied.contains_character = char;
    }
    return res.status(200).json({
        data: results,
        count: results.length,
        filters_applied: filters_applied,
    });
});

app.get('/strings/filter-by-natural-language', (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Missing "query" parameter' });
    }
    const parsedFilters = parseNaturalLanguageQuery(query);
    if (Object.keys(parsedFilters).length === 0) {
        return res.status(400).json({ error: 'Unable to parse natural language query' });
    }
    let results = Array.from(analyzedStrings.values());
    if (parsedFilters.is_palindrome !== undefined) {
        results = results.filter(s => s.properties.is_palindrome === parsedFilters.is_palindrome);
    }
    if (parsedFilters.word_count !== undefined) {
        results = results.filter(s => s.properties.word_count === parsedFilters.word_count);
    }
    if (parsedFilters.min_length !== undefined) {
        results = results.filter(s => s.properties.length >= parsedFilters.min_length);
    }
    if (parsedFilters.contains_character !== undefined) {
        results = results.filter(s => s.value.includes(parsedFilters.contains_character));
    }
    return res.status(200).json({
        data: results,
        count: results.length,
        interpreted_query: {
            original: query,
            parsed_filters: parsedFilters,
        },
    });
});

app.delete('/strings/:string_value', (req, res) => {
    const { string_value } = req.params;
    if (!analyzedStrings.has(string_value)) {
        return res.status(404).json({ error: 'String does not exist in the system' });
    }
    analyzedStrings.delete(string_value);
    return res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});