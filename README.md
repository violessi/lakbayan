# Lakbayan
This is the repository for the mobile application developed as part of the thesis paper entitled **"Lakbayan: Developing a Crowdsourced Public Transportation Mobile Application"**.

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

3. Navigate to `supabase`

 ```cd supabase
   ```

Start Supabase 

   ```bash
    supabase start
   ```

4. Serve the functions

   ```bash
   supabase functions serve
   ```

## Running tests

Navigate to the app via `cd app`

1. Run Jest tests

```bash
npm test
```

2. Run Maestro tests (ensure Maestro is installed locally)

```bash
maestro test src/maestro/[file]
```
