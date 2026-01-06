import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to prompts page - the dashboard layout will handle auth checks
  redirect('/prompts');
}
