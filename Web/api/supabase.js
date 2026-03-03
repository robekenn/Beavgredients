const { createClient } = require("@supabase/supabase-js");

// In real env (dev/prod), these should exist:
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function makeStub() {
  // A minimal, chain-friendly stub so imports don't crash tests.
  const builder = {
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ data: [], error: null }),
    update: async () => ({ data: [], error: null }),
    upsert: async () => ({ data: [], error: null }),
    delete: async () => ({ data: [], error: null }),

    // allow chaining
    eq() { return this; },
    ilike() { return this; },
    order() { return this; },
    limit() { return this; },

    single: async () => ({ data: null, error: null }),
  };

  return {
    from: () => builder,
    auth: {
      signInWithPassword: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  };
}

const supabase = (url && key) ? createClient(url, key) : makeStub();

module.exports = supabase;