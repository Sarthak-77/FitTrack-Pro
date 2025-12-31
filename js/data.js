/**
 * FitTrack Pro Data Management with Supabase
 */

import { supabase, getCurrentUser } from './supabase.js';

class DataManager {
    constructor() {
        this.user = null;
        this.userPromise = null;
        // Don't call init() here - let it be called explicitly when needed
    }

    async init() {
        if (!this.userPromise) {
            this.userPromise = getCurrentUser();
        }
        this.user = await this.userPromise;
        return this.user;
    }

    async ensureUser() {
        // Always try to get the user if we don't have one
        if (!this.user) {
            // Reset the promise to force a fresh fetch
            this.userPromise = null;
            await this.init();
        }
        return this.user;
    }

    // Helper function to get today's date in local timezone (not UTC)
    getLocalDate(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ===== DAILY STATS =====
    async getTodayStats() {
        await this.ensureUser();
        if (!this.user) return null;

        const today = this.getLocalDate();

        const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', this.user.id)
            .eq('date', today)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching stats:', error);
            return null;
        }

        // If no stats for today, create default
        if (!data) {
            const { data: newStats, error: insertError } = await supabase
                .from('daily_stats')
                .insert({
                    user_id: this.user.id,
                    date: today,
                    steps: 0,
                    calories_burned: 0,
                    water_intake: 0
                })
                .select()
                .single();

            if (insertError) {
                console.error('Error creating stats:', insertError);
                return null;
            }
            return newStats;
        }

        return data;
    }

    async updateSteps(steps) {
        await this.ensureUser();
        if (!this.user) return;

        const today = this.getLocalDate();
        await this.getTodayStats(); // Ensure record exists

        const { error } = await supabase
            .from('daily_stats')
            .update({ steps: parseInt(steps) })
            .eq('user_id', this.user.id)
            .eq('date', today);

        if (error) console.error('Error updating steps:', error);
    }

    async updateCalories(calories) {
        await this.ensureUser();
        if (!this.user) return;

        const today = this.getLocalDate();
        await this.getTodayStats(); // Ensure record exists

        const { error } = await supabase
            .from('daily_stats')
            .update({ calories_burned: parseInt(calories) })
            .eq('user_id', this.user.id)
            .eq('date', today);

        if (error) console.error('Error updating calories:', error);
    }

    async updateWater(amount) {
        await this.ensureUser();
        if (!this.user) return;

        const stats = await this.getTodayStats();
        const newAmount = (stats?.water_intake || 0) + amount;
        const today = this.getLocalDate();

        const { error } = await supabase
            .from('daily_stats')
            .update({ water_intake: newAmount })
            .eq('user_id', this.user.id)
            .eq('date', today);

        if (error) console.error('Error updating water:', error);
    }

    async setWater(amount) {
        await this.ensureUser();
        if (!this.user) return;

        const today = this.getLocalDate();
        await this.getTodayStats(); // Ensure record exists

        const { error } = await supabase
            .from('daily_stats')
            .update({ water_intake: parseInt(amount) })
            .eq('user_id', this.user.id)
            .eq('date', today);

        if (error) console.error('Error setting water:', error);
    }

    // ===== ACTIVITIES =====
    async getActivities() {
        if (!this.user) return [];

        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('user_id', this.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching activities:', error);
            return [];
        }

        return data || [];
    }

    async addActivity(activity) {
        if (!this.user) return;

        const { error } = await supabase
            .from('activities')
            .insert({
                user_id: this.user.id,
                name: activity.name,
                duration: parseInt(activity.duration),
                calories: parseInt(activity.calories),
                type: activity.type
            });

        if (error) console.error('Error adding activity:', error);
    }

    async deleteActivity(id) {
        if (!this.user) return;

        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', id)
            .eq('user_id', this.user.id);

        if (error) console.error('Error deleting activity:', error);
    }

    async updateActivity(id, updates) {
        if (!this.user) return { error: 'No user logged in' };

        const { error } = await supabase
            .from('activities')
            .update({
                name: updates.name,
                duration: parseInt(updates.duration),
                calories: parseInt(updates.calories),
                type: updates.type.toLowerCase() // Normalize to lowercase for database constraint
            })
            .eq('id', id)
            .eq('user_id', this.user.id);

        if (error) console.error('Error updating activity:', error);
        return { error };
    }

    // ===== MEALS =====
    async getMeals() {
        if (!this.user) return { breakfast: [], lunch: [], dinner: [] };

        const today = this.getLocalDate();

        const { data, error } = await supabase
            .from('meals')
            .select('*')
            .eq('user_id', this.user.id)
            .gte('created_at', today)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching meals:', error);
            return { breakfast: [], lunch: [], dinner: [] };
        }

        // Group by meal type
        const meals = {
            breakfast: data.filter(m => m.meal_type === 'breakfast'),
            lunch: data.filter(m => m.meal_type === 'lunch'),
            dinner: data.filter(m => m.meal_type === 'dinner')
        };

        return meals;
    }

    async addMeal(type, meal) {
        if (!this.user) return;

        const { error } = await supabase
            .from('meals')
            .insert({
                user_id: this.user.id,
                name: meal.name,
                calories: parseInt(meal.calories),
                meal_type: type
            });

        if (error) console.error('Error adding meal:', error);
    }

    async removeMeal(type, id) {
        if (!this.user) return;

        const { error } = await supabase
            .from('meals')
            .delete()
            .eq('id', id)
            .eq('user_id', this.user.id);

        if (error) console.error('Error removing meal:', error);
    }

    // ===== HISTORY =====
    async getHistory() {
        if (!this.user) return { steps: [], calories: [] };

        // Get data for the last 7 days
        const { data, error } = await supabase
            .from('daily_stats')
            .select('*')
            .eq('user_id', this.user.id)
            .order('date', { ascending: true });

        if (error) {
            console.error('Error fetching history:', error);
            return { steps: [], calories: [] };
        }

        // Create a map of date -> stats for quick lookup
        const statsMap = {};
        data.forEach(stat => {
            statsMap[stat.date] = stat;
        });

        // Generate last 7 days in order (oldest to newest)
        const steps = [];
        const calories = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = this.getLocalDate(date);

            const stat = statsMap[dateStr];
            steps.push(stat ? stat.steps : 0);
            calories.push(stat ? stat.calories_burned : 0);
        }

        return { steps, calories };
    }

    async resetDashboard() {
        if (!this.user) return;

        // Delete all user data
        await supabase.from('activities').delete().eq('user_id', this.user.id);
        await supabase.from('meals').delete().eq('user_id', this.user.id);
        await supabase.from('daily_stats').delete().eq('user_id', this.user.id);

        location.reload();
    }
}

// Create global instance
const dataManager = new DataManager();
window.dataManager = dataManager;
