import { lazy, Suspense, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import ScrollToTop from "@/components/ScrollToTop";

const kalkulatorImport = () => import("./pages/Kalkulator");
const tabunganImport = () => import("./pages/Tabungan");
const edukasiImport = () => import("./pages/Edukasi");
const pengingatImport = () => import("./pages/Pengingat");
const notFoundImport = () => import("./pages/NotFound");

const Kalkulator = lazy(kalkulatorImport);
const Tabungan = lazy(tabunganImport);
const Edukasi = lazy(edukasiImport);
const Pengingat = lazy(pengingatImport);
const NotFound = lazy(notFoundImport);

// Prefetch all route chunks during idle time so menu switches are instant
const prefetchRoutes = () => {
  kalkulatorImport();
  tabunganImport();
  edukasiImport();
  pengingatImport();
};

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <ScrollToTop />

      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/kalkulator" element={<Kalkulator />} />
            <Route path="/tabungan" element={<Tabungan />} />
            <Route path="/edukasi" element={<Edukasi />} />
            <Route path="/pengingat" element={<Pengingat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => void };
    if (w.requestIdleCallback) w.requestIdleCallback(prefetchRoutes);
    else setTimeout(prefetchRoutes, 800);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <AnimatedRoutes />
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
