// src/app/api/login/route.ts
import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/user'; 
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const JWT_SECRET = process.env.JWT_SECRET as string;

  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Please provide both email and password' }, { status: 400 });
    }

    // Find the user by email, explicitly selecting the password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 }); // 401 Unauthorized
    }

    // Compare the provided password with the stored hashed password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const payload = {
      id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expiration time can be adjusted
    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Create a session or JWT here (we'll implement this in a later step)
    // For now, let's just return basic user info
    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          username: user.username,
          fullname: user.fullname,
          email: user.email,
          isVerified: user.isVerified,// Do not include password or sensitive information here
        },
        token: token,
      },
      { status: 200 }
    ); // 200 OK

  } catch (error: any) {
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Something went wrong during login' }, { status: 500 });
  }
}