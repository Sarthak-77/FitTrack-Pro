/**
 * Authentication with Supabase
 */

import { supabase, getCurrentUser } from './supabase.js';

async function checkAuth() {
    const path = window.location.pathname;
    const isPublicPage = path.includes('login.html') || path.includes('landing.html') || path === '/';

    if (isPublicPage) {
        return true;
    }

    const user = await getCurrentUser();

    if (!user) {
        window.location.href = '/login.html';
        return false;
    }

    // Store user info globally
    window.currentUser = user;
    return true;
}

async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
    }
    window.location.href = '/landing.html';
}

// Run auth check on page load
if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('landing.html') && window.location.pathname !== '/') {
    checkAuth();
}

// Export for use in other files
window.logout = logout;
