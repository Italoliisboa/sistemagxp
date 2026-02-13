
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = 'https://rexwnbrspdipwosijuoy.supabase.co';
const supabaseAnonKey = 'sb_publishable_yPv7M50Kg6xXc7URknOVCw_0C9f07de';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
