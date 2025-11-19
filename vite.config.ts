
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Credenciais do Supabase Fit-AI configuradas diretamente
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || "https://qhmjqjwnkclqiajqksgg.supabase.co"),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFobWpxandua2NscWlhanFrc2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NDc2MzIsImV4cCI6MjA3OTEyMzYzMn0.Fcv9OboRr-OBmQWTyrZyJqqTTzNyV9RacXZx6dnVmQc"),
    }
  };
});
