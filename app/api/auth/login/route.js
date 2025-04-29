import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the request body
    const { email, password } = await request.json();
    
    // For demo/testing purposes - replace with your real authentication
    const validCredentials = [
      { email: "user@example.com", password: "password123", name: "Test User" },
      { email: "admin@example.com", password: "admin123", name: "Admin User" },
    ];
    
    // Find user with matching email and password
    const user = validCredentials.find(
      cred => cred.email === email && cred.password === password
    );
    
    if (user) {
      // Successfully authenticated
      return NextResponse.json({
        success: true,
        user: {
          id: Math.random().toString(36).substring(2),
          name: user.name,
          email: user.email
        },
        token: "demo-jwt-token-" + Math.random().toString(36).substring(2)
      });
    }
    
    // Invalid credentials
    return NextResponse.json(
      { message: "Invalid email or password. Please check your credentials." },
      { status: 401 }
    );
    
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}