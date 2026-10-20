import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'hdss-dev-secret';
const token = (user) =>
  jwt.sign({ id: user._id, name: user.name, role: user.role, email: user.email }, getJwtSecret(), {
    expiresIn: '8h',
  });

export async function register(req, res) {
  const { name, email, password, role = 'Doctor' } = req.body;

  if (await User.findOne({ email })) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
  });

  return res.status(201).json({
    token: token(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    token: token(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
}

