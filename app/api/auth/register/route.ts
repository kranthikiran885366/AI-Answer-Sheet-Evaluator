import { NextRequest, NextResponse } from "next/server"
import { findUserByUsername, findUserByEmail, createUser, signToken, toPublicUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, role, name, institution } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (findUserByUsername(username)) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    if (findUserByEmail(email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    const validRoles = ["admin", "teacher", "student"]
    const userRole = validRoles.includes(role) ? role : "student"

    const user = createUser({ username, email, password, role: userRole, name, institution })
    const publicUser = toPublicUser(user)
    const token = signToken(publicUser)

    return NextResponse.json({
      success: true,
      access_token: token,
      user: publicUser,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
