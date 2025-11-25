
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const { parseNote, analyzeNotes } = require('./gemini');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit for images

// --- NOTES ROUTES ---

// GET all notes
app.get('/api/notes', (req, res) => {
  const stmt = db.prepare('SELECT * FROM notes');
  const notes = stmt.all().map(note => ({
    ...note,
    tags: JSON.parse(note.tags),
    hasSchedule: !!note.hasSchedule,
    isDone: !!note.isDone
  }));
  res.json(notes);
});

// POST create note
app.post('/api/notes', (req, res) => {
  const note = req.body;
  const stmt = db.prepare(`
    INSERT INTO notes (id, content, rawContent, tags, createdAt, hasSchedule, scheduleDate, imageUrl, isDone)
    VALUES (@id, @content, @rawContent, @tags, @createdAt, @hasSchedule, @scheduleDate, @imageUrl, @isDone)
  `);
  
  stmt.run({
    ...note,
    tags: JSON.stringify(note.tags),
    hasSchedule: note.hasSchedule ? 1 : 0,
    isDone: note.isDone ? 1 : 0
  });
  res.json({ success: true });
});

// PUT update note
app.put('/api/notes/:id', (req, res) => {
  const note = req.body;
  const stmt = db.prepare(`
    UPDATE notes SET 
      content = @content,
      tags = @tags,
      hasSchedule = @hasSchedule,
      scheduleDate = @scheduleDate,
      imageUrl = @imageUrl,
      isDone = @isDone
    WHERE id = @id
  `);

  stmt.run({
    ...note,
    id: req.params.id,
    tags: JSON.stringify(note.tags),
    hasSchedule: note.hasSchedule ? 1 : 0,
    isDone: note.isDone ? 1 : 0
  });
  res.json({ success: true });
});

// DELETE note
app.delete('/api/notes/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

// --- AI ROUTES ---

app.post('/api/ai/parse', async (req, res) => {
  try {
    const { text, existingNotes, timezone } = req.body;
    const result = await parseNote(text, existingNotes, timezone);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'AI Parse Failed' });
  }
});

app.post('/api/ai/analyze', async (req, res) => {
  try {
    const { notesSummary } = req.body;
    const result = await analyzeNotes(notesSummary);
    res.json({ text: result });
  } catch (error) {
    res.status(500).json({ error: 'Analysis Failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
