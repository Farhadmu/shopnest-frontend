import ProfileView from "@/components/profile/ProfileView";
import { UserProfile } from "@/lib/api/users";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userProfile: UserProfile | null = session?.user 
    ? { 
        id: session.user.id, 
        name: session.user.name, 
        email: session.user.email, 
        role: "admin", 
        avatarUrl: session.user.image || undefined,
        image: session.user.image || undefined
      } 
    : null;
  
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-text">Profile & Security Settings</h1>
        <p className="mt-1 text-xs text-muted">Manage your personal identity, credential security, and role configuration seamlessly.</p>
      </div>

      <ProfileView initialProfile={userProfile} />
    </div>
  );
}