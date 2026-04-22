const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');
const { connectDB } = require('./config/db');

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/od',      require('./routes/odRoutes'));
app.use('/api/admin',   require('./routes/adminRoutes'));
app.use('/api/advisor', require('./routes/advisorRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'OD Permission Management System API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
