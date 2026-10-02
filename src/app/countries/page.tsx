import { redirect } from 'next/navigation';

export default function UnlocalizedCountriesPage() {
  redirect('/en/countries');
}
