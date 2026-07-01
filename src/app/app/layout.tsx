import { ServiceWorkerInit } from "@/components/mobile/ServiceWorkerInit";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerInit />
      {children}
    </>
  );
}