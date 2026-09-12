import { Nav } from "@/components/nav";

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh">
      <Nav />
      {children}
    </div>
  );
}
