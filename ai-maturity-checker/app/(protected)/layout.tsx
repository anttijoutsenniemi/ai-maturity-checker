export const dynamic = "force-dynamic";
import '@/app/globals.css';
import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Drawer from '@/components/Drawer';
import styles from '@/styles/ProtectedLayout.module.css';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {

    return (
      <div className={styles.publicBody}>
        <div className={styles.centered}>
          <h2 className={styles.title}>You must be signed in to access this page</h2>
          <div className={styles.buttons}>
            <Link href="/signin" className={styles.button}>Sign In</Link>
            <Link href="/signup" className={styles.button}>Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Drawer email={user.email || "unknown"}/>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
