import { NextRequest, NextResponse } from "next/server"
import { findUserByUsername, verifyPassword, signToken, toPublicUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const user = findUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

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
