#!/usr/bin/env node

// Simple test script to debug Dashboard data loading
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testDashboardData() {
    console.log('🔍 Testing Dashboard Data Loading...\n');
    
    // 1. Test API health
    console.log('1. Testing API Health...');
    try {
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ API Health:', healthData.message);
    } catch (error) {
        console.log('❌ API Health Error:', error.message);
        return;
    }
    
    // 2. Get all users
    console.log('\n2. Fetching all users...');
    try {
        const usersResponse = await fetch(`${API_BASE}/users`);
        const users = await usersResponse.json();
        console.log(`✅ Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`   - ${user.name} (${user.role}) - ID: ${user.id}`);
        });
        
        // 3. Test expenses for each user
        console.log('\n3. Testing expenses for each user...');
        for (const user of users) {
            console.log(`\n   Testing expenses for ${user.name} (ID: ${user.id})...`);
            try {
                const expensesResponse = await fetch(`${API_BASE}/expenses/user/${user.id}`);
                const expenses = await expensesResponse.json();
                console.log(`   ✅ Found ${expenses.length} expenses`);
                
                if (expenses.length > 0) {
                    const totalAmount = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
                    const pendingCount = expenses.filter(exp => exp.status === 'pending').length;
                    const approvedCount = expenses.filter(exp => exp.status === 'approved').length;
                    
                    console.log(`   📊 Stats: Total: ${user.currency}${totalAmount.toFixed(2)}, Pending: ${pendingCount}, Approved: ${approvedCount}`);
                }
            } catch (error) {
                console.log(`   ❌ Error fetching expenses: ${error.message}`);
            }
        }
        
    } catch (error) {
        console.log('❌ Error fetching users:', error.message);
    }
    
    console.log('\n🎯 Dashboard Debug Complete!');
    console.log('\nIf you see expenses above but not in the Dashboard, the issue is likely:');
    console.log('1. User authentication - check if the correct user is logged in');
    console.log('2. User ID mismatch - the logged-in user ID might not match the database');
    console.log('3. Frontend API call - check browser console for errors');
}

// Run the test
testDashboardData().catch(console.error);
