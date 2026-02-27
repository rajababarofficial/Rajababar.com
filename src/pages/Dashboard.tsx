import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  FileText, 
  History, 
  BarChart3, 
  Download, 
  Settings, 
  LogOut, 
  Clock, 
  Shield,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { SupabaseService } from '@/src/services/supabaseService';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils/cn';
import { useLanguage } from '@/src/context/LanguageContext';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Dashboard() {
  const { isSindhi } = useLanguage();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const currentUser = await SupabaseService.getCurrentUser();
        if (!currentUser) {
          navigate('/auth');
          return;
        }
        setUser(currentUser);

        const [results, files, usageStats] = await Promise.all([
          SupabaseService.getRecentResults(5),
          SupabaseService.getUploadedFiles(5),
          SupabaseService.getUsageStats()
        ]);

        setRecentResults(results);
        setUploadedFiles(files);
        setStats(usageStats);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const handleSignOut = async () => {
    await SupabaseService.signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-accent"></div>
      </div>
    );
  }

  return (
    <div 
      dir={isSindhi ? 'rtl' : 'ltr'} 
      className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-brand-bg min-h-screen"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className={cn(
            "text-4xl font-bold text-brand-primary mb-2",
            isSindhi && "font-sindhi text-5xl leading-tight"
          )}>
            {isSindhi ? 'واپرائيندڙ ڊيش بورڊ' : 'User Dashboard'}
          </h1>
          <p className={cn("text-brand-secondary", isSindhi && "font-sindhi text-lg")}>
            {isSindhi ? 'پنهنجا ٽولز، فائلون ۽ اڪائونٽ سيٽنگون سنڀاليو.' : 'Manage your tools, files, and account settings.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/tools')}
            className={cn(
              "px-6 py-3 bg-brand-primary text-brand-bg font-bold rounded-xl hover:opacity-90 transition-all flex items-center gap-2",
              isSindhi && "font-sindhi text-xl"
            )}
          >
            {isSindhi ? 'ٽولز ڏسو' : 'Explore Tools'}
            <ArrowUpRight className={cn("w-4 h-4", isSindhi && "rotate-[-90deg]")} />
          </button>
          <button 
            onClick={handleSignOut}
            className="p-3 rounded-xl bg-brand-surface border border-brand-border text-brand-secondary hover:text-red-500 transition-all"
            title={isSindhi ? 'لاگ آئوٽ' : 'Logout'}
          >
            <LogOut className={cn("w-5 h-5", isSindhi && "rotate-180")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Stats */}
        <div className="space-y-8">
          {/* Profile Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl bg-brand-surface border border-brand-border relative overflow-hidden"
          >
            <div className={cn("absolute top-0 p-4 opacity-10", isSindhi ? "left-0" : "right-0")}>
              <Shield className="w-24 h-24" />
            </div>
            <div className="relative z-10 text-right md:text-inherit">
              <div className={cn(
                "w-20 h-20 rounded-2xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent mb-6",
                isSindhi && "mr-0 ml-auto md:ml-0"
              )}>
                <User className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-1 truncate">{user?.email?.split('@')[0]}</h3>
              <p className="text-brand-secondary text-sm mb-6 truncate">{user?.email}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-brand-bg border border-brand-border">
                  <span className={cn("text-xs text-brand-secondary uppercase tracking-widest font-bold", isSindhi && "font-sindhi text-sm")}>
                    {isSindhi ? 'پلان' : 'Plan'}
                  </span>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded bg-brand-accent/10 text-brand-accent uppercase", isSindhi && "font-sindhi")}>
                    {isSindhi ? 'مفت ورزن' : 'Free Tier'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-brand-bg border border-brand-border">
                  <span className={cn("text-xs text-brand-secondary uppercase tracking-widest font-bold", isSindhi && "font-sindhi text-sm")}>
                    {isSindhi ? 'ميمبر کان' : 'Member Since'}
                  </span>
                  <span className="text-xs font-bold">{new Date(user?.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-brand-surface border border-brand-border"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className={cn("text-xl font-bold", isSindhi && "font-sindhi text-2xl")}>
                {isSindhi ? 'استعمال جي شماريات' : 'Usage Stats'}
              </h3>
              <BarChart3 className="w-5 h-5 text-brand-accent" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border text-center md:text-inherit">
                <p className={cn("text-brand-secondary text-[10px] uppercase tracking-widest font-bold mb-1", isSindhi && "font-sindhi text-xs")}>
                  {isSindhi ? 'ڪل استعمال' : 'Total Uses'}
                </p>
                <p className="text-3xl font-bold">{stats?.totalUsage || 0}</p>
              </div>
              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border text-center md:text-inherit">
                <p className={cn("text-brand-secondary text-[10px] uppercase tracking-widest font-bold mb-1", isSindhi && "font-sindhi text-xs")}>
                  {isSindhi ? 'ٽولز استعمال ڪيا' : 'Tools Used'}
                </p>
                <p className="text-3xl font-bold">{Object.keys(stats?.byTool || {}).length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Results */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl bg-brand-surface border border-brand-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={cn("text-xl font-bold flex items-center gap-2", isSindhi && "font-sindhi text-2xl")}>
                <History className="w-5 h-5 text-brand-accent" />
                {isSindhi ? 'تازو نتيجا' : 'Recent Results'}
              </h3>
              <button className={cn("text-xs text-brand-secondary hover:text-brand-accent transition-colors", isSindhi && "font-sindhi text-sm")}>
                {isSindhi ? 'سڀ ڏسو' : 'View All'}
              </button>
            </div>

            <div className="space-y-4">
              {recentResults.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-brand-border rounded-2xl">
                  <p className={cn("text-brand-secondary text-sm", isSindhi && "font-sindhi text-lg")}>
                    {isSindhi ? 'ڪو به نتيجو نه مليو.' : 'No recent results found.'}
                  </p>
                </div>
              ) : (
                recentResults.map((result) => (
                  <div key={result.id} className="p-4 rounded-2xl bg-brand-bg border border-brand-border hover:border-brand-accent/30 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-secondary group-hover:text-brand-accent">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className={cn("font-bold text-sm", isSindhi && "font-sindhi text-lg")}>
                            {result.tools?.name || (isSindhi ? 'ٽول نتيجو' : 'Tool Result')}
                          </h4>
                          <p className="text-xs text-brand-secondary flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(result.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg bg-brand-surface border border-brand-border text-brand-secondary hover:text-white">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Uploaded Files */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-3xl bg-brand-surface border border-brand-border"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={cn("text-xl font-bold flex items-center gap-2", isSindhi && "font-sindhi text-2xl")}>
                <Settings className="w-5 h-5 text-brand-accent" />
                {isSindhi ? 'فائل هسٽري' : 'File History'}
              </h3>
              <button className={cn("text-xs text-brand-secondary hover:text-brand-accent", isSindhi && "font-sindhi text-sm")}>
                {isSindhi ? 'اسٽوريج سنڀاليو' : 'Manage Storage'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right md:text-inherit text-sm">
                <thead className={cn(
                  "text-brand-secondary text-[10px] uppercase tracking-widest font-bold border-b border-brand-border",
                  isSindhi && "font-sindhi text-xs tracking-normal"
                )}>
                  <tr>
                    <th className="px-4 py-3 text-right">{isSindhi ? 'فائل جو نالو' : 'File Name'}</th>
                    <th className="px-4 py-3 text-right">{isSindhi ? 'سائيز' : 'Size'}</th>
                    <th className="px-4 py-3 text-right">{isSindhi ? 'تاريخ' : 'Date'}</th>
                    <th className="px-4 py-3 text-left">{isSindhi ? 'عمل' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {uploadedFiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={cn("px-4 py-12 text-center text-brand-secondary italic", isSindhi && "font-sindhi text-lg")}>
                        {isSindhi ? 'اڃا ڪا به فائل اپلوڊ نه ڪئي وئي آهي.' : 'No files uploaded yet.'}
                      </td>
                    </tr>
                  ) : (
                    uploadedFiles.map((file) => (
                      <tr key={file.id} className="hover:bg-brand-bg/50 transition-colors">
                        <td className="px-4 py-4 font-medium truncate max-w-[200px]">{file.file_name}</td>
                        <td className="px-4 py-4 text-brand-secondary">{(file.file_size / 1024).toFixed(1)} KB</td>
                        <td className="px-4 py-4 text-brand-secondary">{new Date(file.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-4 text-left">
                          <button className="text-brand-accent hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {isSindhi ? 'لنڪ' : 'Link'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}