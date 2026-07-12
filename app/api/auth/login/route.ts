import { NextRequest, NextResponse } from "next/server"
import { findUserByUsername, verifyPassword, signToken, toPublicUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      )
    }

    // Find user
    const user = findUserByUsername(username)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Verify password
    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Generate token
    const publicUser = toPublicUser(user)
    const token = signToken(publicUser)

    return NextResponse.json({
      success: true,
      access_token: token,
      user: publicUser,
      message: "Login successful",
    })
  } catch (err: any) {
    console.error("Login error:", err)
    return NextResponse.json(
      { error: err.message || "Login failed" },
      { status: 500 }
    )
  }
}
