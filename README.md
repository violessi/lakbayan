# Lakbayan

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Prebuild the app

   ```bash
    npx expo prebuild
   ```

3. Run the app

   ```bash
    npx expo android
   ```

## Running Edge Functions locally

1. Run Docker

2. Ensure API keys are stored in a `.env` file in the `/supabase/functions` folder

3. Start Supabase 

   ```bash
    supabase start
   ```

4. Serve the functions

   ```bash
   supabase functions serve
   ```