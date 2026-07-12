import { NextRequest, NextResponse } from "next/server"
import { findUserByUsername, findUserByEmail, createUser, signToken, toPublicUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, role, name, institution } = await req.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      )
    }

    // Check for existing users
    if (findUserByUsername(username)) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      )
    }

    if (findUserByEmail(email)) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Validate role
    const validRoles = ["admin", "teacher", "student"]
    const userRole = (validRoles.includes(role) ? role : "student") as "admin" | "teacher" | "student"

    // Create user
    const user = createUser({
      username,
      email,
      password,
      role: userRole,
      name,
      institution,
    })

    const publicUser = toPublicUser(user)
    const token = signToken(publicUser)

    return NextResponse.json(
      {
        success: true,
        access_token: token,
        user: publicUser,
        message: "User registered successfully",
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error("Registration error:", err)
    return NextResponse.json(
      { error: err.message || "Registration failed" },
      { status: 500 }
    )
  }
}
