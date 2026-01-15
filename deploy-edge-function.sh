#!/bin/bash
# Supabase Edge Function Deployment Script
# This will deploy the identify-component function to your Supabase project

set -e  # Exit on error

echo "🚀 Deploying identify-component Edge Function..."

# Check if in correct directory
if [ ! -d "supabase/functions/identify-component" ]; then
    echo "❌ Error: Must run from project root directory"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Deploy the function
echo "📦 Deploying function..."
supabase functions deploy identify-component --project-ref cemlaexpettqxvslaqop

echo "✅ Deployment complete!"
echo ""
echo "🧪 Test your deployment:"
echo "1. Go to: https://supabase.com/dashboard/project/cemlaexpettqxvslaqop/functions"
echo "2. Verify identify-component is active (green)"
echo "3. Test a scan: Scan iPhone → Enter 'iPhone 15 Pro' → Should work in 3-5s!"
