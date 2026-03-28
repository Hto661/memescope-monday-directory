import { NextResponse } from 'next/server';
import { loginUser, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await loginUser(email, password);
    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, username: user.username },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
