'use client';

import * as React from 'react';
import { useI18n } from '@/i18n/context';
import { getProfiles, updateProfile } from '@/lib/db/repository';
import type { Profile, UserRole } from '@/lib/supabase/types';

export default function AdminUsersPage() {
  const { locale, t } = useI18n();
  const isAr = locale === 'ar';

  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    const list = await getProfiles();
    setProfiles(list);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    let ignore = false;
    getProfiles().then((list) => {
      if (!ignore) {
        setProfiles(list);
        setLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

  const handleToggleRole = async (p: Profile) => {
    const nextRole: UserRole = p.role === 'admin' ? 'user' : 'admin';

    // Guard: Prevent demoting the last remaining admin
    if (p.role === 'admin') {
      const currentAdmins = profiles.filter((x) => x.role === 'admin').length;
      if (currentAdmins <= 1) {
        alert(
          isAr
            ? 'إجراء مرفوض: لا يمكن تخفيض صلاحية المشرف الوحيد المتبقي على المنصة لمنع إغلاق لوحة التحكم.'
            : 'Action rejected: Cannot demote the last remaining administrator account to prevent lockout.'
        );
        return;
      }
    }

    const confirmMessage = isAr
      ? `هل أنت متأكد من تغيير صلاحية الحساب (${p.email}) إلى ${nextRole === 'admin' ? 'مشرف (Admin)' : 'مستخدم عادي (User)'}؟`
      : `Are you sure you want to change the role of (${p.email}) to ${nextRole === 'admin' ? 'Administrator' : 'Standard User'}?`;

    if (confirm(confirmMessage)) {
      try {
        await updateProfile(p.id, { role: nextRole });
        loadData();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Failed to update user role');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 font-sans">
          {t.admin.users}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          {isAr
            ? 'عرض حسابات الطلاب والباحثين المسجلين وإدارة صلاحيات الإدارة.'
            : 'View registered scholar profiles and manage administrative access privileges.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            {t.common.loading}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-start">{isAr ? 'الاسم' : 'Name'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الدولة' : 'Country'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'المرحلة' : 'Target Degree'}</th>
                  <th className="py-3 px-4 text-start">{isAr ? 'الصلاحية' : 'Role'}</th>
                  <th className="py-3 px-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.full_name || 'Anonymous Scholar'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">{p.email}</td>
                    <td className="py-3.5 px-4 text-slate-500">{p.country || '—'}</td>
                    <td className="py-3.5 px-4 text-slate-500">{p.degree_level || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wider uppercase ${
                          p.role === 'admin'
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-end">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(p)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                      >
                        {p.role === 'admin'
                          ? isAr
                            ? 'تخفيض إلى مستخدم'
                            : 'Demote to User'
                          : isAr
                          ? 'ترقية إلى مشرف'
                          : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
