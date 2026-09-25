import { Database, Images, ShieldCheck } from "lucide-react";
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadStudio } from "@/components/upload-studio";
import { AdminLogin } from "@/components/admin-login";
import { adminCookieName, hasAdminPassword, isValidAdminSession } from "@/lib/admin-auth";

export default async function BackendPage() {
  const cookieStore = await cookies();
  if (!hasAdminPassword() || !isValidAdminSession(cookieStore.get(adminCookieName)?.value)) return <AdminLogin />;

  return (
    <main>
      <SiteHeader />
      <section className="page-intro backend-intro container">
        <p className="eyebrow">Dicon Estate backend</p>
        <h1>Manage the<br /><em>property story.</em></h1>
        <p>Upload and organize media for the homepage carousel, housing, land, and painting feeds from one workspace.</p>
        <div className="backend-status-row">
          <span><Database size={16} /> Media feed ready</span>
          <span><ShieldCheck size={16} /> Organized by collection</span>
          <span><Images size={16} /> Image and video uploads</span>
        </div>
      </section>
      <UploadStudio />
      <SiteFooter />
    </main>
  );
}