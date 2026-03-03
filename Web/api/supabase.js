const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function makeQueryBuilder() {
  // this object will be returned for chaining: .select().eq().order()...
  const qb = {
    select() { return qb; },
    insert() { return qb; },
    update() { return qb; },
    upsert() { return qb; },
    delete() { return qb; },

    eq() { return qb; },
    ilike() { return qb; },
    order() { return qb; },
    limit() { return qb; },

    // Many codebases call .single() at the end
    async single() { return { data: null, error: null }; },

    // Important: Supabase queries are "thenable" (await-able).
    // When you do: const { data, error } = await supabase.from(...).select(...).eq(...)
    // it awaits the query builder. Implement then() so awaiting works.
    then(resolve, reject) {
      return Promise.resolve({ data: [], error: null }).then(resolve, reject);
    },
  };

  return qb;
}

function makeStub() {
  return {
    from() {
      return makeQueryBuilder();
    },
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