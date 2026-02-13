
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Simulação de Banco de Dados Local (Arquivo JSON)
// Em produção na Hostinger, você poderia usar SQLite aqui facilmente
const DB_PATH = path.join(__dirname, 'database.json');

const initDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({
      users: [],
      habits: [],
      habitLogs: [],
      tasks: [],
      finance: [],
      workouts: [],
      water: [],
      diary: [],
      xpLogs: []
    }, null, 2));
  }
};

const getDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

initDB();

// Middleware de Autenticação Simples
const auth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ message: 'Não autorizado' });
  req.userId = userId;
  next();
};

// Rotas da API
app.post('/api/auth/register', (req, res) => {
  const { name, email, pin } = req.body;
  const db = getDB();
  if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'E-mail já cadastrado' });

  const newUser = {
    id: Math.random().toString(36).substr(2, 9),
    name, email, xp: 0, level: 1, streak: 0, 
    lastActive: new Date().toISOString(),
    unlockedFeatures: [],
    diaryPinHash: pin // Em real, usar bcrypt aqui
  };
  db.users.push(newUser);
  saveDB(db);
  res.json(newUser);
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  const db = getDB();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  res.json(user);
});

app.get('/api/user/profile', auth, (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id === req.userId);
  res.json(user);
});

app.get('/api/habits', auth, (req, res) => {
  const db = getDB();
  const habits = db.habits.filter(h => h.userId === req.userId);
  const logs = db.habitLogs.filter(l => l.userId === req.userId);
  res.json({ habits, logs });
});

app.post('/api/habits', auth, (req, res) => {
  const db = getDB();
  const newHabit = { id: Math.random().toString(36).substr(2, 9), userId: req.userId, ...req.body, createdAt: new Date().toISOString() };
  db.habits.push(newHabit);
  saveDB(db);
  res.json(newHabit);
});

// Outras rotas seriam implementadas seguindo o mesmo padrão de filtro por userId...

// Servir os arquivos estáticos do React (Build)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => console.log(`Life RPG Server running on port ${PORT}`));
