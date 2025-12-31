/**
 * Supabase Client Configuration
 * This file initializes the Supabase client for frontend use
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
// These values will be replaced when you set up your Supabase project
const supabaseUrl = 'https://mnzveqvjaivbiwisfsyb.supabase.co';
const supabaseAnonKey = 'sb_publishable_LzSQa6_N0VJLh94j8apKMg_vNcYzgp0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get current user
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
}

// Helper function to sign out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
    }
    window.location.href = '/landing.html';
}
