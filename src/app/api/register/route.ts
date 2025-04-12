// src/app/api/register/route.ts
import { NextResponse, NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/user'; // Import the User model defined with your schema

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { username, fullname, email, password, confirmPassword, phoneNumber, country, referralID } = await req.json();

    // Server-side validation for required fields (aligning with schema)
    if (!username || !fullname || !email || !password || !confirmPassword || !country) {
      return new NextResponse('Please fill in all required fields', { status: 400 });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Check if the username or email already exists (case-insensitive as per schema)
    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
      if (existingUser.username === username.toLowerCase()) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }
    }

    // Create a new user (password will be hashed by the middleware)
    const newUser = new User({
      username,
      fullname,
      email,
      password,
      phoneNumber,
      country,
      referralID: referralID ? referralID.toUpperCase() : undefined,
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: savedUser._id,
          username: savedUser.username,
          fullname: savedUser.fullname,
          email: savedUser.email,
          isVerified: savedUser.isVerified,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration failed:', error);
    if (error?.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return new NextResponse(JSON.stringify({ message: 'Registration failed due to validation errors', errors }), { status: 400 });
    }
    let errorMessage = 'Something went wrong during registration';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new NextResponse(JSON.stringify({ message: errorMessage }), { status: 500 });
  }
}