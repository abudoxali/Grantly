import { redirect } from 'next/navigation';

export default function UnlocalizedAboutPage() {
  redirect('/en/about');
}
