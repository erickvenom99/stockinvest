// src/app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Button } from "@/components/ui/button";

const JWT_SECRET = process.env.JWT_SECRET as string;

async function getUserInfo(token: string): Promise<JwtPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed on server:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const cookieStore =  await Promise.resolve(cookies());
  const authToken = cookieStore.get('authToken')?.value;

  if (!authToken) {
    redirect('/auth/login');
  }

  const userInfo = await getUserInfo(authToken);

  if (!userInfo) {
    redirect('/auth/login');
  }

  // If the JWT is valid, you can now access user information from 'userInfo'
  console.log('Dashboard accessed by user:', userInfo);

  return (
    <div>
      {/* Your dashboard content here */}
      <Button variant="outline">Clickme</Button>
    </div>
  );
}