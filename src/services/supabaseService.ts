import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export class SupabaseService {
  /**
   * Auth: Sign up with email and password
   */
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  /**
   * Auth: Login with email and password
   */
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  /**
   * Auth: Login with Google
   */
  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  }

  /**
   * Auth: Logout
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Session: Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  /**
   * Session: Get current session
   */
  static async getSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Database: Read from a table
   */
  static async getFromTable(tableName: string, query = '*') {
    const { data, error } = await supabase
      .from(tableName)
      .select(query);
    if (error) throw error;
    return data;
  }

  /**
   * Database: Insert into a table
   */
  static async insertIntoTable(tableName: string, row: any) {
    const { data, error } = await supabase
      .from(tableName)
      .insert(row)
      .select();
    if (error) throw error;
    return data;
  }

  /**
   * Storage: Upload a file
   */
  static async uploadFile(bucketName: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
    if (error) throw error;
    return data;
  }

  /**
   * Database: Log tool usage
   */
  static async logToolUsage(toolId: string, metadata?: any) {
    const user = await this.getCurrentUser();
    if (!user) return;

    return this.insertIntoTable('tool_usage_logs', {
      user_id: user.id,
      tool_id: toolId,
      metadata,
    });
  }

  /**
   * Database: Save processed result
   */
  static async saveResult(toolId: string, resultData: any, inputFileId?: string) {
    const user = await this.getCurrentUser();
    if (!user) return;

    return this.insertIntoTable('processed_results', {
      user_id: user.id,
      tool_id: toolId,
      result_data: resultData,
      input_file_id: inputFileId,
    });
  }

  /**
   * Database: Get user's recent results
   */
  static async getRecentResults(limit = 10) {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('processed_results')
      .select('*, tools(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  /**
   * Database: Get user's uploaded files
   */
  static async getUploadedFiles(limit = 10) {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  /**
   * Database: Get usage statistics
   */
  static async getUsageStats() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data: logs, error: logsError } = await supabase
      .from('tool_usage_logs')
      .select('tool_id')
      .eq('user_id', user.id);
    
    if (logsError) throw logsError;

    const stats = logs.reduce((acc: any, log: any) => {
      acc[log.tool_id] = (acc[log.tool_id] || 0) + 1;
      return acc;
    }, {});

    return {
      totalUsage: logs.length,
      byTool: stats
    };
  }
}
