import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';


const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || '';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || '';


export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
// ```

// ---

// # 📋 **Now I Need Some Info About Your Project:**

// **1. Do you already have Login/Signup screens?** (Yes/No, even if not functional)

// **2. What navigation are you using?**
//    - React Navigation (Stack/Tab)
//    - Expo Router
//    - Other?

// **3. Your project structure - which of these do you have?**
//    - `src/screens/` or `screens/`
//    - `src/components/` or `components/`
//    - `src/types/` or `types/`
//    - Something else?

// **4. Are you using Expo or bare React Native?**

// **5. (Optional) Can you share your current folder structure?** 
//    Example:
// ```
//    my-app/
//    ├── src/
//    │   ├── screens/
//    │   ├── components/
//    │   └── ...